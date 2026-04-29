def test_get_children_empty(client, auth_headers):
    res = client.get("/api/children/", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []


def test_get_children_no_auth(client):
    res = client.get("/api/children/")
    assert res.status_code == 403


def test_create_child_success(client, auth_headers):
    res = client.post("/api/children/", json={
        "name": "小明",
        "gender": "男",
        "grade": "三年级",
        "school_name": "实验小学",
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "小明"
    assert data["gender"] == "男"
    assert data["grade"] == "三年级"
    assert data["school_name"] == "实验小学"
    assert "id" in data


def test_create_child_duplicate(client, auth_headers):
    client.post("/api/children/", json={
        "name": "小明",
        "gender": "男",
        "grade": "三年级",
        "school_name": "实验小学",
    }, headers=auth_headers)
    res = client.post("/api/children/", json={
        "name": "小红",
        "gender": "女",
        "grade": "二年级",
        "school_name": "实验二小",
    }, headers=auth_headers)
    assert res.status_code == 400
    assert "已有一个孩子信息" in res.json()["detail"]


def test_update_child_success(client, auth_headers):
    create_res = client.post("/api/children/", json={
        "name": "小明",
        "gender": "男",
        "grade": "三年级",
        "school_name": "实验小学",
    }, headers=auth_headers)
    child_id = create_res.json()["id"]

    res = client.put(f"/api/children/{child_id}", json={
        "name": "小明Updated",
        "gender": "男",
        "grade": "四年级",
        "school_name": "新学校",
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "小明Updated"
    assert data["grade"] == "四年级"
    assert data["school_name"] == "新学校"


def test_update_child_not_found(client, auth_headers):
    res = client.put("/api/children/999", json={
        "name": "不存在",
        "gender": "男",
        "grade": "一年级",
        "school_name": "学校",
    }, headers=auth_headers)
    assert res.status_code == 404
    assert "孩子信息不存在" in res.json()["detail"]
