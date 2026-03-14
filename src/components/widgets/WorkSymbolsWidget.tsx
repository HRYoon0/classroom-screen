import { useState, useCallback, useEffect, useRef } from 'react';

interface Symbol {
  id: string;
  label: string;
  icon: (size: number) => React.ReactNode;
}

// SVG 라인 드로잉 스타일 아이콘들
const SYMBOLS: Symbol[] = [
  {
    id: 'silence',
    label: '조용히',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* 옆모습 얼굴: 이마 곡선 → 눈썹 → 코 → 입 → 턱 */}
        <path d="M30 15 C24 15, 18 20, 16 28 C14 36, 16 38, 20 40 L26 44 C28 45, 28 47, 26 48 L22 50 C18 52, 20 56, 24 58 C28 60, 32 58, 34 54 L36 48" fill="none" />
        {/* 눈 */}
        <circle cx="26" cy="30" r="2.5" fill="currentColor" stroke="none" />
        {/* 손가락 (세로 — 입 앞에 "쉿") */}
        <path d="M46 16 L46 52" strokeWidth="4" />
        {/* 손가락 끝 둥글게 */}
        <circle cx="46" cy="14" r="2" fill="currentColor" stroke="none" />
        {/* 손 (손가락 잡은 주먹) */}
        <path d="M42 52 C40 54, 40 58, 42 60 L50 60 C52 58, 52 54, 50 52" />
        {/* 지그재그 물결 (쉿 소리 표현) — 손 아래 */}
        <path d="M38 66 L41 62 L44 66 L47 62 L50 66 L53 62 L56 66" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'listen',
    label: '경청',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 귀 */}
        <path d="M40 16 C28 16, 20 26, 20 38 C20 48, 24 52, 28 56 C30 58, 30 62, 28 64" />
        <path d="M40 16 C48 16, 54 22, 54 30 C54 36, 50 40, 46 42 C44 44, 44 48, 46 50" />
        <path d="M34 38 C34 34, 38 30, 42 32 C44 34, 44 38, 42 40" />
        {/* 소리 파동 */}
        <path d="M58 26 C62 30, 62 38, 58 42" />
        <path d="M62 22 C68 28, 68 40, 62 46" />
        <path d="M66 18 C74 26, 74 42, 66 50" />
      </svg>
    ),
  },
  {
    id: 'discuss',
    label: '토론',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 사람 1 */}
        <circle cx="24" cy="24" r="8" />
        <path d="M12 52 C12 42, 18 36, 24 36 C30 36, 36 42, 36 52" />
        {/* 사람 2 */}
        <circle cx="56" cy="24" r="8" />
        <path d="M44 52 C44 42, 50 36, 56 36 C62 36, 68 42, 68 52" />
        {/* 말풍선 */}
        <path d="M30 18 L36 14 L36 22Z" fill="currentColor" />
        <path d="M50 18 L44 14 L44 22Z" fill="currentColor" />
        {/* 대화 표시 */}
        <line x1="34" y1="56" x2="46" y2="56" strokeDasharray="3 3" />
        <line x1="32" y1="60" x2="48" y2="60" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    id: 'question',
    label: '질문',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 사람 */}
        <circle cx="32" cy="22" r="8" />
        <path d="M20 52 C20 42, 26 36, 32 36 C38 36, 44 42, 44 52" />
        {/* 손 들기 */}
        <path d="M44 36 L52 20 L54 18" />
        <path d="M52 20 C52 16, 56 14, 58 16" />
        {/* 물음표 말풍선 */}
        <rect x="50" y="8" width="22" height="20" rx="4" />
        <path d="M58 14 C58 12, 62 12, 62 14 C62 16, 60 17, 60 19" />
        <circle cx="60" cy="22" r="1" fill="currentColor" />
        <path d="M56 28 L54 34" />
      </svg>
    ),
  },
  {
    id: 'write',
    label: '쓰기',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 연필 */}
        <path d="M20 60 L50 20 L56 24 L26 64 Z" />
        <line x1="50" y1="20" x2="56" y2="24" />
        <line x1="46" y1="28" x2="52" y2="32" />
        <path d="M20 60 L18 66 L26 64" />
        {/* 종이 */}
        <rect x="30" y="40" width="30" height="30" rx="2" />
        <line x1="36" y1="48" x2="54" y2="48" />
        <line x1="36" y1="54" x2="54" y2="54" />
        <line x1="36" y1="60" x2="48" y2="60" />
      </svg>
    ),
  },
  {
    id: 'read',
    label: '읽기',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 펼친 책 */}
        <path d="M40 22 C40 22, 28 18, 16 20 L16 58 C28 56, 40 60, 40 60" />
        <path d="M40 22 C40 22, 52 18, 64 20 L64 58 C52 56, 40 60, 40 60" />
        <line x1="40" y1="22" x2="40" y2="60" />
        {/* 글줄 */}
        <line x1="22" y1="30" x2="34" y2="28" />
        <line x1="22" y1="36" x2="34" y2="34" />
        <line x1="22" y1="42" x2="34" y2="40" />
        <line x1="46" y1="28" x2="58" y2="30" />
        <line x1="46" y1="34" x2="58" y2="36" />
        <line x1="46" y1="40" x2="58" y2="42" />
      </svg>
    ),
  },
  {
    id: 'pair',
    label: '짝활동',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 사람 1 */}
        <circle cx="28" cy="26" r="8" />
        <path d="M16 56 C16 44, 22 38, 28 38 C34 38, 40 44, 40 56" />
        {/* 사람 2 */}
        <circle cx="52" cy="26" r="8" />
        <path d="M40 56 C40 44, 46 38, 52 38 C58 38, 64 44, 64 56" />
        {/* 연결 화살표 */}
        <path d="M36 30 L44 30" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'computer',
    label: '컴퓨터',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 모니터 */}
        <rect x="14" y="14" width="52" height="36" rx="3" />
        <rect x="18" y="18" width="44" height="28" rx="1" />
        {/* 받침대 */}
        <line x1="40" y1="50" x2="40" y2="58" />
        <line x1="28" y1="58" x2="52" y2="58" />
        {/* 키보드 */}
        <rect x="22" y="62" width="36" height="8" rx="2" />
        <line x1="28" y1="66" x2="52" y2="66" />
      </svg>
    ),
  },
];

