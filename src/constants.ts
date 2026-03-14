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

// Unsplash 이미지 URL 헬퍼
const U = (id: string) => `https://images.unsplash.com/${id}`;

export interface PhotoCategory {
  name: string;
  photos: string[];
}

export const PHOTO_BACKGROUNDS: PhotoCategory[] = [
  {
    name: '봄',
    photos: [
      U('photo-1553530979-7ee52a2670c4'),
      U('photo-1459411552884-841db9b3cc2a'),
      U('photo-1522748906645-95d8adfd52c7'),
      U('photo-1490730141103-6cac27aaab94'),
      U('photo-1560717789-0ac7c58ac90a'),
      U('photo-1487530811176-3780de880c2d'),
    ],
  },
  {
    name: '여름',
    photos: [
      U('photo-1507525428034-b723cf961d3e'),
      U('photo-1473116763249-2faaef81ccda'),
      U('photo-1504701954957-2010ec3bcec1'),
      U('photo-1501426026826-31c667bdf23d'),
      U('photo-1414609245224-afa02bfb3fda'),
      U('photo-1468581264429-2548ef9eb732'),
    ],
  },
  {
    name: '가을',
    photos: [
      U('photo-1507003211169-0a1dd7228f2d'),
      U('photo-1509316975850-ff9c5deb0cd9'),
      U('photo-1477322524744-0eece9e79640'),
      U('photo-1473496169904-658ba7c44d8a'),
      U('photo-1508193638397-1c4234db14d8'),
      U('photo-1521295121783-8a321d551ad2'),
    ],
  },
  {
    name: '겨울',
    photos: [
      U('photo-1476231682828-37e571bc172f'),
      U('photo-1491002052546-bf38f186af56'),
      U('photo-1478265409131-1f65c88f965c'),
      U('photo-1516912481808-3406841bd33c'),
      U('photo-1418985991508-e47386d96a71'),
      U('photo-1495107334309-fcf20504a5ab'),
    ],
  },
  {
    name: '자연',
    photos: [
      U('photo-1506744038136-46273834b3fb'),
      U('photo-1470071459604-3b5ec3a7fe05'),
      U('photo-1441974231531-c6227db76b6e'),
      U('photo-1472214103451-9374bd1c798e'),
      U('photo-1469474968028-56623f02e42e'),
      U('photo-1433086966358-54859d0ed716'),
    ],
  },
  {
    name: '동물',
    photos: [
      U('photo-1535083783855-76ae62b2914e'),
      U('photo-1437622368342-7a3d73a34c8f'),
      U('photo-1484406566174-9da000fda645'),
      U('photo-1497752531616-c3afd9760a11'),
      U('photo-1517849845537-4d257902454a'),
      U('photo-1474314881477-04c4aac40a0e'),
    ],
  },
  {
    name: '도시',
    photos: [
      U('photo-1480714378408-67cf0d13bc1b'),
      U('photo-1449824913935-59a10b8d2000'),
      U('photo-1477959858617-67f85cf4f1df'),
      U('photo-1514565131-fce0801e5785'),
      U('photo-1444723121867-7a241cacace9'),
      U('photo-1519501025264-65ba15a82390'),
    ],
  },
  {
    name: '우주',
    photos: [
      U('photo-1462331940025-496dfbfc7564'),
      U('photo-1446776811953-b23d57bd21aa'),
      U('photo-1451187580459-43490279c0fa'),
      U('photo-1419242902214-272b3f66ee7a'),
      U('photo-1507400492013-162706c8c05e'),
      U('photo-1464802686167-b939a6910659'),
    ],
  },
  {
    name: '패턴',
    photos: [
      U('photo-1558591710-4b4a1ae0f04d'),
      U('photo-1550859492-d5da9d8e45f3'),
      U('photo-1557682250-33bd709cbe85'),
      U('photo-1579546929518-9e396f3cc809'),
      U('photo-1557682224-5b8590cd9ec5'),
      U('photo-1557683316-973673baf926'),
    ],
  },
];
