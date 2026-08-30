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

// Drivers de persistência, em ordem de preferência:
// 1. Turso (SQLite na nuvem) — se TURSO_DATABASE_URL configurado
// 2. Vercel KV (Redis) — se KV_REST_API_URL configurado
// 3. Arquivo local (dev / self-host)
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = 'ml-store';

// ───────────────────────── Turso / libSQL (SQLite) ─────────────────────────

const TURSO_TABLE = `
CREATE TABLE IF NOT EXISTS ml_store (
  item_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL,
  original_price REAL,
  currency_id TEXT,
  image TEXT,
  permalink TEXT NOT NULL,
  affiliate_link TEXT,
  show_in_store INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  seller_nickname TEXT,
  category_id TEXT
)`;

async function tursoExec(
  stmts: Array<{ sql: string; args?: (string | number | null)[] }>
): Promise<any> {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        ...stmts.map((s) => ({
          type: 'execute',
          stmt: { sql: s.sql, args: s.args ?? [] },
        })),
        { type: 'close' },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

function rowToItem(row: any[]): MLStoredItem {
  const [itemId, title, price, originalPrice, currencyId, image, permalink, affiliateLink, showInStore, createdAt, sellerNickname, categoryId] = row;
  return {
    itemId: String(itemId),
    title: String(title),
    price: price === null || price === undefined ? null : Number(price),
    originalPrice: originalPrice === null || originalPrice === undefined ? null : Number(originalPrice),
    currencyId: String(currencyId || 'BRL'),
    image: String(image || ''),
    permalink: String(permalink),
    affiliateLink: String(affiliateLink || permalink),
    showInStore: Boolean(showInStore),
    createdAt: String(createdAt),
    sellerNickname: sellerNickname ? String(sellerNickname) : undefined,
    categoryId: categoryId ? String(categoryId) : undefined,
  };
}

async function tursoReadItems(): Promise<MLStoredItem[]> {
  const data = await tursoExec([
    { sql: TURSO_TABLE },
    { sql: 'SELECT * FROM ml_store ORDER BY created_at DESC' },
  ]);
  const results = data?.results ?? [];
  for (const r of results) {
    if (r?.type === 'error') throw new Error(r.error?.message || 'Turso error');
  }
  const exec = results.find((r: any) => r?.type === 'execute' && r?.response?.result?.rows);
  const rows = exec?.response?.result?.rows ?? [];
  return rows.map(rowToItem);
}

async function tursoWriteItems(items: MLStoredItem[]): Promise<void> {
  const stmts: Array<{ sql: string; args: (string | number | null)[] }> = [
    { sql: TURSO_TABLE, args: [] },
    { sql: 'DELETE FROM ml_store', args: [] },
  ];
  for (const it of items) {
    stmts.push({
      sql: `INSERT INTO ml_store
        (item_id, title, price, original_price, currency_id, image, permalink, affiliate_link, show_in_store, created_at, seller_nickname, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        it.itemId,
        it.title,
        it.price,
        it.originalPrice,
        it.currencyId,
        it.image,
        it.permalink,
        it.affiliateLink,
        it.showInStore ? 1 : 0,
        it.createdAt,
        it.sellerNickname ?? null,
        it.categoryId ?? null,
      ],
    });
  }
  const data = await tursoExec(stmts);
  for (const r of data?.results ?? []) {
    if (r?.type === 'error') throw new Error(r.error?.message || 'Turso error');
  }
}

// ─────────────────────────── Vercel KV (Redis) ────────────────────────────

async function kvReadItems(): Promise<MLStoredItem[]> {
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

async function kvWriteItems(items: MLStoredItem[]): Promise<void> {
  const res = await fetch(`${KV_URL}/set/${KV_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(items)),
  });
  if (!res.ok) throw new Error(`KV write failed: ${res.status}`);
}

// ───────────────────────────── Arquivo local ──────────────────────────────

async function fileReadItems(): Promise<MLStoredItem[]> {
  const file = path.join(process.cwd(), 'data', 'ml-store.json');
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as MLStoredItem[];
  } catch {
    return [];
  }
}

async function fileWriteItems(items: MLStoredItem[]): Promise<void> {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'ml-store.json'),
      JSON.stringify(items, null, 2),
      'utf-8'
    );
  } catch (error: any) {
    if (error?.code === 'ENOENT' || error?.code === 'EACCES' || error?.code === 'EROFS') {
      throw new Error(
        'Armazenamento não configurado em produção. Configure o Turso (env TURSO_DATABASE_URL + TURSO_AUTH_TOKEN) ou o Vercel KV (env KV_REST_API_URL + KV_REST_API_TOKEN) e faça redeploy.'
      );
    }
    throw error;
  }
}

// ────────────────────────────── API pública ───────────────────────────────

async function readItems(): Promise<MLStoredItem[]> {
  if (TURSO_URL && TURSO_TOKEN) return tursoReadItems();
  if (KV_URL && KV_TOKEN) return kvReadItems();
  return fileReadItems();
}

async function writeItems(items: MLStoredItem[]): Promise<void> {
  if (TURSO_URL && TURSO_TOKEN) return tursoWriteItems(items);
  if (KV_URL && KV_TOKEN) return kvWriteItems(items);
  return fileWriteItems(items);
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