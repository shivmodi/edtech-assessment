import asyncio
import random

async def mock_llm_grade(transcript: str, filler_word_count: int) -> dict:
    """
    Simulates LLM call:
    - 2 second artificial delay
    - 10% chance of timeout/failure
    """
    await asyncio.sleep(2)  # simulate network latency

    if random.random() < 0.10:
        raise TimeoutError("AI grading service timed out")

    # Simulate scoring based on content length and filler words
    base_knowledge = random.uniform(4, 10)
    base_pacing = max(1, 10 - (filler_word_count * 0.5) + random.uniform(-1, 1))
    filler_score = max(1, 10 - filler_word_count + random.uniform(-0.5, 0.5))

    return {
        "knowledge": round(base_knowledge, 1),
        "pacing": round(base_pacing, 1),
        "filler_word_usage": round(filler_score, 1),
    }
