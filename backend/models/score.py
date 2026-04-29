from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))
    score = Column(Float)
    max_score = Column(Float, default=100)
    notes = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject = relationship("Subject")
    exam = relationship("Exam")
