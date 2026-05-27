# Collaborative Task Manager

A scalable Jira-inspired Kanban-based collaborative task management platform with real-time synchronization, drag-and-drop workflows, nested tasks, and Socket.io updates.

---

# Features

- Real-time Kanban board
- Drag-and-drop ticket movement
- Nested ticket hierarchy
- Ticket comments
- Team assignments
- Real-time synchronization
- Persistent ordering
- Responsive React UI
- Redux state management

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Express.js |
| Database | PostgreSQL |
| Realtime | Socket.io |
| State Management | Redux Toolkit |
| Drag & Drop | dnd-kit |
| Infrastructure | Docker |

---

# Project Structure

```bash
task3-taskmanager/
├── api/
├── ui/
├── DESIGN.md
└── README.md
```

---

# Backend Setup

## 1. Navigate to API

```bash
cd task3-taskmanager/api
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create Environment File

Create `.env`

```env
PORT=3002

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskmanager

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 4. Run Backend

```bash
npm run dev
```

Expected:

```bash
Task Manager API running on port 3002
```

---

# Frontend Setup

## 1. Navigate to UI

```bash
cd task3-taskmanager/ui
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Frontend

```bash
npm run dev
```

Frontend:

```bash
http://localhost:5173
```

---

# Start Shared Infrastructure

From monorepo root:

```bash
docker compose up -d
```

---

# Core Features

## Kanban Workflow

Columns:
- Backlog
- Todo
- In Progress
- Review
- Done

---

## Ticket Features

Each ticket supports:
- title
- description
- status
- priority
- assignee
- team tag
- comments
- parent-child relationships

---

## Real-Time Updates

Socket.io events:
- ticket:created
- ticket:updated
- ticket:moved
- ticket:deleted

---

# API Examples

## Create Ticket

### POST `/api/tickets`

```json
{
  "title": "Fix login issue",
  "description": "JWT token expires unexpectedly",
  "status": "todo",
  "priority": "high"
}
```

---

## Move Ticket

### PATCH `/api/tickets/:id/move`

```json
{
  "status": "in_progress",
  "position": 2
}
```

---

# Drag-and-Drop Flow

```text
User drags ticket
      ↓
Frontend updates state
      ↓
PATCH request sent
      ↓
Database updated
      ↓
Socket.io broadcasts update
      ↓
All users synchronize
```

---

# Scaling Considerations

- Fractional positioning system
- Optimistic UI updates
- Real-time synchronization
- PostgreSQL persistence
- Modular backend architecture

---

# Common Issues

## Backend Not Reachable

Ensure backend runs on:

```bash
http://localhost:3002
```

---

## Redis Connection Error

Run:

```bash
docker compose up -d
```

---

## Drag-and-Drop Not Working

Ensure:
- listeners applied
- attributes applied
- setNodeRef attached

---

# Author

Shiv Kumar Modi