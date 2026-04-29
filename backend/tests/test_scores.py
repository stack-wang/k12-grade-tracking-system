def _setup(client, auth_headers):
    client.post("/api/children/", json={
        "name": "小明", "gender": "男", "grade": "三年级", "school_name": "实验小学",
    }, headers=auth_headers)
    sub_res = client.post("/api/subjects/", json={"name": "数学"}, headers=auth_headers)
    sub = sub_res.json()
    exam_res = client.post("/api/exams/", json={
        "name": "期中考试", "exam_date": "2024-11-15",
        "term": "上学期", "year": 2024,
    }, headers=auth_headers)
    exam = exam_res.json()
    return sub, exam


def test_get_scores_empty(client, auth_headers):
    sub, exam = _setup(client, auth_headers)
    res = client.get("/api/scores/", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_batch_save_scores(client, auth_headers):
    sub, exam = _setup(client, auth_headers)
    child_res = client.get("/api/children/", headers=auth_headers)
    child_id = child_res.json()[0]["id"]

    res = client.post("/api/scores/batch", json={
        "scores": [
            {
                "child_id": child_id,
                "subject_id": sub["id"],
                "exam_id": exam["id"],
                "score": 95,
                "max_score": 100,
            }
        ]
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "保存成功"
    assert data["count"] == 1

    get_res = client.get("/api/scores/", headers=auth_headers)
    scores = get_res.json()
    assert len(scores) == 1
    assert scores[0]["score"] == 95
    assert scores[0]["max_score"] == 100
    assert scores[0]["subject_name"] == "数学"
    assert scores[0]["exam_name"] == "期中考试"


def test_batch_save_update_existing(client, auth_headers):
    sub, exam = _setup(client, auth_headers)
    child_res = client.get("/api/children/", headers=auth_headers)
    child_id = child_res.json()[0]["id"]

    client.post("/api/scores/batch", json={
        "scores": [{"child_id": child_id, "subject_id": sub["id"], "exam_id": exam["id"], "score": 80, "max_score": 100}]
    }, headers=auth_headers)

    res = client.post("/api/scores/batch", json={
        "scores": [{"child_id": child_id, "subject_id": sub["id"], "exam_id": exam["id"], "score": 90, "max_score": 100}]
    }, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["count"] == 1

    get_res = client.get("/api/scores/", headers=auth_headers)
    assert get_res.json()[0]["score"] == 90


def test_get_scores_filtered_by_exam(client, auth_headers):
    sub, exam = _setup(client, auth_headers)
    child_res = client.get("/api/children/", headers=auth_headers)
    child_id = child_res.json()[0]["id"]

    exam2_res = client.post("/api/exams/", json={
        "name": "期末考试", "exam_date": "2025-01-20",
        "term": "上学期", "year": 2025,
    }, headers=auth_headers)
    exam2 = exam2_res.json()

    client.post("/api/scores/batch", json={
        "scores": [{"child_id": child_id, "subject_id": sub["id"], "exam_id": exam["id"], "score": 85, "max_score": 100}]
    }, headers=auth_headers)
    client.post("/api/scores/batch", json={
        "scores": [{"child_id": child_id, "subject_id": sub["id"], "exam_id": exam2["id"], "score": 92, "max_score": 100}]
    }, headers=auth_headers)

    res = client.get(f"/api/scores/?exam_id={exam['id']}", headers=auth_headers)
    scores = res.json()
    assert len(scores) == 1
    assert scores[0]["score"] == 85


def test_delete_score(client, auth_headers):
    sub, exam = _setup(client, auth_headers)
    child_res = client.get("/api/children/", headers=auth_headers)
    child_id = child_res.json()[0]["id"]

    client.post("/api/scores/batch", json={
        "scores": [{"child_id": child_id, "subject_id": sub["id"], "exam_id": exam["id"], "score": 88, "max_score": 100}]
    }, headers=auth_headers)

    get_res = client.get("/api/scores/", headers=auth_headers)
    score_id = get_res.json()[0]["id"]

    del_res = client.delete(f"/api/scores/{score_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "已删除"

    get_res2 = client.get("/api/scores/", headers=auth_headers)
    assert get_res2.json() == []


def test_delete_score_not_found(client, auth_headers):
    _setup(client, auth_headers)
    res = client.delete("/api/scores/999", headers=auth_headers)
    assert res.status_code == 404
    assert "成绩不存在" in res.json()["detail"]
