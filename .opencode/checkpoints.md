# Checkpoints

Registro do estado de cada sessão do projeto.
Consulte no início de cada interação para saber onde parou.

---

## Sessão 2026-08-30 — Admin protegido com login

- Usuário pediu proteção do `/admin` (só ele publica produtos). Credenciais: `demo@hiskra.com` / `demo123`.
- `src/lib/admin-auth.ts`: sessão em cookie httpOnly assinado HMAC-SHA256 (Web Crypto, sem libs) — `signSession`/`verifySession`/`isAdminRequest`/`getSessionToken`/`validateCredentials`/`cookieOptions`; envs `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_SECRET` com fallback demo; expiração 7 dias.
- `src/app/login/page.tsx`: formulário de acesso; `POST /api/admin/login` (valida + seta cookie) e `POST /api/admin/logout` (apaga).
- `src/app/admin/layout.tsx`: server layout checa cookie e faz `redirect('/login')` — protege a página client existente.
- `POST /api/ml/links` e `PATCH/DELETE /api/ml/links/:itemId`: exigem sessão (401 sem cookie). `GET` de `/api/ml/link` e `/api/ml/links` continuam públicos (loja + busca do admin).
- Botão "Sair" no cabeçalho do admin.
- `.env` local ganhou `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_SECRET` (não versionado). Na Vercel os fallbacks demo valem; trocar via env se quiser.
- Testes unitários de auth 7/7 (credenciais, sign/verify, token adulterado, expirado, extração de cookie, isAdmin, sem cookie) + build OK.

---

## Sessão 2026-08-30 — Estado final: loja no ar, pronta para divulgar

- **Deploy automático confirmado**: Vercel (GitHub) publica cada push no `main` — nada de redeploy manual. Verificado em produção:
  - `GET /api/ml/link?url=meli.la/1PAVx9r` → 21 produtos com `affiliateUrl` = vitrine (`/social/rodriguesoscar09?matt_word=...&matt_tool=...&ref=...`) ✓
  - `GET /api/ml/links` → 200, Prisma+Turso conectados (sem ENOENT) ✓
- **Bug de cache resolvido**: `/products` era estática (`○`) e mostrava HTML congelado do build (2 notebooks Lenovo que nem estavam mais no banco) e ocultava itens novos. Fix commit `30a4fd8`: `export const dynamic = 'force-dynamic'` → página lê o Turso a cada request. Confirmado em produção: mostra só o ASUS salvo.
- **Banco atual (Turso)**: 1 item — `MLB5382062300` Notebook ASUS Vivobook 15 (o usuário adicionou; Lenovos já não estavam mais no banco, eram fantasma do cache).
- **Atribuição de comissão esclarecida**: link interno de produto dentro da vitrine (com `matt_tool_id`/`source=affiliate-profile`) funciona apenas como continuação da sessão iniciada com `matt_word`; avulso/fora da vitrine NÃO identifica o afiliado → Hiskra segue usando sempre o link da vitrine.
- **Usuário vai**: adicionar produtos via `/admin` (colando `https://meli.la/1PAVx9r`) e divulgar a loja com ads (funil: ads → home/`/products` → vitrine com matt_word → compra).
- Pendências registradas: auth para `/admin` + `/api/ml/links*` (hoje abertos); teste do fluxo de conversão via relatório de afiliados; `KY2Y2F-5W1X` sem solução (404 API); migração opcional Supabase/Postgres.

---

## Sessão 2026-08-30 — Garantia de vínculo: nada entra na loja sem comissão

- `hasAffiliateTracking(url)` em `ml-scrape.ts`: verdadeiro se o link tem `matt_word` ou `matt_tool`.
- `POST /api/ml/links` agora **recusa** item sem vínculo (fluxo 1 e fluxo 2) com mensagem clara + dica de usar o meli.la da vitrine — impede venda "perdida" silenciosamente.
- Admin ganhou aviso verde: "toda venda feita por esses links é atribuída a você".
- Gerador antigo `generateAffiliateLink` (sem ML_AFFILIATE_ID) não produz tracking → bloqueado pelo fluxo 2.
- Testes unitários da regra (5/5) + build OK.

## Sessão 2026-08-30 — Link de afiliado = link da vitrine social (comissão)

