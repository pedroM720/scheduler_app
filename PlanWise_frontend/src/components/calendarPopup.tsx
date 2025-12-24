import { useState, useEffect } from 'react';
import { X, Loader2, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  username: string;
  password: string;
}

export function CalendarPopup({ isOpen, onClose, groupName, username, password }: CalendarPopupProps) {
  // 1. The dates selected on the calendar
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  
  // 2. The times associated with each date string (Key: "2023-11-27", Value: {start, end})
  const [timeSlots, setTimeSlots] = useState<Record<string, { start: string, end: string }>>({});
  
  // 3. Toggle for bulk editing
  const [applyToAll, setApplyToAll] = useState(false);
  const [globalTime, setGlobalTime] = useState({ start: '09:00', end: '17:00' });
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize time slots when dates are selected
  useEffect(() => {
    if (!selectedDates) return;
    
    const newSlots = { ...timeSlots };
    let hasChanges = false;

    selectedDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      // If this date doesn't have a time yet, give it a default
      if (!newSlots[dateKey]) {
        newSlots[dateKey] = { start: '09:00', end: '17:00' };
        hasChanges = true;
      }
    });

    if (hasChanges) setTimeSlots(newSlots);
  }, [selectedDates]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleTimeChange = (date: Date, field: 'start' | 'end', value: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setTimeSlots(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [field]: value }
    }));
  };

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(prev => prev?.filter(d => d.getTime() !== dateToRemove.getTime()));
  };

  const handleSubmit = async () => {
    if (!selectedDates || selectedDates.length === 0) {
      alert("Please select at least one date.");
      return;
    }

    setIsLoading(true);

    try {
      // Transform Frontend State -> Backend JSON
      const slots = selectedDates.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Use Global Time OR Individual Time based on toggle
        const time = applyToAll ? globalTime : timeSlots[dateStr];

        return {
          start_time: `${dateStr}T${time.start}:00`,
          end_time: `${dateStr}T${time.end}:00`,
        };
      });

      const payload = {
        user_name: username,
        group_name: groupName,
        password: password,
        slots: slots
      };

      console.log("Sending Payload:", payload);

      const response = await fetch('http://127.0.0.1:8000/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to save availability');
      }

      alert(`Success! Saved ${slots.length} time slots.`);
      onClose();

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // CSS to force the Calendar to use your Purple Brand Color
  const css = `
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      background-color: #B565D8;
      color: white;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: #f3e8f9;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
        
        {/* Main Container */}
        <div className="bg-white rounded-[20px] w-[1000px] h-[650px] relative shadow-2xl flex overflow-hidden" onClick={e => e.stopPropagation()}>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50">
            <X className="text-gray-500" />
          </button>

          {/* --- LEFT COLUMN: Calendar --- */}
          <div className="w-[40%] bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              <CalendarIcon className="text-[#B565D8]" size={24} /> 
              Select Days
            </h2>
            <p className="text-sm text-gray-500 mb-6">Click to add to your list</p>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <DayPicker
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                showOutsideDays
              />
            </div>
          </div>

          {/* --- RIGHT COLUMN: Time List --- */}
          <div className="w-[60%] flex flex-col h-full">
            
            {/* Header / Global Toggle */}
            <div className="p-8 pb-4 border-b border-gray-100 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Clock className="text-[#B565D8]" size={24} /> 
                Set Times
              </h2>

              {/* Bulk Toggle */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 transition-all">
                <input 
                  type="checkbox" 
                  id="applyAll" 
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-5 h-5 accent-[#B565D8] cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="applyAll" className="text-gray-800 font-semibold cursor-pointer block">
                    Use same time for all days
                  </label>
                  {applyToAll && (
                    <div className="flex gap-2 mt-2 items-center animate-in fade-in slide-in-from-top-1">
                      <input 
                        type="time" 
                        value={globalTime.start}
                        onChange={(e) => setGlobalTime({...globalTime, start: e.target.value})}
                        className="p-1 px-2 border rounded bg-white text-sm"
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="time" 
                        value={globalTime.end}
                        onChange={(e) => setGlobalTime({...globalTime, end: e.target.value})}
                        className="p-1 px-2 border rounded bg-white text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable List of Days */}
            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-3 bg-white">
              {(!selectedDates || selectedDates.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>No days selected yet.</p>
                </div>
              ) : (
                selectedDates.sort((a,b) => a.getTime() - b.getTime()).map((date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const times = timeSlots[dateKey] || { start: '09:00', end: '17:00' }; // fallback

                  return (
                    <div key={dateKey} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-purple-200 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg text-sm">
                          {format(date, 'MMM d')}
                        </div>
                        <div className="text-gray-500 text-sm">{format(date, 'EEEE')}</div>
                      </div>

                      {!applyToAll ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={times.start}
                            onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                            className="p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#B565D8] outline-none w-[110px]"
                          />
                          <span className="text-gray-300">-</span>
                          <input 
                            type="time" 
                            value={times.end}
                            onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                            className="p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#B565D8] outline-none w-[110px]"
                          />
                        </div>
                      ) : (
                         <span className="text-gray-400 text-sm italic">Using global time</span>
                      )}

                      <button 
                        onClick={() => removeDate(date)}
                        className="text-gray-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {selectedDates?.length} days selected
              </p>
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !selectedDates?.length}
                className="bg-[#B565D8] text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Save & Finish"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}