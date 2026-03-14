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

type Phase = 'idle' | 'throwing' | 'falling' | 'bounce1' | 'fall2' | 'bounce2' | 'fall3' | 'bounce3' | 'done';

export default function DiceWidget() {
  const [diceCount, setDiceCount] = useState(1);
  const [values, setValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // 1단계: 위로 던지기
    setPhase('throwing');

    // 숫자 빠르게 돌리기 (공중에서)
    let count = 0;
    const shuffleInterval = setInterval(() => {
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      count++;
    }, 50);

    // 2단계: 떨어지기
    timers.current.push(window.setTimeout(() => setPhase('falling'), 400));

    // 3단계: 첫 번째 바운스 (높게)
    timers.current.push(window.setTimeout(() => setPhase('bounce1'), 650));

    // 4단계: 두 번째 낙하
    timers.current.push(window.setTimeout(() => setPhase('fall2'), 800));

    // 5단계: 두 번째 바운스 (낮게)
    timers.current.push(window.setTimeout(() => setPhase('bounce2'), 950));

    // 6단계: 세 번째 낙하
    timers.current.push(window.setTimeout(() => setPhase('fall3'), 1050));

    // 7단계: 세 번째 바운스 (아주 낮게)
    timers.current.push(window.setTimeout(() => {
      clearInterval(shuffleInterval);
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      setPhase('bounce3');
    }, 1120));

    // 8단계: 안정
    timers.current.push(window.setTimeout(() => {
      setPhase('done');
      setIsRolling(false);
      try {
        const audio = new Audio('/sounds/alarm4.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch { /* 무시 */ }
    }, 1350));
  };

  const total = values.reduce((a, b) => a + b, 0);
  const diceSize = diceCount > 2 ? 90 : 160;

  // 각 주사위의 애니메이션 스타일
  const getDiceStyle = (index: number): React.CSSProperties => {
    const randomRotate = (index * 37 + 15) % 30 - 15; // -15 ~ 15도
    const randomX = (index * 23 + 7) % 20 - 10; // -10 ~ 10px

    switch (phase) {
      case 'throwing':
        return {
          transform: `translateY(-220px) rotate(${randomRotate * 4}deg) scale(0.7)`,
          opacity: 0.8,
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.3, 1), opacity 0.2s',
        };
      case 'falling':
        return {
          transform: `translateY(20px) rotate(${randomRotate * 2}deg) scale(1.08)`,
          opacity: 1,
          transition: 'transform 0.25s cubic-bezier(0.6, 0, 1, 1), opacity 0.1s',
        };
      case 'bounce1':
        return {
          transform: `translateY(-60px) translateX(${randomX}px) rotate(${randomRotate}deg) scale(1)`,
          transition: 'transform 0.15s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'fall2':
        return {
          transform: `translateY(10px) translateX(${randomX * 0.7}px) rotate(${randomRotate * 0.6}deg) scale(1.04)`,
          transition: 'transform 0.15s cubic-bezier(0.6, 0, 1, 1)',
        };
      case 'bounce2':
        return {
          transform: `translateY(-25px) translateX(${randomX * 0.5}px) rotate(${randomRotate * 0.3}deg) scale(1)`,
          transition: 'transform 0.12s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'fall3':
        return {
          transform: `translateY(4px) translateX(${randomX * 0.3}px) rotate(${randomRotate * 0.15}deg) scale(1.01)`,
          transition: 'transform 0.1s cubic-bezier(0.6, 0, 1, 1)',
        };
      case 'bounce3':
        return {
          transform: `translateY(-6px) translateX(${randomX * 0.2}px) rotate(${randomRotate * 0.08}deg) scale(1)`,
          transition: 'transform 0.08s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'done':
        return {
          transform: `translateY(0) translateX(${randomX * 0.1}px) rotate(${randomRotate * 0.05}deg) scale(1)`,
          transition: 'transform 0.15s cubic-bezier(0, 0, 0.2, 1)',
        };
      default:
        return {
          transform: 'translateY(0) rotate(0deg) scale(1)',
          transition: 'transform 0.3s ease',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', overflow: 'hidden' }}>
      {/* 주사위 영역 */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center',
        minHeight: `${diceSize + 40}px`, alignItems: 'center',
        position: 'relative',
      }}>
        {values.map((v, i) => (
          <DiceFace key={i} value={v} size={diceSize} style={getDiceStyle(i)} />
        ))}

        {/* 착지 이펙트 */}
        {(phase === 'falling' || phase === 'fall2' || phase === 'fall3') && (
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${diceCount * (diceSize + 12)}px`,
            height: '6px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%)',
            animation: 'shadow-pop 0.3s ease-out',
          }} />
        )}
      </div>

      {diceCount > 1 && (
        <p style={{
          fontSize: '20px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600,
          opacity: phase === 'done' || phase === 'idle' ? 1 : 0.3,
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
        @keyframes shadow-pop {
          0% { opacity: 0; transform: translateX(-50%) scaleX(0.5); }
          50% { opacity: 1; transform: translateX(-50%) scaleX(1.2); }
          100% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}
