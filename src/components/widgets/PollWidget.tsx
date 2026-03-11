import { useState } from 'react';
import { IoEye, IoEyeOff, IoLockClosed, IoLockOpen, IoRefresh, IoCreate } from 'react-icons/io5';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

const COLORS = [
  { bar: '#6366f1', light: '#eef2ff', text: '#4338ca' },
  { bar: '#f43f5e', light: '#fff1f2', text: '#be123c' },
  { bar: '#22c55e', light: '#f0fdf4', text: '#15803d' },
  { bar: '#f59e0b', light: '#fffbeb', text: '#b45309' },
  { bar: '#8b5cf6', light: '#faf5ff', text: '#6d28d9' },
  { bar: '#06b6d4', light: '#ecfeff', text: '#0e7490' },
];

export default function PollWidget({ config, onConfigChange }: Props) {
  const question = (config.question as string) || '';
  const options = (config.options as string[]) || ['', ''];
  const votes = (config.votes as number[]) || options.map(() => 0);
  const [showSetup, setShowSetup] = useState(!question);
  const [showResults, setShowResults] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const totalVotes = votes.reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...votes, 1);

  const vote = (index: number) => {
    if (isLocked) return;
    const newVotes = [...votes];
    newVotes[index]++;
    onConfigChange({ votes: newVotes });
  };

  const reset = () => {
    onConfigChange({ votes: options.map(() => 0) });
    setIsLocked(false);
  };

  // ── 설정 화면 ──
  if (showSetup) {
    return (
      <div className="flex flex-col h-full">
        {/* 질문 입력 */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1 block">질문</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold focus:outline-none focus:border-indigo-400 focus:bg-white text-slate-800 placeholder:text-slate-300 transition-colors"
            placeholder="오늘 점심 뭐 먹을까?"
            value={question}
            onChange={(e) => onConfigChange({ question: e.target.value })}
          />
        </div>

        {/* 선택지 */}
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 block">선택지</label>
        <div className="flex-1 flex flex-col gap-2 overflow-auto">
          {options.map((opt, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: c.bar }}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white text-slate-700 placeholder:text-slate-300 transition-colors"
                  placeholder={`선택지 ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    onConfigChange({ options: newOpts, votes: newOpts.map(() => 0) });
                  }}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => {
                      const newOpts = options.filter((_, j) => j !== i);
                      onConfigChange({ options: newOpts, votes: newOpts.map(() => 0) });
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
          {options.length < 6 && (
            <button
              onClick={() =>
                onConfigChange({
                  options: [...options, ''],
                  votes: [...votes, 0],
                })
              }
              className="flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-dashed border-slate-200 text-sm text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/50 font-medium transition-colors"
            >
              + 선택지 추가
            </button>
          )}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={() => question && options.some(o => o.trim()) && setShowSetup(false)}
          className="mt-4 h-9 px-4 bg-indigo-500 text-white rounded text-[13px] font-semibold hover:bg-indigo-600 disabled:opacity-40 transition-colors shadow-sm"
          disabled={!question || !options.some(o => o.trim())}
        >
          투표 시작
        </button>
      </div>
    );
  }

  // ── 투표 화면 ──
  return (
    <div className="flex flex-col h-full">
      {/* 질문 */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug">{question}</h3>

      {/* 선택지 + 바 */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-auto">
        {options.map((opt, i) => {
          const pct = totalVotes > 0 ? (votes[i] / totalVotes) * 100 : 0;
          const barWidth = totalVotes > 0 ? (votes[i] / maxVotes) * 100 : 0;
          const c = COLORS[i % COLORS.length];

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={isLocked}
              className={`relative text-left rounded-2xl overflow-hidden transition-all border-2 ${
                isLocked
                  ? 'cursor-default border-transparent'
                  : 'hover:shadow-md active:scale-[0.98] border-transparent hover:border-slate-200'
              }`}
              style={{ backgroundColor: c.light }}
            >
              {/* 바 배경 */}
              {showResults && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-out opacity-25"
                  style={{ width: `${barWidth}%`, backgroundColor: c.bar }}
                />
              )}
              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.bar }}
                  />
                  <span className="text-sm font-semibold text-slate-700">{opt || `선택지 ${i + 1}`}</span>
                </div>
                {showResults && (
                  <span className="text-sm font-bold tabular-nums" style={{ color: c.text }}>
                    {votes[i]} <span className="text-xs font-medium opacity-60">({Math.round(pct)}%)</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
        <ControlBtn
          icon={showResults ? <IoEye size={14} /> : <IoEyeOff size={14} />}
          label={showResults ? '숨기기' : '보기'}
          onClick={() => setShowResults(!showResults)}
        />
        <ControlBtn
          icon={isLocked ? <IoLockClosed size={14} /> : <IoLockOpen size={14} />}
          label={isLocked ? '잠금됨' : '잠금'}
          onClick={() => setIsLocked(!isLocked)}
          active={isLocked}
        />
        <div className="flex-1" />
        <ControlBtn icon={<IoRefresh size={14} />} label="초기화" onClick={reset} />
        <ControlBtn icon={<IoCreate size={14} />} label="수정" onClick={() => setShowSetup(true)} />
        <span className="text-xs text-slate-400 tabular-nums font-medium ml-1">
          총 {totalVotes}표
        </span>
      </div>
    </div>
  );
}

function ControlBtn({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
        active
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
