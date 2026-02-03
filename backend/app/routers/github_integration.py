"""
GitHub Integration Router - OAuth Flow
Handles GitHub OAuth authorization and token management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from ..database import get_db
from ..models import GithubInstallation, User
from ..config import settings
from ..routers.auth import get_current_user

router = APIRouter(prefix="/integrations/github", tags=["github"])

# In-memory state storage (for MVP; use Redis in production)
_oauth_states: dict[str, datetime] = {}


def _generate_state() -> str:
    """Generate a secure random state for CSRF protection."""
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = datetime.now(timezone.utc)
    return state


def _validate_state(state: str) -> bool:
    """Validate and consume an OAuth state token."""
    if state not in _oauth_states:
        return False
    created = _oauth_states.pop(state)
    # State expires after 10 minutes
    if datetime.now(timezone.utc) - created > timedelta(minutes=10):
        return False
    return True


@router.get("/connect")
async def github_connect():
    """
    Redirect user to GitHub OAuth authorization page.
    """
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub integration not configured")
    
    state = _generate_state()
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=repo,read:user"
        f"&state={state}"
    )
    
    return RedirectResponse(url=github_auth_url, status_code=307)


@router.get("/callback")
async def github_callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle GitHub OAuth callback.
    Exchange code for access token and store in database.
    """
    # Handle GitHub errors
    if error:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/settings/integrations?error={error}",
            status_code=302
        )
    
    # Validate required parameters
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    if not state or not _validate_state(state):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
    # Exchange code for access token
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI
                },
                headers={"Accept": "application/json"}
            )
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to exchange code for token")
            
            token_data = token_response.json()
            
            if "error" in token_data:
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/settings/integrations?error={token_data.get('error_description', 'OAuth failed')}",
                    status_code=302
                )
            
            access_token = token_data.get("access_token")
            token_type = token_data.get("token_type")
            scope = token_data.get("scope", "")
            
            # TODO: Get current user from session/cookie (for now, redirect with token for frontend to handle)
            # In production, you'd associate this with the logged-in user
            
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/settings/integrations?success=true",
                status_code=302
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"GitHub API error: {str(e)}")


@router.get("/status")
async def github_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get GitHub connection status for the current user.
    """
    result = await db.execute(
        select(GithubInstallation).where(GithubInstallation.user_id == current_user.id)
    )
    installation = result.scalars().first()
    
    if not installation:
        return {
            "connected": False,
            "scopes": None,
            "expires_at": None
        }
    
    return {
        "connected": True,
        "scopes": installation.scopes,
        "expires_at": installation.token_expires_at.isoformat() if installation.token_expires_at else None
    }
