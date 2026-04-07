import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Desktop from './imports/Desktop1';
import { NavMenu } from './components/NavMenu';
import { SignInPopup } from './components/SignInPopup';
import { JoinGroupPopup } from './components/JoinGroupPopup';
import { CreateGroupPopup } from './components/CreateGroupPopup';
import { MeetingDashboard } from './components/MeetingDashboard';
import { ScheduleSetupPage } from './components/ScheduleSetupPage';


function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  
  // Track who is logged in so we can pass it to the calendar
  const [currentUser, setCurrentUser] = useState({ name: '', group: '', password: '' });

  // Central handler for when a user successfully enters a group
  const handleAuthSuccess = (group: string, pass: string, name: string) => {
    setCurrentUser({ group, password: pass, name });
    setIsCreateGroupOpen(false);
    setIsJoinGroupOpen(false);
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
        // Receives password from popup
        onSuccess={(groupName, password, username) => handleAuthSuccess(groupName, password, username)}
      />
      
      <CreateGroupPopup 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        // Receives password from popup (default name 'Host' for creators)
        onSuccess={(groupName, password) => handleAuthSuccess(groupName, password, "Host")} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<MeetingDashboard />} />
        <Route path="/schedule-setup" element={<ScheduleSetupPage />} />

      </Routes>
    </BrowserRouter>
  );
}