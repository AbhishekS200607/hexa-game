# Leaderboard Fix - Database Schema Alignment

## Problem:
Leaderboard was querying non-existent column `u.hexes_captured` from users table.

**Error:**
```
Unknown column 'u.hexes_captured' in 'field list'
```

## Root Cause:
The users table doesn't have a `hexes_captured` column. Hex counts are stored in the `hexagons` table with `owner_id` foreign key.

## Solution:
Changed leaderboard query to JOIN with hexagons table and COUNT hexes dynamically.

### Before (Broken):
```sql
SELECT 
  u.id, 
  u.username, 
  u.faction, 
  u.exp_points,
  u.hexes_captured as hexes,  -- ❌ Column doesn't exist
  u.distance_traveled
FROM users u
WHERE u.hexes_captured > 0
ORDER BY u.hexes_captured DESC
```

### After (Fixed):
```sql
SELECT 
  u.id, 
  u.username, 
  u.faction, 
  u.exp_points,
  u.total_distance,
  COUNT(h.h3_index) as hexes  -- ✅ Count from hexagons table
FROM users u
LEFT JOIN hexagons h ON h.owner_id = u.id
GROUP BY u.id, u.username, u.faction, u.exp_points, u.total_distance
HAVING hexes > 0
ORDER BY hexes DESC, u.exp_points DESC
```

## Benefits:
1. ✅ Queries actual hex ownership from hexagons table
2. ✅ Always accurate (no denormalization)
3. ✅ Consistent with /api/stats/:userId endpoint
4. ✅ Real-time leaderboard updates
5. ✅ No data duplication

## Database Schema:
```sql
-- Users table (no hex count stored)
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  faction ENUM(...),
  exp_points INT,
  total_distance FLOAT
);

-- Hexagons table (actual ownership)
CREATE TABLE hexagons (
  h3_index VARCHAR(15) PRIMARY KEY,
  owner_id INT,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

## Endpoints Fixed:
- ✅ `/leaderboard/global` - Global rankings
- ✅ `/leaderboard/local/:region` - Regional rankings

## Testing:
```bash
# Test global leaderboard
curl http://localhost:3000/leaderboard/global

# Expected response:
{
  "leaderboard": [
    {
      "id": 1,
      "username": "Player1",
      "faction": "NEON_SYNDICATE",
      "exp_points": 420,
      "total_distance": 5.3,
      "hexes": 42
    }
  ]
}
```

## Commit:
- **Hash:** `5be3d51`
- **Message:** "fix: Leaderboard query to count hexes from hexagons table"
- **Files:** `src/leaderboard-routes.js`
