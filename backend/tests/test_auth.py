def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "username": "newuser",
        "password": "password123",
        "name": "新家长",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["parent_name"] == "新家长"


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "password123",
        "name": "家长A",
    })
    res = client.post("/api/auth/register", json={
        "username": "dupuser",
        "password": "anotherpass",
        "name": "家长B",
    })
    assert res.status_code == 400
    assert "用户名已存在" in res.json()["detail"]


def test_login_success(client):
    client.post("/api/auth/register", json={
        "username": "logintest",
        "password": "mypassword",
        "name": "登录测试",
    })
    res = client.post("/api/auth/login", json={
        "username": "logintest",
        "password": "mypassword",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["parent_name"] == "登录测试"


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "wrongpw",
        "password": "correctpass",
        "name": "密码测试",
    })
    res = client.post("/api/auth/login", json={
        "username": "wrongpw",
        "password": "wrongpass",
    })
    assert res.status_code == 401
    assert "用户名或密码错误" in res.json()["detail"]


def test_login_nonexistent_user(client):
    res = client.post("/api/auth/login", json={
        "username": "noone",
        "password": "whatever",
    })
    assert res.status_code == 401
    assert "用户名或密码错误" in res.json()["detail"]
