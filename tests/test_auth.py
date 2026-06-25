import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


client = TestClient(app)


class TestRegistration:
    def test_register_success(self):
        response = client.post("/auth/register", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "SecurePass123"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "password_hash" not in data

    def test_register_duplicate_email(self):
        client.post("/auth/register", json={
            "name": "User One",
            "email": "duplicate@example.com",
            "password": "SecurePass123"
        })
        response = client.post("/auth/register", json={
            "name": "User Two",
            "email": "duplicate@example.com",
            "password": "DifferentPass456"
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_invalid_email(self):
        response = client.post("/auth/register", json={
            "name": "Bad User",
            "email": "not-an-email",
            "password": "SecurePass123"
        })
        assert response.status_code == 422

    def test_register_short_password(self):
        response = client.post("/auth/register", json={
            "name": "Bad User",
            "email": "short@example.com",
            "password": "123"
        })
        assert response.status_code == 422


class TestLogin:
    def setup_method(self):
        client.post("/auth/register", json={
            "name": "Login Test",
            "email": "logintest@example.com",
            "password": "TestPass123"
        })

    def test_login_success(self):
        response = client.post("/auth/login", json={
            "email": "logintest@example.com",
            "password": "TestPass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        response = client.post("/auth/login", json={
            "email": "logintest@example.com",
            "password": "WrongPassword"
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self):
        response = client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "AnyPassword"
        })
        assert response.status_code == 401


class TestProtectedRoutes:
    def get_token(self) -> str:
        client.post("/auth/register", json={
            "name": "Protected Test",
            "email": "protected@example.com",
            "password": "TestPass123"
        })
        resp = client.post("/auth/login", json={
            "email": "protected@example.com",
            "password": "TestPass123"
        })
        return resp.json()["access_token"]

    def test_get_profile_with_valid_token(self):
        token = self.get_token()
        response = client.get(
            "/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == "protected@example.com"

    def test_get_profile_without_token(self):
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_get_profile_with_fake_token(self):
        response = client.get(
            "/users/me",
            headers={"Authorization": "Bearer fake.token.here"}
        )
        assert response.status_code in [401, 403]

    def test_create_and_list_workspace(self):
        token = self.get_token()
        headers = {"Authorization": f"Bearer {token}"}

        create_resp = client.post(
            "/workspaces/",
            json={"project_name": "My Research", "description": "Test project"},
            headers=headers
        )
        assert create_resp.status_code == 201
        workspace_id = create_resp.json()["id"]

        list_resp = client.get("/workspaces/", headers=headers)
        assert list_resp.status_code == 200
        assert any(w["id"] == workspace_id for w in list_resp.json())