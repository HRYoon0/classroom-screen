import { useState, useRef, useCallback } from 'react';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

// 파티클 (축하 효과)
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  spin: number;
}

const CONFETTI_COLORS = ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#fbbf24'];

export default function RandomNameWidget({ config, onConfigChange }: Props) {
  const nameList = (config.names as string) || '';
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showInput, setShowInput] = useState(!nameList);
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeoutChain = useRef<number[]>([]);

  const names = nameList
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  // 축하 파티클 생성
  const spawnConfetti = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 35,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 6,
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 4,
        spin: (Math.random() - 0.5) * 720,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, []);

  const spin = useCallback(() => {
    if (names.length === 0) return;

    // 이전 타이머 정리
    timeoutChain.current.forEach(clearTimeout);
    timeoutChain.current = [];

    setIsSpinning(true);
    setShowResult(false);

    // 점점 느려지는 슬롯머신 효과
    const totalSteps = 20 + Math.floor(Math.random() * 10);
    let delay = 50; // 시작 속도 (매우 빠름)

    for (let i = 0; i < totalSteps; i++) {
      const t = window.setTimeout(() => {
        const randomIdx = Math.floor(Math.random() * names.length);
        setSelectedName(names[randomIdx]);

        // 마지막 스텝
        if (i === totalSteps - 1) {
          setIsSpinning(false);
          setShowResult(true);
          spawnConfetti();
          // 효과음
          try {
            const audio = new Audio('/sounds/alarm4.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch { /* 무시 */ }
        }
      }, delay);
      timeoutChain.current.push(t);

      // 점점 느려짐 (지수적 감속)
      if (i < totalSteps * 0.4) {
        delay += 10; // 초반: 약간씩 느려짐
      } else if (i < totalSteps * 0.7) {
        delay += 30; // 중반: 중간 감속
      } else {
        delay += 80; // 후반: 크게 느려짐
      }
    }
  }, [names, spawnConfetti]);

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 축하 파티클 */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confetti-fall ${1 + Math.random() * 1}s ease-out forwards`,
            transform: `rotate(${p.angle}deg)`,
            '--tx': `${(Math.random() - 0.5) * 200}px`,
            '--ty': `${100 + Math.random() * 150}px`,
            '--spin': `${p.spin}deg`,
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      ))}

      {/* 스피닝 중 배경 효과 */}
      {isSpinning && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          animation: 'pulse-bg 0.5s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }} />
      )}

      {/* 선택된 이름 표시 */}
      <div style={{
        fontSize: isSpinning ? '52px' : '64px',
        fontWeight: 700,
        color: showResult ? '#6366f1' : isSpinning ? '#94a3b8' : '#1e293b',
        transition: 'all 0.15s',
        transform: showResult ? 'scale(1.1)' : isSpinning ? 'scale(0.9)' : 'scale(1)',
        animation: showResult ? 'bounce-in 0.5s ease-out' : isSpinning ? 'shuffle 0.1s ease-in-out' : 'none',
        textShadow: showResult ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
      }}>
        {selectedName || '?'}
      </div>

      {/* 당첨 표시 */}
      {showResult && (
        <div style={{
          fontSize: '18px',
          color: '#6366f1',
          fontWeight: 600,
          animation: 'fade-in 0.3s ease-out',
        }}>
          🎉 당첨!
        </div>
      )}

      {!showResult && (
        <p style={{ fontSize: '16px', color: '#94a3b8' }}>{names.length}명 중 선택</p>
      )}

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
            transform: isSpinning ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.15s',
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

      {/* 애니메이션 CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--spin)) scale(0.3);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0.5; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes shuffle {
          0%, 100% { transform: scale(0.9) translateY(0); }
          50% { transform: scale(0.9) translateY(-3px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-bg {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
