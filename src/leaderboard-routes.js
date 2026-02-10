const express = require('express');
const pool = require('./database');
const router = express.Router();

router.get('/leaderboard/global', async (req, res) => {
  try {
    const [leaders] = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.faction, 
        u.exp_points,
        COUNT(h.h3_index) as hexes,
        u.total_distance
      FROM users u
      LEFT JOIN hexagons h ON h.owner_id = u.id
      GROUP BY u.id
      ORDER BY hexes DESC, u.exp_points DESC
      LIMIT 50
    `);
    
    res.json({ leaderboard: leaders });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/leaderboard/local/:region', async (req, res) => {
  try {
    const [leaders] = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.faction, 
        u.exp_points,
        COUNT(h.h3_index) as hexes,
        u.total_distance
      FROM users u
      LEFT JOIN hexagons h ON h.owner_id = u.id
      GROUP BY u.id
      ORDER BY hexes DESC, u.exp_points DESC
      LIMIT 50
    `);
    
    res.json({ leaderboard: leaders });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
