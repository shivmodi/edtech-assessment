
# EdTech Assessment Monorepo

A production-oriented multi-service monorepo containing three independent systems built for scalability, resilience, concurrency handling, and real-time collaboration.

This repository contains:

1. **Task 1 — Samvaad Saathi**
   - AI-powered interview evaluation system using FastAPI and PostgreSQL.

2. **Task 2 — Code Guru Execution Engine**
   - Distributed code execution engine using BullMQ, Redis, and Socket.io.

3. **Task 3 — Collaborative Task Manager**
   - Real-time Kanban-style project management system using React + Express.

---

# Architecture Overview

| Task | Stack | Key Features |
|---|---|---|
| Task 1 | FastAPI + PostgreSQL | Async APIs, retry handling, AI grading simulation |
| Task 2 | Node.js + BullMQ + Redis | Queue system, worker isolation, code execution |
| Task 3 | React + Express + Socket.io | Real-time Kanban board, nested tasks |

---

# Monorepo Structure

```bash
edtech-assessment/
├── docker-compose.yml
├── README.md
├── task1-samvaad/
├── task2-codeguru/
└── task3-taskmanager/
```

---

# Minimum System Requirements

| Tool | Required Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| Python | v3.9+ |
| Docker Desktop | Latest |
| Git | Latest |

Recommended RAM: 8 GB+

Supported OS:
- Windows 10/11
- Linux
- macOS

---

# Verify Prerequisites

Run these commands before starting:

```bash
node -v
npm -v
python --version
docker --version
docker compose version
```

Expected:
- Node.js >= 18
- Python >= 3.9
- Docker installed and running

---

# Shared Infrastructure

All services share:

- PostgreSQL
- Redis

Start shared infrastructure once:

```bash
docker compose up -d
```

Verify running containers:

```bash
docker ps
```

Expected:
- postgres container running
- redis container running

Stop infrastructure:

```bash
docker compose down
```

Reset everything including DB volumes:

```bash
docker compose down -v
```

---

# Service Ports

| Service | Port |
|---|---|
| PostgreSQL | 5432 |
| Redis | 6379 |
| Task 1 FastAPI | 8000 |
| Task 2 Express API | 3001 |
| Task 3 Backend API | 3002 |
| Task 3 React UI | 5173 |

---

# TASK 1 — Samvaad Saathi

## Problem Statement

The platform evaluates mock interview submissions for candidates.

Challenges:
- AI grading may become slow or fail
- Large transcripts require async processing
- System should not crash if AI service fails
- Weak candidates should receive remediation suggestions

The system should:
- Accept interview submissions
- Simulate AI-based evaluation
- Retry on AI failure
- Store evaluation results
- Recommend practice modules dynamically

---

# Task 1 Approach

## Why This Approach?

This service uses:

### FastAPI Async Architecture
Handles concurrent requests efficiently using asynchronous APIs.

### Circuit Breaker Retry Mechanism
Retries grading if AI service fails temporarily instead of crashing the request.

### PostgreSQL Persistence
Stores submissions, scores, and remediation recommendations permanently.

### Modular Service Architecture
Separates grading, remediation, and database logic for maintainability.

This approach improves:
- scalability
- fault tolerance
- maintainability
- async performance

---

# Task 1 Features

- Async FastAPI APIs
- Simulated AI grading
- Retry + fallback handling
- Dynamic remediation engine
- PostgreSQL persistence
- Swagger documentation

---

# Task 1 Input Example

## POST `/api/v1/evaluate`

```json
{
  "interview_id": "int-9901",
  "user_id": "user-445",
  "role_config": {
    "role": "Customer Success",
    "thresholds": {
      "pacing": 6,
      "knowledge": 5
    }
  },
  "transcript": "Customer satisfaction is very important.",
  "audio_metadata": {
    "duration_seconds": 12,
    "filler_word_count": 3
  }
}
```

---

# Task 1 Expected Output

```json
{
  "submission_id": "uuid",
  "status": "graded",
  "scores": {
    "knowledge": 8.2,
    "pacing": 7.1,
    "filler_word_usage": 8.5
  },
  "flagged_modules": [],
  "message": "Evaluation complete."
}
```

---

# How To Run Task 1

## Step 1

```bash
cd task1-samvaad
```

---

