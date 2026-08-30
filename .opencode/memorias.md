# Memorias

Registro de decisões e alterações do projeto.

## Sessão

| Data | Decisão | Autor |
|------|---------|-------|
| 2026-08-30 | Storage migrado para **Prisma ORM 7.10.0** + driver adapter `@prisma/adapter-libsql` (Turso). Env vars usadas: `DATABASE_URL` (libsql://...) e `TOKEN_SECRET` (token JWT do Turso) — aceita também `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`. Client singleton em `src/lib/prisma.ts` | VIBECODE |
| 2026-08-30 | Prisma 7 mudanças: `url` no datasource do schema foi removido (fica no `prisma.config.ts`); todo `PrismaClient` exige adapter; delegate do model usa camelCase do model (`StoreItem` → `prisma.storeItem`). CLI `db push` NÃO conecta em `libsql://` → aplicar schema no Turso via `npm run db:apply` (`scripts/apply-schema.mjs`: `prisma migrate diff` + pipeline HTTP idempotente) | VIBECODE |
| 2026-08-30 | Model `StoreItem` (tabela `ml_store`) em `prisma/schema.prisma`; `ml-store.ts` reescrito com upsert/findMany/update/delete via Prisma (meshmo contrato `MLStoredItem`). `postinstall` roda `prisma generate` (client pronto na Vercel) | VIBECODE |
| 2026-08-30 | Links de afiliado do usuário vêm como `meli.la/...` (resolve para `/social/{nickname}`) e IDs no formato novo (`KY2Y2F-5W1X`, `user_product_id` `MLBU...`) que a API REST NÃO aceita (404). Solução: scraping da página pública social via polycards (`src/lib/ml-scrape.ts`) — SEM credenciais | VIBECODE |
| 2026-08-30 | `GET /api/ml/link`: link de afiliado/`/social/` → scraping público (retorna `type:"list"` com produtos); ID `MLB...` antigo → API com token (retorna `type:"single"`) | VIBECODE |
| 2026-08-30 | `POST /api/ml/links` aceita `{ item }` (dados prontos do scraping) ou `{ url }` (via API); admin mostra lista da vitrine com botão "Adicionar" individual | VIBECODE |
| 2026-08-30 | Painel admin `/admin`: colar link do anúncio ML → buscar via `/api/ml/link` → salvar com toggle "Mostrar na loja"; endpoints `GET/POST /api/ml/links` e `PATCH/DELETE /api/ml/links/:itemId` | VIBECODE |
| 2026-08-30 | Storage plugável em `src/lib/ml-store.ts`: Vercel KV (env `KV_REST_API_URL`/`KV_REST_API_TOKEN`) com fallback para arquivo local `data/ml-store.json` (produção Vercel NÃO persiste arquivo — precisa KV) | VIBECODE |
| 2026-08-30 | Seção "Ofertas do Mercado Livre" (`MLStoreSection`) na página `/products` exibindo itens aprovados com link de afiliado | VIBECODE |
| 2026-08-30 | API ML: `/sites/{site}/search` descontinuado (403); usar `/products/search` (catálogo, sem preço) e `/items/{id}` (preço real, token existente) | VIBECODE |
| 2026-08-30 | `getCatalogPermalink()` adicionado em `src/lib/mercadolivre.ts` (link público `/p/{catalogId}`) | VIBECODE |
| 2026-08-22 | Documentação completa de requisitos funcionais/não-funcionais, fluxos, regras de negócio e estados do carrinho (anônimo vs autenticado) para Hiskra Store | VIBECODE |
| 2026-07-07 | `hiskra-code` sem argumentos agora auto-inicia `.opencode/` e lança o opencode | VIBECODE |
| 2026-07-07 | Adicionado `--help` / `-h` / `help` para exibir ajuda | VIBECODE |
| 2026-07-07 | `hiskra-code` sem args verifica versão e avisa se precisar de update antes de abrir opencode | VIBECODE |
| 2026-07-09 | v4.0.0 — Modo Legado: comando `conect`, motor NVIDIA com tool calling, streaming, histórico | VIBECODE |
| 2026-07-09 | `conect-config.js`: gerencia `.opencode/conect.json` com provider, modelo, baseUrl | VIBECODE |
| 2026-07-09 | `nvidia-api.js`: cliente NVIDIA NIM com listagem de modelos, chat streaming, tool calling | VIBECODE |
| 2026-07-09 | `engine-tools.js`: 10 ferramentas (bash, read, edit, write, glob, grep, todowrite, websearch, webfetch, task) | VIBECODE |
| 2026-07-09 | `engine-context.js`: histórico com truncagem automática por limite de tokens | VIBECODE |
| 2026-07-09 | `engine-prompt.js`: system prompt dinâmico combinando config.md + orquestrador + skills | VIBECODE |
| 2026-07-09 | `engine-nvidia.js`: motor principal com loop de conversa interativo e tool calling multi-turn | VIBECODE |
| 2026-07-09 | `index.cjs` (initProject): cria `.env` com KEY_NVIDIA padrão + `.gitignore` com `.env` | VIBECODE |
| 2026-07-09 | `nvidia-api.js`: `DEFAULT_NVIDIA_KEY` embutida como chave padrão do pacote | VIBECODE |
