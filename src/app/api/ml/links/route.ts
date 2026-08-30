import { NextRequest, NextResponse } from 'next/server';
import {
  getMLProduct,
  extractMLItemId,
  convertMLToProduct,
  generateAffiliateLink,
} from '@/lib/mercadolivre';
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
 * { "url": "<link do anúncio>" }
 *
 * Busca o anúncio no Mercado Livre e salva na lista da loja.
 */
export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido. Envie JSON com { "url": "..." }.' }, { status: 400 });
  }

  const input = body.url?.trim();
  if (!input) {
    return NextResponse.json({ error: 'Parâmetro obrigatório: url (link do anúncio).' }, { status: 400 });
  }

  const itemId = extractMLItemId(input);
  if (!itemId) {
    return NextResponse.json(
      {
        error: 'Não foi possível identificar o ID do produto no link.',
        dica: 'Cole a URL completa do anúncio (ex: https://www.mercadolivre.com.br/MLB-1234567890-...) ou apenas o ID (ex: MLB1234567890).',
      },
      { status: 400 }
    );
  }

  try {
    const mlProduct = await getMLProduct(itemId);
    const product = convertMLToProduct(mlProduct);
    const permalink = mlProduct.permalink;
    const affiliateLink = generateAffiliateLink(permalink);

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
      { error: 'Falha ao buscar o produto no Mercado Livre.', detail: error instanceof Error ? error.message : 'Erro' },
      { status: 502 }
    );
  }
}