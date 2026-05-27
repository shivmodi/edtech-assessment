import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';

import { fetchTickets, ticketMoved, Ticket } from '../../store/ticketsSlice';
import { closestCorners } from '@dnd-kit/core';
import { apiClient } from '../../api/client';
import Column from './Column';

import { store } from '../../store';

type RS = ReturnType<typeof store.getState>;

const COLUMNS = ['backlog', 'todo', 'in_progress', 'review', 'done'];

interface Props {
  onRefresh?: () => void;
  onOpenDetail: (ticket: Ticket) => void;
}

export default function KanbanBoard({ onRefresh, onOpenDetail }: Props) {
  const dispatch = useDispatch();
  const tickets = useSelector((s: RS) => s.tickets.items);
  const loading = useSelector((s: RS) => s.tickets.loading);

  const refresh = useCallback(() => {
    dispatch(fetchTickets({}) as any);
    onRefresh?.();
  }, [dispatch, onRefresh]);

  useEffect(() => { refresh(); }, []);

  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = tickets
      .filter(t => t.status === col && !t.parent_id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {} as Record<string, Ticket[]>);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log('ACTIVE:', active.id);
    console.log('OVER:', over?.id);
    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const colTickets = byStatus[newStatus] || [];
    const newPosition = colTickets.length > 0
      ? Math.max(...colTickets.map(t => t.position || 0)) + 1
      : 1;

    dispatch(ticketMoved({ ...ticket, status: newStatus, position: newPosition }));

    try {
      await apiClient.patch(`/tickets/${ticketId}/move`, {
        status: newStatus, position: newPosition,
      });
      console.log('[Board] Moved', ticketId, '→', newStatus, '→ DB saved');
    } catch (err) {
      console.error('[Board] Move failed, rolling back');
      refresh();
    }
  }

  if (loading) return (
    <div className="empty-board">
      <div className="spinner" style={{ width: 24, height: 24 }} />
    </div>
  );

  return (
    <DndContext collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}>
      <div className="board">
        {COLUMNS.map(col => (
          <Column
            key={col}
            id={col}
            tickets={byStatus[col] || []}
            onRefresh={refresh}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </DndContext>
  );
}