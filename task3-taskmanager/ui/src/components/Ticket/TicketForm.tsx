import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets } from '../../store/ticketsSlice';
import { RootState } from '../../store';
import { apiClient } from '../../api/client';
import { PlusCircle, X, ShieldAlert, Sparkles, User, Tag } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function TicketForm({ onClose }: Props) {
  const dispatch = useDispatch();
  const existingTickets = useSelector((s: RootState) => s.tickets.items);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('backlog');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [parentId, setParentId] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users and teams
    apiClient.get('/users').then(setUsers).catch(console.error);
    apiClient.get('/teams').then(setTeams).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await apiClient.post('/tickets', {
        title,
        description: description || undefined,
        status,
        priority,
        assignee_id: assigneeId || undefined,
        team_id: teamId || undefined,
        parent_id: parentId || undefined,
      });

      // Reload tickets to fetch full items
      dispatch(fetchTickets({}) as any);
      onClose();
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  return (
    <div className="drawer-backdrop flex items-center justify-center p-4">
      <div 
        className="glass-panel w-full max-w-lg p-6 relative overflow-hidden"
        style={{ background: 'rgba(16, 12, 34, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div className="glow-ring" />
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5 relative z-10">
          <h3 className="text-white text-lg font-bold font-heading flex items-center gap-2">
            <PlusCircle size={20} className="text-violet-400" /> Create New Ticket
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 text-xs font-semibold">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Implement refresh tokens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 text-xs font-semibold">Description</label>
            <textarea
              placeholder="Write a clear explanation of this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-semibold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                <ShieldAlert size={12} /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="critical">⚡ Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                <User size={12} /> Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1">
                <Tag size={12} /> Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="">No Team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Nested Parent */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles size={12} /> Nest under Parent Ticket (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="glass-input cursor-pointer"
            >
              <option value="">No Parent (Primary Ticket)</option>
              {existingTickets.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-btn hover:bg-white/10"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn glass-btn-primary"
            >
              Add Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
