import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../config';

export const redisConnection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const executionQueue = new Queue('code-execution', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
