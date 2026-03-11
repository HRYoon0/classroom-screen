import { useState, useEffect } from 'react';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // 아날로그 시계 각도 계산
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const size = 180;
  const center = size / 2;
  const clockRadius = 78;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      {/* 아날로그 시계 */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 시계 테두리 */}
        <circle
          cx={center} cy={center} r={clockRadius}
          fill="none" stroke="#6366f1" strokeWidth="2.5" opacity="0.6"
        />

        {/* 눈금 및 숫자 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const numR = clockRadius - 16;
          const tickOuterR = clockRadius - 4;
          const tickInnerR = clockRadius - 10;
          const nx = center + numR * Math.cos(angle);
          const ny = center + numR * Math.sin(angle);
          const tx1 = center + tickOuterR * Math.cos(angle);
          const ty1 = center + tickOuterR * Math.sin(angle);
          const tx2 = center + tickInnerR * Math.cos(angle);
          const ty2 = center + tickInnerR * Math.sin(angle);
          return (
            <g key={i}>
              <line
                x1={tx1} y1={ty1} x2={tx2} y2={ty2}
                stroke="#6366f1" strokeWidth="1.5" opacity="0.4"
              />
              <text
                x={nx} y={ny}
                textAnchor="middle" dominantBaseline="central"
                className="text-xs font-medium" fill="#64748b"
                fontSize="13"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* 분침 눈금 (5분 단위 제외) */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null;
          const angle = (i * 6 - 90) * (Math.PI / 180);
          const r1 = clockRadius - 4;
          const r2 = clockRadius - 7;
          return (
            <line
              key={`m${i}`}
              x1={center + r1 * Math.cos(angle)}
              y1={center + r1 * Math.sin(angle)}
              x2={center + r2 * Math.cos(angle)}
              y2={center + r2 * Math.sin(angle)}
              stroke="#cbd5e1" strokeWidth="0.8"
            />
          );
        })}

        {/* 시침 */}
        <line
          x1={center} y1={center}
          x2={center + 40 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={center - 40 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"
        />

        {/* 분침 */}
        <line
          x1={center} y1={center}
          x2={center + 56 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={center - 56 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* 초침 */}
        <line
          x1={center} y1={center}
          x2={center + 60 * Math.sin((secondAngle * Math.PI) / 180)}
          y2={center - 60 * Math.cos((secondAngle * Math.PI) / 180)}
          stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"
        />

        {/* 중심점 */}
        <circle cx={center} cy={center} r="3.5" fill="#1e293b" />
        <circle cx={center} cy={center} r="1.5" fill="white" />
      </svg>

      {/* 디지털 시간 */}
      <div className="text-lg font-semibold text-slate-700 tabular-nums">
        {hours > 12 ? '오후' : '오전'}{' '}
        {String(hours > 12 ? hours - 12 : hours || 12).padStart(1, '0')}:
        {String(minutes).padStart(2, '0')}
      </div>
    </div>
  );
}
