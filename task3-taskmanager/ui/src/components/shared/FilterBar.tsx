import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTickets } from '../../store/ticketsSlice';
import { Search, SlidersHorizontal } from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FilterBar() {
  const dispatch = useDispatch();
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [u, t] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/teams'),
        ]);
        setUsers(u);
        setTeams(t);
      } catch (err) {
        console.error('[FilterBar] Failed to load meta:', err);
      }
    }
    loadMeta();
  }, []);

  function applyFilters() {
    const filters: Record<string, string> = {};
    if (priority) filters.priority = priority;
    if (assigneeId) filters.assignee_id = assigneeId;
    if (teamId) filters.team_id = teamId;
    if (search) filters.search = search;
    console.log('[FilterBar] Applying filters:', filters);
    dispatch(fetchTickets(filters) as any);
  }

  function clearFilters() {
    setPriority(''); setAssigneeId(''); setTeamId(''); setSearch('');
    dispatch(fetchTickets({}) as any);
  }

  const hasFilters = !!(priority || assigneeId || teamId || search);

  return (
    <div className="toolbar">
      {/* Search */}
      <div className="search-wrap">
        <Search size={14} />
        <input
          className="search-input"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Priority */}
      <select
        className="filter-select"
        value={priority}
        onChange={e => setPriority(e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Assignee */}
      <select
        className="filter-select"
        value={assigneeId}
        onChange={e => setAssigneeId(e.target.value)}
      >
        <option value="">All Assignees</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>

      {/* Team */}
      <select
        className="filter-select"
        value={teamId}
        onChange={e => setTeamId(e.target.value)}
      >
        <option value="">All Teams</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {/* Buttons */}
      <button className="btn btn-ghost" onClick={applyFilters}>
        <SlidersHorizontal size={14} /> Apply
      </button>

      {hasFilters && (
        <button className="btn btn-ghost" onClick={clearFilters}>
          Clear
        </button>
      )}
    </div>
  );
}