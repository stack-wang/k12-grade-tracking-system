from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    name = Column(String(50))