## Step 2 — Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python -m venv venv
source venv/bin/activate
```

---

## Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Step 4 — Start FastAPI Server

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger Docs:

```bash
http://localhost:8000/docs
```

Health Check:

```bash
http://localhost:8000/health
```

# Task 1 Flow

```text
Client sends submission
        ↓
FastAPI receives request
        ↓
Validate request body
        ↓
Store submission in PostgreSQL
        ↓
Simulate async grading process
        ↓
Calculate score
        ↓
Compare score with role threshold
        ↓
Mark remedial_required = true/false
        ↓
Save final evaluation result
        ↓
Return response to client
```
---

# TASK 2 — Code Guru Execution Engine

## Problem Statement

The platform provides browser-based code execution.

Problems:
- Multiple concurrent users overload the server
- Infinite loops block execution
- One crashing program affects others
- No real-time execution status

The system should:
- Queue execution requests
- Isolate executions safely
- Enforce execution timeout
- Support concurrent execution
- Stream live execution updates

---

# Task 2 Approach

## Why This Approach?

This system uses:

### BullMQ + Redis Queue
Handles concurrent execution requests efficiently.

### Worker-Based Architecture
API server and execution workers are separated.

### Child Process Isolation
Each execution runs independently.

### Execution Timeout Protection
Infinite loops terminate automatically after 5 seconds.

### Socket.io Real-Time Events
Streams live execution status to users.

### PostgreSQL Persistence
Stores execution history and outputs.

This architecture improves:
- concurrency handling
- fault isolation
- scalability
- reliability

---

# Task 2 Architecture

## API Server

Handles:
- HTTP requests
- Queue submission
- Socket.io communication

---

## Worker Process

Continuously listens to Redis queue and:
- picks queued jobs
- executes code
- applies timeout protection
- stores execution results

Seeing this log is expected:

```bash
Worker started — listening for jobs...
```

The worker remains active continuously waiting for new jobs.

---

# Task 2 Features

- Redis-backed queue system
- Concurrent job handling
- JavaScript execution
- Python execution
- Timeout protection
- Error handling
- Real-time execution events
- Job persistence

---

# Task 2 Input Examples

## JavaScript Execution

### POST `/api/execute`

```json
{
  "user_id": "user-101",
  "language": "javascript",
  "code": "console.log(2+2)"
}
```

---

## Python Execution

```json
{
  "user_id": "user-101",
  "language": "python",
  "code": "print('Hello from Python')"
}
```

---

# Task 2 Expected Output

## Initial API Response

```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

---

## Final Stored Result

```json
{
  "status": "success",
  "output": "4"
}
```

---

# Task 2 Test Cases

## Successful Execution

```javascript
console.log(2 + 2)
```

Expected:
- success
- output = 4

---

## Timeout Protection

```javascript
while(true) {}
```

Expected:
- timeout after 5 seconds

---

## Error Handling

```python
raise ValueError("test")
```

Expected:
- error captured
- worker remains alive

---

# Task 2 Flow

```text
HTTP API receives execution request
        ↓
Job stored in PostgreSQL
        ↓
Job pushed into Redis queue
        ↓
BullMQ worker listens continuously
        ↓
Worker picks queued job
        ↓
Executor runs code in isolated process
        ↓
Timeout protection applied (5 sec)
        ↓
stdout / stderr captured
        ↓
Result saved in database
        ↓
Real-time status emitted via Socket.io
        ↓
Final result returned
```
# How To Run Task 2

## Step 1

```bash
cd task2-codeguru
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

---

## Terminal A — Start API Server

```bash
npm run dev
```

Expected:

```bash
Code Guru Engine running on port 3001
```

---

## Terminal B — Start Worker

```bash
npm run worker
```

Expected:

```bash
Worker started — listening for jobs...
```

---

# Test Task 2

## Submit Job

### PowerShell

```powershell
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3001/api/execute" `
  -ContentType "application/json" `
  -Body '{
    "user_id":"user-101",
    "language":"javascript",
    "code":"console.log(2+2)"
  }'
```

---

