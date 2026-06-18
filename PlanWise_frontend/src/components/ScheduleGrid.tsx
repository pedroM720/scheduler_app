import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  hasSubmitted: boolean;
}

interface ScheduleGridProps {
  members: Member[];
  availability: any[];
  dates: { day: string; date: string; dateStr: string }[];
  isEditing: boolean;
  selectedSlots: Set<string>;
  onToggleSlot: (slotStr: string) => void;
  currentUserName?: string;
}

export function ScheduleGrid({
  members,
  availability,
  dates,
  isEditing,
  selectedSlots,
  onToggleSlot,
}: ScheduleGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ dayIndex: number; timeIndex: number } | null>(null);

  const timeSlots = [
    '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  ];

  const getHour24 = (timeLabel: string) => {
    const [numStr, ampm] = timeLabel.split(' ');
    let num = parseInt(numStr);
    if (ampm === 'PM' && num !== 12) num += 12;
    if (ampm === 'AM' && num === 12) num = 0;
    return num;
  };

  const parseCalendarDate = (dateStr: string) => {
    const normalized = dateStr.replace(/Z|[-+]\d{2}:\d{2}$/, '');
    return new Date(normalized);
  };

  const getCellAvailability = (dateStr: string, hour24: number) => {
    const cellStart = new Date(`${dateStr}T${String(hour24).padStart(2, '0')}:00:00`).getTime();
    const cellEnd = cellStart + 60 * 60 * 1000;

    const usersFree = new Set<string>();
    const namesFree: string[] = [];

    availability.forEach(slot => {
      if (slot.user_name === '_group_dates') return;
      const start = parseCalendarDate(slot.start_time).getTime();
      const end = parseCalendarDate(slot.end_time).getTime();
      if (start <= cellStart && end >= cellEnd) {
        if (!usersFree.has(slot.user_id)) {
          usersFree.add(slot.user_id);
          namesFree.push(slot.user_name);
        }
      }
    });

    return {
      availableCount: usersFree.size,
      namesFree,
    };
  };

  const getCellStyle = (available: number, total: number, isSelected: boolean, isHovered: boolean) => {
    if (isEditing) {
      if (isSelected) {
        return {
          bg: isHovered ? '#725BE6' : '#8570FF',
          text: 'white',
        };
      }
      return {
        bg: isHovered ? '#F3F4F6' : '#FFFFFF',
        text: '#9CA3AF',
      };
    }

    if (total === 0) return { bg: '#FFFFFF', text: '#13113C' };
    const pct = available / total;

    if (pct === 1) return {
      bg: isHovered ? '#725BE6' : '#8570FF',
      text: 'white',
    };
    if (pct >= 0.7) return {
      bg: isHovered ? '#C5B5FF' : '#D4C8FF',
      text: '#13113C',
    };
    if (pct >= 0.5) return {
      bg: isHovered ? '#DED5FF' : '#EAE4FF',
      text: '#13113C',
    };
    if (pct >= 0.3) return {
      bg: isHovered ? '#F0ECFF' : '#F6F3FF',
      text: '#13113C',
    };
    return {
      bg: isHovered ? '#F3F4F6' : '#FFFFFF',
      text: '#9CA3AF',
    };
  };

  const legendItems = [
    { color: '#8570FF', label: 'All free' },
    { color: '#D4C8FF', label: 'Most free' },
    { color: '#EAE4FF', label: 'Half free' },
    { color: '#F6F3FF', label: 'Some free' },
    { color: '#FFFFFF', label: 'Few free', border: '1px solid #13113C' },
  ];

  const totalSubmitted = members.filter(m => m.hasSubmitted).length;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `72px repeat(${dates.length}, 1fr)`,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '2.5px solid #13113C',
        backgroundColor: '#13113C',
        gap: '1.5px',
      }}>
        {/* Corner */}
        <div style={{
          backgroundColor: '#E5E7EB',
          padding: '16px 8px',
        }} />

        {/* Date headers */}
        {dates.map((d, i) => (
          <div key={i} style={{
            backgroundColor: '#E5E7EB',
            padding: '12px 8px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 800, color: 'rgba(19, 17, 60, 0.6)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>{d.day}</span>
            <span style={{
              fontSize: '20px', fontWeight: 900, color: '#13113C',
              letterSpacing: '-0.03em',
            }}>{d.date}</span>
          </div>
        ))}

        {/* Rows */}
        {timeSlots.map((time, ti) => {
          const hour24 = getHour24(time);
          return (
            <div key={`row-${ti}`} style={{ display: 'contents' }}>
              <div style={{
                backgroundColor: '#E5E7EB',
                padding: '0 10px',
                display: 'flex', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: 800, color: '#13113C',
                  whiteSpace: 'nowrap', letterSpacing: '0.02em',
                }}>{time}</span>
              </div>

              {dates.map((d, di) => {
                const { availableCount, namesFree } = getCellAvailability(d.dateStr, hour24);
                const isHovered = hoveredCell?.dayIndex === di && hoveredCell?.timeIndex === ti;
                const slotKey = `${d.dateStr}_${hour24}`;
                const isSelected = selectedSlots.has(slotKey);
                const cs = getCellStyle(availableCount, totalSubmitted, isSelected, isHovered);

                return (
                  <div
                    key={`cell-${di}-${ti}`}
                    style={{
                      position: 'relative',
                      padding: '18px',
                      backgroundColor: cs.bg,
                      cursor: 'pointer',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 1,
                      borderRadius: isHovered ? '10px' : '0',
                      boxShadow: isHovered ? '0 4px 12px rgba(19,17,60,0.15), inset 0 0 0 2px #13113C' : 'none',
                    }}
                    onClick={() => {
                      if (isEditing) {
                        onToggleSlot(slotKey);
                      }
                    }}
                    onMouseEnter={() => setHoveredCell({ dayIndex: di, timeIndex: ti })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {!isEditing && isHovered && totalSubmitted > 0 && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{
                          fontSize: '14px', fontWeight: 900, color: cs.text,
                          letterSpacing: '-0.02em',
                        }}>{availableCount}/{totalSubmitted}</span>
                      </div>
                    )}

                    {!isEditing && isHovered && totalSubmitted > 0 && (
                      <div style={{
                        position: 'absolute', zIndex: 30,
                        bottom: 'calc(100% + 10px)', left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#FFFFFF',
                        color: '#13113C', fontSize: '12px', fontWeight: 800,
                        padding: '10px 16px', borderRadius: '10px',
                        whiteSpace: 'nowrap',
                        border: '2.5px solid #13113C',
                        boxShadow: '4px 4px 0px 0px #13113C',
                        display: 'flex', flexDirection: 'column', gap: '4px',
                        animation: 'fadeIn 0.12s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: '#8570FF',
                          }} />
                          {availableCount} of {totalSubmitted} available
                        </div>
                        {namesFree.length > 0 && (
                          <div style={{
                            fontSize: '10px', color: '#6B7280', borderTop: '1px solid #E5E7EB',
                            paddingTop: '4px', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '4px'
                          }}>
                            Free: {namesFree.join(', ')}
                          </div>
                        )}
                        <div style={{
                          position: 'absolute', top: '100%', left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0, height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '6px solid #13113C',
                        }} />
                        <div style={{
                          position: 'absolute', top: 'calc(100% - 2px)', left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0, height: 0,
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderTop: '4px solid #FFFFFF',
                          zIndex: 1,
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {!isEditing && (
        <div style={{
          marginTop: '24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          gap: '24px', flexWrap: 'wrap',
        }}>
          {legendItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '4px',
                backgroundColor: item.color,
                border: item.border || '1px solid rgba(19,17,60,0.2)',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: 700, color: 'rgba(19,17,60,0.5)',
                letterSpacing: '0.03em', textTransform: 'uppercase',
              }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
