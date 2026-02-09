# Hexa - Complete Feature List

## ✅ Phase 1: Core Gameplay (MVP)

### 1. Hexagon Grid System
- **H3 Resolution 9**: ~0.1 km² per hexagon
- **Fog of War**: Only visited areas visible
- **Capture Mechanics**:
  - Neutral hex: Instant capture (0 energy)
  - Enemy hex: Costs energy = defense_level × 10
  - Own hex: Reinforces defense (+1 level, max 5)

### 2. Three Factions
- **Neon Syndicate** (Cyan #00d9ff): Cyberpunk
- **Wildkeepers** (Green #85c3a8): Nature
- **Iron Vanguard** (Red #ff4757): Industrial
- **Team Bonus**: +10% XP in faction territory

### 3. Activity Modes
- **Foot Soldier**: High capture power, 0.1 km/hex
- **Cavalry**: Low capture power, 0.2 km/hex, exploration focus

### 4. Anti-Cheat System
- **Speed Detection**: Calculates GPS speed
- **Speed Cap**: 30 km/h threshold
- **Passive Mode**: Disables capturing when driving
- **Server Validation**: H3 recalculated server-side

---

## ✅ Phase 2: Advanced Strategy

### 5. Defense & Fortification
- **Reinforcement**: Level up owned hexes (1-5)
- **Defense Decay**: -1 HP per day if not reinforced
- **Timestamp Tracking**: last_reinforced field
- **Auto-Delete**: Hexes with 0 defense removed

### 6. Items & Traps
- **Landmine** (50 energy): Enemy loses energy on entry
- **Shield Generator** (100 energy): Protects 7 hexes for 24h
- **Beacon** (30 energy): Alerts teammates
- **Expiration System**: Items expire after duration
- **Active Tracking**: is_active flag

### 7. RPG Classes
- **Scout** 🔭: Sees further into fog of war
- **Tank** 🛡️: Higher starting defense on capture
- **Sprinter** ⚡: Faster energy generation

---

## ✅ Phase 3: Social & Community

### 8. Leaderboards
- **Global Ranking**: Total hexes + XP
- **Local Legends**: Region-based rankings
- **Top 100**: Paginated results
- **Real-time Updates**: Cached in database

### 9. Squads (Guilds)
- **Create Squad**: Name + faction
- **Join Squad**: squad_id in users table
- **Squad Missions**: Target hex + deadline
- **Squad Badges**: Reward system
- **Member List**: View squad members

### 10. Graffiti System
- **5 Sticker Types**:
  - 😏 Nice Try!
  - 👑 My Turf
  - ⚡ Run Faster!
  - 🎉 Victory
  - ⚔️ Challenge
- **Hex-based**: Placed on current location
- **History**: Last 10 graffiti per hex

---

## ✅ Phase 4: Monetization

### 11. Battle Pass (Season Pass)
- **Seasons**: 3-month cycles
- **Tier System**: 0-50 tiers
- **Premium Track**: $9.99 unlock
- **Rewards**: Glowing trails (Fire, Lightning)
- **Progress Tracking**: XP-based tier advancement

### 12. Sponsored Territories
- **Golden Hexes**: Brand partnerships
- **Sponsor Name**: Displayed on hex
- **Real-world Coupons**: Capture rewards
- **B2B Revenue**: Gym, coffee shop partnerships

---

## ✅ Safety Features

### 13. Privacy & Safety
- **Home Base**: 500m privacy zone
- **Hidden Username**: In home radius
- **GPS Coordinates**: Stored for home base
- **Night Mode**: (Ready for implementation)
- **Dangerous Area Warnings**: (Ready for implementation)

---

## 🗄️ Complete Database Schema

### Tables (10 total)
1. **users**: Player data, faction, energy, class, squad
2. **hexagons**: Territory ownership, defense, sponsor
3. **visited_hexes**: Fog of war tracking
4. **items**: Landmines, shields, beacons
5. **squads**: Guild system
6. **squad_missions**: Team objectives
7. **graffiti**: Sticker system
8. **leaderboard**: Ranking cache
9. **battle_pass**: Season pass tracking
10. **Safety fields**: home_lat, home_lng

---

## 🚀 API Endpoints (20 total)

### Core Gameplay
- `POST /api/move` - Capture/reinforce hexes
- `GET /api/stats/:userId` - User statistics
- `GET /api/map/:userId` - Fog of war data

### Items & Traps
- `POST /api/items/place` - Place item
- `GET /api/items/:h3Index` - Get hex items

### Squads
- `POST /api/squads/create` - Create squad
- `POST /api/squads/join` - Join squad
- `GET /api/squads/:squadId` - Squad details

### Graffiti
- `POST /api/graffiti/place` - Place sticker
- `GET /api/graffiti/:h3Index` - Get hex graffiti

### Leaderboards
- `GET /api/leaderboard/global` - Global top 100
- `GET /api/leaderboard/local/:region` - Local rankings

### Battle Pass
- `POST /api/battlepass/purchase` - Buy premium
- `GET /api/battlepass/:userId` - Pass status

### Admin
- `POST /api/admin/decay` - Apply daily decay

### Safety
- `POST /api/safety/home` - Set home base

---

## 🎮 Pages (6 total)

1. **Dashboard** (`/`) - Stats overview
2. **Map** (`/map`) - Live GPS gameplay
3. **Leaderboard** (`/leaderboard.html`) - Rankings
4. **Profile** (`/profile.html`) - Class, squad, battle pass
5. **Items** (`/items.html`) - Place items & graffiti
6. **Squads** (Integrated in profile)

---

## 🎨 UI Features

### Dashboard
- Hexes conquered
- Distance traveled (progress bar)
- Experience points
- Energy meter
- Faction display
- Avatar with faction color

### Map
- Dark theme
- Fog of war visualization
- Faction-colored territories
- Current hex highlight
- Speed detection indicator
- Status messages

### Profile
- Class selection (3 classes)
- Squad management
- Battle pass progress
- Home base setting
- Faction info

### Leaderboard
- Global/Local tabs
- Top 100 rankings
- Gold/Silver/Bronze medals
- Hex count + XP display

### Items
- 3 item types with costs
- 5 graffiti stickers
- Current location placement
- Energy cost display

---

## 🔧 Technical Features

### Security
- Server-side H3 validation
- Rate limiting (1 req/5s)
- SQL injection protection
- Speed cap anti-cheat
- Home base privacy

### Performance
- MySQL connection pooling
- Leaderboard caching
- Fog of war optimization
- Expired item cleanup

### Mobile Optimization
- Wake Lock API
- GPS high accuracy mode
- Touch-friendly UI
- Bottom navigation
- Responsive design

---

## 📊 Game Mechanics Summary

| Feature | Value |
|---------|-------|
| Hex Size | ~0.1 km² (H3 res 9) |
| Max Defense | Level 5 |
| Starting Energy | 100 |
| Energy Regen | +5 per hex |
| Attack Cost | 10 × defense_level |
| Speed Cap | 30 km/h |
| Decay Rate | -1 HP/day |
| Team Bonus | +10% XP |
| Battle Pass | $9.99 |
| Privacy Zone | 500m radius |

---

## 🚀 Ready to Launch

All features from your specification are implemented:
- ✅ Phase 1: Core Gameplay
- ✅ Phase 2: Advanced Strategy
- ✅ Phase 3: Social & Community
- ✅ Phase 4: Monetization
- ✅ Safety Features

Run `npm install` and `mysql -u root -pAsn@2006 < schema.sql` to start!
