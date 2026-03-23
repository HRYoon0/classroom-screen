// Google Drive API 연동 - GIS(Google Identity Services) + appDataFolder

const CLIENT_ID = '739342381531-n47l404ioq2a9pssu0unha5sv5j75vit.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email';
const FILE_NAME = 'classboard-data.json';

const TOKEN_KEY = 'classboard-token';
const TOKEN_EXPIRY_KEY = 'classboard-token-expiry';
const FILE_ID_KEY = 'classboard-file-id';

let accessToken: string | null = localStorage.getItem(TOKEN_KEY);
let cachedFileId: string | null = localStorage.getItem(FILE_ID_KEY);
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export interface CloudData {
  // v1 하위 호환
  widgets?: unknown[];
  background?: string;
  // v2 멀티 페이지
  pages?: { id: string; widgets: unknown[]; background: string }[];
  version?: number;
  // 공통
  widgetConfigs?: Record<string, Record<string, unknown>>;
}

// 토큰 + 만료 시각 저장
function saveToken(token: string, expiresIn: number) {
  accessToken = token;
  localStorage.setItem(TOKEN_KEY, token);
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
}

// 토큰 만료 여부 확인
function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > Number(expiry) - 60 * 1000;
}

// 토큰 존재 여부만 확인 (갱신은 시도하지 않음 — 팝업 차단 방지)
function hasToken(): boolean {
  return !!accessToken;
}

// GIS 초기화 — 앱 시작 시 1회 호출
export function initGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    const tryInit = () => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: () => {},
          error_callback: () => {},
        });
        resolve();
      }
    };

    tryInit();
    if (tokenClient) return;

    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      tryInit();
      if (tokenClient || attempts > 100) {
        clearInterval(check);
        if (!tokenClient) reject(new Error('GIS 로드 실패'));
      }
    }, 100);
  });
}

// 사용자 로그인 (GIS 팝업)
export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('GIS 미초기화')); return; }

    tokenClient.callback = (response: google.accounts.oauth2.TokenResponse) => {
      if (response.error) { reject(new Error(response.error_description || response.error)); return; }
      saveToken(response.access_token, response.expires_in);
      resolve(response.access_token);
    };
    tokenClient.error_callback = (error: { type: string; message: string }) => {
      reject(new Error(error.message || '로그인 취소'));
    };

    tokenClient.requestAccessToken({ prompt: '' });
  });
}

// 자동 갱신 (prompt: 'none')
function silentRefresh(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('GIS 미초기화')); return; }

    const timeout = setTimeout(() => {
      reject(new Error('갱신 시간 초과'));
    }, 15000);

    tokenClient.callback = (response: google.accounts.oauth2.TokenResponse) => {
      clearTimeout(timeout);
      if (response.error) { reject(new Error(response.error)); return; }
      saveToken(response.access_token, response.expires_in);
      resolve(response.access_token);
    };
    tokenClient.error_callback = (error: { type: string; message: string }) => {
      clearTimeout(timeout);
      reject(new Error(error.message || '갱신 실패'));
    };

    tokenClient.requestAccessToken({ prompt: 'none' });
  });
}

// 로그아웃
export function signOut() {
  accessToken = null;
  cachedFileId = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(FILE_ID_KEY);
}

export function isSignedIn() {
  return !!accessToken;
}

// 앱 시작 / 탭 복귀 시 세션 복원 — 팝업 없이 만료 시각만 확인
export async function restoreSession(): Promise<'valid' | 'expired' | 'none'> {
  if (!accessToken) return 'none';
  // 만료 시각만 확인 (API 호출 없음, 팝업 없음)
  if (!isTokenExpired()) return 'valid';
  // 만료됐어도 유저 정보는 localStorage에 캐시되어 있으므로 그냥 expired 반환
  // 만료됐어도 유저 정보는 localStorage에 캐시되어 있으므로 프로필 유지
  return 'expired';
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
  if (!hasToken()) return null;

  try {
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
  if (!hasToken()) return false;

  try {
    const fileId = await findFileId();
    const body = JSON.stringify(data);
    if (fileId) {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body,
        }
      );
      return res.ok;
    } else {
      const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([body], { type: 'application/json' }));
      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form }
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
