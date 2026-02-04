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

interface CellData {
  available: number;
  total: number;
}

export function ScheduleGrid({ members }: ScheduleGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; time: number } | null>(null);

  // Mock dates for the week
  const dates = [
    { day: 'Mon', date: 27 },
    { day: 'Tue', date: 28 },
    { day: 'Wed', date: 29 },
    { day: 'Thu', date: 30 },
    { day: 'Fri', date: 1 },
  ];

  // Time slots from 9 AM to 5 PM
  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  // Generate mock availability data
  const getAvailability = (dayIndex: number, timeIndex: number): CellData => {
    const submittedMembers = members.filter(m => m.hasSubmitted);
    const total = submittedMembers.length;
    
    // Create some variation in availability
    const seed = (dayIndex * 100 + timeIndex * 13) % 7;
    let available: number;
    
    if (seed === 0 || seed === 1) {
      available = total; // Everyone free
    } else if (seed === 2 || seed === 3) {
      available = Math.max(1, total - 1); // Most people free
    } else if (seed === 4) {
      available = Math.max(1, Math.floor(total / 2)); // Half free
    } else {
      available = Math.max(0, Math.floor(total / 3)); // Few people free
    }
    
    return { available, total };
  };

  // Get color based on availability percentage
  const getColor = (available: number, total: number): string => {
    if (total === 0) return 'bg-gray-100';
    
    const percentage = available / total;
    
    if (percentage === 1) {
      return 'bg-green-400 hover:bg-green-500'; // Everyone free
    } else if (percentage >= 0.7) {
      return 'bg-green-300 hover:bg-green-400'; // Most people free
    } else if (percentage >= 0.5) {
      return 'bg-yellow-300 hover:bg-yellow-400'; // Half free
    } else if (percentage >= 0.3) {
      return 'bg-orange-300 hover:bg-orange-400'; // Some people free
    } else {
      return 'bg-red-300 hover:bg-red-400'; // Few people free
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Header Row - Time Column */}
          <div className="bg-gray-50 border-r border-b border-gray-200 p-3"></div>
          
          {/* Header Row - Date Columns */}
          {dates.map((date, index) => (
            <div
              key={index}
              className="bg-gray-50 border-r border-b border-gray-200 p-3 text-center last:border-r-0"
            >
              <div className="text-sm font-semibold text-gray-900">
                {date.day} {date.date}
              </div>
            </div>
          ))}

          {/* Time Rows */}
          {timeSlots.map((time, timeIndex) => (
            <>
              {/* Time Label */}
              <div
                key={`time-${timeIndex}`}
                className="bg-gray-50 border-r border-b border-gray-200 p-3 last:border-b-0"
              >
                <div className="text-sm font-medium text-gray-700">{time}</div>
              </div>

              {/* Availability Cells */}
              {dates.map((date, dayIndex) => {
                const { available, total } = getAvailability(dayIndex, timeIndex);
                const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.time === timeIndex;

                return (
                  <div
                    key={`cell-${dayIndex}-${timeIndex}`}
                    className={`relative border-r border-b border-gray-200 p-3 last:border-r-0 ${
                      timeIndex === timeSlots.length - 1 ? 'last:border-b-0' : ''
                    } transition-colors cursor-pointer ${getColor(available, total)}`}
                    onMouseEnter={() => setHoveredCell({ day: dayIndex, time: timeIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && total > 0 && (
                      <div className="absolute z-10 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {available}/{total} Available
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-600">Everyone Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">Most Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-300 rounded"></div>
            <span className="text-sm text-gray-600">Some Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Few Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