## Fetch Result

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3001/api/jobs/<JOB_ID>"
```

Expected:

```json
{
  "status": "success",
  "output": "4"
}
```

---
# TASK 3 — Collaborative Task Manager

## Minimum System Requirements

| Tool | Required Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| PostgreSQL | v14+ |
| Redis | v7+ |
| Docker Desktop | Latest |

Recommended:
- RAM: 8 GB+
- OS:
  - Windows 10/11
  - Linux
  - macOS

---

# Problem Statement

Modern teams require a collaborative task management platform where multiple users can:

- manage tasks visually
- track project progress
- organize workflows
- collaborate in real time

Traditional systems face several challenges:

- task ordering becomes inconsistent
- multiple users overwrite each other's changes
- drag-and-drop updates are difficult to synchronize
- nested subtasks become hard to manage
- UI state and backend state become unsynchronized

The system should support:

- Kanban workflow
- drag-and-drop ticket movement
- nested subtasks
- comments
- real-time synchronization
- concurrent multi-user collaboration
- persistent task ordering

---

# Task 3 Approach

## Why This Approach?

This project uses a modern real-time architecture designed for responsiveness and scalability.

---

## React + TypeScript Frontend

The frontend is built using React with TypeScript for:

- component-based architecture
- strong type safety
- scalable UI development
- maintainable codebase

---

## Express.js Backend

The backend API is built using Express.js to provide:

- lightweight REST APIs
- fast request handling
- modular route organization
- Socket.io integration

---

## Socket.io Real-Time Synchronization

Socket.io enables:

- instant updates across clients
- real-time ticket synchronization
- live board updates without refresh
- collaborative multi-user experience

Whenever:
- a ticket is created
- moved
- updated
- deleted

all connected users immediately receive updates.

---

## Drag-and-Drop with dnd-kit

The Kanban board uses:

- `@dnd-kit/core`
- `@dnd-kit/sortable`

Benefits:
- smooth drag interactions
- accessible drag system
- performant rendering
- modern React support

---

## PostgreSQL Persistence

All tasks are stored permanently in PostgreSQL including:

- task metadata
- ordering positions
- comments
- subtasks
- assignments

This ensures:
- persistence
- consistency
- recoverability

---

## Fractional Positioning System

Instead of reordering the entire column after every drag event, the system stores:

```text
position values
```

This allows:
- efficient drag-and-drop ordering
- reduced database writes
- scalable ordering logic

---

# Task 3 Features

- Real-time Kanban board
- Drag-and-drop task movement
- Nested subtasks
- Comment system
- Ticket assignments
- Team management
- Real-time synchronization
- Persistent ordering
- Responsive UI
- Redux state management
- Socket.io live events

---

# Task 3 Architecture

```text
React Frontend
       ↓
Redux Store manages UI state
       ↓
Drag-and-drop interactions using dnd-kit
       ↓
Express API receives updates
       ↓
PostgreSQL stores ticket changes
       ↓
Socket.io broadcasts updates
       ↓
All connected clients synchronize instantly
```

---

# Folder Structure

```bash
task3-taskmanager/
├── api/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── ui/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# Backend Setup

## Step 1 — Navigate To API

```bash
cd task3-taskmanager/api
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

---

## Step 3 — Configure Environment

Create `.env`

```env
PORT=3002

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskmanager

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Step 4 — Start Backend Server

```bash
npm run dev
```

Expected:

```bash
Task Manager API running on port 3002
```

---

# Frontend Setup

## Step 1 — Navigate To UI

```bash
cd task3-taskmanager/ui
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

---

## Step 3 — Start Frontend

```bash
npm run dev
```

Expected:

```bash
VITE vX.X ready in XXX ms
```

Frontend URL:

```bash
http://localhost:5173
```

---

# Docker Infrastructure

Start PostgreSQL + Redis:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected containers:
- postgres
- redis

Stop containers:

```bash
docker compose down
```

Reset everything:

```bash
docker compose down -v
```

---

# API Endpoints

## Create Ticket

### POST `/api/tickets`

```json
{
  "title": "Fix authentication issue",
  "description": "JWT token expires unexpectedly",
  "status": "todo",
  "priority": "high"
}
```

---

## Fetch Tickets

### GET `/api/tickets`

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

## Delete Ticket

### DELETE `/api/tickets/:id`

---

# Example Workflow

## Step 1 — Create Ticket

User creates:

```text
Implement drag and drop
```

Stored in PostgreSQL.

---

## Step 2 — Real-Time Broadcast

Backend emits:

```text
ticket:created
```

All connected users instantly receive the update.

---

## Step 3 — Drag Ticket

User drags ticket from:

```text
Todo → In Progress
```

Frontend sends:

```json
{
  "status": "in_progress",
  "position": 3
}
```

---

## Step 4 — Database Update

Backend updates:

- status
- ordering position

---

## Step 5 — Live Synchronization

Socket.io emits:

```text
ticket:moved
```

All clients update automatically.

---

# Drag-and-Drop Flow

```text
User drags ticket
        ↓
