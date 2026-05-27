import { Router, RequestHandler } from 'express';
import { pool } from '../db/client';

const router = Router();

// GET /api/teams
const getTeams: RequestHandler = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, name FROM teams ORDER BY name ASC
    `);
        console.log('[Route] GET /teams →', result.rows.length, 'teams');
        res.json(result.rows);
    } catch (err: any) {
        console.error('[Route] GET /teams error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

router.get('/', getTeams);

export default router;