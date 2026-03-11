// Google Drive API 연동 - appDataFolder에 설정 저장/로드

const CLIENT_ID = '739342381531-n47l404ioq2a9pssu0unha5sv5j75vit.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email';
const FILE_NAME = 'classroom-screen-data.json';

const TOKEN_KEY = 'classroom-screen-token';
let accessToken: string | null = localStorage.getItem(TOKEN_KEY);
let refreshTimer: number | null = null;

const USER_EMAIL_KEY = 'classroom-screen-email';

// 타입 선언
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => { requestAccessToken: (opts?: { prompt?: string; login_hint?: string }) => void };
    };
  };
};

export interface CloudData {
  widgets: unknown[];
  background: string;
}

// tokenClient를 한 번만 생성하고 재사용
let tokenClient: ReturnType<typeof google.accounts.oauth2.initTokenClient> | null = null;
let pendingResolve: ((token: string) => void) | null = null;
let pendingReject: ((err: Error) => void) | null = null;

// Google 로그인 초기화 + tokenClient 미리 생성
export function initGoogleAuth(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        // tokenClient 미리 생성 (로그인 버튼 클릭 시 즉시 사용)
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              pendingReject?.(new Error(response.error));
              pendingResolve = null;
              pendingReject = null;
              return;
            }
            saveToken(response.access_token!);
            pendingResolve?.(accessToken!);
            pendingResolve = null;
            pendingReject = null;
          },
        });
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// 토큰 저장 + 50분 후 자동 갱신 타이머 설정
function saveToken(token: string) {
  accessToken = token;
  localStorage.setItem(TOKEN_KEY, token);
  scheduleRefresh();
}

// 50분 후 자동으로 토큰 갱신 (만료 전 갱신)
function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    refreshToken();
  }, 50 * 60 * 1000);
}

// 팝업 없이 토큰 갱신
function refreshToken() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: '' });
}

// 토큰 요청 (로그인) - 미리 생성된 tokenClient 재사용
export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized'));
      return;
    }
    pendingResolve = resolve;
    pendingReject = reject;
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

// 페이지 로드 시 저장된 토큰이 있으면 갱신 타이머 시작
export function restoreSession() {
  if (accessToken) {
    scheduleRefresh();
  }
}

// 로그인한 이메일 저장 (다음 로그인 시 계정 선택 건너뛰기용)
export function saveLoginHint(email: string) {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

// 로그아웃 (토큰만 정리, 앱 권한은 유지하여 다음 로그인 시 동의 화면 생략)
export function signOut() {
  if (refreshTimer) clearTimeout(refreshTimer);
  accessToken = null;
  cachedFileId = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FILE_ID_KEY);
  // USER_EMAIL_KEY는 유지 (다음 로그인 시 계정 자동 선택용)
}

export function isSignedIn() {
  return !!accessToken;
}

// 파일 ID 캐시 (매번 검색 API 호출 방지) - localStorage에도 저장
const FILE_ID_KEY = 'classroom-screen-file-id';
let cachedFileId: string | null = localStorage.getItem(FILE_ID_KEY);

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
    // 캐시된 fileId로 먼저 시도 (API 호출 1회 절약)
    if (cachedFileId) {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${cachedFileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.ok) return await res.json();
      // 캐시 무효 → 다시 검색
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
      // 기존 파일 업데이트
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
      // 새 파일 생성
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
