USE hexa_game;

CREATE TABLE IF NOT EXISTS runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME NULL,
    total_distance_m DOUBLE DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS run_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    run_id INT NOT NULL,
    ts DATETIME NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    accuracy DOUBLE,
    INDEX (run_id, ts),
    FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);
