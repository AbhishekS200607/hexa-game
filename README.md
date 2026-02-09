# Hexa Web MVP - Location-Based Territory Conquest Game

A mobile-first web game where players capture territory by physically moving through the real world using GPS tracking and H3 hexagonal indexing.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js + Express
- **Database**: MySQL 8.0
- **Map Engine**: Mapbox GL JS
- **Geospatial**: Uber H3 (h3-js)

## Features

- 📊 Dashboard with real-time stats
- 🗺️ Interactive map with GPS tracking
- ⬡ H3 hexagon-based territory system
- 🔒 Screen Wake Lock to prevent GPS interruption
- ⚡ Rate-limited API (1 request per 5 seconds)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Edit `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hexa_game
PORT=3000
MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Initialize Database

Run the SQL schema:

```bash
mysql -u root -p < schema.sql
```

### 4. Get Mapbox Token

1. Sign up at https://www.mapbox.com/
2. Copy your access token
3. Update `.env` and `public/js/map.js` with your token

### 5. Start Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 6. Access the App

Open http://localhost:3000 in your mobile browser

**Important**: For GPS to work, you need HTTPS in production. Use ngrok for testing:

```bash
ngrok http 3000
```

## Project Structure

```
/hexa-web
├── /public
│   ├── /css
│   │   ├── style.css       # Global styles & variables
│   │   └── dashboard.css   # Dashboard card styling
│   ├── /js
│   │   ├── app.js          # Dashboard logic
│   │   ├── map.js          # Mapbox & H3 game loop
│   │   └── gps.js          # Geolocation & Wake Lock
│   ├── index.html          # Dashboard page
│   └── map.html            # Game map page
├── /src
│   ├── server.js           # Express app entry
│   ├── database.js         # MySQL connection pool
│   └── routes.js           # API endpoints
├── .env                    # Configuration
├── schema.sql              # Database schema
└── package.json
```

## API Endpoints

### POST /api/move
Capture or reinforce a hexagon.

**Body**:
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "h3Index": "8928308280fffff",
  "userId": 1
}
```

**Response**:
```json
{
  "success": true,
  "conquered": true,
  "h3Index": "8928308280fffff",
  "stats": {
    "hexes": 42,
    "distance": 5.3,
    "exp": 420
  }
}
```

### GET /api/stats/:userId
Get user statistics.

**Response**:
```json
{
  "username": "Player1",
  "hexes": 42,
  "distance": 5.3,
  "exp": 420,
  "teamColor": "BLUE"
}
```

## Game Mechanics

1. **GPS Tracking**: Uses `navigator.geolocation.watchPosition` for continuous location updates
2. **H3 Indexing**: Converts lat/lng to H3 hexagon at resolution 9 (~0.1 km² per hex)
3. **Territory Capture**: First visit captures, subsequent visits reinforce defense
4. **Wake Lock**: Prevents screen from sleeping to maintain GPS connection
5. **Rate Limiting**: Server enforces 1 move per 5 seconds per user

## Important Notes

- **HTTPS Required**: Geolocation API requires secure context (HTTPS) in production
- **Keep Screen On**: GPS stops when screen turns off or tab is backgrounded
- **Battery Usage**: Continuous GPS tracking drains battery quickly
- **Accuracy**: GPS accuracy varies (typically 5-50 meters)

## Color Scheme

- Green (#85c3a8): Hexes Conquered
- Orange (#ff8c56): Distance Traveled
- Blue (#3d8aff): Experience Points

## Browser Compatibility

- Chrome/Edge 84+ (Wake Lock API)
- Safari 13+ (Geolocation)
- Firefox 90+ (Geolocation)

## License

MIT
