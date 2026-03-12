import { useState, useEffect, useCallback } from 'react';

// 가상 캔버스 기준 너비 (고정)
export const VIRTUAL_WIDTH = 1920;

interface CanvasLayout {
  scale: number;
  virtualHeight: number;
}

function calcLayout(): CanvasLayout {
  const scale = window.innerWidth / VIRTUAL_WIDTH;
  return {
    scale,
    virtualHeight: window.innerHeight / scale,
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
