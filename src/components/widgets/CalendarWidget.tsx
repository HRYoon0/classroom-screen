import { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 고정 공휴일 (월-일, 0-indexed month)
const FIXED_HOLIDAYS: Record<string, string> = {
  '0-1': '신정',
  '2-1': '삼일절',
  '4-5': '어린이날',
  '5-6': '현충일',
  '7-15': '광복절',
  '9-3': '개천절',
  '9-9': '한글날',
  '11-25': '크리스마스',
};

// 음력 기반 공휴일 (연도별 양력 변환 — 2024~2030)
// 설날(연휴3일), 부처님오신날, 추석(연휴3일)
const LUNAR_HOLIDAYS: Record<number, Record<string, string>> = {
  2024: {
    '1-9': '설날 연휴', '1-10': '설날', '1-11': '설날 연휴',
    '4-15': '부처님오신날',
    '8-16': '추석 연휴', '8-17': '추석', '8-18': '추석 연휴',
  },
  2025: {
    '0-28': '설날 연휴', '0-29': '설날', '0-30': '설날 연휴',
    '4-5': '부처님오신날',
    '9-5': '추석 연휴', '9-6': '추석', '9-7': '추석 연휴',
  },
  2026: {
    '1-16': '설날 연휴', '1-17': '설날', '1-18': '설날 연휴',
    '4-24': '부처님오신날',
    '8-24': '추석 연휴', '8-25': '추석', '8-26': '추석 연휴',
  },
  2027: {
    '1-5': '설날 연휴', '1-6': '설날', '1-7': '설날 연휴',
    '4-13': '부처님오신날',
    '8-14': '추석 연휴', '8-15': '추석', '8-16': '추석 연휴',
  },
  2028: {
    '0-25': '설날 연휴', '0-26': '설날', '0-27': '설날 연휴',
    '4-2': '부처님오신날',
    '9-2': '추석 연휴', '9-3': '추석', '9-4': '추석 연휴',
  },
  2029: {
    '1-12': '설날 연휴', '1-13': '설날', '1-14': '설날 연휴',
    '4-20': '부처님오신날',
    '8-21': '추석 연휴', '8-22': '추석', '8-23': '추석 연휴',
  },
  2030: {
    '1-2': '설날 연휴', '1-3': '설날', '1-4': '설날 연휴',
    '4-9': '부처님오신날',
    '8-11': '추석 연휴', '8-12': '추석', '8-13': '추석 연휴',
  },
};

function getHoliday(year: number, month: number, day: number): string | null {
  const fixedKey = `${month}-${day}`;
  if (FIXED_HOLIDAYS[fixedKey]) return FIXED_HOLIDAYS[fixedKey];
  const lunarMap = LUNAR_HOLIDAYS[year];
  if (lunarMap) {
    const lunarKey = `${month}-${day}`;
    if (lunarMap[lunarKey]) return lunarMap[lunarKey];
  }
  return null;
}

export default function CalendarWidget() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const goMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => goMonth(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }}
        >
          <IoChevronBack size={22} />
        </button>
        <button
          onClick={goToday}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 700, color: '#1e293b' }}
        >
          {year}년 {MONTHS[month]}
        </button>
        <button
          onClick={() => goMonth(1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }}
        >
          <IoChevronForward size={22} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '13px', fontWeight: 600,
            color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#94a3b8',
            padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', flex: 1 }}>
        {cells.map((cell, idx) => {
          const dayOfWeek = idx % 7;
          const isSun = dayOfWeek === 0;
          const isSat = dayOfWeek === 6;
          const todayMatch = cell.current && isToday(cell.day);
          const holiday = cell.current ? getHoliday(year, month, cell.day) : null;
          const isHoliday = !!holiday;

          return (
            <div
              key={idx}
              title={holiday || undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: todayMatch ? 700 : 400,
                color: !cell.current
                  ? '#cbd5e1'
                  : todayMatch
                    ? 'white'
                    : (isHoliday || isSun)
                      ? '#ef4444'
                      : isSat
                        ? '#3b82f6'
                        : '#334155',
                background: todayMatch ? '#6366f1' : 'transparent',
                borderRadius: todayMatch ? '50%' : '6px',
                width: '36px',
                height: '36px',
                margin: '0 auto',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {cell.day}
              {/* 공휴일 점 표시 */}
              {isHoliday && !todayMatch && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#ef4444',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
