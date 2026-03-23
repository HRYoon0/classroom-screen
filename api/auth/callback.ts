import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionCookie } from '../_lib/session';

// 쿠키 수동 파싱 (req.cookies가 없는 경우 대비)
function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  header.split(';').forEach((c) => {
    const [key, ...rest] = c.trim().split('=');
    if (key) cookies[key] = rest.join('=');
  });
  return cookies;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appUrl = process.env.APP_URL || 'https://classboard-app.vercel.app';

  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${appUrl}?login=error&reason=no_code`);
    }

    // 임시 쿠키에서 code_verifier + state 복원
    const cookies = parseCookies(req.headers.cookie);
    const tempCookie = cookies['cb_auth_temp'];
    if (!tempCookie) return res.redirect(`${appUrl}?login=error&reason=no_temp_cookie`);

    let codeVerifier: string;
    let savedState: string;
    try {
      const parsed = JSON.parse(Buffer.from(tempCookie, 'base64').toString());
      codeVerifier = parsed.codeVerifier;
      savedState = parsed.state;
    } catch {
      return res.redirect(`${appUrl}?login=error&reason=parse_error`);
    }

    // CSRF 검증
    if (state !== savedState) return res.redirect(`${appUrl}?login=error&reason=state_mismatch`);

  // code → tokens 교환
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: `${appUrl}/api/auth/callback`,
      code_verifier: codeVerifier,
    }),
  });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.redirect(`${appUrl}?login=error&reason=token_exchange&detail=${encodeURIComponent(errText.slice(0, 100))}`);
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;

    if (!access_token) return res.redirect(`${appUrl}?login=error&reason=no_access_token`);

    // refresh_token이 없을 수 있음 (이미 동의한 사용자) — 그래도 진행
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userRes.ok ? await userRes.json() : { name: '', email: '', picture: '' };

    const sessionCookie = createSessionCookie({
      accessToken: access_token,
      refreshToken: refresh_token || '',
      expiresAt: Date.now() + (expires_in || 3600) * 1000,
      user: { name: user.name || '', email: user.email || '', picture: user.picture || '' },
    });

    res.setHeader('Set-Cookie', [
      sessionCookie,
      'cb_auth_temp=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    ]);

    return res.redirect(`${appUrl}?login=success`);
  } catch (err) {
    const appUrl = process.env.APP_URL || 'https://classboard-app.vercel.app';
    return res.redirect(`${appUrl}?login=error&reason=exception&msg=${encodeURIComponent(String(err).slice(0, 100))}`);
  }
}
