/**
 * @file InteractiveStoryStudio.jsx
 * @description Interactive Play Studio for ADE Studio.
 * Allows playing through any scenario from this foundry with branching story beats,
 * decision gates, and skill checks.
 *
 * Protagonist Modes:
 *   1. Folio Persona: Real character from player's Folio roster with actual attributes & skills.
 *   2. Preset Characters: Iconic Tangent SFF RPG operatives (Void Marine, Slicer, Psionic Envoy, Route Scout).
 *   3. Open World Narrative Script: Freeform GM / omniscient narrative director mode.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStory } from '../../../../context/CampaignContext';
import { useFolio } from '../../../../context/FolioContext';
import { AudioService } from '../../../../services/audioService';
import { streamContent } from '../../../../services/aimeService';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  BookOpen, 
  Send, 
  Dices, 
  User, 
  MapPin, 
  Shield, 
  Search, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  Printer, 
  Settings, 
  ArrowRight, 
  Loader2,
  Users,
  Compass,
  Zap,
  Globe
} from 'lucide-react';
import AdventurePrintModal from './AdventurePrintModal';

// 4 Canonical Tangent SFF RPG Preset Characters
const PRESET_CHARACTERS = [
  {
    id: 'preset-jax',
    name: 'Jax Vance',
    archetype: 'Soldier',
    species: 'Human',
    focus: 'Heavy Kinetics & Armor Soak',
    attributes: { strength: 3, agility: 2, stamina: 4, intellect: 1, wisdom: 2, charisma: 1 },
    concept: 'Hardened veteran void marine with scarred carbon-composite armor and kinetic carbine.'
  },
  {
    id: 'preset-nyx',
    name: 'Nyx Kael',
    archetype: 'Cyber-Slicer',
    species: 'Alterian',
    focus: 'System Infiltration & Reflex Slicing',
    attributes: { strength: 1, agility: 3, stamina: 2, intellect: 4, wisdom: 2, charisma: 2 },
    concept: 'Bionic decker equipped with neural cyber-rig and quantum crypto-crackers.'
  },
  {
    id: 'preset-tariq',
    name: 'Tariq Shan',
    archetype: 'Psionic Envoy',
    species: 'Celestine',
    focus: 'Empathic Influence & Bio-Kinetics',
    attributes: { strength: 1, agility: 2, stamina: 2, intellect: 3, wisdom: 4, charisma: 3 },
    concept: 'Diplomatic consular capable of sensing thought currents and psychically shielding allies.'
  },
  {
    id: 'preset-vesper',
    name: 'Vesper Thorne',
    archetype: 'Route Scout',
    species: 'Terran',
    focus: 'Frontier Navigation & Stealth Ballistics',
    attributes: { strength: 2, agility: 4, stamina: 3, intellect: 2, wisdom: 3, charisma: 1 },
    concept: 'Frontier pathfinder who maps uncharted anomaly vectors with laser carbine in hand.'
  }
];

export const InteractiveStoryStudio = ({ activeNode: propActiveNode, onSelectScenario }) => {
  const { 
    universeState, 
    elementsCatalog, 
    updateStory,
    openStory,
    getActiveGemsText 
  } = useStory();
  
  const { roster, characterData } = useFolio();

  // ── FOUNDRY SCENARIO SELECTION ──
  // Flatten all scenarios/scenes in this foundry for easy switching
  const allFoundryScenarios = useMemo(() => {
    const list = [];
    const extract = (nodes) => {
      if (!Array.isArray(nodes)) return;
      for (const n of nodes) {
        list.push(n);
        if (n.children && n.children.length > 0) extract(n.children);
      }
    };
    extract(universeState?.scenarios || []);
    return list;
  }, [universeState?.scenarios]);

  const [selectedScenarioId, setSelectedScenarioId] = useState(
    propActiveNode?.id || allFoundryScenarios[0]?.id || ''
  );

  useEffect(() => {
    if (propActiveNode?.id) {
      setSelectedScenarioId(propActiveNode.id);
    }
  }, [propActiveNode?.id]);

  const activeScenario = useMemo(() => {
    return allFoundryScenarios.find(s => s.id === selectedScenarioId) || propActiveNode || allFoundryScenarios[0] || null;
  }, [allFoundryScenarios, selectedScenarioId, propActiveNode]);

  // ── PROTAGONIST MODE ──
  // 'folio' | 'preset' | 'narrative'
  const [protagonistMode, setProtagonistMode] = useState('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_CHARACTERS[0].id);
  const [selectedFolioCharId, setSelectedFolioCharId] = useState(
    characterData?.['character-doc-id'] || roster?.[0]?.['character-doc-id'] || ''
  );

  const activeProtagonist = useMemo(() => {
    if (protagonistMode === 'folio') {
      const char = (roster || []).find(c => c['character-doc-id'] === selectedFolioCharId) || characterData;
      if (char && char['char-name']) {
        return {
          id: char['character-doc-id'] || 'active-folio',
          name: char['char-name'],
          archetype: char['char-archetype'] || 'Operative',
          species: char['char-species'] || 'Terran',
          focus: char['char-concept'] || 'Custom Hero',
          attributes: {
            strength: Number(char['attr-strength']) || 1,
            agility: Number(char['attr-agility']) || 1,
            stamina: Number(char['attr-stamina']) || 1,
            intellect: Number(char['attr-intellect']) || 1,
            wisdom: Number(char['attr-wisdom']) || 1,
            charisma: Number(char['attr-charisma']) || 1
          },
          concept: char['char-concept'] || 'Custom Persona from Folio Roster'
        };
      }
    }
    if (protagonistMode === 'preset') {
      return PRESET_CHARACTERS.find(p => p.id === selectedPresetId) || PRESET_CHARACTERS[0];
    }
    return null; // Open narrative mode
  }, [protagonistMode, selectedPresetId, selectedFolioCharId, roster, characterData]);

  // ── INTERACTIVE STORY BEATS FEED ──
  const [beats, setBeats] = useState([]);
  const [customActionInput, setCustomActionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStreamingText, setActiveStreamingText] = useState('');
  const [generatingActionText, setGeneratingActionText] = useState('');
  const [skillCheckRoll, setSkillCheckRoll] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const endOfBeatsRef = useRef(null);

  useEffect(() => {
    endOfBeatsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [beats, activeStreamingText, isGenerating]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── SKILL CHECK DICE ARBITRATION ──
  const handleRollCheck = (skillName, dc = 12) => {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;

    // Determine attribute modifier based on skill or protagonist
    let attrMod = 2;
    if (activeProtagonist) {
      const lower = skillName.toLowerCase();
      if (lower.includes('kinetic') || lower.includes('might') || lower.includes('melee')) {
        attrMod = activeProtagonist.attributes.strength || 2;
      } else if (lower.includes('agility') || lower.includes('reflex') || lower.includes('stealth')) {
        attrMod = activeProtagonist.attributes.agility || 2;
      } else if (lower.includes('slicing') || lower.includes('tech') || lower.includes('intellect')) {
        attrMod = activeProtagonist.attributes.intellect || 2;
      } else if (lower.includes('perception') || lower.includes('survival') || lower.includes('psionic')) {
        attrMod = activeProtagonist.attributes.wisdom || 2;
      } else if (lower.includes('influence') || lower.includes('culture') || lower.includes('diplomacy')) {
        attrMod = activeProtagonist.attributes.charisma || 2;
      } else {
        attrMod = activeProtagonist.attributes.stamina || 2;
      }
    }

    const total = d1 + d2 + attrMod;
    const isSuccess = total >= dc;

    if (isSuccess) AudioService.playTerminalBeep(1100, 0.15);
    else AudioService.playCombatHit(false);

    setSkillCheckRoll({
      skillName,
      dc,
      d1,
      d2,
      attrMod,
      total,
      isSuccess,
      protagonistName: activeProtagonist?.name || 'Party',
      text: `${activeProtagonist?.name || 'Operative'} [${skillName}]: Rolled ${d1}+${d2}+${attrMod} = ${total} vs CR ${dc} (${isSuccess ? 'SUCCESS' : 'FAILURE'})`
    });
  };

  // ── ADVANCE STORY BEAT WITH AI OVERSEER ──
  const handleAdvanceBeat = async (selectedOptionText) => {
    if (isGenerating) return;
    const chosenAction = (selectedOptionText || customActionInput || '').trim();
    if (!chosenAction) return;

    AudioService.playTerminalBeep(980, 0.08);
    setIsGenerating(true);
    setGeneratingActionText(chosenAction);
    setActiveStreamingText('');

    // Mark previous beat with chosen decision
    let updatedBeats = [...beats];
    if (beats.length > 0) {
      const lastIndex = beats.length - 1;
      const currentBeat = beats[lastIndex];
      if (currentBeat) {
        updatedBeats[lastIndex] = {
          ...currentBeat,
          gate: {
            ...(currentBeat.gate || {}),
            chosenOption: chosenAction,
            checkResult: skillCheckRoll ? skillCheckRoll.text : null
          }
        };
        setBeats(updatedBeats);
      }
    }

    const protagonistContext = activeProtagonist
      ? `Protagonist: ${activeProtagonist.name} (${activeProtagonist.species} ${activeProtagonist.archetype}). Focus: ${activeProtagonist.focus}. Concept: ${activeProtagonist.concept}.`
      : 'Perspective: Open Narrative Script / Omniscient Party Directive.';

    const scenarioContext = `
Foundry Scenario: "${activeScenario?.title || 'Tactical Encounter'}"
Location: ${activeScenario?.type || 'Encounter Area'}
Read-Aloud Briefing: ${activeScenario?.fields?.readAloud || 'Immediate tactical engagement'}
Tactical Clues & Obstacles: ${(activeScenario?.fields?.bulletPoints || []).join('; ')}
Threats: ${(activeScenario?.fields?.threats || []).map(t => `${t.name} (${t.tier})`).join(', ')}
Guidance: ${typeof getActiveGemsText === 'function' ? getActiveGemsText() : 'Sci-Fi Action'}
`;

    const recentBeatsText = updatedBeats.slice(-3).map(b => `[Beat #${b.beatIndex}]: ${b.text}`).join('\n\n');

    const prompt = `You are the AI Overseer executing an interactive Sci-Fi RPG scenario beat.
${scenarioContext}
${protagonistContext}

Story history so far:
${recentBeatsText || 'Scene commencement.'}

Player's Declared Action:
"${chosenAction}"
${skillCheckRoll ? `Dice Roll Result: ${skillCheckRoll.text}` : ''}

INSTRUCTIONS:
1. Write exactly ONE OR TWO atmospheric paragraphs (120-180 words) showing the direct consequences of the action. Highlight sensory textures (lighting, acoustic reverberation, hazards, tactical position).
2. Conclude with a Decision Gate containing exactly 3 distinct tactical branching options for the next action.
FORMAT YOUR OUTPUT AS VALID JSON:
{
  "narrative": "Paragraph text here...",
  "gate": {
    "prompt": "What does the operative do next?",
    "options": [
      { "id": "1", "text": "Aggressive or kinetic move...", "skill": "Kinetics / Ballistics CR 12" },
      { "id": "2", "text": "Tactical, technical, or stealth move...", "skill": "Slicing / Stealth CR 13" },
      { "id": "3", "text": "Diplomatic, psionic, or unconventional move...", "skill": "Perception / Psionics CR 12" }
    ]
  }
}`;

    try {
      let accumulated = '';
      await streamContent({
        prompt,
        context: activeScenario,
        onChunk: (chunk) => {
          accumulated += chunk;
          setActiveStreamingText(accumulated);
        }
      });

      // Parse JSON response
      let parsed = null;
      try {
        const cleaned = accumulated.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        parsed = {
          narrative: accumulated.trim(),
          gate: {
            prompt: "What is your next tactical move?",
            options: [
              { id: "1", text: "Press the offensive under cover", skill: "Ballistics CR 12" },
              { id: "2", text: "Access local terminal to slice blast doors", skill: "Slicing CR 13" },
              { id: "3", text: "Reposition and flank target perimeter", skill: "Agility CR 11" }
            ]
          }
        };
      }

      const newBeat = {
        id: `beat_${Date.now()}`,
        beatIndex: updatedBeats.length + 1,
        protagonistName: activeProtagonist?.name || 'Operative',
        text: parsed.narrative || accumulated,
        gate: parsed.gate || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setBeats([...updatedBeats, newBeat]);
      setActiveStreamingText('');
      setCustomActionInput('');
      setSkillCheckRoll(null);
      AudioService.playTerminalBeep(1200, 0.05);
    } catch (err) {
      console.error('Interactive beat error:', err);
      showToast('Error synthesizing story beat');
    } finally {
      setIsGenerating(false);
      setGeneratingActionText('');
    }
  };

  // ── COMMIT BEATS TO ACTIVE SCENARIO STORY WEAVER ──
  const handleCommitToStoryWeaver = () => {
    if (beats.length === 0 || !activeScenario?.id) return;
    const beatTexts = beats.map(b => `<p><strong>[Beat #${b.beatIndex} - ${b.protagonistName}]:</strong> ${b.text}</p>`).join('');
    const existing = activeScenario.content || '';
    const merged = existing ? `${existing}<br/><hr/><h3>Interactive Play Beats Log:</h3>${beatTexts}` : beatTexts;

    updateStory(activeScenario.id, { content: merged });
    AudioService.playTerminalBeep(1300, 0.08);
    showToast(`✓ Committed ${beats.length} beats into Story Weaver for "${activeScenario.title}"!`);
  };

  const handleResetSession = () => {
    if (confirm("Reset interactive story timeline beats for this scenario?")) {
      setBeats([]);
      setActiveStreamingText('');
      setSkillCheckRoll(null);
      AudioService.playTerminalBeep(700, 0.04);
    }
  };

  const activeBeat = beats.length > 0 ? beats[beats.length - 1] : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090d15] font-mono select-none">
      {/* ── TOP INTEGRATED HEADER: SCENARIO SELECTOR & PROTAGONIST BAR ── */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between gap-3 shrink-0 flex-wrap text-xs">
        {/* Scenario Selection from this Foundry */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={14} className="text-amber-400 shrink-0" />
          <span className="text-slate-400 uppercase font-bold text-[10px] hidden sm:inline">Scenario:</span>
          {allFoundryScenarios.length > 0 ? (
            <select
              value={activeScenario?.id || ''}
              onChange={(e) => {
                setSelectedScenarioId(e.target.value);
                if (onSelectScenario) onSelectScenario(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold px-2 py-1 rounded-lg outline-none focus:border-cyan-400 text-xs max-w-[200px] truncate cursor-pointer"
              title="Select Foundry Scenario to Play"
            >
              {allFoundryScenarios.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.title || 'Untitled Scenario'} ({s.type || 'Scene'})
                </option>
              ))}
            </select>
          ) : (
            <span className="font-bold text-cyan-300">{activeScenario?.title || 'Open Encounter'}</span>
          )}
        </div>

        {/* Protagonist Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setProtagonistMode('preset')}
              className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                protagonistMode === 'preset'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={11} />
              <span>Preset</span>
            </button>

            <button
              type="button"
              onClick={() => setProtagonistMode('folio')}
              className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                protagonistMode === 'folio'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={11} />
              <span>Folio Hero</span>
            </button>

            <button
              type="button"
              onClick={() => setProtagonistMode('narrative')}
              className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                protagonistMode === 'narrative'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={11} />
              <span className="hidden md:inline">Open Script</span>
            </button>
          </div>

          {/* Preset Selector */}
          {protagonistMode === 'preset' && (
            <select
              value={selectedPresetId || ''}
              onChange={e => setSelectedPresetId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-200 px-2 py-1 rounded-lg text-xs outline-none focus:border-cyan-400 font-bold cursor-pointer max-w-[170px]"
            >
              {PRESET_CHARACTERS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.archetype})
                </option>
              ))}
            </select>
          )}

          {/* Folio Hero Selector */}
          {protagonistMode === 'folio' && (
            <select
              value={selectedFolioCharId || ''}
              onChange={e => setSelectedFolioCharId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-purple-200 px-2 py-1 rounded-lg text-xs outline-none focus:border-purple-400 font-bold cursor-pointer max-w-[170px]"
            >
              {(!roster || roster.length === 0) ? (
                <option value="">No Folio characters found</option>
              ) : (
                roster.map(c => (
                  <option key={c['character-doc-id']} value={c['character-doc-id']}>
                    {c['char-name'] || 'Unnamed Hero'} ({c['char-archetype'] || 'Hero'})
                  </option>
                ))
              )}
            </select>
          )}

          {/* Commit & Reset Actions */}
          <div className="flex items-center gap-1.5 ml-1">
            {beats.length > 0 && (
              <button
                type="button"
                onClick={handleCommitToStoryWeaver}
                className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Commit narrative beats into the Story Weaver prose draft"
              >
                <FileText size={11} />
                <span className="hidden sm:inline">Commit to Weaver</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSession}
              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
              title="Reset Timeline Beats"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Protagonist Mini Card Banner */}
      {activeProtagonist && (
        <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-cyan-400 font-bold">👤 {activeProtagonist.name}</span>
            <span>•</span>
            <span className="text-slate-300">{activeProtagonist.species} {activeProtagonist.archetype}</span>
            <span>•</span>
            <span className="text-slate-500 hidden md:inline truncate">{activeProtagonist.focus}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
            <span>STR {activeProtagonist.attributes.strength}</span>
            <span>AGI {activeProtagonist.attributes.agility}</span>
            <span>INT {activeProtagonist.attributes.intellect}</span>
            <span>WIS {activeProtagonist.attributes.wisdom}</span>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-40 bg-slate-900 border border-cyan-500 text-cyan-200 text-xs px-3 py-1.5 rounded-xl shadow-2xl animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* ── SCROLLABLE STORY BEATS STREAM ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 scrollbar-thin">
        {beats.length === 0 && !activeStreamingText && !isGenerating && (
          <div className="max-w-md mx-auto text-center py-16 text-slate-500 space-y-3 font-mono text-xs">
            <Compass size={36} className="mx-auto text-cyan-500/60 animate-pulse" />
            <p className="text-slate-300 font-bold uppercase tracking-wider">
              {activeScenario?.title || 'Interactive Scenario Ready'}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {activeScenario?.fields?.readAloud
                ? `"${activeScenario.fields.readAloud.slice(0, 140)}..."`
                : 'Select an operative action in the Decision Gate below to synthesize Beat #1.'}
            </p>
          </div>
        )}

        {/* Existing Beats */}
        {beats.map((beat) => (
          <div
            key={beat.id}
            className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850 pb-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase tracking-wider">
                Beat #{beat.beatIndex} • {beat.protagonistName}
              </span>
              <span>{beat.timestamp}</span>
            </div>

            <p className="text-slate-100 text-sm leading-relaxed font-sans select-text">
              {beat.text}
            </p>

            {beat.gate?.chosenOption && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-900/50 flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <ArrowRight size={12} className="text-cyan-400 shrink-0" />
                  <span>Decision: {beat.gate.chosenOption}</span>
                </div>
                {beat.gate.checkResult && (
                  <span className="text-[10px] text-amber-300 font-mono pl-4">
                    🎲 {beat.gate.checkResult}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Live Streaming Active Beat */}
        {activeStreamingText && (
          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-cyan-500/60 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-2 font-bold uppercase">
              <span>Synthesizing Beat #{beats.length + 1}...</span>
              <Loader2 size={12} className="animate-spin" />
            </div>
            <p className="text-slate-100 text-sm leading-relaxed font-sans select-text whitespace-pre-wrap">
              {activeStreamingText}
            </p>
          </div>
        )}

        <div ref={endOfBeatsRef} />
      </div>

      {/* ── DECISION GATE COCKPIT (Bottom) ── */}
      <div className="border-t border-slate-800 bg-slate-950/95 p-3 md:p-4 shrink-0 shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Active Generation Thinking Banner */}
          {isGenerating && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-xs shadow animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-cyan-400" />
                <span className="font-bold text-amber-300 uppercase">AI Overseer:</span>
                <span className="truncate">Resolving "{generatingActionText}"...</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold hidden sm:inline">DECISION MATRIX ACTIVE</span>
            </div>
          )}

          {/* Decision Gate Options */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
              <ChevronRight size={14} className="text-amber-400" />
              <span>Decision Gate: {activeBeat?.gate?.prompt || 'Declare Operative Action:'}</span>
            </span>

            {skillCheckRoll && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                skillCheckRoll.isSuccess 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                  : 'bg-rose-950 text-rose-300 border-rose-500/50'
              }`}>
                {skillCheckRoll.text}
              </span>
            )}
          </div>

          {/* 3 Interactive Branching Options */}
          {activeBeat?.gate?.options && activeBeat.gate.options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {activeBeat.gate.options.map((opt, i) => (
                <button
                  key={opt.id || i}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleAdvanceBeat(opt.text)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 hover:border-cyan-500/60 border border-slate-800 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-1 py-0.2 rounded border border-cyan-500/30 shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-xs text-slate-200 hover:text-cyan-300 leading-snug">
                      {opt.text}
                    </span>
                  </div>

                  {opt.skill && (
                    <div className="flex items-center justify-between text-[10px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                      <span className="truncate">{opt.skill}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollCheck(opt.skill, 12);
                        }}
                        className="px-1.5 py-0.2 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 rounded text-[9px] font-bold uppercase transition-colors shrink-0 ml-1 cursor-pointer"
                        title="Roll 2d10 skill check with character attribute"
                      >
                        🎲 Roll
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Custom Action Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customActionInput}
              onChange={e => setCustomActionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdvanceBeat(); }}
              disabled={isGenerating}
              placeholder={activeProtagonist ? `Declare ${activeProtagonist.name}'s custom action or operative response...` : 'Declare operative action...'}
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl outline-none focus:border-cyan-400 placeholder-slate-500"
            />
            <button
              type="button"
              disabled={isGenerating || !customActionInput.trim()}
              onClick={() => handleAdvanceBeat()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={12} />
              <span>Act</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveStoryStudio;
