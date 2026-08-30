import { NextRequest, NextResponse } from 'next/server';

const ML_BASE_URL = 'https://api.mercadolibre.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('ML OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?ml_error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?ml_error=missing_code', request.url)
    );
  }

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hiskra-store.vercel.app'}/api/auth/ml/callback`;

  if (!clientId || !clientSecret) {
    console.error('ML credentials not configured');
    return NextResponse.redirect(
      new URL('/?ml_error=missing_credentials', request.url)
    );
  }

  try {
    const tokenResponse = await fetch(`${ML_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('ML token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(
        new URL(`/?ml_error=${encodeURIComponent('token_exchange_failed')}`, request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Em produção, salve o refresh_token no banco/env de forma segura
    // Por enquanto, mostra na tela para você copiar para .env
    const refreshToken = tokens.refresh_token;
    const accessToken = tokens.access_token;
    const expiresIn = tokens.expires_in;

    console.log('ML Tokens obtained:', {
      access_token: accessToken?.substring(0, 20) + '...',
      refresh_token: refreshToken?.substring(0, 20) + '...',
      expires_in: expiresIn,
    });

    // Redireciona para página com tokens na URL (apenas para dev - copiar manualmente)
    const successUrl = new URL('/?ml_success=1', request.url);
    successUrl.searchParams.set('refresh_token', refreshToken);
    successUrl.searchParams.set('expires_in', String(expiresIn));

    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error('ML callback error:', err);
    return NextResponse.redirect(
      new URL('/?ml_error=server_error', request.url)
    );
  }
}