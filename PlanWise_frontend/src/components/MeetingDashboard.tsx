import { ScheduleGrid } from './ScheduleGrid';
import { MembersSidebar } from './MembersSidebar';
import { Sparkles, Share2, Globe } from 'lucide-react';
import { useState } from 'react';

// Mock data for demonstration
const members = [
  { id: 1, name: 'Alice Chen', avatar: 'AC', hasSubmitted: true },
  { id: 2, name: 'Bob Martinez', avatar: 'BM', hasSubmitted: true },
  { id: 3, name: 'Carol Davis', avatar: 'CD', hasSubmitted: true },
  { id: 4, name: 'David Kim', avatar: 'DK', hasSubmitted: false },
  { id: 5, name: 'Emma Wilson', avatar: 'EW', hasSubmitted: false },
];

export function MeetingDashboard() {
  const [timezone, setTimezone] = useState('America/New_York');

  const handleFindBestTime = () => {
    alert('Finding the best time slots based on group availability...');
  };

  const handleShare = () => {
    // In production, use navigator.clipboard.writeText(window.location.href)
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            {/* Left spacer for centering */}
            <div className="w-[200px]"></div>
            
            {/* Centered Title */}
            <h1 className="text-2xl font-bold text-gray-900">Team Strategy Meeting</h1>
            
            {/* Right - Timezone Selector */}
            <div className="w-[200px] flex justify-end">
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                <Globe className="w-4 h-4 text-gray-500" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="text-sm text-gray-700 font-medium bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="America/New_York">EST</option>
                  <option value="America/Chicago">CST</option>
                  <option value="America/Denver">MST</option>
                  <option value="America/Los_Angeles">PST</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">CET</option>
                  <option value="Asia/Tokyo">JST</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Left Column - Schedule Grid + Actions */}
          <div className="space-y-4">
            {/* Schedule Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Group Availability</h2>
                <p className="text-sm text-gray-500 mt-1">November 2025</p>
              </div>
              <ScheduleGrid members={members} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleFindBestTime}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#549EFF] to-[#8570FF] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-5 h-5" />
                Find Best Time
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#8570FF] text-[#8570FF] font-semibold rounded-lg hover:bg-[#8570FF] hover:text-white transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          {/* Right Column - Members Sidebar */}
          <MembersSidebar members={members} />
        </div>
      </div>
    </div>
  );
}