import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Database, Map, Sparkles, Settings } from 'lucide-react';
import './AppShell.css';

const AppShell = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1117] text-slate-100 overflow-hidden font-sans">
      <header className="flex justify-between items-center px-6 py-3 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex flex-col uppercase text-[#22d3ee] tangent-title-pulse cursor-pointer hover:opacity-80 transition-opacity" title="Return to Home">
            <span className="text-[2rem] font-bold leading-none">TANGENT</span>
            <span className="text-[1rem] leading-none">SCIENCE FANTASY ROLEPLAY</span>
            <span className="text-[1.5rem] font-bold leading-none">FOUNDRY</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors" title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
