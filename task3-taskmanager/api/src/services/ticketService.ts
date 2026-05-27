import { pool } from '../db/client';

export const ticketService = {

  async getAll(filters: Record<string, string>) {
    let query = `
      SELECT
        t.*,
        u.name  AS assignee_name,
        tm.name AS team_name,
        (SELECT COUNT(*) FROM comments c  WHERE c.ticket_id = t.id)::int  AS comment_count,
        (SELECT COUNT(*) FROM tickets  ch WHERE ch.parent_id = t.id)::int AS children_count
      FROM tickets t
      LEFT JOIN users u  ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id     = tm.id
      WHERE t.parent_id IS NULL
    `;
    const values: any[] = [];
    let idx = 1;

    if (filters.status) { query += ` AND t.status = $${idx++}`; values.push(filters.status); }
    if (filters.priority) { query += ` AND t.priority = $${idx++}`; values.push(filters.priority); }
    if (filters.team_id) { query += ` AND t.team_id = $${idx++}`; values.push(filters.team_id); }
    if (filters.assignee_id) { query += ` AND t.assignee_id = $${idx++}`; values.push(filters.assignee_id); }
    if (filters.search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      values.push(`%${filters.search}%`);
      idx++;
    }

    query += ` ORDER BY t.position ASC, t.created_at DESC`;
    const result = await pool.query(query, values);
    console.log('[TicketService] getAll → returned', result.rows.length, 'tickets');
    return result.rows;
  },

  async getById(id: string) {
    const result = await pool.query(`
      SELECT
        t.*,
        u.name  AS assignee_name,
        tm.name AS team_name,
        (SELECT COUNT(*) FROM comments c  WHERE c.ticket_id = t.id)::int  AS comment_count,
        (SELECT COUNT(*) FROM tickets  ch WHERE ch.parent_id = t.id)::int AS children_count
      FROM tickets t
      LEFT JOIN users u  ON t.assignee_id = u.id
      LEFT JOIN teams tm ON t.team_id     = tm.id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0] || null;
  },

  async getChildren(parentId: string) {
    const result = await pool.query(`
      WITH RECURSIVE tree AS (
        SELECT t.*,
          u.name  AS assignee_name,
          tm.name AS team_name,
          (SELECT COUNT(*) FROM comments c  WHERE c.ticket_id = t.id)::int  AS comment_count,
          (SELECT COUNT(*) FROM tickets  ch WHERE ch.parent_id = t.id)::int AS children_count
        FROM tickets t
        LEFT JOIN users  u  ON t.assignee_id = u.id
        LEFT JOIN teams  tm ON t.team_id     = tm.id
        WHERE t.parent_id = $1
        UNION ALL
        SELECT t2.*,
          u2.name  AS assignee_name,
          tm2.name AS team_name,
          (SELECT COUNT(*) FROM comments c  WHERE c.ticket_id = t2.id)::int  AS comment_count,
          (SELECT COUNT(*) FROM tickets  ch WHERE ch.parent_id = t2.id)::int AS children_count
        FROM tickets t2
        LEFT JOIN users  u2  ON t2.assignee_id = u2.id
        LEFT JOIN teams  tm2 ON t2.team_id     = tm2.id
        JOIN tree ON t2.parent_id = tree.id
      )
      SELECT * FROM tree ORDER BY created_at ASC
    `, [parentId]);
    console.log('[TicketService] getChildren', parentId, '→', result.rows.length);
    return result.rows;
  },

  // ── VALIDATION HELPERS ──

  // Check ticket exists
  async exists(id: string): Promise<boolean> {
    const r = await pool.query(`SELECT id FROM tickets WHERE id = $1`, [id]);
    return r.rows.length > 0;
  },

  // Check if ticket has children
  async hasChildren(id: string): Promise<boolean> {
    const r = await pool.query(`SELECT id FROM tickets WHERE parent_id = $1 LIMIT 1`, [id]);
    return r.rows.length > 0;
  },

  // Check if ticket is already a child (has a parent)
  async isAlreadyChild(id: string): Promise<boolean> {
    const r = await pool.query(`SELECT parent_id FROM tickets WHERE id = $1`, [id]);
    return !!(r.rows[0]?.parent_id);
  },

  // ── CREATE ──
  async create(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    team_id?: string;
    parent_id?: string;
  }) {
    // Grandparent check — if parent_id provided
    if (data.parent_id) {
      // 1. Parent must exist
      const parentExists = await this.exists(data.parent_id);
      if (!parentExists) {
        throw new Error(`PARENT_NOT_FOUND: Parent ticket ${data.parent_id} does not exist`);
      }

      // 2. Parent must not already be a child (no grandparent)
      const parentIsChild = await this.isAlreadyChild(data.parent_id);
      if (parentIsChild) {
        throw new Error(`GRANDPARENT_NOT_ALLOWED: Parent ticket is already under another ticket. Only 1 level parent-child allowed.`);
      }
    }

    const posResult = await pool.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM tickets WHERE status = $1`,
      [data.status || 'backlog']
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(`
      INSERT INTO tickets (title, description, status, priority, assignee_id, team_id, parent_id, position)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.title,
      data.description || null,
      data.status || 'backlog',
      data.priority || 'medium',
      data.assignee_id || null,
      data.team_id || null,
      data.parent_id || null,
      position,
    ]);

    console.log('[TicketService] Created ticket:', result.rows[0].id, data.title, '→ DB saved');
    return this.getById(result.rows[0].id);
  },

  // ── UPDATE ──
  async update(id: string, data: Record<string, any>) {
    const allowed = ['title', 'description', 'status', 'priority', 'assignee_id', 'team_id', 'parent_id'];
    const updates = Object.keys(data).filter(k => allowed.includes(k));
    if (updates.length === 0) return this.getById(id);

    // parent_id validation during update
    if ('parent_id' in data) {
      const newParentId = data.parent_id;

      // If setting a parent (not clearing it)
      if (newParentId && newParentId !== '') {

        // 1. Cannot set parent if this ticket has children
        const hasKids = await this.hasChildren(id);
        if (hasKids) {
          throw new Error(`HAS_CHILDREN: Cannot assign parent to a ticket that already has child tickets.`);
        }

        // 2. Parent must exist
        const parentExists = await this.exists(newParentId);
        if (!parentExists) {
          throw new Error(`PARENT_NOT_FOUND: Parent ticket ${newParentId} does not exist`);
        }

        // 3. Parent must not already be a child
        const parentIsChild = await this.isAlreadyChild(newParentId);
        if (parentIsChild) {
          throw new Error(`GRANDPARENT_NOT_ALLOWED: Selected parent is already a child ticket. Only 1 level allowed.`);
        }

        // 4. Cannot set itself as parent
        if (newParentId === id) {
          throw new Error(`SELF_PARENT: A ticket cannot be its own parent.`);
        }
      }

      // Handle clearing parent (empty string → NULL)
      if (newParentId === '' || newParentId === null) {
        data.parent_id = null;
      }
    }

    // Handle empty strings → NULL for optional FK fields
    if ('assignee_id' in data && (data.assignee_id === '' || data.assignee_id === null)) {
      data.assignee_id = null;
    }
    if ('team_id' in data && (data.team_id === '' || data.team_id === null)) {
      data.team_id = null;
    }

    // Build SET clause
    const validUpdates = Object.keys(data).filter(k => allowed.includes(k));
    const setClause = validUpdates.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = validUpdates.map(f => data[f]);

    await pool.query(
      `UPDATE tickets SET ${setClause}, updated_at = NOW() WHERE id = $1`,
      [id, ...values]
    );

    // Audit log
    for (const field of validUpdates) {
      await pool.query(`
        INSERT INTO ticket_history (ticket_id, field, new_value)
        VALUES ($1, $2, $3)
      `, [id, field, data[field] === null ? 'NULL' : String(data[field])]);
    }

    console.log('[TicketService] Updated ticket:', id, '→ fields:', validUpdates, '→ DB saved');
    return this.getById(id);
  },

  async move(id: string, newStatus: string, newPosition: number) {
    const old = await this.getById(id);
    await pool.query(`
      UPDATE tickets SET status = $1, position = $2, updated_at = NOW() WHERE id = $3
    `, [newStatus, newPosition, id]);

    await pool.query(`
      INSERT INTO ticket_history (ticket_id, field, old_value, new_value)
      VALUES ($1, 'status', $2, $3)
    `, [id, old?.status, newStatus]);

    console.log('[TicketService] Moved ticket:', id, old?.status, '→', newStatus, '→ DB saved');
    return this.getById(id);
  },

  async delete(id: string) {
    await pool.query(`DELETE FROM tickets WHERE id = $1`, [id]);
    console.log('[TicketService] Deleted ticket:', id, '(children cascade deleted)');
  },
};