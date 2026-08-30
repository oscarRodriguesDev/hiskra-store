import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  cookieOptions,
  signSession,
  validateCredentials,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/login
 * { "email": "...", "password": "..." } → seta cookie httpOnly de sessão
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const email = body.email?.trim() ?? '';
  const password = body.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
  }

  if (!validateCredentials(email, password)) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  const token = await signSession(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, cookieOptions());
  return res;
}