
import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import HomeScreen from './components/HomeScreen';
import Gallery from './components/Gallery';
import Notes from './components/Notes';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('calculator');
  const [password, setPassword] = useState<string | null>(localStorage.getItem('calc_pwd'));

  // Logic to handle unlocking from Calculator
  const handleUnlock = (enteredPwd: string) => {
    // Check if entered input is purely numeric for password purposes
    const isNumeric = /^\d+$/.test(enteredPwd);

    if (!password) {
      // Only attempt to set password if the input is numeric
      if (!isNumeric) return false;

      // First time setup validation: Minimum 4 digits
      if (enteredPwd.length < 4) {
        alert("Security requirement: Password must be at least 4 digits long.");
        return false; // Return false to keep the input on screen
      }

      // First time setup success
      localStorage.setItem('calc_pwd', enteredPwd);
      setPassword(enteredPwd);
      // Subtle hint on first setup
      alert("Keep the app installed to keep your data.");
      return true; // Return true to indicate clear display
    }

    if (enteredPwd === password) {
      setView('home');
      return true;
    }
    return false;
  };

  const renderContent = () => {
    switch (view) {
      case 'calculator':
        return <Calculator onUnlock={handleUnlock} />;
      case 'home':
        return <HomeScreen onOpenApp={(app: ViewState) => setView(app)} />;
      case 'gallery':
        return <Gallery onBack={() => setView('home')} />;
      case 'notes':
        return <Notes onBack={() => setView('home')} />;
      default:
        return <Calculator onUnlock={handleUnlock} />;
    }
  };

  return (
    <div className="w-full h-full bg-neutral-900 text-white select-none">
      {renderContent()}
    </div>
  );
};

export default App;
