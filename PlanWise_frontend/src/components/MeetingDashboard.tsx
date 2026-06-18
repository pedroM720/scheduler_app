import { ScheduleGrid } from './ScheduleGrid';
import { MembersSidebar } from './MembersSidebar';
import { JoinGroupPopup } from './JoinGroupPopup';
import { Sparkles, Share2, Globe, ArrowLeft, Check, Edit2, Save, X as XIcon, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const injectStyles = `
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

  .pw-root, .pw-root * {
    font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
    box-sizing: border-box;
  }
  .pw-root select option {
    background: #1E1B4B;
    color: #F0EBFF;
  }
`;

// Helper: Parse calendar date without timezone offset issues
const parseCalendarDate = (dateStr: string) => {
  const normalized = dateStr.replace(/Z|[-+]\d{2}:\d{2}$/, '');
  return new Date(normalized);
};

// Helper: Extract unique dates from availability slots
const extractDatesFromAvailability = (availability: any[]) => {
  const uniqueDatesMap: Record<string, Date> = {};
  const groupDatesSlots = availability.filter(slot => slot.user_name === '_group_dates');
  const targetSlots = groupDatesSlots.length > 0 ? groupDatesSlots : availability;

  targetSlots.forEach(slot => {
    const d = parseCalendarDate(slot.start_time);
    const key = slot.start_time.split('T')[0];
    uniqueDatesMap[key] = d;
  });
  
  const sortedKeys = Object.keys(uniqueDatesMap).sort();
  return sortedKeys.map(key => {
    const d = uniqueDatesMap[key];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[d.getDay()],
      date: String(d.getDate()),
      dateStr: key,
    };
  });
};

// Helper: Generate current Mon-Fri week dates as fallback
const getFallbackDates = () => {
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentDay = today.getDay();
  const distance = 1 - currentDay; // distance to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + distance);
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push({
      day: days[d.getDay()],
      date: String(d.getDate()),
      dateStr: d.toISOString().split('T')[0],
    });
  }
  return dates;
};

// Helper: Initialize selected hour keys from existing slots
const getInitialSelectedHours = (availability: any[], username: string) => {
  const selected = new Set<string>();
  
  availability.forEach(slot => {
    if (slot.user_name === username) {
      const start = parseCalendarDate(slot.start_time);
      const end = parseCalendarDate(slot.end_time);
      
      const dateStr = slot.start_time.split('T')[0];
      const startHour = start.getHours();
      const endHour = end.getHours();
      
      for (let h = startHour; h < endHour; h++) {
        selected.add(`${dateStr}_${h}`);
      }
    }
  });
  
  return selected;
};

// Helper: Merge hour keys back into start/end intervals
const convertHoursToSlots = (selectedSlots: Set<string>) => {
  const dateMap: Record<string, number[]> = {};
  selectedSlots.forEach(slotKey => {
    const [dateStr, hourStr] = slotKey.split('_');
    const hour = parseInt(hourStr);
    if (!dateMap[dateStr]) dateMap[dateStr] = [];
    dateMap[dateStr].push(hour);
  });
  
  const slots: { start_time: string; end_time: string }[] = [];
  
  Object.keys(dateMap).forEach(dateStr => {
    const hours = dateMap[dateStr].sort((a, b) => a - b);
    if (hours.length === 0) return;
    
    let start = hours[0];
    let prev = hours[0];
    
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === prev + 1) {
        prev = hours[i];
      } else {
        slots.push({
          start_time: `${dateStr}T${String(start).padStart(2, '0')}:00:00`,
          end_time: `${dateStr}T${String(prev + 1).padStart(2, '0')}:00:00`,
        });
        start = hours[i];
        prev = hours[i];
      }
    }
    slots.push({
      start_time: `${dateStr}T${String(start).padStart(2, '0')}:00:00`,
      end_time: `${dateStr}T${String(prev + 1).padStart(2, '0')}:00:00`,
    });
  });
  
  return slots;
};

