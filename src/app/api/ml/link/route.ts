import { NextRequest, NextResponse } from 'next/server';
import {
  getMLProduct,
  extractMLItemId,
  convertMLToProduct,
  generateAffiliateLink,
} from '@/lib/mercadolivre';
import {
  resolveShortLink,
  scrapeMLProducts,
  isShortLink,
} from '@/lib/ml-scrape';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ml/link?url=<link-do-anuncio>
 *
 * Recebe o link de um anúncio do Mercado Livre (ou o ID do item):
 * - Link de afiliado (meli.la/..., /social/...) → dados via scraping público
 *   (SEM usar credenciais da API).
 * - ID no formato antigo (MLB1234567890) → busca via API com token existente.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') || searchParams.get('id');
  const useAffiliate = searchParams.get('affiliate') !== 'false';

  if (!input) {
    return NextResponse.json(
      {
        error: 'Parâmetro obrigatório: ?url=<link do anúncio>',
        exemplo: '/api/ml/link?url=https://meli.la/XXXXXX  ou  /api/ml/link?url=MLB1234567890',
      },
      { status: 400 }
    );
  }

  const trimmed = input.trim();

  // ── 1) Link curto / página pública → scraping sem credenciais ──
  if (isShortLink(trimmed) || /^\/(p|social)\//.test(trimmed)) {
    try {
      let target = trimmed;
      if (/meli\.la\//i.test(trimmed) || /meli\.com\.br\//i.test(trimmed)) {
        target = await resolveShortLink(trimmed);
      }
      const products = await scrapeMLProducts(target);
      if (products.length === 0) {
        return NextResponse.json(
          {
            error: 'Não foi possível extrair produtos dessa página.',
            dica: 'Cole o link curto de afiliado (meli.la/...) ou a URL da sua página social.',
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        type: 'list',
        source: target,
        products,
        count: products.length,
      });
    } catch (error) {
      console.error('[api/ml/link scrape]', error);
      return NextResponse.json(
        {
          error: 'Falha ao acessar a página do anúncio.',
          detail: error instanceof Error ? error.message : 'Erro',
        },
        { status: 502 }
      );
    }
  }

  // ── 2) ID / URL de item → API com token (formato antigo) ──
  const itemId = extractMLItemId(trimmed);
  if (!itemId) {
    return NextResponse.json(
      {
        error: 'Não foi possível identificar o produto.',
        dica: 'Use o link curto de afiliado (ex: https://meli.la/XXXXXX), a URL da página social, ou um ID no formato MLB1234567890.',
      },
      { status: 400 }
    );
  }

  try {
    const mlProduct = await getMLProduct(itemId);
    const product = convertMLToProduct(mlProduct);
    const permalink = mlProduct.permalink;
    const affiliateLink = useAffiliate ? generateAffiliateLink(permalink) : permalink;

    return NextResponse.json({
      type: 'single',
      itemId: mlProduct.id,
      permalink,
      affiliateLink,
      product: {
        ...product,
        images: mlProduct.pictures.map((p) => p.secure_url || p.url),
      },
      raw: {
        title: mlProduct.title,
        price: mlProduct.price,
        originalPrice: mlProduct.original_price,
        currencyId: mlProduct.currency_id,
        freeShipping: mlProduct.shipping?.free_shipping ?? false,
        installments: mlProduct.installments
          ? { quantity: mlProduct.installments.quantity, amount: mlProduct.installments.amount }
          : null,
        sellerNickname: mlProduct.seller_address?.nickname,
      },
    });
  } catch (error) {
    console.error('[api/ml/link api]', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar o produto.',
        detail: error instanceof Error ? error.message : 'Erro',
        dica: 'Se for um link de afiliado (meli.la/...), o ID novo ainda não é aceito pela API — prefira o link curto.',
      },
      { status: 502 }
    );
  }
}