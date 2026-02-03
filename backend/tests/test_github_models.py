"""
Tests for GitHub Integration Models (PR #1)
Unit tests to verify model structure and importability.
"""
import pytest


def test_github_installation_model_exists():
    """Verify GithubInstallation model is importable and has correct attributes."""
    from app.models import GithubInstallation
    
    assert GithubInstallation is not None
    assert hasattr(GithubInstallation, 'id')
    assert hasattr(GithubInstallation, 'user_id')
    assert hasattr(GithubInstallation, 'access_token_encrypted')
    assert hasattr(GithubInstallation, 'refresh_token_encrypted')
    assert hasattr(GithubInstallation, 'token_expires_at')
    assert hasattr(GithubInstallation, 'scopes')
    assert hasattr(GithubInstallation, 'installation_id')
    assert hasattr(GithubInstallation, 'created_at')
    assert hasattr(GithubInstallation, 'updated_at')
    
    # Check table name
    assert GithubInstallation.__tablename__ == "github_installations"


def test_github_repo_link_model_exists():
    """Verify GithubRepoLink model is importable and has correct attributes."""
    from app.models import GithubRepoLink
    
    assert GithubRepoLink is not None
    assert hasattr(GithubRepoLink, 'id')
    assert hasattr(GithubRepoLink, 'project_id')
    assert hasattr(GithubRepoLink, 'github_installation_id')
    assert hasattr(GithubRepoLink, 'repo_id')
    assert hasattr(GithubRepoLink, 'owner')
    assert hasattr(GithubRepoLink, 'name')
    assert hasattr(GithubRepoLink, 'full_name')
    assert hasattr(GithubRepoLink, 'default_branch')
    assert hasattr(GithubRepoLink, 'is_active')
    assert hasattr(GithubRepoLink, 'created_at')
    
    # Check table name
    assert GithubRepoLink.__tablename__ == "github_repo_links"


def test_github_installation_relationships():
    """Verify GithubInstallation has correct relationships defined."""
    from app.models import GithubInstallation
    
    # Should have relationship to User
    assert hasattr(GithubInstallation, 'user')
    # Should have relationship to RepoLinks
    assert hasattr(GithubInstallation, 'repo_links')


def test_github_repo_link_relationships():
    """Verify GithubRepoLink has correct relationships defined."""
    from app.models import GithubRepoLink
    
    # Should have relationship to Project
    assert hasattr(GithubRepoLink, 'project')
    # Should have relationship to Installation
    assert hasattr(GithubRepoLink, 'installation')
