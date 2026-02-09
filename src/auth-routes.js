const express = require('express');
const pool = require('./database');
const crypto = require('crypto');

const router = express.Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, faction } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = hashPassword(password);
    const selectedFaction = faction || 'NEON_SYNDICATE';

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, faction, energy) VALUES (?, ?, ?, ?, 100)',
      [username, email, hashedPassword, selectedFaction]
    );

    res.json({ 
      success: true, 
      userId: result.insertId,
      username,
      faction: selectedFaction
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const hashedPassword = hashPassword(password);

    const [users] = await pool.query(
      'SELECT id, username, faction FROM users WHERE username = ? AND password = ?',
      [username, hashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      userId: users[0].id,
      username: users[0].username,
      faction: users[0].faction
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/check/:userId', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE id = ?',
      [req.params.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
