import { useState, useEffect } from 'react';
import { X, User, Users, Calendar, Link2, Copy, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Ticket } from '../../store/ticketsSlice';
import { apiClient } from '../../api/client';
import CommentThread from './CommentThread';

interface Props {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function TicketDetailPanel({ ticket, isOpen, onClose, onSaved }: Props) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', priority: 'medium',
        status: 'backlog', assignee_id: '', team_id: '', parent_id: '',
    });
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<Ticket | null>(null);
    const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
    const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [parentInfo, setParentInfo] = useState<{ id: string; title: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Parent ID edit validation
    const [parentValidating, setParentValidating] = useState(false);
    const [parentValid, setParentValid] = useState<null | boolean>(null);
    const [parentValidTitle, setParentValidTitle] = useState('');

    useEffect(() => {
        if (ticket && isOpen) {
            setForm({
                title: ticket.title,
                description: ticket.description || '',
                priority: ticket.priority,
                status: ticket.status,
                assignee_id: ticket.assignee_id || '',
                team_id: ticket.team_id || '',
                parent_id: ticket.parent_id || '',
            });
            setEditing(false);
            setError('');
            setParentValid(null);
            setParentValidTitle('');
            setSelectedChild(null);
            loadChildren(ticket.id);
            loadMeta();
            if (ticket.parent_id) loadParent(ticket.parent_id);
            else setParentInfo(null);
        }
    }, [ticket, isOpen]);

    async function loadChildren(id: string) {
        try {
            const data = await apiClient.get(`/tickets/${id}/children`);
            setChildren(data);
            console.log('[Detail] Loaded', data.length, 'children for', id);
        } catch (err) {
            console.error('[Detail] loadChildren failed:', err);
        }
    }

    async function loadMeta() {
        try {
            const [u, t] = await Promise.all([apiClient.get('/users'), apiClient.get('/teams')]);
            setUsers(u);
            setTeams(t);
        } catch (err) {
            console.error('[Detail] loadMeta failed:', err);
        }
    }

    async function loadParent(parentId: string) {
        try {
            const p = await apiClient.get(`/tickets/${parentId}`);
            setParentInfo({ id: p.id, title: p.title });
        } catch {
            setParentInfo(null);
        }
    }

    async function validateParentId(id: string) {
        if (!id.trim()) {
            setParentValid(null);
            setParentValidTitle('');
            return;
        }
        try {
            setParentValidating(true);
            const p = await apiClient.get(`/tickets/${id.trim()}`);
            if (!p) { setParentValid(false); return; }

            // Check: parent itself should not already be a child
            if (p.parent_id) {
                setParentValid(false);
                setParentValidTitle('');
                setError(`"${p.title}" is already a child ticket. Grandparent not allowed.`);
                return;
            }

            setParentValid(true);
            setParentValidTitle(p.title);
            setError('');
        } catch {
            setParentValid(false);
            setParentValidTitle('');
        } finally {
            setParentValidating(false);
        }
    }

    async function save() {
        if (!ticket) return;
        setError('');

        // Validate parent_id if changed
        if (form.parent_id && form.parent_id !== ticket.parent_id && parentValid !== true) {
            setError('Please enter a valid parent ticket ID (or clear it).');
            return;
        }

        try {
            setSaving(true);
            const payload: Record<string, any> = {
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
                assignee_id: form.assignee_id || null,  // empty → NULL
                team_id: form.team_id || null,
            };

            // parent_id — only include if ticket has no children
            if (children.length === 0) {
                payload.parent_id = form.parent_id || null;
            }

            const updated = await apiClient.patch(`/tickets/${ticket.id}`, payload);
            console.log('[Detail] Saved ticket', ticket.id, '→ DB saved');
            setEditing(false);
            onSaved();
            // Reload parent info if changed
            if (payload.parent_id) loadParent(payload.parent_id);
            else setParentInfo(null);
        } catch (err: any) {
            const msg = err.message || 'Failed to save';
            // Parse backend error codes
            if (msg.includes('HAS_CHILDREN')) setError('Cannot assign parent: this ticket has child tickets.');
            else if (msg.includes('GRANDPARENT')) setError('Selected parent is already a child ticket. Only 1 level allowed.');
            else if (msg.includes('PARENT_NOT_FOUND')) setError('Parent ticket not found.');
            else if (msg.includes('SELF_PARENT')) setError('A ticket cannot be its own parent.');
            else setError(msg);
            console.error('[Detail] Save failed:', msg);
        } finally {
            setSaving(false);
        }
    }

    function copyId() {
        if (!ticket) return;
        navigator.clipboard.writeText(ticket.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (!isOpen || !ticket) return null;

    // Show child ticket detail
    if (selectedChild) {
        return (
            <TicketDetailPanel
                ticket={selectedChild}
                isOpen={true}
                onClose={() => setSelectedChild(null)}
                onSaved={onSaved}
            />
        );
    }

    const priorityColor: Record<string, string> = {
        critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--blue)', low: 'var(--green)',
    };

    const statusLabel: Record<string, string> = {
        backlog: 'Backlog', todo: 'Todo', in_progress: 'In Progress', review: 'Review', done: 'Done',
    };

    const ticketHasChildren = children.length > 0;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                {/* ── Header ── */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span
                            className="badge"
                            style={{
                                background: `${priorityColor[ticket.priority]}22`,
                                color: priorityColor[ticket.priority],
                                border: `1px solid ${priorityColor[ticket.priority]}44`,
                            }}
                        >
                            {ticket.priority}
                        </span>

                        {/* Full Ticket ID with copy */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--bg3)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '3px 8px',
                        }}>
                            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>
                                {ticket.id}
                            </span>
                            <button
                                onClick={copyId}
                                className="btn-icon"
                                style={{ width: 20, height: 20 }}
                                title="Copy ticket ID"
                            >
                                {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {!editing && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                                ✏️ Edit
                            </button>
                        )}
                        <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

                    {/* Error banner */}
                    {error && (
                        <div style={{
                            background: 'rgba(240,79,90,0.1)', border: '1px solid rgba(240,79,90,0.3)',
                            borderRadius: 'var(--radius)', padding: '8px 12px', marginBottom: 16,
                            display: 'flex', gap: 8, alignItems: 'center',
                            fontSize: 13, color: 'var(--red)',
                        }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Parent ticket banner */}
                    {parentInfo && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--bg3)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '6px 10px', marginBottom: 16,
                            fontSize: 12, color: 'var(--text2)',
                        }}>
                            <Link2 size={12} color="var(--violet2)" />
                            <span>Parent:</span>
                            <span style={{ color: 'var(--violet2)', fontWeight: 500 }}>{parentInfo.title}</span>
                            <span style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: 10 }}>
                                ({parentInfo.id})
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <div className="form-group" style={{ marginBottom: 16 }}>
                        {editing ? (
                            <>
                                <label className="form-label">Title *</label>
                                <input
                                    className="form-control"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </>
                        ) : (
                            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                                {ticket.title}
                            </h2>
                        )}
                    </div>

                    {/* Meta grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
                        background: 'var(--bg3)', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)', padding: 14,
                    }}>
                        {/* Status */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6 }}>Status</div>
                            {editing ? (
                                <select className="form-control" value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <option value="backlog">Backlog</option>
                                    <option value="todo">Todo</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            ) : (
                                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                                    {statusLabel[ticket.status]}
                                </span>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6 }}>Priority</div>
                            {editing ? (
                                <select className="form-control" value={form.priority}
                                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            ) : (
                                <span style={{ fontSize: 13, color: priorityColor[ticket.priority], fontWeight: 500 }}>
                                    {ticket.priority}
                                </span>
                            )}
                        </div>

                        {/* Assignee */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <User size={11} /> Assignee
                            </div>
                            {editing ? (
                                <select className="form-control" value={form.assignee_id}
                                    onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                                    <option value="">Unassigned</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            ) : (
                                <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                                    {ticket.assignee_name || 'Unassigned'}
                                </span>
                            )}
                        </div>

                        {/* Team */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <Users size={11} /> Team
                            </div>
                            {editing ? (
                                <select className="form-control" value={form.team_id}
                                    onChange={e => setForm({ ...form, team_id: e.target.value })}>
                                    <option value="">No Team</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            ) : (
                                <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                                    {ticket.team_name || 'No Team'}
                                </span>
                            )}
                        </div>

                        {/* Created */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <Calendar size={11} /> Created
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
                                {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </span>
                        </div>

                        {/* Parent ID — full UUID always visible */}
                        <div>
                            <div className="form-label" style={{ marginBottom: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                                <Link2 size={11} /> Parent ID
                            </div>

                            {/* VIEW mode */}
                            {!editing && (
                                <div style={{ fontSize: 11, color: ticket.parent_id ? 'var(--violet2)' : 'var(--text3)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {ticket.parent_id || 'None (root ticket)'}
                                </div>
                            )}

                            {/* EDIT mode */}
                            {editing && (
                                <>
                                    {ticketHasChildren ? (
                                        <div style={{ fontSize: 12, color: 'var(--amber)', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                                            <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                            Cannot change parent — this ticket has {children.length} child ticket(s).
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    className="form-control"
                                                    value={form.parent_id}
                                                    onChange={e => {
                                                        setForm({ ...form, parent_id: e.target.value });
                                                        setParentValid(null);
                                                        setParentValidTitle('');
                                                        setError('');
                                                    }}
                                                    onBlur={e => validateParentId(e.target.value)}
                                                    placeholder="Paste ticket UUID or leave empty"
                                                    style={{
                                                        fontSize: 11, fontFamily: 'monospace',
                                                        borderColor: parentValid === true
                                                            ? 'var(--green)'
                                                            : parentValid === false
                                                                ? 'var(--red)'
                                                                : undefined,
                                                        paddingRight: 30,
                                                    }}
                                                />
                                                <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                                                    {parentValidating && <div className="spinner" style={{ width: 12, height: 12 }} />}
                                                    {!parentValidating && parentValid === true && <CheckCircle size={14} color="var(--green)" />}
                                                    {!parentValidating && parentValid === false && <AlertCircle size={14} color="var(--red)" />}
                                                </div>
                                            </div>
                                            {parentValid === true && (
                                                <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>
                                                    ✓ {parentValidTitle}
                                                </div>
                                            )}
                                            {parentValid === false && form.parent_id && (
                                                <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>
                                                    ✗ Ticket not found or is already a child
                                                </div>
                                            )}
                                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
                                                Leave empty to remove parent
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 20 }}>
                        <div className="form-label" style={{ marginBottom: 8 }}>Description</div>
                        {editing ? (
                            <textarea
                                className="form-control"
                                rows={4}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the task..."
                            />
                        ) : (
                            <div style={{
                                background: 'var(--bg3)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: 12,
                                fontSize: 13, color: ticket.description ? 'var(--text2)' : 'var(--text3)',
                                lineHeight: 1.6, minHeight: 60,
                            }}>
                                {ticket.description || 'No description added.'}
                            </div>
                        )}
                    </div>

                    {/* Edit actions */}
                    {editing && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            <button className="btn btn-ghost" onClick={() => { setEditing(false); setError(''); }}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={save}
                                disabled={saving || !form.title.trim()}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {/* Child tickets */}
                    {children.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div className="form-label" style={{ marginBottom: 10 }}>
                                Subtasks ({children.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {children.map(child => (
                                    <div
                                        key={child.id}
                                        onClick={() => setSelectedChild(child as Ticket)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            background: 'var(--bg3)', border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)', padding: '8px 12px',
                                            cursor: 'pointer', transition: 'border-color 0.15s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--violet)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                    >
                                        <span className={`badge badge-${child.priority}`} style={{ fontSize: 9 }}>
                                            {child.priority}
                                        </span>
                                        <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{child.title}</span>
                                        {child.assignee_name && (
                                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{child.assignee_name}</span>
                                        )}
                                        <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg)', padding: '2px 6px', borderRadius: 20 }}>
                                            {child.status.replace('_', ' ')}
                                        </span>
                                        <span style={{ color: 'var(--text3)' }}>→</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 20px' }} />

                    {/* Comments */}
                    <div>
                        <div className="form-label" style={{ marginBottom: 12 }}>
                            Comments ({ticket.comment_count})
                        </div>
                        <CommentThread ticketId={ticket.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}