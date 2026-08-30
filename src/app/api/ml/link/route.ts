import { NextRequest, NextResponse } from 'next/server';
import {
  getMLProduct,
  extractMLItemId,
  convertMLToProduct,
  generateAffiliateLink,
} from '@/lib/mercadolivre';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ml/link?url=<link-do-anuncio>&affiliate=true
 *
 * Recebe o link de um anúncio do Mercado Livre (ou o ID do item),
 * busca os dados públicos do produto via API e retorna tudo pronto
 * para exibir na loja (título, preço, imagens, specs, link de afiliado).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') || searchParams.get('id');
  const useAffiliate = searchParams.get('affiliate') !== 'false';

  if (!input) {
    return NextResponse.json(
      {
        error: 'Parâmetro obrigatório: ?url=<link do anúncio>',
        exemplo:
          '/api/ml/link?url=https://www.mercadolivre.com.br/MLB-1234567890-nome-do-produto',
      },
      { status: 400 }
    );
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

    // Dados completos do anúncio
    const product = convertMLToProduct(mlProduct);
    const permalink = mlProduct.permalink;
    const affiliateLink = useAffiliate
      ? generateAffiliateLink(permalink)
      : permalink;

    return NextResponse.json({
      itemId: mlProduct.id,
      permalink,
      affiliateLink,
      product: {
        ...product,
        images: mlProduct.pictures.map(p => p.secure_url || p.url),
      },
      raw: {
        title: mlProduct.title,
        price: mlProduct.price,
        originalPrice: mlProduct.original_price,
        currencyId: mlProduct.currency_id,
        availableQuantity: mlProduct.available_quantity,
        soldQuantity: mlProduct.sold_quantity,
        condition: mlProduct.condition,
        freeShipping: mlProduct.shipping?.free_shipping ?? false,
        installments: mlProduct.installments
          ? {
              quantity: mlProduct.installments.quantity,
              amount: mlProduct.installments.amount,
            }
          : null,
        sellerNickname: mlProduct.seller_address?.nickname,
        categoryId: mlProduct.category_id,
        domainId: mlProduct.domain_id,
        acceptsMercadoPago: mlProduct.accepts_mercadopago,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[api/ml/link]', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar o produto no Mercado Livre.',
        detail: message,
      },
      { status: 502 }
    );
  }
}