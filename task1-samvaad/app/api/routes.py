from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db import repository
from app.schemas.evaluation import EvaluationRequest, EvaluationResponse
from app.services.circuit_breaker import safe_grade
from app.services.remediation import check_remediation

router = APIRouter()

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(payload: EvaluationRequest, db: AsyncSession = Depends(get_db)):
    
    # 1. Save submission with pending status
    sub = await repository.create_submission(db, {
        "interview_id": payload.interview_id,
        "user_id": payload.user_id,
        "role": payload.role_config.role,
        "transcript": payload.transcript,
        "audio_duration": payload.audio_metadata.duration_seconds,
        "filler_word_count": payload.audio_metadata.filler_word_count,
        "status": "pending"
    })

    # 2. Try grading via circuit breaker
    result = await safe_grade(
        payload.transcript,
        payload.audio_metadata.filler_word_count
    )

    if result["status"] == "pending":
        # AI failed — return pending, don't crash
        return EvaluationResponse(
            submission_id=sub.id,
            status="pending",
            scores=None,
            flagged_modules=[],
            message="Evaluation queued. Results will be available shortly."
        )

    # 3. Save scores
    scores = result["scores"]
    await repository.save_scores(db, sub.id, {
        "knowledge_score": scores["knowledge"],
        "pacing_score": scores["pacing"],
        "filler_score": scores["filler_word_usage"],
    })

    # 4. Remediation
    thresholds = payload.role_config.thresholds.model_dump()
    flags = check_remediation(scores, thresholds)
    if flags:
        await repository.save_flags(db, sub.id, flags)

    # 5. Update submission status
    await repository.update_submission_status(db, sub.id, "graded")

    return EvaluationResponse(
        submission_id=sub.id,
        status="graded",
        scores=scores,
        flagged_modules=[f["module_name"] for f in flags],
        message="Evaluation complete."
    )
