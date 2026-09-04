/**
 * @file AimeCockpitDeck.tsx
 * @description In-VTT Operational AIME Co-Pilot Panel for CockpitPanel.tsx.
 * Delivers real-time room read-alouds, tactical adversary combat barks,
 * rules-to-prose transmutation, and atmospheric sound directing directly at the VTT table.
 */

import React, { useState } from 'react';
import { Sparkles, Radio, Volume2, Send, Check, RefreshCw } from 'lucide-react';
import { getTacticalBark, BARK_CATEGORIES } from '../../../services/tacticalBarksService';
import { AudioService } from '../../../services/audioService';
import { useCampaign } from '../../../context/CampaignContext';
import { useEngineStore } from '../../../engine/state/VolatileSharder';

export const AimeCockpitDeck: React.FC = () => {
  const { universeState } = useCampaign();
  const ephemeralData = useEngineStore((s) => s.ephemeralData);
  const staticData = useEngineStore((s) => s.staticData);

  const [activeTab, setActiveTab] = useState<'barks' | 'room' | 'transmute'>('barks');
  const [selectedBarkCategory, setSelectedBarkCategory] = useState<string>('engaging');
  const [npcSpeakerName, setNpcSpeakerName] = useState<string>('Enforcer 01');
  const [latestNarration, setLatestNarration] = useState<string>(
    'AIME Tactical Narrative Engine active. Ready to synthesize sensory room descriptions, radio barks, and rules transmutation.'
  );
  const [customCheckText, setCustomCheckText] = useState<string>('Called shot to optic sensors breaches Kinetic DR 6');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Active map title
  const activeMapTitle = universeState?.maps?.find((m: any) => m.id === universeState?.activeMapId)?.title || 'Tactical Sector';

  const handleGenerateBark = (cat?: string) => {
    const category = cat || selectedBarkCategory;
    const selectedTokenId = Object.keys(ephemeralData).find(id => ephemeralData[id]?.is_selected);
    const tokenData = selectedTokenId ? staticData[selectedTokenId] : null;
    const speaker = tokenData?.name || npcSpeakerName || 'Unit';

    const bark = getTacticalBark(category, speaker);
    setLatestNarration(bark.quote);
  };

  const handleGenerateRoomDescription = () => {
    AudioService.playTerminalBeep(920, 0.05);
    const roomSensoryPresets = [
      `Atmospheric pressure in ${activeMapTitle} drops sharply. The hum of industrial conduits echoes through reinforced titanium bulkheads, carrying the faint, pungent scent of vaporized coolant and scorched dielectric grease.`,
      `Shadows cling to the perimeter of ${activeMapTitle}. Overhead fluorescent strips flicker with erratic voltage drops, casting long, fractured shadows across blast-shielded barricades. A low sub-harmonic vibration hums through the steel flooring.`,
      `Cold, conditioned air circulates across ${activeMapTitle} with a quiet hiss. Damp vapor beads on exposed structural supports, while the steady crimson blink of an emergency beacon paints the defensive chokepoints in rhythmic pulses.`
    ];
    const chosen = roomSensoryPresets[Math.floor(Math.random() * roomSensoryPresets.length)];
    setLatestNarration(`[SECTOR SENSORY READ-ALOUD] ${chosen}`);
  };

  const handleTransmuteCheck = () => {
    AudioService.playTerminalBeep(1200, 0.04);
    if (!customCheckText.trim()) return;

    // Transmute mechanics to sensory text
    const sensoryTransmutations = [
      `A piercing crack splits the air as hypersonic kinetic rounds shatter the reinforced casing. Micro-fractures spiderweb across the optical lattice, venting acrid smoke and sending optic telemetry haywire with blinding glare.`,
      `The impact rings like a struck anvil. Armor plating shears away in twisted ceramic shards, tearing kinetic baffles and forcing the operative back with bone-jarring momentum.`,
      `Capacitor coils whine in sudden overload before discharging a jagged thermal lance. The blast sears through protective composite weaves, blistering flesh and scorching the deckplate in molten slag.`
    ];
    const result = sensoryTransmutations[Math.floor(Math.random() * sensoryTransmutations.length)];
    setLatestNarration(`[TRANSMUTED PROSE: "${customCheckText}"] ${result}`);
  };

  const handleBroadcastToChat = () => {
    if (!latestNarration) return;
    setIsCopied(true);
    navigator.clipboard.writeText(latestNarration);
    AudioService.playTerminalBeep(1450, 0.08);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0c1017] text-slate-200 p-3 space-y-3 font-sans select-none overflow-y-auto">
      {/* Header Banner */}
      <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              AIME Narrative Co-Pilot
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
            </h4>
            <p className="text-[10px] text-purple-400/80 font-mono">Real-Time Tabletop Adjudication</p>
          </div>
        </div>

        <button
          onClick={handleBroadcastToChat}
          className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
            isCopied
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
              : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40'
          }`}
          title="Copy narrative to clipboard / broadcast"
        >
          {isCopied ? <Check size={11} /> : <Send size={11} />}
          <span>{isCopied ? 'Copied' : 'Broadcast'}</span>
        </button>
      </div>

      {/* Output Narration Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner relative">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-1">
          Active Narration Output:
        </span>
        <p className="text-xs text-slate-200 leading-relaxed font-sans italic border-l-2 border-purple-500 pl-2.5 my-1">
          {latestNarration}
        </p>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono font-semibold">
        <button
          onClick={() => setActiveTab('barks')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'barks'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tactical Barks
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'room'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Room Sensory
        </button>
        <button
          onClick={() => setActiveTab('transmute')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'transmute'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transmute
        </button>
      </div>

      {/* Tab 1: Tactical Adversary Barks */}
      {activeTab === 'barks' && (
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono text-slate-400">Speaker:</span>
            <input
              type="text"
              value={npcSpeakerName}
              onChange={(e) => setNpcSpeakerName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              placeholder="NPC Name or Call-Sign"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            {Object.keys(BARK_CATEGORIES).map((catKey) => (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedBarkCategory(catKey);
                  handleGenerateBark(catKey);
                }}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-200 transition-all text-left flex items-center space-x-1.5 cursor-pointer"
              >
                <Radio size={12} className="text-purple-400 flex-shrink-0" />
                <span className="capitalize truncate">{catKey.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Sensory Room Description */}
      {activeTab === 'room' && (
        <div className="space-y-2.5">
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1">
            <span className="text-[10px] uppercase font-mono text-purple-400 block">Sector Context:</span>
            <p className="font-semibold text-slate-200">{activeMapTitle}</p>
            <p className="text-[11px] text-slate-400">Generates 2–3 sentences of sensory atmosphere without exposing hidden plot secrets.</p>
          </div>

          <button
            onClick={handleGenerateRoomDescription}
            className="w-full py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Generate Sector Read-Aloud</span>
          </button>
        </div>
      )}

      {/* Tab 3: Narrative Transmutation */}
      {activeTab === 'transmute' && (
        <div className="space-y-2.5">
          <label className="text-[10px] uppercase font-mono text-slate-400 block">
            Rules Mechanics to Transmute:
          </label>
          <textarea
            value={customCheckText}
            onChange={(e) => setCustomCheckText(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
            placeholder="e.g. Reflex check 12 vs DC 15 against thermal vent"
          />

          <button
            onClick={handleTransmuteCheck}
            className="w-full py-2 bg-purple-900/70 hover:bg-purple-800 border border-purple-500/60 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Transmute into Sensory Narrative</span>
          </button>
        </div>
      )}

      {/* Ambient Audio Cues */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-[9px] uppercase font-mono text-slate-500 block mb-1.5">
          Atmospheric Sound Directing:
        </span>
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
          <button
            onClick={() => AudioService.playTerminalBeep(440, 0.2)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Volume2 size={11} />
            <span>Low Hum</span>
          </button>
          <button
            onClick={() => AudioService.playTerminalBeep(880, 0.15)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Volume2 size={11} />
            <span>Pulse</span>
          </button>
          <button
            onClick={() => AudioService.playTerminalBeep(1320, 0.1)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Volume2 size={11} />
            <span>Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AimeCockpitDeck;
