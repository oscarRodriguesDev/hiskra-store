# Checkpoints

Registro do estado de cada sessão do projeto.
Consulte no início de cada interação para saber onde parou.

---

## Sessão 2026-08-30 — Scraping da vitrine do afiliado (sem credenciais)

- Descobertas: links de afiliado = `meli.la/XXX` → resolve para `/social/{nickname}`; IDs novos (`KY2Y2F-5W1X`, `MLBU...`) NÃO são aceitos pela API (404); página `/p/{id}` individual é bootstrap JS sem dados; a página social embute polycards com tudo (título, preço, imagem, permalink, params `matt_*`).
- `src/lib/ml-scrape.ts`: resolve link curto, extrai polycards, monta imagem `D_NQ_NP_{id}-O.jpg`. Testado local: retorna 21 produtos da vitrine.
- `GET /api/ml/link` agora: link de afiliado → `type:"list"` (scraping público); ID `MLB` antigo → `type:"single"` (API com token).
- `POST /api/ml/links` aceita `{ item }` (scrape) ou `{ url }` (API).
- Admin: lista da vitrine com "Adicionar" por produto.
- Build OK. Pendência de KV (persistência) adiada pelo usuário.

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
