import { useState } from 'react';

interface Member {
  id: number;
  name: string;
  avatar: string;
  hasSubmitted: boolean;
}

interface ScheduleGridProps {
  members: Member[];
}

export function ScheduleGrid({ members }: ScheduleGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; time: number } | null>(null);

  const dates = [
    { day: 'Mon', date: '27' },
    { day: 'Tue', date: '28' },
    { day: 'Wed', date: '29' },
    { day: 'Thu', date: '30' },
    { day: 'Fri', date: '1' },
  ];

  const timeSlots = [
    '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  ];

  const getAvailability = (dayIndex: number, timeIndex: number) => {
    const submittedMembers = members.filter(m => m.hasSubmitted);
    const total = submittedMembers.length;
    const seed = (dayIndex * 100 + timeIndex * 13) % 7;
    let available: number;
    if (seed === 0 || seed === 1) available = total;
    else if (seed === 2 || seed === 3) available = Math.max(1, total - 1);
    else if (seed === 4) available = Math.max(1, Math.floor(total / 2));
    else available = Math.max(0, Math.floor(total / 3));
    return { available, total };
  };

  // White-on-purple palette — brighter = more available
  const getCellStyle = (available: number, total: number, isHovered: boolean) => {
    if (total === 0) return { bg: 'rgba(255,255,255,0.03)', glow: 'transparent', text: 'rgba(255,255,255,0.15)' };
    const pct = available / total;

    if (pct === 1) return {
      bg: isHovered ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.25)',
      glow: 'rgba(255,255,255,0.25)',
      text: 'white',
    };
    if (pct >= 0.7) return {
      bg: isHovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.16)',
      glow: 'rgba(255,255,255,0.15)',
      text: 'rgba(255,255,255,0.9)',
    };
    if (pct >= 0.5) return {
      bg: isHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)',
      glow: 'rgba(255,255,255,0.1)',
      text: 'rgba(255,255,255,0.7)',
    };
    if (pct >= 0.3) return {
      bg: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
      glow: 'rgba(255,255,255,0.06)',
      text: 'rgba(255,255,255,0.5)',
    };
    return {
      bg: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      glow: 'transparent',
      text: 'rgba(255,255,255,0.3)',
    };
  };

  const legendItems = [
    { opacity: 0.25, label: 'All free' },
    { opacity: 0.16, label: 'Most free' },
    { opacity: 0.09, label: 'Half free' },
    { opacity: 0.05, label: 'Some free' },
    { opacity: 0.02, label: 'Few free' },
  ];

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `72px repeat(${dates.length}, 1fr)`,
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.1)',
      }}>
        {/* Corner */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 8px',
        }} />

        {/* Date headers */}
        {dates.map((d, i) => (
          <div key={i} style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRight: i < dates.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 8px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>{d.day}</span>
            <span style={{
              fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '-0.03em',
            }}>{d.date}</span>
          </div>
        ))}

        {/* Rows */}
        {timeSlots.map((time, ti) => (
          <>
            <div key={`t-${ti}`} style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              borderBottom: ti < timeSlots.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              padding: '0 10px',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap', letterSpacing: '0.02em',
              }}>{time}</span>
            </div>

            {dates.map((_, di) => {
              const { available, total } = getAvailability(di, ti);
              const isHovered = hoveredCell?.day === di && hoveredCell?.time === ti;
              const cs = getCellStyle(available, total, isHovered);

              return (
                <div
                  key={`c-${di}-${ti}`}
                  style={{
                    position: 'relative',
                    borderRight: di < dates.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderBottom: ti < timeSlots.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    padding: '18px',
                    backgroundColor: cs.bg,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isHovered ? `inset 0 0 20px ${cs.glow}, 0 0 20px ${cs.glow}` : 'none',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    zIndex: isHovered ? 10 : 1,
                    borderRadius: isHovered ? '6px' : '0',
                  }}
                  onMouseEnter={() => setHoveredCell({ day: di, time: ti })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {isHovered && total > 0 && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: '14px', fontWeight: 800, color: cs.text,
                        letterSpacing: '-0.02em',
                      }}>{available}/{total}</span>
                    </div>
                  )}

                  {isHovered && total > 0 && (
                    <div style={{
                      position: 'absolute', zIndex: 30,
                      bottom: 'calc(100% + 10px)', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255,255,255,0.95)',
                      color: '#1E40AF', fontSize: '12px', fontWeight: 700,
                      padding: '10px 16px', borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      animation: 'fadeIn 0.12s ease',
                    }}>
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #549EFF, #8570FF)',
                      }} />
                      {available} of {total} available
                      <div style={{
                        position: 'absolute', top: '100%', left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid rgba(255,255,255,0.95)',
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '24px', flexWrap: 'wrap',
      }}>
        {legendItems.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '3px',
              backgroundColor: `rgba(255,255,255,${item.opacity})`,
              border: '1px solid rgba(255,255,255,0.2)',
            }} />
            <span style={{
              fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.03em', textTransform: 'uppercase',
            }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
