import { useState, useRef } from 'react';

const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DiceFace({ value, size = 160, style }: { value: number; size?: number; style?: React.CSSProperties }) {
  const dots = DOT_PATTERNS[value] || [];
  return (
    <div style={style}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x="2" y="2" width="96" height="96" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="2" />
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />
        ))}
      </svg>
    </div>
  );
}

type Phase = 'idle' | 'shake' | 'throw' | 'spin' | 'fall' | 'bounce1' | 'fall2' | 'bounce2' | 'fall3' | 'bounce3' | 'settle' | 'done';

export default function DiceWidget() {
  const [diceCount, setDiceCount] = useState(1);
  const [values, setValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [showImpact, setShowImpact] = useState(false);
  const timers = useRef<number[]>([]);
  const shuffleRef = useRef<number>(0);

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // 셔플 시작
    shuffleRef.current = window.setInterval(() => {
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
    }, 40);

    const t = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

    // 1: 흔들기 (준비)
    setPhase('shake');

    // 2: 위로 던지기
    t(300, () => setPhase('throw'));

    // 3: 공중 회전
    t(500, () => setPhase('spin'));

    // 4: 낙하
    t(800, () => setPhase('fall'));

    // 5: 첫 바운스 (높게)
    t(950, () => {
      setPhase('bounce1');
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 200);
    });

    // 6: 두 번째 낙하
    t(1100, () => setPhase('fall2'));

    // 7: 두 번째 바운스
    t(1200, () => {
      setPhase('bounce2');
      setShowImpact(true);
      setTimeout(() => setShowImpact(false), 150);
    });

    // 8: 세 번째 낙하
    t(1320, () => setPhase('fall3'));

    // 9: 세 번째 바운스 (미세)
    t(1380, () => setPhase('bounce3'));

    // 10: 안정
    t(1450, () => {
      clearInterval(shuffleRef.current);
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      setPhase('settle');
    });

    // 11: 완료
    t(1650, () => {
      setPhase('done');
      setIsRolling(false);
      try {
        const audio = new Audio('/sounds/alarm4.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch { /* 무시 */ }
    });
  };

  const total = values.reduce((a, b) => a + b, 0);
  const diceSize = diceCount > 2 ? 90 : 160;

  const getDiceStyle = (index: number): React.CSSProperties => {
    const r = (index * 37 + 15) % 30 - 15;
    const x = (index * 23 + 7) % 20 - 10;
    const dir = index % 2 === 0 ? 1 : -1;

    switch (phase) {
      case 'shake':
        return {
          animation: 'dice-shake 0.08s ease-in-out infinite alternate',
          transition: 'none',
        };
      case 'throw':
        return {
          transform: `translateY(-280px) rotate(${r * 5 * dir}deg) scale(0.6)`,
          opacity: 0.7,
          transition: 'transform 0.3s cubic-bezier(0.2, 0, 0.3, 1), opacity 0.2s',
        };
      case 'spin':
        return {
          transform: `translateY(-200px) rotate(${360 * dir + r * 3}deg) scale(0.7)`,
          opacity: 0.85,
          transition: 'transform 0.3s linear, opacity 0.1s',
        };
      case 'fall':
        return {
          transform: `translateY(25px) rotate(${720 * dir + r * 2}deg) scale(1.1)`,
          opacity: 1,
          transition: 'transform 0.25s cubic-bezier(0.6, 0, 1, 1), opacity 0.1s',
        };
      case 'bounce1':
        return {
          transform: `translateY(-70px) translateX(${x * 1.5}px) rotate(${720 * dir + r}deg) scale(1)`,
          transition: 'transform 0.15s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'fall2':
        return {
          transform: `translateY(12px) translateX(${x}px) rotate(${720 * dir + r * 0.5}deg) scale(1.04)`,
          transition: 'transform 0.12s cubic-bezier(0.6, 0, 1, 1)',
        };
      case 'bounce2':
        return {
          transform: `translateY(-28px) translateX(${x * 0.6}px) rotate(${720 * dir + r * 0.3}deg) scale(1)`,
          transition: 'transform 0.1s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'fall3':
        return {
          transform: `translateY(5px) translateX(${x * 0.3}px) rotate(${720 * dir + r * 0.15}deg) scale(1.01)`,
          transition: 'transform 0.08s cubic-bezier(0.6, 0, 1, 1)',
        };
      case 'bounce3':
        return {
          transform: `translateY(-8px) translateX(${x * 0.15}px) rotate(${720 * dir + r * 0.08}deg) scale(1)`,
          transition: 'transform 0.06s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'settle':
        return {
          transform: `translateY(0) translateX(${x * 0.05}px) rotate(${r * 0.03}deg) scale(1)`,
          transition: 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
        };
      case 'done':
        return {
          transform: 'translateY(0) rotate(0deg) scale(1)',
          transition: 'transform 0.15s ease',
        };
      default:
        return {
          transform: 'translateY(0) rotate(0deg) scale(1)',
          transition: 'transform 0.3s ease',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', overflow: 'hidden', position: 'relative' }}>

      {/* 충격파 이펙트 */}
      {showImpact && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '55%',
          width: '200px',
          height: '200px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.3)',
          animation: 'impact-wave 0.4s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* 주사위 영역 */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center',
        minHeight: `${diceSize + 40}px`, alignItems: 'center',
        position: 'relative',
      }}>
        {values.map((v, i) => (
          <DiceFace key={i} value={v} size={diceSize} style={getDiceStyle(i)} />
        ))}
      </div>

      {diceCount > 1 && (
        <p style={{
          fontSize: '20px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600,
          opacity: phase === 'done' || phase === 'idle' || phase === 'settle' ? 1 : 0.3,
          transition: 'opacity 0.3s',
        }}>
          합계: {total}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => { setDiceCount(n); setValues(Array(n).fill(1)); setPhase('idle'); }}
              style={{
                width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                background: diceCount === n ? '#6366f1' : '#f1f5f9',
                color: diceCount === n ? 'white' : '#475569',
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={roll}
          disabled={isRolling}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: isRolling ? '#a5b4fc' : '#6366f1',
            color: 'white', fontSize: '20px', fontWeight: 600,
            cursor: isRolling ? 'default' : 'pointer',
            transform: isRolling ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}
        >
          🎲 굴리기!
        </button>
      </div>

      <style>{`
        @keyframes dice-shake {
          0% { transform: translateX(-3px) translateY(-2px) rotate(-3deg); }
          25% { transform: translateX(3px) translateY(1px) rotate(2deg); }
          50% { transform: translateX(-2px) translateY(-3px) rotate(-2deg); }
          75% { transform: translateX(2px) translateY(2px) rotate(3deg); }
          100% { transform: translateX(-1px) translateY(-1px) rotate(-1deg); }
        }
        @keyframes impact-wave {
          0% { width: 20px; height: 20px; opacity: 0.8; border-width: 4px; }
          100% { width: 250px; height: 250px; opacity: 0; border-width: 1px; }
        }
      `}</style>
    </div>
  );
}
