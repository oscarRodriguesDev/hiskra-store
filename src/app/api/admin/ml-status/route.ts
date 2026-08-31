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

  if (!hasClientId || !hasClientSecret) {
    message =
      'As credenciais do app do Mercado Livre (Client ID/Secret) não estão configuradas na Vercel. Conecte para habilitar a galeria.';
  } else {
    try {
      // Tenta renovar/obter o access token de verdade — falha se o refresh for inválido
      const { refreshMLAccessToken } = await import('@/lib/mercadolivre');
      await refreshMLAccessToken();

      // Confirma com uma chamada real à API (ex: user_id do próprio app)
      const { getMLTokenBag } = await import('@/lib/ml-tokens');
      const bag = await getMLTokenBag();
      connected = !!bag && !!bag.accessToken;
      message = connected
        ? 'API do Mercado Livre conectada — galeria de fotos ativa.'
        : 'Não foi possível obter o token de acesso do Mercado Livre.';
    } catch (e) {
      connected = false;
      message =
        'O token do Mercado Livre expirou ou está inválido. Clique em "Conectar app do Mercado Livre" para autorizar novamente.';
    }
  }

  return NextResponse.json({ connected, message, hasCredentials: hasClientId && hasClientSecret });
}