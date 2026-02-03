"""
GitHub Integration Router
OAuth flow and connection status endpoints.
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

# State storage: state_token -> (user_id, created_at)
# TODO: Replace with Redis for multi-instance deployments
_oauth_states: dict[str, tuple[str, datetime]] = {}


def _generate_state(user_id: str) -> str:
    """Generate state token bound to user."""
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = (user_id, datetime.now(timezone.utc))
    return state


def _validate_and_consume_state(state: str) -> Optional[str]:
    """Validate state and return user_id. Returns None if invalid/expired."""
    if state not in _oauth_states:
        return None
    user_id, created = _oauth_states.pop(state)
    if datetime.now(timezone.utc) - created > timedelta(minutes=10):
        return None
    return user_id


@router.get("/connect")
async def github_connect(current_user: User = Depends(get_current_user)):
    """Initiate GitHub OAuth flow."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub integration not configured")
    
    state = _generate_state(current_user.id)
    
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
    """Handle GitHub OAuth callback and persist installation."""
    if error:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/settings/integrations?error={error}",
            status_code=302
        )
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    user_id = _validate_and_consume_state(state) if state else None
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    
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
            if not access_token:
                raise HTTPException(status_code=502, detail="GitHub did not return an access token")

            scope = token_data.get("scope", "")
            expires_in = token_data.get("expires_in")
            token_expires_at = (
                datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                if expires_in
                else None
            )
            refresh_token = token_data.get("refresh_token")
            
            # Upsert GithubInstallation
            result = await db.execute(
                select(GithubInstallation).where(GithubInstallation.user_id == user_id)
            )
            installation = result.scalars().first()
            
            if installation:
                installation.access_token_encrypted = access_token  # TODO: encrypt
                installation.refresh_token_encrypted = refresh_token  # TODO: encrypt
                installation.scopes = scope
                installation.token_expires_at = token_expires_at
                installation.updated_at = datetime.now(timezone.utc)
            else:
                installation = GithubInstallation(
                    user_id=user_id,
                    access_token_encrypted=access_token,  # TODO: encrypt
                    refresh_token_encrypted=refresh_token,  # TODO: encrypt
                    token_expires_at=token_expires_at,
                    scopes=scope
                )
                db.add(installation)
            
            await db.commit()
            
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
    """Get current user's GitHub connection status."""
    result = await db.execute(
        select(GithubInstallation).where(GithubInstallation.user_id == current_user.id)
    )
    installation = result.scalars().first()
    
    if not installation:
        return {"connected": False, "scopes": None, "expires_at": None}
    
    return {
        "connected": True,
        "scopes": installation.scopes,
        "expires_at": installation.token_expires_at.isoformat() if installation.token_expires_at else None
    }
