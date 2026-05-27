import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDB } from './db/client';
import { initSocket } from './socket/events';
import executeRouter from './routes/execute';
import { config } from './config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected`);
  }

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

initSocket(io);

app.use('/api', executeRouter);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await initDB();
    httpServer.listen(config.PORT, () => {
      console.log(`Code Guru Engine running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
