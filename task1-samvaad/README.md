# Samvaad Saathi — AI Interview Evaluation Engine

Samvaad Saathi is a resilient AI-powered mock interview evaluation system designed for low-bandwidth environments and scalable asynchronous processing.

The service evaluates interview transcripts, simulates AI grading, applies remediation logic, and persists evaluation results.

---

# Features

- Async FastAPI architecture
- Simulated AI grading engine
- Retry + circuit breaker handling
- Dynamic remediation recommendations
- PostgreSQL persistence
- Swagger API documentation
- Fault-tolerant grading flow

---

# Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy Async |
| Validation | Pydantic V2 |
| Runtime | Python 3.9+ |

---

# Folder Structure

```bash
task1-samvaad/
├── app/
│   ├── api/
│   ├── db/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── DESIGN.md
├── requirements.txt
└── README.md
```

---

# Setup Instructions

## 1. Navigate to Project

```bash
cd task1-samvaad
```

---

## 2. Create Virtual Environment

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

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Start PostgreSQL

Ensure PostgreSQL is running.

If using Docker from monorepo root:

```bash
docker compose up -d
```

---

## 5. Run FastAPI Server

```bash
uvicorn app.main:app --reload --port 8000
```

---

# API Documentation

Swagger UI:

```bash
http://localhost:8000/docs
```

Health Check:

```bash
http://localhost:8000/health
```

---

# API Endpoint

## POST `/api/v1/evaluate`

### Request

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
  "transcript": "Customer satisfaction is important.",
  "audio_metadata": {
    "duration_seconds": 12,
    "filler_word_count": 3
  }
}
```

---

### Response

```json
{
  "submission_id": "uuid",
  "status": "graded",
  "scores": {
    "knowledge": 8.1,
    "pacing": 7.2,
    "filler_word_usage": 6.9
  },
  "flagged_modules": [],
  "message": "Evaluation complete."
}
```

---

# Key Design Decisions

- Async FastAPI for concurrent request handling
- Simulated AI latency and failures
- Circuit breaker for resilience
- Modular service architecture
- PostgreSQL persistence layer

---

# Failure Handling

The grading engine:
- introduces 2-second artificial latency
- has 10% simulated failure probability
- retries failed requests
- returns graceful fallback responses

---

# Run Tests

```bash
pytest
```

---

# Author

Shiv Kumar Modi