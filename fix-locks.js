const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixLocks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking for locks...');
    
    const [locks] = await connection.execute('SHOW OPEN TABLES WHERE In_use > 0');
    console.log('Open tables:', locks);
    
    const [processes] = await connection.execute('SHOW PROCESSLIST');
    console.log('Active processes:', processes.length);
    
    for (const proc of processes) {
      if (proc.Command !== 'Sleep' && proc.Id !== connection.threadId) {
        console.log(`Killing process ${proc.Id}...`);
        await connection.execute(`KILL ${proc.Id}`);
      }
    }
    
    await connection.execute('UNLOCK TABLES');
    console.log('✅ Tables unlocked');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixLocks();
