// Google Drive API 연동 — Vercel API Routes 백엔드 방식

export interface CloudData {
  widgets?: unknown[];
  background?: string;
  pages?: { id: string; widgets: unknown[]; background: string }[];
  version?: number;
  widgetConfigs?: Record<string, Record<string, unknown>>;
}

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

// 로그인 (API Route로 리다이렉트)
export function signIn() {
  window.location.href = '/api/auth/login';
}

// 로그아웃
export async function signOut() {
  await fetch('/api/auth/logout', { credentials: 'same-origin' }).catch(() => {});
}

// 세션 확인 (서버에서 토큰 갱신까지 처리)
export async function getMe(): Promise<{ loggedIn: boolean; user?: UserInfo }> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return { loggedIn: false };
    return await res.json();
  } catch {
    return { loggedIn: false };
  }
}

// 구글 드라이브에 데이터 저장
export async function saveToDrive(data: CloudData): Promise<boolean> {
  try {
    const res = await fetch('/api/drive/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    if (res.status === 401) return false;
    const result = await res.json();
    return result.ok === true;
  } catch {
    return false;
  }
}

// 구글 드라이브에서 데이터 로드
export async function loadFromDrive(): Promise<CloudData | null> {
  try {
    const res = await fetch('/api/drive/load', { credentials: 'same-origin' });
    if (res.status === 401) return null;
    const result = await res.json();
    return result.data || null;
  } catch {
    return null;
  }
}
