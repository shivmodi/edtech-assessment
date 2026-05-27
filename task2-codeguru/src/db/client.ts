import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({ connectionString: config.DATABASE_URL });

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS execution_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR NOT NULL,
      language VARCHAR NOT NULL,
      code TEXT NOT NULL,
      status VARCHAR DEFAULT 'queued',
      output TEXT,
      error TEXT,
      execution_time_ms INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    )
  `);
}
