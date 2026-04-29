from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Subject, Child
from schemas.subject import SubjectCreate
from dependencies import get_current_parent
from models import Parent

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


def get_child(parent: Parent, db: Session):
    child = db.query(Child).filter(Child.parent_id == parent.id).first()
    if not child:
        raise HTTPException(400, "请先添加孩子信息")
    return child


@router.get("")
def list_subjects(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    subjects = db.query(Subject).filter(Subject.child_id == child.id).all()
    return subjects


@router.post("")
def create_subject(
    req: SubjectCreate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    subject = Subject(name=req.name, child_id=child.id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    subject = (
        db.query(Subject)
        .filter(Subject.id == subject_id, Subject.child_id == child.id)
        .first()
    )
    if not subject:
        raise HTTPException(404, "科目不存在")
    db.delete(subject)
    db.commit()
    return {"message": "已删除"}
