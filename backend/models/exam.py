from sqlalchemy import Column, Integer, String, Date
from database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    exam_date = Column(Date)
    term = Column(String(20))
    year = Column(Integer)
