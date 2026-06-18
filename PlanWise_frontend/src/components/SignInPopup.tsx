import { X } from 'lucide-react';

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
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
          className="bg-white rounded-[16px] border-[2.5px] border-solid border-[#13113C] w-[600px] h-[400px] relative shadow-[8px_8px_0px_0px_#13113C] py-[50px] px-[40px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-[20px] right-[20px] size-[40px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-60 border-[1.5px] border-[#13113C] rounded-[10px] hover:bg-gray-100"
          >
            <X className="size-[24px] text-[#13113C]" strokeWidth={2.5} />
          </button>

          {/* Popup Content Placeholder */}
          <div className="flex items-center justify-center h-full">
            <p className="font-display font-bold text-[32px] text-[#13113C]">
              Sign In Popup
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
