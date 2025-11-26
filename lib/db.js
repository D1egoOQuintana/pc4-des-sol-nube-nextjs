import dotenv from 'dotenv';
dotenv.config();

let pool = null;

async function getPool() {
  if (pool) return pool;
  try {
    const mod = await import('mysql2/promise');
    const mysql = mod.default || mod;
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'appdb',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    return pool;
  } catch (err) {
    console.error("Failed to load mysql2/promise. Did you run 'npm install'?", err?.message || err);
    throw new Error("Missing dependency 'mysql2'. Run 'npm install mysql2' and restart the dev server.");
  }
}

export async function query(sql, params) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function getUserByEmail(email) {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function createUser(email, passwordHash) {
  const result = await query('INSERT INTO users (email, password_hash, twofa_enabled, twofa_secret) VALUES (?, ?, 0, NULL)', [email, passwordHash]);
  return result;
}

export async function saveTwoFA(email, secret) {
  await query('UPDATE users SET twofa_secret = ?, twofa_enabled = 1 WHERE email = ?', [secret, email]);
}

export { getPool as pool };
