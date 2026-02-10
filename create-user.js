const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

async function createUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const password = crypto.createHash('sha256').update('password123').digest('hex');
    
    await connection.execute('START TRANSACTION');
    await connection.execute(
      'INSERT INTO users (username, email, password, faction, energy) VALUES (?, ?, ?, ?, 100)',
      ['abhishek', 'Asn18123@gmail.com', password, 'NEON_SYNDICATE']
    );
    await connection.execute('COMMIT');
    
    console.log('✅ User created successfully');
  } catch (error) {
    await connection.execute('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createUser();
