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

type Phase = 'idle' | 'throwing' | 'falling' | 'bouncing' | 'done';

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

    // 2단계: 숫자 빠르게 돌리기 (공중에서)
    let count = 0;
    const shuffleInterval = setInterval(() => {
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      count++;
    }, 50);

    // 3단계: 떨어지기 (500ms 후)
    timers.current.push(window.setTimeout(() => {
      setPhase('falling');
    }, 400));

    // 4단계: 바운스 착지 (800ms 후)
    timers.current.push(window.setTimeout(() => {
      clearInterval(shuffleInterval);
      setValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      setPhase('bouncing');
    }, 700));

    // 5단계: 안정 (1200ms 후)
    timers.current.push(window.setTimeout(() => {
      setPhase('done');
      setIsRolling(false);
      // 효과음
      try {
        const audio = new Audio('/sounds/alarm4.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch { /* 무시 */ }
    }, 1100));
  };

  const total = values.reduce((a, b) => a + b, 0);
  const diceSize = diceCount > 2 ? 120 : 160;

  // 각 주사위의 애니메이션 스타일
  const getDiceStyle = (index: number): React.CSSProperties => {
    const randomRotate = (index * 37 + 15) % 30 - 15; // -15 ~ 15도
    const randomX = (index * 23 + 7) % 20 - 10; // -10 ~ 10px

    switch (phase) {
      case 'throwing':
        return {
          transform: `translateY(-200px) rotate(${randomRotate * 3}deg) scale(0.8)`,
          opacity: 0.8,
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.3, 1), opacity 0.2s',
        };
      case 'falling':
        return {
          transform: `translateY(30px) rotate(${randomRotate}deg) scale(1.1)`,
          opacity: 1,
          transition: 'transform 0.3s cubic-bezier(0.6, 0, 1, 1), opacity 0.1s',
        };
      case 'bouncing':
        return {
          transform: `translateY(-8px) translateX(${randomX}px) rotate(${randomRotate * 0.5}deg) scale(1.05)`,
          transition: 'transform 0.2s cubic-bezier(0.3, 0, 0.2, 1)',
        };
      case 'done':
        return {
          transform: `translateY(0) translateX(${randomX * 0.3}px) rotate(${randomRotate * 0.2}deg) scale(1)`,
          transition: 'transform 0.2s cubic-bezier(0, 0, 0.2, 1)',
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
        {phase === 'bouncing' && (
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
