# Memorias

Registro de decisões e alterações do projeto.

## Sessão

| Data | Decisão | Autor |
|------|---------|-------|
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
