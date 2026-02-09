const express = require('express');
const router = express.Router();
const db = require('./database');

// Update user settings
router.post('/settings/update', async (req, res) => {
  const { userId, email, faction, playerClass, activityMode } = req.body;

  try {
    await db.query(
      'UPDATE users SET email = ?, faction = ?, player_class = ?, activity_mode = ? WHERE id = ?',
      [email, faction, playerClass, activityMode, userId]
    );

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

module.exports = router;
