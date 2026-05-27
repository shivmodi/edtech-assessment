import { pool } from './client';

export async function runMigrations() {
  console.log('[Migrations] Running...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name  VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('[Migrations] users ✓');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('[Migrations] teams ✓');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, team_id)
    );
  `);
  console.log('[Migrations] team_members ✓');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(500) NOT NULL,
      description TEXT,
      status      VARCHAR(50)  DEFAULT 'backlog'
                  CHECK (status IN ('backlog','todo','in_progress','review','done')),
      priority    VARCHAR(50)  DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','critical')),
      assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
      team_id     UUID REFERENCES teams(id) ON DELETE SET NULL,
      parent_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
      position    FLOAT        DEFAULT 0,
      created_at  TIMESTAMP    DEFAULT NOW(),
      updated_at  TIMESTAMP    DEFAULT NOW()
    );
  `);
  console.log('[Migrations] tickets ✓');

  // Indexes for fast filtering
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_status     ON tickets(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_priority   ON tickets(priority);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_team       ON tickets(team_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_assignee   ON tickets(assignee_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tickets_parent     ON tickets(parent_id);`);
  console.log('[Migrations] indexes ✓');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      body      TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('[Migrations] comments ✓');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_history (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
      changed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
      field       VARCHAR(100),
      old_value   TEXT,
      new_value   TEXT,
      changed_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('[Migrations] ticket_history ✓');

  console.log('[Migrations] All done ✓');
}