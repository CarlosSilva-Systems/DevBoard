# Issue: Implement GitHub Integrations UI

## Description
Add frontend UI for connecting GitHub accounts and viewing connection status.

## Requirements

### Page: `/settings/integrations`
- Display current GitHub connection status
- "Connect GitHub" button that redirects to OAuth flow
- Show connected scopes after successful connection
- "Disconnect" button to revoke access

### Components
- `IntegrationsPage` — Settings page for integrations
- `GitHubConnectionCard` — Card showing connection status
- `ConnectGitHubButton` — Button to initiate OAuth

### API Integration
- `GET /integrations/github/status` — Fetch connection status
- Redirect to `/integrations/github/connect` for OAuth

## Acceptance Criteria
- [ ] IntegrationsPage renders correctly
- [ ] Shows "Not Connected" when no installation
- [ ] Shows "Connected" with scopes when connected
- [ ] Connect button redirects to OAuth
- [ ] Handles success/error query params from callback

## Related
- Phase 2, Feature 2.1
- Depends on: PR #2 (OAuth endpoints)
