import { useState, useEffect, useRef, useCallback } from 'react';
import { IoMic, IoMicOff, IoNotifications, IoNotificationsOff } from 'react-icons/io5';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function NoiseMeterWidget({ config, onConfigChange }: Props) {
  const threshold = (config.threshold as number) ?? 50;
  const bellEnabled = (config.bellEnabled as boolean) ?? true;
  const [level, setLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [overCount, setOverCount] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const wasOverRef = useRef(false);
  // 종소리 재생 (맑은 벨 효과음)
  const playBell = useCallback(() => {
    if (!bellEnabled) return;
    const audio = new Audio('/sounds/alarm2.mp3');
    audio.play().catch(() => {});
  }, [bellEnabled]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsActive(true);
      setOverCount(0);
      wasOverRef.current = false;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(100, (avg / 128) * 100);
        setLevel(normalized);
        rafRef.current = requestAnimationFrame(update);
      };
      update();
    } catch {
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsActive(false);
    setLevel(0);
  };

  // 임계값 초과 감지 + 종소리
  useEffect(() => {
    if (!isActive) return;
    if (level > threshold && !wasOverRef.current) {
      wasOverRef.current = true;
      setOverCount((c) => c + 1);
      playBell();
    } else if (level <= threshold) {
      wasOverRef.current = false;
    }
  }, [level, threshold, isActive, playBell]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const gaugeProgress = isActive ? Math.min(level / 100, 1) : 0;

  // 게이지 색상
  const gaugeColor = level > 70 ? '#ef4444' : level > 40 ? '#f59e0b' : '#22c55e';

  // 슬라이더 눈금 위치 (5단계)
  const sliderMarks = [0, 25, 50, 75, 100];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', padding: '4px 0' }}>
      {/* 반원 게이지 */}
      <div style={{ position: 'relative', width: '250px', height: '138px' }}>
        <svg width="250" height="138" viewBox="0 0 250 138">
          <path
            d="M 12,133 A 113,113 0 0,1 238,133"
            fill="none" stroke="#fee2e2" strokeWidth="18" strokeLinecap="round"
          />
          {gaugeProgress > 0 && (
            <path
              d="M 12,133 A 113,113 0 0,1 238,133"
              fill="none" stroke={gaugeColor} strokeWidth="18" strokeLinecap="butt"
              strokeDasharray="355"
              strokeDashoffset={355 * (1 - gaugeProgress)}
              style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
            />
          )}
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '44px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'monospace',
            color: isActive ? gaugeColor : '#94a3b8',
            lineHeight: 1,
          }}>
            {isActive ? Math.round(level) : '--'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '18px', color: '#64748b', fontWeight: 500 }}>
        최대 소음
      </div>

      <div style={{ width: '100%', padding: '0 12px', position: 'relative' }}>
        <input
          type="range"
          min={10}
          max={90}
          value={threshold}
          onChange={(e) => onConfigChange({ ...config, threshold: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: '0' }}>
          {sliderMarks.map((m) => (
            <span key={m} style={{ fontSize: '12px', color: '#94a3b8' }}>{m}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '2px' }}>
        <button
          onClick={() => onConfigChange({ ...config, bellEnabled: !bellEnabled })}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: `2px solid ${bellEnabled ? '#6366f1' : '#e2e8f0'}`,
            background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bellEnabled ? '#6366f1' : '#94a3b8', transition: 'all 0.15s',
          }}
        >
          {bellEnabled ? <IoNotifications size={24} /> : <IoNotificationsOff size={24} />}
        </button>

        {overCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '8px 14px', background: '#eef2ff', borderRadius: '8px',
            fontSize: '18px', fontWeight: 600, color: '#6366f1',
          }}>
            <IoNotifications size={18} />
            {overCount}
          </div>
        )}

        <button
          onClick={isActive ? stop : start}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: `2px solid ${isActive ? '#ef4444' : '#1e293b'}`,
            background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isActive ? '#ef4444' : '#1e293b', transition: 'all 0.15s',
          }}
        >
          {isActive ? <IoMicOff size={24} /> : <IoMic size={24} />}
        </button>
      </div>
    </div>
  );
}
