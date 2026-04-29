def _setup_full(client, auth_headers):
    client.post("/api/children/", json={
        "name": "小明", "gender": "男", "grade": "三年级", "school_name": "实验小学",
    }, headers=auth_headers)
    sub1 = client.post("/api/subjects/", json={"name": "数学"}, headers=auth_headers).json()
    sub2 = client.post("/api/subjects/", json={"name": "语文"}, headers=auth_headers).json()
    exam = client.post("/api/exams/", json={
        "name": "期中考试", "exam_date": "2024-11-15",
        "term": "上学期", "year": 2024,
    }, headers=auth_headers).json()
    child_res = client.get("/api/children/", headers=auth_headers)
    child_id = child_res.json()[0]["id"]

    client.post("/api/scores/batch", json={
        "scores": [
            {"child_id": child_id, "subject_id": sub1["id"], "exam_id": exam["id"], "score": 90, "max_score": 100},
            {"child_id": child_id, "subject_id": sub2["id"], "exam_id": exam["id"], "score": 85, "max_score": 100},
        ]
    }, headers=auth_headers)
    return sub1, sub2, exam


def test_full_report_no_child(client, auth_headers):
    res = client.get("/api/reports/full", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["error"] == "请先添加孩子信息"


def test_full_report_with_data(client, auth_headers):
    _setup_full(client, auth_headers)
    res = client.get("/api/reports/full", headers=auth_headers)
    data = res.json()
    assert "all_scores" in data
    assert "subjects" in data
    assert "exams" in data
    assert len(data["all_scores"]) == 2
    assert len(data["subjects"]) == 2
    assert len(data["exams"]) == 1

    score_math = next(s for s in data["all_scores"] if s["subject_name"] == "数学")
    assert score_math["score"] == 90
    assert score_math["percentage"] == 90.0

    score_chinese = next(s for s in data["all_scores"] if s["subject_name"] == "语文")
    assert score_chinese["score"] == 85
    assert score_chinese["percentage"] == 85.0


def test_trends_no_child(client, auth_headers):
    res = client.get("/api/reports/trends", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["error"] == "请先添加孩子信息"


def test_trends_with_data(client, auth_headers):
    _setup_full(client, auth_headers)
    res = client.get("/api/reports/trends", headers=auth_headers)
    data = res.json()
    assert len(data) == 2

    math_trend = next(t for t in data if t["subject_name"] == "数学")
    assert len(math_trend["trends"]) == 1
    assert math_trend["trends"][0]["percentage"] == 90.0

    chinese_trend = next(t for t in data if t["subject_name"] == "语文")
    assert len(chinese_trend["trends"]) == 1
    assert chinese_trend["trends"][0]["percentage"] == 85.0
