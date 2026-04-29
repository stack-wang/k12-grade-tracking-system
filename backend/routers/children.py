from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Child
from schemas.child import ChildCreate
from dependencies import get_current_parent
from models import Parent

router = APIRouter(prefix="/api/children", tags=["children"])


@router.get("")
def get_children(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    children = db.query(Child).filter(Child.parent_id == parent.id).all()
    return children


@router.post("")
def create_child(
    req: ChildCreate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    existing = db.query(Child).filter(Child.parent_id == parent.id).first()
    if existing:
        raise HTTPException(400, "已有一个孩子信息，如需修改请编辑")
    child = Child(**req.model_dump(), parent_id=parent.id)
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


@router.put("/{child_id}")
def update_child(
    child_id: int,
    req: ChildCreate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = (
        db.query(Child)
        .filter(Child.id == child_id, Child.parent_id == parent.id)
        .first()
    )
    if not child:
        raise HTTPException(404, "孩子信息不存在")
    for key, value in req.model_dump().items():
        setattr(child, key, value)
    db.commit()
    db.refresh(child)
    return child
