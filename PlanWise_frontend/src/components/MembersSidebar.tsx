import { Check, Clock, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Member {
  id: number;
  name: string;
  avatar: string;
  hasSubmitted: boolean;
}

interface MembersSidebarProps {
  members: Member[];
}

export function MembersSidebar({ members }: MembersSidebarProps) {
  const submittedCount = members.filter(m => m.hasSubmitted).length;
  const totalCount = members.length;
  const pct = Math.round((submittedCount / totalCount) * 100);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const circumference = 2 * Math.PI * 16;
  const dashLen = (pct / 100) * circumference;

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '28px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', gap: '24px',
    }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '16px', fontWeight: 800, color: 'white', margin: 0,
          letterSpacing: '-0.01em',
        }}>Group Members</h2>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px',
        }}>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: '44px', height: '44px' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
              <circle cx="22" cy="22" r="16" fill="none" stroke="url(#pwRingGrad)" strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <defs>
                <linearGradient id="pwRingGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 800, color: 'white',
            }}>{pct}%</span>
          </div>

          <div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>
              {submittedCount} of {totalCount}
            </span>
            <span style={{
              display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600,
              marginTop: '1px',
            }}>have responded</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      }} />

      {/* Members */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {members.map((member, index) => {
          const isHovered = hoveredId === member.id;
          return (
            <div
              key={member.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '10px 12px', borderRadius: '12px',
                backgroundColor: isHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'default',
                animation: `fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`,
              }}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  padding: '2px',
                  background: member.hasSubmitted
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.08)',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800,
                    color: member.hasSubmitted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                    letterSpacing: '-0.02em',
                  }}>
                    {member.avatar}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  position: 'absolute', bottom: '-1px', right: '-1px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid transparent',
                  backgroundColor: member.hasSubmitted ? '#7BF5A5' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: member.hasSubmitted ? '0 0 8px rgba(123,245,165,0.4)' : 'none',
                }}>
                  {member.hasSubmitted
                    ? <Check style={{ width: 8, height: 8, color: '#1E40AF', strokeWidth: 3 }} />
                    : <Clock style={{ width: 8, height: 8, color: 'rgba(255,255,255,0.3)', strokeWidth: 2.5 }} />
                  }
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '14px',
                  color: member.hasSubmitted ? 'white' : 'rgba(255,255,255,0.35)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{member.name}</div>
                <div style={{
                  fontSize: '11px', fontWeight: 600, marginTop: '2px',
                  color: member.hasSubmitted ? '#7BF5A5' : 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.02em',
                }}>
                  {member.hasSubmitted ? '✓ Submitted' : 'Waiting...'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite */}
      <button style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '14px',
        backgroundColor: 'transparent',
        border: '1.5px dashed rgba(255,255,255,0.15)',
        borderRadius: '15px',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 700, fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        letterSpacing: '0.02em',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
        <UserPlus style={{ width: 15, height: 15 }} />
        Invite Member
      </button>
    </div>
  );
}
