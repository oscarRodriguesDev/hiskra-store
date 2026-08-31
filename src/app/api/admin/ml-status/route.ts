import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getMLTokenBag } from '@/lib/ml-tokens';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ml-status — verifica DE VERDADE se a API do ML está conectada
 * (tentando renovar o token e chamando a API). Requer sessão admin.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const hasClientId = !!process.env.ML_CLIENT_ID;
  const hasClientSecret = !!process.env.ML_CLIENT_SECRET;

  let connected = false;
  let message = '';
  let tokenInfo: {
    refreshExists: boolean;
    refreshMasked: string; // ex: TG-xxxxkb (nunca o valor completo)
    refreshSavedAt: string | null;
    accessMasked: string;
    expiresIn: number; // segundos restantes
  } | null = null;

  // Tenta renovar de verdade (se houver credenciais), e lê o token salvo
  try {
    if (hasClientId && hasClientSecret) {
      const { refreshMLAccessToken } = await import('@/lib/mercadolivre');
      await refreshMLAccessToken();
    }
    const bag = await getMLTokenBag();
    if (bag && bag.refreshToken) {
      const mask = (s: string) =>
        !s ? '' : s.length <= 6 ? '•'.repeat(s.length) : s.slice(0, 3) + '•'.repeat(6) + s.slice(-3);
      let savedAt: string | null = null;
      try {
        const { getMLTokenSavedAt } = await import('@/lib/ml-tokens');
        savedAt = await getMLTokenSavedAt();
      } catch { /* ignore */ }
      tokenInfo = {
        refreshExists: true,
        refreshMasked: mask(bag.refreshToken),
        refreshSavedAt: savedAt,
        accessMasked: mask(bag.accessToken),
        expiresIn: bag.expiresAt > Date.now() ? Math.round((bag.expiresAt - Date.now()) / 1000) : 0,
      };
    } else {
      tokenInfo = {
        refreshExists: false,
        refreshMasked: '',
        refreshSavedAt: null,
        accessMasked: '',
        expiresIn: 0,
      };
    }
  } catch {
    /* renovar falhou — reporta abaixo */
  }

  if (!hasClientId || !hasClientSecret) {
    message =
      'As credenciais do app do Mercado Livre (Client ID/Secret) não estão configuradas na Vercel. Conecte para habilitar a galeria.';
  } else if (tokenInfo?.refreshExists) {
    connected = true;
    message = tokenInfo.expiresIn > 0
      ? 'API do Mercado Livre conectada — galeria de fotos ativa.'
      : 'Token salvo, mas expirado — será renovado automaticamente no próximo uso.';
  } else {
    message = 'Não há refresh_token salvo no banco. Acesse "Conectar app do Mercado Livre" para autorizar.';
  }

  return NextResponse.json({ connected, message, hasCredentials: hasClientId && hasClientSecret, token: tokenInfo });
}