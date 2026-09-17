import sys
import os

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from app.models import User

client = TestClient(app)

def test_google_auth_flow():
    print("Testing Google Auth Endpoint (/api/auth/google)...")
    
    test_email = "test.google.user@example.com"
    test_name = "Google Test Patient"

    # Clean up test user if exists
    db = next(get_db())
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()

    # 1. First-time sign-in (Registration)
    res = client.post("/api/auth/google", json={
        "email": test_email,
        "full_name": test_name,
        "id_token": "mock_test_token"
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "access_token" in data, "access_token missing in response"
    assert data["user"]["email"] == test_email, f"Email mismatch: {data['user']['email']}"
    assert data["user"]["full_name"] == test_name, f"Name mismatch: {data['user']['full_name']}"
    print("[PASS] New Google user auto-provisioned successfully.")

    token = data["access_token"]

    # 2. Verify protected route (/api/auth/me) with token
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200, f"Expected 200 from /me, got {res_me.status_code}: {res_me.text}"
    user_data = res_me.json()
    assert user_data["email"] == test_email
    print("[PASS] MediLens JWT verified against /api/auth/me.")

    # 3. Subsequent sign-in (Existing user login)
    res2 = client.post("/api/auth/google", json={
        "email": test_email,
        "full_name": "Updated Patient Name",
        "id_token": "mock_test_token_2"
    })
    assert res2.status_code == 200, f"Expected 200 on login, got {res2.status_code}: {res2.text}"
    data2 = res2.json()
    assert "access_token" in data2
    print("[PASS] Existing Google user login succeeded.")

    # Clean up
    db = next(get_db())
    u = db.query(User).filter(User.email == test_email).first()
    if u:
        db.delete(u)
        db.commit()
    print("[PASS] Test cleanup finished.")
    print("\nALL GOOGLE AUTH TESTS PASSED!")

if __name__ == "__main__":
    test_google_auth_flow()
