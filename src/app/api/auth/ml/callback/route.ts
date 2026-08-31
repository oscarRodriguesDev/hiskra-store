import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
  const redirectUri = 'https://store.hiskra.com.br/api/auth/ml/callback';

  if (!clientId || !clientSecret) {
    console.error('ML credentials not configured');
    return NextResponse.redirect(
      new URL('/?ml_error=missing_credentials', request.url)
    );
  }

  // Obter code_verifier do cookie PKCE
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('ml_code_verifier')?.value;

  if (!codeVerifier) {
    console.error('ML PKCE error: code_verifier missing');
    return NextResponse.redirect(
      new URL('/?ml_error=pkce_verifier_missing', request.url)
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
        code_verifier: codeVerifier,
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

    // Persiste os tokens no banco para renovação automática futura
    try {
      const { saveMLTokenBag } = await import('@/lib/ml-tokens');
      await saveMLTokenBag({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in || 21600) * 1000,
      });
    } catch (err) {
      console.error('ML tokens persist falhou:', err);
    }

    // Limpar cookie do code_verifier
    const successUrl = new URL('/', request.url);
    successUrl.searchParams.set('ml_success', '1');

    const response = NextResponse.redirect(successUrl);
    response.cookies.delete('ml_code_verifier');

    console.log('ML Tokens obtidos e persistidos:', {
      has_access: !!tokens.access_token,
      has_refresh: !!tokens.refresh_token,
      expires_in: tokens.expires_in,
    });

    return response;
  } catch (err) {
    console.error('ML callback error:', err);
    return NextResponse.redirect(
      new URL('/?ml_error=server_error', request.url)
    );
  }
}