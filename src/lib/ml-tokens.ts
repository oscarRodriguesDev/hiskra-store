import { prisma } from '@/lib/prisma';

/**
 * Persistência de tokens do app ML no banco (Turso).
 * Colunas chave-valor em `app_settings`:
 *   ml_access_token, ml_refresh_token, ml_access_expires_at
 */

const K_ACCESS = 'ml_access_token';
const K_REFRESH = 'ml_refresh_token';
const K_EXPIRES = 'ml_access_expires_at';
const K_VERSION = 'ml_token_version'; // muda a cada renovação p/ invalidar cache

export interface MLTokenBag {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  version: string;
}

async function getSetting(key: string): Promise<string | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function setSetting(key: string, value: string): Promise<void> {
  if (!prisma) return;
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getMLTokenBag(): Promise<MLTokenBag | null> {
  const [accessToken, refreshToken, expiresAt, version] = await Promise.all([
    getSetting(K_ACCESS),
    getSetting(K_REFRESH),
    getSetting(K_EXPIRES),
    getSetting(K_VERSION),
  ]);
  if (!accessToken || !refreshToken) return null;
  const exp = Number(expiresAt || 0);
  if (!Number.isFinite(exp)) return null;
  return { accessToken, refreshToken, expiresAt: exp, version: version || '' };
}

export async function saveMLTokenBag(bag: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}): Promise<void> {
  const version = String(Date.now());
  await Promise.all([
    setSetting(K_ACCESS, bag.accessToken),
    setSetting(K_REFRESH, bag.refreshToken),
    setSetting(K_EXPIRES, String(bag.expiresAt)),
    setSetting(K_VERSION, version),
  ]);
}

export async function clearMLTokenBag(): Promise<void> {
  if (!prisma) return;
  await prisma.appSetting.deleteMany({
    where: { key: { in: [K_ACCESS, K_REFRESH, K_EXPIRES, K_VERSION] } },
  });
}

// Extra: expõe a versão para o cliente detectar mudanças (opcional)
export async function getMLTokenVersion(): Promise<string> {
  return (await getSetting(K_VERSION)) || '';
}