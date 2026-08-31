/**
 * Scraping de páginas públicas do Mercado Livre (vitrine social / anúncio)
 * para obter dados do produto SEM usar a API (e sem credenciais).
 *
 * Fonte: os dados vêm embutidos na página como objetos JSON "polycard".
 * A página de perfil social (/social/{nickname}) lista os produtos com
 * título, preço, imagem, permalink e params de afiliado (matt_*).
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export interface ScrapedMLProduct {
  itemId?: string; // metadata.id — formato antigo (MLB1234567890)
  productId?: string; // metadata.product_id — produto de catálogo
  userProductId?: string; // formato novo (MLBU... / id curto)
  title: string;
  price: number; // em reais (ex: 3817.5)
  currency: string; // BRL
  originalPrice: number | null;
  imageUrl: string;
  permalink: string; // URL públicas do anúncio
  affiliateUrl: string; // permalink + params de afiliado (matt_*)
}

export function isShortLink(input: string): boolean {
  return /meli\.la\/|meli\.com\.br\/|mercadolivre\.com\.br\/[a-z0-9-]+\/p\//i.test(input) || /\/social\//i.test(input);
}

/**
 * Um link de afiliado do ML só atribui a venda ao vínculo quando traz
 * o identificador do afiliado (matt_word) ou da ferramenta (matt_tool).
 * Links sem esses parâmetros NÃO geram comissão.
 */
export function hasAffiliateTracking(url?: string | null): boolean {
  if (!url) return false;
  return /(^|[?&])matt_word=[^&]+/.test(url) || /(^|[?&])matt_tool=[^&]+/.test(url);
}

/** Segue o redirect do link curto (ex: meli.la/xxxx) e devolve a URL final. */
export async function resolveShortLink(shortUrl: string): Promise<string> {
  const res = await fetch(shortUrl, {
    headers: { 'user-agent': UA, accept: 'text/html' },
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });

  // Redirect HTTP direto
  const location = res.headers.get('location');
  if (location) return new URL(location, shortUrl).toString();

  // Páginas do ML retornam 200 com <a href="...">Moved Permanently</a>
  const html = await res.text();
  const match = html.match(/<a href="([^"]+)">Moved Permanently<\/a>/);
  if (match) return match[1];
  return shortUrl;
}

/** Monta a URL da imagem a partir do id de picture do polycard. */
export function buildMLImageUrl(pictureId: string): string {
  return `https://http2.mlstatic.com/D_NQ_NP_${pictureId}-O.jpg`;
}

