"""
Tests for GitHub OAuth Endpoints (PR #2)
TDD: These tests are written BEFORE the endpoints exist.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from unittest.mock import patch, AsyncMock


def test_github_integration_router_exists():
    """Verify the GitHub integration router is registered."""
    routes = [route.path for route in app.routes]
    # At minimum, these paths should exist
    assert any("/integrations/github" in str(route) for route in app.routes)


@pytest.mark.asyncio
async def test_github_connect_redirects():
    """GET /integrations/github/connect should redirect to GitHub OAuth."""
    # Mock the settings to have a client ID
    with patch('app.routers.github_integration.settings') as mock_settings:
        mock_settings.GITHUB_CLIENT_ID = "test_client_id"
        mock_settings.GITHUB_REDIRECT_URI = "http://localhost:8000/integrations/github/callback"
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=False) as ac:
            response = await ac.get("/integrations/github/connect")
            # Should be a redirect (302 or 307)
            assert response.status_code in [302, 307], f"Expected redirect, got {response.status_code}"
            # Should redirect to GitHub
            location = response.headers.get("location", "")
            assert "github.com" in location, f"Expected GitHub redirect, got {location}"


@pytest.mark.asyncio
async def test_github_callback_requires_code():
    """GET /integrations/github/callback without code should fail."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/integrations/github/callback")
        # Should return error without code parameter
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"


@pytest.mark.asyncio
async def test_github_status_requires_auth():
    """GET /integrations/github/status requires authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/integrations/github/status")
        # Should require auth
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


@pytest.mark.asyncio
async def test_github_status_returns_connection_info():
    """GET /integrations/github/status returns connection info when authenticated."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First register/login to get a token
        email = "oauth_test@example.com"
        password = "testpass123"
        
        await ac.post("/auth/register", json={
            "email": email,
            "password": password,
            "name": "OAuth Test"
        })
        
        login_resp = await ac.post("/auth/login", data={
            "username": email,
            "password": password
        })
        
        if login_resp.status_code == 200:
            token = login_resp.json()["access_token"]
            
            status_resp = await ac.get("/integrations/github/status", headers={
                "Authorization": f"Bearer {token}"
            })
            
            assert status_resp.status_code == 200
            data = status_resp.json()
            assert "connected" in data
            assert isinstance(data["connected"], bool)
