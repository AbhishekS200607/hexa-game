const pool = require('./database');

// Passive energy regeneration from owned territory
async function regenerateEnergyFromTerritory() {
  try {
    const connection = await pool.getConnection();
    
    // Get all users with their hex counts
    const [users] = await connection.query(`
      SELECT u.id, u.energy, COUNT(h.h3_index) as hex_count
      FROM users u
      LEFT JOIN hexagons h ON h.owner_id = u.id
      GROUP BY u.id, u.energy
      HAVING hex_count > 0
    `);
    
    for (const user of users) {
      // +10 energy per owned hex (capped at 100)
      const energyGain = Math.min(10, 100 - user.energy);
      if (energyGain > 0) {
        await connection.query(
          'UPDATE users SET energy = LEAST(energy + ?, 100) WHERE id = ?',
          [energyGain, user.id]
        );
      }
    }
    
    connection.release();
    console.log(`Energy regenerated for ${users.length} users`);
  } catch (error) {
    console.error('Energy regeneration error:', error);
  }
}

// Daily energy reset
async function dailyEnergyReset() {
  try {
    const connection = await pool.getConnection();
    
    // Reset energy to 100 if below 25
    await connection.query(`
      UPDATE users 
      SET energy = 100 
      WHERE energy < 25
    `);
    
    connection.release();
    console.log('Daily energy reset completed');
  } catch (error) {
    console.error('Daily reset error:', error);
  }
}

// Run every 10 minutes for passive regeneration
setInterval(regenerateEnergyFromTerritory, 10 * 60 * 1000);

// Run daily at midnight for reset
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0);
const msUntilMidnight = midnight - now;

setTimeout(() => {
  dailyEnergyReset();
  setInterval(dailyEnergyReset, 24 * 60 * 60 * 1000);
}, msUntilMidnight);

console.log('Energy regeneration system started');
console.log('- Passive regen: Every 10 minutes');
console.log('- Daily reset: At midnight');

module.exports = { regenerateEnergyFromTerritory, dailyEnergyReset };
