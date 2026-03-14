import { useState, useEffect } from 'react';

type ClockStyle = 'classic' | 'minimal' | 'digital' | 'neon' | 'cat' | 'flower';

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
  if (clockStyle === 'neon') return <NeonClock time={digitalTime} seconds={seconds} ampm={ampm} />;
  if (clockStyle === 'cat') return <CatClock hourAngle={hourAngle} minuteAngle={minuteAngle} secondAngle={secondAngle} digitalTime={digitalTime} ampm={ampm} />;
  if (clockStyle === 'flower') return <FlowerClock hourAngle={hourAngle} minuteAngle={minuteAngle} secondAngle={secondAngle} digitalTime={digitalTime} ampm={ampm} />;

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

// 꽃 시계 스타일
function FlowerClock({ hourAngle, minuteAngle, secondAngle, digitalTime, ampm }: AnalogProps) {
  const size = 200;
  const c = size / 2;
  const r = 70;

  // 꽃잎 색상들
  const petalColors = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a', '#fca5a5', '#d8b4fe', '#a5f3fc'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 꽃잎 (12개) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const px = c + (r + 6) * Math.cos(angle);
          const py = c + (r + 6) * Math.sin(angle);
          return (
            <ellipse key={i}
              cx={px} cy={py} rx="16" ry="10"
              fill={petalColors[i % petalColors.length]}
              opacity="0.7"
              transform={`rotate(${i * 30} ${px} ${py})`}
            />
          );
        })}

        {/* 시계 원 */}
        <circle cx={c} cy={c} r={r - 6} fill="white" />
        <circle cx={c} cy={c} r={r - 6} fill="none" stroke="#e9d5ff" strokeWidth="2" />

        {/* 숫자 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const nr = r - 22;
          return (
            <text key={i}
              x={c + nr * Math.cos(angle)} y={c + nr * Math.sin(angle)}
              textAnchor="middle" dominantBaseline="central"
              fill="#7c3aed" fontSize="13" fontWeight="600"
            >
              {i + 1}
            </text>
          );
        })}

        {/* 눈금 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const r1 = r - 8;
          const r2 = r - 13;
          return (
            <line key={`t${i}`}
              x1={c + r1 * Math.cos(angle)} y1={c + r1 * Math.sin(angle)}
              x2={c + r2 * Math.cos(angle)} y2={c + r2 * Math.sin(angle)}
              stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"
            />
          );
        })}

        {/* 시침 */}
        <line x1={c} y1={c} x2={c + 30 * Math.sin(hourAngle * Math.PI / 180)} y2={c - 30 * Math.cos(hourAngle * Math.PI / 180)}
          stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
        {/* 분침 */}
        <line x1={c} y1={c} x2={c + 44 * Math.sin(minuteAngle * Math.PI / 180)} y2={c - 44 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        {/* 초침 */}
        <line x1={c} y1={c} x2={c + 48 * Math.sin(secondAngle * Math.PI / 180)} y2={c - 48 * Math.cos(secondAngle * Math.PI / 180)}
          stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />

        {/* 중심 꽃 */}
        <circle cx={c} cy={c} r="6" fill="#fbbf24" />
        <circle cx={c} cy={c} r="3" fill="#f59e0b" />
      </svg>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed', fontVariantNumeric: 'tabular-nums' }}>
        {ampm && <span style={{ marginRight: '4px' }}>{ampm}</span>}
        {digitalTime} 🌸
      </div>
    </div>
  );
}

// 네온 시계 스타일
function NeonClock({ time, seconds, ampm }: { time: string; seconds: number; ampm: string }) {
  const progress = seconds / 60;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
      {/* 원형 초 프로그래스 */}
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle cx="85" cy="85" r={radius} fill="none" stroke="#1e293b" strokeWidth="3" opacity="0.15" />
        <circle cx="85" cy="85" r={radius} fill="none"
          stroke="#818cf8" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 85 85)"
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
        {/* 시간 텍스트 */}
        <text x="85" y={ampm ? '78' : '85'} textAnchor="middle" dominantBaseline="central"
          fill="#6366f1" fontSize="42" fontWeight="700"
          fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          style={{ letterSpacing: '1px' }}
        >
          {time}
        </text>
        {ampm && (
          <text x="85" y="106" textAnchor="middle" dominantBaseline="central"
            fill="#818cf8" fontSize="16" fontWeight="600"
          >
            {ampm}
          </text>
        )}
      </svg>
    </div>
  );
}
