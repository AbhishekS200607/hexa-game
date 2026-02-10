const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connected to Railway MySQL...');

    // Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(64),
        total_distance FLOAT DEFAULT 0,
        exp_points INT DEFAULT 0,
        energy INT DEFAULT 100,
        faction ENUM('NEON_SYNDICATE', 'WILDKEEPERS', 'IRON_VANGUARD') DEFAULT 'NEON_SYNDICATE',
        activity_mode ENUM('FOOT', 'CAVALRY') DEFAULT 'FOOT',
        player_class ENUM('SCOUT', 'TANK', 'SPRINTER') DEFAULT 'SCOUT',
        squad_id INT DEFAULT NULL,
        home_lat FLOAT DEFAULT NULL,
        home_lng FLOAT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Hexagons Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hexagons (
        h3_index VARCHAR(15) PRIMARY KEY,
        owner_id INT,
        faction ENUM('NEON_SYNDICATE', 'WILDKEEPERS', 'IRON_VANGUARD'),
        defense_level INT DEFAULT 1,
        last_reinforced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_golden BOOLEAN DEFAULT FALSE,
        sponsor_name VARCHAR(100) DEFAULT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Hexagons table created');

    // Visited Hexes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visited_hexes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        h3_index VARCHAR(15) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_visit (user_id, h3_index),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Visited hexes table created');

    // Items
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        item_type ENUM('LANDMINE', 'SHIELD', 'BEACON') NOT NULL,
        h3_index VARCHAR(15) NOT NULL,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Items table created');

    // Squads
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS squads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        faction ENUM('NEON_SYNDICATE', 'WILDKEEPERS', 'IRON_VANGUARD') NOT NULL,
        leader_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Squads table created');

    // Squad Missions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS squad_missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        squad_id INT NOT NULL,
        target_h3 VARCHAR(15) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        reward_badge VARCHAR(50),
        completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Squad missions table created');

    // Graffiti
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS graffiti (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        h3_index VARCHAR(15) NOT NULL,
        sticker_type ENUM('NICE_TRY', 'MY_TURF', 'RUN_FASTER', 'VICTORY', 'CHALLENGE') NOT NULL,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Graffiti table created');

    // Leaderboard
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        region VARCHAR(100) NOT NULL,
        total_area FLOAT DEFAULT 0,
        rank_position INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Leaderboard table created');

    // Battle Pass
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS battle_pass (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        season INT NOT NULL,
        tier INT DEFAULT 0,
        is_premium BOOLEAN DEFAULT FALSE,
        trail_effect VARCHAR(50) DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Battle pass table created');

    // Runs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS runs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        started_at DATETIME NOT NULL,
        ended_at DATETIME NULL,
        total_distance_m DOUBLE DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Runs table created');

    // Run Points
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS run_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        run_id INT NOT NULL,
        ts DATETIME NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        accuracy DOUBLE,
        INDEX (run_id, ts),
        FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Run points table created');

    // Insert Demo Users
    await connection.execute(`
      INSERT IGNORE INTO users (username, faction, energy, player_class) VALUES 
      ('CyberRunner', 'NEON_SYNDICATE', 100, 'SPRINTER'),
      ('NatureWalker', 'WILDKEEPERS', 100, 'SCOUT'),
      ('IronSprinter', 'IRON_VANGUARD', 100, 'TANK')
    `);
    console.log('✓ Demo users inserted');

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
