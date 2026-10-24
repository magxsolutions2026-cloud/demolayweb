import mysql from 'mysql2/promise';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  // createPool is deferred until query, so the app can still build in environments where .env is not loaded.
  console.warn('Warning: Missing database environment variables DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
}

export const pool = mysql.createPool({
  host: DB_HOST || '127.0.0.1',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'demolayweb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

type QueryValue = string | number | boolean | null | Date;

export async function query<T = Record<string, unknown>>(sql: string, params: QueryValue[] = []) {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}
