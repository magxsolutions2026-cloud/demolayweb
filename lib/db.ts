import { Pool, types } from 'pg';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  // Pool connections are lazy, so the app can still build where .env is not loaded.
  console.warn('Warning: Missing database environment variable DATABASE_URL (Supabase Postgres connection string)');
}

// mysql2-compatibility overrides for pg type parsing — the app relies on:
// - COUNT(*) coming back as a number (pg would return a bigint string),
// - JSON columns coming back as strings (code calls JSON.parse / parseImageUrls on them),
// - DATE columns coming back as 'YYYY-MM-DD' strings (formatSqlDate; avoids timezone day-shifts).
types.setTypeParser(20, (v) => Number(v)); // int8
types.setTypeParser(114, (v) => v); // json
types.setTypeParser(3802, (v) => v); // jsonb
types.setTypeParser(1082, (v) => v); // date

/**
 * Translate mysql2-style `?` placeholders to Postgres `$1..$n`, ignoring
 * `?` characters that occur inside single-quoted SQL string literals.
 * This lets every existing query call site keep its original SQL text.
 */
export function toPostgresSql(sql: string): string {
  let out = '';
  let paramIndex = 0;
  let inString = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];

    if (inString) {
      if (ch === "'") {
        // '' inside a string literal is an escaped quote — consume both.
        if (sql[i + 1] === "'") {
          out += "''";
          i += 1;
          continue;
        }
        inString = false;
      }
      out += ch;
      continue;
    }

    if (ch === "'") {
      inString = true;
      out += ch;
      continue;
    }

    if (ch === '?') {
      paramIndex += 1;
      out += `$${paramIndex}`;
      continue;
    }

    out += ch;
  }

  return out;
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // Serverless-friendly: keep per-instance connections low; Supabase's pooler caps concurrency.
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

type QueryValue = string | number | boolean | null | Date;

export async function query<T = Record<string, unknown>>(sql: string, params: QueryValue[] = []) {
  const result = await pool.query(toPostgresSql(sql), params);
  return result.rows as T[];
}

export interface ExecuteResult {
  rows: Record<string, unknown>[];
  rowCount: number;
}

/**
 * Run an INSERT ... RETURNING id / UPDATE / DELETE statement.
 * `rowCount` mirrors mysql2's affectedRows; `rows` carries RETURNING output.
 */
export async function execute(sql: string, params: QueryValue[] = []): Promise<ExecuteResult> {
  const result = await pool.query(toPostgresSql(sql), params);
  return {
    rows: result.rows as Record<string, unknown>[],
    rowCount: result.rowCount ?? 0,
  };
}
