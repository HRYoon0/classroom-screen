import { BACKGROUNDS } from '../constants';
import { IoClose } from 'react-icons/io5';

interface Props {
  current: string;
  onChange: (bg: string) => void;
  onClose: () => void;
}

export default function BackgroundPicker({ current, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-auto" style={{ padding: '32px', width: '420px' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">배경 설정</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* 그라데이션 배경 */}
        <p className="text-sm text-slate-500 mb-2 font-medium">그라데이션</p>
        <div className="grid grid-cols-4" style={{ gap: '12px', marginBottom: '20px' }}>
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              onClick={() => onChange(bg)}
              className={`w-full aspect-square rounded-xl border-2 transition-all ${
                current === bg
                  ? 'border-indigo-500 scale-105 shadow-lg'
                  : 'border-transparent hover:border-slate-300'
              }`}
              style={{ background: bg }}
            />
          ))}
        </div>

        {/* 단색 배경 */}
        <p className="text-sm text-slate-500 mb-2 font-medium">단색</p>
        <div className="grid grid-cols-6" style={{ gap: '12px', marginBottom: '20px' }}>
          {[
            '#ffffff', '#f1f5f9', '#e2e8f0', '#1e293b', '#0f172a', '#000000',
            '#fef2f2', '#fef9c3', '#f0fdf4', '#eff6ff', '#faf5ff', '#fff1f2',
          ].map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all ${
                current === color
                  ? 'border-indigo-500 scale-105'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* 커스텀 색상 */}
        <p className="text-sm text-slate-500 mb-2 font-medium">직접 선택</p>
        <input
          type="color"
          value={current.startsWith('#') ? current : '#667eea'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer border border-slate-200"
        />
      </div>
    </div>
  );
}
