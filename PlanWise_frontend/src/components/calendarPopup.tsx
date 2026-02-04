import { useState, useEffect } from 'react';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import 'react-day-picker/dist/style.css';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  username: string;
  password: string;
}

export function CalendarPopup({ isOpen, onClose, groupName, username, password }: CalendarPopupProps) {
  const navigate = useNavigate();
  // State
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  // Key: "yyyy-MM-dd", Value: { start: "09:00", end: "17:00" }
  const [timeSlots, setTimeSlots] = useState<Record<string, { start: string; end: string }>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize time slots when dates change
  useEffect(() => {
    if (!selectedDates) return;
    
    setTimeSlots(prev => {
      const next = { ...prev };
      let changed = false;
      selectedDates.forEach(date => {
        const key = format(date, 'yyyy-MM-dd');
        if (!next[key]) {
          next[key] = { start: '09:00', end: '17:00' };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [selectedDates]);

  if (!isOpen) return null;

  // Handlers
  const handleTimeChange = (date: Date, field: 'start' | 'end', value: string) => {
    const key = format(date, 'yyyy-MM-dd');
    setTimeSlots(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedDates || selectedDates.length === 0) {
      return alert("Please select at least one date.");
    }
    setIsLoading(true);
    try {
      const slots = selectedDates.map(date => {
        const key = format(date, 'yyyy-MM-dd');
        const time = timeSlots[key] || { start: '09:00', end: '17:00' };
        return {
          start_time: `${key}T${time.start}:00`,
          end_time: `${key}T${time.end}:00`
        };
      });

      const res = await fetch('http://127.0.0.1:8000/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: username,
          group_name: groupName,
          password,
          slots
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      // Close the popup and navigate to the dashboard
      onClose();
      navigate('/dashboard', { state: { groupName, username } });
      
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const css = `
    .rdp { --rdp-cell-size: 40px; margin: 0; }
    .rdp-caption_label { font-size: 1.1rem; font-weight: 700; color: #1f2937; }
    .rdp-head_cell { color: #9ca3af; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) { 
      background-color: #8B5CF6; color: white; border-radius: 50%; 
    }
    .rdp-day:hover:not(.rdp-day_selected) { background-color: #f3f4f6; border-radius: 50%; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        {/* Main Card Container - Increased roundedness for bubbly effect */}
        <div 
          className="bg-white rounded-[50px] w-[900px] h-[600px] shadow-2xl flex flex-col overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          {/* 1. Header (Fixed Height) */}
          <div className="flex-none h-16 border-b border-gray-100 flex items-center justify-center bg-white relative">
            <h2 className="text-lg font-bold text-gray-900">Schedule Setup</h2>
          </div>

          {/* 2. Content (Flex Grow) - Split View */}
          <div className="flex-1 flex min-h-0">
            
            {/* Left: Calendar */}
            <div className="w-[40%] bg-gray-50/50 border-r border-gray-100 flex flex-col items-center justify-center p-6">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
                <DayPicker 
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  showOutsideDays
                />
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#8B5CF6] bg-[#F3E8F9] px-4 py-2 rounded-full">
                <CalendarIcon size={16} />
                <span>{selectedDates?.length || 0} dates selected</span>
              </div>
            </div>

            {/* Right: Settings & Actions */}
            <div className="w-[60%] flex flex-col bg-white">
              
              {/* List Header */}
              <div className="flex-none p-6 border-b border-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Set Times</h3>
                <p className="text-sm text-gray-500">Adjust availability for selected dates</p>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(!selectedDates || selectedDates.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 opacity-60">
                    <Clock size={40} />
                    <p className="text-sm">Select dates on the left to begin</p>
                  </div>
                ) : (
                  selectedDates.sort((a,b) => a.getTime() - b.getTime()).map(date => {
                    const key = format(date, 'yyyy-MM-dd');
                    const time = timeSlots[key] || { start: '09:00', end: '17:00' };
                    return (
                      <div key={key} className="flex items-center gap-4 group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="w-16">
                          <div className="font-bold text-gray-900">{format(date, 'MMM d')}</div>
                          <div className="text-xs text-gray-400">{format(date, 'EEE')}</div>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <input 
                              type="time" 
                              value={time.start}
                              onChange={e => handleTimeChange(date, 'start', e.target.value)}
                              className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#8B5CF6] outline-none transition-all"
                            />
                            <Clock size={14} className="absolute left-2.5 top-3 text-gray-400 pointer-events-none" />
                          </div>
                          <span className="text-gray-300">-</span>
                          <div className="relative flex-1">
                            <input 
                              type="time" 
                              value={time.end}
                              onChange={e => handleTimeChange(date, 'end', e.target.value)}
                              className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#8B5CF6] outline-none transition-all"
                            />
                            <Clock size={14} className="absolute left-2.5 top-3 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with Button - Centered and Sized to content */}
              <div className="flex-none p-6 border-t border-gray-100 bg-white flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedDates || selectedDates.length === 0}
                  style={{ background: 'linear-gradient(90deg, #549EFF 0%, #8570FF 50%, #A06EFF 100%)' }}
                  className="px-12 text-white py-3.5 rounded-full font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}