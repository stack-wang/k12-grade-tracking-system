from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"))
    name = Column(String(50))
    gender = Column(String(10))
    grade = Column(String(20))
    school_name = Column(String(100))

    parent = relationship("Parent", backref="children")
