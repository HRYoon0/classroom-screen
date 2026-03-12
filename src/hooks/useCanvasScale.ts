import { useState, useEffect } from 'react';

// 가상 캔버스 기준 크기 (모든 위젯 좌표는 이 기준으로 저장)
export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

function calcScale() {
  return Math.min(
    window.innerWidth / VIRTUAL_WIDTH,
    window.innerHeight / VIRTUAL_HEIGHT
  );
}

export function useCanvasScale() {
  const [scale, setScale] = useState(calcScale);

  useEffect(() => {
    const handleResize = () => setScale(calcScale());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scale;
}
