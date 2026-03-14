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
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  // 종소리 재생
  const playBell = useCallback(() => {
    if (!bellEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* 무시 */ }
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

  // 반원 게이지 계산
  const gaugeRadius = 70;
  const gaugeCircumference = Math.PI * gaugeRadius; // 반원
  const gaugeProgress = Math.min(level / 100, 1);
  const gaugeOffset = gaugeCircumference * (1 - gaugeProgress);

  // 게이지 색상
  const gaugeColor = level > 70 ? '#ef4444' : level > 40 ? '#f59e0b' : '#22c55e';

  // 슬라이더 눈금 위치 (5단계)
  const sliderMarks = [0, 25, 50, 75, 100];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '4px 0' }}>
      {/* 반원 게이지 */}
      <div style={{ position: 'relative', width: '180px', height: '100px' }}>
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* 배경 호 */}
          <path
            d="M 10,95 A 80,80 0 0,1 170,95"
            fill="none" stroke="#fee2e2" strokeWidth="14" strokeLinecap="round"
          />
          {/* 게이지 호 */}
          <path
            d="M 10,95 A 80,80 0 0,1 170,95"
            fill="none" stroke={gaugeColor} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${gaugeCircumference}`}
            strokeDashoffset={gaugeOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
          />
        </svg>
        {/* 중앙 텍스트 */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '32px',
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

      {/* "최대 소음" 라벨 */}
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
        최대 소음
      </div>

      {/* 임계값 슬라이더 */}
      <div style={{ width: '100%', padding: '0 8px', position: 'relative' }}>
        <input
          type="range"
          min={10}
          max={90}
          value={threshold}
          onChange={(e) => onConfigChange({ ...config, threshold: Number(e.target.value) })}
          style={{
            width: '100%',
            accentColor: '#6366f1',
            cursor: 'pointer',
          }}
        />
        {/* 슬라이더 눈금 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: '-2px' }}>
          {sliderMarks.map((m) => (
            <span key={m} style={{ fontSize: '9px', color: '#94a3b8' }}>{m}</span>
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
        {/* 종 토글 */}
        <button
          onClick={() => onConfigChange({ ...config, bellEnabled: !bellEnabled })}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `2px solid ${bellEnabled ? '#6366f1' : '#e2e8f0'}`,
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: bellEnabled ? '#6366f1' : '#94a3b8',
            transition: 'all 0.15s',
          }}
        >
          {bellEnabled ? <IoNotifications size={20} /> : <IoNotificationsOff size={20} />}
        </button>

        {/* 초과 횟수 */}
        {overCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            background: '#eef2ff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#6366f1',
          }}>
            <IoNotifications size={16} />
            {overCount}
          </div>
        )}

        {/* 마이크 토글 */}
        <button
          onClick={isActive ? stop : start}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `2px solid ${isActive ? '#ef4444' : '#1e293b'}`,
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? '#ef4444' : '#1e293b',
            transition: 'all 0.15s',
          }}
        >
          {isActive ? <IoMicOff size={20} /> : <IoMic size={20} />}
        </button>
      </div>
    </div>
  );
}
