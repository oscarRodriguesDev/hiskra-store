import { NextResponse } from 'next/server';
import { COOKIE_NAME, cookieOptions } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/logout — apaga o cookie de sessão
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { ...cookieOptions(), maxAge: 0 });
  return res;
}