/** Extrai o objeto JSON balanceado que começa na posição 'start' (deve ser '{'). */
function extractBalancedJson(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Extrai todos os polycards (objetos de produto) do HTML da página. */
export function extractPolycards(html: string): any[] {
  const cards: any[] = [];
  const marker = '"unique_id":"';
  let idx = 0;
  while (idx < html.length) {
    const pos = html.indexOf('{"unique_id":', idx);
    if (pos === -1) break;
    // Só nos interessa se tem metadata (produto)
    const chunk = html.slice(pos, pos + 400);
    if (chunk.includes('"metadata"')) {
      const json = extractBalancedJson(html, pos);
      if (json) {
        try {
          const obj = JSON.parse(json);
          if (obj?.metadata?.url) cards.push(obj);
        } catch {
          /* ignora blocos malformados */
        }
      }
    }
    idx = pos + 14;
  }
  return cards;
}

function readComponent(card: any, type: string): any {
  for (const c of card?.components ?? []) {
    if (c?.type === type && c?.[type]) return c[type];
  }
  return null;
}

/** Converte um polycard no produto estruturado. */
export function parsePolycard(card: any): ScrapedMLProduct | null {
  const meta = card?.metadata;
  if (!meta?.url) return null;

  const titleComp = readComponent(card, 'title');
  const priceComp = readComponent(card, 'price');
  const pictureId = card?.pictures?.pictures?.[0]?.id;
  const permalink = `https://${meta.url}`;

  const title = titleComp?.text || meta.url.split('/')[0] || 'Produto';
  const current = priceComp?.current_price?.value ?? null;
  const previous = priceComp?.previous_price?.value ?? null;
  const currency = priceComp?.current_price?.currency || 'BRL';

  // Params de afiliado do próprio card (matt_*) + os da página de origem
  const cardParams = meta.url_params || '';

  return {
    itemId: meta.id || undefined,
    productId: meta.product_id || undefined,
    userProductId: meta.user_product_id || undefined,
    title,
    price: current ?? 0,
    currency,
    originalPrice: previous ?? null,
    imageUrl: pictureId ? buildMLImageUrl(pictureId) : '',
    permalink,
    affiliateUrl: `${permalink}${cardParams}`,
  };
}

/**
 * Extrai todas as imagens da galeria de um anúncio a partir da página
 * pública do produto (PDP) — SEM usar a API (e sem credenciais/escopos).
 *
 * A PDP do ML embute o estado inicial da página num JSON "preloadedState"
 * que contém as URLs de todas as fotos. Também encontramos as imagens
 * diretamente no HTML (http2.mlstatic.com/D_NQ_NP_...). Retorna os
 * URLs únicos das fotos, ou lista vazia se não conseguir extrair.
 */
export async function scrapeMLGallery(itemId: string): Promise<string[]> {
  const permalink = `https://produto.mercadolivre.com.br/MLB-${itemId.replace(/^MLB-?/, '')}-galeria-_JM`;
  return scrapeGalleryFromUrl(permalink, itemId);
}

/** Extrai a galeria de fotos de uma URL pública qualquer de produto. */
export async function scrapeGalleryFromUrl(pageUrl: string, fallbackItemId?: string): Promise<string[]> {
  try {
    const res = await fetch(pageUrl, {
      headers: { 'user-agent': UA, accept: 'text/html', 'accept-language': 'pt-BR' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const found = new Set<string>();

    // 1) URLs diretas de imagem no HTML (mais confiável)
    const reClassic = /https?:\/\/http2\.mlstatic\.com\/D_NQ_NP_[A-Za-z0-9_]+\-O\.jpg/g;
    for (const m of html.matchAll(reClassic)) {
      if (found.size < 20) found.add(m[0]);
    }

    // 2) JSON preloadedState com lista "pictures"
    const rePre = /"pictures":\[(.*?)\]}/g;
    for (const m of html.matchAll(rePre)) {
      const urls = m[1].match(/https?:\/\/[^"\\]+\.jpg/g) || [];
      for (const u of urls) {
        if (u.startsWith('http') && found.size < 20) found.add(u.replace(/\\u002F/g, '/').replace(/\\\//g, '/'));
      }
    }

    // 3) IDs de picture (sem URL montada) — monta a URL pública
    const rePicId = /"id":"([A-Z0-9\-]+-[A-Z][A-Z0-9\-]+_[A-Z0-9]+-[A-Z])"/g;
    for (const m of html.matchAll(rePicId)) {
      if (found.size < 20) found.add(`https://http2.mlstatic.com/D_NQ_NP_${m[1]}-O.jpg`);
    }

    // Fallback: se achou só via URL com tamanho variável (-O->-O mantém), ok.
    const out = [...found];
    return out;
  } catch {
    return [];
  }
}

/**
 * Busca produtos na vitrine social ou em qualquer página pública do ML
 * que embuta polycards. Retorna vazio se a página não tiver produtos.
 */
export async function scrapeMLProducts(url: string): Promise<ScrapedMLProduct[]> {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Falha ao acessar página do ML: HTTP ${res.status}`);

  const html = await res.text();
  const effectiveUrl = res.url || url;
  const cards = extractPolycards(html);
  const products: ScrapedMLProduct[] = [];
  for (const card of cards) {
    const p = parsePolycard(card);
    if (p) {
      // Na vitrine social, o link de afiliado é o próprio link da página
      // (matt_word, matt_tool, forceInApp, ref) — é ele que garante a
      // comissão, não o permalink do produto com só os matt_* do card.
      if (/\/social\//.test(effectiveUrl)) {
        p.affiliateUrl = effectiveUrl;
      }
      products.push(p);
    }
  }
  return products;
}