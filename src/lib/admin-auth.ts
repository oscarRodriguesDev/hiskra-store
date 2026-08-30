/**
 * Autenticação do admin — sessão em cookie httpOnly assinado (HMAC-SHA256).
 * Sem dependências externas: usa Web Crypto (Node 18+/edge).
 */

const encoder = new TextEncoder();

function b64url(buf: Uint8Array): string {
  let bin = '';
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const ADMIN_SECRET = () => process.env.ADMIN_SECRET || 'hiskra-store-admin-demo-secret';

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ADMIN_SECRET()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export interface AdminSession {
  email: string;
  exp: number;
}

export const COOKIE_NAME = 'hiskra_admin';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/** Assina uma sessão: `payload.sig` (HMAC-SHA256) */
export async function signSession(email: string): Promise<string> {
  const payload: AdminSession = { email, exp: Date.now() + SESSION_MS };
  const data = b64url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(data);
  return `${data}.${b64url(sig)}`;
}

/** Valida token: assinatura + expiração. Retorna a sessão ou null. */
export async function verifySession(token: string | null | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const [data, sigB64] = token.split('.');
  if (!data || !sigB64) return null;
  try {
    const sig = fromB64url(sigB64);
    const expected = await hmac(data);
    if (!timingSafeEqual(sig, expected)) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(data))) as AdminSession;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Extrai o token do cabeçalho Cookie de um Request */
export function getSessionToken(request: Request): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === COOKIE_NAME) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

/** Requisição autenticada? (para Route Handlers de mutação) */
export async function isAdminRequest(request: Request): Promise<boolean> {
  return (await verifySession(getSessionToken(request))) !== null;
}

/** Credenciais do painel — via env, com fallback para as credenciais demo */
export function validateCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || 'demo@hiskra.com';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'demo123';
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}

export function cookieOptions(maxAge = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}