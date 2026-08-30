import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Protege todas as rotas sob /admin: sem sessão válida → /login
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  const session = await verifySession(token);
  if (!session) redirect('/login');
  return <>{children}</>;
}