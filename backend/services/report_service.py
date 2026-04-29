from sqlalchemy.orm import Session
from models import Score, Subject, Exam, Child
from collections import defaultdict


def calc_grade(percentage: float) -> str:
    if percentage >= 90: return "A"
    if percentage >= 80: return "B"
    if percentage >= 70: return "C"
    if percentage >= 60: return "D"
    return "F"


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
                    "grade": calc_grade(s.score / s.max_score * 100) if s.max_score else "F",
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
                    "grade": calc_grade(s.score / s.max_score * 100) if s.max_score else "F",
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


def get_warnings(child_id: int, db: Session):
    trends = get_subject_trends(child_id, db)
    warnings = []
    for t in trends:
        scores = t["trends"]
        if len(scores) < 2:
            continue
        latest = scores[-1]
        prev = scores[-2]
        drop = prev["percentage"] - latest["percentage"]
        if drop >= 5:
            warnings.append({
                "subject_name": t["subject_name"],
                "latest_exam": latest["exam_name"],
                "previous_exam": prev["exam_name"],
                "previous_percentage": prev["percentage"],
                "latest_percentage": latest["percentage"],
                "drop": round(drop, 1),
                "type": "drop",
            })
        elif len(scores) >= 3:
            prev2 = scores[-3]
            if prev["percentage"] < prev2["percentage"] and latest["percentage"] < prev["percentage"]:
                warnings.append({
                    "subject_name": t["subject_name"],
                    "latest_exam": latest["exam_name"],
                    "previous_exam": prev["exam_name"],
                    "previous_percentage": prev["percentage"],
                    "latest_percentage": latest["percentage"],
                    "drop": round(prev2["percentage"] - latest["percentage"], 1),
                    "type": "consecutive_drop",
                })
    return warnings


def get_strength_weakness(child_id: int, db: Session):
    scores = db.query(Score).filter(Score.child_id == child_id).all()
    subjects = {s.id: s.name for s in db.query(Subject).filter(Subject.child_id == child_id).all()}

    subject_avgs: dict = {}
    for s in scores:
        if s.subject_id not in subject_avgs:
            subject_avgs[s.subject_id] = {"total_pct": 0, "count": 0, "name": subjects.get(s.subject_id, "未知")}
        pct = s.score / s.max_score * 100 if s.max_score else 0
        subject_avgs[s.subject_id]["total_pct"] += pct
        subject_avgs[s.subject_id]["count"] += 1

    items = []
    for sid, data in subject_avgs.items():
        items.append({
            "subject_id": sid,
            "subject_name": data["name"],
            "average_percentage": round(data["total_pct"] / data["count"], 1) if data["count"] else 0,
            "score_count": data["count"],
        })

    items.sort(key=lambda x: x["average_percentage"], reverse=True)
    return {
        "strengths": items[:3],
        "weaknesses": list(reversed(items[-3:])),
        "all": items,
    }
