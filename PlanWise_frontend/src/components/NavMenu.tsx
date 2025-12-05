import { X } from 'lucide-react';

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

export function NavMenu({ isOpen, onClose, onSignInClick }: NavMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-gradient-to-b from-[#6AA4F5] to-[#C87EEB] z-50 shadow-xl transition-transform duration-300 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] size-[60px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-80 active:opacity-60"
        >
          <X className="size-[40px] text-white" strokeWidth={3} />
        </button>

        {/* Menu Items */}
        <div className="flex flex-col items-center justify-center flex-1 gap-[60px]">
          <button
            onClick={() => {
              // Navigate to about page (placeholder)
              console.log('Navigate to About page');
              onClose();
            }}
            className="font-['Inter:Regular',sans-serif] font-normal text-[48px] text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 relative group"
          >
            About
            <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </button>

          <button
            onClick={onSignInClick}
            className="font-['Inter:Regular',sans-serif] font-normal text-[48px] text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 relative group"
          >
            Sign In
            <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </button>
        </div>
      </div>
    </>
  );
}
