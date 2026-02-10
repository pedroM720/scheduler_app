import { useState, useEffect } from 'react';
import { Loader2, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import 'react-day-picker/dist/style.css';

export function CalendarPopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupName, username, password } = location.state || {};
  
  // --- STATE ---
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, { start: string, end: string }>>({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [globalTime, setGlobalTime] = useState({ start: '09:00', end: '17:00' });
  const [isLoading, setIsLoading] = useState(false);

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
          user_name: username,
          group_name: groupName,
          password,
          slots
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      navigate('/dashboard', { state: { groupName, username } });

    } catch (err: any) {
      console.error(err);
      alert("Error saving availability: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar Theme Overrides
  const calendarStyle = `
    .rdp { 
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .rdp-months {
      justify-content: center;
    }
    .rdp-day_selected, 
    .rdp-day_selected:focus-visible, 
    .rdp-day_selected:hover {
      background-color: #8570FF !important;
      color: white !important;
      font-weight: 600;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: #F3F4F6 !important;
      color: #8570FF;
    }
    .rdp-head_cell { 
      color: #9CA3AF; 
      font-weight: 600; 
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    .rdp-caption { 
      margin-bottom: 1rem;
    }
    .rdp-caption_label { 
      font-size: 1.125rem; 
      font-weight: 700; 
      color: #111827;
    }
    .rdp-nav_button {
      width: 2rem;
      height: 2rem;
    }
    .rdp-nav_button:hover {
      background-color: #F3F4F6;
    }
    .rdp-day {
      font-size: 0.875rem;
    }
    .rdp-day_today:not(.rdp-day_selected) {
      font-weight: 700;
      color: #8570FF;
    }
  `;

  return (
    <>
      <style>{calendarStyle}</style>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[20px] w-full max-w-5xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" style={{ height: '800px', maxHeight: '90vh' }}>
          
          {/* Header */}
          <div className="flex-none h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Schedule Setup</h2>
            {groupName && <span className="text-sm font-medium text-gray-500">Group: <span className="text-[#8570FF]">{groupName}</span></span>}
          </div>

          {/* Split View */}
          <div className="flex-1 flex min-h-0">
            {/* Left Column: Calendar */}
            <div className="p-8 border-r border-gray-200 overflow-y-auto flex flex-col items-center justify-center w-[40%] bg-gray-50/30">
              <div className="w-full max-w-[380px]">
                <DayPicker
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  showOutsideDays
                  className="border-0"
                />
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <CalendarIcon size={18} className="text-[#8570FF]" />
                  <span className="font-semibold text-gray-900">{selectedDates?.length || 0}</span>
                  <span>date{selectedDates?.length !== 1 ? 's' : ''} selected</span>
                </div>
              </div>
            </div>

            {/* Right Column: Settings */}
            <div className="flex flex-col bg-white w-[60%]">
              {/* Toggle */}
              <div className="flex-none p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <label htmlFor="apply-all" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Apply same time to all days
                  </label>
                  <button
                    id="apply-all"
                    onClick={() => setApplyToAll(!applyToAll)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:ring-offset-2 ${applyToAll ? 'bg-[#8570FF]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${applyToAll ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {applyToAll && (
                  <div className="flex items-center gap-3 mt-4 animate-in slide-in-from-top-2 duration-200">
                    <input type="time" value={globalTime.start} onChange={(e) => setGlobalTime({...globalTime, start: e.target.value})} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent transition-all" />
                    <span className="text-gray-400 font-medium">—</span>
                    <input type="time" value={globalTime.end} onChange={(e) => setGlobalTime({...globalTime, end: e.target.value})} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent transition-all" />
                  </div>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-6">
                {(!selectedDates || selectedDates.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm max-w-[200px]">Select dates from the calendar to set times</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDates.sort((a,b) => a.getTime() - b.getTime()).map(date => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const times = timeSlots[dateKey] || { start: '09:00', end: '17:00' };
                      return (
                        <div key={dateKey} className="group flex items-center gap-3">
                          <div className="w-24 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-900 block">{format(date, 'MMM d')}</span>
                            <span className="text-xs text-gray-400">{format(date, 'EEE')}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={times.start} onChange={(e) => handleTimeChange(date, 'start', e.target.value)} disabled={applyToAll} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-all" />
                            <span className="text-gray-300 text-sm">—</span>
                            <input type="time" value={times.end} onChange={(e) => handleTimeChange(date, 'end', e.target.value)} disabled={applyToAll} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-all" />
                          </div>
                          <button onClick={() => removeDate(date)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none px-8 py-6 border-t border-gray-200 bg-gray-50/50">
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !selectedDates || selectedDates.length === 0}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-[#549EFF] via-[#8570FF] to-[#A06EFF] text-white font-semibold text-lg hover:opacity-90 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : "Continue"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
