import { useState } from 'react';

const SYMBOLS = [
  { icon: '🤫', label: '조용히', color: 'bg-red-50 border-red-200 text-red-700' },
  { icon: '👀', label: '주목', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { icon: '✍️', label: '쓰기', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { icon: '👥', label: '짝활동', color: 'bg-green-50 border-green-200 text-green-700' },
  { icon: '🗣️', label: '토론', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { icon: '📖', label: '읽기', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { icon: '🎧', label: '듣기', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { icon: '🖥️', label: '컴퓨터', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
];

export default function WorkSymbolsWidget() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-center h-full gap-1.5 flex-wrap">
      {SYMBOLS.map((sym, i) => (
        <button
          key={i}
          onClick={() => setActive(active === i ? null : i)}
          className={`flex flex-col items-center px-2 py-1.5 rounded-lg border transition-all ${
            active === i
              ? `${sym.color} scale-110 shadow-md`
              : 'border-transparent hover:bg-slate-50 opacity-50 hover:opacity-80'
          }`}
        >
          <span className="text-xl">{sym.icon}</span>
          <span className="text-[9px] font-medium">{sym.label}</span>
        </button>
      ))}
    </div>
  );
}
