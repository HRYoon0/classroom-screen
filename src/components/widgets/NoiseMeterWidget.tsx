import { useState, useEffect, useRef } from 'react';

export default function NoiseMeterWidget() {
  const [level, setLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [isOverThreshold, setIsOverThreshold] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

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

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(100, (avg / 128) * 100);
        setLevel(normalized);
        setIsOverThreshold(normalized > threshold);
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

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const getColor = () => {
    if (level < 30) return 'bg-green-400';
    if (level < 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {/* 레벨 바 */}
      <div className="w-full flex items-end gap-0.5 h-16 justify-center">
        {Array.from({ length: 20 }).map((_, i) => {
          const barThreshold = (i + 1) * 5;
          const isLit = isActive && level >= barThreshold;
          return (
            <div
              key={i}
              className={`w-3 rounded-sm transition-all duration-75 ${
                isLit
                  ? barThreshold > 70
                    ? 'bg-red-400'
                    : barThreshold > 40
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                  : 'bg-slate-100'
              }`}
              style={{ height: `${20 + i * 3.5}%` }}
            />
          );
        })}
      </div>

      {/* 수치 */}
      <div
        className={`text-3xl font-bold font-mono tabular-nums ${
          isOverThreshold ? 'text-red-500 animate-pulse' : 'text-slate-700'
        }`}
      >
        {isActive ? Math.round(level) : '--'}
        <span className="text-sm text-slate-400 ml-1">%</span>
      </div>

      {/* 임계값 슬라이더 */}
      <div className="w-full flex items-center gap-2 text-xs text-slate-500">
        <span>한계</span>
        <input
          type="range"
          min={10}
          max={90}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="font-mono w-6 text-right">{threshold}</span>
      </div>

      <button
        onClick={isActive ? stop : start}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold text-white ${
          isActive
            ? 'bg-red-400 hover:bg-red-500'
            : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
      >
        {isActive ? '중지' : '측정 시작'}
      </button>
    </div>
  );
}
