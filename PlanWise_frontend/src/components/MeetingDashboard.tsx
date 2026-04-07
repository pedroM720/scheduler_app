import { ScheduleGrid } from './ScheduleGrid';
import { MembersSidebar } from './MembersSidebar';
import { Sparkles, Share2, Globe, ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const mockMembers = [
  { id: 1, name: 'Alice Chen', avatar: 'AC', hasSubmitted: true },
  { id: 2, name: 'Bob Martinez', avatar: 'BM', hasSubmitted: true },
  { id: 3, name: 'Carol Davis', avatar: 'CD', hasSubmitted: true },
  { id: 4, name: 'David Kim', avatar: 'DK', hasSubmitted: false },
  { id: 5, name: 'Emma Wilson', avatar: 'EW', hasSubmitted: false },
];

/* ── Brand tokens ──
   #549EFF  sky blue
   #8570FF  medium purple (primary)
   #A06EFF  lavender purple
   Background deepened variants of the same hue family
*/

const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes gradientFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.5; }
    50%      { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { left: -100%; }
    100% { left: 100%; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(30px, -20px) scale(1.05); }
    66%      { transform: translate(-20px, 15px) scale(0.95); }
  }

  .pw-root, .pw-root * {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    box-sizing: border-box;
  }
  .pw-root select option {
    background: #2D1F6E;
    color: #E8E0FF;
  }
`;

export function MeetingDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupName } = (location.state as { groupName?: string; username?: string }) || {};
  const [timezone, setTimezone] = useState('America/New_York');
  const [shareCopied, setShareCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const displayTitle = groupName || 'Team Strategy Meeting';
  const submittedCount = mockMembers.filter(m => m.hasSubmitted).length;

  const handleShare = () => {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <>
    <style>{injectStyles}</style>
    <div className="pw-root" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563EB 0%, #549EFF 30%, #8570FF 75%, #A06EFF 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: '#F0EBFF',
    }}>
      {/* ── Ambient Orbs — same brand hues ── */}
      <div style={{
        position: 'fixed', top: '-15%', right: '0%',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(84,158,255,0.12) 0%, rgba(133,112,255,0.06) 40%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-5%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(160,110,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 25s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '40%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(84,158,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        animation: 'floatOrb 18s ease-in-out 5s infinite',
      }} />

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(37, 99, 235, 0.4)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Top accent — the brand gradient */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #549EFF, #8570FF, #A06EFF, transparent)',
          backgroundSize: '200% 100%',
          animation: 'gradientFlow 6s ease infinite',
          opacity: 0.8,
        }} />

        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '0 44px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px', padding: '8px 16px',
            color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            BACK
          </button>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <h1 style={{
              fontSize: '22px', fontWeight: 800, margin: 0,
              color: 'white', letterSpacing: '-0.03em',
            }}>{displayTitle}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#7BF5A5',
                boxShadow: '0 0 8px rgba(123,245,165,0.5)',
                animation: 'glow 2s ease infinite',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>{submittedCount}/{mockMembers.length} responses · Live</span>
            </div>
          </div>

          {/* Timezone */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
          }}>
            <Globe style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600,
              backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer',
            }}>
              <option value="America/New_York">EST</option>
              <option value="America/Chicago">CST</option>
              <option value="America/Denver">MST</option>
              <option value="America/Los_Angeles">PST</option>
              <option value="Europe/London">GMT</option>
              <option value="Asia/Tokyo">JST</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{
        maxWidth: '1440px', margin: '0 auto',
        padding: '36px 44px',
        display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Left */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '24px',
          animation: mounted ? 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both' : 'none',
        }}>
          {/* Card */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              marginBottom: '28px',
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px', fontWeight: 800, color: 'white', margin: 0,
                  letterSpacing: '-0.02em',
                }}>Group Availability</h2>
                <p style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, margin: '4px 0 0 0',
                }}>Hover to explore · Click to lock a slot</p>
              </div>
              <div style={{
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>This Week</span>
              </div>
            </div>
            <ScheduleGrid members={mockMembers} />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: '14px',
            animation: mounted ? 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' : 'none',
          }}>
            {/* Find Best Time — white button with gradient text (like landing page "Join Group") */}
            <button onClick={() => alert('Finding best times...')} style={{
              position: 'relative', overflow: 'hidden',
              flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '18px 28px',
              backgroundColor: 'white',
              borderRadius: '15px', border: 'none', cursor: 'pointer',
              boxShadow: '3px 5px 3px 0px rgba(0,0,0,0.25)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '5px 8px 8px 0px rgba(0,0,0,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '3px 5px 3px 0px rgba(0,0,0,0.25)';
            }}>
              <Sparkles style={{
                width: 18, height: 18,
                color: '#8570FF',
              }} />
              <span style={{
                fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}>Find Best Time</span>
            </button>

            {/* Share — outline white like landing page "Create Group" */}
            <button onClick={handleShare} style={{
              position: 'relative', overflow: 'hidden',
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '18px 28px',
              backgroundColor: 'transparent',
              color: 'white', fontWeight: 700, fontSize: '16px',
              borderRadius: '15px',
              border: '1.5px solid white',
              cursor: 'pointer', transition: 'all 0.25s ease',
              letterSpacing: '-0.01em',
              boxShadow: '2px 3px 3px 0px rgba(0,0,0,0.25)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '5px 8px 8px 0px rgba(0,0,0,0.35)';
              // Change text to gradient
              const span = e.currentTarget.querySelector('span');
              if (span) {
                span.style.background = 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)';
                span.style.backgroundClip = 'text';
                span.style.webkitBackgroundClip = 'text';
                span.style.color = 'transparent';
              }
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.color = '#8570FF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '2px 3px 3px 0px rgba(0,0,0,0.25)';
              const span = e.currentTarget.querySelector('span');
              if (span) {
                span.style.background = 'none';
                span.style.color = 'white';
              }
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.color = 'white';
            }}>
              {shareCopied
                ? <Check style={{ width: 18, height: 18, transition: 'color 0.2s' }} />
                : <Share2 style={{ width: 18, height: 18, transition: 'color 0.2s' }} />
              }
              <span style={{ transition: 'all 0.2s' }}>
                {shareCopied ? 'Copied!' : 'Share Link'}
              </span>
            </button>
          </div>
        </div>

        {/* Right */}
        <div style={{
          animation: mounted ? 'slideInRight 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both' : 'none',
        }}>
          <MembersSidebar members={mockMembers} />
        </div>
      </div>
    </div>
    </>
  );
}