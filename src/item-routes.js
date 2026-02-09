const express = require('express');
const pool = require('./database');
const router = express.Router();

router.get('/items/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [items] = await pool.query(
      'SELECT * FROM items WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/items/place', async (req, res) => {
  try {
    const { userId, itemType, h3Index } = req.body;
    
    const itemCosts = { LANDMINE: 50, SHIELD: 30, BEACON: 20 };
    const [user] = await pool.query('SELECT energy FROM users WHERE id = ?', [userId]);
    
    if (user[0].energy < itemCosts[itemType]) {
      return res.json({ success: false, message: 'Not enough energy' });
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO items (user_id, item_type, h3_index, expires_at) VALUES (?, ?, ?, ?)',
      [userId, itemType, h3Index, expiresAt]
    );
    
    await pool.query(
      'UPDATE users SET energy = energy - ? WHERE id = ?',
      [itemCosts[itemType], userId]
    );
    
    res.json({ success: true, message: `${itemType} placed!` });
  } catch (error) {
    console.error('Place item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/items/trigger', async (req, res) => {
  try {
    const { h3Index, userId } = req.body;
    
    const [items] = await pool.query(
      'SELECT * FROM items WHERE h3_index = ? AND is_active = TRUE AND user_id != ?',
      [h3Index, userId]
    );
    
    let effects = [];
    for (const item of items) {
      if (item.item_type === 'LANDMINE') {
        await pool.query('UPDATE users SET energy = GREATEST(energy - 20, 0) WHERE id = ?', [userId]);
        effects.push({ type: 'LANDMINE', damage: 20 });
      } else if (item.item_type === 'SHIELD') {
        effects.push({ type: 'SHIELD', defenseBoost: 2 });
      }
      await pool.query('UPDATE items SET is_active = FALSE WHERE id = ?', [item.id]);
    }
    
    res.json({ effects });
  } catch (error) {
    console.error('Trigger item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


router.post('/graffiti/place', async (req, res) => {
  try {
    const { userId, h3Index, stickerType } = req.body;
    await pool.query(
      'INSERT INTO graffiti (user_id, h3_index, sticker_type) VALUES (?, ?, ?)',
      [userId, h3Index, stickerType]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Place graffiti error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
