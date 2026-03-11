import type { WidgetMeta, WidgetType } from './types/widget';

export const WIDGET_META: Record<WidgetType, WidgetMeta> = {
  timer: { type: 'timer', label: '타이머', icon: '⏱️', defaultW: 420, defaultH: 200 },
  stopwatch: { type: 'stopwatch', label: '스톱워치', icon: '⏱', defaultW: 320, defaultH: 200 },
  clock: { type: 'clock', label: '시계', icon: '🕐', defaultW: 260, defaultH: 300 },
  'traffic-light': { type: 'traffic-light', label: '신호등', icon: '🚦', defaultW: 130, defaultH: 280 },
  'noise-meter': { type: 'noise-meter', label: '소음 측정기', icon: '🔊', defaultW: 320, defaultH: 240 },
  'random-name': { type: 'random-name', label: '이름 뽑기', icon: '👤', defaultW: 340, defaultH: 300 },
  'group-maker': { type: 'group-maker', label: '모둠 만들기', icon: '👥', defaultW: 440, defaultH: 380 },
  poll: { type: 'poll', label: '투표', icon: '📊', defaultW: 380, defaultH: 320 },
  text: { type: 'text', label: '텍스트', icon: '📝', defaultW: 360, defaultH: 200 },
  drawing: { type: 'drawing', label: '그림판', icon: '🎨', defaultW: 460, defaultH: 360 },
  'qr-code': { type: 'qr-code', label: 'QR 코드', icon: '📱', defaultW: 280, defaultH: 320 },
  dice: { type: 'dice', label: '주사위', icon: '🎲', defaultW: 260, defaultH: 240 },
  'work-symbols': { type: 'work-symbols', label: '작업 기호', icon: '📋', defaultW: 360, defaultH: 120 },
};

export const WIDGET_LIST = Object.values(WIDGET_META);

export const BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
];
