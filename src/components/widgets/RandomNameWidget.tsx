import { useState, useRef } from 'react';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function RandomNameWidget({ config, onConfigChange }: Props) {
  const nameList = ((config.names as string) || '').trim();
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showInput, setShowInput] = useState(!nameList);
  const intervalRef = useRef<number | null>(null);

  const names = nameList
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const spin = () => {
    if (names.length === 0) return;
    setIsSpinning(true);

    let count = 0;
    const maxCount = 15 + Math.random() * 10;

    intervalRef.current = window.setInterval(() => {
      const randomIdx = Math.floor(Math.random() * names.length);
      setSelectedName(names[randomIdx]);
      count++;
      if (count >= maxCount) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsSpinning(false);
      }
    }, 80 + count * 8);
  };

  if (showInput || names.length === 0) {
    return (
      <div className="flex flex-col h-full gap-2">
        <textarea
          className="flex-1 w-full p-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          placeholder="학생 이름을 한 줄에 하나씩 입력하세요&#10;예:&#10;김철수&#10;이영희&#10;박민수"
          value={nameList}
          onChange={(e) => onConfigChange({ names: e.target.value })}
        />
        <button
          onClick={() => names.length > 0 && setShowInput(false)}
          className="px-3 py-1.5 bg-indigo-500 text-white rounded text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50"
          disabled={names.length === 0}
        >
          완료 ({names.length}명)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {/* 선택된 이름 표시 */}
      <div
        className={`text-4xl font-bold transition-all ${
          isSpinning ? 'text-indigo-400 scale-95' : 'text-slate-800 scale-100'
        }`}
      >
        {selectedName || '?'}
      </div>

      <p className="text-xs text-slate-400">{names.length}명 중 선택</p>

      <div className="flex gap-2">
        <button
          onClick={spin}
          disabled={isSpinning}
          className="min-w-[80px] h-8 px-5 bg-indigo-500 text-white rounded text-[13px] font-semibold hover:bg-indigo-600 disabled:opacity-60 transition-all"
        >
          {isSpinning ? '뽑는 중...' : '🎯 뽑기!'}
        </button>
        <button
          onClick={() => setShowInput(true)}
          className="min-w-[56px] h-8 px-4 bg-slate-100 text-slate-600 rounded text-[13px] font-semibold hover:bg-slate-200"
        >
          수정
        </button>
      </div>
    </div>
  );
}
