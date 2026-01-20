
import React from 'react';
import { ViewState } from '../types';

interface HomeScreenProps {
  onOpenApp: (app: ViewState) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenApp }) => {
  const apps = [
    { id: 'gallery', name: 'Photos', icon: '🖼️', color: 'bg-gradient-to-br from-blue-400 to-indigo-600' },
    { id: 'notes', name: 'Notes', icon: '📝', color: 'bg-gradient-to-br from-yellow-300 to-orange-400' },
    { id: 'browser', name: 'Chrome', icon: '🌐', color: 'bg-gradient-to-br from-red-500 via-green-500 to-blue-500', url: 'https://www.google.com' },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-gradient-to-br from-red-600 to-red-800', url: 'https://www.youtube.com' },
    { id: 'google', name: 'Search', icon: '🔍', color: 'bg-white shadow-inner', url: 'https://www.google.com' },
  ];

  const handleAppClick = (app: any) => {
    if (app.url) {
      window.open(app.url, '_blank');
    } else {
      onOpenApp(app.id as ViewState);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-neutral-900 flex flex-col items-center pt-16 animate-in fade-in duration-1000">
      {/* Search Bar */}
      <div className="w-full max-w-sm px-6 mb-16">
        <div 
          className="bg-white/10 backdrop-blur-2xl rounded-3xl px-6 py-4 flex items-center shadow-2xl border border-white/10 cursor-pointer active:scale-95 transition-all duration-200" 
          onClick={() => window.open('https://google.com', '_blank')}
        >
          <span className="text-white/60 mr-4 text-xl">🔍</span>
          <span className="text-white/40 flex-1 font-medium">Search the web...</span>
          <span className="text-white/60">🎤</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-x-8 gap-y-12 w-full max-w-md px-10">
        {apps.map((app) => (
          <div 
            key={app.id} 
            className="flex flex-col items-center gap-3 group cursor-pointer" 
            onClick={() => handleAppClick(app)}
          >
            <div className={`w-16 h-16 rounded-[1.4rem] ${app.color} flex items-center justify-center text-3xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] transform transition-all duration-200 group-hover:scale-105 group-hover:-translate-y-1 active:scale-90 active:translate-y-0 active:duration-75`}>
              {app.icon}
            </div>
            <span className="text-[11px] font-semibold text-white/80 tracking-wide">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Bottom Dock */}
      <div className="mt-auto mb-10 w-full max-w-[340px] bg-white/10 backdrop-blur-3xl rounded-[3rem] p-4 flex justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
        <DockIcon icon="📞" color="bg-green-500" onClick={() => onOpenApp('calculator')} />
        <DockIcon icon="💬" color="bg-indigo-500" onClick={() => onOpenApp('calculator')} />
        <DockIcon icon="🧭" color="bg-blue-500" onClick={() => onOpenApp('calculator')} />
      </div>
    </div>
  );
};

const DockIcon: React.FC<{ icon: string; color: string; onClick: () => void }> = ({ icon, color, onClick }) => (
  <div 
    className={`w-14 h-14 rounded-[1.2rem] ${color} flex items-center justify-center text-2xl shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-90 active:duration-75`} 
    onClick={onClick}
  >
    {icon}
  </div>
);

export default HomeScreen;
