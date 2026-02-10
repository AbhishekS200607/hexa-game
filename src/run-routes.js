const express = require('express');
const pool = require('./database');
const router = express.Router();

router.post('/run/start', async (req, res) => {
  try {
    const { userId } = req.body;
    const [[user]] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const [result] = await pool.query(
      'INSERT INTO runs (user_id, started_at) VALUES (?, NOW())',
      [userId]
    );
    res.json({ runId: result.insertId });
  } catch (error) {
    console.error('Start run error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/run/point', async (req, res) => {
  try {
    const { runId, latitude, longitude, accuracy, timestamp } = req.body;
    if (accuracy > 50) return res.sendStatus(204);
    
    await pool.query(
      'INSERT INTO run_points (run_id, ts, lat, lng, accuracy) VALUES (?, FROM_UNIXTIME(?/1000), ?, ?, ?)',
      [runId, timestamp, latitude, longitude, accuracy]
    );
    res.sendStatus(204);
  } catch (error) {
    console.error('Run point error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/run/stop', async (req, res) => {
  try {
    const { runId } = req.body;
    
    const [points] = await pool.query(
      'SELECT lat, lng FROM run_points WHERE run_id = ? ORDER BY ts',
      [runId]
    );
    
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const R = 6371e3;
      const φ1 = points[i-1].lat * Math.PI / 180;
      const φ2 = points[i].lat * Math.PI / 180;
      const Δφ = (points[i].lat - points[i-1].lat) * Math.PI / 180;
      const Δλ = (points[i].lng - points[i-1].lng) * Math.PI / 180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
      distance += 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    
    await pool.query(
      'UPDATE runs SET ended_at = NOW(), total_distance_m = ? WHERE id = ?',
      [distance, runId]
    );
    
    res.json({ distance: distance / 1000 });
  } catch (error) {
    console.error('Stop run error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/run/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    const [points] = await pool.query(
      'SELECT lat, lng, ts FROM run_points WHERE run_id = ? ORDER BY ts',
      [runId]
    );
    res.json({ points });
  } catch (error) {
    console.error('Get run error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
