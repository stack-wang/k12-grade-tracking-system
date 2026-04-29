from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Child, Parent
from dependencies import get_current_parent
from services.report_service import get_student_report, get_subject_trends, get_warnings, get_strength_weakness

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_child(parent: Parent, db: Session):
    return db.query(Child).filter(Child.parent_id == parent.id).first()


@router.get("/full")
def full_report(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    if not child:
        return {"error": "请先添加孩子信息"}
    return get_student_report(child.id, db)


@router.get("/trends")
def subject_trends(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    if not child:
        return {"error": "请先添加孩子信息"}
    return get_subject_trends(child.id, db)


@router.get("/warnings")
def subject_warnings(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    if not child:
        return {"error": "请先添加孩子信息"}
    return get_warnings(child.id, db)


@router.get("/strength-weakness")
def strength_weakness(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    if not child:
        return {"error": "请先添加孩子信息"}
    return get_strength_weakness(child.id, db)
