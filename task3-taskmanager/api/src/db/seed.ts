import { pool } from './client';

export async function seedData() {
  // Check if already seeded
  const check = await pool.query(`SELECT COUNT(*) FROM users`);
  if (parseInt(check.rows[0].count) > 0) {
    console.log('[Seed] Already seeded, skipping');
    return;
  }

  console.log('[Seed] Seeding users...');
  const users = await pool.query(`
    INSERT INTO users (name, email) VALUES
      ('Jane Doe',      'jane@edtech.com'),
      ('Alex Smith',    'alex@edtech.com'),
      ('Robert Taylor', 'robert@edtech.com'),
      ('Priya Sharma',  'priya@edtech.com')
    RETURNING id, name
  `);
  console.log('[Seed] Users created:', users.rows.map(u => u.name));

  console.log('[Seed] Seeding teams...');
  const teams = await pool.query(`
    INSERT INTO teams (name) VALUES
      ('Backend Team'),
      ('Frontend Team'),
      ('QA Team'),
      ('DevOps Team')
    RETURNING id, name
  `);
  console.log('[Seed] Teams created:', teams.rows.map(t => t.name));

  const [jane, alex, robert, priya] = users.rows;
  const [backend, frontend, qa, devops] = teams.rows;

  // Team members
  await pool.query(`
    INSERT INTO team_members (user_id, team_id) VALUES
      ($1, $2), ($3, $4), ($5, $6), ($7, $8)
  `, [alex.id, backend.id, robert.id, qa.id, jane.id, frontend.id, priya.id, devops.id]);

  console.log('[Seed] Seeding tickets...');
  const tickets = await pool.query(`
    INSERT INTO tickets (title, description, status, priority, assignee_id, team_id, position) VALUES
      (
        'Implement OAuth Authentication',
        'Setup Google and Github OAuth strategies, configure JWT token lifecycles, and implement secure token refresh middleware.',
        'backlog', 'high', $1, $2, 1.0
      ),
      (
        'Write E2E Integration Suite',
        'Develop complete automated end-to-end user path simulation suites validating Kanban boards sync and ticket creation paths.',
        'todo', 'medium', $3, $4, 1.0
      ),
      (
        'Optimize PG Connection Pools',
        'Analyze query execution plans, create necessary indexing, and tune client connection limits for handling massive concurrent load spikes.',
        'in_progress', 'low', $1, $2, 1.0
      ),
      (
        'Design Glassmorphism Dashboard UI',
        'Build a modern, highly aesthetic dark-themed glassmorphism interface featuring smooth gradients, blur backdrop filters, glowing borders, and elegant hover animations.',
        'review', 'critical', $5, $6, 1.0
      ),
      (
        'Setup CI/CD Pipeline',
        'Configure GitHub Actions workflow for automated testing, building, and deployment to EC2 with rollback support.',
        'done', 'high', $7, $8, 1.0
      )
    RETURNING id, title
  `, [alex.id, backend.id, robert.id, qa.id, jane.id, frontend.id, priya.id, devops.id]);

  console.log('[Seed] Tickets created:', tickets.rows.map(t => t.title));

  // Seed a child ticket under first ticket
  const parentId = tickets.rows[0].id;
  await pool.query(`
    INSERT INTO tickets (title, description, status, priority, assignee_id, team_id, parent_id, position)
    VALUES (
      'OAuth: Setup Google Provider',
      'Configure Google OAuth2 client ID and secret, handle callback URLs.',
      'backlog', 'medium', $1, $2, $3, 1.0
    )
  `, [alex.id, backend.id, parentId]);

  console.log('[Seed] Child ticket created under:', tickets.rows[0].title);

  // Seed a comment
  await pool.query(`
    INSERT INTO comments (ticket_id, author_id, body)
    VALUES ($1, $2, 'This needs to be completed before the demo next week.')
  `, [tickets.rows[1].id, robert.id]);

  console.log('[Seed] Comments seeded ✓');
  console.log('[Seed] All done ✓');
}