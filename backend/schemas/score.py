from pydantic import BaseModel
from typing import Optional


class ScoreCreate(BaseModel):
    child_id: int
    subject_id: int
    exam_id: int
    score: float
    max_score: Optional[float] = 100
    notes: Optional[str] = ""


class BatchScoreUpdate(BaseModel):
    scores: list[ScoreCreate]
