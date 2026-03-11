// Google Drive API 연동 - appDataFolder에 설정 저장/로드

const CLIENT_ID = '739342381531-n47l404ioq2a9pssu0unha5sv5j75vit.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email';
const FILE_NAME = 'classroom-screen-data.json';

const TOKEN_KEY = 'classroom-screen-token';
let accessToken: string | null = localStorage.getItem(TOKEN_KEY);
let refreshTimer: number | null = null;

// 타입 선언
declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
      revoke: (token: string, cb: () => void) => void;
    };
  };
};

export interface CloudData {
  widgets: unknown[];
  background: string;
}

// Google 로그인 초기화
export function initGoogleAuth(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (typeof google !== 'undefined' && google.accounts) {
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
  }, 50 * 60 * 1000); // 50분
}

// 팝업 없이 토큰 갱신
function refreshToken() {
  if (typeof google === 'undefined') return;
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error || !response.access_token) {
        // 갱신 실패 시 로그아웃 처리
        accessToken = null;
        localStorage.removeItem(TOKEN_KEY);
        return;
      }
      saveToken(response.access_token);
    },
  });
  client.requestAccessToken({ prompt: '' });
}

// 토큰 요청 (로그인) - 매번 새 tokenClient 생성하여 callback 갱신
export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        saveToken(response.access_token!);
        resolve(accessToken!);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

// 페이지 로드 시 저장된 토큰이 있으면 갱신 타이머 시작
export function restoreSession() {
  if (accessToken) {
    scheduleRefresh();
  }
}

// 로그아웃
export function signOut() {
  if (refreshTimer) clearTimeout(refreshTimer);
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

export function isSignedIn() {
  return !!accessToken;
}

// appDataFolder에서 파일 ID 찾기
async function findFileId(): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

// 구글 드라이브에서 데이터 로드
export async function loadFromDrive(): Promise<CloudData | null> {
  if (!accessToken) return null;

  try {
    const fileId = await findFileId();
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
