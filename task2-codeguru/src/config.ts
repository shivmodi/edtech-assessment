import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/edtech',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  EXECUTION_TIMEOUT_MS: 5000,
  WORKER_CONCURRENCY: 10,
};
