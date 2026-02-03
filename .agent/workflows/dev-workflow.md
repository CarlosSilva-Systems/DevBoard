---
description: workflow padrão para features e bugfixes
---

# Workflow de Desenvolvimento

## Regras Obrigatórias

1. **Nunca trabalhar na main.** Criar branch: `feat/nome` ou `fix/nome`

2. **Criar Issue** (ou gerar texto) com:
   - Steps de reprodução
   - Esperado vs atual
   - Logs/traceback

3. **Reproduzir** com curl/script e coletar status/resposta + traceback

4. **Criar teste que falha primeiro** (TDD)

5. **Commits atômicos** (Conventional Commits), sem misturar assuntos:
   - `test(scope): reproduce bug/add failing tests`
   - `feat(scope): implement feature`
   - `fix(scope): fix issue`
   - `fix(db): ...` (se necessário)
   - `fix(migrations): ...` (se necessário)
   - `test(scope): add regression/edge cases`
   - `docs(scope): update contract` (se necessário)

6. **Rodar pytest** (e lint se existir) e garantir tudo verde

7. **Abrir PR** (ou gerar texto) com:
   - Causa raiz
   - Mudanças
   - Como testar
   - Só então merge (feito pelo usuário)

## Restrições

- Nunca commitar `.env` real/segredos
- Se erro envolver async SQLAlchemy (MissingGreenlet), corrigir uso de AsyncSession/engine

## Entregáveis

- Lista de commits
- Resumo da causa raiz
- Comandos para validar
- Texto do Issue e do PR
