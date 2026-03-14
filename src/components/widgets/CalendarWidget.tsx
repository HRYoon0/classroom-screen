import { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { getHoliday } from '../../utils/koreanHolidays';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function CalendarWidget() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
        <button onClick={() => goMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
          <IoChevronBack size={22} />
        </button>
        <button onClick={goToday} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
          {year}년 {MONTHS[month]}
        </button>
        <button onClick={() => goMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', flex: 1, position: 'relative' }}>
        {cells.map((cell, idx) => {
          const dayOfWeek = idx % 7;
          const isSun = dayOfWeek === 0;
          const isSat = dayOfWeek === 6;
          const todayMatch = cell.current && isToday(cell.day);
          const holiday = cell.current ? getHoliday(year, month, cell.day) : null;
          const isHoliday = !!holiday;
          const isHovered = hoveredIdx === idx && isHoliday;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
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
                cursor: isHoliday ? 'default' : undefined,
              }}
            >
              {cell.day}
              {isHoliday && !todayMatch && (
                <div style={{
                  position: 'absolute', bottom: '2px',
                  width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444',
                }} />
              )}
              {isHovered && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%',
                  transform: 'translateX(-50%)', marginBottom: '4px',
                  padding: '4px 8px', background: '#1e293b', color: 'white',
                  fontSize: '11px', fontWeight: 500, borderRadius: '6px',
                  whiteSpace: 'nowrap', zIndex: 50, pointerEvents: 'none',
                }}>
                  {holiday}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
