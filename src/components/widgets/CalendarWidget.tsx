import { useState, useRef } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { getHoliday } from '../../utils/koreanHolidays';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function CalendarWidget({ config, onConfigChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 메모 데이터: config.memos = { "2026-3-14": "재량휴업일", ... }
  const memos = (config.memos as Record<string, string>) || {};

  const getMemo = (y: number, m: number, d: number) => memos[`${y}-${m}-${d}`] || '';

  const saveMemo = (key: string, text: string) => {
    const newMemos = { ...memos };
    if (text.trim()) {
      newMemos[key] = text.trim();
    } else {
      delete newMemos[key];
    }
    onConfigChange({ ...config, memos: newMemos });
  };

  const handleDateClick = (y: number, m: number, d: number) => {
    const key = `${y}-${m}-${d}`;
    setEditingDate(key);
    setEditText(memos[key] || '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEditDone = () => {
    if (editingDate) {
      saveMemo(editingDate, editText);
      setEditingDate(null);
      setEditText('');
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', position: 'relative' }}>
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
          const memo = cell.current ? getMemo(year, month, cell.day) : '';
          const hasMemo = !!memo;
          const isHovered = hoveredIdx === idx && (isHoliday || hasMemo);

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => cell.current && handleDateClick(year, month, cell.day)}
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
                cursor: cell.current ? 'pointer' : undefined,
              }}
            >
              {cell.day}
              {/* 공휴일 빨간 점 */}
              {isHoliday && !todayMatch && !hasMemo && (
                <div style={{
                  position: 'absolute', bottom: '2px',
                  width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444',
                }} />
              )}
              {/* 메모 파란 점 */}
              {hasMemo && !todayMatch && !isHoliday && (
                <div style={{
                  position: 'absolute', bottom: '2px',
                  width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6',
                }} />
              )}
              {/* 공휴일 + 메모 둘 다 있으면 두 점 */}
              {hasMemo && isHoliday && !todayMatch && (
                <div style={{ position: 'absolute', bottom: '2px', display: 'flex', gap: '2px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }} />
                </div>
              )}
              {/* 툴팁 */}
              {isHovered && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%',
                  transform: 'translateX(-50%)', marginBottom: '4px',
                  padding: '4px 8px', background: '#1e293b', color: 'white',
                  fontSize: '11px', fontWeight: 500, borderRadius: '6px',
                  whiteSpace: 'nowrap', zIndex: 50, pointerEvents: 'none',
                  maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {[holiday, memo].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 메모 입력 팝업 */}
      {editingDate && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleEditDone(); }}
        >
          <div
            style={{
              background: 'white', borderRadius: '12px', padding: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)', width: '260px',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
              {editingDate.split('-').slice(1).map(Number).join('월 ')}일 메모
            </p>
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleEditDone(); }}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="예: 재량휴업일, 현장학습..."
              style={{
                width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', outline: 'none',
                color: '#334155', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={handleEditDone}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: '#6366f1', color: 'white', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                저장
              </button>
              {memos[editingDate] && (
                <button
                  onClick={() => { saveMemo(editingDate, ''); setEditingDate(null); setEditText(''); }}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: '#fef2f2', color: '#ef4444', fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
