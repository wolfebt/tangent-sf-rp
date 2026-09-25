import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Tv2, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  X, 
  Terminal, 
  Dices, 
  Radio, 
  Command,
  Shield
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export const WelcomeBriefing = ({ onDismiss, isMobile = false }) => {
  const navigate = useNavigate();

  const handlePathwayClick = (route) => {
    AudioService.playTerminalBeep(1200, 0.03);
    navigate(route);
  };

  const handleDismissForever = () => {
    AudioService.playTerminalBeep(900, 0.03);
    localStorage.setItem('tangent_welcome_briefing_dismissed', 'true');
    onDismiss?.();
  };

  const pathways = [
    {
      id: 'folio',
      title: 'Persona Folio',
      subtitle: 'Operative Sheet & Roster',
      desc: 'Forge your operative persona with 150 CP allocation across attributes, 95+ skills, augmentations, and metaphysics.',
      route: '/folio',
      icon: Users,
      badge: 'Character Engine',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      iconColor: 'text-cyan-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]'
    },
    {
      id: 'teams',
      title: 'Tactical Squads & Teams',
      subtitle: 'Squad Operations & Rosters',
      desc: 'Mobilize operative squads, generate QR invite codes, sync fireteam vitals, and deploy together into live VTT encounters.',
      route: '/teams',
      icon: Shield,
      badge: 'Squad Operations',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      iconColor: 'text-emerald-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]'
    },
    {
      id: 'comms',
      title: 'Subspace Comms & Net',
      subtitle: 'CommLink Relay & Voice Net',
      desc: 'Broadcast over encrypted tactical radio, join live WebRTC voice channels, transmit combat chatter, and share dice rolls.',
      route: '/comms',
      icon: Radio,
      badge: 'CommLink Relay',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
      btnColor: 'bg-rose-600 hover:bg-rose-500 text-white',
      iconColor: 'text-rose-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]'
    },
    {
      id: 'stage',
      title: 'The Stage VTT',
      subtitle: 'Tactical Battlemap Engine',
      desc: 'Deploy to the 5ft encounter battlemap featuring real-time Line of Sight, dynamic Fog of War, and turn automation.',
      route: '/stage',
      icon: Tv2,
      badge: 'Tactical Combat',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
      iconColor: 'text-amber-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]'
    },
    {
      id: 'compendium',
      title: 'Omnicortex & Codex',
      subtitle: 'Lore, Rules & Equipment',
      desc: 'Explore 101 species, weapons, armor, vehicles, cybernetics, and the canonical 2d10 dual resolution mechanics.',
      route: '/compendium',
      icon: BookOpen,
      badge: 'Rules & Reference',
      borderColor: 'border-sky-500/40 hover:border-sky-400',
      badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
      btnColor: 'bg-sky-600 hover:bg-sky-500 text-white',
      iconColor: 'text-sky-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]'
    },
    {
      id: 'foundry',
      title: 'Story Foundry & ADE',
      subtitle: 'Narrative & Worldbuilding',
      desc: 'Weave branching story modules, compile element codices, and draft tactical maps with BASTION and AIME AI guidance.',
      route: '/foundry',
      icon: Sparkles,
      badge: 'Creative Engine',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      iconColor: 'text-purple-400',
      glowColor: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.2)]'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-[#0e131d]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-cyan-500/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
            <Terminal size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider text-cyan-300 uppercase">
                TACTICAL BRIEFING // WELCOME OPERATIVE
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Tangent SF Science-Fantasy RPG Engine initialized. Select a deployment pathway below to begin:
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismissForever}
          className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
          title="Dismiss Briefing"
        >
          <X size={16} />
        </button>
      </div>

      {/* 6 Pathway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {pathways.map((pw) => {
          const Icon = pw.icon;
          return (
            <div
              key={pw.id}
              onClick={() => handlePathwayClick(pw.route)}
              className={`p-3.5 sm:p-4 rounded-xl bg-[#121722]/80 border ${pw.borderColor} hover:bg-[#151c2a] transition-all cursor-pointer flex flex-col justify-between gap-2.5 group shadow-sm ${pw.glowColor || 'hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-slate-900/90 ${pw.iconColor || 'text-cyan-300'} border border-slate-700/60 group-hover:scale-105 transition-transform`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {pw.title}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${pw.badgeColor}`}>
                    {pw.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {pw.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {pw.subtitle}
                </span>
                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${pw.btnColor} shadow-sm group-hover:translate-x-0.5 transition-transform`}>
                  <span>Deploy</span>
                  <ChevronRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tactical Shortcuts Banner */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d16] border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">Tactical Keys:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
              <Dices size={11} className="text-amber-400" />
              <span>Alt+D Dice Dock</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
              <Radio size={11} className="text-rose-400" />
              <span>Alt+C Comms</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
              <Command size={11} className="text-cyan-400" />
              <span>Ctrl+K Command</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-user-guide'))}
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
        >
          <HelpCircle size={12} />
          <span>Full Manual</span>
        </button>
      </div>

      {/* Footer / Dismissal */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
        <span>You can reopen this briefing anytime from the Home page.</span>
        <button
          type="button"
          onClick={handleDismissForever}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white uppercase font-bold text-[10px] transition-colors cursor-pointer"
        >
          Got It, Dismiss Briefing
        </button>
      </div>
    </div>
  );
};

export default WelcomeBriefing;
