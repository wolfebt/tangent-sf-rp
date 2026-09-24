/**
 * @file ADEScenarioStageDrawer.tsx
 * @description In-Situ ADE Scenario Cockpit Drawer for The Stage VTT.
 * Keeps the GM and Tabletop fully synchronized with ADE story text, read-aloud prose,
 * scene beats, and story element components.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Box, 
  Layers, 
  Flag 
} from 'lucide-react';
import { AudioService } from '../../../services/audioService';
import { useCampaign } from '../../../context/CampaignContext';
import { VttEventBus } from '../../../utils/vttEventBus';

export interface ADEScenarioStageDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeScenarioId?: string;
  onDeployElement?: (element: any) => void;
  onDeployAllElements?: (elements: any[]) => void;
  isInline?: boolean;
}

export const ADEScenarioStageDrawer: React.FC<ADEScenarioStageDrawerProps> = ({
  isOpen = true,
  onClose,
  activeScenarioId,
  onDeployElement,
  onDeployAllElements,
  isInline = false
}) => {
  const navigate = useNavigate();
  const { universeState, elementsCatalog } = useCampaign();

  const scenarios = universeState?.scenarios || [];
  const activeScenario = scenarios.find((s: any) => s.id === activeScenarioId) || scenarios[0] || null;
  const scenarioId = activeScenario?.id;

  const linkedElementIds: string[] = activeScenario?.linkedElements || [];
  const linkedElements = (elementsCatalog || []).filter((e: any) => linkedElementIds.includes(e.id));

  // Parse beats from scenario fields or outline
  const rawBeats = activeScenario?.fields?.sceneBeats || universeState?.creativeState?.sceneBeats || '';
  const beatsList = rawBeats
    .split('\n')
    .map((b: string) => b.trim())
    .filter((b: string) => b.length > 0);

  // Completed beats persistent state per scenario
  const [completedBeats, setCompletedBeats] = useState<Set<number>>(() => {
    if (!scenarioId) return new Set();
    try {
      const raw = localStorage.getItem(`tangent_vtt_beats_${scenarioId}`);
      const arr: number[] = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  // Persist completed beats whenever set or active scenario changes
  useEffect(() => {
    if (!scenarioId) return;
    try {
      localStorage.setItem(
        `tangent_vtt_beats_${scenarioId}`,
        JSON.stringify(Array.from(completedBeats))
      );
    } catch (e) {
      console.warn('[ADEScenarioStageDrawer] Failed to persist beats:', e);
    }
  }, [completedBeats, scenarioId]);

  // Re-sync beats when scenarioId switches
  useEffect(() => {
    if (!scenarioId) return;
    try {
      const raw = localStorage.getItem(`tangent_vtt_beats_${scenarioId}`);
      const arr: number[] = raw ? JSON.parse(raw) : [];
      setCompletedBeats(new Set(arr));
    } catch {
      setCompletedBeats(new Set());
    }
  }, [scenarioId]);

  const toggleBeat = (idx: number) => {
    AudioService.playTerminalBeep(1200, 0.03);
    setCompletedBeats(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const handleBroadcastMilestone = () => {
    AudioService.playCriticalChime(true);
    VttEventBus.emit('story-foundry-milestone-reached', {
      scenarioId: activeScenario?.id,
      scenarioTitle: activeScenario?.title,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const containerClasses = isInline
    ? "w-full h-full flex flex-col font-mono text-slate-200 select-none bg-[#0c1017] overflow-hidden"
    : "fixed inset-y-0 left-0 sm:left-20 z-[120] w-96 max-w-[90vw] bg-[#0c1017]/98 border-r border-purple-500/40 shadow-2xl backdrop-blur-2xl flex flex-col font-mono text-slate-200 select-none animate-in slide-in-from-left duration-200";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-950 via-[#0a0f18] to-purple-950/60 border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-sm">
            <BookOpen size={14} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-purple-200 tracking-wider">
              ADE SCENARIO DECK
            </h3>
            <p className="text-[9px] text-slate-400 truncate max-w-[200px]">
              {activeScenario?.title || 'Tactical Sector Story'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1100, 0.03);
              navigate(`/foundry/ade?storyId=${universeState?.id || ''}&scenarioId=${activeScenario?.id || ''}`);
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-700 hover:border-purple-500 transition-colors cursor-pointer"
            title="Open in ADE Studio Story Weaver"
          >
            <ExternalLink size={13} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs scrollbar-thin">
        {/* Scenario Identity Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span>🎯</span> Mission Objective:
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              {activeScenario?.type || 'Scenario'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {activeScenario?.fields?.goal || activeScenario?.fields?.summary || 'Infiltrate objective sector and engage primary targets.'}
          </p>
        </div>

        {/* GM Sensory Read-Aloud Boxed Text */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-400" />
            <span>GM Sensory Read-Aloud:</span>
          </span>
          <div className="text-[10.5px] text-slate-300 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-cyan-950 font-sans">
            {activeScenario?.content 
              ? activeScenario.content.replace(/<[^>]+>/g, ' ') 
              : 'The air hums with electromagnetic discharge. Shadows stretch long across reinforced bulkheads as warning klaxons pulse in distant corridors.'}
          </div>
        </div>

        {/* Sequential Scene Beats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} className="text-purple-400" />
              <span>Tactical Scene Beats ({beatsList.length}):</span>
            </span>
          </div>

          {beatsList.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic">No scene beats defined yet in ADE.</p>
          ) : (
            <div className="space-y-1.5">
              {beatsList.map((beat: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => toggleBeat(idx)}
                  className={`p-2 rounded-lg border transition-all flex items-start gap-2 cursor-pointer ${
                    completedBeats.has(idx)
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 line-through opacity-70'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {completedBeats.has(idx) ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={13} className="text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <span className="text-[10px] leading-tight font-sans">{beat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Story Elements (Characters, Items, Props, Hazards) */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Box size={11} className="text-amber-400" />
              <span>Linked Elements ({linkedElements.length}):</span>
            </span>
            {linkedElements.length > 0 && onDeployAllElements && (
              <button
                type="button"
                onClick={() => {
                  AudioService.playCriticalChime(true);
                  onDeployAllElements(linkedElements);
                }}
                className="text-[9px] px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer shadow-xs"
              >
                Deploy All
              </button>
            )}
          </div>

          {linkedElements.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic">No elements linked to this scenario yet.</p>
          ) : (
            <div className="space-y-1.5">
              {linkedElements.map((elem: any) => (
                <div
                  key={elem.id}
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm">{elem.icon || '📦'}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-200 truncate">{elem.title}</div>
                      <div className="text-[9px] text-slate-400">{elem.type} • {elem.fields?.species || elem.category || 'Asset'}</div>
                    </div>
                  </div>

                  {onDeployElement && (
                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playCriticalChime(true);
                        onDeployElement(elem);
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[9px] font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Deploy
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Trigger Milestone & Reset Beats */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleBroadcastMilestone}
          className="flex-1 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          title="Broadcast story milestone event to ADE Story Weaver and Cronicle"
        >
          <Flag size={11} className="text-purple-400" />
          <span>Trigger Milestone</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCompletedBeats(new Set());
            if (scenarioId) localStorage.removeItem(`tangent_vtt_beats_${scenarioId}`);
            AudioService.playTerminalBeep(900, 0.03);
          }}
          className="px-2.5 py-1.5 rounded-xl text-[10px] text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/50 font-mono transition-colors cursor-pointer"
          title="Reset completed scene beats for this scenario"
        >
          Reset Beats
        </button>
      </div>
    </div>
  );
};

export default ADEScenarioStageDrawer;
