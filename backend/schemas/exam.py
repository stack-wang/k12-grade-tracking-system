from pydantic import BaseModel
from datetime import date
from typing import Optional


class ExamCreate(BaseModel):
    name: str
    exam_date: date
    term: Optional[str] = ""
    year: Optional[int] = None


class ExamResponse(BaseModel):
    id: int
    name: str
    exam_date: date
    term: str
    year: int

    class Config:
        from_attributes = True
