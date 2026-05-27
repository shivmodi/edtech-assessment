# Code Guru (Task 2)

Asynchronous code execution engine built using Node.js, TypeScript, BullMQ, Redis, PostgreSQL, and Socket.io.

## Running Locally

### 1. Installation
Install all dependencies:
```bash
npm install
```

### 2. Configuration
Copy `.env` from root or use standard values:
```env
PORT=3001
DATABASE_URL=postgresql://admin:admin123@localhost:5432/edtech
REDIS_URL=redis://localhost:6379
```

### 3. Execution Servers

Open **two independent terminal instances**:

**Terminal A: Start Express & Socket.io Web Server**
```bash
npm run dev
```

**Terminal B: Start Background Queue Worker**
```bash
npm run worker
```

---

## Interacting with API

### 1. Queue Code Execution (cURL)
```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-445",
    "language": "javascript",
    "code": "const a = 10; const b = 20; console.log(a + b);"
  }'
```
Response:
```json
{"jobId":"d1b918db-2ebc-4ca7-a4bb-33f7d130a08e","status":"queued"}
```

### 2. Fetch Job Details (cURL)
```bash
curl http://localhost:3001/api/jobs/d1b918db-2ebc-4ca7-a4bb-33f7d130a08e
```

### 3. Timeout Safety Verification (Infinite Loop test)
```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-445",
    "language": "javascript",
    "code": "while(true){}"
  }'
```
*Note: The process automatically terminates after 5 seconds, returning `timeout`.*
# Code Guru — Distributed Code Execution Engine

Code Guru is a scalable distributed code execution engine supporting JavaScript and Python execution with concurrency handling, isolation, real-time updates, and fault tolerance.

---

# Features

- Concurrent code execution
- BullMQ + Redis queue system
- JavaScript execution
- Python execution
- Execution timeout protection
- Worker isolation
- Real-time execution updates
- PostgreSQL persistence
- Socket.io lifecycle events

---

# Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Queue | BullMQ |
| Realtime | Socket.io |
| Database | PostgreSQL |
| Cache / Queue Broker | Redis |
| Language | TypeScript |

---

# Folder Structure

```bash
task2-codeguru/
├── src/
│   ├── db/
│   ├── executors/
│   ├── queue/
│   ├── routes/
│   ├── socket/
│   └── index.ts
├── DESIGN.md
├── package.json
└── README.md
```

---

# Setup Instructions

## 1. Navigate to Project

```bash
cd task2-codeguru
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Redis + PostgreSQL

From monorepo root:

```bash
docker compose up -d
```

---

# Run Services

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

# API Endpoint

## POST `/api/execute`

### Request

```json
{
  "user_id": "user-123",
  "language": "javascript",
  "code": "console.log('Hello World')"
}
```

---

### Response

```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

---

# Supported Languages

- JavaScript
- Python

---

# Execution Lifecycle

```text
queued → running → success/error/timeout
```

---

# Features Implemented

## Queue-Based Concurrency

Execution requests are pushed into Redis-backed BullMQ queues.

---

## Worker Isolation

Each execution runs in isolated subprocesses.

---

## Timeout Protection

Infinite loops terminate automatically after 5 seconds.

---

## Real-Time Updates

Socket.io streams execution state changes.

---

# Test Examples

## Successful Execution

```javascript
console.log(2 + 2)
```

---

## Infinite Loop

```javascript
while(true){}
```

Expected:
- timeout after 5 seconds

---

## Python Error

```python
raise ValueError("test")
```

Expected:
- graceful failure
- worker survives

---

# Architecture Summary

```text
Client Request
      ↓
Express API
      ↓
BullMQ Queue
      ↓
Redis Broker
      ↓
Worker Process
      ↓
Isolated Execution
      ↓
Database Persistence
      ↓
Socket.io Update
```

---

# Author

Shiv Kumar Modi