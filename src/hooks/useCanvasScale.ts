import { useState, useEffect, useCallback } from 'react';

// 가상 캔버스 기준 크기
export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

interface CanvasLayout {
  scaleX: number;
  scaleY: number;
}

function calcLayout(): CanvasLayout {
  return {
    scaleX: window.innerWidth / VIRTUAL_WIDTH,
    scaleY: window.innerHeight / VIRTUAL_HEIGHT,
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
