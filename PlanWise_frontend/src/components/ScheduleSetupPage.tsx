import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

export function ScheduleSetupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { groupName, username, password } = location.state || {};
  
  // --- STATE ---
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, { start: string, end: string }>>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [globalTime, setGlobalTime] = useState({ start: '09:00', end: '17:00' });
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECTS ---
  // Auto-initialize times when dates are picked
  useEffect(() => {
    if (!selectedDates) return;
    const newSlots = { ...timeSlots };
    let hasChanges = false;

    selectedDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!newSlots[dateKey]) {
        newSlots[dateKey] = applyToAll ? { ...globalTime } : { start: '09:00', end: '17:00' };
        hasChanges = true;
      }
    });

    if (hasChanges) setTimeSlots(newSlots);
  }, [selectedDates]);

  // Apply global time to all when toggle is turned on
  useEffect(() => {
    if (applyToAll && selectedDates) {
      const newSlots = { ...timeSlots };
      selectedDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        newSlots[dateKey] = { ...globalTime };
      });
      setTimeSlots(newSlots);
    }
  }, [applyToAll, globalTime]);

  // --- HANDLERS ---
  const handleTimeChange = (date: Date, field: 'start' | 'end', value: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setTimeSlots(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [field]: value }
    }));
  };

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(prev => prev?.filter(d => d.getTime() !== dateToRemove.getTime()));
    const dateKey = format(dateToRemove, 'yyyy-MM-dd');
    const newSlots = { ...timeSlots };
    delete newSlots[dateKey];
    setTimeSlots(newSlots);
  };

  const handleSubmit = async () => {
    if (!selectedDates || selectedDates.length === 0) {
      alert("Please select at least one date.");
      return;
    }

    setIsLoading(true);

    try {
      const slots = selectedDates.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const time = timeSlots[dateStr] || { start: '09:00', end: '17:00' };
        return {
          start_time: `${dateStr}T${time.start}:00`,
          end_time: `${dateStr}T${time.end}:00`,
        };
      });

      const response = await fetch('http://127.0.0.1:8000/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: '_group_dates',
          group_name: groupName,
          password,
          slots
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      navigate('/dashboard', { state: { groupName, username, password } });

    } catch (err: any) {
      console.error(err);
      alert("Error saving availability: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar Theme Overrides
  const calendarStyle = `
    .rdp { margin: 0; font-family: 'Outfit', 'Inter', sans-serif; }
    .rdp-months { justify-content: center; }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      background-color: #8570FF !important; color: white !important; font-weight: 700;
      border-radius: 10px !important;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: #F3F4F6 !important; color: #8570FF;
      border-radius: 10px !important;
    }
    .rdp-head_cell { color: #9CA3AF; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; }
    .rdp-caption_label { font-size: 1.125rem; font-weight: 800; color: #13113C; }
    .rdp-day_today:not(.rdp-day_selected) { font-weight: 700; color: #8570FF; }
  `;

  return (
    <>
    <style>{calendarStyle}</style>
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      // Using inline style to ensure gradient renders regardless of Tailwind config
      style={{ background: 'linear-gradient(135deg, #549EFF 0%, #8570FF 50%, #A06EFF 100%)' }}
    >
      {/* Centered White Card */}
      <div 
        className="bg-white rounded-[16px] border-[2.5px] border-solid border-[#13113C] shadow-[8px_8px_0px_0px_#13113C] overflow-hidden flex flex-col"
        style={{ width: '70%', height: '66vh', minWidth: '800px', minHeight: '600px' }}
      >
        {/* Split View */}
        <div className="flex-1 flex min-h-0" style={{ width: '100%' }}>
          {/* Left Column: Calendar */}
          <div 
            className="overflow-y-auto flex flex-col items-center justify-center bg-gray-50/30 relative"
            style={{ width: '50%', borderRight: '2px solid #13113C', padding: '60px' }}
          >
            <div className="w-full max-w-[380px] flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center text-center">
                <h2 className="text-lg font-bold font-display text-gray-700 uppercase tracking-wider">Schedule Setup</h2>
                {groupName && <h1 className="text-3xl font-black font-display text-[#13113C] mt-2">{groupName}</h1>}
              </div>
              <DayPicker mode="multiple" selected={selectedDates} onSelect={setSelectedDates} showOutsideDays className="border-0" />
              <div className="mt-6 flex items-center justify-center text-sm text-gray-700 bg-white px-4 py-3 rounded-[12px] border-[2px] border-solid border-[#13113C] shadow-[3px_3px_0px_0px_#13113C]">
                <CalendarIcon size={18} className="text-[#8570FF] mr-2" />
                <span className="font-bold text-gray-900 mr-2">{selectedDates?.length || 0}</span>
                <span className="font-semibold text-gray-600">date{selectedDates?.length !== 1 ? 's' : ''} selected</span>
              </div>
            </div>
          </div>

          {/* Right Column: Time Settings */}
          <div 
            className="flex flex-col items-center justify-center bg-white"
            style={{ width: '50%', padding: '60px' }}
          >
            <div className="w-full max-w-[380px] flex flex-col h-full border-[2px] border-solid border-[#13113C] rounded-[14px] shadow-[4px_4px_0px_0px_#13113C] overflow-hidden">
              {/* Toggle */}
              <div className="flex-none border-b-[2px] border-solid border-[#13113C] bg-gray-50/50">
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="apply-all" className="text-sm font-bold text-gray-700 cursor-pointer select-none flex-1">Apply same time to all days</label>
                  <button 
                    id="apply-all" 
                    onClick={() => setApplyToAll(!applyToAll)} 
                    style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: applyToAll ? '#8570FF' : '#D1D5DB',
                      borderRadius: '12px',
                      border: '2px solid #13113C',
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      outline: 'none',
                      flexShrink: 0
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #13113C',
                      transform: applyToAll ? 'translateX(22px)' : 'translateX(4px)',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                    }} />
                  </button>
                </div>
                {applyToAll && (
                  <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '24px' }} className="animate-in slide-in-from-top-2 duration-200">
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, backgroundColor: '#F9FAFB', border: '2px solid #13113C', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Start</span>
                        <input 
                          type="time" 
                          value={globalTime.start} 
                          onChange={(e) => setGlobalTime({...globalTime, start: e.target.value})} 
                          style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontSize: '18px', fontWeight: 800, color: '#13113C', outline: 'none' }} 
                        />
                      </div>
                      <div style={{ flex: 1, backgroundColor: '#F9FAFB', border: '2px solid #13113C', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>End</span>
                        <input 
                          type="time" 
                          value={globalTime.end} 
                          onChange={(e) => setGlobalTime({...globalTime, end: e.target.value})} 
                          style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontSize: '18px', fontWeight: 800, color: '#13113C', outline: 'none' }} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto bg-white" style={{ padding: '24px' }}>
                {(!selectedDates || selectedDates.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-[10px] border-[2px] border-solid border-[#13113C] flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-[#13113C]" /></div>
                    <p className="text-gray-600 font-bold text-sm max-w-[200px]">Select dates from the calendar to set times</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedDates.sort((a,b) => a.getTime() - b.getTime()).map(date => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const times = timeSlots[dateKey] || { start: '09:00', end: '17:00' };
                      return (
                        <div key={dateKey} className="group flex items-center" style={{ gap: '24px' }}>
                          <div className="w-24 flex-shrink-0">
                            <span className="text-sm font-bold text-gray-900 block">{format(date, 'MMM d')}</span>
                            <span className="text-xs font-semibold text-gray-400">{format(date, 'EEE')}</span>
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, border: '2px solid #13113C', borderRadius: '10px', padding: '8px', backgroundColor: applyToAll ? '#F3F4F6' : 'white', transition: 'all 0.2s' }}>
                              <input 
                                type="time" 
                                value={times.start} 
                                onChange={(e) => handleTimeChange(date, 'start', e.target.value)} 
                                disabled={applyToAll} 
                                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', outline: 'none', color: applyToAll ? '#9CA3AF' : '#13113C', fontSize: '14px', fontWeight: 700 }} 
                              />
                            </div>
                            <div style={{ flex: 1, border: '2px solid #13113C', borderRadius: '10px', padding: '8px', backgroundColor: applyToAll ? '#F3F4F6' : 'white', transition: 'all 0.2s' }}>
                              <input 
                                type="time" 
                                value={times.end} 
                                onChange={(e) => handleTimeChange(date, 'end', e.target.value)} 
                                disabled={applyToAll} 
                                style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', outline: 'none', color: applyToAll ? '#9CA3AF' : '#13113C', fontSize: '14px', fontWeight: 700 }} 
                              />
                            </div>
                          </div>
                          <button onClick={() => removeDate(date)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5"><Trash2 size={16} /></button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Continue Button */}
        <div className="flex-none border-t-[2px] border-solid border-[#13113C]" style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ 
              background: 'white',
              border: '2.5px solid #13113C',
              color: '#13113C',
              width: '320px',
              borderRadius: '14px',
              boxShadow: '6px 6px 0px 0px #13113C',
            }}
            className="py-5 font-display font-black text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#13113C] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : "Continue"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}