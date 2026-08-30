import { NextRequest, NextResponse } from 'next/server';
import {
  ML_CATEGORIES,
  searchMLProducts,
  convertMLToProduct,
  generateAffiliateLink,
} from '@/lib/mercadolivre';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const maxDuration = 60;

interface AffiliateProduct extends Product {
  mlItemId: string;
  permalink: string;
  affiliateLink: string;
  soldQuantity: number;
  freeShipping: boolean;
  installments?: { quantity: number; amount: number };
}

/**
 * GET /api/ml/products
 *
 * Lista produtos afiliáveis do Mercado Livre (categorias de tecnologia/PC).
 *
 * Query params:
 *  - category     chave da categoria (ex: processors, videoCards). Padrão: todas.
 *  - limit        produtos por categoria (padrão 50, máx 100)
 *  - offset       deslocamento por categoria (padrão 0)
 *  - affiliate    "false" desativa link de afiliado (padrão true)
 *  - minPrice     preço mínimo em reais (opcional)
 *  - maxPrice     preço máximo em reais (opcional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categoryKey = searchParams.get('category');
  const limit = Math.min(
    Math.max(Number(searchParams.get('limit')) || 50, 1),
    100
  );
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const useAffiliate = searchParams.get('affiliate') !== 'false';
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;

  const categoryEntries = Object.entries(ML_CATEGORIES) as Array<
    [keyof typeof ML_CATEGORIES, string]
  >;

  const categoriesToFetch = categoryKey
    ? categoryEntries.filter(([key]) => key === categoryKey)
    : categoryEntries;

  if (categoriesToFetch.length === 0) {
    return NextResponse.json(
      {
        error: `Categoria inválida. Use uma destas: ${Object.keys(ML_CATEGORIES).join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    // Busca as categorias em lotes de 4 para respeitar o rate limit do ML (~10 req/s)
    const products: AffiliateProduct[] = [];
    const categoryTotals: Record<string, number> = {};

    const fetchCategory = async ([key, categoryId]: [
      keyof typeof ML_CATEGORIES,
      string
    ]) => {
      const response = await searchMLProducts(categoryId, {
        limit,
        offset,
        condition: 'new',
        sort: 'sold_quantity_desc',
        minPrice,
        maxPrice,
      });

      categoryTotals[key] = response.paging?.total ?? response.results.length;

      for (const mlProduct of response.results) {
        const baseProduct = convertMLToProduct(mlProduct);
        const permalink = mlProduct.permalink;

        products.push({
          ...baseProduct,
          mlItemId: mlProduct.id,
          permalink,
          affiliateLink: useAffiliate
            ? generateAffiliateLink(permalink)
            : permalink,
          soldQuantity: mlProduct.sold_quantity,
          freeShipping: mlProduct.shipping?.free_shipping ?? false,
          installments: mlProduct.installments?.quantity
            ? {
                quantity: mlProduct.installments.quantity,
                amount: mlProduct.installments.amount,
              }
            : undefined,
        });
      }
    };

    // Pool de concorrência: 4 categorias por vez
    for (let i = 0; i < categoriesToFetch.length; i += 4) {
      const batch = categoriesToFetch.slice(i, i + 4);
      await Promise.all(batch.map(fetchCategory));
    }

    // Ordena por mais vendidos (global)
    products.sort((a, b) => b.soldQuantity - a.soldQuantity);

    return NextResponse.json({
      site: 'MLB',
      category: categoryKey || 'all',
      total: products.length,
      categoryTotals,
      categories: Object.keys(ML_CATEGORIES),
      products,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[api/ml/products]', error);
    return NextResponse.json(
      { error: 'Falha ao buscar produtos do Mercado Livre', detail: message },
      { status: 502 }
    );
  }
}