import KoreanLunarCalendar from 'korean-lunar-calendar';

// 음력 날짜 → 양력 날짜 변환
function lunarToSolar(year: number, lunarMonth: number, lunarDay: number): { month: number; day: number } | null {
  const cal = new KoreanLunarCalendar();
  const ok = cal.setLunarDate(year, lunarMonth, lunarDay, false);
  if (!ok) return null;
  const solar = cal.getSolarCalendar();
  return { month: solar.month - 1, day: solar.day }; // 0-indexed month
}

// 고정 공휴일 (month: 0-indexed)
const FIXED_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 0, day: 1, name: '신정' },
  { month: 2, day: 1, name: '삼일절' },
  { month: 4, day: 5, name: '어린이날' },
  { month: 5, day: 6, name: '현충일' },
  { month: 6, day: 17, name: '제헌절' },
  { month: 7, day: 15, name: '광복절' },
  { month: 9, day: 3, name: '개천절' },
  { month: 9, day: 9, name: '한글날' },
  { month: 11, day: 25, name: '크리스마스' },
];

// 확정된 대체공휴일 + 선거일 (수동 등록)
const EXTRA_HOLIDAYS: Record<number, { month: number; day: number; name: string }[]> = {
  2024: [
    { month: 1, day: 12, name: '대체공휴일(설날)' },
    { month: 3, day: 10, name: '국회의원 선거' },
    { month: 4, day: 6, name: '대체공휴일(어린이날)' },
  ],
  2025: [
    { month: 4, day: 6, name: '대체공휴일(부처님오신날)' },
    { month: 9, day: 8, name: '대체공휴일(추석)' },
  ],
  2026: [
    { month: 2, day: 2, name: '대체공휴일(삼일절)' },
    { month: 4, day: 25, name: '대체공휴일(부처님오신날)' },
    { month: 5, day: 3, name: '지방선거' },
    { month: 7, day: 17, name: '대체공휴일(광복절)' },
    { month: 9, day: 5, name: '대체공휴일(개천절)' },
  ],
};

// 해당 연도의 공휴일 맵 생성 (캐시)
const cache: Record<number, Record<string, string>> = {};

export function getHolidaysForYear(year: number): Record<string, string> {
  if (cache[year]) return cache[year];

  const holidays: Record<string, string> = {};
  const addHoliday = (m: number, d: number, name: string) => {
    holidays[`${m}-${d}`] = name;
  };

  // 1. 고정 공휴일
  for (const h of FIXED_HOLIDAYS) {
    addHoliday(h.month, h.day, h.name);
  }

  // 2. 음력 기반 공휴일
  // 설날 (음력 1/1) + 전날 + 다음날
  const seol = lunarToSolar(year, 1, 1);
  if (seol) {
    const seolDate = new Date(year, seol.month, seol.day);
    const prev = new Date(seolDate); prev.setDate(prev.getDate() - 1);
    const next = new Date(seolDate); next.setDate(next.getDate() + 1);
    addHoliday(prev.getMonth(), prev.getDate(), '설날 연휴');
    addHoliday(seol.month, seol.day, '설날');
    addHoliday(next.getMonth(), next.getDate(), '설날 연휴');
  }

  // 부처님오신날 (음력 4/8)
  const buddha = lunarToSolar(year, 4, 8);
  if (buddha) {
    addHoliday(buddha.month, buddha.day, '부처님오신날');
  }

  // 추석 (음력 8/15) + 전날 + 다음날
  const chuseok = lunarToSolar(year, 8, 15);
  if (chuseok) {
    const chuDate = new Date(year, chuseok.month, chuseok.day);
    const prev = new Date(chuDate); prev.setDate(prev.getDate() - 1);
    const next = new Date(chuDate); next.setDate(next.getDate() + 1);
    addHoliday(prev.getMonth(), prev.getDate(), '추석 연휴');
    addHoliday(chuseok.month, chuseok.day, '추석');
    addHoliday(next.getMonth(), next.getDate(), '추석 연휴');
  }

  // 3. 확정된 대체공휴일 + 선거일
  const extras = EXTRA_HOLIDAYS[year];
  if (extras) {
    for (const e of extras) {
      addHoliday(e.month, e.day, e.name);
    }
  }

  cache[year] = holidays;
  return holidays;
}

export function getHoliday(year: number, month: number, day: number): string | null {
  const holidays = getHolidaysForYear(year);
  return holidays[`${month}-${day}`] || null;
}
