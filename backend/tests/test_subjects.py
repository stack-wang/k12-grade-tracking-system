def _create_child(client, auth_headers):
    client.post("/api/children/", json={
        "name": "小明", "gender": "男", "grade": "三年级", "school_name": "实验小学",
    }, headers=auth_headers)


def test_list_subjects_empty(client, auth_headers):
    _create_child(client, auth_headers)
    res = client.get("/api/subjects/", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_list_subjects_no_child(client, auth_headers):
    res = client.get("/api/subjects/", headers=auth_headers)
    assert res.status_code == 400
    assert "请先添加孩子信息" in res.json()["detail"]


def test_create_subject_success(client, auth_headers):
    _create_child(client, auth_headers)
    res = client.post("/api/subjects/", json={"name": "数学"}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "数学"
    assert "id" in data


def test_create_subject_no_child(client, auth_headers):
    res = client.post("/api/subjects/", json={"name": "数学"}, headers=auth_headers)
    assert res.status_code == 400


def test_delete_subject_success(client, auth_headers):
    _create_child(client, auth_headers)
    create_res = client.post("/api/subjects/", json={"name": "英语"}, headers=auth_headers)
    subject_id = create_res.json()["id"]

    res = client.delete(f"/api/subjects/{subject_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["message"] == "已删除"

    list_res = client.get("/api/subjects/", headers=auth_headers)
    assert list_res.json() == []


def test_delete_subject_not_found(client, auth_headers):
    _create_child(client, auth_headers)
    res = client.delete("/api/subjects/999", headers=auth_headers)
    assert res.status_code == 404
    assert "科目不存在" in res.json()["detail"]
