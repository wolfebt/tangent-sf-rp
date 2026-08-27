import React from 'react';
import { Activity, Dices, Sparkles, BookOpen, Database, Radio } from 'lucide-react';

export const TransmissionFeed = ({ recentActivities = [] }) => {
  const defaultFeed = [
    { id: '1', type: 'roll', text: 'Tactical Check: Vance Kael rolled 2d10+4 = 19 (Critical Success)', time: '4m ago' },
    { id: '2', type: 'story', text: 'Scenario "Sub-level Infiltration" synced by Architect', time: '22m ago' },
    { id: '3', type: 'aime', text: 'AIME generated 3 Scene Beats for Act II: Station Core', time: '1h ago' },
    { id: '4', type: 'dbm', text: 'Omnicortex rules database synced to version 2.4', time: '3h ago' },
    { id: '5', type: 'system', text: 'Local IndexedDB operational cache verified & active', time: '5h ago' }
  ];

  const feedItems = recentActivities.length > 0 ? recentActivities : defaultFeed;

  const getIcon = (type) => {
    switch (type) {
      case 'roll':
        return <Dices size={14} className="text-amber-400 shrink-0" />;
      case 'aime':
        return <Sparkles size={14} className="text-purple-400 shrink-0" />;
      case 'story':
      case 'node':
        return <BookOpen size={14} className="text-cyan-400 shrink-0" />;
      case 'dbm':
      case 'rules':
        return <Database size={14} className="text-emerald-400 shrink-0" />;
      default:
        return <Activity size={14} className="text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900/15 hover:bg-slate-900/85 backdrop-blur-md p-5 rounded-xl border border-slate-800 hover:border-emerald-400/50 h-full flex flex-col justify-between transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="text-emerald-400 animate-pulse" size={17} />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
              TRANSMISSION & EVENT LOG
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            FEED LIVE
          </span>
        </div>

        {/* Stream List */}
        <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/70 hover:border-slate-700 flex items-start gap-2.5 text-xs transition-colors"
            >
              <div className="mt-0.5 p-1 rounded bg-slate-800/80 border border-slate-700/50">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 leading-snug text-[12px]">{item.text}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>CHANNEL: 104.9 MHz (ENCRYPTED)</span>
        <span>TELEMETRY STABLE</span>
      </div>
    </div>
  );
};

export default TransmissionFeed;
