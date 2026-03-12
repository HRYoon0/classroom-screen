import { useState, useEffect, useCallback } from 'react';

// 가상 캔버스 기준 크기
export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

interface CanvasLayout {
  scale: number;
  offsetX: number;
  offsetY: number;
}

function calcLayout(): CanvasLayout {
  const scale = Math.min(
    window.innerWidth / VIRTUAL_WIDTH,
    window.innerHeight / VIRTUAL_HEIGHT
  );
  return {
    scale,
    offsetX: (window.innerWidth - VIRTUAL_WIDTH * scale) / 2,
    offsetY: (window.innerHeight - VIRTUAL_HEIGHT * scale) / 2,
  };
}

export function useCanvasScale() {
  const [layout, setLayout] = useState(calcLayout);

  const handleResize = useCallback(() => setLayout(calcLayout()), []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return layout;
}
