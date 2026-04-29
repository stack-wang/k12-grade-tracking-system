def test_list_exams_empty(client, auth_headers):
    res = client.get("/api/exams/", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_create_exam(client, auth_headers):
    res = client.post("/api/exams/", json={
        "name": "期中考试",
        "exam_date": "2024-11-15",
        "term": "上学期",
        "year": 2024,
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "期中考试"
    assert data["exam_date"] == "2024-11-15"
    assert data["term"] == "上学期"
    assert data["year"] == 2024
    assert "id" in data


def test_update_exam(client, auth_headers):
    create_res = client.post("/api/exams/", json={
        "name": "期中考试",
        "exam_date": "2024-11-15",
        "term": "上学期",
        "year": 2024,
    }, headers=auth_headers)
    exam_id = create_res.json()["id"]

    res = client.put(f"/api/exams/{exam_id}", json={
        "name": "期末考试",
        "exam_date": "2025-01-20",
        "term": "上学期",
        "year": 2025,
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "期末考试"
    assert data["exam_date"] == "2025-01-20"


def test_update_exam_not_found(client, auth_headers):
    res = client.put("/api/exams/999", json={
        "name": "不存在",
        "exam_date": "2024-01-01",
        "term": "上学期",
        "year": 2024,
    }, headers=auth_headers)
    assert res.status_code == 404
    assert "考试不存在" in res.json()["detail"]


def test_delete_exam(client, auth_headers):
    create_res = client.post("/api/exams/", json={
        "name": "月考",
        "exam_date": "2024-10-01",
        "term": "上学期",
        "year": 2024,
    }, headers=auth_headers)
    exam_id = create_res.json()["id"]

    res = client.delete(f"/api/exams/{exam_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["message"] == "已删除"

    list_res = client.get("/api/exams/", headers=auth_headers)
    assert list_res.json() == []


def test_delete_exam_not_found(client, auth_headers):
    res = client.delete("/api/exams/999", headers=auth_headers)
    assert res.status_code == 404
    assert "考试不存在" in res.json()["detail"]


def test_exams_ordered_by_date_desc(client, auth_headers):
    client.post("/api/exams/", json={
        "name": "第一次月考",
        "exam_date": "2024-03-01",
        "term": "下学期", "year": 2024,
    }, headers=auth_headers)
    client.post("/api/exams/", json={
        "name": "期中考试",
        "exam_date": "2024-04-15",
        "term": "下学期", "year": 2024,
    }, headers=auth_headers)
    client.post("/api/exams/", json={
        "name": "期末考试",
        "exam_date": "2024-06-30",
        "term": "下学期", "year": 2024,
    }, headers=auth_headers)

    res = client.get("/api/exams/", headers=auth_headers)
    data = res.json()
    assert len(data) == 3
    assert data[0]["name"] == "期末考试"
    assert data[2]["name"] == "第一次月考"
