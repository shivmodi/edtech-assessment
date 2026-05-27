# Samvaad Saathi (Task 1)

This service manages transcription evaluations, speech filler detection, and adaptive course recommendations.

## Quick Start

### 1. Requirements Setup
Make sure Python 3.9+ is installed.
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Database Environment Setup
Make sure the root PostgreSQL docker is running (`docker compose up -d`).
Configure the database link in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://admin:admin123@localhost:5432/edtech
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Swagger interactive UI: `http://localhost:8000/docs`
- Healthcheck URL: `http://localhost:8000/health`

### 4. Interactive Test (cURL)
```bash
curl -X POST http://localhost:8000/api/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "interview_id": "int-101",
    "user_id": "user-202",
    "role_config": {
      "role": "Software Engineer",
      "thresholds": {
        "pacing": 7,
        "knowledge": 8
      }
    },
    "transcript": "Well, I think microservices are good, um, because they scale, but you know, they add complexity.",
    "audio_metadata": {
      "duration_seconds": 60,
      "filler_word_count": 8
    }
  }'
```
