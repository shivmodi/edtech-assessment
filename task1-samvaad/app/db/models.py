import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Submission(Base):
    __tablename__ = "submissions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    transcript: Mapped[str] = mapped_column(Text, nullable=False)
    audio_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    filler_word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    scores: Mapped[list["Score"]] = relationship(back_populates="submission", cascade="all, delete-orphan")
    flags: Mapped[list["RemediationFlag"]] = relationship(back_populates="submission", cascade="all, delete-orphan")

class Score(Base):
    __tablename__ = "scores"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    knowledge_score: Mapped[float] = mapped_column(Float, nullable=False)
    pacing_score: Mapped[float] = mapped_column(Float, nullable=False)
    filler_score: Mapped[float] = mapped_column(Float, nullable=False)
    graded_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    submission: Mapped["Submission"] = relationship(back_populates="scores")

class RemediationFlag(Base):
    __tablename__ = "remediation_flags"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id: Mapped[str] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False)
    module_name: Mapped[str] = mapped_column(String, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    flagged_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    submission: Mapped["Submission"] = relationship(back_populates="flags")
