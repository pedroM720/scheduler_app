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
  const [inviteCopied, setInviteCopied] = useState(false);

  const circumference = 2 * Math.PI * 16;
  const dashLen = (pct / 100) * circumference;

  return (
    <div style={{
      backgroundColor: '#13113C',
      borderRadius: '16px',
      border: '2.5px solid #FFFFFF',
      padding: '28px',
      boxShadow: '6px 6px 0px 0px rgba(255,255,255,0.15)',
      display: 'flex', flexDirection: 'column', gap: '24px',
      color: '#FFFFFF',
    }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: '18px', fontWeight: 800, color: 'white', margin: 0,
          letterSpacing: '-0.01em',
        }}>Group Members</h2>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px',
        }}>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: '44px', height: '44px' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
              <circle cx="22" cy="22" r="16" fill="none" stroke="url(#pwRingGrad)" strokeWidth="3.5"
                strokeLinecap="square"
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <defs>
                <linearGradient id="pwRingGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#549EFF" />
                  <stop offset="100%" stopColor="#A06EFF" />
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
              display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
              marginTop: '1px',
            }}>have responded</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '2px',
        background: 'rgba(255,255,255,0.15)',
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
                backgroundColor: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
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
                  width: '42px', height: '42px', borderRadius: '10px',
                  padding: '2px',
                  background: member.hasSubmitted
                    ? '#ffffff'
                    : 'rgba(255,255,255,0.2)',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '8px',
                    backgroundColor: 'rgba(84, 158, 255, 0.2)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 800,
                    color: member.hasSubmitted ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    letterSpacing: '-0.02em',
                  }}>
                    {member.avatar}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '16px', height: '16px', borderRadius: '6px',
                  border: '1px solid #13113C',
                  backgroundColor: member.hasSubmitted ? '#7BF5A5' : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: member.hasSubmitted ? '0 0 8px rgba(123,245,165,0.4)' : 'none',
                }}>
                  {member.hasSubmitted
                    ? <Check style={{ width: 8, height: 8, color: '#13113C', strokeWidth: 3 }} />
                    : <Clock style={{ width: 8, height: 8, color: 'rgba(255,255,255,0.6)', strokeWidth: 2.5 }} />
                  }
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: '14px',
                  color: member.hasSubmitted ? 'white' : 'rgba(255,255,255,0.45)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{member.name}</div>
                <div style={{
                  fontSize: '11px', fontWeight: 700, marginTop: '2px',
                  color: member.hasSubmitted ? '#7BF5A5' : 'rgba(255,255,255,0.3)',
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
      <button 
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setInviteCopied(true);
          setTimeout(() => setInviteCopied(false), 2000);
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px',
          backgroundColor: 'transparent',
          border: inviteCopied ? '2px solid #7BF5A5' : '2px dashed rgba(255,255,255,0.3)',
          borderRadius: '12px',
          color: inviteCopied ? '#7BF5A5' : 'rgba(255,255,255,0.6)',
          fontWeight: 800, fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => {
          if (!inviteCopied) {
            e.currentTarget.style.borderColor = 'white';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgba(255,255,255,0.1)';
          }
        }}
        onMouseLeave={e => {
          if (!inviteCopied) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {inviteCopied ? (
          <>
            <Check style={{ width: 15, height: 15 }} />
            Link Copied!
          </>
        ) : (
          <>
            <UserPlus style={{ width: 15, height: 15 }} />
            Invite Member
          </>
        )}
      </button>
    </div>
  );
}
