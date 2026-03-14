import { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

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

  // 달력 셀 생성
  const cells: { day: number; current: boolean }[] = [];
  // 이전 달
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  // 이번 달
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true });
  }
  // 다음 달 (6주 채우기)
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      {/* 헤더: 연월 + 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => goMonth(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }}
        >
          <IoChevronBack size={22} />
        </button>
        <button
          onClick={goToday}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', fontWeight: 700, color: '#1e293b',
          }}
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

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: todayMatch ? 700 : 400,
                color: !cell.current
                  ? '#cbd5e1'
                  : todayMatch
                    ? 'white'
                    : isSun
                      ? '#ef4444'
                      : isSat
                        ? '#3b82f6'
                        : '#334155',
                background: todayMatch ? '#6366f1' : 'transparent',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                margin: '0 auto',
                transition: 'all 0.15s',
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
