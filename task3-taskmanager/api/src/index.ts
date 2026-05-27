import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import { runMigrations } from './db/migrations';
import { seedData } from './db/seed';
import ticketsRouter from './routes/tickets';
import commentsRouter from './routes/comments';
import usersRouter from './routes/users';
import teamsRouter from './routes/teams';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.set('io', io);

// ── Routes ──
app.use('/api/tickets', ticketsRouter);
app.use('/api/tickets/:ticketId/comments', commentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);

// ── Health check ──
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──
app.use((req, res) => {
  console.warn('[Server] 404:', req.method, req.path);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Socket.io ──
io.on('connection', (socket) => {
  socket.join('board');
  console.log('[Socket] Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected:', socket.id);
  });
});

// ── Start ──
async function start() {
  try {
    await runMigrations();
    await seedData();

    httpServer.listen(config.PORT, () => {
      console.log(`[Server] Task Manager API running on port ${config.PORT}`);
      console.log(`[Server] Health: http://localhost:${config.PORT}/health`);
      console.log(`[Server] Tickets: http://localhost:${config.PORT}/api/tickets`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();