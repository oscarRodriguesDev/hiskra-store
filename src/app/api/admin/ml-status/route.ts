import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getMLTokenBag } from '@/lib/ml-tokens';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ml-status — mostra se a API do ML está conectada (galeria disponível)
 * Requer sessão admin.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const clientId = process.env.ML_CLIENT_ID ? true : false;
  const clientSecret = process.env.ML_CLIENT_SECRET ? true : false;

  let connected = false;
  let message = '';

  if (!clientId || !clientSecret) {
    message = 'As credenciais do app do Mercado Livre (Client ID/Secret) não estão configuradas na Vercel.';
  } else {
    const bag = await getMLTokenBag();
    if (bag && bag.refreshToken) {
      connected = true;
      message =
        bag.expiresAt > Date.now()
          ? 'Token conectado e válido.'
          : 'Token expirando — será renovado automaticamente no próximo uso.';
    } else {
      message = 'Ainda não há token salvo. Conecte o app do Mercado Livre para habilitar a galeria de fotos.';
    }
  }

  return NextResponse.json({ connected, message, hasCredentials: clientId && clientSecret });
}