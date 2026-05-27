import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
    connectionString: config.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('[DB] PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('[DB] Pool error:', err);
});