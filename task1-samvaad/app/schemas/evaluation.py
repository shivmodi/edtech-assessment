from pydantic import BaseModel
from typing import Optional, List

class Thresholds(BaseModel):
    pacing: int
    knowledge: int

class RoleConfig(BaseModel):
    role: str
    thresholds: Thresholds

class AudioMetadata(BaseModel):
    duration_seconds: int
    filler_word_count: int

class EvaluationRequest(BaseModel):
    interview_id: str
    user_id: str
    role_config: RoleConfig
    transcript: str
    audio_metadata: AudioMetadata

class ScoreResult(BaseModel):
    knowledge: float
    pacing: float
    filler_word_usage: float

class EvaluationResponse(BaseModel):
    submission_id: str
    status: str                        # graded | pending | failed
    scores: Optional[ScoreResult] = None
    flagged_modules: List[str]
    message: str
