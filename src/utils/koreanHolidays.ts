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

// 대체공휴일 제외 대상 (현충일은 대체공휴일 미적용)
const NO_SUBSTITUTE = new Set(['현충일']);

// 선거일 (수동 — 4년 주기이지만 날짜가 정해져야 하므로)
const ELECTIONS: Record<number, { month: number; day: number; name: string }[]> = {
  2024: [{ month: 3, day: 10, name: '국회의원 선거' }],
  2026: [{ month: 5, day: 3, name: '지방선거' }],
  2028: [{ month: 3, day: 12, name: '국회의원 선거' }],
  2030: [{ month: 5, day: 12, name: '지방선거' }],
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

  // 3. 선거일
  const elections = ELECTIONS[year];
  if (elections) {
    for (const e of elections) {
      addHoliday(e.month, e.day, e.name);
    }
  }

  // 4. 대체공휴일 계산
  // 공휴일이 토/일과 겹치면 다음 평일을 대체공휴일로
  const allHolidayDates = Object.keys(holidays).map((key) => {
    const [m, d] = key.split('-').map(Number);
    return { month: m, day: d, name: holidays[key] };
  });

  for (const h of allHolidayDates) {
    if (NO_SUBSTITUTE.has(h.name)) continue;
    // 선거일, 연휴 중간은 대체공휴일 미적용
    if (h.name.includes('선거')) continue;

    const date = new Date(year, h.month, h.day);
    const dow = date.getDay();

    if (dow === 0 || dow === 6) {
      // 다음 월요일 찾기 (이미 공휴일인 날은 건너뛰기)
      const sub = new Date(date);
      if (dow === 0) sub.setDate(sub.getDate() + 1); // 일→월
      else sub.setDate(sub.getDate() + 2); // 토→월

      // 이미 공휴일이면 다음 날로
      while (holidays[`${sub.getMonth()}-${sub.getDate()}`]) {
        sub.setDate(sub.getDate() + 1);
      }

      addHoliday(sub.getMonth(), sub.getDate(), `대체공휴일(${h.name.replace(' 연휴', '')})`);
    }
  }

  cache[year] = holidays;
  return holidays;
}

export function getHoliday(year: number, month: number, day: number): string | null {
  const holidays = getHolidaysForYear(year);
  return holidays[`${month}-${day}`] || null;
}
