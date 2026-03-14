import { useState } from 'react';

type Light = 'red' | 'yellow' | 'green' | 'off';

const LIGHTS: {
  color: Light;
  activeColor: string;
  glowColor: string;
  dimColor: string;
  label: string;
}[] = [
  {
    color: 'red',
    activeColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.5)',
    dimColor: '#7f1d1d',
    label: '조용히',
  },
  {
    color: 'yellow',
    activeColor: '#eab308',
    glowColor: 'rgba(234,179,8,0.5)',
    dimColor: '#713f12',
    label: '속삭이기',
  },
  {
    color: 'green',
    activeColor: '#22c55e',
    glowColor: 'rgba(34,197,94,0.5)',
    dimColor: '#14532d',
    label: '대화 가능',
  },
];

export default function TrafficLightWidget() {
  const [activeLight, setActiveLight] = useState<Light>('green');

  return (
    <div className="flex items-center justify-center h-full">
      {/* 신호등 하우징 */}
      <div className="bg-gradient-to-b from-slate-500 to-slate-700 rounded-[28px] p-3 flex flex-col gap-2.5 shadow-lg">
        {LIGHTS.map(({ color, activeColor, glowColor, dimColor, label }) => {
          const isActive = activeLight === color;
          return (
            <button
              key={color}
              onClick={() => setActiveLight(activeLight === color ? 'off' : color)}
              className="relative rounded-full transition-all duration-300"
              style={{
                width: 56,
                height: 56,
                backgroundColor: isActive ? activeColor : dimColor,
                boxShadow: isActive
                  ? `0 0 20px ${glowColor}, inset 0 -3px 6px rgba(0,0,0,0.2), 0 0 40px ${glowColor}`
                  : 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {/* 하이라이트 반사광 */}
              {isActive && (
                <div
                  className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                  }}
                />
              )}
              {/* 활성화 시 라벨 표시 */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  left: '68px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: activeColor,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
