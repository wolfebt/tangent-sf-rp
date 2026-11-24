/**
 * @file StageTopHudBar.tsx
 * @description Extracted Pro Stage Tactical Toolbar (Live Sync Telemetry, Multi-Spectrum Sensor Vision,
 *   Measured AoE Blast Picker, 3-Tier Fog Controls, 3-Bus Audio Mixer, Operative Handouts,
 *   and Floating Resolve AoE Blast Action Chip).
 */

import React from 'react';
import {
  Flame,
  Eye,
  Radio,
  CheckCircle2,
  Volume2,
  CloudFog,
  Send
} from 'lucide-react';

export interface StageSyncStatusSummary {
  mode: string;
  peerCount: number;
  epoch: number;
}

export interface SensorModeOption {
  id: string;
  icon: string;
  name: string;
}

export interface AoEPresetOption {
  id: string;
  icon: string;
  label: string;
}

export interface StageTopHudBarProps {
  isZenMode: boolean;
  syncStatus: StageSyncStatusSummary;
  activeSensorMode: string;
  sensorModes: Record<string, SensorModeOption>;
  onChangeSensorMode: (mode: string) => void;
  isAoEMode: boolean;
  onToggleAoEMode: () => void;
  selectedAoEPresetId: string;
  onSelectAoEPresetId: (id: string) => void;
  aoePresets: AoEPresetOption[];
  isFogEnabled: boolean;
  onToggleFog: () => void;
  fogBrushMode?: 'none' | 'reveal' | 'hide';
  onSetFogBrushMode?: (mode: 'none' | 'reveal' | 'hide') => void;
  onRevealAllFog: () => void;
  onResetFog: () => void;
  isArchitectRole?: boolean;
  onOpenAudioMixer: () => void;
  onOpenHandoutPush: () => void;
  aoeOrigin: { x: number; y: number } | null;
  hasCommittedTemplate: boolean;
  activeAoEPreset: { icon: string; label: string } | null | undefined;
  aoeAffectedCount: number;
  onResolveAoE: () => void;
  onClearAoE: () => void;
}

