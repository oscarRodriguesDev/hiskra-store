# Checkpoints

Registro do estado de cada sessão do projeto.
Consulte no início de cada interação para saber onde parou.

---

## Sessão 2026-08-31 — Bug crítico do regex de ID do ML (galeria de 1 foto)

- Causa raiz da "galeria de 1 foto": o regex de validação de ID do item do ML estava errado. Usava `ML[BACDEHMOUV]{2}\d{6,}$` (que exige 2 letras após `ML`), mas o formato REAL dos IDs do ML é `ML` + **1 letra** de site + dígitos (ex: `MLB5761444412`, `MLA`, `MLC`) e tem **7+ dígitos**. Com o regex errado, `getMLProduct(itemId)` NUNCA era chamado → caía sempre no fallback de 1 foto.
- Corrigido para `^ML[A-Z]\d{7,}$` (e URL `(ML[A-Z])-(\d{7,})`) em `src/lib/mercadolivre.ts` (`extractMLItemId`) e `src/app/api/ml/links/route.ts` (busca da galeria). Teste da regex ✓ (aceita `MLB...`, rejeita `MLBU...`, extrai de URL).
- Observação: o `userProductId` do scrape (`MLBU...`) é rejeitado corretamente — não é item de API válido.
- Status "conectada" do admin agora é real (tenta renovar o token de verdade — commit `18897f6`).
- Depois do build/deploy: readicionar produtos pelo `meli.la` para a galeria popular.

---

- Causa da galeria de 1 foto: credenciais do app ML estavam inválidas no `.env` local (`invalid client_id or client_secret`) e ausentes na Vercel → `getMLProduct` falha → fallback 1 foto. Além disso, `refreshMLAccessToken` não salvava o refresh_token novo (vencia).
- **Schema**: nova tabela `app_settings` (chave-valor) p/ persistir tokens em runtime. `db:apply` idempotente; Client regenerado; upsert testado ✓.
- `src/lib/ml-tokens.ts`: `getMLTokenBag`/`saveMLTokenBag`/`clearMLTokenBag` (chaves `ml_access_token`, `ml_refresh_token`, `ml_access_expires_at`, `ml_token_version`).
- `mercadolivre.ts` refatorado:
  - `loadMLAuth()`: client_id/secret de env; **tokens do banco têm prioridade**, fallback `.env`.
  - `refreshMLAccessToken()`: renova e **salva o refresh_token novo no banco**; em 400/401 limpa tokens p/ forçar reconexão.
- `POST /api/admin/login`: chama `refreshMLAccessToken()` de forma **não bloqueante** → renova automaticamente ao logar.
- `/api/auth/ml/callback`: **persiste** access+refresh+expires no banco (antes jogava na URL e perdia). `/api/auth/ml/auth` continua gerando a URL de autorização (PKCE).
- `GET /api/admin/ml-status` (autenticada): status da conexão ML. Admin mostra banner: se não conectado, link "Conectar app do Mercado Livre" (`/api/auth/ml/auth`); se ok, aviso verde.
- ⚠️ **Passo manual único restante** (não automático): OAuth do ML exige 1 autorização inicial (tela do ML) para "plantar" o refresh_token válido — renovar funciona só se houver refresh base vivo. Depois disso, tudo automático no login. O refresh_token de apps ML também expira com o tempo (reautorizar ocasionalmente).

---

- Usuário pediu: navegar nas fotos do produto DENTRO do site; só ser direcionado pro ML ao clicar em "Comprar".
- **Banco**: nova coluna `images` (JSON, texto) na `ml_store` (schema + ALTER TABLE + script `db:apply` idempotente com `ALTER ... ADD COLUMN` tratando "duplicate column"). Client Prisma regenerado.
- `ml-store.ts`: `MLStoredItem.images: string[]`, parseado em `toClientItem` (com fallback para `[image]`), salvo no upsert create/update e no `updateStoredItem`.
- `POST /api/ml/links`: nos 2 fluxos busca a galeria via `getMLProduct(itemId)` (fotos `secure_url`/`url`), com fallback para a imagem única quando sem credencial/falha.
- **Página interna**: `/product/[slug]` reativada — busca o item por `itemId` no banco (`getStoredItems`) e renderiza `ProductDetailClient` com galeria (thumbnails, seleção, badge de desconto) + **botão "Comprar agora"** que é o ÚNICO ponto que sai pro link de afiliado. `page.tsx` é server component (`force-dynamic`, 404 se não achar).
- **Cards** em `MLStoreSection`: imagem, título e botão agora apontam para `/product/{itemId}` ("Ver detalhes") — o visitante fica no site; sai só no "Comprar" da página interna.
- Build OK (`/product/[slug]`, `/products`, `/api/*` dinâmicos). Teste local de persistência da galeria ✓ (upsert/find/delete com 3 fotos).
- Obs.: `[slug]` = `itemId` — URLs `/product/MLB...` (acessadas via card).
- ⚠️ Produtos adicionados ANTES dessa mudança não têm galeria (só imagem única) — readicionar pelo `meli.la` para popular a galeria.

---

## Sessão 2026-08-30 — Header limpo para a primeira etapa

- Removidas categorias mortas do template (Camisetas/Moletons/Acessórios — links `/products?category=...` que nem existiam) do header desktop e mobile. Nav agora: **Produtos** (+ Painel).
- Removido do header o bloco de conta de clientes ("Entrar / Cadastrar", "Minha conta", "Meus pedidos", menu de usuário e skeleton) — não faz sentido para loja de afiliado com um único admin. `useAuth` deixou de ser usado pelo Header (AuthContext/CartContext permanecem para o carrinho).
- No lugar: link discreto "Painel" (ícone de engrenagem) → `/admin` (que redireciona a `/login` quando não autenticado) — sem "opção de entrar" exposta no header público.
- Build OK. Próximos: publicar mais produtos, ads, monitorar comissão no relatório do ML.

---

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
