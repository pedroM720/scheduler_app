import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface JoinGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinGroupPopup({ isOpen, onClose }: JoinGroupPopupProps) {
  // Added state for all 3 required backend fields
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Essential for the app to know who you are
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/join-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          group_name: groupName, 
          password: password, 
          username: username 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to join group');
      }

      console.log("Joined Group:", data);
      
      // Success!
      alert(`Successfully joined ${groupName} as ${username}!`);
      
      // TODO: Save the user info (maybe in localStorage for now) so the app remembers you
      // localStorage.setItem('currentUser', JSON.stringify({ name: username, group: groupName }));
      
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Popup Container - Adjusted height to fit 3 inputs */}
        <div 
          className="bg-white rounded-[20px] w-[600px] h-[400px] relative shadow-xl py-[50px]"
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
          <div className="flex flex-col items-center justify-center h-full px-[40px] gap-[30px]">
            <div className="text-center">
              <p className="font-['Inter:Regular',sans-serif] text-[32px] text-gray-800">
                Join Group
              </p>
            </div>
            
            <form onSubmit={handleJoin} className="w-full flex flex-col items-center gap-[20px]">
              
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-[20px] py-[15px] border-2 border-gray-300 rounded-[10px] text-[18px] focus:outline-none focus:border-[#B565D8]"
                required
              />

              <input
                type="password"
                placeholder="Group Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-[20px] py-[15px] border-2 border-gray-300 rounded-[10px] text-[18px] focus:outline-none focus:border-[#B565D8]"
                required
              />

              <input
                type="text"
                placeholder="Your Name (Display Name)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-[20px] py-[15px] border-2 border-gray-300 rounded-[10px] text-[18px] focus:outline-none focus:border-[#B565D8]"
                required
              />

              {error && (
                <p className="text-red-500 text-sm font-medium w-full text-center">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#B565D8] text-white px-[40px] py-[15px] rounded-[10px] text-[20px] cursor-pointer transition-all duration-200 hover:shadow-[3px_5px_6px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Join Group"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}