export const StageTopHudBar: React.FC<StageTopHudBarProps> = ({
  isZenMode,
  syncStatus,
  activeSensorMode,
  sensorModes,
  onChangeSensorMode,
  isAoEMode,
  onToggleAoEMode,
  selectedAoEPresetId,
  onSelectAoEPresetId,
  aoePresets,
  isFogEnabled,
  onToggleFog,
  fogBrushMode = 'none',
  onSetFogBrushMode,
  onRevealAllFog,
  onResetFog,
  isArchitectRole = true,
  onOpenAudioMixer,
  onOpenHandoutPush,
  aoeOrigin,
  hasCommittedTemplate,
  activeAoEPreset,
  aoeAffectedCount,
  onResolveAoE,
  onClearAoE
}) => {
  return (
    <>
      {!isZenMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[108] flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl pointer-events-auto font-mono text-[11px]">
          {/* Live Sync Telemetry Pill */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
              syncStatus.mode !== 'local'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
            title={`Multiplayer Mode: ${syncStatus.mode} | Epoch #${syncStatus.epoch}`}
          >
            <Radio
              size={11}
              className={syncStatus.mode !== 'local' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}
            />
            <span>
              {syncStatus.mode === 'livekit+firestore'
                ? `SYNC LIVE+CLOUD (${syncStatus.peerCount})`
                : syncStatus.mode === 'livekit'
                  ? `SYNC LIVEKIT (${syncStatus.peerCount})`
                  : 'SYNC LOCAL'}
            </span>
          </div>

          {/* Multi-Spectrum Sensor Vision Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-0.5">
            <Eye size={11} className="text-cyan-400 shrink-0" />
            <select
              aria-label="Sensor Vision Mode"
              value={activeSensorMode}
              onChange={(e) => onChangeSensorMode(e.target.value)}
              className="bg-transparent text-slate-200 text-[10px] font-bold outline-none cursor-pointer"
            >
              {Object.values(sensorModes).map((sm) => (
                <option key={sm.id} value={sm.id} className="bg-slate-950 text-slate-200">
                  {sm.icon} {sm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Measured AoE Blast Tool (Architect only) */}
          {isArchitectRole && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleAoEMode}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  isAoEMode
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50'
                }`}
                title="Toggle Measured AoE Template Tool (Drag/Click on Canvas)"
              >
                <Flame size={11} className="text-amber-400" />
                <span>AoE</span>
              </button>

              {isAoEMode && (
                <select
                  aria-label="AoE Template Preset"
                  value={selectedAoEPresetId}
                  onChange={(e) => onSelectAoEPresetId(e.target.value)}
                  className="bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-0.5 text-[10px] text-amber-200 outline-none cursor-pointer max-w-[160px]"
                >
                  {aoePresets.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200">
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Persistent Explored Fog Toggle (Architect only) */}
          {isArchitectRole && (
            <>
              <button
                type="button"
                onClick={onToggleFog}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  isFogEnabled
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50'
                }`}
                title="Toggle 3-Tier Persistent Fog-of-War & Memory Shroud"
              >
                <CloudFog size={11} className="text-cyan-400" />
                <span>Fog</span>
              </button>

              {isFogEnabled && (
                <div className="flex items-center gap-1">
                  {onSetFogBrushMode && (
                    <>
                      <button
                        type="button"
                        onClick={() => onSetFogBrushMode(fogBrushMode === 'reveal' ? 'none' : 'reveal')}
                        className={`px-1.5 py-0.5 rounded border text-[9px] cursor-pointer ${
                          fogBrushMode === 'reveal'
                            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300'
                        }`}
                        title="Drag box on Stage to Reveal Fog"
                      >
                        Reveal Box
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetFogBrushMode(fogBrushMode === 'hide' ? 'none' : 'hide')}
                        className={`px-1.5 py-0.5 rounded border text-[9px] cursor-pointer ${
                          fogBrushMode === 'hide'
                            ? 'bg-amber-950/90 border-amber-400 text-amber-200 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                        }`}
                        title="Drag box on Stage to Hide Fog"
                      >
                        Hide Box
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={onRevealAllFog}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] text-emerald-300 cursor-pointer"
                    title="Reveal Entire Map"
                  >
                    Reveal
                  </button>
                  <button
                    type="button"
                    onClick={onResetFog}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] text-rose-300 cursor-pointer"
                    title="Reset Explored Fog"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* 3-Bus Audio Mixer Trigger */}
              <button
                type="button"
                onClick={onOpenAudioMixer}
                className="px-2 py-0.5 rounded-lg border bg-slate-900 border-slate-700 hover:border-purple-400/60 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="Open 3-Bus Audio Mixer & Soundboard"
              >
                <Volume2 size={11} className="text-purple-400" />
                <span>Audio</span>
              </button>

              {/* Push Handout Trigger */}
              <button
                type="button"
                onClick={onOpenHandoutPush}
                className="px-2 py-0.5 rounded-lg border bg-slate-900 border-slate-700 hover:border-amber-400/60 text-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                title="Push Handout / Clue to Operatives"
              >
                <Send size={11} className="text-amber-400" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Resolve AoE Blast Floating Action Chip */}
      {aoeOrigin && hasCommittedTemplate && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[118] bg-slate-950/95 border border-amber-400/70 rounded-2xl px-4 py-2 shadow-[0_0_24px_rgba(245,158,11,0.35)] backdrop-blur-md flex items-center gap-3 pointer-events-auto font-mono text-xs">
          <span className="text-amber-300 font-bold">
            {activeAoEPreset?.icon ?? ''} {activeAoEPreset?.label ?? 'AoE Blast'}
          </span>
          <button
            type="button"
            onClick={onResolveAoE}
            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black uppercase text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>
              Resolve AoE Blast ({aoeAffectedCount} Target{aoeAffectedCount === 1 ? '' : 's'})
            </span>
          </button>
          <button
            type="button"
            onClick={onClearAoE}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default StageTopHudBar;
