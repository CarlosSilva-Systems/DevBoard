# Pull Request #3: GitHub Integrations UI

## Resumo
UI para conectar contas GitHub no DevBoard.

## Commits

| SHA | Mensagem |
|-----|----------|
| `1452624` | `feat(integrations): add GitHubConnectionCard component` |
| `...` | `feat(settings): add Integrations tab with GitHub connection` |
| `...` | `docs(issue): add issue_4 for GitHub UI` |

## Arquivos

| Ação | Arquivo |
|------|---------|
| NEW | `frontend/src/app/components/github-connection-card.tsx` |
| MODIFY | `frontend/src/app/pages/settings.tsx` |
| NEW | `docs/issues/issue_4_github_ui.md` |

## Funcionalidades

- Settings dividido em abas "Rates" e "Integrations"
- Card de conexão GitHub com status
- Botão "Connect GitHub" redireciona para OAuth
- Trata query params de callback (success/error)

## Validação

```bash
cd frontend
npm run build
```

## Resultado

- ✅ Build passou
- ✅ Tabs funcionam
- ✅ Card renderiza
