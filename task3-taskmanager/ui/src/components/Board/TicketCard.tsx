import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Ticket } from '../../store/ticketsSlice';
import { MoreVertical, Trash2, Edit2, User, Users } from 'lucide-react';
import { useState, useRef } from 'react';
import { apiClient } from '../../api/client';
import { GripVertical } from 'lucide-react';
interface Props {
  ticket: Ticket;
  onRefresh: () => void;
  onOpenDetail: (ticket: Ticket) => void;
}

export default function TicketCard({ ticket, onRefresh, onOpenDetail }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1,
  };


  async function deleteTicket(e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${ticket.title}"?`)) return;
    try {
      await apiClient.delete(`/tickets/${ticket.id}`);
      console.log('[TicketCard] Deleted ticket', ticket.id);
      onRefresh();
    } catch (err) {
      console.error('[TicketCard] Delete failed:', err);
      alert('Failed to delete ticket');
    }
    setMenuOpen(false);
  }

  const priorityClass = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  }[ticket.priority] || 'badge-low';

  const date = new Date(ticket.created_at).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ticket-card${isDragging ? ' is-dragging' : ''}`}
      onClick={() => onOpenDetail(ticket)}
    >
      {ticket.priority === 'critical' && <div className="ticket-critical-bar" />}

      {/* Top row */}
      <div className="ticket-card-top">
        <div
          className="drag-handle"
          {...listeners}
          {...attributes}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <span className={`badge ${priorityClass}`}>{ticket.priority}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="date-chip">{date}</span>

          {/* Three-dot menu */}
          <div className="menu-wrap">
            <button
              className="btn-icon"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onOpenDetail(ticket); setMenuOpen(false); }}
                >
                  <Edit2 size={13} /> Open / Edit
                </button>
                <button
                  className="dropdown-item danger"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={deleteTicket}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="ticket-title" style={{ marginBottom: ticket.description ? 6 : 10 }}>
        {ticket.title}
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="ticket-desc">{ticket.description}</div>
      )}

      {/* Footer */}
      <div className="ticket-footer">
        <div className="ticket-meta">
          {ticket.assignee_name && (
            <div className="ticket-meta-row">
              <User size={11} color="var(--violet2)" />
              <span style={{ color: 'var(--text2)' }}>{ticket.assignee_name}</span>
            </div>
          )}
          {ticket.team_name && (
            <div className="ticket-meta-row">
              <Users size={11} />
              <span>{ticket.team_name}</span>
            </div>
          )}
        </div>

        {/* Indicators — click opens detail */}
        <div style={{ display: 'flex', gap: 4 }}>
          {ticket.comment_count > 0 && (
            <span className="comment-toggle">
              💬 {ticket.comment_count}
            </span>
          )}
          {ticket.children_count > 0 && (
            <span className="subtask-toggle">
              ⤷ {ticket.children_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}