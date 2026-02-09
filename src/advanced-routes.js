const express = require('express');
const pool = require('./database');

const router = express.Router();

// Items & Traps
router.post('/items/place', async (req, res) => {
  try {
    const { userId, itemType, h3Index, duration = 24 } = req.body;
    
    const expiresAt = new Date(Date.now() + duration * 3600000);
    
    await pool.query(
      'INSERT INTO items (user_id, item_type, h3_index, expires_at) VALUES (?, ?, ?, ?)',
      [userId, itemType, h3Index, expiresAt]
    );
    
    res.json({ success: true, message: `${itemType} placed!` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place item' });
  }
});

router.get('/items/:h3Index', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT * FROM items WHERE h3_index = ? AND is_active = TRUE AND expires_at > NOW()',
      [req.params.h3Index]
    );
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Squads
router.post('/squads/create', async (req, res) => {
  try {
    const { name, faction, leaderId } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO squads (name, faction, leader_id) VALUES (?, ?, ?)',
      [name, faction, leaderId]
    );
    
    await pool.query('UPDATE users SET squad_id = ? WHERE id = ?', [result.insertId, leaderId]);
    
    res.json({ success: true, squadId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create squad' });
  }
});

router.post('/squads/join', async (req, res) => {
  try {
    const { userId, squadId } = req.body;
    await pool.query('UPDATE users SET squad_id = ? WHERE id = ?', [squadId, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join squad' });
  }
});

router.get('/squads/:squadId', async (req, res) => {
  try {
    const [squad] = await pool.query('SELECT * FROM squads WHERE id = ?', [req.params.squadId]);
    const [members] = await pool.query('SELECT id, username, exp_points FROM users WHERE squad_id = ?', [req.params.squadId]);
    res.json({ squad: squad[0], members });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch squad' });
  }
});

// Graffiti
router.post('/graffiti/place', async (req, res) => {
  try {
    const { userId, h3Index, stickerType } = req.body;
    
    await pool.query(
      'INSERT INTO graffiti (user_id, h3_index, sticker_type) VALUES (?, ?, ?)',
      [userId, h3Index, stickerType]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place graffiti' });
  }
});

router.get('/graffiti/:h3Index', async (req, res) => {
  try {
    const [graffiti] = await pool.query(
      'SELECT g.*, u.username FROM graffiti g JOIN users u ON g.user_id = u.id WHERE g.h3_index = ? ORDER BY g.placed_at DESC LIMIT 10',
      [req.params.h3Index]
    );
    res.json({ graffiti });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch graffiti' });
  }
});

// Leaderboard
router.get('/leaderboard/global', async (req, res) => {
  try {
    const [leaders] = await pool.query(
      'SELECT u.id, u.username, u.faction, COUNT(h.h3_index) as hexes, u.exp_points FROM users u LEFT JOIN hexagons h ON u.id = h.owner_id GROUP BY u.id ORDER BY hexes DESC, u.exp_points DESC LIMIT 100'
    );
    res.json({ leaderboard: leaders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/leaderboard/local/:region', async (req, res) => {
  try {
    const [leaders] = await pool.query(
      'SELECT * FROM leaderboard WHERE region = ? ORDER BY rank_position ASC LIMIT 50',
      [req.params.region]
    );
    res.json({ leaderboard: leaders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch local leaderboard' });
  }
});

// Battle Pass
router.post('/battlepass/purchase', async (req, res) => {
  try {
    const { userId, season } = req.body;
    
    await pool.query(
      'INSERT INTO battle_pass (user_id, season, is_premium) VALUES (?, ?, TRUE) ON DUPLICATE KEY UPDATE is_premium = TRUE',
      [userId, season]
    );
    
    res.json({ success: true, message: 'Battle Pass activated!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase battle pass' });
  }
});

router.get('/battlepass/:userId', async (req, res) => {
  try {
    const [pass] = await pool.query(
      'SELECT * FROM battle_pass WHERE user_id = ? ORDER BY season DESC LIMIT 1',
      [req.params.userId]
    );
    res.json({ battlePass: pass[0] || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch battle pass' });
  }
});

// Defense Decay (Cron job endpoint)
router.post('/admin/decay', async (req, res) => {
  try {
    await pool.query(
      'UPDATE hexagons SET defense_level = GREATEST(defense_level - 1, 0) WHERE last_reinforced < DATE_SUB(NOW(), INTERVAL 1 DAY)'
    );
    
    await pool.query(
      'DELETE FROM hexagons WHERE defense_level = 0'
    );
    
    res.json({ success: true, message: 'Decay applied' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply decay' });
  }
});

// Safety: Set Home Base
router.post('/safety/home', async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;
    await pool.query('UPDATE users SET home_lat = ?, home_lng = ? WHERE id = ?', [lat, lng, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set home base' });
  }
});

module.exports = router;
