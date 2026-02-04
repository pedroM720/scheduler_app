import { Clock } from 'lucide-react';

interface TimeSettingsProps {
  selectedDates: Date[];
  times: Record<string, { start: string; end: string }>;
  applyToAll: boolean;
  globalTime: { start: string; end: string };
  onApplyToAllToggle: () => void;
  onTimeChange: (dateStr: string, field: 'start' | 'end', value: string) => void;
  onGlobalTimeChange: (field: 'start' | 'end', value: string) => void;
}

export function TimeSettings({
  selectedDates,
  times,
  applyToAll,
  globalTime,
  onApplyToAllToggle,
  onTimeChange,
  onGlobalTimeChange
}: TimeSettingsProps) {
  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toggle Section */}
      <div className="p-6 sm:p-8 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="apply-all" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
            Apply same time to all days
          </label>
          <button
            id="apply-all"
            onClick={onApplyToAllToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              applyToAll ? 'bg-[#8570FF]' : 'bg-gray-300'
            }`}
            aria-label="Toggle apply to all"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                applyToAll ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Global Time Inputs (shown when toggle is on) */}
        {applyToAll && (
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="time"
                value={globalTime.start}
                onChange={(e) => onGlobalTimeChange('start', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent"
              />
            </div>
            <span className="text-gray-400 text-center sm:text-left">—</span>
            <div className="flex items-center gap-2 flex-1">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="time"
                value={globalTime.end}
                onChange={(e) => onGlobalTimeChange('end', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Time List */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {selectedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm px-4">Select dates from the calendar to set times</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDates
              .sort((a, b) => a.getTime() - b.getTime())
              .map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const timeSlot = times[dateStr] || { start: '09:00', end: '17:00' };

                return (
                  <div key={dateStr} className="space-y-2">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateLabel(date)}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="time"
                          value={timeSlot.start}
                          onChange={(e) => onTimeChange(dateStr, 'start', e.target.value)}
                          disabled={applyToAll}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <span className="text-gray-400 text-center sm:text-left">—</span>
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                          type="time"
                          value={timeSlot.end}
                          onChange={(e) => onTimeChange(dateStr, 'end', e.target.value)}
                          disabled={applyToAll}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8570FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}