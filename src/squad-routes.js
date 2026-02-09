const express = require('express');
const pool = require('./database');
const router = express.Router();

router.post('/squad/create', async (req, res) => {
  try {
    const { userId, name, faction } = req.body;
    const [result] = await pool.query(
      'INSERT INTO squads (name, faction, leader_id) VALUES (?, ?, ?)',
      [name, faction, userId]
    );
    await pool.query('UPDATE users SET squad_id = ? WHERE id = ?', [result.insertId, userId]);
    res.json({ success: true, squadId: result.insertId });
  } catch (error) {
    console.error('Create squad error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/squad/join', async (req, res) => {
  try {
    const { userId, squadId } = req.body;
    const [squad] = await pool.query('SELECT faction FROM squads WHERE id = ?', [squadId]);
    const [user] = await pool.query('SELECT faction FROM users WHERE id = ?', [userId]);
    
    if (squad[0].faction !== user[0].faction) {
      return res.json({ success: false, message: 'Wrong faction' });
    }
    
    await pool.query('UPDATE users SET squad_id = ? WHERE id = ?', [squadId, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Join squad error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/squad/:squadId', async (req, res) => {
  try {
    const { squadId } = req.params;
    const [squad] = await pool.query('SELECT * FROM squads WHERE id = ?', [squadId]);
    const [members] = await pool.query(
      'SELECT id, username, exp_points FROM users WHERE squad_id = ? ORDER BY exp_points DESC',
      [squadId]
    );
    const [missions] = await pool.query(
      'SELECT * FROM squad_missions WHERE squad_id = ? AND completed = FALSE',
      [squadId]
    );
    res.json({ squad: squad[0], members, missions });
  } catch (error) {
    console.error('Get squad error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/squads/list/:faction', async (req, res) => {
  try {
    const { faction } = req.params;
    const [squads] = await pool.query(
      'SELECT s.*, COUNT(u.id) as member_count FROM squads s LEFT JOIN users u ON s.id = u.squad_id WHERE s.faction = ? GROUP BY s.id',
      [faction]
    );
    res.json({ squads });
  } catch (error) {
    console.error('List squads error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/squad/mission/complete', async (req, res) => {
  try {
    const { missionId, squadId } = req.body;
    await pool.query('UPDATE squad_missions SET completed = TRUE WHERE id = ?', [missionId]);
    await pool.query(
      'UPDATE users SET exp_points = exp_points + 100 WHERE squad_id = ?',
      [squadId]
    );
    res.json({ success: true, reward: 100 });
  } catch (error) {
    console.error('Complete mission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


router.post('/squad/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query('UPDATE users SET squad_id = NULL WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Leave squad error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
