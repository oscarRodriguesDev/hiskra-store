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
    const { scrapeGalleryFromUrl } = await import('@/lib/ml-scrape');
    const urls = [
      `https://www.mercadolivre.com.br/p/${itemId}`,
      `https://produto.mercadolivre.com.br/MLB-${itemId.replace(/^MLB-?/, '')}-_JM`,
      `https://www.mercadolivre.com.br/MLB-${itemId.replace(/^MLB-?/, '')}`,
    ];
    for (const u of urls) {
      const r = await fetch(u, {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36', accept: 'text/html', 'accept-language': 'pt-BR' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      const html = await r.text();
      const imgs = html.match(/https?:\/\/http2\.mlstatic\.com\/D_NQ_NP_[A-Za-z0-9_]+\-[A-Z]\.jpg/g) || [];
      out.scrapeProbe = (out.scrapeProbe as unknown[]) || [];
      (out.scrapeProbe as unknown[]).push({ url: u.slice(28), status: r.status, len: html.length, final: r.url.slice(0, 50), imgs: [...new Set(imgs)].length });
      // achou? guarda
      if (out.scrapedCount === undefined) {
        const urls = [...new Set(imgs)];
        if (urls.length) { out.scrapedCount = urls.length; out.scrapedUrls = urls.slice(0, 6); }
      }
    }
    if (out.scrapedCount === undefined) out.scrapedCount = 0;
  } catch (e) {
    out.scrapeError = e instanceof Error ? e.message.slice(0, 140) : String(e);
  }

  return NextResponse.json(out);
}