import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || '';
const COOKIE_NAME = 'cb_session';

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp ms
  user: { name: string; email: string; picture: string };
}

// AES-256-GCM 암호화
function encrypt(data: string): string {
  const key = crypto.scryptSync(SECRET, 'salt', 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted}`;
}

function decrypt(encoded: string): string {
  const [ivB64, tagB64, encrypted] = encoded.split('.');
  if (!ivB64 || !tagB64 || !encrypted) throw new Error('Invalid session');
  const key = crypto.scryptSync(SECRET, 'salt', 32);
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 세션 쿠키 생성
export function createSessionCookie(session: SessionData): string {
  const value = encrypt(JSON.stringify(session));
  const maxAge = 30 * 24 * 60 * 60; // 30일
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

// 세션 쿠키 삭제
export function deleteSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// 요청에서 세션 파싱
export function parseSession(cookieHeader: string | undefined): SessionData | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split('=').slice(1).join('=').trim();
  if (!value) return null;
  try {
    return JSON.parse(decrypt(value));
  } catch {
    return null;
  }
}

// access_token 갱신 (만료 시)
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
} | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// 유효한 access_token을 가진 세션 반환 (자동 갱신 포함)
export async function getValidSession(
  cookieHeader: string | undefined
): Promise<{ session: SessionData; newCookie?: string } | null> {
  const session = parseSession(cookieHeader);
  if (!session) return null;

  // 만료 1분 전이면 갱신
  if (Date.now() > session.expiresAt - 60 * 1000) {
    const refreshed = await refreshAccessToken(session.refreshToken);
    if (!refreshed) return null;

    const updated: SessionData = {
      ...session,
      accessToken: refreshed.accessToken,
      expiresAt: Date.now() + refreshed.expiresIn * 1000,
    };
    return { session: updated, newCookie: createSessionCookie(updated) };
  }

  return { session };
}
