import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import uuid

@pytest.mark.asyncio
async def test_auth_me_bug():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register
        email = f"bug_repro_{uuid.uuid4()}@example.com"
        password = "securepassword"
        
        reg_resp = await ac.post("/auth/register", json={
            "email": email,
            "password": password,
            "name": "Bug Repro"
        })
        assert reg_resp.status_code == 200, f"Register failed: {reg_resp.text}"
        
        # 2. Login
        login_resp = await ac.post("/auth/login", data={
            "username": email,
            "password": password
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json()["access_token"]
        
        # 3. Get Me (Trigger the bug)
        me_resp = await ac.get("/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        # This currently fails with 500 due to type error
        assert me_resp.status_code == 200, f"Get Me failed with {me_resp.status_code}: {me_resp.text}"
        data = me_resp.json()
        assert data["email"] == email
