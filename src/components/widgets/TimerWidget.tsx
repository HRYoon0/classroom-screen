import { useState, useEffect, useRef, useCallback } from 'react';
import { IoPlay, IoStop, IoRefresh, IoVolumeHigh, IoMusicalNotes } from 'react-icons/io5';

const ALARM_SOUNDS = [
  { id: 'alarm1', label: '초인종', file: '/sounds/alarm1.mp3' },
  { id: 'alarm2', label: '맑은 벨', file: '/sounds/alarm2.mp3' },
  { id: 'alarm3', label: '게임 차임', file: '/sounds/alarm3.mp3' },
  { id: 'alarm4', label: '정답', file: '/sounds/alarm4.mp3' },
  { id: 'alarm5', label: '종소리', file: '/sounds/alarm5.mp3' },
  { id: 'beep', label: '기본 비프', file: '' },
];

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function TimerWidget({ config, onConfigChange }: Props) {
  const initialMinutes = (config.minutes as number) || 10;
  const initialSeconds = (config.seconds as number) || 0;
  const selectedSound = (config.alarmSound as string) || 'alarm1';
  const totalInitial = initialMinutes * 60 + initialSeconds;
  const [totalSeconds, setTotalSeconds] = useState(totalInitial);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAlarm = useCallback(() => {
    const sound = ALARM_SOUNDS.find((s) => s.id === selectedSound);
    if (sound && sound.file) {
      const audio = new Audio(sound.file);
      audio.play().catch(() => {});
    } else {
      // 기본 비프음
      try {
        const ctx = new AudioContext();
        const playBeep = (time: number, freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          gain.gain.value = 0.3;
          osc.start(time);
          osc.stop(time + 0.2);
        };
        for (let i = 0; i < 6; i++) {
          playBeep(ctx.currentTime + i * 0.35, i % 2 === 0 ? 880 : 660);
        }
      } catch { /* 오디오 미지원 */ }
    }
  }, [selectedSound]);

  // 미리듣기
  const handlePreview = (soundId: string) => {
    // 이미 재생 중이면 중지
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (previewingId === soundId) {
      setPreviewingId(null);
      return;
    }

    const sound = ALARM_SOUNDS.find((s) => s.id === soundId);
    if (sound && sound.file) {
      const audio = new Audio(sound.file);
      previewAudioRef.current = audio;
      setPreviewingId(soundId);
      audio.play().catch(() => {});
      audio.onended = () => {
        setPreviewingId(null);
        previewAudioRef.current = null;
      };
    } else {
      // 비프음 미리듣기
      setPreviewingId(soundId);
      try {
        const ctx = new AudioContext();
        const playBeep = (time: number, freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          gain.gain.value = 0.3;
          osc.start(time);
          osc.stop(time + 0.2);
        };
        for (let i = 0; i < 6; i++) {
          playBeep(ctx.currentTime + i * 0.35, i % 2 === 0 ? 880 : 660);
        }
        setTimeout(() => setPreviewingId(null), 2200);
      } catch { setPreviewingId(null); }
    }
  };

  const selectSound = (soundId: string) => {
    onConfigChange({ ...config, alarmSound: soundId });
    setShowSoundPicker(false);
    // 미리듣기 중지
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewingId(null);
  };

  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, playAlarm]);

  // 컴포넌트 언마운트 시 미리듣기 정리
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = totalInitial > 0 ? totalSeconds / totalInitial : 0;

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const adjustTime = (field: 'min10' | 'min1' | 'sec10' | 'sec1', delta: number) => {
    if (isRunning) return;
    let m = minutes;
    let s = seconds;
    switch (field) {
      case 'min10': m += delta * 10; break;
      case 'min1': m += delta; break;
      case 'sec10': s += delta * 10; break;
      case 'sec1': s += delta; break;
    }
    m = Math.max(0, Math.min(99, m));
    s = Math.max(0, Math.min(59, s));
    const newTotal = m * 60 + s;
    setTotalSeconds(newTotal);
    setIsFinished(false);
    onConfigChange({ ...config, minutes: m, seconds: s });
  };

  const reset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(totalInitial);
  };

  const min10 = Math.floor(minutes / 10);
  const min1 = minutes % 10;
  const sec10 = Math.floor(seconds / 10);
  const sec1 = seconds % 10;

  const digitW = 'w-[38px]';
  const currentSoundLabel = ALARM_SOUNDS.find((s) => s.id === selectedSound)?.label || '초인종';

  return (
    <div className="flex items-center justify-center h-full gap-6" style={{ position: 'relative' }}>
      {/* 원형 프로그래스 링 */}
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e8e8ef" strokeWidth="6" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={isFinished ? '#ef4444' : '#6366f1'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000"
          />
        </svg>
        <button
          onClick={() => {
            if (isFinished) reset();
            else setIsRunning(!isRunning);
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isFinished
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : isRunning
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}>
            {isFinished ? <IoRefresh size={24} /> : isRunning ? <IoStop size={22} /> : <IoPlay size={24} className="ml-0.5" />}
          </div>
        </button>
        {(isRunning || totalSeconds !== totalInitial || isFinished) && (
          <button
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white shadow border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors"
            title="초기화"
          >
            <IoRefresh size={14} />
          </button>
        )}
      </div>

      {/* 시간 표시 + 조절 */}
      <div className="flex flex-col items-center">
        {/* + 버튼 행 */}
        <div className="flex items-center mb-1">
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('min10', 1)} label="+" hidden={isRunning} />
          </div>
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('min1', 1)} label="+" hidden={isRunning} />
          </div>
          <div className="w-[20px]" />
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('sec10', 1)} label="+" hidden={isRunning} />
          </div>
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('sec1', 1)} label="+" hidden={isRunning} />
          </div>
        </div>

        {/* 시간 숫자 */}
        <div className={`flex items-center ${isFinished ? 'animate-pulse' : ''}`}>
          <span className={`${digitW} text-center text-6xl font-bold text-slate-800 tabular-nums font-mono`}>{min10}</span>
          <span className={`${digitW} text-center text-6xl font-bold text-slate-800 tabular-nums font-mono`}>{min1}</span>
          <span className="w-[20px] text-center text-5xl font-bold text-slate-400">:</span>
          <span className={`${digitW} text-center text-6xl font-bold text-slate-800 tabular-nums font-mono`}>{sec10}</span>
          <span className={`${digitW} text-center text-6xl font-bold text-slate-800 tabular-nums font-mono`}>{sec1}</span>
        </div>

        {/* - 버튼 행 */}
        <div className="flex items-center mt-1">
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('min10', -1)} label="−" hidden={isRunning} />
          </div>
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('min1', -1)} label="−" hidden={isRunning} />
          </div>
          <div className="w-[20px]" />
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('sec10', -1)} label="−" hidden={isRunning} />
          </div>
          <div className={`${digitW} flex justify-center`}>
            <AdjustBtn onClick={() => adjustTime('sec1', -1)} label="−" hidden={isRunning} />
          </div>
        </div>

        {/* 소리 선택 버튼 */}
        <button
          onClick={() => setShowSoundPicker(!showSoundPicker)}
          style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: showSoundPicker ? '#eef2ff' : '#f8fafc',
            cursor: 'pointer',
            fontSize: '11px',
            color: '#64748b',
            transition: 'all 0.15s',
          }}
        >
          <IoMusicalNotes size={12} />
          {currentSoundLabel}
        </button>
      </div>

      {/* 소리 선택 팝업 */}
      {showSoundPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            right: '0',
            transform: 'translateY(100%)',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            padding: '8px',
            zIndex: 100,
            minWidth: '200px',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', padding: '4px 8px 6px', margin: 0 }}>
            알람 소리
          </p>
          {ALARM_SOUNDS.map((sound) => (
            <div
              key={sound.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedSound === sound.id ? '#eef2ff' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = selectedSound === sound.id ? '#eef2ff' : '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = selectedSound === sound.id ? '#eef2ff' : 'transparent')}
            >
              {/* 미리듣기 버튼 */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePreview(sound.id); }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: 'none',
                  background: previewingId === sound.id ? '#6366f1' : '#f1f5f9',
                  color: previewingId === sound.id ? 'white' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <IoVolumeHigh size={13} />
              </button>
              {/* 소리 이름 */}
              <span
                onClick={() => selectSound(sound.id)}
                style={{
                  flex: 1,
                  fontSize: '13px',
                  fontWeight: selectedSound === sound.id ? 600 : 400,
                  color: selectedSound === sound.id ? '#6366f1' : '#334155',
                }}
              >
                {sound.label}
              </span>
              {/* 선택 표시 */}
              {selectedSound === sound.id && (
                <span style={{ fontSize: '13px', color: '#6366f1' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdjustBtn({ onClick, label, hidden }: { onClick: () => void; label: string; hidden: boolean }) {
  return (
    <button
      onClick={hidden ? undefined : onClick}
      className={`w-8 h-6 flex items-center justify-center rounded text-lg font-bold transition-colors ${
        hidden
          ? 'text-transparent pointer-events-none'
          : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
      }`}
    >
      {label}
    </button>
  );
}
