import { Router, Request, Response, RequestHandler } from 'express';
import { executionQueue } from '../queue/jobQueue';
import { jobRepository } from '../db/jobRepository';

const router = Router();

const executeHandler: RequestHandler = async (req, res): Promise<void> => {
  const { user_id, language, code } = req.body;

  if (!user_id || !language || !code) {
    res.status(400).json({ error: 'user_id, language, and code are required' });
    return;
  }

  if (!['javascript', 'python'].includes(language)) {
    res.status(400).json({ error: 'Unsupported language. Use javascript or python.' });
    return;
  }

  // Save job to DB
  const job = await jobRepository.create({ user_id, language, code });

  // Push to queue
  await executionQueue.add('run', {
    jobId: job.id,
    userId: user_id,
    language,
    code,
  });

  // Emit queued status via Socket.io
  const io = req.app.get('io');
  io?.to(`user:${user_id}`).emit('execution:status', {
    jobId: job.id,
    status: 'queued',
  });

  res.json({ jobId: job.id, status: 'queued' });
};

const getJobHandler: RequestHandler = async (req, res): Promise<void> => {
  const job = await jobRepository.findById(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
};

router.post('/execute', executeHandler);
router.get('/jobs/:id', getJobHandler);

export default router;