interface WidgetProps {
  isSelected?: boolean;
}

export default function WorkSymbolsWidget({ isSelected = false }: WidgetProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  // 각 아이콘의 표시 여부를 개별 관리
  const [visibleIcons, setVisibleIcons] = useState<boolean[]>(SYMBOLS.map(() => false));
  const [showPicker, setShowPicker] = useState(false);
  const timersRef = useRef<number[]>([]);

  // 등장: 왼쪽부터 하나씩 페이드인
  // 퇴장: 왼쪽부터 하나씩 페이드아웃
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (isSelected) {
      setShowPicker(true);
      SYMBOLS.forEach((_, i) => {
        const t = window.setTimeout(() => {
          setVisibleIcons((prev) => { const next = [...prev]; next[i] = true; return next; });
        }, i * 60);
        timersRef.current.push(t);
      });
    } else if (showPicker) {
      SYMBOLS.forEach((_, i) => {
        const t = window.setTimeout(() => {
          setVisibleIcons((prev) => { const next = [...prev]; next[i] = false; return next; });
        }, i * 50);
        timersRef.current.push(t);
      });
      // 모두 사라진 후 DOM 제거
      const t = window.setTimeout(() => {
        setShowPicker(false);
      }, SYMBOLS.length * 50 + 200);
      timersRef.current.push(t);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [isSelected]);

  const handleSelect = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  const active = SYMBOLS[activeIdx];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* 메인 원형 아이콘 */}
      <div style={{
        width: '240px',
        height: '240px',
        borderRadius: '50%',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        color: '#1e293b',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
      }}>
        {active.icon(110)}
        <span style={{
          fontSize: '22px',
          fontWeight: 600,
          color: '#475569',
          marginTop: '6px',
        }}>
          {active.label}
        </span>
      </div>

      {/* 하단 선택 바 */}
      {showPicker && (
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
        }}>
          {SYMBOLS.map((sym, i) => (
            <button
              key={sym.id}
              onClick={(e) => { e.stopPropagation(); handleSelect(i); }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: activeIdx === i ? '2px solid #6366f1' : '2px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeIdx === i ? '#6366f1' : '#64748b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: 0,
                opacity: visibleIcons[i] ? 1 : 0,
                transform: visibleIcons[i] ? 'scale(1)' : 'scale(0.6)',
                transition: 'opacity 0.2s ease, transform 0.2s ease, border 0.15s, color 0.15s',
              }}
            >
              {sym.icon(28)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
