import { useState, useEffect } from 'react';

type ClockStyle = 'classic' | 'minimal' | 'digital' | 'cat' | 'flower' | 'bear';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function ClockWidget({ config }: Props) {
  const [time, setTime] = useState(new Date());
  const is24h = (config.is24h as boolean) ?? false;
  const clockStyle = (config.clockStyle as ClockStyle) || 'classic';

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const displayHour = is24h ? hours : (hours % 12 || 12);
  const ampm = is24h ? '' : (hours >= 12 ? '오후' : '오전');
  const digitalTime = `${is24h ? String(hours).padStart(2, '0') : String(displayHour)}:${String(minutes).padStart(2, '0')}`;
  const digitalTimeSec = `${digitalTime}:${String(seconds).padStart(2, '0')}`;

  if (clockStyle === 'digital') return <DigitalClock time={digitalTimeSec} ampm={ampm} />;
  if (clockStyle === 'cat') return <CatClock hourAngle={hourAngle} minuteAngle={minuteAngle} secondAngle={secondAngle} digitalTime={digitalTime} ampm={ampm} />;
  if (clockStyle === 'flower') return <FlowerClock hourAngle={hourAngle} minuteAngle={minuteAngle} secondAngle={secondAngle} digitalTime={digitalTime} ampm={ampm} />;
  if (clockStyle === 'bear') return <BearClock hourAngle={hourAngle} minuteAngle={minuteAngle} secondAngle={secondAngle} digitalTime={digitalTime} ampm={ampm} />;

  // classic / minimal 공통 아날로그 시계
  const size = 180;
  const center = size / 2;
  const clockRadius = 78;
  const isMinimal = clockStyle === 'minimal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 테두리 */}
        <circle
          cx={center} cy={center} r={clockRadius}
          fill={isMinimal ? 'none' : 'none'}
          stroke={isMinimal ? '#e2e8f0' : '#6366f1'}
          strokeWidth={isMinimal ? '1.5' : '2.5'}
          opacity={isMinimal ? 1 : 0.6}
        />

        {/* 숫자 + 눈금 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const numR = clockRadius - 16;
          const tickOuterR = clockRadius - 4;
          const tickInnerR = clockRadius - (isMinimal ? 12 : 10);
          const nx = center + numR * Math.cos(angle);
          const ny = center + numR * Math.sin(angle);
          const tx1 = center + tickOuterR * Math.cos(angle);
          const ty1 = center + tickOuterR * Math.sin(angle);
          const tx2 = center + tickInnerR * Math.cos(angle);
          const ty2 = center + tickInnerR * Math.sin(angle);
          return (
            <g key={i}>
              {isMinimal ? (
                <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#6366f1" strokeWidth="1.5" opacity="0.4" />
                  <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="13" fontWeight="500">
                    {i + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* 분 눈금 */}
        {!isMinimal && Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null;
          const angle = (i * 6 - 90) * (Math.PI / 180);
          const r1 = clockRadius - 4;
          const r2 = clockRadius - 7;
          return (
            <line key={`m${i}`}
              x1={center + r1 * Math.cos(angle)} y1={center + r1 * Math.sin(angle)}
              x2={center + r2 * Math.cos(angle)} y2={center + r2 * Math.sin(angle)}
              stroke="#cbd5e1" strokeWidth="0.8"
            />
          );
        })}

        {/* 시침 */}
        <line x1={center} y1={center}
          x2={center + (isMinimal ? 36 : 40) * Math.sin((hourAngle * Math.PI) / 180)}
          y2={center - (isMinimal ? 36 : 40) * Math.cos((hourAngle * Math.PI) / 180)}
          stroke={isMinimal ? '#334155' : '#1e293b'} strokeWidth={isMinimal ? '4' : '3.5'} strokeLinecap="round"
        />

        {/* 분침 */}
        <line x1={center} y1={center}
          x2={center + (isMinimal ? 52 : 56) * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={center - (isMinimal ? 52 : 56) * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke={isMinimal ? '#334155' : '#1e293b'} strokeWidth={isMinimal ? '3' : '2.5'} strokeLinecap="round"
        />

        {/* 초침 */}
        <line x1={center} y1={center}
          x2={center + 60 * Math.sin((secondAngle * Math.PI) / 180)}
          y2={center - 60 * Math.cos((secondAngle * Math.PI) / 180)}
          stroke={isMinimal ? '#6366f1' : '#ef4444'} strokeWidth="1.2" strokeLinecap="round"
        />

        {/* 중심점 */}
        <circle cx={center} cy={center} r={isMinimal ? '4' : '3.5'} fill={isMinimal ? '#6366f1' : '#1e293b'} />
        <circle cx={center} cy={center} r="1.5" fill="white" />
      </svg>

      {/* 디지털 시간 */}
      <div style={{ fontSize: '18px', fontWeight: 600, color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
        {ampm && <span style={{ marginRight: '4px' }}>{ampm}</span>}
        {digitalTime}
      </div>
    </div>
  );
}

// 디지털 시계 스타일
function DigitalClock({ time, ampm }: { time: string; ampm: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
      <div style={{
        fontSize: '64px',
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        color: '#1e293b',
        letterSpacing: '2px',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>
        {time}
      </div>
      {ampm && (
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#6366f1' }}>{ampm}</div>
      )}
    </div>
  );
}

// 고양이 시계 스타일
interface AnalogProps {
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
  digitalTime: string;
  ampm: string;
}

function CatClock({ hourAngle, minuteAngle, secondAngle, digitalTime, ampm }: AnalogProps) {
  const size = 200;
  const c = size / 2;
  const r = 72;
  // 꼬리 흔들기 (초침 각도 기반)
  const tailSwing = Math.sin(secondAngle * Math.PI / 180) * 15;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2px' }}>
      <svg width={size} height={size + 10} viewBox={`0 0 ${size} ${size + 10}`}>
        {/* 귀 */}
        <path d={`M${c - 55},${c - 58} L${c - 38},${c - 85} L${c - 20},${c - 62}`}
          fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
        <path d={`M${c + 55},${c - 58} L${c + 38},${c - 85} L${c + 20},${c - 62}`}
          fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
        {/* 안쪽 귀 */}
        <path d={`M${c - 50},${c - 60} L${c - 38},${c - 78} L${c - 26},${c - 63}`}
          fill="#fca5a5" />
        <path d={`M${c + 50},${c - 60} L${c + 38},${c - 78} L${c + 26},${c - 63}`}
          fill="#fca5a5" />

        {/* 얼굴 원 */}
        <circle cx={c} cy={c} r={r} fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />

        {/* 눈 */}
        <ellipse cx={c - 22} cy={c - 12} rx="7" ry="9" fill="#1e293b" />
        <ellipse cx={c + 22} cy={c - 12} rx="7" ry="9" fill="#1e293b" />
        <circle cx={c - 19} cy={c - 14} r="2.5" fill="white" />
        <circle cx={c + 25} cy={c - 14} r="2.5" fill="white" />

        {/* 코 */}
        <ellipse cx={c} cy={c + 2} rx="5" ry="3.5" fill="#f472b6" />

        {/* 입 */}
        <path d={`M${c - 8},${c + 6} Q${c},${c + 14} ${c + 8},${c + 6}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" />

        {/* 수염 */}
        <line x1={c - 30} y1={c - 2} x2={c - 60} y2={c - 8} stroke="#d97706" strokeWidth="1" />
        <line x1={c - 30} y1={c + 4} x2={c - 58} y2={c + 6} stroke="#d97706" strokeWidth="1" />
        <line x1={c + 30} y1={c - 2} x2={c + 60} y2={c - 8} stroke="#d97706" strokeWidth="1" />
        <line x1={c + 30} y1={c + 4} x2={c + 58} y2={c + 6} stroke="#d97706" strokeWidth="1" />

        {/* 숫자 (12, 3, 6, 9만) */}
        {[
          { n: '12', x: c, y: c - r + 18 },
          { n: '3', x: c + r - 18, y: c },
          { n: '6', x: c, y: c + r - 14 },
          { n: '9', x: c - r + 16, y: c },
        ].map(({ n, x, y }) => (
          <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fill="#92400e" fontSize="12" fontWeight="700">{n}</text>
        ))}

        {/* 시침 */}
        <line x1={c} y1={c} x2={c + 32 * Math.sin(hourAngle * Math.PI / 180)} y2={c - 32 * Math.cos(hourAngle * Math.PI / 180)}
          stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" />
        {/* 분침 */}
        <line x1={c} y1={c} x2={c + 48 * Math.sin(minuteAngle * Math.PI / 180)} y2={c - 48 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
        {/* 초침 */}
        <line x1={c} y1={c} x2={c + 52 * Math.sin(secondAngle * Math.PI / 180)} y2={c - 52 * Math.cos(secondAngle * Math.PI / 180)}
          stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />
        {/* 중심 */}
        <circle cx={c} cy={c} r="4" fill="#f472b6" />
        <circle cx={c} cy={c} r="1.5" fill="white" />

        {/* 꼬리 (아래에서 흔들림) */}
        <path
          d={`M${c},${c + r + 2} Q${c + tailSwing},${c + r + 22} ${c + tailSwing * 0.5},${c + r + 36}`}
          fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
          style={{ transition: 'd 0.5s ease' }}
        />
      </svg>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>
        {ampm && <span style={{ marginRight: '4px' }}>{ampm}</span>}
        {digitalTime} 🐱
      </div>
    </div>
  );
}

// 꽃 시계 스타일 - 12시 위치마다 작은 꽃
function FlowerClock({ hourAngle, minuteAngle, secondAngle, digitalTime, ampm }: AnalogProps) {
  const size = 210;
  const c = size / 2;
  const r = 76;

  const flowerColors = [
    { petal: '#f9a8d4', center: '#fbbf24' },
    { petal: '#c4b5fd', center: '#fbbf24' },
    { petal: '#93c5fd', center: '#fde68a' },
    { petal: '#86efac', center: '#fbbf24' },
    { petal: '#fca5a5', center: '#fde68a' },
    { petal: '#a78bfa', center: '#fbbf24' },
    { petal: '#f9a8d4', center: '#fde68a' },
    { petal: '#7dd3fc', center: '#fbbf24' },
    { petal: '#d8b4fe', center: '#fde68a' },
    { petal: '#fda4af', center: '#fbbf24' },
    { petal: '#86efac', center: '#fde68a' },
    { petal: '#f9a8d4', center: '#fbbf24' },
  ];

  // 작은 꽃 하나 렌더링 (꽃잎 5장 + 중심)
  function renderFlower(fx: number, fy: number, petalColor: string, centerColor: string, petalSize: number) {
    const petals = [];
    for (let p = 0; p < 5; p++) {
      const pa = (p * 72 - 90) * (Math.PI / 180);
      const px = fx + petalSize * 0.7 * Math.cos(pa);
      const py = fy + petalSize * 0.7 * Math.sin(pa);
      petals.push(
        <circle key={p} cx={px} cy={py} r={petalSize} fill={petalColor} opacity="0.8" />
      );
    }
    return (
      <g>
        {petals}
        <circle cx={fx} cy={fy} r={petalSize * 0.55} fill={centerColor} />
      </g>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 시계 배경 원 */}
        <circle cx={c} cy={c} r={r - 10} fill="white" fillOpacity="0.9" />
        <circle cx={c} cy={c} r={r - 10} fill="none" stroke="#e9d5ff" strokeWidth="1.5" />

        {/* 12개 꽃 (시계 눈금 위치) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const fx = c + (r + 2) * Math.cos(angle);
          const fy = c + (r + 2) * Math.sin(angle);
          const fc = flowerColors[i];
          return <g key={i}>{renderFlower(fx, fy, fc.petal, fc.center, 7)}</g>;
        })}

        {/* 숫자 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const nr = r - 24;
          return (
            <text key={i}
              x={c + nr * Math.cos(angle)} y={c + nr * Math.sin(angle)}
              textAnchor="middle" dominantBaseline="central"
              fill="#7c3aed" fontSize="13" fontWeight="700"
            >
              {i + 1}
            </text>
          );
        })}

        {/* 시침 */}
        <line x1={c} y1={c} x2={c + 30 * Math.sin(hourAngle * Math.PI / 180)} y2={c - 30 * Math.cos(hourAngle * Math.PI / 180)}
          stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
        {/* 분침 */}
        <line x1={c} y1={c} x2={c + 46 * Math.sin(minuteAngle * Math.PI / 180)} y2={c - 46 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        {/* 초침 */}
        <line x1={c} y1={c} x2={c + 50 * Math.sin(secondAngle * Math.PI / 180)} y2={c - 50 * Math.cos(secondAngle * Math.PI / 180)}
          stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />

        {/* 중심 꽃 */}
        {renderFlower(c, c, '#f9a8d4', '#fbbf24', 5)}
      </svg>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed', fontVariantNumeric: 'tabular-nums' }}>
        {ampm && <span style={{ marginRight: '4px' }}>{ampm}</span>}
        {digitalTime} 🌸
      </div>
    </div>
  );
}

// 곰돌이 시계 스타일
function BearClock({ hourAngle, minuteAngle, secondAngle, digitalTime, ampm }: AnalogProps) {
  const size = 200;
  const c = size / 2;
  const r = 70;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 귀 (큰 원) */}
        <circle cx={c - 52} cy={c - 52} r="28" fill="#d4a574" stroke="#c08a5a" strokeWidth="2" />
        <circle cx={c + 52} cy={c - 52} r="28" fill="#d4a574" stroke="#c08a5a" strokeWidth="2" />
        {/* 안쪽 귀 */}
        <circle cx={c - 52} cy={c - 52} r="16" fill="#f0c9a0" />
        <circle cx={c + 52} cy={c - 52} r="16" fill="#f0c9a0" />

        {/* 얼굴 */}
        <circle cx={c} cy={c} r={r} fill="#e8c9a0" stroke="#d4a574" strokeWidth="2.5" />

        {/* 볼 터치 */}
        <circle cx={c - 32} cy={c + 14} r="10" fill="#f9a8d4" opacity="0.35" />
        <circle cx={c + 32} cy={c + 14} r="10" fill="#f9a8d4" opacity="0.35" />

        {/* 눈 */}
        <circle cx={c - 20} cy={c - 14} r="6" fill="#3f2a1a" />
        <circle cx={c + 20} cy={c - 14} r="6" fill="#3f2a1a" />
        {/* 눈 하이라이트 */}
        <circle cx={c - 18} cy={c - 16} r="2" fill="white" />
        <circle cx={c + 22} cy={c - 16} r="2" fill="white" />

        {/* 코 */}
        <ellipse cx={c} cy={c + 4} rx="8" ry="6" fill="#3f2a1a" />
        <ellipse cx={c - 1} cy={c + 2} rx="3" ry="2" fill="#8b6b4a" opacity="0.6" />

        {/* 입 */}
        <path d={`M${c - 6},${c + 10} Q${c},${c + 18} ${c + 6},${c + 10}`} fill="none" stroke="#3f2a1a" strokeWidth="1.5" strokeLinecap="round" />

        {/* 숫자 (12, 3, 6, 9) */}
        {[
          { n: '12', x: c, y: c - r + 18 },
          { n: '3', x: c + r - 18, y: c },
          { n: '6', x: c, y: c + r - 12 },
          { n: '9', x: c - r + 16, y: c },
        ].map(({ n, x, y }) => (
          <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fill="#8b6b4a" fontSize="11" fontWeight="700">{n}</text>
        ))}

        {/* 눈금 점 (12, 3, 6, 9 제외) */}
        {Array.from({ length: 12 }).map((_, i) => {
          if (i % 3 === 0) return null;
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const dr = r - 12;
          return (
            <circle key={i} cx={c + dr * Math.cos(angle)} cy={c + dr * Math.sin(angle)}
              r="2" fill="#c08a5a" opacity="0.5" />
          );
        })}

        {/* 시침 */}
        <line x1={c} y1={c} x2={c + 30 * Math.sin(hourAngle * Math.PI / 180)} y2={c - 30 * Math.cos(hourAngle * Math.PI / 180)}
          stroke="#6b4423" strokeWidth="3.5" strokeLinecap="round" />
        {/* 분침 */}
        <line x1={c} y1={c} x2={c + 46 * Math.sin(minuteAngle * Math.PI / 180)} y2={c - 46 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke="#6b4423" strokeWidth="2.5" strokeLinecap="round" />
        {/* 초침 */}
        <line x1={c} y1={c} x2={c + 50 * Math.sin(secondAngle * Math.PI / 180)} y2={c - 50 * Math.cos(secondAngle * Math.PI / 180)}
          stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />

        {/* 중심 */}
        <circle cx={c} cy={c} r="4" fill="#6b4423" />
        <circle cx={c} cy={c} r="1.5" fill="#e8c9a0" />
      </svg>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#6b4423', fontVariantNumeric: 'tabular-nums' }}>
        {ampm && <span style={{ marginRight: '4px' }}>{ampm}</span>}
        {digitalTime} 🐻
      </div>
    </div>
  );
}
