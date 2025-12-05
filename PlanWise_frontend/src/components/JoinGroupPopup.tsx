import { X } from 'lucide-react';
import { useState } from 'react';

interface JoinGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinGroupPopup({ isOpen, onClose }: JoinGroupPopupProps) {
  const [groupPassword, setGroupPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Joining group with password:', groupPassword);
    // Handle join group logic here
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Popup */}
        <div 
          className="bg-white rounded-[20px] w-[600px] h-[400px] relative shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-[20px] right-[20px] size-[40px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-60"
          >
            <X className="size-[30px] text-gray-600" strokeWidth={2} />
          </button>

          {/* Popup Content */}
          <div className="flex flex-col items-center justify-center h-full p-[40px] gap-[30px]">
            <p className="font-['Inter:Regular',sans-serif] text-[32px] text-gray-800">
              Join Group
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-[20px]">
              <input
                type="text"
                placeholder="Enter Group Password"
                value={groupPassword}
                onChange={(e) => setGroupPassword(e.target.value)}
                className="w-full px-[20px] py-[15px] border-2 border-gray-300 rounded-[10px] text-[18px] focus:outline-none focus:border-[#B565D8]"
              />
              <button
                type="submit"
                className="bg-[#B565D8] text-white px-[40px] py-[15px] rounded-[10px] text-[20px] cursor-pointer transition-all duration-200 hover:shadow-[3px_5px_6px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px]"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
