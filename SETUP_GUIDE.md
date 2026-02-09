# Hexa - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL 8.0** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## Step 1: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This installs:
- express
- mysql2
- h3-js
- dotenv
- express-rate-limit

---

## Step 2: Configure Database

### 2.1 Update `.env` File

The `.env` file is already configured with your MySQL password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Asn@2006
DB_NAME=hexa_game
PORT=3000
MAPBOX_TOKEN=your_mapbox_token_here
```

### 2.2 Create Database

Run the SQL schema to create database and tables:

```bash
mysql -u root -pAsn@2006 < schema.sql
```

Or manually in MySQL:
```bash
mysql -u root -pAsn@2006
```
Then:
```sql
source schema.sql
```

This creates:
- `hexa_game` database
- 10 tables (users, hexagons, visited_hexes, items, squads, etc.)
- 3 demo users (one per faction)

---

## Step 3: Get Mapbox Token

### 3.1 Sign Up
1. Go to https://www.mapbox.com/
2. Create a free account
3. Navigate to Account → Tokens
4. Copy your **Default Public Token**

### 3.2 Update Token in Files

**File 1: `.env`**
```env
MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi...
```

**File 2: `public/map-new.html`** (Line 1 in script section)
```javascript
const MAPBOX_TOKEN = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi...';
```

---

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
Hexa server running on http://localhost:3000
```

---

## Step 5: Access the Application

Open your browser and navigate to:

### Desktop Testing
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/
- **Map**: http://localhost:3000/map
- **Leaderboard**: http://localhost:3000/leaderboard
- **Profile**: http://localhost:3000/profile
- **Items**: http://localhost:3000/items

### Mobile Testing (GPS Required)

For GPS to work, you need HTTPS. Use **ngrok**:

1. Install ngrok: https://ngrok.com/download
2. Run:
   ```bash
   ngrok http 3000
   ```
3. Use the HTTPS URL provided (e.g., `https://abc123.ngrok.io`)
4. Open on your mobile device

---

## Step 6: Create Your Account

1. Go to `/login`
2. Click **Sign Up** tab
3. Enter:
   - Username
   - Email
   - Password
   - Choose Faction (Neon Syndicate, Wildkeepers, or Iron Vanguard)
4. Click **CREATE ACCOUNT**
5. You'll be redirected to the dashboard

---

## Step 7: Test the Game

### Dashboard
- View your stats (hexes, distance, XP, energy)
- See your faction info
- Toggle light/dark mode (bottom-right button)

### Map
- Allow location permissions
- GPS will start tracking
- Walk around to capture hexes
- Speed detection prevents cheating (30 km/h cap)

### Leaderboard
- View global rankings
- See top 3 podium
- Check your position

### Profile
- View detailed stats
- Manage squad
- Check battle pass

### Items
- Place landmines, shields, beacons
- Add graffiti stickers

---

## Troubleshooting

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution**: Check MySQL password in `.env` file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT in `.env` to 3001 or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### GPS Not Working
**Solution**: 
- Use HTTPS (ngrok for testing)
- Allow location permissions in browser
- Keep screen on (Wake Lock API)

### Mapbox Map Not Loading
**Solution**:
- Verify token is correct
- Check browser console for errors
- Ensure token has proper permissions

---

## Demo Users

The database comes with 3 demo users:

| ID | Username | Faction | Password |
|----|----------|---------|----------|
| 1 | CyberRunner | Neon Syndicate | (create your own) |
| 2 | NatureWalker | Wildkeepers | (create your own) |
| 3 | IronSprinter | Iron Vanguard | (create your own) |

---

## Development Mode

For auto-reload during development:

```bash
npm run dev
```

Requires `nodemon` (already in package.json)

---

## Project Structure

```
hexa/
├── public/              # Frontend files
│   ├── css/            # Styles
│   ├── js/             # JavaScript
│   ├── dashboard.html  # Main dashboard
│   ├── map-new.html    # GPS map
│   ├── leaderboard-new.html
│   ├── profile-new.html
│   ├── items.html
│   └── login.html      # Auth page
├── src/                # Backend files
│   ├── server.js       # Express server
│   ├── database.js     # MySQL pool
│   ├── routes.js       # Core APIs
│   ├── advanced-routes.js
│   └── auth-routes.js  # Login/signup
├── .env               # Configuration
├── schema.sql         # Database schema
└── package.json       # Dependencies
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/check/:userId` - Verify session

### Game
- `POST /api/move` - Capture/reinforce hex
- `GET /api/stats/:userId` - User stats
- `GET /api/map/:userId` - Fog of war data

### Social
- `GET /api/leaderboard/global` - Rankings
- `POST /api/squads/create` - Create squad
- `POST /api/graffiti/place` - Place graffiti

### Items
- `POST /api/items/place` - Place item
- `POST /api/battlepass/purchase` - Buy battle pass

---

## Features Checklist

- ✅ GPS tracking with Wake Lock
- ✅ H3 hexagon grid system
- ✅ 3 Factions with colors
- ✅ Energy system (0-100)
- ✅ Defense levels (1-5)
- ✅ Speed detection (30 km/h cap)
- ✅ Fog of war
- ✅ Items & traps
- ✅ Squad system
- ✅ Leaderboards
- ✅ Battle pass
- ✅ Light/Dark mode
- ✅ Authentication

---

## Next Steps

1. **Customize**: Update colors, fonts, or UI elements
2. **Deploy**: Use services like Heroku, AWS, or DigitalOcean
3. **SSL**: Get free SSL certificate from Let's Encrypt
4. **Domain**: Connect a custom domain
5. **Analytics**: Add Google Analytics or similar
6. **Push Notifications**: Implement for territory alerts

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs in terminal
3. Verify database connection
4. Ensure all dependencies are installed

---

## Production Deployment

### Environment Variables
Set these in production:
- `DB_HOST` - Your MySQL host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Server port
- `MAPBOX_TOKEN` - Your Mapbox token

### Security
- Use environment variables (never commit `.env`)
- Enable HTTPS
- Use strong passwords
- Implement rate limiting (already included)
- Add CORS if needed

---

## License

MIT License - Free to use and modify

---

## Credits

Built with:
- Node.js + Express
- MySQL 8.0
- Mapbox GL JS
- Uber H3
- Tailwind CSS

---

**Ready to conquer the world! 🌍**
