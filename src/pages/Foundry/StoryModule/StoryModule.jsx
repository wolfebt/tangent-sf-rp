import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScenarioPane from './ScenarioPane';

export default function StoryModule() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#090d16] border-b border-slate-800 shrink-0">
        <h1 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">Story Module</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScenarioPane onSwitchTab={(tab) => {
          if (tab === 'map') navigate('/map-maker');
        }} />
      </div>
    </div>
  );
}
