const express = require('express');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const advancedRoutes = require('./advanced-routes');
const authRoutes = require('./auth-routes');
const settingsRoutes = require('./settings-routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);
app.use('/api', advancedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', settingsRoutes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/map-new.html'));
});

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/leaderboard-new.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile-new.html'));
});

app.get('/items', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/items-new.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/settings.html'));
});

app.listen(PORT, () => {
  console.log(`Hexa server running on http://localhost:${PORT}`);
});
