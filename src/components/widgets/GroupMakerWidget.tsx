import { useState } from 'react';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function GroupMakerWidget({ config, onConfigChange }: Props) {
  const nameList = ((config.names as string) || '').trim();
  const groupCount = (config.groupCount as number) || 4;
  const [groups, setGroups] = useState<string[][]>([]);
  const [showInput, setShowInput] = useState(!nameList);

  const names = nameList
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const shuffle = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: string[][] = Array.from({ length: groupCount }, () => []);
    shuffled.forEach((name, i) => {
      result[i % groupCount].push(name);
    });
    setGroups(result);
  };

  const COLORS = [
    'bg-blue-50 border-blue-200',
    'bg-pink-50 border-pink-200',
    'bg-green-50 border-green-200',
    'bg-yellow-50 border-yellow-200',
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-cyan-50 border-cyan-200',
    'bg-rose-50 border-rose-200',
  ];

  if (showInput || names.length === 0) {
    return (
      <div className="flex flex-col h-full gap-2">
        <textarea
          className="flex-1 w-full p-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          placeholder="학생 이름을 한 줄에 하나씩 입력하세요"
          value={nameList}
          onChange={(e) => onConfigChange({ names: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">모둠 수:</label>
          <select
            value={groupCount}
            onChange={(e) => onConfigChange({ groupCount: Number(e.target.value) })}
            className="border border-slate-200 rounded px-2 py-1 text-sm text-slate-700"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}개
              </option>
            ))}
          </select>
          <button
            onClick={() => names.length > 0 && setShowInput(false)}
            disabled={names.length === 0}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: names.length === 0 ? '#cbd5e1' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: names.length === 0 ? 'default' : 'pointer',
            }}
          >
            완료
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {groups.length > 0 ? (
        <div className="flex-1 grid grid-cols-2 gap-2 overflow-auto no-scrollbar">
          {groups.map((group, i) => (
            <div
              key={i}
              className={`rounded-lg border p-2 ${COLORS[i % COLORS.length]}`}
            >
              <p className="text-xs font-bold text-slate-600 mb-1">
                {i + 1}모둠
              </p>
              {group.map((name, j) => (
                <p key={j} className="text-sm text-slate-700">
                  {name}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          아래 버튼을 눌러 모둠을 만드세요
        </div>
      )}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={shuffle}
          className="flex-1 h-8 px-3 bg-indigo-500 text-white rounded text-[13px] font-semibold hover:bg-indigo-600"
        >
          🔀 섞기!
        </button>
        <button
          onClick={() => setShowInput(true)}
          className="h-8 px-4 bg-slate-100 text-slate-600 rounded text-[13px] font-semibold hover:bg-slate-200"
        >
          수정
        </button>
      </div>
    </div>
  );
}
