import { promises as fs } from 'fs';
import path from 'path';

/**
 * Itens do Mercado Livre selecionados pelo admin para exibir na loja.
 */
export interface MLStoredItem {
  itemId: string;          // MLB1234567890
  title: string;
  price: number | null;
  originalPrice: number | null;
  currencyId: string;
  image: string;
  permalink: string;
  affiliateLink: string;
  showInStore: boolean;
  createdAt: string;
  sellerNickname?: string;
  categoryId?: string;
}

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = 'ml-store';

/**
 * Persistência em Vercel KV (se as env vars estiverem configuradas)
 * ou em arquivo local JSON (dev / self-host).
 */
async function readItems(): Promise<MLStoredItem[]> {
  if (KV_URL && KV_TOKEN) {
    const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    if (!res.ok) throw new Error(`KV read failed: ${res.status}`);
    const data = await res.json();
    const raw = data?.result;
    if (!raw) return [];
    try {
      return JSON.parse(raw) as MLStoredItem[];
    } catch {
      return [];
    }
  }

  const file = path.join(process.cwd(), 'data', 'ml-store.json');
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as MLStoredItem[];
  } catch {
    return [];
  }
}

async function writeItems(items: MLStoredItem[]): Promise<void> {
  if (KV_URL && KV_TOKEN) {
    const res = await fetch(`${KV_URL}/set/${KV_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(items)),
    });
    if (!res.ok) throw new Error(`KV write failed: ${res.status}`);
    return;
  }

  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, 'ml-store.json'),
    JSON.stringify(items, null, 2),
    'utf-8'
  );
}

export async function getStoredItems(): Promise<MLStoredItem[]> {
  return readItems();
}

export async function getStorefrontItems(): Promise<MLStoredItem[]> {
  const items = await readItems();
  return items.filter((i) => i.showInStore);
}

export async function addStoredItem(
  item: Omit<MLStoredItem, 'createdAt' | 'showInStore'> & {
    showInStore?: boolean;
  }
): Promise<MLStoredItem> {
  const items = await readItems();
  const index = items.findIndex((i) => i.itemId === item.itemId);
  const stored: MLStoredItem = {
    ...item,
    showInStore: item.showInStore ?? true,
    createdAt: items[index]?.createdAt ?? new Date().toISOString(),
  };

  if (index >= 0) {
    // Mantém o toggle atual, atualiza o resto (preço, imagem, etc.)
    items[index] = { ...items[index], ...stored, showInStore: items[index].showInStore };
  } else {
    items.push(stored);
  }

  await writeItems(items);
  return items.find((i) => i.itemId === item.itemId) ?? stored;
}

export async function updateStoredItem(
  itemId: string,
  patch: Partial<MLStoredItem>
): Promise<MLStoredItem | null> {
  const items = await readItems();
  const index = items.findIndex((i) => i.itemId === itemId);
  if (index < 0) return null;

  items[index] = { ...items[index], ...patch };
  await writeItems(items);
  return items[index];
}

export async function removeStoredItem(itemId: string): Promise<boolean> {
  const items = await readItems();
  const next = items.filter((i) => i.itemId !== itemId);
  if (next.length === items.length) return false;
  await writeItems(next);
  return true;
}