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
