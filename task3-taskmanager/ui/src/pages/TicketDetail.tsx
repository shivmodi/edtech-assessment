import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTickets } from '../store/ticketsSlice';
import { apiClient } from '../api/client';
import CommentThread from '../components/Ticket/CommentThread';
import { X, Calendar, User, Tag, Sparkles, Trash2, ShieldAlert } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id?: string;
  assignee_name?: string;
  team_id?: string;
  team_name?: string;
  parent_id?: string;
  created_at: string;
}

interface Props {
  ticketId: string;
  onClose: () => void;
}

export default function TicketDetail({ ticketId, onClose }: Props) {
  const dispatch = useDispatch();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch single ticket details
    apiClient.get(`/tickets`)
      .then((tickets: Ticket[]) => {
        const found = tickets.find(t => t.id === ticketId);
        if (found) setTicket(found);
      })
      .catch(console.error);

    // Fetch children subtasks
    apiClient.get(`/tickets/${ticketId}/children`)
      .then(setChildren)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? All subtasks and comments will be deleted.')) return;
    try {
      await apiClient.delete(`/tickets/${ticketId}`);
      dispatch(fetchTickets({}) as any);
      onClose();
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  const formattedDate = ticket ? new Date(ticket.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  if (loading && !ticket) {
    return (
      <div className="drawer-backdrop" onClick={onClose}>
        <div className="drawer-content p-6 flex items-center justify-center text-slate-400">
          Loading ticket details...
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-content">
        <div className="glow-ring" />
        
        {/* Top Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <h2 className="text-white text-md font-bold font-heading uppercase tracking-wider text-xs text-violet-400">
            Ticket Details
          </h2>
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleDelete} 
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              title="Delete Ticket"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-grow overflow-y-auto flex flex-col gap-6 relative z-10">
          {/* Title */}
          <div>
            <h3 className="text-white font-bold text-xl leading-tight font-heading mb-2">{ticket.title}</h3>
            <div className="flex gap-2 text-slate-400 text-xs items-center">
              <Calendar size={12} /> Created {formattedDate}
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Priority</span>
              <span className={`self-start badge badge-${ticket.priority}`}>
                <ShieldAlert size={12} /> {ticket.priority}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Status</span>
              <span className="text-white text-sm font-medium capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" /> {ticket.status.replace('_', ' ')}
              </span>
            </div>

            {ticket.assignee_name && (
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs uppercase tracking-wider">Assignee</span>
                <span className="text-white text-sm font-medium flex items-center gap-1.5">
                  <User size={14} className="text-violet-400" /> {ticket.assignee_name}
                </span>
              </div>
            )}

            {ticket.team_name && (
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs uppercase tracking-wider">Team</span>
                <span className="text-white text-sm font-medium flex items-center gap-1.5">
                  <Tag size={14} className="text-violet-400" /> {ticket.team_name}
                </span>
              </div>
            )}
          </div>

          {/* Subtasks (Hierarchical Child Tickets) */}
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-violet-400" /> Subtask Checklist ({children.length})
            </h4>
            {children.length === 0 ? (
              <div className="text-slate-500 text-xs italic">No nested subtasks checklist created.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {children.map(child => (
                  <div key={child.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-slate-200 text-xs font-semibold">{child.title}</span>
                      {child.assignee_name && (
                        <span className="text-[10px] text-slate-500">Assignee: {child.assignee_name}</span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-white/5 ${
                      child.status === 'done' ? 'text-emerald-400 border border-emerald-400/25' : 'text-sky-400'
                    }`}>
                      {child.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment Thread activity logs */}
          <div className="border-t border-white/5 pt-4">
            <CommentThread ticketId={ticket.id} />
          </div>
        </div>
      </div>
    </>
  );
}
