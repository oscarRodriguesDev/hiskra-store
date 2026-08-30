import { NextRequest, NextResponse } from 'next/server';
import {
  getMLProduct,
  extractMLItemId,
  convertMLToProduct,
  generateAffiliateLink,
} from '@/lib/mercadolivre';
import type { ScrapedMLProduct } from '@/lib/ml-scrape';
import { hasAffiliateTracking } from '@/lib/ml-scrape';
import { isAdminRequest } from '@/lib/admin-auth';
import { getStoredItems, addStoredItem } from '@/lib/ml-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ml/links
 * Lista os itens do Mercado Livre salvos pelo admin.
 * ?store=true retorna apenas os que estão visíveis na loja.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeOnly = searchParams.get('store') === 'true';

  try {
    const items = storeOnly
      ? (await getStoredItems()).filter((i) => i.showInStore)
      : await getStoredItems();
    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error('[api/ml/links GET]', error);
    return NextResponse.json(
      { error: 'Falha ao listar os itens salvos.', detail: error instanceof Error ? error.message : 'Erro' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/links
 * Aceita:
 *   { "url": "<link do anúncio>" }  → busca via API (formato antigo MLB...)
 *   { "item": <ScrapedMLProduct> }  → salva direto dados vindos do scraping
 */
export async function POST(request: NextRequest) {
  // Apenas o admin autenticado pode adicionar produtos na loja
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let body: { url?: string; item?: ScrapedMLProduct };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corpo da requisição inválido. Envie JSON com { "url": "..." } ou { "item": {...} }.' },
      { status: 400 }
    );
  }

  // ── Fluxo 1: dados prontos do scraping (sem credenciais) ──
  if (body.item) {
    const it = body.item;
    if (!it.title || !it.permalink) {
      return NextResponse.json({ error: 'Item incompleto para salvar.' }, { status: 400 });
    }

    // Garantia de vínculo: sem matt_word/matt_tool a venda não cai na sua conta
    const affiliateLink = it.affiliateUrl || it.permalink;
    if (!hasAffiliateTracking(affiliateLink)) {
      return NextResponse.json(
        {
          error: 'Este produto vem sem o vínculo de afiliado — a venda não seria atribuída a você.',
          dica: 'Adicione pelo link da sua vitrine (meli.la/...): o sistema salva o link certo automaticamente.',
        },
        { status: 400 }
      );
    }

    const itemId = it.itemId || it.productId || it.userProductId || it.permalink;
    const stored = await addStoredItem({
      itemId,
      title: it.title,
      price: it.price,
      originalPrice: it.originalPrice,
      currencyId: it.currency,
      image: it.imageUrl,
      permalink: it.permalink,
      affiliateLink,
      sellerNickname: undefined,
      categoryId: undefined,
    });
    return NextResponse.json({ item: stored });
  }

  // ── Fluxo 2: URL/ID → busca via API (formato antigo) ──
  const input = body.url?.trim();
  if (!input) {
    return NextResponse.json({ error: 'Parâmetro obrigatório: url (link do anúncio).' }, { status: 400 });
  }

  const itemId = extractMLItemId(input);
  if (!itemId) {
    return NextResponse.json(
      {
        error: 'Não foi possível identificar o ID do produto no link.',
        dica: 'Use o link curto de afiliado (meli.la/...), a URL da página social, ou um ID no formato MLB1234567890.',
      },
      { status: 400 }
    );
  }

  try {
    const mlProduct = await getMLProduct(itemId);
    const product = convertMLToProduct(mlProduct);
    const permalink = mlProduct.permalink;
    const affiliateLink = generateAffiliateLink(permalink);

    // Garantia de vínculo: sem matt_word/matt_tool a venda não cai na sua conta
    if (!hasAffiliateTracking(affiliateLink)) {
      return NextResponse.json(
        {
          error: 'Este ID de anúncio não tem vínculo de afiliado — a venda não seria atribuída a você.',
          dica: 'Use o link curto da sua vitrine (meli.la/...) para adicionar produtos com a comissão garantida.',
        },
        { status: 400 }
      );
    }

    const stored = await addStoredItem({
      itemId: mlProduct.id,
      title: mlProduct.title,
      price: mlProduct.price ?? null,
      originalPrice: mlProduct.original_price ?? null,
      currencyId: mlProduct.currency_id,
      image: mlProduct.pictures?.[0]?.secure_url || mlProduct.pictures?.[0]?.url || product.images[0] || '',
      permalink,
      affiliateLink,
      sellerNickname: mlProduct.seller_address?.nickname,
      categoryId: mlProduct.category_id,
    });

    return NextResponse.json({ item: stored });
  } catch (error) {
    console.error('[api/ml/links POST]', error);
    return NextResponse.json(
      { error: 'Falha ao buscar o produto.', detail: error instanceof Error ? error.message : 'Erro' },
      { status: 502 }
    );
  }
}