import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onCreated }: Props) {
    const [form, setForm] = useState({
        title: '', description: '', priority: 'medium', status: 'backlog',
        assignee_id: '', team_id: '', parent_id: '',
    });
    const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
    const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [parentValid, setParentValid] = useState<null | boolean>(null);
    const [parentTitle, setParentTitle] = useState('');
    const [checkingParent, setCheckingParent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({ title: '', description: '', priority: 'medium', status: 'backlog', assignee_id: '', team_id: '', parent_id: '' });
            setParentValid(null);
            setParentTitle('');
            loadMeta();
        }
    }, [isOpen]);

    async function loadMeta() {
        try {
            const [u, t] = await Promise.all([apiClient.get('/users'), apiClient.get('/teams')]);
            setUsers(u);
            setTeams(t);
        } catch (err) {
            console.error('[CreateModal] loadMeta failed:', err);
        }
    }

    // Validate parent ticket ID when user finishes typing
    async function validateParent(id: string) {
        if (!id.trim()) {
            setParentValid(null);
            setParentTitle('');
            return;
        }
        try {
            setCheckingParent(true);
            const ticket = await apiClient.get(`/tickets/${id.trim()}`);
            if (!ticket || !ticket.id) { setParentValid(false); return; }

            // GRANDPARENT CHECK: parent must not already be a child
            if (ticket.parent_id) {
                setParentValid(false);
                setParentTitle('');
                console.warn('[CreateModal] Rejected — parent is already a child ticket:', ticket.title);
                return;
            }

            setParentValid(true);
            setParentTitle(ticket.title);
            console.log('[CreateModal] Parent valid:', ticket.title);
        } catch {
            setParentValid(false);
            setParentTitle('');
        } finally {
            setCheckingParent(false);
        }
    }

    async function create() {
        // Block if parent id provided but invalid
        if (form.parent_id.trim() && parentValid === false) {
            alert('Parent ticket ID is invalid. Please enter a valid ticket ID or leave it empty.');
            return;
        }
        if (form.parent_id.trim() && parentValid === null) {
            alert('Please wait for parent ticket validation to complete.');
            return;
        }

        try {
            setSaving(true);
            const payload: Record<string, any> = {
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
            };
            if (form.assignee_id) payload.assignee_id = form.assignee_id;
            if (form.team_id) payload.team_id = form.team_id;
            if (form.parent_id.trim() && parentValid) payload.parent_id = form.parent_id.trim();

            console.log('[CreateModal] Creating ticket with payload:', payload);
            const ticket = await apiClient.post('/tickets', payload);
            console.log('[CreateModal] Created ticket', ticket.id, '→ DB saved');

            onCreated();
            onClose();
        } catch (err) {
            console.error('[CreateModal] Create failed:', err);
            alert('Failed to create ticket');
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">Create Ticket</span>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body">
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            className="form-control"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="What needs to be done?"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Add more detail..."
                            rows={3}
                        />
                    </div>

                    {/* Priority + Status */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-control" value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-control" value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="backlog">Backlog</option>
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee + Team */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Assignee</label>
                            <select className="form-control" value={form.assignee_id}
                                onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Team</label>
                            <select className="form-control" value={form.team_id}
                                onChange={e => setForm({ ...form, team_id: e.target.value })}>
                                <option value="">No Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Parent Ticket ID with validation */}
                    <div className="form-group">
                        <label className="form-label">
                            Parent Ticket ID
                            <span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 6, textTransform: 'none', fontWeight: 400 }}>
                                (optional — open a ticket to copy its ID)
                            </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-control"
                                value={form.parent_id}
                                onChange={e => {
                                    setForm({ ...form, parent_id: e.target.value });
                                    setParentValid(null);
                                    setParentTitle('');
                                }}
                                onBlur={e => validateParent(e.target.value)}
                                placeholder="e.g. 904e91fd-58bc-4e20-9115-a25ce28917dc"
                                style={{
                                    borderColor: parentValid === true
                                        ? 'var(--green)'
                                        : parentValid === false
                                            ? 'var(--red)'
                                            : undefined,
                                    paddingRight: 36,
                                }}
                            />
                            {/* Validation icon */}
                            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                                {checkingParent && <div className="spinner" style={{ width: 14, height: 14 }} />}
                                {!checkingParent && parentValid === true && <CheckCircle size={16} color="var(--green)" />}
                                {!checkingParent && parentValid === false && <AlertCircle size={16} color="var(--red)" />}
                            </div>
                        </div>

                        {/* Validation feedback */}
                        {parentValid === true && (
                            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <CheckCircle size={12} /> Parent: <strong>{parentTitle}</strong>
                            </div>
                        )}
                        {parentValid === false && (
                            <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <AlertCircle size={12} /> Ticket not found. Check the ID.
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={create}
                        disabled={saving || !form.title.trim() || (!!form.parent_id.trim() && parentValid !== true && parentValid !== null)}
                    >
                        {saving ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
}