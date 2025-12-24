import { useState } from 'react';
import Desktop from './imports/Desktop1';
import { NavMenu } from './components/NavMenu';
import { SignInPopup } from './components/SignInPopup';
import { JoinGroupPopup } from './components/JoinGroupPopup';
import { CreateGroupPopup } from './components/CreateGroupPopup';
import { CalendarPopup } from './components/calendarPopup'; // Added Import

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Track who is logged in so we can pass it to the calendar
  const [currentUser, setCurrentUser] = useState({ name: '', group: '' });

  // Central handler for when a user successfully enters a group
  const handleAuthSuccess = (group: string, name: string) => {
    setCurrentUser({ group, name });
    setIsCreateGroupOpen(false);
    setIsJoinGroupOpen(false);
    // Automatically open the calendar
    setIsCalendarOpen(true);
  };

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
        // Pass the success handler
        onSuccess={(groupName, username) => handleAuthSuccess(groupName, username)}
      />
      
      <CreateGroupPopup 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        // Pass the success handler (default name 'Host' for creators)
        onSuccess={(groupName) => handleAuthSuccess(groupName, "Host")} 
      />

      <CalendarPopup 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        groupName={currentUser.group}
        username={currentUser.name}
      />

    </div>
  );
}