- Usuário reportou: o link salvo era o permalink do produto com só `matt_event_ts`/`matt_d2id`/`matt_tracing_id`; o link que garante a comissão é o da página social (`/social/{nickname}?matt_word=...&matt_tool=...&forceInApp=true&ref=...`).
- Fix em `src/lib/ml-scrape.ts` (`scrapeMLProducts`): quando a URL efetiva da página contém `/social/`, o `affiliateUrl` de TODOS os produtos passa a ser o link completo da vitrine (`res.url`).
- Testado local: `meli.la/1PAVx9r` → vitrine de 21 produtos, cada um com `affiliateUrl` = link da vitrine ✓. Build OK.
- Aviso: itens adicionados ANTES desse fix mantêm o link antigo — readicionar os produtos recria com o link correto.

## Sessão 2026-08-30 — Loja só com ofertas do admin (sem mocks, sem marca)

- `/products` reescrito: só `MLStoreSection` (sem mock-data/filtros) — seção com empty state "Em breve, novidades por aqui".
- Home: removidos destaques mock e chips de categorias; CTA "Ver ofertas" → `/products`; seção neutra de ofertas selecionadas.
- `/product/[slug]`: sempre 404 (modelo de afiliado não tem página interna de produto).
- Textos neutros: card "Oferta", botão "Ver oferta", aria-label sem marca; descrições (`mercadolivre.ts`) e mensagens de erro das APIs sem "Mercado Livre".
- `mock-data`, `ProductCard`, `ProductDetailClient` ficaram órfãos (mantidos; não são mais renderizados).
- Build OK. Pendências: redeploy Vercel após Prisma; propagar `matt_word`/`matt_tool`.

## Sessão 2026-08-30 — Storage migrado para Prisma + Turso

- Usuário pediu **Prisma**. Instalados `prisma`, `@prisma/client`, `@prisma/adapter-libsql` **7.10.0** (a tag `latest` do CLI apontava p/ rc 8.0.0 — alinhado tudo em 7.10.0).
- Env vars do banco no `.env`/Vercel: `DATABASE_URL=libsql://...` + `TOKEN_SECRET` (JWT do Turso). `src/lib/prisma.ts` aceita também `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`.
- `prisma/schema.prisma`: model `StoreItem` → tabela `ml_store` (item_id PK, title, price, original_price, currency_id, image, permalink, affiliate_link, show_in_store, created_at, seller_nickname, category_id). **Tabela criada no Turso** (via `migrate diff` + pipeline HTTP).
- `ml-store.ts` reescrito: mesma API (`getStoredItems`, `getStorefrontItems`, `addStoredItem` = upsert que preserva toggle, `updateStoredItem`, `removeStoredItem`) via `prisma.storeItem` — no Prisma 7 o delegate é o camelCase do model (não `mlStoreItem`).
- Peculiaridades do Prisma 7: `url` do datasource saiu do schema (fica no `prisma.config.ts`); `PrismaClient` sem adapter lança erro; CLI `db push` não aceita scheme `libsql://` (cria `prisma/dev.db` local) → schema no Turso via **`npm run db:apply`** (script idempotente; testado ✓).
- `package.json`: `postinstall: prisma generate` (client na Vercel), `db:push` (dev local), `db:apply` (Turso). `.gitignore`: `prisma/dev.db*`, `/data/`.
- Teste ponta a ponta no Turso remoto: count/create/findUnique/update/delete ✓. Build OK ✓.
- ⚠️ Pendência: **Redeploy na Vercel** com as env `DATABASE_URL` + `TOKEN_SECRET` (mesmo erro ENOENT de antes era deploy antigo); confirmar que os nomes batem na Vercel e testar POST /api/ml/links.
- Pendência antiga mantida: propagar `matt_word`/`matt_tool` no `affiliateUrl` (comissão).

## Sessão 2026-08-30 — Scraping da vitrine do afiliado (sem credenciais)

- Descobertas: links de afiliado = `meli.la/XXX` → resolve para `/social/{nickname}`; IDs novos (`KY2Y2F-5W1X`, `MLBU...`) NÃO são aceitos pela API (404); página `/p/{id}` individual é bootstrap JS sem dados; a página social embute polycards com tudo (título, preço, imagem, permalink, params `matt_*`).
- `src/lib/ml-scrape.ts`: resolve link curto, extrai polycards, monta imagem `D_NQ_NP_{id}-O.jpg`. Testado local: retorna 21 produtos da vitrine.
- `GET /api/ml/link` agora: link de afiliado → `type:"list"` (scraping público); ID `MLB` antigo → `type:"single"` (API com token).
- `POST /api/ml/links` aceita `{ item }` (scrape) ou `{ url }` (API).
- Admin: lista da vitrine com "Adicionar" por produto.
- Build OK. Pendência de KV (persistência) adiada pelo usuário.
- `next.config.ts`: liberados domínios de imagem do ML (`http2.mlstatic.com`, `http.mlstatic.com`, `mlstatic.com`) — fotos dos produtos vinham bloqueadas pelo Next Image.

