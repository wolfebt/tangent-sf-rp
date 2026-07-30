import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserSettingsModal } from '../components/UserSettingsModal';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userHandle, refreshUserHandle, loginWithGoogle, confirmLogout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const refreshSettings = () => {
    refreshUserHandle();
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const displayIdentity = userHandle ? `@${userHandle}` : (currentUser ? (currentUser.displayName || currentUser.email) : '');

  return (
    <div 
      className="flex flex-col h-screen relative bg-cover bg-center bg-no-repeat bg-fixed text-[#f5f5f5] font-sans"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Top Left Menu: Settings */}
      <header className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-[rgba(20,20,20,0.6)] hover:bg-[rgba(40,40,40,0.7)] backdrop-blur-sm px-3.5 py-2 rounded-lg border border-[#9e9e9e] hover:border-[#f5f5f5] text-slate-200 hover:text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all shadow-md"
        >
          <span>⚙️</span> Settings
        </button>
      </header>

      {/* Top Right Header: User Account */}
      <header className="absolute top-4 right-4 z-50">
        {currentUser ? (
          <div className="flex items-center gap-4 bg-[rgba(20,20,20,0.6)] backdrop-blur-sm p-2 rounded-lg border border-[#9e9e9e]">
            <span className="text-sm text-cyan-300 font-bold">{displayIdentity}</span>
            <button 
              onClick={() => confirmLogout(navigate)}
              className="bg-[rgba(30,30,30,0.7)] hover:bg-[rgba(40,40,40,0.7)] border border-[#888] hover:border-[#f5f5f5] text-[#f5f5f5] px-4 py-2 rounded-md font-bold uppercase transition-all duration-200 backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            className="bg-[rgba(30,30,30,0.7)] hover:bg-[rgba(40,40,40,0.7)] border border-[#888] hover:border-[#f5f5f5] text-[#f5f5f5] px-4 py-2 rounded-md font-bold uppercase transition-all duration-200 backdrop-blur-sm"
          >
            Login with Google
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start text-center p-4 pt-20">
        <div className="mb-8">
          <h1 
            className="text-6xl md:text-8xl font-bold tracking-[0.1em]"
            style={{ textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 4px 4px 8px rgba(0,0,0,0.7)" }}
          >
            TANGENT
          </h1>
          <h2 
            className="text-xl md:text-2xl text-gray-300 mt-2 font-light tracking-wider"
            style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            Science Fantasy Role Playing
          </h2>
          <p className="text-gray-400 text-sm mt-4">UI Version: React 2.0</p>
        </div>

        <div className="w-full max-w-lg flex flex-col items-center gap-6">
          {currentUser ? (
            <nav className="w-full grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/dbm')}
                className="w-full py-4 px-6 rounded-lg text-center transition-all duration-300 backdrop-blur-sm bg-[rgba(20,20,20,0.5)] hover:bg-[rgba(0,0,0,0.75)] text-[#f5f5f5] hover:-translate-y-1 group"
                style={{ 
                  boxShadow: "0 0 0 1px black, 0 0 0 2px white", 
                  textShadow: "2px 2px 4px #000"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white, 0 0 25px rgba(0, 229, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white";
                }}
              >
                <div className="text-2xl font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                  OMNICORTEX
                </div>
                <div className="text-xs text-gray-300 font-normal normal-case mt-1 tracking-normal opacity-90 group-hover:text-white transition-opacity">
                  Rulebook & Database Manager — Explore species, equipment, and core mechanics
                </div>
              </button>

              <button 
                onClick={() => navigate('/story-foundry')}
                className="w-full py-4 px-6 rounded-lg text-center transition-all duration-300 backdrop-blur-sm bg-[rgba(20,20,20,0.5)] hover:bg-[rgba(0,0,0,0.75)] text-[#f5f5f5] hover:-translate-y-1 group"
                style={{ 
                  boxShadow: "0 0 0 1px black, 0 0 0 2px white", 
                  textShadow: "2px 2px 4px #000"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white, 0 0 25px rgba(0, 229, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white";
                }}
              >
                <div className="text-2xl font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                  Story Foundry
                </div>
                <div className="text-xs text-gray-300 font-normal normal-case mt-1 tracking-normal opacity-90 group-hover:text-white transition-opacity">
                  Campaign Workspace & Map Builder — Craft maps, story outlines, and elements
                </div>
              </button>

              <button 
                onClick={() => navigate('/folio')}
                className="w-full py-4 px-6 rounded-lg text-center transition-all duration-300 backdrop-blur-sm bg-[rgba(20,20,20,0.5)] hover:bg-[rgba(0,0,0,0.75)] text-[#f5f5f5] hover:-translate-y-1 group"
                style={{ 
                  boxShadow: "0 0 0 1px black, 0 0 0 2px white", 
                  textShadow: "2px 2px 4px #000"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white, 0 0 25px rgba(0, 229, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px black, 0 0 0 2px white";
                }}
              >
                <div className="text-2xl font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                  Persona Folio
                </div>
                <div className="text-xs text-gray-300 font-normal normal-case mt-1 tracking-normal opacity-90 group-hover:text-white transition-opacity">
                  Character Sheet & Hero Creator — Build characters, manage stats, and track CP budgets
                </div>
              </button>
            </nav>
          ) : (
            <div className="bg-[rgba(20,20,20,0.6)] backdrop-blur-sm p-8 rounded-lg border border-[#9e9e9e] w-full text-center">
              <p className="text-lg text-gray-300">Please login to access tools.</p>
            </div>
          )}
        </div>
      </main>

      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSaveSuccess={refreshSettings}
      />
    </div>
  );
};

export default Home;
