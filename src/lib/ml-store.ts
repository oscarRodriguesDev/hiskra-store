import { prisma } from '@/lib/prisma';

/**
 * Itens do Mercado Livre selecionados pelo admin para exibir na loja.
 * Persistidos em SQLite via Prisma (Turso/libSQL).
 */
export interface MLStoredItem {
  itemId: string;          // MLB1234567890
  title: string;
  price: number | null;
  originalPrice: number | null;
  currencyId: string;
  image: string;
  images: string[];        // galeria (todas as fotos)
  permalink: string;
  affiliateLink: string;
  showInStore: boolean;
  createdAt: string;
  sellerNickname?: string;
  categoryId?: string;
}

function dbError(): Error {
  return new Error(
    'Armazenamento não configurado. Defina as env vars DATABASE_URL (libsql://) e TOKEN_SECRET (token do Turso) e faça redeploy.'
  );
}

function toClientItem(row: {
  price: number | null;
  originalPrice: number | null;
  currencyId: string;
  image: string;
  images: string;
  affiliateLink: string;
  permalink: string;
  title: string;
  categoryId: string | null;
  itemId: string;
  sellerNickname: string | null;
  createdAt: Date;
  showInStore: boolean;
}): MLStoredItem {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(row.images || '[]');
    images = Array.isArray(parsed) ? parsed : [];
  } catch {
    images = [];
  }
  if (images.length === 0 && row.image) images = [row.image];
  return {
    itemId: row.itemId,
    title: row.title,
    price: row.price,
    originalPrice: row.originalPrice,
    currencyId: row.currencyId,
    image: row.image,
    images,
    permalink: row.permalink,
    affiliateLink: row.affiliateLink || row.permalink,
    showInStore: row.showInStore,
    createdAt: row.createdAt.toISOString(),
    sellerNickname: row.sellerNickname ?? undefined,
    categoryId: row.categoryId ?? undefined,
  };
}

export async function getStoredItems(): Promise<MLStoredItem[]> {
  if (!prisma) throw dbError();
  const rows = await prisma.storeItem.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toClientItem);
}

export async function getStorefrontItems(): Promise<MLStoredItem[]> {
  if (!prisma) throw dbError();
  const rows = await prisma.storeItem.findMany({
    where: { showInStore: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toClientItem);
}

export async function addStoredItem(
  item: Omit<MLStoredItem, 'createdAt' | 'showInStore'> & {
    showInStore?: boolean;
  }
): Promise<MLStoredItem> {
  if (!prisma) throw dbError();
  const imagesJson = JSON.stringify(Array.isArray(item.images) ? item.images.filter(Boolean) : []);
  const row = await prisma.storeItem.upsert({
    where: { itemId: item.itemId },
    create: {
      itemId: item.itemId,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      currencyId: item.currencyId,
      image: item.image,
      images: imagesJson,
      permalink: item.permalink,
      affiliateLink: item.affiliateLink || item.permalink,
      showInStore: item.showInStore ?? true,
      sellerNickname: item.sellerNickname ?? null,
      categoryId: item.categoryId ?? null,
    },
    update: {
      // Mantém o toggle atual, atualiza o restante (preço, imagem, link etc.)
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      currencyId: item.currencyId,
      image: item.image,
      images: imagesJson,
      permalink: item.permalink,
      affiliateLink: item.affiliateLink || item.permalink,
      sellerNickname: item.sellerNickname ?? null,
      categoryId: item.categoryId ?? null,
    },
  });
  return toClientItem(row);
}

export async function updateStoredItem(
  itemId: string,
  patch: Partial<MLStoredItem>
): Promise<MLStoredItem | null> {
  if (!prisma) throw dbError();
  try {
    const row = await prisma.storeItem.update({
      where: { itemId },
      data: {
        showInStore: patch.showInStore,
        price: patch.price,
        originalPrice: patch.originalPrice,
        image: patch.image,
        images: Array.isArray(patch.images) ? JSON.stringify(patch.images.filter(Boolean)) : undefined,
        permalink: patch.permalink,
        affiliateLink: patch.affiliateLink,
        title: patch.title,
      },
    });
    return toClientItem(row);
  } catch {
    return null; // registro não encontrado
  }
}

export async function removeStoredItem(itemId: string): Promise<boolean> {
  if (!prisma) throw dbError();
  try {
    await prisma.storeItem.delete({ where: { itemId } });
    return true;
  } catch {
    return false;
  }
}