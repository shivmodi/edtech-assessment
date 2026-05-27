import { Worker } from 'bullmq';
import { redisConnection } from './jobQueue';
import { JavaScriptExecutor } from '../executors/javascript';
import { PythonExecutor } from '../executors/python';
import { jobRepository } from '../db/jobRepository';
import { emitToUser } from '../socket/events';
import { config } from '../config';
import { Executor } from '../executors/base';

const executors: Record<string, Executor> = {
  javascript: new JavaScriptExecutor(),
  python: new PythonExecutor(),
};

const worker = new Worker(
  'code-execution',
  async (job) => {
    const { jobId, userId, language, code } = job.data;

    // Update: running
    await jobRepository.updateStatus(jobId, 'running');
    emitToUser(userId, 'execution:status', { jobId, status: 'running' });

    const executor = executors[language];
    if (!executor) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const result = await executor.run(code, config.EXECUTION_TIMEOUT_MS);

    // Save result + emit to user
    await jobRepository.saveResult(jobId, result);
    emitToUser(userId, 'execution:status', {
      jobId,
      status: result.status,
      output: result.output,
      error: result.error,
      execution_time_ms: result.execution_time_ms,
    });
  },
  {
    connection: redisConnection,
    concurrency: config.WORKER_CONCURRENCY,
  }
);

worker.on('failed', async (job, err) => {
  if (job) {
    await jobRepository.updateStatus(job.data.jobId, 'failed');
    emitToUser(job.data.userId, 'execution:status', {
      jobId: job.data.jobId,
      status: 'failed',
      error: err.message,
    });
  }
});

console.log('Worker started — listening for jobs...');
