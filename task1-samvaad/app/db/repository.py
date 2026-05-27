from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Submission, Score, RemediationFlag

async def create_submission(db: AsyncSession, data: dict) -> Submission:
    sub = Submission(**data)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

async def update_submission_status(db: AsyncSession, submission_id: str, status: str):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = result.scalar_one()
    sub.status = status
    await db.commit()

async def save_scores(db: AsyncSession, submission_id: str, scores: dict):
    score = Score(submission_id=submission_id, **scores)
    db.add(score)
    await db.commit()

async def save_flags(db: AsyncSession, submission_id: str, flags: list[dict]):
    for flag in flags:
        f = RemediationFlag(submission_id=submission_id, **flag)
        db.add(f)
    await db.commit()