dnd-kit detects drag event
        ↓
handleDragEnd() triggered
        ↓
Redux updates local state
        ↓
PATCH request sent to backend
        ↓
Database updates ticket position
        ↓
Socket.io broadcasts update
        ↓
All clients synchronize instantly
```

---

# Redux State Management

Redux Toolkit manages:

- tickets
- loading state
- optimistic updates
- synchronization

Key reducers:

```text
ticketCreated
ticketUpdated
ticketMoved
ticketDeleted
```

---

# Real-Time Events

Socket.io events used:

| Event | Purpose |
|---|---|
| ticket:created | New ticket added |
| ticket:updated | Ticket edited |
| ticket:moved | Ticket moved |
| ticket:deleted | Ticket removed |

---

# Drag-and-Drop Implementation

The project uses:

```bash
@dnd-kit/core
@dnd-kit/utilities
```

Key concepts:

- `DndContext`
- `useDraggable`
- `useDroppable`
- `handleDragEnd`

This enables:
- column dropping
- ticket movement
- smooth UI updates

---

# Common Issues

## Drag-and-Drop Not Working

Ensure:
- `listeners` are applied
- `attributes` are applied
- `setNodeRef` is attached
- CSS does not block pointer events

Example:

```tsx
<div
  ref={setNodeRef}
  {...listeners}
  {...attributes}
>
```

---

## Redis Connection Error

Run:

```bash
docker compose up -d
```

---

## Port Already In Use

Kill existing process or change `.env` ports.

---

## Frontend Cannot Reach Backend

Ensure backend runs on:

```bash
http://localhost:3002
```

Verify frontend API base URL configuration.

---

# Health Check

Backend:

```bash
http://localhost:3002/health
```

Frontend:

```bash
http://localhost:5173
```

---

# Task 3 Flow Summary

```text
Client opens Kanban board
        ↓
Frontend fetches tickets
        ↓
Redux stores ticket state
        ↓
User drags ticket
        ↓
Optimistic UI update applied
        ↓
Backend persists change
        ↓
Socket.io broadcasts update
        ↓
All connected clients synchronize
```

---

# Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| State Management | Redux Toolkit |
| Drag & Drop | dnd-kit |
| Backend | Express.js |
| Database | PostgreSQL |
| Realtime | Socket.io |
| Cache / Queue | Redis |
| Infrastructure | Docker |

---

# Final Notes

- Start PostgreSQL and Redis before running services.
- Backend must run before frontend.
- Real-time updates require Socket.io connection.
- Drag-and-drop updates persist automatically.
- Multiple users can collaborate simultaneously.

---
---

# Common Issues

## Redis Connection Error

Ensure Docker containers are running:

```bash
docker ps
```

---

## PostgreSQL Connection Refused

Restart infrastructure:

```bash
docker compose down
docker compose up -d
```

---

## Python Not Found (Windows)

If you see:

```bash
Python was not found; run without arguments to install from Microsoft Store
```

Install Python from:

```bash
https://www.python.org/downloads/
```

During installation:
- enable "Add Python to PATH"

Verify installation:

```bash
python --version
```

---

## Port Already In Use

Kill existing processes or change ports in `.env`.

---

# Final Notes

- Start Docker infrastructure once before running tasks.
- Keep Redis and PostgreSQL containers running while testing.
- Task 2 requires BOTH:
  - API server
  - worker process

The worker continuously monitors Redis queue and executes jobs asynchronously.

---

# Tech Stack Summary

| Layer | Technologies |
|---|---|
| Backend APIs | FastAPI, Express.js |
| Frontend | React, TypeScript |
| Queue | BullMQ |
| Realtime | Socket.io |
| Database | PostgreSQL |
| Cache / Queue Backend | Redis |
| ORM / DB Layer | SQLAlchemy, pg |
| Infrastructure | Docker Compose |

---
````
