from pydantic import BaseModel
from typing import Optional


class ChildCreate(BaseModel):
    name: str
    gender: Optional[str] = ""
    grade: Optional[str] = ""
    school_name: Optional[str] = ""


class ChildResponse(BaseModel):
    id: int
    name: str
    gender: str
    grade: str
    school_name: str

    class Config:
        from_attributes = True
