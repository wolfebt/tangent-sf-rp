import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, 
  Tv2, 
  Smartphone, 
  BookOpen, 
  Users, 
  Radio, 
  Database, 
  Compass, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export interface MobileTacticalBlockerProps {
  operation?: 'map' | 'vtt' | 'stage';
  onBack?: () => void;
  customTitle?: string;
  customDescription?: string;
}

/**
 * MobileTacticalBlocker
 * 
 * Informative fallback component rendered on mobile viewports (< 768px)
 * when a user attempts to access desktop-only Map Architect or Live VTT Stage operations.
 * Prevents mobile page crunch and canvas corruption, guiding users to supported mobile workspaces.
 */
export const MobileTacticalBlocker: React.FC<MobileTacticalBlockerProps> = ({
  operation = 'vtt',
  onBack,
  customTitle,
  customDescription
}) => {
  const navigate = useNavigate();
  const isMap = operation === 'map';

  const title = customTitle || (isMap 
    ? 'Tactical Map Architect' 
    : 'Live VTT & Stage Operations');

  const subtitle = isMap
    ? 'Map Drafting & Cartography'
    : 'Live Director & Tactical Canvas';

  const description = customDescription || (isMap
    ? 'The Map Architect requires a precision desktop workstation to draft vector walls, grid alignments, and line-of-sight bulkheads. Map operations are currently unavailable on mobile screens.'
    : 'The Live VTT Director and Stage Compiler require a desktop workstation to manage 2D/3D hardware-accelerated spatial rendering, token line-of-sight, combat arbitrations, and multi-dock controls. VTT operations are currently unavailable on mobile screens.');

  const handleNavigate = (path: string) => {
    AudioService.playTerminalBeep(1100, 0.02);
    if (onBack && (path === '/foundry' || path.startsWith('/foundry?'))) {
      onBack();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#070b13] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-200 select-none overflow-y-auto font-mono">
      {/* Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.08),transparent_70%)]" />

      {/* Main Terminal Card */}
      <div className="max-w-md w-full bg-[#0c121e]/95 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center text-center z-10">
        {/* Top Decorative Gradient Accent */}
        <div 
          className={`h-1 absolute top-0 left-0 right-0 ${
            isMap 
              ? 'bg-linear-to-r from-cyan-500 via-sky-500 to-indigo-500' 
              : 'bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500'
          }`} 
        />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/40 text-amber-300 mb-4 shadow-xs">
          <ShieldAlert size={12} className="text-amber-400" />
          <span>Desktop Workstation Required</span>
        </div>

        {/* Hero Visual Icon Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg ${
            isMap 
              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-cyan-950/50' 
              : 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-purple-950/50'
          }`}>
            {isMap ? <MapIcon size={32} /> : <Tv2 size={32} />}
          </div>
          <div className="absolute -bottom-1 -right-2 bg-slate-900 border border-slate-700 rounded-lg p-1 text-slate-400 shadow-md">
            <Smartphone size={14} className="text-amber-400" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-100 mb-0.5">
          {title}
        </h2>
        <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-3">
          {subtitle} &bull; Unavailable on Mobile
        </span>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4 text-left sm:text-center font-sans">
          {description}
        </p>

        {/* Mobile-Friendly Alternatives Panel */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mb-5 text-left">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1">
            <Sparkles size={11} /> Supported on Mobile Devices:
          </span>
          <ul className="text-[11px] text-slate-300 space-y-1.5 font-sans">
            <li className="flex items-center gap-2">
              <span className="text-cyan-400 shrink-0">&bull;</span>
              <span><strong>Operative Folio:</strong> Full character builder &amp; live tactical sheet</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 shrink-0">&bull;</span>
              <span><strong>Data Network:</strong> Comms channels, squad management &amp; chat</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400 shrink-0">&bull;</span>
              <span><strong>Omnicortex DBM:</strong> Rules codex, equipment &amp; items</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400 shrink-0">&bull;</span>
              <span><strong>Story Weaver:</strong> Narrative scenario drafting &amp; elements</span>
            </li>
          </ul>
        </div>

        {/* Primary Action: Return to Story Weaver / Mission Control */}
        <button
          type="button"
          onClick={() => handleNavigate('/foundry?view=scenarios')}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 hover:border-cyan-400 text-cyan-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 mb-2.5"
        >
          <BookOpen size={14} className="text-cyan-400" />
          <span>Switch to Story Weaver</span>
        </button>

        {/* Secondary Action Grid */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleNavigate('/folio')}
            className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Users size={12} className="text-cyan-400" />
            <span>Folio Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/network')}
            className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-slate-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Radio size={12} className="text-emerald-400" />
            <span>Data Network</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/dbm')}
            className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-slate-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Database size={12} className="text-amber-400" />
            <span>Omnicortex</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-300 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Compass size={12} className="text-slate-400" />
            <span>Central Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTacticalBlocker;
