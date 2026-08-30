import { NextRequest, NextResponse } from 'next/server';
import {
  ML_CATEGORIES,
  CATEGORY_SEARCH_TERMS,
  searchMLCatalog,
  convertMLCatalogToProduct,
} from '@/lib/mercadolivre';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const maxDuration = 60;

interface CatalogProduct extends Product {
  catalogProductId: string;
  domainId: string;
  mlPrice?: number | null;
  note?: string;
}

/**
 * GET /api/ml/products
 *
 * Busca produtos no CATÁLOGO do Mercado Livre (endpoint /products/search,
 * que substituiu o /sites/{site}/search descontinuado em 2025).
 *
 * ⚠️ ATENÇÃO: o catálogo NÃO retorna preço nem link de venda individual.
 * Para produto com preço/permalink real, use /api/ml/link?url=<link do anúncio>.
 *
 * Query params:
 *  - category     chave da categoria (ex: processors, videoCards). Padrão: todas.
 *  - limit        produtos por categoria (padrão 20, máx 50)
 *  - offset       deslocamento por categoria (padrão 0)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const categoryKey = searchParams.get('category');
  const limit = Math.min(
    Math.max(Number(searchParams.get('limit')) || 20, 1),
    50
  );
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const categoryKeys = (
    categoryKey ? [categoryKey] : Object.keys(CATEGORY_SEARCH_TERMS)
  ) as Array<keyof typeof ML_CATEGORIES>;

  if (categoryKeys.some(key => !(key in ML_CATEGORIES))) {
    return NextResponse.json(
      {
        error: `Categoria inválida. Use uma destas: ${Object.keys(ML_CATEGORIES).join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    const products: CatalogProduct[] = [];
    const categoryTotals: Record<string, number> = {};

    const fetchCategory = async (key: keyof typeof ML_CATEGORIES) => {
      const response = await searchMLCatalog({
        q: CATEGORY_SEARCH_TERMS[key],
        limit,
        offset,
      });

      categoryTotals[key] = response.paging?.total ?? response.results.length;

      for (const catalogProduct of response.results) {
        products.push({
          ...convertMLCatalogToProduct(catalogProduct, key),
          catalogProductId: catalogProduct.id,
          domainId: catalogProduct.domain_id,
          // Catálogo não tem preço — precisa de /api/ml/link para o anúncio real
          mlPrice: null,
          note: 'Use /api/ml/link?url=... para obter preço e link de venda reais',
        });
      }
    };

    // Pool de concorrência: 4 categorias por vez
    for (let i = 0; i < categoryKeys.length; i += 4) {
      const batch = categoryKeys.slice(i, i + 4);
      await Promise.all(batch.map(fetchCategory));
    }

    return NextResponse.json({
      site: 'MLB',
      endpoint: '/products/search',
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