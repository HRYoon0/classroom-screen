import { useState, useEffect } from 'react';

type ClockStyle = 'classic' | 'minimal' | 'digital' | 'neon';

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
