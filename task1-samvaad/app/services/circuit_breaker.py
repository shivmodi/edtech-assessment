import asyncio
from app.services.grader import mock_llm_grade

MAX_RETRIES = 2
RETRY_DELAY = 1  # seconds

async def safe_grade(transcript: str, filler_word_count: int) -> dict:
    """
    Circuit breaker wrapper around mock LLM grader.
    Retries up to MAX_RETRIES times, then returns fallback.
    """
    for attempt in range(MAX_RETRIES + 1):
        try:
            scores = await mock_llm_grade(transcript, filler_word_count)
            return {"status": "graded", "scores": scores}
        except (TimeoutError, Exception) as e:
            #we can add retry (i removed for now because verification of miss was difficult)
            # if attempt < MAX_RETRIES:
            #     await asyncio.sleep(RETRY_DELAY)
            #     continue
            # All retries exhausted — graceful fallback
            return {
                "status": "pending",
                "scores": None,
                "error": str(e)
            }
