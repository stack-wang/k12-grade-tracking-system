from sqlalchemy.orm import Session
from models import Score, Subject, Exam, Child
from collections import defaultdict


def get_student_report(child_id: int, db: Session):
    scores = db.query(Score).filter(Score.child_id == child_id).all()
    subjects = db.query(Subject).filter(Subject.child_id == child_id).all()
    exams = db.query(Exam).order_by(Exam.exam_date).all()

    exam_map = {e.id: e for e in exams}
    subject_map = {s.id: s for s in subjects}

    all_scores_list = []
    for s in scores:
        exam = exam_map.get(s.exam_id)
        subject = subject_map.get(s.subject_id)
        if exam and subject:
            all_scores_list.append(
                {
                    "exam_id": s.exam_id,
                    "exam_name": exam.name,
                    "exam_date": str(exam.exam_date),
                    "term": exam.term,
                    "year": exam.year,
                    "subject_id": s.subject_id,
                    "subject_name": subject.name,
                    "score": s.score,
                    "max_score": s.max_score,
                    "percentage": round(s.score / s.max_score * 100, 1) if s.max_score else 0,
                }
            )

    return {
        "all_scores": all_scores_list,
        "subjects": [{"id": s.id, "name": s.name} for s in subjects],
        "exams": [
            {
                "id": e.id,
                "name": e.name,
                "date": str(e.exam_date),
                "term": e.term,
                "year": e.year,
            }
            for e in exams
        ],
    }


def get_subject_trends(child_id: int, db: Session):
    scores = db.query(Score).filter(Score.child_id == child_id).all()
    exams = {
        e.id: e for e in db.query(Exam).order_by(Exam.exam_date).all()
    }
    subjects = {
        s.id: s.name
        for s in db.query(Subject).filter(Subject.child_id == child_id).all()
    }

    trends = defaultdict(list)
    for s in scores:
        exam = exams.get(s.exam_id)
        if exam:
            trends[s.subject_id].append(
                {
                    "exam_id": exam.id,
                    "exam_name": exam.name,
                    "exam_date": str(exam.exam_date),
                    "score": s.score,
                    "max_score": s.max_score,
                    "percentage": round(s.score / s.max_score * 100, 1) if s.max_score else 0,
                }
            )

    result = []
    for subject_id, data in trends.items():
        data.sort(key=lambda x: x["exam_date"])
        result.append(
            {
                "subject_id": subject_id,
                "subject_name": subjects.get(subject_id, "未知"),
                "trends": data,
            }
        )
    return result
