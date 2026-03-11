import { useRef, useState, useCallback, type ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import type { WidgetData } from '../types/widget';

interface Props {
  widget: WidgetData;
  onUpdate: (id: string, data: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  children: ReactNode;
  title: string;
}

export default function WidgetWrapper({
  widget,
  onUpdate,
  onRemove,
  onBringToFront,
  children,
  title,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // 드래그
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'CANVAS', 'A'].includes(tag)) return;
      if (el.isContentEditable) return;

      e.preventDefault();
      e.stopPropagation();
      onBringToFront(widget.id);
      setIsDragging(true);
      setIsSelected(true);

      const startX = e.clientX - widget.x;
      const startY = e.clientY - widget.y;

      const handleMove = (ev: MouseEvent) => {
        onUpdate(widget.id, {
          x: ev.clientX - startX,
          y: ev.clientY - startY,
        });
      };

      const handleUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [widget.id, widget.x, widget.y, onUpdate, onBringToFront]
  );

  // 리사이즈
  const handleResize = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.preventDefault();
      e.stopPropagation();
      onBringToFront(widget.id);

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startW = widget.w;
      const startH = widget.h;
      const startX = widget.x;
      const startY = widget.y;

      const handleMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startMouseX;
        const dy = ev.clientY - startMouseY;

        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        if (corner === 'bottom-right') {
          newW = startW + dx;
          newH = startH + dy;
        } else if (corner === 'bottom-left') {
          newW = startW - dx;
          newH = startH + dy;
          newX = startX + dx;
        } else if (corner === 'top-right') {
          newW = startW + dx;
          newH = startH - dy;
          newY = startY + dy;
        } else if (corner === 'top-left') {
          newW = startW - dx;
          newH = startH - dy;
          newX = startX + dx;
          newY = startY + dy;
        }

        // 최소 크기 제한
        if (newW < 120) { newW = 120; if (corner.includes('left')) newX = startX + startW - 120; }
        if (newH < 80) { newH = 80; if (corner.includes('top')) newY = startY + startH - 80; }

        onUpdate(widget.id, { x: newX, y: newY, w: newW, h: newH });
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [widget.id, widget.x, widget.y, widget.w, widget.h, onUpdate, onBringToFront]
  );

  const handleClickOutside = useCallback(() => {
    setIsSelected(false);
  }, []);

  return (
    <>
      {isSelected && (
        <div
          className="fixed inset-0"
          style={{ zIndex: widget.zIndex - 1 }}
          onMouseDown={handleClickOutside}
        />
      )}

      <div
        ref={containerRef}
        className="absolute flex flex-col select-none group"
        style={{
          left: widget.x,
          top: widget.y,
          width: widget.w,
          height: widget.h,
          zIndex: widget.zIndex,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={() => {
          if (!isSelected) {
            onBringToFront(widget.id);
            setIsSelected(true);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 선택 시 파란 테두리 + 리사이즈 핸들 */}
        {isSelected && (
          <>
            <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl pointer-events-none" style={{ margin: -2 }} />
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
              <div
                key={corner}
                className={`absolute w-3.5 h-3.5 bg-white border-2 border-indigo-400 rounded-full cursor-se-resize z-10 ${
                  corner === 'top-left' ? '-top-1.5 -left-1.5 cursor-nw-resize' :
                  corner === 'top-right' ? '-top-1.5 -right-1.5 cursor-ne-resize' :
                  corner === 'bottom-left' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' :
                  '-bottom-1.5 -right-1.5 cursor-se-resize'
                }`}
                onMouseDown={(e) => handleResize(e, corner)}
              />
            ))}
          </>
        )}

        {/* 위젯 본체 */}
        <div
          className="widget-card flex flex-col h-full w-full overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="flex-1 overflow-hidden min-h-0" style={{ padding: 24 }}>{children}</div>
        </div>

        {/* 플로팅 삭제 버튼 */}
        {(isHovered || isSelected) && (
          <div
            className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200/60 px-1 py-0.5"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onRemove(widget.id)}
              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="삭제"
            >
              <IoClose size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
