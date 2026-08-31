import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Temporário: diagnóstico da galeria. GET /api/admin/dbg-gallery?itemId=MLB...
 * Autenticado. Mostra o resultado cru da busca de fotos no ML.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const itemId = request.nextUrl.searchParams.get('itemId') || 'MLB5418664996';

  const out: Record<string, unknown> = { itemId, hasClientId: !!process.env.ML_CLIENT_ID, hasClientSecret: !!process.env.ML_CLIENT_SECRET };

  try {
    const { refreshMLAccessToken, getMLProduct, getMLMe } = await import('@/lib/mercadolivre');
    await refreshMLAccessToken().catch((e: unknown) => {
      out.refreshError = e instanceof Error ? e.message : String(e);
    });

    // Testa um endpoint que não precisa de escopo de produto (conta)
    try {
      const me = await getMLMe();
      out.me = me;
    } catch (e) {
      out.meError = e instanceof Error ? e.message.slice(0, 200) : String(e);
    }

    const ml = await getMLProduct(itemId);
    out.pictures = (ml.pictures || []).length;
    out.urls = (ml.pictures || []).slice(0, 6).map((p) => (p.secure_url || p.url || '').slice(0, 70));
    out.title = ml.title;
  } catch (e) {
    out.error = e instanceof Error ? e.message.slice(0, 140) : String(e);
  }

  // Teste independente: galeria via scraping da PDP (não usa API/escopo)
  try {
    const { scrapeMLGallery } = await import('@/lib/ml-scrape');
    const scraped = await scrapeMLGallery(itemId);
    out.scrapedCount = scraped.length;
    out.scrapedUrls = scraped.slice(0, 6).map((u) => u.slice(0, 70));
  } catch (e) {
    out.scrapeError = e instanceof Error ? e.message.slice(0, 140) : String(e);
  }

  return NextResponse.json(out);
}