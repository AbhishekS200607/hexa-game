const express = require('express');
const { latLngToCell } = require('h3-js');
const pool = require('./database');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const moveLimit = rateLimit({
  windowMs: 10000,
  max: 1,
  message: { error: 'Too many requests, wait 10 seconds' }
});

const FACTION_COLORS = {
  NEON_SYNDICATE: '#00d9ff',
  WILDKEEPERS: '#85c3a8',
  IRON_VANGUARD: '#ff4757'
};

function calculateSpeed(distance, timeMs) {
  return (distance / 1000) / (timeMs / 3600000);
}

router.post('/move', moveLimit, async (req, res) => {
  try {
    const { lat, lng, h3Index, userId, speed = 0 } = req.body;

    // Input validation
    if (!lat || !lng || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate coordinate bounds
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'Invalid coordinate type' });
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordinates out of bounds' });
    }
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (speed > 30) {
      return res.json({ success: false, message: 'Passive mode: Speed too high', passiveMode: true });
    }

    const serverH3 = latLngToCell(lat, lng, 9);
    
    if (h3Index !== serverH3) {
      return res.status(400).json({ error: 'H3 index mismatch' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [userData] = await connection.query(
        'SELECT faction, activity_mode, energy, player_class, home_lat, home_lng FROM users WHERE id = ?',
        [userId]
      );

      if (userData.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userFaction = userData[0].faction;
      const activityMode = userData[0].activity_mode;
      const playerClass = userData[0].player_class;
      let userEnergy = userData[0].energy;

      const classBonus = {
        SCOUT: { xp: 1.2, vision: 2 },
        TANK: { defense: 2, energy: 0.8 },
        SPRINTER: { speed: 1.5, xp: 1.1 }
      };

      const isNearHome = userData[0].home_lat && userData[0].home_lng && 
        Math.abs(lat - userData[0].home_lat) < 0.001 && 
        Math.abs(lng - userData[0].home_lng) < 0.001;

      await connection.query(
        'INSERT IGNORE INTO visited_hexes (user_id, h3_index) VALUES (?, ?)',
        [userId, serverH3]
      );

      const [existing] = await connection.query(
        'SELECT owner_id, faction, defense_level FROM hexagons WHERE h3_index = ?',
        [serverH3]
      );

      let conquered = false;
      let reinforced = false;
      let message = '';
      
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO hexagons (h3_index, owner_id, faction, defense_level) VALUES (?, ?, ?, 1)',
          [serverH3, userId, userFaction]
        );
        conquered = true;
        message = 'Neutral hex captured!';
      } else if (existing[0].owner_id === userId) {
        if (existing[0].defense_level < 5) {
          await connection.query(
            'UPDATE hexagons SET defense_level = defense_level + 1, last_reinforced = NOW() WHERE h3_index = ?',
            [serverH3]
          );
          reinforced = true;
          message = 'Territory reinforced!';
        } else {
          message = 'Max defense reached';
        }
      } else {
        const defenseLevel = existing[0].defense_level;
        const baseCost = defenseLevel * 10;
        const energyCost = playerClass === 'TANK' ? Math.floor(baseCost * classBonus.TANK.energy) : baseCost;
        
        // Defender loses energy while protecting (half of attack cost)
        const defenderEnergyCost = Math.floor(energyCost / 2);
        
        // Defense rewards based on level
        const defenseRewards = {
          1: 30,
          2: 50,
          3: 70,
          4: 90,
          5: 150
        };
        
        if (userEnergy >= energyCost) {
          await connection.query(
            'UPDATE hexagons SET owner_id = ?, faction = ?, defense_level = 1, captured_at = NOW() WHERE h3_index = ?',
            [userId, userFaction, serverH3]
          );
          userEnergy -= energyCost;
          conquered = true;
          message = `Enemy hex captured! (-${energyCost} energy)`;
          
          // Defender loses energy for failed defense
          if (existing[0].owner_id) {
            await connection.query(
              'UPDATE users SET energy = GREATEST(energy - ?, 0) WHERE id = ?',
              [defenderEnergyCost, existing[0].owner_id]
            );
          }
        } else {
          message = `Not enough energy (need ${energyCost})`;
          // Failed capture: defender gets reward for successful defense
          const defenseReward = defenseRewards[defenseLevel] || 30;
          if (existing[0].owner_id) {
            await connection.query(
              'UPDATE users SET energy = LEAST(energy + ?, 100) WHERE id = ?',
              [defenseReward, existing[0].owner_id]
            );
          }
        }
      }

      let xpGain = 10;
      if (playerClass === 'SCOUT') xpGain = Math.floor(xpGain * classBonus.SCOUT.xp);
      if (playerClass === 'SPRINTER') xpGain = Math.floor(xpGain * classBonus.SPRINTER.xp);
      if (isNearHome) {
        xpGain = Math.floor(xpGain * 1.5);
        message += ' +50% home bonus!';
      }
      if (existing.length > 0 && existing[0].faction === userFaction && existing[0].owner_id !== userId) {
        xpGain = Math.floor(xpGain * 1.1);
        message += ' +10% team bonus!';
      }

      const distanceGain = activityMode === 'CAVALRY' ? 0.02 : 0.01;
      
      // Energy restoration while walking (passive regeneration)
      const baseEnergyGain = 1; // +1 energy per hex visited
      
      // Defense-level-based capture bonuses
      const captureBonuses = {
        1: 30,
        2: 50,
        3: 70,
        4: 90,
        5: 150
      };
      
      // Energy logic: restore at home, gain while walking, capture bonus
      if (conquered && existing.length > 0) {
        const defenseLevel = existing[0].defense_level;
        const captureBonus = captureBonuses[defenseLevel] || 30;
        userEnergy = Math.min(userEnergy + captureBonus + baseEnergyGain, 100);
        message += ` +${captureBonus} capture bonus!`;
      } else if (isNearHome) {
        userEnergy = Math.min(userEnergy + 10, 100); // +10 at home base
      } else if (existing.length > 0 && existing[0].owner_id === userId) {
        userEnergy = Math.min(userEnergy + 3 + baseEnergyGain, 100); // +4 on own territory
      } else {
        // Neutral hex or failed capture: walking bonus
        userEnergy = Math.min(userEnergy + 2 + baseEnergyGain, 100); // +3 total
      }

      await connection.query(
        'UPDATE users SET total_distance = total_distance + ?, exp_points = exp_points + ?, energy = ? WHERE id = ?',
        [distanceGain, xpGain, userEnergy, userId]
      );

      await connection.commit();

      const [updatedUser] = await connection.query(
        'SELECT total_distance, exp_points, energy FROM users WHERE id = ?',
        [userId]
      );

      const [hexCount] = await connection.query(
        'SELECT COUNT(*) as count FROM hexagons WHERE owner_id = ?',
        [userId]
      );

      if (conquered && existing.length > 0 && existing[0].owner_id) {
        if (req.app.locals.notifyUser) {
          req.app.locals.notifyUser(existing[0].owner_id, 'territory_lost', {
            h3Index: serverH3,
            capturedBy: userId
          });
        }
      }

      if (conquered || reinforced) {
        if (req.app.locals.broadcast) {
          req.app.locals.broadcast('territory_update', {
            h3Index: serverH3,
            ownerId: userId,
            faction: userFaction,
            defenseLevel: conquered ? 1 : existing[0].defense_level + 1
          });
        }
      }

      res.json({
        success: true,
        conquered,
        reinforced,
        message,
        h3Index: serverH3,
        stats: {
          hexes: hexCount[0].count,
          distance: updatedUser[0].total_distance,
          exp: updatedUser[0].exp_points,
          energy: updatedUser[0].energy
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await pool.getConnection();

    const [userData] = await connection.query(
      'SELECT username, email, total_distance, exp_points, faction, energy, activity_mode, player_class, home_lat, home_lng FROM users WHERE id = ?',
      [userId]
    );

    const [hexCount] = await connection.query(
      'SELECT COUNT(*) as count FROM hexagons WHERE owner_id = ?',
      [userId]
    );

    if (userData.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      username: userData[0].username,
      email: userData[0].email,
      hexes: hexCount[0].count,
      distance: userData[0].total_distance,
      exp: userData[0].exp_points,
      energy: userData[0].energy,
      faction: userData[0].faction,
      activityMode: userData[0].activity_mode,
      player_class: userData[0].player_class,
      home_lat: userData[0].home_lat,
      home_lng: userData[0].home_lng,
      factionColor: FACTION_COLORS[userData[0].faction]
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/map/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    connection = await pool.getConnection();

    const [allHexes] = await connection.query(
      'SELECT h.h3_index, h.faction, h.defense_level, h.owner_id, u.username as owner_name FROM hexagons h LEFT JOIN users u ON h.owner_id = u.id'
    );

    console.log('All hexes with owners:', allHexes);

    res.json({
      hexData: allHexes.map(h => ({
        h3Index: h.h3_index,
        faction: h.faction,
        color: FACTION_COLORS[h.faction],
        defenseLevel: h.defense_level,
        ownerName: h.owner_name || 'Unknown',
        ownerId: h.owner_id
      }))
    });

  } catch (error) {
    console.error('Map error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/config', (req, res) => {
  res.json({
    mapboxToken: process.env.MAPBOX_TOKEN || 'your_mapbox_token_here'
  });
});

router.get('/reset/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query('DELETE FROM hexagons');
    await pool.query('DELETE FROM visited_hexes');
    await pool.query('UPDATE users SET total_distance = 0, exp_points = 0');
    
    const [users] = await pool.query('SELECT id, username, email FROM users');
    
    res.json({ 
      success: true, 
      message: 'All game data reset successfully',
      users: users
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


router.post('/home/set', async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;
    await pool.query(
      'UPDATE users SET home_lat = ?, home_lng = ? WHERE id = ?',
      [lat, lng, userId]
    );
    res.json({ success: true, message: 'Home base set!' });
  } catch (error) {
    console.error('Set home error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