export function MeetingDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = (location.state as { groupName?: string; username?: string; password?: string }) || {};
  const [groupName, setGroupName] = useState(stateData.groupName || '');
  const [username, setUsername] = useState(stateData.username || '');
  const [password, setPassword] = useState(stateData.password || '');

  const [members, setMembers] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [dates, setDates] = useState<{ day: string; date: string; dateStr: string }[]>([]);
  
  const [timezone, setTimezone] = useState('America/New_York');
  const [shareCopied, setShareCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isJoinPopupOpen, setIsJoinPopupOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const displayTitle = groupName || 'Team Strategy Meeting';
  const submittedCount = members.filter(m => m.hasSubmitted).length;

  const fetchData = async () => {
    if (!groupName) return;
    try {
      const mRes = await fetch(`http://127.0.0.1:8000/groups/${groupName}/members?t=${Date.now()}`);
      const mData = await mRes.json();
      if (mRes.ok) setMembers(mData.members || []);

      const aRes = await fetch(`http://127.0.0.1:8000/groups/${groupName}/availability?t=${Date.now()}`);
      const aData = await aRes.json();
      if (aRes.ok) {
        const slots = aData.availability || [];
        setAvailability(slots);
        
        const parsedDates = extractDatesFromAvailability(slots);
        if (parsedDates.length > 0) {
          setDates(parsedDates);
        } else {
          setDates(getFallbackDates());
        }
      }
    } catch (err) {
      console.error("Error loading group details:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [groupName]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleFindBestTime = () => {
    let bestSlot: { dateStr: string; timeLabel: string; count: number } | null = null;
    
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

    dates.forEach(d => {
      timeSlots.forEach(time => {
        const hour24 = getHour24(time);
        const cellStart = new Date(`${d.dateStr}T${String(hour24).padStart(2, '0')}:00:00`).getTime();
        const cellEnd = cellStart + 60 * 60 * 1000;
        
        const usersFree = new Set<string>();
        availability.forEach(slot => {
          if (slot.user_name === '_group_dates') return;
          const start = new Date(slot.start_time).getTime();
          const end = new Date(slot.end_time).getTime();
          if (start <= cellStart && end >= cellEnd) {
            usersFree.add(slot.user_id);
          }
        });
        
        if (!bestSlot || usersFree.size > (bestSlot as any).count) {
          bestSlot = { dateStr: d.dateStr, timeLabel: time, count: usersFree.size };
        }
      });
    });
    
    if (bestSlot && (bestSlot as any).count > 0) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const d = new Date((bestSlot as any).dateStr + "T00:00:00");
      const dayName = days[d.getDay()];
      alert(`✨ Best Time Found!\n\n📅 Date: ${dayName}, ${d.toLocaleDateString()}\n⏰ Time: ${(bestSlot as any).timeLabel}\n👥 Availability: ${(bestSlot as any).count} member(s) free!`);
    } else {
      alert("No availability slots submitted yet!");
    }
  };

  const handleToggleSlot = (slotKey: string) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(slotKey)) {
        next.delete(slotKey);
      } else {
        next.add(slotKey);
      }
      return next;
    });
  };

  const startEditing = () => {
    if (!username) {
      setIsJoinPopupOpen(true);
      return;
    }
    const initialSelected = getInitialSelectedHours(availability, username);
    setSelectedSlots(initialSelected);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedSlots(new Set());
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    try {
      const slots = convertHoursToSlots(selectedSlots);
      const response = await fetch('http://127.0.0.1:8000/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: username,
          group_name: groupName,
          password: password,
          slots
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to save availability');
      }

      setIsEditing(false);
      await fetchData();
    } catch (err: any) {
      alert("Error saving availability: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoinSuccess = (gName: string, pass: string, uName: string) => {
    setGroupName(gName);
    setPassword(pass);
    setUsername(uName);
    setTimeout(() => {
      fetchData();
    }, 100);
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
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#13113C',
        borderBottom: '2.5px solid #ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #549EFF, #8570FF, #A06EFF)',
        }} />

        <div style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '0 44px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Back */}
          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '12px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'white';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
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
              }}>{submittedCount}/{members.length} responses · Live</span>
            </div>
          </div>

          {/* Timezone */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '12px',
          }}>
            <Globe style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.8)' }} />
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{
              fontSize: '13px', color: 'white', fontWeight: 700,
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

      {/* Content */}
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
          {/* Main Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '2.5px solid #13113C',
            padding: '32px',
            boxShadow: '6px 6px 0px 0px #13113C',
            color: '#13113C',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              marginBottom: '28px',
            }}>
              <div>
                <h2 style={{
                  fontSize: '22px', fontWeight: 800, color: '#13113C', margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {isEditing ? 'Edit My Availability' : 'Group Availability'}
                </h2>
                <p style={{
                  fontSize: '13px', color: '#6B7280', fontWeight: 600, margin: '4px 0 0 0',
                }}>
                  {isEditing 
                    ? 'Click time slots below to toggle your availability' 
                    : 'Hover to explore availability · Click Edit to update yours'
                  }
                </p>
              </div>

              {username && (
                <div style={{
                  padding: '6px 16px',
                  background: '#8570FF',
                  borderRadius: '12px',
                  border: '2px solid #13113C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, color: 'white',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>Logged in as: {username}</span>
                </div>
              )}
            </div>

            <ScheduleGrid 
              members={members} 
              availability={availability}
              dates={dates}
              isEditing={isEditing}
              selectedSlots={selectedSlots}
              onToggleSlot={handleToggleSlot}
              currentUserName={username}
            />
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '14px',
            animation: mounted ? 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' : 'none',
          }}>
            {isEditing ? (
              <>
                {/* Save Changes */}
                <button 
                  onClick={saveAvailability} 
                  disabled={isSaving}
                  style={{
                    flex: 1.4,
                    gap: '10px', padding: '18px 28px',
                    backgroundColor: '#8570FF',
                    color: 'white',
                    borderRadius: '14px', border: '2.5px solid #13113C', cursor: 'pointer',
                    boxShadow: '6px 6px 0px 0px #13113C',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '16px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #13113C';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px 0px #13113C';
                  }}
                >
                  <Save style={{ width: 18, height: 18 }} />
                  {isSaving ? 'Saving...' : 'Save Availability'}
                </button>

                {/* Cancel */}
                <button 
                  onClick={cancelEditing} 
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    gap: '10px', padding: '18px 28px',
                    backgroundColor: 'white',
                    color: '#13113C',
                    borderRadius: '14px', border: '2.5px solid #13113C', cursor: 'pointer',
                    boxShadow: '6px 6px 0px 0px #13113C',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '16px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(2px, 2px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #13113C';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px 0px #13113C';
                  }}
                >
                  <XIcon style={{ width: 18, height: 18 }} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* Edit Availability / Join */}
                <button onClick={startEditing} style={{
                  position: 'relative', overflow: 'hidden',
                  flex: 1.4,
                  gap: '10px', padding: '18px 28px',
                  backgroundColor: 'white',
                  borderRadius: '14px', border: '2.5px solid #13113C', cursor: 'pointer',
                  boxShadow: '6px 6px 0px 0px #13113C',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(2px, 2px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #13113C';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px 0px #13113C';
                }}>
                  {username ? (
                    <>
                      <Edit2 style={{ width: 18, height: 18, color: '#8570FF' }} />
                      <span style={{
                        fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em',
                        background: 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}>Edit My Availability</span>
                    </>
                  ) : (
                    <>
                      <LogIn style={{ width: 18, height: 18, color: '#8570FF' }} />
                      <span style={{
                        fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em',
                        background: 'linear-gradient(135deg, #549EFF 5%, #8570FF 74%, #A06EFF 100%)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text',
                        color: 'transparent',
                      }}>Join Group to Edit</span>
                    </>
                  )}
                </button>

                {/* Find Best Time */}
                <button onClick={handleFindBestTime} style={{
                  position: 'relative', overflow: 'hidden',
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', padding: '18px 28px',
                  backgroundColor: 'transparent',
                  color: 'white', fontWeight: 800, fontSize: '16px',
                  borderRadius: '14px',
                  border: '2.5px solid white',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  letterSpacing: '-0.01em',
                  boxShadow: '6px 6px 0px 0px rgba(255,255,255,0.2)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#13113C';
                  e.currentTarget.style.transform = 'translate(2px, 2px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #13113C';
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
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(255,255,255,0.2)';
                  const span = e.currentTarget.querySelector('span');
                  if (span) {
                    span.style.background = 'none';
                    span.style.color = 'white';
                  }
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.color = 'white';
                }}>
                  <Sparkles style={{ width: 18, height: 18, transition: 'color 0.2s' }} />
                  <span style={{ transition: 'all 0.2s' }}>Find Best Time</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{
          animation: mounted ? 'slideInRight 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both' : 'none',
        }}>
          <MembersSidebar members={members} />
        </div>
      </div>

      {/* Join Group Popup if clicking Edit Availability while not logged in */}
      <JoinGroupPopup 
        isOpen={isJoinPopupOpen}
        onClose={() => setIsJoinPopupOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
    </>
  );
}