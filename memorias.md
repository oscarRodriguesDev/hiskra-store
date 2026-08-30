# Memórias do Projeto — Hiskra Store

Autoria dos registros: VIBECODE

## Contexto
- Loja Next.js (App Router) hospedada na Vercel em `store.hiskra.com.br`.
- Usuário é afiliado do Mercado Livre e quer exibir produtos afiliáveis automaticamente na loja, sem montar anúncios na mão.
- Sem banco de dados: produtos próprios vêm de `src/lib/mock-data.ts`; itens ML ficam em storage plugável (Vercel KV ou arquivo local `data/ml-store.json`).

## Decisões técnicas
1. **API do ML sem `/sites/{site}/search`**: endpoint descontinuado pelo ML (sempre 403). Usamos:
   - `/products/search` (catálogo, sem preço) para listar automaticamente por categoria → `/api/ml/products`.
   - `/items/{id}` (com token existente) para buscar anúncio individual por link → `/api/ml/link`.
2. **Autenticação**: fluxo OAuth PKCE funcionando; `refresh_token` configurado nas env vars da Vercel; token renovado automaticamente. Não depender de novo fluxo de auth do usuário.
3. **Preço**: catálogo não retorna preço. O ML está migrando preço para a Prices API (`/items/{id}/sale_price`, `/items/{id}/prices`). Anúncio individual (`/items/{id}`) ainda retorna `price` (usado no `/api/ml/link`).
4. **Persistência de itens selecionados**: `src/lib/ml-store.ts` detecta `KV_REST_API_URL`/`KV_REST_API_TOKEN` (Vercel KV) e usa arquivo local como fallback. ⚠️ Em produção Vercel, arquivo local NÃO persiste — precisa configurar KV.

## Endpoints
- `GET /api/ml/products?category=&limit=&offset=` — catálogo ML por categoria (funcionando em prod).
- `GET /api/ml/link?url=` — dados completos de um anúncio (preço real + permalink + affiliate link).
- `GET /api/ml/links` — lista itens salvos (`?store=true` filtra visíveis na loja).
- `POST /api/ml/links` — `{ url }` busca e salva o anúncio.
- `PATCH /api/ml/links/:itemId` — `{ showInStore }` mostra/oculta na loja.
- `DELETE /api/ml/links/:itemId` — remove.

## Páginas
- `/admin` — painel para colar link, buscar anúncio e alternar "Mostrar na loja".
- `/products` — exibe `MLStoreSection` (itens aprovados do ML) abaixo da grade de produtos.
- Footer ganhou link "Painel de links" → `/admin`.

## Notas de segurança (pendente)
- `/admin` e os endpoints `/api/ml/links*` estão SEM autenticação. Proteger com auth antes de divulgar.