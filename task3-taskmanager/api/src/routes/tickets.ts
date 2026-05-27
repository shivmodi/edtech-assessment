import { Router, RequestHandler } from 'express';
import { ticketService } from '../services/ticketService';

const router = Router();

const getAll: RequestHandler = async (req, res) => {
  try {
    const tickets = await ticketService.getAll(req.query as Record<string, string>);
    res.json(tickets);
  } catch (err: any) {
    console.error('[Route] GET /tickets:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getChildren: RequestHandler = async (req, res) => {
  try {
    const children = await ticketService.getChildren(req.params.id);
    res.json(children);
  } catch (err: any) {
    console.error('[Route] GET /tickets/:id/children:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getOne: RequestHandler = async (req, res) => {
  try {
    const ticket = await ticketService.getById(req.params.id);
    if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }
    res.json(ticket);
  } catch (err: any) {
    console.error('[Route] GET /tickets/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const create: RequestHandler = async (req, res) => {
  try {
    if (!req.body.title?.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const ticket = await ticketService.create(req.body);
    req.app.get('io')?.emit('ticket:created', ticket);
    console.log('[Route] POST /tickets → created', ticket.id);
    res.status(201).json(ticket);
  } catch (err: any) {
    console.error('[Route] POST /tickets error:', err.message);
    // Send validation errors clearly to frontend
    const status = err.message.startsWith('GRANDPARENT') || err.message.startsWith('PARENT') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
};

const update: RequestHandler = async (req, res) => {
  try {
    const ticket = await ticketService.update(req.params.id, req.body);
    req.app.get('io')?.emit('ticket:updated', ticket);
    console.log('[Route] PATCH /tickets/:id → updated', req.params.id);
    res.json(ticket);
  } catch (err: any) {
    console.error('[Route] PATCH /tickets/:id error:', err.message);
    const status = err.message.startsWith('GRANDPARENT') || err.message.startsWith('HAS_CHILDREN') || err.message.startsWith('PARENT') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
};

const move: RequestHandler = async (req, res) => {
  try {
    const { status, position } = req.body;
    if (!status) { res.status(400).json({ error: 'status required' }); return; }
    const ticket = await ticketService.move(req.params.id, status, parseFloat(position) || 1);
    req.app.get('io')?.emit('ticket:moved', ticket);
    res.json(ticket);
  } catch (err: any) {
    console.error('[Route] PATCH /tickets/:id/move error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    await ticketService.delete(req.params.id);
    req.app.get('io')?.emit('ticket:deleted', { id: req.params.id });
    res.status(204).end();
  } catch (err: any) {
    console.error('[Route] DELETE /tickets/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

router.get('/', getAll);
router.get('/:id/children', getChildren);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id/move', move);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;