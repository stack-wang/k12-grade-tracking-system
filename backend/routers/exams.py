from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Exam, Score
from schemas.exam import ExamCreate
from dependencies import get_current_parent
from models import Parent

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.get("")
def list_exams(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    exams = db.query(Exam).order_by(Exam.exam_date.desc()).all()
    return exams


@router.post("")
def create_exam(
    req: ExamCreate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    exam = Exam(**req.model_dump())
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@router.put("/{exam_id}")
def update_exam(
    exam_id: int,
    req: ExamCreate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(404, "考试不存在")
    for key, value in req.model_dump().items():
        setattr(exam, key, value)
    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/{exam_id}")
def delete_exam(
    exam_id: int,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(404, "考试不存在")
    db.delete(exam)
    db.commit()
    return {"message": "已删除"}
