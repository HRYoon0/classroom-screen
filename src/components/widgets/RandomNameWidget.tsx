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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
        <textarea
          style={{
            flex: 1,
            width: '100%',
            padding: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '18px',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            color: '#334155',
            background: '#f8fafc',
            boxSizing: 'border-box',
          }}
          placeholder={'학생 이름을 한 줄에 하나씩 입력하세요\n예:\n김철수\n이영희\n박민수'}
          value={nameList}
          onChange={(e) => onConfigChange({ names: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <button
          onClick={() => names.length > 0 && setShowInput(false)}
          disabled={names.length === 0}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            background: names.length === 0 ? '#cbd5e1' : '#6366f1',
            color: 'white',
            fontSize: '18px',
            fontWeight: 600,
            cursor: names.length === 0 ? 'default' : 'pointer',
          }}
        >
          완료 ({names.length}명)
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
      {/* 선택된 이름 표시 */}
      <div style={{
        fontSize: '64px',
        fontWeight: 700,
        color: isSpinning ? '#818cf8' : '#1e293b',
        transition: 'all 0.2s',
        transform: isSpinning ? 'scale(0.95)' : 'scale(1)',
      }}>
        {selectedName || '?'}
      </div>

      <p style={{ fontSize: '16px', color: '#94a3b8' }}>{names.length}명 중 선택</p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={spin}
          disabled={isSpinning}
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: 'none',
            background: isSpinning ? '#a5b4fc' : '#6366f1',
            color: 'white',
            fontSize: '20px',
            fontWeight: 600,
            cursor: isSpinning ? 'default' : 'pointer',
          }}
        >
          {isSpinning ? '뽑는 중...' : '🎯 뽑기!'}
        </button>
        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            background: '#f1f5f9',
            color: '#475569',
            fontSize: '20px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          수정
        </button>
      </div>
    </div>
  );
}
