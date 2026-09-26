import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  X, 
  Copy, 
  Check, 
  Filter, 
  Terminal, 
  Clock 
} from 'lucide-react';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';
import { AudioService } from '../../services/audioService';

export interface PersonaLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaId: string;
  personaName?: string;
  species?: string;
  archetype?: string;
  techLevel?: number;
  currentHP?: number;
  maxHP?: number;
}

export const PersonaLogModal: React.FC<PersonaLogModalProps> = ({
  isOpen,
  onClose,
  personaId,
  personaName = 'Operative',
  species = 'Alterian',
  archetype = 'Infiltrator',
  techLevel = 3,
  currentHP = 30,
  maxHP = 30
}) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'checks' | 'vitals' | 'gear'>('checks');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !personaId) return;

    // Real-time subscription to persona telemetry
    const unsubscribe = PersonaLogService.subscribeToPersonaLog(personaId, (newLogs: any[]) => {
      setLogs(newLogs);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen, personaId]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'checks') {
      return log.actionType === ACTION_TYPES.SKILL_CHECK || 
             log.actionType === ACTION_TYPES.ATTR_CHECK || 
             log.actionType === ACTION_TYPES.ATTACK_ROLL;
    }
    if (activeFilter === 'vitals') {
      return log.actionType === ACTION_TYPES.VITALS_CHANGE || 
             log.actionType === ACTION_TYPES.STATUS_CHANGE;
    }
    if (activeFilter === 'gear') {
      return log.actionType === ACTION_TYPES.GEAR_CHANGE || 
             log.actionType === ACTION_TYPES.REST_CYCLE ||
             log.actionType === ACTION_TYPES.VTT_ACTION;
    }
    return true;
  });

  const handleCopy = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    const text = logs.map(l => `[${l.createdLocalAt || ''}] [${l.actionType || 'LOG'}] ${l.summary || l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (log: any) => {
    if (log.createdLocalAt) {
      return new Date(log.createdLocalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (log.createdAt?.toDate) {
      return log.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans select-none">
      <div className="bg-[#0b1019] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in fade-in zoom-in duration-150 text-slate-200">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
              <Activity size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-bold font-mono text-white tracking-wide truncate">
                  OPERATIVE TELEMETRY: {personaName}
                </h2>
                <span className="px-1.5 sm:px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold shrink-0">
                  TL{techLevel}
                </span>
                <span className="px-1.5 sm:px-2 py-0.2 rounded-full bg-amber-950/80 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold uppercase shrink-0 hidden sm:inline">
                  GM BLACKBOX
                </span>
              </div>
              <p className="text-[10px] sm:text-[10.5px] text-slate-400 font-mono mt-0.5 truncate">
                {species} • {archetype} | HP: {currentHP}/{maxHP}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Telemetry to Clipboard"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="hidden sm:inline">{copied ? 'COPIED' : 'EXPORT'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Telemetry Log"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono shrink-0 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">FILTER:</span>
            {[
              { id: 'checks', label: 'CHECKS & ROLLS' },
              { id: 'vitals', label: 'VITALS & STATUS' },
              { id: 'gear', label: 'ACTIONS & GEAR' },
              { id: 'all', label: `ALL (${logs.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  AudioService.playTerminalBeep(1100, 0.02);
                  setActiveFilter(f.id as any);
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ENGINE STREAM SYNCED</span>
          </div>
        </div>

        {/* Telemetry Stream */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5 font-mono text-xs no-scrollbar bg-slate-950/40">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Terminal size={28} className="mx-auto text-slate-600 animate-pulse" />
              <p className="text-slate-400 font-bold">No telemetry recorded for this operative yet.</p>
              <p className="text-[11px] text-slate-600">
                Checks rolled in Folio or Comms and vitals changes during the session will stream here automatically.
              </p>
            </div>
          ) : (
            filteredLogs.map((entry, idx) => {
              const aType = entry.actionType || 'LOG';
              const isVitals = aType === ACTION_TYPES.VITALS_CHANGE;
              const isSkill = aType === ACTION_TYPES.SKILL_CHECK || aType === ACTION_TYPES.ATTR_CHECK;
              const isAttack = aType === ACTION_TYPES.ATTACK_ROLL;
              const isGear = aType === ACTION_TYPES.GEAR_CHANGE;

              return (
                <div 
                  key={entry.id || idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        isVitals
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : isSkill
                          ? 'bg-blue-950 text-blue-300 border-blue-500/50'
                          : isAttack
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : isGear
                          ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                          : 'bg-slate-950 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {aType.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 text-[10px]">by {entry.senderHandle || 'SYSTEM'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                      <Clock size={10} />
                      <span>{formatTimestamp(entry)}</span>
                    </div>
                  </div>

                  <p className="text-slate-200 font-medium text-xs leading-relaxed">
                    {entry.summary || entry.text}
                  </p>

                  {entry.details && (
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[10.5px] text-slate-300">
                      {typeof entry.details === 'object' ? (
                        <pre className="whitespace-pre-wrap font-mono text-[10px] text-cyan-300/90">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      ) : (
                        <span>{entry.details}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
          <span>TANGENT ENGINE BLACKBOX AUDIT RELAY</span>
          <span className="text-cyan-400 font-bold">OPERATIVE ID: {personaId.substring(0, 16)}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonaLogModal;