## Sessão 2026-08-30 — Painel de links ML + vitrine de afiliados

- Commit `d839bf6` (main): troca do search descontinuado por catálogo `/products/search` + endpoint `/api/ml/link` (buscar anúncio por link com token existente).
- Commit `15a70be` (main): painel admin `/admin` (colar link → buscar → adicionar → toggle "Mostrar na loja"/remover) + endpoints `GET/POST /api/ml/links`, `PATCH/DELETE /api/ml/links/:itemId` + seção "Ofertas do Mercado Livre" em `/products` + storage plugável `src/lib/ml-store.ts`.
- Build OK (`npm run build`).

### Pendências
- ⚠️ Produção Vercel: configurar Vercel KV (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) para persistir os itens; sem KV o storage cai para arquivo (só funciona em dev).
- Testar em produção: fluxo completo do `/admin` (buscar, adicionar, toggle) e `/api/ml/link`.
- Proteger `/admin` e endpoints `/api/ml/links*` com autenticação (hoje abertos).
- Opcional: preço do catálogo via Prices API (`/items/{id}/sale_price`, `/items/{id}/prices`).

---

## Estado Inicial

- Projeto inicializado com `hiskra-code init`

## v2.1.0 — Templates + init interativo

- `memorias.md`, `checkpoints.md`, `ideias.md` → templates fornecidos ao usuário
- `initial-prompt.md` → template que pergunta "O que deseja construir?"
- `requisitos.md` → template com tabelas de requisitos
- `index.cjs` → initProject copia templates
- `cli.js` → init interativo com perguntas sobre prompt e requisitos
- Flag `--quiet` para init silencioso

## v2.3.0 — Token Economy Policy

- `skills/token-economy.md` criada
- `config.md` compactado (107→57 linhas)
- Todos os 14 skills reescritos (média 230→20 linhas)
- Todos os 16 agents reescritos (média 13→10 linhas)
- Economia total: 74,3% de redução de tokens (21.314→5.475)

## v2.3.0 — Update Mechanism

- `index.cjs`: versão check via npm registry + `isOutdated()`
- `cli.js`: comando `hiskra-code update` + version check automático + `--version`
- `package.json`: v2.2.2 → v2.3.0

## v3.1.0 — Auto-init + Launch opencode

- `cli.js`: `hiskra-code` sem argumentos agora:
  - Faz auto-init do `.opencode/` se não existir
  - Verifica atualizações antes de iniciar
  - Lança o `opencode` automaticamente
- `cli.js`: `--help` / `-h` / `help` explícitos para exibir ajuda
- `AGENTS.md`: documentação atualizada com novo fluxo

## v4.0.0 — Modo Legado (NVIDIA Engine)

- **Novo comando `hiskra-code conect`**: menu interativo para escolher entre opencode e modo legado
- **`conect-config.js`**: gerencia `.opencode/conect.json` (provider, modelo, baseUrl)
- **`nvidia-api.js`**: cliente completo da API NVIDIA NIM (OpenAI-compatible)
  - Listagem de modelos via `GET /v1/models`
  - Chat completion com streaming SSE
  - Suporte a tool calling (function calling)
  - Fallback para lista de modelos populares
- **`engine-tools.js`**: 10 ferramentas implementadas (bash, read, edit, write, glob, grep, todowrite, websearch, webfetch, task)
- **`engine-context.js`**: gerenciamento de histórico da conversa com truncagem automática
- **`engine-prompt.js`**: montagem do system prompt dinâmico (config.md + orquestrador + skills)
- **`engine-nvidia.js`**: motor principal com loop de conversa interativo, tool calling multi-turn
- **`cli.js`**:
  - Comando `conect` com menu de escolha e listagem de modelos NVIDIA
  - Modo legado: `hiskra-code` sem argumentos inicia engine NVIDIA se configurado
  - Comandos `/exit`, `/reset`, `/help`, `/stats` no loop de conversa
- **`package.json`**: v3.1.0 → v4.0.0, novos arquivos incluídos no `files`
- **Key no `.env`**: `KEY_NVIDIA=nvapi-...`
