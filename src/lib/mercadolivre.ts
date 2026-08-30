import type { Product } from './types';

// Tipos para resposta da API do Mercado Livre
export interface MLProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  buying_mode: string;
  listing_type_id: string;
  condition: string;
  pictures: Array<{ url: string; secure_url: string; size: string; max_size: string }>;
  thumbnail: string;
  thumbnail_id: string;
  permalink: string;
  accepts_mercadopago: boolean;
  installments: { quantity: number; amount: number; rate: number; currency_id: string };
  address: { state_id: string; state_name: string; city_id: string; city_name: string };
  shipping: { free_shipping: boolean; mode: string; tags: string[]; logistic_type: string; store_pick_up: boolean };
  seller_address: { id: number; nickname: string };
  attributes: Array<{ id: string; name: string; value_id: string | null; value_name: string | null; value_struct: unknown; values: Array<{ id: string; name: string; struct: unknown }>; attribute_group_id: string; attribute_group_name: string }>;
  differential_pricing: { id: number } | null;
  variations: unknown[];
  tags: string[];
  catalog_product_id: string | null;
  domain_id: string;
  category_id?: string;
}

export interface MLSearchResponse {
  site_id: string;
  query: string;
  paging: { total: number; offset: number; limit: number; primary_results: number };
  results: MLProduct[];
  sort: { id: string; name: string };
  available_sorts: Array<{ id: string; name: string }>;
  filters: unknown[];
  available_filters: unknown[];
}

// Produto do CATÁLOGO do ML (endpoint /products/search — substitui o /sites/{site}/search descontinuado)
export interface MLCatalogProduct {
  id: string;
  status: string;
  domain_id: string;
  settings?: { listing_strategy?: string };
  name: string;
  main_features?: unknown[];
  attributes: Array<{
    id: string;
    name: string;
    value_id: string | null;
    value_name: string | null;
  }>;
  pictures: Array<{ id: string; url: string }>;
  parent_id?: string;
  children_ids?: string[];
}

export interface MLCatalogResponse {
  keywords?: string;
  domain_id?: string;
  paging: { total: number; limit: number; offset: number };
  results: MLCatalogProduct[];
}

// Configuração
const ML_BASE_URL = 'https://api.mercadolibre.com';
const ML_SITE_ID = 'MLB'; // Brasil

// Termos de busca no catálogo (substituem a busca por categoria descontinuada)
export const CATEGORY_SEARCH_TERMS: Record<keyof typeof ML_CATEGORIES, string> = {
  processors: 'processador',
  videoCards: 'placa de vídeo',
  memory: 'memória ram',
  storage: 'ssd',
  motherboards: 'placa mãe',
  powerSupplies: 'fonte atx',
  cases: 'gabinete gamer',
  cooling: 'water cooler',
  keyboards: 'teclado mecânico',
  mice: 'mouse gamer',
  monitors: 'monitor',
  headsets: 'headset gamer',
};

// Categorias principais de informática/eletrônicos
export const ML_CATEGORIES = {
  processors: 'MLB1055', // Processadores
  videoCards: 'MLB1648', // Placas de vídeo
  memory: 'MLB1653', // Memória RAM
  storage: 'MLB1658', // Armazenamento (SSD/HD)
  motherboards: 'MLB1663', // Placas-mãe
  powerSupplies: 'MLB1668', // Fontes
  cases: 'MLB1673', // Gabinetes
  cooling: 'MLB1678', // Coolers/Water coolers
  keyboards: 'MLB1683', // Teclados
  mice: 'MLB1688', // Mouses
  monitors: 'MLB1693', // Monitores
  headsets: 'MLB1698', // Headsets
} as const;

interface MLAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  clientId: string;
  clientSecret: string;
}

// Cache simples em memória (em produção usar Redis/banco)
let authCache: MLAuth | null = null;

export function getMLAuth(): MLAuth | null {
  if (!authCache) {
    // Carregar de variáveis de ambiente
    const clientId = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;
    const refreshToken = process.env.ML_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      authCache = {
        accessToken: '',
        refreshToken,
        expiresAt: 0,
        clientId,
        clientSecret,
      };
    }
  }
  return authCache;
}

