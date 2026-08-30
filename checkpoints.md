# Checkpoints — Hiskra Store

## Sessão atual (última alteração)
- **Data**: 2026-08-30
- **Estado**: Build OK (`npm run build` passou). Último commit `d839bf6` em `origin/main` (catálogo + link).

## Mudanças desta sessão (não commitadas até este registro)
1. `src/lib/ml-store.ts` — storage dos itens ML selecionados (KV opcional / arquivo local).
2. `src/app/api/ml/links/route.ts` — GET (listar) + POST (buscar e salvar anúncio).
3. `src/app/api/ml/links/[itemId]/route.ts` — PATCH (toggle showInStore) + DELETE.
4. `src/app/admin/page.tsx` — tela admin: colar link → buscar → adicionar → toggle/remover.
5. `src/components/MLStoreSection.tsx` — grade "Ofertas do Mercado Livre" na loja.
6. `src/app/products/page.tsx` — integração da seção ML.
7. `src/app/layout.tsx` — link "Painel de links" no footer.
8. `src/lib/mercadolivre.ts` — helper `getCatalogPermalink()`.

## Pendências
- ⚠️ Produção Vercel: configurar Vercel KV (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) para os itens persistirem. Sem isso, storage cai para arquivo local (funciona só em dev).
- Testar `/api/ml/link` e o fluxo completo do `/admin` em produção.
- Proteger `/admin` e endpoints `/api/ml/links*` com autenticação.
- (Decisão de produto) Exibir preço do catálogo via Prices API se desejado.