import { X } from 'lucide-react';

interface CreateGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupPopup({ isOpen, onClose }: CreateGroupPopupProps) {
  if (!isOpen) return null;

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

          {/* Popup Content Placeholder */}
          <div className="flex items-center justify-center h-full">
            <p className="font-['Inter:Regular',sans-serif] text-[24px] text-gray-400">
              Create Group Popup
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