export async function refreshMLAccessToken(): Promise<string> {
  const auth = getMLAuth();
  if (!auth) throw new Error('Credenciais ML não configuradas');

  // Se token ainda válido (com margem de 5 min)
  if (auth.accessToken && Date.now() < auth.expiresAt - 5 * 60 * 1000) {
    return auth.accessToken;
  }

  const response = await fetch(`${ML_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: auth.clientId,
      client_secret: auth.clientSecret,
      refresh_token: auth.refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao renovar token ML: ${error}`);
  }

  const data = await response.json();
  auth.accessToken = data.access_token;
  auth.refreshToken = data.refresh_token;
  auth.expiresAt = Date.now() + data.expires_in * 1000;

  // TODO: Salvar novo refresh_token no .env ou banco
  return auth.accessToken;
}

async function mlFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await refreshMLAccessToken();
  const response = await fetch(`${ML_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ML API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Buscar produtos no catálogo (substitui o /sites/{site}/search descontinuado)
export async function searchMLCatalog(
  options: {
    q?: string;
    domainId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<MLCatalogResponse> {
  const params = new URLSearchParams({
    status: 'active',
    site_id: ML_SITE_ID,
    limit: String(options.limit || 20),
    offset: String(options.offset || 0),
  });

  if (options.q) params.set('q', options.q);
  if (options.domainId) params.set('domain_id', options.domainId);

  return mlFetch<MLCatalogResponse>(`/products/search?${params}`);
}

// Buscar produtos por categoria
export async function searchMLProducts(
  categoryId: string,
  options: {
    limit?: number;
    offset?: number;
    sort?: string;
    condition?: 'new' | 'used';
    freeShipping?: boolean;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<MLSearchResponse> {
  const params = new URLSearchParams({
    category: categoryId,
    limit: String(options.limit || 20),
    offset: String(options.offset || 0),
    sort: options.sort || 'relevance',
  });

  if (options.condition) params.append('condition', options.condition);
  if (options.freeShipping) params.append('shipping', 'free');
  if (options.minPrice) params.append('price', `${options.minPrice}-${options.maxPrice || '*'}`);

  return mlFetch<MLSearchResponse>(`/sites/${ML_SITE_ID}/search?${params}`);
}

// Buscar detalhes de um produto
export async function getMLProduct(itemId: string): Promise<MLProduct> {
  return mlFetch<MLProduct>(`/items/${itemId}`);
}

// Extrair o ID do item a partir da URL do anúncio ou do próprio ID
export function extractMLItemId(input: string): string | null {
  const trimmed = input.trim();

  // Já é um ID direto (ex: MLB1234567890)
  if (/^ML[BACDEHMOUV]{2}\d{6,}$/.test(trimmed)) {
    return trimmed;
  }

  // URL de anúncio (ex: https://www.mercadolivre.com.br/MLB-1234567890-nome-...)
  // ou produto.mercadolivre.com.br/MLB-1234567890-...
  const matches = trimmed.match(/(ML[BACDEHMOUV]{2})-(\d{6,})/);
  if (matches) {
    return `${matches[1]}${matches[2]}`;
  }

  return null;
}

// Gerar link de afiliado (precisa do seu tracking ID)
export function generateAffiliateLink(permalink: string, trackingId?: string): string {
  const affiliateId = trackingId || process.env.ML_AFFILIATE_ID;
  if (!affiliateId) return permalink;

  const url = new URL(permalink);
  url.searchParams.set('afiliado', affiliateId);
  // Parâmetros extras para tracking
  url.searchParams.set('utm_source', 'hiskra_store');
  url.searchParams.set('utm_medium', 'affiliate');
  url.searchParams.set('utm_campaign', 'product_redirect');
  return url.toString();
}

// Converter produto ML para formato interno
export function convertMLToProduct(mlProduct: MLProduct, affiliateTrackingId?: string): Product {
  const images = mlProduct.pictures.length > 0
    ? mlProduct.pictures.map(p => p.secure_url || p.url)
    : [mlProduct.thumbnail.replace('-I.jpg', '-O.jpg')]; // thumbnail maior

  // Extrair specs principais dos attributes
  const specs: Record<string, string> = {};
  for (const attr of mlProduct.attributes) {
    if (attr.value_name && !attr.id.startsWith('SELLER_')) {
      specs[attr.name] = attr.value_name;
    }
  }

  const shortDesc = [
    specs['Marca'] || specs['Linha'] || '',
    specs['Modelo'] || '',
    specs['Capacidade'] || specs['Capacidade do armazenamento'] || '',
    specs['Memória RAM'] || specs['Capacidade da memória'] || '',
  ].filter(Boolean).join(' • ');

  return {
    id: `ml-${mlProduct.id}`,
    slug: `ml-${mlProduct.id}`,
    name: mlProduct.title,
    description: `Produto vendido e entregue por ${mlProduct.seller_address.nickname} no Mercado Livre.\n\n${JSON.stringify(specs, null, 2)}`,
    shortDescription: shortDesc || mlProduct.title.substring(0, 160),
    price: Math.round(mlProduct.price * 100), // converter para centavos
    compareAtPrice: mlProduct.original_price ? Math.round(mlProduct.original_price * 100) : undefined,
    images,
    category: getCategoryName(mlProduct.category_id || ''),
    stock: mlProduct.available_quantity,
    isActive: mlProduct.available_quantity > 0,
    featured: mlProduct.sold_quantity > 100,
    tags: extractTags(mlProduct),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function getCategoryName(categoryId: string): string {
  const map: Record<string, string> = {
    'MLB1055': 'Processadores',
    'MLB1648': 'Placas de Vídeo',
    'MLB1653': 'Memória RAM',
    'MLB1658': 'Armazenamento',
    'MLB1663': 'Placas-mãe',
    'MLB1668': 'Fontes',
    'MLB1673': 'Gabinetes',
    'MLB1678': 'Water Coolers',
    'MLB1683': 'Teclados',
    'MLB1688': 'Mouses',
    'MLB1693': 'Monitores',
    'MLB1698': 'Headsets',
  };
  return map[categoryId] || 'Eletrônicos';
}

function extractTags(product: MLProduct): string[] {
  const tags: string[] = [];
  if (product.condition === 'new') tags.push('Novo');
  if (product.shipping.free_shipping) tags.push('Frete grátis');
  if (product.accepts_mercadopago) tags.push('Mercado Pago');
  if (product.installments.quantity > 1) tags.push(`${product.installments.quantity}x s/ juros`);

  // Tags da categoria
  for (const [key, catId] of Object.entries(ML_CATEGORIES)) {
    if (product.category_id === catId) {
      tags.push(key.charAt(0).toUpperCase() + key.slice(1));
      break;
    }
  }
  return tags;
}

// Converter produto do catálogo para o formato interno (sem preço — catálogo não traz preço)
export function convertMLCatalogToProduct(
  catalogProduct: MLCatalogProduct,
  categoryKey?: keyof typeof ML_CATEGORIES
): Product {
  const images =
    catalogProduct.pictures.length > 0
      ? catalogProduct.pictures.map(p => p.url)
      : [];

  // Extrair specs principais
  const specs: Record<string, string> = {};
  for (const attr of catalogProduct.attributes) {
    if (attr.value_name && !attr.id.startsWith('SELLER_')) {
      specs[attr.name] = attr.value_name;
    }
  }

  const shortDesc = [
    specs['Marca'] || '',
    specs['Modelo'] || '',
    specs['Linha'] || '',
  ].filter(Boolean).join(' • ');

  return {
    id: `ml-cat-${catalogProduct.id}`,
    slug: `ml-cat-${catalogProduct.id.toLowerCase()}`,
    name: catalogProduct.name,
    description: `Produto do catálogo do Mercado Livre.\n\n${JSON.stringify(specs, null, 2)}`,
    shortDescription: shortDesc || catalogProduct.name.substring(0, 160),
    price: 0, // catálogo não retorna preço; buscar item/permalink separadamente
    images,
    category: categoryKey
      ? getCategoryName(ML_CATEGORIES[categoryKey] || '')
      : catalogProduct.domain_id || 'Eletrônicos',
    stock: 0,
    isActive: catalogProduct.status === 'active',
    featured: false,
    tags: ['Catálogo ML'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Sincronizar produtos de uma categoria
export async function syncCategoryProducts(
  categoryKey: keyof typeof ML_CATEGORIES,
  limit = 20
): Promise<Product[]> {
  const categoryId = ML_CATEGORIES[categoryKey];
  const response = await searchMLProducts(categoryId, {
    limit,
    condition: 'new',
    sort: 'sold_quantity_desc', // mais vendidos primeiro
  });

  return response.results
    .filter(p => p.available_quantity > 0)
    .map(p => convertMLToProduct(p));
}

// Sincronizar múltiplas categorias
export async function syncAllCategories(limitPerCategory = 10): Promise<Product[]> {
  const allProducts: Product[] = [];

  for (const categoryKey of Object.keys(ML_CATEGORIES) as Array<keyof typeof ML_CATEGORIES>) {
    try {
      console.log(`Sincronizando ${categoryKey}...`);
      const products = await syncCategoryProducts(categoryKey, limitPerCategory);
      allProducts.push(...products);
      // Rate limit: 1 req/s para não estourar limite
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`Erro ao sincronizar ${categoryKey}:`, error);
    }
  }

  return allProducts;
}