import { useState, useCallback, useEffect, useRef } from 'react';
import { IoExpand, IoContract, IoCloudUpload, IoCloudDownload } from 'react-icons/io5';
import { useWidgetStore, loadBackground, saveBackground } from './store/widgetStore';
import Toolbar from './components/Toolbar';
import BackgroundPicker from './components/BackgroundPicker';
import WidgetRenderer from './components/WidgetRenderer';
import { BACKGROUNDS } from './constants';
import { useCanvasScale } from './hooks/useCanvasScale';

import {
  signIn,
  signOut,
  isSignedIn,
  saveToDrive,
  loadFromDrive,
  getUserInfo,
} from './services/googleDrive';

function App() {
  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    updateConfig,
    bringToFront,
    loadAll,
  } = useWidgetStore();

  const [background, setBackground] = useState(
    () => loadBackground() || BACKGROUNDS[0]
  );
  const { scaleX, scaleY, scaleSize } = useCanvasScale();
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 구글 드라이브 관련 상태
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 프로필 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  // 동기화 메시지 자동 숨김
  const msgTimerRef = useRef<number>(0);
  const showMsg = (msg: string) => {
    setSyncMsg(msg);
    clearTimeout(msgTimerRef.current);
    msgTimerRef.current = window.setTimeout(() => setSyncMsg(''), 2500);
  };

  // 전체화면
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Google Auth 초기화는 자동 로드 useEffect에서 처리

  const handleBgChange = (bg: string) => {
    setBackground(bg);
    saveBackground(bg);
  };

  // 로그인 로딩 상태
  const [loginLoading, setLoginLoading] = useState(false);

  // 구글 로그인 (팝업 방식)
  const handleSignIn = async () => {
    try {
      await signIn(); // 팝업에서 토큰 받을 때까지 대기
      setLoginLoading(true);
      const [info, data] = await Promise.all([getUserInfo(), loadFromDrive()]);
      if (info) {
        setUser(info);
      }
      if (data) {
        skipAutoSaveRef.current = true;
        loadAll(data.widgets as Parameters<typeof loadAll>[0]);
        if (data.background) {
          setBackground(data.background);
          saveBackground(data.background);
        }
      }
      showMsg(`${info?.name || ''}님 로그인 완료`);
    } catch {
      // 팝업 닫힘 또는 차단 — 무시
    }
    setLoginLoading(false);
  };

  // 페이지 로드 시: 저장된 토큰이 있으면 세션 복구
  useEffect(() => {
    if (isSignedIn()) {
      (async () => {
        const info = await getUserInfo();
        if (info) {
          setUser(info);
        } else {
          // 토큰 만료 → 정리
          signOut();
        }
      })();
    }
  }, []);

  // 구글 로그아웃
  const handleSignOut = () => {
    signOut();
    setUser(null);
    setShowUserMenu(false);
    showMsg('로그아웃 완료');
  };

  // 자동 저장 (30초 디바운스)
  const autoSaveTimerRef = useRef<number>(0);
  const skipAutoSaveRef = useRef(false); // 클라우드 로드 직후 자동 저장 방지
  const widgetsRef = useRef(widgets);
  const backgroundRef = useRef(background);
  widgetsRef.current = widgets;
  backgroundRef.current = background;

  useEffect(() => {
    if (!user) return; // 로그인 상태에서만 자동 저장
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }

    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(async () => {
      if (!isSignedIn()) return;
      const ok = await saveToDrive({ widgets: widgetsRef.current, background: backgroundRef.current });
      if (ok) showMsg('자동 저장 완료');
    }, 30000);

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [widgets, background, user]);

  // 수동 클라우드 저장
  const handleSave = async () => {
    if (!isSignedIn()) {
      showMsg('먼저 로그인해주세요');
      return;
    }
    setSyncing(true);
    const ok = await saveToDrive({ widgets, background });
    setSyncing(false);
    showMsg(ok ? '클라우드에 저장 완료' : '저장 실패');
  };

  // 클라우드에서 불러오기
  const handleLoad = async () => {
    if (!isSignedIn()) {
      showMsg('먼저 로그인해주세요');
      return;
    }
    setSyncing(true);
    const data = await loadFromDrive();
    setSyncing(false);
    if (data) {
      skipAutoSaveRef.current = true;
      loadAll(data.widgets as Parameters<typeof loadAll>[0]);
      if (data.background) {
        setBackground(data.background);
        saveBackground(data.background);
      }
      showMsg('클라우드에서 불러오기 완료');
    } else {
      showMsg('저장된 데이터가 없습니다');
    }
  };

  const bgStyle = background.startsWith('linear-gradient')
    ? { background }
    : { backgroundColor: background };

  return (
    <div className="w-full h-full relative overflow-hidden" style={bgStyle}>
      {/* 로그인 로딩 오버레이 */}
      {loginLoading && (
        <div className="absolute inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col items-center gap-4" style={{ padding: '32px 48px' }}>
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-700">로그인 중...</p>
          </div>
        </div>
      )}

      {/* 오른쪽 상단 버튼들 */}
      <div className="absolute top-4 right-4 z-[9999] flex items-center gap-2">
        {/* 동기화 메시지 */}
        {syncMsg && (
          <div className="h-9 flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/60 text-slate-600 text-xs font-medium" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {syncMsg}
          </div>
        )}

        {/* 클라우드 저장/불러오기 */}
        {user && (
          <>
            <button
              onClick={handleSave}
              disabled={syncing}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/60 text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="클라우드에 저장"
            >
              <IoCloudUpload size={18} />
            </button>
            <button
              onClick={handleLoad}
              disabled={syncing}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/60 text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors disabled:opacity-50"
              title="클라우드에서 불러오기"
            >
              <IoCloudDownload size={18} />
            </button>
          </>
        )}

        {/* 로그인/프로필 */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden shadow-lg border-2 border-emerald-400 hover:border-emerald-500 transition-colors"
              title={user.name}
            >
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            </button>
            {/* 온라인 표시 */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            {showUserMenu && (
              <div className="absolute right-0 top-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/60 min-w-[200px] overflow-hidden">
                <div style={{ padding: '14px 20px 10px' }}>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>
                </div>
                <div style={{ padding: '4px 12px 8px' }}>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    style={{ padding: '8px 12px' }}
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/60 hover:bg-white transition-colors"
            title="구글 로그인"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        )}

        {/* 전체화면 */}
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/60 text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
          title={isFullscreen ? '전체화면 종료' : '전체화면'}
        >
          {isFullscreen ? <IoContract size={18} /> : <IoExpand size={18} />}
        </button>
      </div>

      {/* 위젯 캔버스 */}
      {widgets.map((widget) => (
        <WidgetRenderer
          key={widget.id}
          widget={widget}
          scaleX={scaleX}
          scaleY={scaleY}
          scaleSize={scaleSize}
          onUpdate={updateWidget}
          onRemove={removeWidget}
          onBringToFront={bringToFront}
          onConfigChange={updateConfig}
        />
      ))}

      {/* 빈 화면 안내 */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/70">
            <p className="text-5xl mb-4">🏫</p>
            <h1 className="text-2xl font-bold mb-2">ClassBoard</h1>
            <p className="text-sm">아래 도구 모음에서 위젯을 추가하세요</p>
          </div>
        </div>
      )}

      {/* 하단 도구 모음 */}
      <Toolbar
        onAddWidget={addWidget}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 배경 설정 모달 */}
      {showSettings && (
        <BackgroundPicker
          current={background}
          onChange={handleBgChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 하단 왼쪽 제작자 */}
      <div className="absolute bottom-2 left-4 z-[9999]">
        <span className="text-[10px] text-white/40">제작자: 윤희류(경남 황산초등학교)</span>
        <a href="https://classroomscreen.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/40 hover:text-white/70 transition-colors ml-2">참고: classroomscreen.com</a>
      </div>

      {/* 하단 오른쪽 링크 */}
      <div className="absolute bottom-2 right-4 z-[9999] flex gap-3">
        <span className="text-[10px] text-white/40">교실에서 사용하는 무료 위젯 화면 도구</span>
        <a href="/privacy" target="_blank" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">개인정보처리방침</a>
        <a href="/terms" target="_blank" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">서비스 약관</a>
      </div>
    </div>
  );
}

export default App;
