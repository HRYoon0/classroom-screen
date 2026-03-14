import { useState } from 'react';

const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DiceFace({ value, size = 160 }: { value: number; size?: number }) {
  const dots = DOT_PATTERNS[value] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="2" y="2" width="96" height="96" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="2" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />
      ))}
    </svg>
  );
}

export default function DiceWidget() {
  const [diceCount, setDiceCount] = useState(1);
  const [values, setValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setValues(
        Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      );
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const total = values.reduce((a, b) => a + b, 0);
  const diceSize = diceCount > 2 ? 120 : 160;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center',
        animation: isRolling ? 'dice-bounce 0.15s ease-in-out infinite alternate' : 'none',
      }}>
        {values.map((v, i) => (
          <DiceFace key={i} value={v} size={diceSize} />
        ))}
      </div>

      {diceCount > 1 && (
        <p style={{ fontSize: '20px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>합계: {total}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => { setDiceCount(n); setValues(Array(n).fill(1)); }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
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
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            background: isRolling ? '#a5b4fc' : '#6366f1',
            color: 'white',
            fontSize: '20px',
            fontWeight: 600,
            cursor: isRolling ? 'default' : 'pointer',
          }}
        >
          🎲 굴리기!
        </button>
      </div>

      <style>{`
        @keyframes dice-bounce {
          from { transform: translateY(0) rotate(-2deg); }
          to { transform: translateY(-6px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
