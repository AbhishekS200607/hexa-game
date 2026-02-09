## Quick Start - Manual Steps

### ✅ Step 1: Dependencies Installed
All npm packages are installed successfully!

### Step 2: Setup Database

Since MySQL command line is not in PATH, use one of these methods:

#### Option A: MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your local MySQL server (root/Asn@2006)
3. Click "File" → "Open SQL Script"
4. Select `schema.sql` from this folder
5. Click the lightning bolt icon to execute

#### Option B: Command Line (Add MySQL to PATH)
1. Find MySQL installation (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
2. Add to PATH or use full path:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pAsn@2006 < schema.sql
```

#### Option C: Copy-Paste SQL
1. Open MySQL Workbench or any MySQL client
2. Open `schema.sql` in a text editor
3. Copy all content
4. Paste into MySQL query window
5. Execute

### Step 3: Start Server

Once database is created, run:
```bash
npm start
```

### Step 4: Access Application

Open browser: http://localhost:3000/login

---

## Current Status

✅ Node.js dependencies installed
⏳ Database setup needed (manual step above)
⏳ Mapbox token needed (get from https://www.mapbox.com/)
⏳ Server ready to start after database setup

---

## Next: Get Mapbox Token

1. Go to https://www.mapbox.com/
2. Sign up (free)
3. Copy your token
4. Update in:
   - `.env` file
   - `public/map-new.html` (line ~250)

Then run: `npm start`
