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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {/* 신호등 하우징 */}
      {/* 신호등 하우징 */}
      <div style={{ background: 'linear-gradient(to bottom, #64748b, #334155)', borderRadius: '56px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {LIGHTS.map(({ color, activeColor, glowColor, dimColor }) => {
          const isActive = activeLight === color;
          return (
            <button
              key={color}
              onClick={() => setActiveLight(activeLight === color ? 'off' : color)}
              style={{
                position: 'relative',
                width: 112,
                height: 112,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backgroundColor: isActive ? activeColor : dimColor,
                boxShadow: isActive
                  ? `0 0 40px ${glowColor}, inset 0 -6px 12px rgba(0,0,0,0.2), 0 0 80px ${glowColor}`
                  : 'inset 0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              {/* 하이라이트 반사광 */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '48px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                }} />
              )}
            </button>
          );
        })}
      </div>
      {/* 활성 라벨 - 신호등 아래 */}
      {activeLight !== 'off' && (
        <p style={{
          marginTop: '16px',
          fontSize: '28px',
          fontWeight: 700,
          color: LIGHTS.find((l) => l.color === activeLight)?.activeColor,
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          margin: '16px 0 0',
        }}>
          {LIGHTS.find((l) => l.color === activeLight)?.label}
        </p>
      )}
    </div>
  );
}
