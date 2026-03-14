// Google Drive API 연동 - 팝업 방식 OAuth + appDataFolder

const CLIENT_ID = '739342381531-n47l404ioq2a9pssu0unha5sv5j75vit.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email';
const FILE_NAME = 'classboard-data.json';

const TOKEN_KEY = 'classboard-token';
const TOKEN_EXPIRY_KEY = 'classboard-token-expiry';
const FILE_ID_KEY = 'classboard-file-id';

let accessToken: string | null = localStorage.getItem(TOKEN_KEY);
let cachedFileId: string | null = localStorage.getItem(FILE_ID_KEY);

export interface CloudData {
  widgets: unknown[];
  background: string;
  widgetConfigs?: Record<string, Record<string, unknown>>;
}

// 토큰 + 만료 시각 저장
function saveToken(token: string, expiresIn: number) {
  accessToken = token;
  localStorage.setItem(TOKEN_KEY, token);
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
}

// 토큰 만료 여부 확인 (API 호출 없이)
function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  // 5분 여유를 두고 만료 판정
  return Date.now() > Number(expiry) - 5 * 60 * 1000;
}

// 팝업 방식 로그인 - Promise로 토큰 반환
function openAuthPopup(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const redirectUri = window.location.origin;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: SCOPES,
      include_granted_scopes: 'true',
      prompt,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const w = prompt === 'none' ? 1 : 500;
    const h = prompt === 'none' ? 1 : 600;
    const left = prompt === 'none' ? -100 : window.screenX + (window.outerWidth - w) / 2;
    const top = prompt === 'none' ? -100 : window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(url, 'google-auth', `width=${w},height=${h},left=${left},top=${top}`);

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다'));
      return;
    }

    const timeout = setTimeout(() => {
      clearInterval(timer);
      try { popup.close(); } catch { /* 무시 */ }
      reject(new Error('시간 초과'));
    }, prompt === 'none' ? 8000 : 120000);

    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          clearTimeout(timeout);
          reject(new Error('로그인 취소'));
          return;
        }
        const popupUrl = popup.location.href;
        if (popupUrl.startsWith(redirectUri)) {
          clearInterval(timer);
          clearTimeout(timeout);

          if (popupUrl.includes('#')) {
            const hashParams = new URLSearchParams(popup.location.hash.substring(1));
            popup.close();
            const token = hashParams.get('access_token');
            const expiresIn = Number(hashParams.get('expires_in') || '3600');
            if (token) {
              saveToken(token, expiresIn);
              resolve(token);
              return;
            }
          }
          popup.close();
          reject(new Error('토큰을 받지 못했습니다'));
        }
      } catch {
        // cross-origin 에러 무시
      }
    }, 200);
  });
}

// 사용자 로그인 (계정 선택 팝업)
export function signIn(): Promise<string> {
  return openAuthPopup('select_account');
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

// 앱 시작 / 탭 복귀 시 세션 복원
export async function restoreSession(): Promise<boolean> {
  if (!accessToken) return false;

  // 만료 시각 기반 확인 (API 호출 없음)
  if (!isTokenExpired()) return true;

  // 만료됨 → prompt=none으로 자동 갱신 시도 (이전에 동의한 사용자면 팝업 안 보임)
  try {
    await openAuthPopup('none');
    return true;
  } catch {
    // 갱신 실패 → 로그아웃하지 않고 토큰만 유지 (다음 API 호출에서 실패하면 그때 처리)
    // 사용자에게 팝업을 보여주지 않음
    signOut();
    return false;
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
