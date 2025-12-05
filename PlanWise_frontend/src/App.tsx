import { useState } from 'react';
import Desktop from './imports/Desktop1';
import { NavMenu } from './components/NavMenu';
import { SignInPopup } from './components/SignInPopup';
import { JoinGroupPopup } from './components/JoinGroupPopup';
import { CreateGroupPopup } from './components/CreateGroupPopup';

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden animated-gradient">
      <Desktop 
        onMenuClick={() => setIsNavOpen(true)}
        onJoinGroupClick={() => setIsJoinGroupOpen(true)}
        onCreateGroupClick={() => setIsCreateGroupOpen(true)}
      />
      
      <NavMenu 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)}
        onSignInClick={() => {
          setIsNavOpen(false);
          setIsSignInOpen(true);
        }}
      />
      
      <SignInPopup 
        isOpen={isSignInOpen} 
        onClose={() => setIsSignInOpen(false)} 
      />
      
      <JoinGroupPopup 
        isOpen={isJoinGroupOpen} 
        onClose={() => setIsJoinGroupOpen(false)} 
      />
      
      <CreateGroupPopup 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
      />
    </div>
  );
}