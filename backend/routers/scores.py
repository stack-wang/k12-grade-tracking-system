from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Score, Subject, Exam, Child
from schemas.score import ScoreCreate, BatchScoreUpdate
from dependencies import get_current_parent
from models import Parent

router = APIRouter(prefix="/api/scores", tags=["scores"])


def get_child(parent: Parent, db: Session):
    child = db.query(Child).filter(Child.parent_id == parent.id).first()
    if not child:
        raise HTTPException(400, "请先添加孩子信息")
    return child


@router.get("")
def get_scores(
    exam_id: int = None,
    subject_id: int = None,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    query = db.query(Score).filter(Score.child_id == child.id)
    if exam_id:
        query = query.filter(Score.exam_id == exam_id)
    if subject_id:
        query = query.filter(Score.subject_id == subject_id)
    scores = query.all()
    result = []
    for s in scores:
        result.append(
            {
                "id": s.id,
                "child_id": s.child_id,
                "subject_id": s.subject_id,
                "exam_id": s.exam_id,
                "score": s.score,
                "max_score": s.max_score,
                "notes": s.notes,
                "subject_name": s.subject.name if s.subject else "",
                "exam_name": s.exam.name if s.exam else "",
                "exam_date": str(s.exam.exam_date) if s.exam else "",
            }
        )
    return result


@router.post("/batch")
def batch_save(
    req: BatchScoreUpdate,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    saved = []
    for sc in req.scores:
        existing = (
            db.query(Score)
            .filter(
                Score.child_id == child.id,
                Score.subject_id == sc.subject_id,
                Score.exam_id == sc.exam_id,
            )
            .first()
        )
        if existing:
            existing.score = sc.score
            existing.max_score = sc.max_score or 100
            existing.notes = sc.notes or ""
            saved.append(existing)
        else:
            new_score = Score(
                child_id=child.id,
                subject_id=sc.subject_id,
                exam_id=sc.exam_id,
                score=sc.score,
                max_score=sc.max_score or 100,
                notes=sc.notes or "",
            )
            db.add(new_score)
            saved.append(new_score)
    db.commit()
    for s in saved:
        db.refresh(s)
    return {"message": "保存成功", "count": len(saved)}


@router.delete("/{score_id}")
def delete_score(
    score_id: int,
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = get_child(parent, db)
    score = (
        db.query(Score)
        .filter(Score.id == score_id, Score.child_id == child.id)
        .first()
    )
    if not score:
        raise HTTPException(404, "成绩不存在")
    db.delete(score)
    db.commit()
    return {"message": "已删除"}
