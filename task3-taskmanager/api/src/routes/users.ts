import { Router, RequestHandler } from 'express';
import { pool } from '../db/client';

const router = Router();

// GET /api/users
const getUsers: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email FROM users ORDER BY name ASC
    `);
    console.log('[Route] GET /users →', result.rows.length, 'users');
    res.json(result.rows);
  } catch (err: any) {
    console.error('[Route] GET /users error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

router.get('/', getUsers);

export default router;