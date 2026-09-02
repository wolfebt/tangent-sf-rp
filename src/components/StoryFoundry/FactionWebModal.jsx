import React, { useState } from 'react';
import {
  CANONICAL_FACTIONS,
  CANONICAL_RELATIONSHIPS,
  getHeatDefinition,
  adjustPartyReputation
} from '../../services/factionWebService';
import AudioService from '../../services/audioService';

const FactionWebModal = ({
  isOpen,
  onClose,
  onBroadcastMessage
}) => {
  const [selectedFactionId, setSelectedFactionId] = useState('tsc_directorate');
  const [partyHeat, setPartyHeat] = useState(1);
  const [factionReps, setFactionReps] = useState({
    tsc_directorate: 1,
    hyperion_consortium: 0,
    smuggler_syndicate: -1,
    astraea_synthetics: 2,
    kitin_hive_swarm: -3
  });

  const selectedFaction = CANONICAL_FACTIONS.find(f => f.id === selectedFactionId) || CANONICAL_FACTIONS[0];
  const currentHeatDef = getHeatDefinition(partyHeat);
  const currentRepValue = factionReps[selectedFaction.id] !== undefined ? factionReps[selectedFaction.id] : 0;
  const currentRep = adjustPartyReputation(currentRepValue, 0);

  if (!isOpen) return null;

  const handleAdjustHeat = (delta) => {
    AudioService.playTerminalBeep(delta > 0 ? 440 : 880, 0.1);
    const next = Math.max(0, Math.min(5, partyHeat + delta));
    setPartyHeat(next);

    const def = getHeatDefinition(next);
    if (onBroadcastMessage) {
      onBroadcastMessage(`[PARTY HEAT UPDATE]: Party Heat shifted to ${def.stars} (${def.label}) — ${def.description}`);
    }
  };

  const handleAdjustReputation = (delta) => {
    AudioService.playTerminalBeep(delta > 0 ? 980 : 520, 0.1);
    const nextObj = adjustPartyReputation(currentRepValue, delta);
    setFactionReps(prev => ({
      ...prev,
      [selectedFaction.id]: nextObj.reputation
    }));

    if (onBroadcastMessage) {
      onBroadcastMessage(`[FACTION REPUTATION]: Standing with ${selectedFaction.name} updated to ${nextObj.tierLabel}`);
    }
  };

  // Node positions on circular SVG graph
  const nodePositions = {
    tsc_directorate: { x: 200, y: 70 },
    hyperion_consortium: { x: 330, y: 150 },
    smuggler_syndicate: { x: 280, y: 280 },
    astraea_synthetics: { x: 120, y: 280 },
    kitin_hive_swarm: { x: 70, y: 150 }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-fadeIn">
      <div className="bg-[#0e131e] border border-purple-500/70 rounded-xl p-5 w-full max-w-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] text-white flex flex-col gap-4 max-h-[85vh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-purple-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-purple-300">
                  Faction Relational Web &amp; Party Heat
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-950 border border-purple-500/60 text-purple-200">
                  POLITICAL MATRIX
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interstellar Geopolitics, Bilateral Treaties &amp; Wanted Heat Level
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Global Party Heat HUD */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Interstellar Wanted Level:</span>
              <span className="text-base font-bold font-mono tracking-widest text-amber-400">{currentHeatDef.stars}</span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded border" style={{ color: currentHeatDef.color, borderColor: `${currentHeatDef.color}60` }}>
                {currentHeatDef.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{currentHeatDef.description}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleAdjustHeat(-1)}
              disabled={partyHeat <= 0}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded text-xs font-bold cursor-pointer transition-colors"
              title="Lay Low / Reduce Party Heat"
            >
              -1 Heat
            </button>
            <button
              type="button"
              onClick={() => handleAdjustHeat(1)}
              disabled={partyHeat >= 5}
              className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 disabled:opacity-30 text-white rounded text-xs font-bold cursor-pointer transition-colors"
              title="Commit High-Profile Crime / Increase Heat"
            >
              +1 Heat
            </button>
          </div>
        </div>

        {/* Network Graph (Left) & Faction Dossier (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* SVG Relational Web Canvas */}
          <div className="bg-[#070a12] rounded-xl border border-purple-950 p-2 relative h-[320px] flex items-center justify-center shadow-inner overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 350">
              {/* Relationship Connecting Lines */}
              {CANONICAL_RELATIONSHIPS.map((rel, idx) => {
                const posA = nodePositions[rel.from];
                const posB = nodePositions[rel.to];
                if (!posA || !posB) return null;

                return (
                  <line
                    key={idx}
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke={rel.color}
                    strokeWidth={rel.status === 'war' ? '3' : '1.5'}
                    strokeDasharray={rel.status === 'war' ? '4 4' : 'none'}
                    className="opacity-70"
                  />
                );
              })}

              {/* Faction Circular Nodes */}
              {CANONICAL_FACTIONS.map(fac => {
                const pos = nodePositions[fac.id] || { x: 200, y: 175 };
                const isSelected = fac.id === selectedFactionId;

                return (
                  <g
                    key={fac.id}
                    onClick={() => {
                      AudioService.playTerminalBeep(750, 0.08);
                      setSelectedFactionId(fac.id);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 26 : 22}
                      fill="#0f172a"
                      stroke={fac.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all duration-200 group-hover:scale-110"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 6}
                      textAnchor="middle"
                      fontSize="18"
                      className="pointer-events-none"
                    >
                      {fac.icon}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 36}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isSelected ? '#c084fc' : '#94a3b8'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none font-mono"
                    >
                      {fac.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Faction Dossier & Standing Stepper */}
          {selectedFaction && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedFaction.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-purple-300">{selectedFaction.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedFaction.type}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/60 font-bold">
                  Law {selectedFaction.lawLevel}
                </span>
              </div>

              {/* Faction Details */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Home System:</span>
                  <span className="text-amber-300 font-bold">{selectedFaction.homeSystem}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block">Major Assets:</span>
                  <span className="text-cyan-300 font-bold line-clamp-1">{selectedFaction.assets}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {selectedFaction.description}
              </p>

              {/* Party Standing Stepper */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-900/50 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Party Standing Tier:</span>
                  <span className={`text-xs font-mono font-bold ${
                    currentRep.isAllied ? 'text-cyan-400' : currentRep.isHostile ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {currentRep.tierLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">Reputation: {currentRepValue >= 0 ? `+${currentRepValue}` : currentRepValue}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustReputation(-1)}
                      disabled={currentRepValue <= -3}
                      className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      -1 Rep
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustReputation(1)}
                      disabled={currentRepValue >= 3}
                      className="px-2.5 py-0.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-black rounded text-[10px] font-bold cursor-pointer"
                    >
                      +1 Rep
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Faction Web
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactionWebModal;
