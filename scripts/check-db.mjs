import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function check() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || '';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  console.log('Checking DB connection to', `${host}:${port}`, 'user=', user, 'db=', database || '(none)');

  try {
    const conn = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      connectTimeout: 10000
    });

    console.log('Connected to DB server. Running simple test query...');
    const [rows] = await conn.execute('SELECT 1 AS ok');
    console.log('Query result:', rows);
    await conn.end();
    console.log('DB connection test succeeded.');
    process.exit(0);
  } catch (err) {
    console.error('DB connection test failed:');
    console.error(err && err.message ? err.message : err);
    if (err && err.code === 'ETIMEDOUT') {
      console.error('- The error is a timeout. Likely network connectivity or firewall/security group blocking port 3306.');
    }
    if (err && err.code === 'ECONNREFUSED') {
      console.error('- Connection refused. The host is reachable but no MySQL service listening on that port.');
    }
    if (err && err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('- Access denied. Check DB user and password.');
    }
    process.exit(2);
  }
}

check();
