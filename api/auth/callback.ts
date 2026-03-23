import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionCookie } from '../_lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state } = req.query;
  const appUrl = process.env.APP_URL || 'https://classboard-app.vercel.app';

  if (!code || typeof code !== 'string') {
    return res.redirect(`${appUrl}?login=error`);
  }

  // 임시 쿠키에서 code_verifier + state 복원
  const tempCookie = req.cookies?.cb_auth_temp;
  if (!tempCookie) return res.redirect(`${appUrl}?login=error`);

  let codeVerifier: string;
  let savedState: string;
  try {
    const parsed = JSON.parse(Buffer.from(tempCookie, 'base64').toString());
    codeVerifier = parsed.codeVerifier;
    savedState = parsed.state;
  } catch {
    return res.redirect(`${appUrl}?login=error`);
  }

  // CSRF 검증
  if (state !== savedState) return res.redirect(`${appUrl}?login=error`);

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

  if (!tokenRes.ok) return res.redirect(`${appUrl}?login=error`);

  const tokens = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokens;

  if (!access_token || !refresh_token) return res.redirect(`${appUrl}?login=error`);

  // 사용자 정보 가져오기
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = userRes.ok ? await userRes.json() : { name: '', email: '', picture: '' };

  // 세션 쿠키 생성
  const sessionCookie = createSessionCookie({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: Date.now() + expires_in * 1000,
    user: { name: user.name || '', email: user.email || '', picture: user.picture || '' },
  });

  // 임시 쿠키 삭제 + 세션 쿠키 설정
  res.setHeader('Set-Cookie', [
    sessionCookie,
    'cb_auth_temp=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  ]);

  res.redirect(`${appUrl}?login=success`);
}
