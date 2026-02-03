# Pull Request #2: GitHub OAuth Endpoints

## Resumo
Endpoints de OAuth para conectar contas GitHub ao DevBoard.

## Commits

| SHA | Mensagem |
|-----|----------|
| `427d95e` | `test(github): add failing tests for OAuth endpoints` |
| `9e2c293` | `feat(github): implement OAuth endpoints with tests` |
| `aa30d75` | `fix(github): persist OAuth token to GithubInstallation on callback` |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/integrations/github/connect` | ✅ | Inicia OAuth flow |
| GET | `/integrations/github/callback` | ❌ | Recebe callback do GitHub |
| GET | `/integrations/github/status` | ✅ | Retorna status de conexão |

## Arquivos Alterados

- `backend/app/config.py` — Config vars do GitHub OAuth
- `backend/app/main.py` — Registro do router
- `backend/app/models.py` — GitHub models (GithubInstallation, GithubRepoLink)
- `backend/app/routers/github_integration.py` — OAuth endpoints
- `backend/tests/test_github_oauth.py` — 6 testes

## Configuração (Produção)

```env
GITHUB_CLIENT_ID=<client_id>
GITHUB_CLIENT_SECRET=<secret>
GITHUB_REDIRECT_URI=https://api.devboard.com/integrations/github/callback
FRONTEND_URL=https://devboard.com
```

## Validação

```bash
cd backend
venv\Scripts\python -m pytest tests/test_github_oauth.py -v
venv\Scripts\python -m pytest  # Suite completa
```

## Resultado

- ✅ 6 testes OAuth passaram
- ✅ Token persistido em GithubInstallation
- ✅ /status reflete conexão corretamente

## Próximos Passos

PR #3 — UI para "Connect GitHub" no frontend
