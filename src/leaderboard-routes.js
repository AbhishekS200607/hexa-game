const express = require('express');
const pool = require('./database');
const router = express.Router();

router.get('/leaderboard/global', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [leaders] = await connection.query(`
      SELECT 
        u.id, 
        u.username, 
        u.faction, 
        u.exp_points,
        u.total_distance,
        COUNT(h.h3_index) as hexes
      FROM users u
      LEFT JOIN hexagons h ON h.owner_id = u.id
      GROUP BY u.id, u.username, u.faction, u.exp_points, u.total_distance
      HAVING hexes > 0
      ORDER BY hexes DESC, u.exp_points DESC
      LIMIT 50
    `);
    
    res.json({ leaderboard: leaders });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/leaderboard/local/:region', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [leaders] = await connection.query(`
      SELECT 
        u.id, 
        u.username, 
        u.faction, 
        u.exp_points,
        u.total_distance,
        COUNT(h.h3_index) as hexes
      FROM users u
      LEFT JOIN hexagons h ON h.owner_id = u.id
      GROUP BY u.id, u.username, u.faction, u.exp_points, u.total_distance
      HAVING hexes > 0
      ORDER BY hexes DESC, u.exp_points DESC
      LIMIT 50
    `);
    
    res.json({ leaderboard: leaders });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
