import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { ticketCreated, ticketUpdated, ticketMoved, ticketDeleted } from '../store/ticketsSlice';

export function useSocket() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io('http://localhost:3002');

    socket.on('connect', () => console.log('[Socket] Connected'));
    socket.on('disconnect', () => console.log('[Socket] Disconnected'));

    socket.on('ticket:created', (t) => dispatch(ticketCreated(t)));
    socket.on('ticket:updated', (t) => dispatch(ticketUpdated(t)));
    socket.on('ticket:moved', (t) => dispatch(ticketMoved(t)));
    socket.on('ticket:deleted', (t) => dispatch(ticketDeleted(t)));

    return () => { socket.disconnect(); };
  }, [dispatch]);
}