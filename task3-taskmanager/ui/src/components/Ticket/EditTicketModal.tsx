import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ticket } from '../../store/ticketsSlice';
import { apiClient } from '../../api/client';

interface Props {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export default function EditTicketModal({ ticket, isOpen, onClose, onSaved }: Props) {
    const [form, setForm] = useState({
        title: '', description: '', priority: 'medium', status: 'backlog',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (ticket && isOpen) {
            setForm({
                title: ticket.title,
                description: ticket.description || '',
                priority: ticket.priority,
                status: ticket.status,
            });
        }
    }, [ticket, isOpen]);

    if (!isOpen || !ticket) return null;

    async function save() {
        try {
            setSaving(true);
            console.log('[EditModal] Saving ticket', ticket.id, form);
            const updated = await apiClient.patch(`/tickets/${ticket.id}`, form);
            console.log('[EditModal] Saved successfully', updated);
            onSaved();
            onClose();
        } catch (err) {
            console.error('[EditModal] Save failed:', err);
            alert('Failed to save ticket');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">Edit Ticket</span>
                    <button className="btn-icon" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            className="form-control"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Ticket title"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the task..."
                            rows={4}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-control"
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-control"
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="backlog">Backlog</option>
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}