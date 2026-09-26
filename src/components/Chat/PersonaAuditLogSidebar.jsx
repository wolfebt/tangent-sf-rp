import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Filter, 
  Terminal, 
  Clock, 
  Copy, 
  Check, 
  Shield, 
  Heart, 
  Dices, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';
import { AudioService } from '../../services/audioService';

/**
 * @component PersonaAuditLogSidebar
 * @description Dedicated side-panel for the AUDIT / logs tab in CommsPage and CommLinkDock.
 * Provides real-time telemetry streaming of active persona actions, dice checks,
 * vitals fluctuations, and combat events.
 */
export const PersonaAuditLogSidebar = ({ isCompact = false }) => {
  const { activePersona, personaRoster = [], roster = [] } = useFolio() || {};
  const { userHandle } = useAuth() || {};

  const currentPersona = activePersona || personaRoster[0] || roster[0] || null;
  const personaId = currentPersona?.id || currentPersona?.characterId || null;

  const [logs, setLogs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'checks' | 'vitals' | 'combat'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!personaId) {
      setLogs([]);
      return;
    }

    // Subscribe to persona telemetry logs in real time
    const unsubscribe = PersonaLogService.subscribeToPersonaLog(personaId, (incomingLogs) => {
      setLogs(incomingLogs || []);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [personaId]);

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'checks') {
      return log.actionType === ACTION_TYPES.SKILL_CHECK || log.actionType === ACTION_TYPES.ATTR_CHECK;
    }
    if (activeFilter === 'combat') {
      return log.actionType === ACTION_TYPES.ATTACK_ROLL || log.actionType === ACTION_TYPES.STATUS_CHANGE;
    }
    if (activeFilter === 'vitals') {
      return log.actionType === ACTION_TYPES.VITALS_CHANGE || log.actionType === ACTION_TYPES.REST_CYCLE;
    }
    return true;
  });

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const textData = logs.map(l => {
      const time = l.timestamp?.toDate ? l.timestamp.toDate().toLocaleTimeString() : new Date(l.timestamp || Date.now()).toLocaleTimeString();
      return `[${time}] ${l.actionType}: ${l.description || l.title || ''}`;
    }).join('\n');

    navigator.clipboard.writeText(textData);
    AudioService.playTerminalBeep(1200, 0.02);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (actionType) => {
    switch (actionType) {
      case ACTION_TYPES.SKILL_CHECK:
      case ACTION_TYPES.ATTR_CHECK:
        return { label: 'CHECK', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case ACTION_TYPES.ATTACK_ROLL:
        return { label: 'ATTACK', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case ACTION_TYPES.VITALS_CHANGE:
        return { label: 'VITALS', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case ACTION_TYPES.STATUS_CHANGE:
        return { label: 'STATUS', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: actionType || 'EVENT', color: 'bg-slate-700/40 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#070b12] text-slate-100 border-r border-slate-800 font-sans select-none overflow-hidden">
      {/* ── Sub-Panel Header ── */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Activity size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wider truncate">
              AUDIT TELEMETRY
            </h3>
            <span className="text-[10px] font-mono text-slate-500 block truncate">
              {currentPersona ? currentPersona.name : 'System Telemetry'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 disabled:opacity-40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Copy Telemetry Log"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* ── Active Persona Header Chip ── */}
      <div className="p-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between font-mono text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10.5px] font-bold text-cyan-300 shrink-0">
            {(currentPersona?.name || 'OP').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-200 block truncate text-[11px]">
              {currentPersona?.name || 'Local Operative'}
            </span>
            <span className="text-[9.5px] text-slate-400 block truncate">
              {currentPersona?.archetype || currentPersona?.species || 'Active Persona'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[9.5px] text-emerald-400 font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>BLACKBOX LIVE</span>
        </div>
      </div>

      {/* ── Filter Buttons ── */}
      <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-1 font-mono text-[10px] shrink-0 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'ALL' },
          { id: 'checks', label: 'CHECKS' },
          { id: 'combat', label: 'COMBAT' },
          { id: 'vitals', label: 'VITALS' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.015);
              setActiveFilter(f.id);
            }}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              activeFilter === f.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Log Stream ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, idx) => {
            const badge = getActionBadge(log.actionType);
            const timeStr = (() => {
              try {
                const d = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp ? new Date(log.timestamp) : new Date());
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              } catch {
                return '';
              }
            })();

            return (
              <div
                key={log.id || idx}
                className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-1.5 py-0.2 rounded font-bold border text-[9px] ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-slate-500 text-[9.5px] flex items-center gap-1">
                    <Clock size={10} />
                    <span>{timeStr}</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-200 font-sans leading-relaxed pt-0.5">
                  {log.description || log.text || log.title || 'Telemetry entry recorded.'}
                </p>

                {log.detail && (
                  <div className="p-1 rounded bg-slate-900/80 border border-slate-800/80 text-[10px] text-cyan-300/90 font-mono">
                    {log.detail}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
            <Terminal size={24} className="text-slate-600" />
            <span className="font-bold text-slate-400">TELEMETRY BEACON STANDBY</span>
            <span className="text-[10.5px] text-slate-500 font-sans">
              Action rolls, vitals adjustments, and tactical checks will stream into this audit record in real-time.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaAuditLogSidebar;
