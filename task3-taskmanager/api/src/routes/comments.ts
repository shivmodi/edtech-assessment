import { Router, RequestHandler } from 'express';
import { pool } from '../db/client';

const router = Router({ mergeParams: true });

const getComments: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COALESCE(u.name, 'Anonymous') AS author_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.ticketId]);

    console.log('[Comments] GET', req.params.ticketId, '→', result.rows.length, 'comments');
    res.json(result.rows);
  } catch (err: any) {
    console.error('[Comments] GET error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const addComment: RequestHandler = async (req, res) => {
  try {
    const { body, author_id } = req.body;

    if (!body || !body.trim()) {
      res.status(400).json({ error: 'Comment body is required' });
      return;
    }

    // author_id can be null — use first user as fallback
    let resolvedAuthorId = author_id || null;
    if (!resolvedAuthorId) {
      const fallback = await pool.query(`SELECT id FROM users LIMIT 1`);
      resolvedAuthorId = fallback.rows[0]?.id || null;
    }

    const result = await pool.query(`
      INSERT INTO comments (ticket_id, author_id, body)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.params.ticketId, resolvedAuthorId, body.trim()]);

    const enriched = await pool.query(`
      SELECT c.*, COALESCE(u.name, 'Anonymous') AS author_name
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `, [result.rows[0].id]);

    console.log('[Comments] POST → saved comment', enriched.rows[0].id, 'on ticket', req.params.ticketId);
    req.app.get('io')?.emit('comment:added', enriched.rows[0]);
    res.status(201).json(enriched.rows[0]);
  } catch (err: any) {
    console.error('[Comments] POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

router.get('/', getComments);
router.post('/', addComment);

export default router;