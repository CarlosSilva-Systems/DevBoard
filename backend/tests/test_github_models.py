"""
Tests for GitHub Integration Models (PR #1)
TDD: These tests are written BEFORE the models exist.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base, SessionLocal
from sqlalchemy import text
import uuid


@pytest.fixture
async def db_session():
    """Provide a clean database session for tests."""
    async with SessionLocal() as session:
        yield session


@pytest.mark.asyncio
async def test_github_installation_model_exists():
    """Verify GithubInstallation model is importable."""
    from app.models import GithubInstallation
    assert GithubInstallation is not None
    assert hasattr(GithubInstallation, 'id')
    assert hasattr(GithubInstallation, 'user_id')
    assert hasattr(GithubInstallation, 'access_token_encrypted')


@pytest.mark.asyncio
async def test_github_repo_link_model_exists():
    """Verify GithubRepoLink model is importable."""
    from app.models import GithubRepoLink
    assert GithubRepoLink is not None
    assert hasattr(GithubRepoLink, 'id')
    assert hasattr(GithubRepoLink, 'project_id')
    assert hasattr(GithubRepoLink, 'repo_id')
    assert hasattr(GithubRepoLink, 'owner')
    assert hasattr(GithubRepoLink, 'name')


@pytest.mark.asyncio
async def test_github_installation_create(db_session):
    """Test creating a GithubInstallation record."""
    from app.models import GithubInstallation, User
    from app.auth_utils import get_password_hash
    
    # Create test user first
    user = User(
        id=str(uuid.uuid4()),
        email=f"github_test_{uuid.uuid4()}@test.com",
        name="GitHub Test User",
        password_hash=get_password_hash("testpass123")
    )
    db_session.add(user)
    await db_session.flush()
    
    # Create GithubInstallation
    installation = GithubInstallation(
        id=str(uuid.uuid4()),
        user_id=user.id,
        access_token_encrypted="encrypted_token_here",
        scopes="repo,user"
    )
    db_session.add(installation)
    await db_session.commit()
    
    assert installation.id is not None
    assert installation.user_id == user.id


@pytest.mark.asyncio
async def test_github_repo_link_create(db_session):
    """Test creating a GithubRepoLink record."""
    from app.models import GithubRepoLink, GithubInstallation, User, Client, Project
    from app.auth_utils import get_password_hash
    
    # Setup: User -> Client -> Project -> Installation -> RepoLink
    user = User(
        id=str(uuid.uuid4()),
        email=f"repolink_test_{uuid.uuid4()}@test.com",
        name="RepoLink Test User",
        password_hash=get_password_hash("testpass123")
    )
    db_session.add(user)
    await db_session.flush()
    
    client = Client(id=str(uuid.uuid4()), user_id=user.id, name="Test Client")
    db_session.add(client)
    await db_session.flush()
    
    project = Project(
        id=str(uuid.uuid4()),
        user_id=user.id,
        client_id=client.id,
        name="Test Project"
    )
    db_session.add(project)
    await db_session.flush()
    
    installation = GithubInstallation(
        id=str(uuid.uuid4()),
        user_id=user.id,
        access_token_encrypted="encrypted_token"
    )
    db_session.add(installation)
    await db_session.flush()
    
    # Create RepoLink
    repo_link = GithubRepoLink(
        id=str(uuid.uuid4()),
        project_id=project.id,
        github_installation_id=installation.id,
        repo_id=123456789,
        owner="CarlosSilva-Systems",
        name="DevBoard",
        full_name="CarlosSilva-Systems/DevBoard",
        default_branch="main",
        is_active=True
    )
    db_session.add(repo_link)
    await db_session.commit()
    
    assert repo_link.id is not None
    assert repo_link.full_name == "CarlosSilva-Systems/DevBoard"
