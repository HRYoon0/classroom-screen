import { useState } from 'react';

// 주사위 눈 위치 패턴
const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DiceFace({ value, size = 80 }: { value: number; size?: number }) {
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

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className={`flex gap-2 flex-wrap justify-center ${isRolling ? 'animate-bounce' : ''}`}>
        {values.map((v, i) => (
          <DiceFace key={i} value={v} size={diceCount > 2 ? 60 : 80} />
        ))}
      </div>

      {diceCount > 1 && (
        <p className="text-sm text-slate-500 font-mono">합계: {total}</p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => {
                setDiceCount(n);
                setValues(Array(n).fill(1));
              }}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                diceCount === n
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={roll}
          disabled={isRolling}
          className="min-w-[80px] h-8 px-5 bg-indigo-500 text-white rounded text-[13px] font-semibold hover:bg-indigo-600 disabled:opacity-60"
        >
          🎲 굴리기!
        </button>
      </div>
    </div>
  );
}
