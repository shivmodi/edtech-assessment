import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTickets } from '../store/ticketsSlice';
import { Ticket } from '../store/ticketsSlice';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/Board/KanbanBoard';
import FilterBar from '../components/shared/FilterBar';
import CreateTicketModal from '../components/Ticket/CreateTicketModal';
import TicketDetailPanel from '../components/Ticket/TicketDetailPanel';
import { Plus } from 'lucide-react';

export default function BoardPage() {
  useSocket();
  const dispatch = useDispatch();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function refresh() {
    dispatch(fetchTickets({}) as any);
  }

  function openDetail(ticket: Ticket) {
    setDetailTicket(ticket);
    setDetailOpen(true);
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="dot" />
          Agile Board
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Create Ticket
          </button>
        </div>
      </header>

      {/* Filters */}
      <FilterBar />

      {/* Board */}
      <div className="board-wrapper">
        <KanbanBoard onRefresh={refresh} onOpenDetail={openDetail} />
      </div>

      {/* Create Modal */}
      <CreateTicketModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); refresh(); }}
      />

      {/* Detail Panel */}
      <TicketDetailPanel
        ticket={detailTicket}
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailTicket(null); }}
        onSaved={() => { refresh(); }}
      />
    </div>
  );
}