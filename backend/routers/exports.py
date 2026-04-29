import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Score, Subject, Exam, Child, Parent
from dependencies import get_current_parent

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.get("/csv")
def export_csv(
    parent: Parent = Depends(get_current_parent),
    db: Session = Depends(get_db),
):
    child = db.query(Child).filter(Child.parent_id == parent.id).first()
    if not child:
        return {"error": "请先添加孩子信息"}

    scores = (
        db.query(Score)
        .filter(Score.child_id == child.id)
        .all()
    )
    subjects = {s.id: s.name for s in db.query(Subject).filter(Subject.child_id == child.id).all()}
    exams = {e.id: e for e in db.query(Exam).all()}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["考试名称", "考试日期", "科目", "得分", "满分", "百分比", "等级"])

    for s in scores:
        exam = exams.get(s.exam_id)
        subject_name = subjects.get(s.subject_id, "未知")
        if exam:
            pct = round(s.score / s.max_score * 100, 1) if s.max_score else 0
            grade = "A" if pct >= 90 else "B" if pct >= 80 else "C" if pct >= 70 else "D" if pct >= 60 else "F"
            writer.writerow([
                exam.name,
                str(exam.exam_date),
                subject_name,
                s.score,
                s.max_score,
                f"{pct}%",
                grade,
            ])

    output.seek(0)
    filename = f"{child.name}_成绩表.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
