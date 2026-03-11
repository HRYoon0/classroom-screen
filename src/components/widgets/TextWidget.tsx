import { useRef, useEffect, useCallback, memo } from 'react';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

const FONT_OPTIONS = [
  { label: '기본', value: 'sans-serif' },
  { label: '나눔고딕', value: "'Nanum Gothic', sans-serif" },
  { label: '나눔명조', value: "'Nanum Myeongjo', serif" },
  { label: 'Gothic A1', value: "'Gothic A1', sans-serif" },
  { label: '도현', value: "'Do Hyeon', sans-serif" },
  { label: '주아', value: "'Jua', sans-serif" },
  { label: '감자꽃', value: "'Gamja Flower', cursive" },
  { label: '하이멜로디', value: "'Hi Melody', cursive" },
  { label: '개구', value: "'Gaegu', cursive" },
  { label: '검은고딕', value: "'Black Han Sans', sans-serif" },
  { label: '해바라기', value: "'Sunflower', sans-serif" },
  { label: '귀여운폰트', value: "'Cute Font', cursive" },
  { label: '독도', value: "'Dokdo', cursive" },
  { label: '푸어스토리', value: "'Poor Story', cursive" },
  { label: '싱글데이', value: "'Single Day', cursive" },
  { label: '스타일리쉬', value: "'Stylish', sans-serif" },
  { label: '구기', value: "'Gugi', cursive" },
  { label: '송명', value: "'Song Myung', serif" },
  { label: '동해독도', value: "'East Sea Dokdo', cursive" },
  { label: '나눔펜', value: "'Nanum Pen Script', cursive" },
  { label: '나눔붓', value: "'Nanum Brush Script', cursive" },
  { label: '고정폭', value: 'monospace' },
];

const ALIGN_OPTIONS = [
  { label: '왼쪽', value: 'left', icon: '⫷' },
  { label: '가운데', value: 'center', icon: '☰' },
  { label: '오른쪽', value: 'right', icon: '⫸' },
];

const COLOR_PRESETS = [
  '#1e293b', '#475569', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#2563eb', '#7c3aed',
  '#db2777', '#ffffff',
];

function TextWidget({ config, onConfigChange }: Props) {
  const fontSize = (config.fontSize as number) || 24;
  const fontFamily = (config.fontFamily as string) || 'sans-serif';
  const bold = (config.bold as boolean) || false;
  const italic = (config.italic as boolean) || false;
  const align = (config.align as string) || 'center';
  const color = (config.color as string) || '#1e293b';
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // 마운트 시 텍스트 + 스타일 설정, 서식 변경 시 ref로 직접 DOM 업데이트
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!initializedRef.current) {
      el.innerText = (config.text as string) || '';
      initializedRef.current = true;
    }
    el.style.fontSize = `${fontSize}px`;
    el.style.fontFamily = fontFamily;
    el.style.fontWeight = bold ? '700' : '400';
    el.style.fontStyle = italic ? 'italic' : 'normal';
    el.style.textAlign = align;
    el.style.color = color;
    el.style.lineHeight = '1.6';
    el.style.caretColor = color;
  }, [fontSize, fontFamily, bold, italic, align, color]);

  // blur 시 텍스트 저장
  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      onConfigChange({ text: editorRef.current.innerText });
    }
  }, [onConfigChange]);

  // 서식 변경
  const update = useCallback((patch: Record<string, unknown>) => {
    onConfigChange(patch);
  }, [onConfigChange]);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* contentEditable 편집 영역 - 폰트 스타일은 ref로만 적용 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={handleBlur}
        data-placeholder="텍스트를 입력하세요..."
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 40,
          overflowY: 'auto',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />

      {/* 하단 서식 도구 모음 */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-1 pt-2 pb-1 border-t border-slate-100 flex-wrap bg-white/80 backdrop-blur-sm"
        onMouseDown={(e) => e.preventDefault()}
      >
        <select
          value={fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 max-w-[100px] px-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded cursor-pointer focus:outline-none hover:bg-slate-100"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 px-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded cursor-pointer focus:outline-none hover:bg-slate-100"
        >
          {[14, 18, 24, 32, 40, 48, 60, 72, 96].map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <button
          onClick={() => update({ bold: !bold })}
          className={`w-7 h-7 flex items-center justify-center rounded text-[13px] font-bold transition-colors ${
            bold ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          B
        </button>

        <button
          onClick={() => update({ italic: !italic })}
          className={`w-7 h-7 flex items-center justify-center rounded text-[13px] italic transition-colors ${
            italic ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          I
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {ALIGN_OPTIONS.map((a) => (
          <button
            key={a.value}
            onClick={() => update({ align: a.value })}
            className={`w-7 h-7 flex items-center justify-center rounded text-[12px] transition-colors ${
              align === a.value ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={a.label}
          >
            {a.icon}
          </button>
        ))}

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <div className="flex items-center gap-0.5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => update({ color: c })}
              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? 'border-indigo-400 scale-110' : 'border-slate-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(TextWidget);
