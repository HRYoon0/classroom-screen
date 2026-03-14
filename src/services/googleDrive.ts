// Google Drive API 연동 - 팝업 방식 OAuth + appDataFolder

const CLIENT_ID = '739342381531-n47l404ioq2a9pssu0unha5sv5j75vit.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email';
const FILE_NAME = 'classboard-data.json';

const TOKEN_KEY = 'classboard-token';
const FILE_ID_KEY = 'classboard-file-id';

let accessToken: string | null = localStorage.getItem(TOKEN_KEY);
let cachedFileId: string | null = localStorage.getItem(FILE_ID_KEY);

export interface CloudData {
  widgets: unknown[];
  background: string;
  widgetConfigs?: Record<string, Record<string, unknown>>;
}

// 팝업 방식 로그인 - Promise로 토큰 반환
export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: SCOPES,
      include_granted_scopes: 'true',
      prompt: 'select_account',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const w = 500;
    const h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(url, 'google-auth', `width=${w},height=${h},left=${left},top=${top}`);

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다'));
      return;
    }

    // 팝업 URL 변화 감지 (리다이렉트 후 해시에서 토큰 추출)
    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          reject(new Error('로그인 취소'));
          return;
        }
        // 같은 origin으로 돌아오면 URL 접근 가능
        const popupUrl = popup.location.href;
        if (popupUrl.startsWith(redirectUri) && popupUrl.includes('#')) {
          clearInterval(timer);
          const hash = popup.location.hash;
          popup.close();

          const hashParams = new URLSearchParams(hash.substring(1));
          const token = hashParams.get('access_token');
          if (token) {
            accessToken = token;
            localStorage.setItem(TOKEN_KEY, token);
            resolve(token);
          } else {
            reject(new Error('토큰을 받지 못했습니다'));
          }
        }
      } catch {
        // cross-origin 에러 무시 (아직 Google 페이지에 있는 동안)
      }
    }, 200);
  });
}

// 로그아웃 (토큰만 정리, 앱 권한은 유지)
export function signOut() {
  accessToken = null;
  cachedFileId = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FILE_ID_KEY);
}

export function isSignedIn() {
  return !!accessToken;
}

// 앱 시작 시 토큰 확인
export async function restoreSession(): Promise<boolean> {
  if (!accessToken) return false;

  try {
    // getUserInfo로 토큰 유효성 간접 확인
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) return true;

    // 401 = 토큰 만료 → 로그아웃
    if (res.status === 401) {
      signOut();
      return false;
    }

    // 기타 에러 (네트워크 등) → 일단 유지
    return true;
  } catch {
    // 네트워크 오류 — 오프라인일 수 있으므로 토큰 유지
    return true;
  }
}

// appDataFolder에서 파일 ID 찾기
async function findFileId(useCache = true): Promise<string | null> {
  if (useCache && cachedFileId) return cachedFileId;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  cachedFileId = data.files?.[0]?.id || null;
  if (cachedFileId) localStorage.setItem(FILE_ID_KEY, cachedFileId);
  return cachedFileId;
}

// 구글 드라이브에서 데이터 로드
export async function loadFromDrive(): Promise<CloudData | null> {
  if (!accessToken) return null;

  try {
    // 캐시된 fileId로 먼저 시도
    if (cachedFileId) {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${cachedFileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.ok) return await res.json();
      cachedFileId = null;
      localStorage.removeItem(FILE_ID_KEY);
    }

    const fileId = await findFileId(false);
    if (!fileId) return null;

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// 구글 드라이브에 데이터 저장
export async function saveToDrive(data: CloudData): Promise<boolean> {
  if (!accessToken) return false;

  try {
    const fileId = await findFileId();
    const body = JSON.stringify(data);

    if (fileId) {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body,
        }
      );
      return res.ok;
    } else {
      const metadata = {
        name: FILE_NAME,
        parents: ['appDataFolder'],
      };
      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', new Blob([body], { type: 'application/json' }));

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      if (res.ok) {
        const created = await res.json();
        cachedFileId = created.id;
        if (cachedFileId) localStorage.setItem(FILE_ID_KEY, cachedFileId);
      }
      return res.ok;
    }
  } catch {
    return false;
  }
}

// 사용자 정보 가져오기
export async function getUserInfo(): Promise<{ name: string; email: string; picture: string } | null> {
  if (!accessToken) return null;
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
