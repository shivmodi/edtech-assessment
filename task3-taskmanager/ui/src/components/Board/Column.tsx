import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard';
import { Ticket } from '../../store/ticketsSlice';

const DOT_CLASSES: Record<string, string> = {
  backlog: 'dot-backlog',
  todo: 'dot-todo',
  in_progress: 'dot-progress',
  review: 'dot-review',
  done: 'dot-done',
};

const LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

interface Props {
  id: string;
  tickets: Ticket[];
  onRefresh: () => void;
  onOpenDetail: (ticket: Ticket) => void;
}

export default function Column({ id, tickets, onRefresh, onOpenDetail }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`column${isOver ? ' is-over' : ''}`}>
      <div className="column-header">
        <div className={`column-dot ${DOT_CLASSES[id] || 'dot-backlog'}`} />
        <span className="column-title">{LABELS[id] || id}</span>
        <span className="column-count">{tickets.length}</span>
      </div>

      <div className="column-body">
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onRefresh={onRefresh}
            onOpenDetail={onOpenDetail}
          />
        ))}
        {tickets.length === 0 && !isOver && (
          <div className="column-empty">Drop here</div>
        )}
      </div>
    </div>
  );
}