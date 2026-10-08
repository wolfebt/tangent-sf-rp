/**
 * @file AimeCockpitDeck.tsx
 * @description In-VTT Operational AIME Co-Pilot Panel for CockpitPanel.tsx.
 * Delivers real-time room read-alouds, tactical adversary combat barks,
 * rules-to-prose transmutation, and RAG-augmented generation of .persona and .scene schemas
 * directly into the VTT Stage.
 */

import React, { useState } from 'react';
import { Sparkles, Radio, Volume2, Send, Check, RefreshCw, UserPlus, MapPin, Loader2, Crosshair } from 'lucide-react';
import { getTacticalBark, BARK_CATEGORIES } from '../../../services/tacticalBarksService';
import { AudioService } from '../../../services/audioService';
import { useCampaign } from '../../../context/CampaignContext';
import { useEngineStore } from '../../../engine/state/VolatileSharder';
import {
  generateAimePersonaSchema,
  generateAimeSceneSchema,
  convertPersonaToVttToken,
  convertSceneToVttMap,
  type AimePersonaSchema,
  type AimeSceneSchema
} from '../../../services/aimeVttSchemaService';

export const AimeCockpitDeck: React.FC = () => {
  const { universeState, setUniverseState } = useCampaign();
  const ephemeralData = useEngineStore((s) => s.ephemeralData);
  const staticData = useEngineStore((s) => s.staticData);

  type TabKey = 'barks' | 'room' | 'transmute' | 'persona' | 'scene';
  const [activeTab, setActiveTab] = useState<TabKey>('barks');
  const [selectedBarkCategory, setSelectedBarkCategory] = useState<string>('engaging');
  const [npcSpeakerName, setNpcSpeakerName] = useState<string>('Enforcer 01');
  const [latestNarration, setLatestNarration] = useState<string>(
    'AIME Tactical Narrative Engine active. Ready to synthesize sensory room descriptions, radio barks, and RAG .persona / .scene schemas.'
  );
  const [customCheckText, setCustomCheckText] = useState<string>('Called shot to optic sensors breaches Kinetic DR 6');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // ── Persona Generator State ──
  const [personaPrompt, setPersonaPrompt] = useState<string>('Elite Alterian Psionic Sniper');
  const [personaRole, setPersonaRole] = useState<'Commando' | 'Sniper' | 'Bruiser' | 'Slicer' | 'Medic' | 'Guardian' | 'Boss'>('Sniper');
  const [personaDesignation, setPersonaDesignation] = useState<'Adversary' | 'Ally' | 'Neutral'>('Adversary');
  const [personaTechLevel, setPersonaTechLevel] = useState<number>(3);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState<boolean>(false);
  const [generatedPersona, setGeneratedPersona] = useState<AimePersonaSchema | null>(null);

  // ── Scene Generator State ──
  const [scenePrompt, setScenePrompt] = useState<string>('Precursor Airlock under decompression with active defense sentries');
  const [sceneLocation, setSceneLocation] = useState<string>('Airlock Sector 07');
  const [sceneTechLevel, setSceneTechLevel] = useState<number>(3);
  const [isGeneratingScene, setIsGeneratingScene] = useState<boolean>(false);
  const [generatedScene, setGeneratedScene] = useState<AimeSceneSchema | null>(null);

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

    const sensoryTransmutations = [
      `A piercing crack splits the air as hypersonic kinetic rounds shatter the reinforced casing. Micro-fractures spiderweb across the optical lattice, venting acrid smoke and sending optic telemetry haywire with blinding glare.`,
      `The impact rings like a struck anvil. Armor plating shears away in twisted ceramic shards, tearing kinetic baffles and forcing the operative back with bone-jarring momentum.`,
      `Capacitor coils whine in sudden overload before discharging a jagged thermal lance. The blast sears through protective composite weaves, blistering flesh and scorching the deckplate in molten slag.`
    ];
    const result = sensoryTransmutations[Math.floor(Math.random() * sensoryTransmutations.length)];
    setLatestNarration(`[TRANSMUTED PROSE: "${customCheckText}"] ${result}`);
  };

  // ── Handle Persona Generation ──
  const handleGeneratePersona = async () => {
    if (!personaPrompt.trim()) return;
    setIsGeneratingPersona(true);
    AudioService.playTerminalBeep(980, 0.04);

    try {
      const persona = await generateAimePersonaSchema({
        prompt: personaPrompt,
        mcmRole: personaRole,
        mcmDesignation: personaDesignation,
        techLevel: personaTechLevel
      });
      setGeneratedPersona(persona);
      setLatestNarration(`[AIME FORGED PERSONA] "${persona.name}" (${persona.archetype}) synthesized under TL-${persona.techLevel} rules. Ready for stage deployment.`);
      AudioService.playTerminalBeep(1400, 0.06);
    } catch (err) {
      console.error('[AimeCockpitDeck] Persona generation failed:', err);
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  // ── Handle Deploy Persona to Stage ──
  const handleDeployPersonaToStage = () => {
    if (!generatedPersona) return;
    const store = useEngineStore.getState();
    const spawnX = 300 + Math.floor(Math.random() * 80);
    const spawnY = 300 + Math.floor(Math.random() * 80);

    const token = convertPersonaToVttToken(generatedPersona, {
      x: spawnX,
      y: spawnY,
      designation: generatedPersona.mcmDesignation
    });

    store.loadStaticEntitiesBatch([token]);
    store.updatePosition(token.id, spawnX, spawnY);
    store.clearSelection();
    store.setSelection(token.id, true);

    AudioService.playTerminalBeep(1600, 0.08);
    setLatestNarration(`[DEPLOYED TO STAGE] Token "${token.name}" deployed at (${spawnX}, ${spawnY}). HP: ${token.base_health} | Armor DR: ${token.armor_dr}`);
  };

  // ── Handle Scene Generation ──
  const handleGenerateScene = async () => {
    if (!scenePrompt.trim()) return;
    setIsGeneratingScene(true);
    AudioService.playTerminalBeep(940, 0.04);

    try {
      const scene = await generateAimeSceneSchema({
        prompt: scenePrompt,
        location: sceneLocation,
        techLevel: sceneTechLevel
      });
      setGeneratedScene(scene);
      setLatestNarration(`[AIME TACTICAL SCENE] "${scene.sceneName}" synthesized with ${scene.suggestedTokens?.length || 0} adversaries and ${scene.suggestedObjects?.length || 0} interactive objects.`);
      AudioService.playTerminalBeep(1400, 0.06);
    } catch (err) {
      console.error('[AimeCockpitDeck] Scene generation failed:', err);
    } finally {
      setIsGeneratingScene(false);
    }
  };

  // ── Handle Load Scene onto Stage ──
  const handleLoadSceneToStage = () => {
    if (!generatedScene) return;
    const newMap = convertSceneToVttMap(generatedScene);

    if (setUniverseState) {
      setUniverseState((prev: any) => {
        const existingMaps = prev.maps || [];
        return {
          ...prev,
          maps: [...existingMaps, newMap],
          activeMapId: newMap.id
        };
      });
    }

    // Deploy tokens into engine store
    const store = useEngineStore.getState();
    const tokensToLoad = (newMap.tokens || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      base_hp: t.hp || 30,
      base_health: t.hp || 30,
      base_vitality: 30,
      base_structure: 0,
      is_synthetic: false,
      tech_level: t.tech_level || 3,
      armor_dr: t.armor_dr || 4,
      size_modifier: 0,
      speed_ft: 30,
      species: 'Alterian',
      archetype: t.archetype,
      is_persona: Boolean(t.is_persona)
    }));

    store.loadStaticEntitiesBatch(tokensToLoad);
    tokensToLoad.forEach((t: any, idx: number) => {
      store.updatePosition(t.id, 350 + idx * 80, 350 + (idx % 2) * 50);
    });

    AudioService.playTerminalBeep(1750, 0.1);
    setLatestNarration(`[STAGE MAP ACTIVATED] "${newMap.title}" loaded as active sector with ${tokensToLoad.length} tokens deployed.`);
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
            <p className="text-[10px] text-purple-400/80 font-mono">RAG Schemas & Real-Time Adjudication</p>
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
      <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono font-semibold">
        <button
          onClick={() => setActiveTab('barks')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'barks'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Barks
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'room'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Room
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
        <button
          onClick={() => setActiveTab('persona')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'persona'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Persona
        </button>
        <button
          onClick={() => setActiveTab('scene')}
          className={`py-1 text-center rounded transition-all cursor-pointer ${
            activeTab === 'scene'
              ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Scene
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
            placeholder="e.g. Reflex check 12 vs CR 15 against thermal vent"
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

      {/* Tab 4: RAG Persona Forge */}
      {activeTab === 'persona' && (
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-purple-300 block flex items-center justify-between">
              <span>Persona Mandate:</span>
              <span className="text-emerald-400 text-[9px]">RAG Attuned</span>
            </label>
            <input
              type="text"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              placeholder="e.g. Cybernetic Slicer / Heavy Weapon Enforcer"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block mb-0.5">Role:</span>
              <select
                value={personaRole}
                onChange={(e: any) => setPersonaRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
              >
                <option value="Sniper">Sniper</option>
                <option value="Commando">Commando</option>
                <option value="Bruiser">Bruiser</option>
                <option value="Slicer">Slicer</option>
                <option value="Medic">Medic</option>
                <option value="Guardian">Guardian</option>
                <option value="Boss">Boss</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Side:</span>
              <select
                value={personaDesignation}
                onChange={(e: any) => setPersonaDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
              >
                <option value="Adversary">Adversary</option>
                <option value="Ally">Ally (Hero)</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Tech Level:</span>
              <select
                value={personaTechLevel}
                onChange={(e) => setPersonaTechLevel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
              >
                <option value={1}>TL 1 (Low)</option>
                <option value={2}>TL 2 (Mid)</option>
                <option value={3}>TL 3 (Interstellar)</option>
                <option value={4}>TL 4 (Hard-Light)</option>
                <option value={5}>TL 5 (Precursor)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGeneratePersona}
            disabled={isGeneratingPersona}
            className="w-full py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-50 text-purple-200 border border-purple-500/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            {isGeneratingPersona ? (
              <>
                <Loader2 size={13} className="animate-spin text-purple-300" />
                <span>RAG Synthesizing...</span>
              </>
            ) : (
              <>
                <UserPlus size={13} />
                <span>Forge .persona Schema</span>
              </>
            )}
          </button>

          {/* Generated Persona Preview Card */}
          {generatedPersona && (
            <div className="p-2.5 bg-slate-950/90 border border-purple-500/40 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-200">{generatedPersona.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-purple-950 border border-purple-500/40 text-purple-300 rounded font-mono">
                  {generatedPersona.archetype} • TL-{generatedPersona.techLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 italic">{generatedPersona.oneLinePitch}</p>
              
              <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-1 border-t border-slate-900">
                <div className="bg-slate-900/60 p-1 rounded">HP: <span className="text-red-400 font-bold">{generatedPersona.health}</span></div>
                <div className="bg-slate-900/60 p-1 rounded">VP: <span className="text-blue-400 font-bold">{generatedPersona.vitality}</span></div>
                <div className="bg-slate-900/60 p-1 rounded">DR: <span className="text-emerald-400 font-bold">{generatedPersona.armorDr}</span></div>
                <div className="bg-slate-900/60 p-1 rounded">Role: <span className="text-amber-400 font-bold">{generatedPersona.mcmRole}</span></div>
              </div>

              <button
                onClick={handleDeployPersonaToStage}
                className="w-full mt-2 py-1.5 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Crosshair size={13} />
                <span>Deploy Token Directly to Stage</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: RAG Scene Architect */}
      {activeTab === 'scene' && (
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-purple-300 block flex items-center justify-between">
              <span>Scene / Sector Mandate:</span>
              <span className="text-emerald-400 text-[9px]">RAG Attuned</span>
            </label>
            <input
              type="text"
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              placeholder="e.g. Sliced Airlock under low gravity"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block mb-0.5">Location:</span>
              <input
                type="text"
                value={sceneLocation}
                onChange={(e) => setSceneLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
                placeholder="Airlock Corridor"
              />
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">Tech Level:</span>
              <select
                value={sceneTechLevel}
                onChange={(e) => setSceneTechLevel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
              >
                <option value={1}>TL 1 (Low)</option>
                <option value={2}>TL 2 (Mid)</option>
                <option value={3}>TL 3 (Interstellar)</option>
                <option value={4}>TL 4 (Hard-Light)</option>
                <option value={5}>TL 5 (Precursor)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateScene}
            disabled={isGeneratingScene}
            className="w-full py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-50 text-purple-200 border border-purple-500/50 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            {isGeneratingScene ? (
              <>
                <Loader2 size={13} className="animate-spin text-purple-300" />
                <span>RAG Synthesizing Scene...</span>
              </>
            ) : (
              <>
                <MapPin size={13} />
                <span>Synthesize .scene Schema</span>
              </>
            )}
          </button>

          {/* Generated Scene Preview Card */}
          {generatedScene && (
            <div className="p-2.5 bg-slate-950/90 border border-purple-500/40 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-200 truncate">{generatedScene.sceneName}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-950 border border-indigo-500/40 text-indigo-300 rounded font-mono shrink-0">
                  {generatedScene.location}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{generatedScene.sensoryDetails}</p>

              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center pt-1 border-t border-slate-900">
                <div className="bg-slate-900/60 p-1 rounded">Beats: <span className="text-amber-400 font-bold">{generatedScene.sceneBeats?.length || 0}</span></div>
                <div className="bg-slate-900/60 p-1 rounded">Objects: <span className="text-sky-400 font-bold">{generatedScene.suggestedObjects?.length || 0}</span></div>
                <div className="bg-slate-900/60 p-1 rounded">Tokens: <span className="text-red-400 font-bold">{generatedScene.suggestedTokens?.length || 0}</span></div>
              </div>

              <button
                onClick={handleLoadSceneToStage}
                className="w-full mt-2 py-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/50 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                <MapPin size={13} />
                <span>Load Scene Directly into Stage</span>
              </button>
            </div>
          )}
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
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Volume2 size={11} />
            <span>Low Hum</span>
          </button>
          <button
            onClick={() => AudioService.playTerminalBeep(880, 0.15)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Volume2 size={11} />
            <span>Pulse</span>
          </button>
          <button
            onClick={() => AudioService.playTerminalBeep(1320, 0.1)}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
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
