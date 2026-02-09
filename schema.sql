-- Create Database
CREATE DATABASE IF NOT EXISTS hexa_game;
USE hexa_game;

-- Users Table
CREATE TABLE users (
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
);

-- Hexagons Table
CREATE TABLE hexagons (
    h3_index VARCHAR(15) PRIMARY KEY,
    owner_id INT,
    faction ENUM('NEON_SYNDICATE', 'WILDKEEPERS', 'IRON_VANGUARD'),
    defense_level INT DEFAULT 1,
    last_reinforced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_golden BOOLEAN DEFAULT FALSE,
    sponsor_name VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fog of War
CREATE TABLE visited_hexes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    h3_index VARCHAR(15) NOT NULL,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_visit (user_id, h3_index),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Items/Traps
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('LANDMINE', 'SHIELD', 'BEACON') NOT NULL,
    h3_index VARCHAR(15) NOT NULL,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Squads
CREATE TABLE squads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    faction ENUM('NEON_SYNDICATE', 'WILDKEEPERS', 'IRON_VANGUARD') NOT NULL,
    leader_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Squad Missions
CREATE TABLE squad_missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    squad_id INT NOT NULL,
    target_h3 VARCHAR(15) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    reward_badge VARCHAR(50),
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
);

-- Graffiti
CREATE TABLE graffiti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    h3_index VARCHAR(15) NOT NULL,
    sticker_type ENUM('NICE_TRY', 'MY_TURF', 'RUN_FASTER', 'VICTORY', 'CHALLENGE') NOT NULL,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leaderboard Cache
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    region VARCHAR(100) NOT NULL,
    total_area FLOAT DEFAULT 0,
    rank_position INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Battle Pass
CREATE TABLE battle_pass (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    season INT NOT NULL,
    tier INT DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    trail_effect VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Demo Users
INSERT INTO users (username, faction, energy, player_class) VALUES 
('CyberRunner', 'NEON_SYNDICATE', 100, 'SPRINTER'),
('NatureWalker', 'WILDKEEPERS', 100, 'SCOUT'),
('IronSprinter', 'IRON_VANGUARD', 100, 'TANK');
