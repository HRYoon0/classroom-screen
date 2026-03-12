import { useState, useEffect } from 'react';

// 가상 캔버스 기준 너비 (모든 위젯 좌표는 이 기준으로 저장)
export const VIRTUAL_WIDTH = 1920;

export function useCanvasScale() {
  const [scale, setScale] = useState(() => window.innerWidth / VIRTUAL_WIDTH);

  useEffect(() => {
    const handleResize = () => setScale(window.innerWidth / VIRTUAL_WIDTH);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scale;
}
