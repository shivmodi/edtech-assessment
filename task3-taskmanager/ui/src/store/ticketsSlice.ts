import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  assignee_name: string | null;
  team_id: string | null;
  team_name: string | null;
  parent_id: string | null;
  position: number;
  comment_count: number;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface TicketsState {
  items: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = `http://localhost:3002/api/tickets${params ? '?' + params : ''}`;
    console.log('[Store] Fetching tickets:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    const data = await res.json();
    console.log('[Store] Fetched', data.length, 'tickets');
    return data as Ticket[];
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets(state, action: PayloadAction<Ticket[]>) {
      state.items = action.payload;
    },
    ticketCreated(state, action: PayloadAction<Ticket>) {
      state.items.unshift(action.payload);
      console.log('[Store] ticket:created', action.payload.id);
    },
    ticketUpdated(state, action: PayloadAction<Ticket>) {
      const idx = state.items.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      console.log('[Store] ticket:updated', action.payload.id);
    },
    ticketMoved(state, action: PayloadAction<Ticket>) {
      const idx = state.items.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      console.log('[Store] ticket:moved', action.payload.id, '→', action.payload.status);
    },
    ticketDeleted(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter(t => t.id !== action.payload.id);
      console.log('[Store] ticket:deleted', action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
        console.error('[Store] fetchTickets failed:', action.error.message);
      });
  },
});

export const { setTickets, ticketCreated, ticketUpdated, ticketMoved, ticketDeleted } = ticketsSlice.actions;
export default ticketsSlice.reducer;