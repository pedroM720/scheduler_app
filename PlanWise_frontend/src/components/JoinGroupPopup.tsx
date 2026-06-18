import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// FIX 1: Update interface to include password (matching App.tsx expectation)
interface JoinGroupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupName: string, password: string, username: string) => void;
}

export function JoinGroupPopup({ isOpen, onClose, onSuccess }: JoinGroupPopupProps) {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  
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
      
      alert(`Successfully joined ${groupName} as ${username}!`);
      
      // FIX 2: Pass password as the second argument
      if (onSuccess) {
        onSuccess(groupName, password, username);
      }
      
      navigate('/dashboard', { state: { groupName, password, username } });
      setGroupName('');
      setPassword('');
      setUsername('');
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 flex items-center justify-center"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-[16px] border-[2.5px] border-solid border-[#13113C] w-[600px] h-auto relative shadow-[8px_8px_0px_0px_#13113C] py-[50px] px-[40px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-[20px] right-[20px] size-[40px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-60 border-[1.5px] border-[#13113C] rounded-[10px] hover:bg-gray-100"
          >
            <X className="size-[24px] text-[#13113C]" strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center justify-center h-full gap-[30px]">
            <div className="text-center">
              <p className="font-display font-bold text-[32px] text-[#13113C]">
                Join Group
              </p>
            </div>
            
            <form onSubmit={handleJoin} className="w-full flex flex-col items-center gap-[20px]">
              
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-[20px] py-[15px] border-[2px] border-solid border-[#13113C] rounded-[12px] text-[18px] focus:outline-none focus:border-[#8570FF] focus:shadow-[2px_2px_0px_0px_#13113C] transition-all font-sans font-medium text-gray-800 placeholder-gray-400"
                required
              />

              <input
                type="password"
                placeholder="Group Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-[20px] py-[15px] border-[2px] border-solid border-[#13113C] rounded-[12px] text-[18px] focus:outline-none focus:border-[#8570FF] focus:shadow-[2px_2px_0px_0px_#13113C] transition-all font-sans font-medium text-gray-800 placeholder-gray-400"
                required
              />

              <input
                type="text"
                placeholder="Your Name (Display Name)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-[20px] py-[15px] border-[2px] border-solid border-[#13113C] rounded-[12px] text-[18px] focus:outline-none focus:border-[#8570FF] focus:shadow-[2px_2px_0px_0px_#13113C] transition-all font-sans font-medium text-gray-800 placeholder-gray-400"
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
                className="bg-[#8570FF] border-[2.5px] border-solid border-[#13113C] text-white font-bold px-[40px] py-[15px] rounded-[14px] text-[20px] shadow-[4px_4px_0px_0px_#13113C] cursor-pointer transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#13113C] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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