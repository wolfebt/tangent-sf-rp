/**
 * @file InteractiveStoryStudio.jsx
 * @description Master Interactive Play Studio for ADE (Adventure Development Environment).
 * COMPLETELY DRIVEN BY DATABASE CONTENT — ZERO MOCK PRESETS OR HARDCODED CHARACTERS:
 *   1. Operatives pulled directly from Folio Database Roster, Story Foundry Elements, and Omnicortex DB.
 *   2. Solo by default with dynamic Squad expansion.
 *   3. Real-time Folio & VTT dynamic modifiers ledger and vitals synchronization.
 *   4. Flexible presentation modes: Fullscreen Interactive, Fullscreen VTT Stage, and Side-by-Side Split View.
 *   5. Dual-mode decision matrix: Pre-authored Visual Story Graph branches + AIME dynamic overseer.
 *   6. Canonical Tangent SFF RPG 2d10 dice check evaluation with criticals, fumbles, and margin of success tiers.
 *   7. Sensory soundscapes (ambient drone, hit audio) and Web Speech API TTS Sensory Read-Aloud.
 *   8. GM Director Mode vs. Solo Operative Mode with direct VTT chat broadcasting.
 *   9. Session management (auto-save, checkpoint fork, session drawer, markdown export).
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Split from 'react-split';
import { useCampaign, useStory } from '../../../../context/CampaignContext';
import { useFolio } from '../../../../context/FolioContext';
import { useDBM } from '../../../../context/DBMContext';
import { AudioService } from '../../../../services/audioService';
import { 
  streamContent, 
  generateContent, 
  LOD_TIERS, 
  resolveIntelligenceTier, 
  calculateVramTelemetry 
} from '../../../../services/aimeService.js';
import { VttEventBus } from '../../../../utils/vttEventBus';
import { 
  adjudicateActionCheck, 
  formatMandateForPrompt 
} from '../../../../services/ade/adeEngineBridge.ts';
import { useAdeStore } from '../../store/adeStore.ts';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  BookOpen, 
  Send, 
  Dices, 
  User, 
  Users, 
  MapPin, 
  Shield, 
  FileText, 
  ChevronRight, 
  ArrowRight, 
  Loader2,
  Compass,
  Zap,
  Globe,
  Volume2,
  VolumeX,
  Columns,
  Maximize2,
  Radio,
  FolderOpen,
  Plus,
  GitBranch,
  ShieldAlert,
  Swords,
  Database,
  Cpu,
  Brain,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

import TacticalStageViewport from '../panels/TacticalStageViewport';
import ActiveModifiersPillBar from '../panels/ActiveModifiersPillBar';
import FireteamVitalsBar from '../panels/FireteamVitalsBar';
import {
  loadDatabasePersonas,
  loadDatabaseModifiers,
  evaluateTangentCheck,
  loadAllSessions,
  persistAllSessions,
  createInteractiveSession,
  exportSessionMarkdown
} from '../interactivePlayService';

export const InteractiveStoryStudio = ({ 
  activeNode: propActiveNode, 
  onSelectScenario,
  linkedMap: propLinkedMap,
  allAvailableMaps: propAllAvailableMaps
}) => {
  // Campaign & Story Context
  const campaign = useCampaign() || {};
  const { 
    universeState, 
    elementsCatalog = [], 
    updateStory, 
    setActiveScenarioId,
    activeMapId,
    setActiveMapId,
    mapsCatalog = [],
    addMap,
    handleCreateNewMapForElement,
    getActiveGemsText 
  } = campaign;

  // Folio Context
  const folio = useFolio() || {};
  const { 
    roster = [], 
    characterData, 
    applyVTTStatusConditions, 
    recordTrackedModification,
    updateCharacterHealth,
    updateCharacterVitality
  } = folio;

  // DBM Database Context
  const dbm = useDBM() || {};
  const dbData = dbm.dbData || {};

  // ── FOUNDRY SCENARIO SELECTION ──
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
    if (propActiveNode?.id && propActiveNode.id !== selectedScenarioId) {
      setSelectedScenarioId(propActiveNode.id);
    }
  }, [propActiveNode?.id]);

  const activeScenario = useMemo(() => {
    return allFoundryScenarios.find(s => s.id === selectedScenarioId) || propActiveNode || allFoundryScenarios[0] || null;
  }, [allFoundryScenarios, selectedScenarioId, propActiveNode]);

  // ── PRE-AUTHORED STORY GRAPH BRANCHES (DIRECTLY FROM SCENARIO DATABASE) ──
  const preAuthoredBranches = useMemo(() => {
    if (!activeScenario) return [];
    const branches = [];
    // 1. Direct children in scenario hierarchy
    if (Array.isArray(activeScenario.children) && activeScenario.children.length > 0) {
      for (const child of activeScenario.children) {
        branches.push({
          id: child.id,
          targetScenarioId: child.id,
          text: `Advance to: ${child.title || 'Next Scene'}`,
          type: child.type || 'Scene',
          readAloud: child.fields?.readAloud || child.content || ''
        });
      }
    }
    // 2. Outgoing branch connections in Visual Story Graph
    if (Array.isArray(activeScenario.branchConnections)) {
      for (const conn of activeScenario.branchConnections) {
        const target = allFoundryScenarios.find(s => s.id === conn.targetId);
        if (target && !branches.some(b => b.targetScenarioId === target.id)) {
          branches.push({
            id: `conn_${conn.targetId}`,
            targetScenarioId: target.id,
            text: conn.label ? `${conn.label} ➔ ${target.title}` : `Branch to: ${target.title}`,
            type: target.type || 'Scene',
            readAloud: target.fields?.readAloud || target.content || ''
          });
        }
      }
    }
    return branches;
  }, [activeScenario, allFoundryScenarios]);

  // ── DATABASE OPERATIVES AGGREGATION (ZERO MOCK / ZERO HARDCODED) ──
  const allDatabasePersonas = useMemo(() => {
    return loadDatabasePersonas({
      roster,
      characterData,
      elementsCatalog,
      activeScenario,
      dbArchetypes: dbData.archetypes || []
    });
  }, [roster, characterData, elementsCatalog, activeScenario, dbData.archetypes]);

  // ── DATABASE MODIFIERS AGGREGATION (ZERO HARDCODED PRESETS) ──
  const availableDatabaseModifiers = useMemo(() => {
    return loadDatabaseModifiers({
      dbModifiers: dbData.modifiers || [],
      galleryModifiers: universeState?.galleryModifiers || [],
      activeCharacter: characterData
    });
  }, [dbData.modifiers, universeState?.galleryModifiers, characterData]);

  // ── PRESENTATION MODES: FULLSCREEN PLAY, SPLIT VIEW, FULLSCREEN STAGE ──
  const [layoutMode, setLayoutMode] = useState('split');
  const [splitRatio, setSplitRatio] = useState('50_50');

  const splitSizes = useMemo(() => {
    if (splitRatio === 'story_bias') return [65, 35];
    if (splitRatio === 'stage_bias') return [35, 65];
    return [50, 50];
  }, [splitRatio]);

  // ── DIRECTOR MODE VS SOLO OPERATIVE MODE ──
  const [directorMode, setDirectorMode] = useState('solo');

  // ── PARTY CONFIGURATION: SOLO (DEFAULT) VS GROUP ──
  const [partyMode, setPartyMode] = useState('solo');
  const [selectedPersonaSourceFilter, setSelectedPersonaSourceFilter] = useState('all'); // 'all' | 'folio' | 'foundry' | 'omnicortex'

  // Filtered personas list by database source
  const filteredPersonas = useMemo(() => {
    if (selectedPersonaSourceFilter === 'all') return allDatabasePersonas;
    return allDatabasePersonas.filter(p => p.sourceType === selectedPersonaSourceFilter);
  }, [allDatabasePersonas, selectedPersonaSourceFilter]);

  // Selected Solo Operative ID
  const [selectedOperativeId, setSelectedOperativeId] = useState(() => {
    return characterData?.['character-doc-id'] || characterData?.id || allDatabasePersonas[0]?.id || '';
  });

  useEffect(() => {
    if (!selectedOperativeId && allDatabasePersonas.length > 0) {
      setSelectedOperativeId(allDatabasePersonas[0].id);
    }
  }, [allDatabasePersonas, selectedOperativeId]);

  // Active Operatives in Fireteam
  const [operatives, setOperatives] = useState(() => {
    const match = allDatabasePersonas.find(p => p.id === selectedOperativeId);
    return match ? [match] : (allDatabasePersonas.slice(0, 1) || []);
  });

  // Re-sync operative when selection changes
  useEffect(() => {
    const match = allDatabasePersonas.find(p => p.id === selectedOperativeId);
    if (match) {
      if (partyMode === 'solo') {
        setOperatives([match]);
      } else {
        // In group mode, ensure selected is in operatives array
        setOperatives(prev => {
          if (prev.some(p => p.id === match.id)) return prev;
          return [match, ...prev];
        });
      }
    }
  }, [selectedOperativeId, allDatabasePersonas, partyMode]);

  const [activeOperativeId, setActiveOperativeId] = useState(() => selectedOperativeId || operatives[0]?.id || '');

  useEffect(() => {
    if (operatives.length > 0 && !operatives.some(o => o.id === activeOperativeId)) {
      setActiveOperativeId(operatives[0].id);
    }
  }, [operatives, activeOperativeId]);

  const activeOperative = useMemo(() => {
    return operatives.find(o => o.id === activeOperativeId) || operatives[0] || null;
  }, [operatives, activeOperativeId]);

  // ── DYNAMIC MODIFIERS LEDGER ──
  const [activeModifiers, setActiveModifiers] = useState([]);

  const handleAddModifier = useCallback((modifier) => {
    setActiveModifiers(prev => {
      const next = [...prev, modifier];
      // Sync to Folio if active operative is from Folio
      if (typeof recordTrackedModification === 'function' && activeOperative?.sourceType === 'folio') {
        recordTrackedModification({
          field: 'active_modifiers',
          label: modifier.name,
          value: modifier.value,
          reason: `ADE Interactive Play: ${modifier.description || modifier.name}`
        });
      }
      return next;
    });
  }, [recordTrackedModification, activeOperative]);

  const handleRemoveModifier = useCallback((instanceId) => {
    setActiveModifiers(prev => prev.filter(m => (m.instanceId || m.id) !== instanceId));
  }, []);

  // Update operative vitals with Folio & VTT sync
  const handleUpdateOperativeVitals = useCallback((opId, nextVitals) => {
    setOperatives(prev => prev.map(op => {
      if (op.id !== opId) return op;
      return { ...op, vitals: nextVitals };
    }));

    // If folio hero, sync health/vitality back
    if (activeOperative?.sourceType === 'folio' && opId === activeOperative?.id) {
      if (typeof updateCharacterHealth === 'function' && nextVitals.health !== undefined) {
        updateCharacterHealth(opId, nextVitals.health);
      }
      if (typeof updateCharacterVitality === 'function' && nextVitals.strain !== undefined) {
        updateCharacterVitality(opId, nextVitals.strain);
      }
    }

    // Emit damage/heal event to VTT Stage
    VttEventBus.emit('vtt-token-vitals-updated', {
      tokenId: opId,
      vitals: nextVitals
    });
  }, [activeOperative, updateCharacterHealth, updateCharacterVitality]);

  // ── SESSION MANAGEMENT & PERSISTENCE ──
  const [currentSessionId, setCurrentSessionId] = useState(() => `ips_${Date.now()}`);
  const [savedSessions, setSavedSessions] = useState(() => loadAllSessions());

  const syncSessionToStorage = useCallback((sessionData) => {
    const all = loadAllSessions();
    const idx = all.findIndex(s => s.id === sessionData.id);
    let next;
    if (idx >= 0) {
      next = [...all];
      next[idx] = sessionData;
    } else {
      next = [sessionData, ...all];
    }
    persistAllSessions(next);
    setSavedSessions(next);
  }, []);

  // ── STORY BEATS TIMELINE FEED ──
  const [beats, setBeats] = useState([]);
  const [customActionInput, setCustomActionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStreamingText, setActiveStreamingText] = useState('');
  const [generatingActionText, setGeneratingActionText] = useState('');
  const [skillCheckRoll, setSkillCheckRoll] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const endOfBeatsRef = useRef(null);

  // ── PHASE 3: HARDWARE MITIGATION & LOD INTELLIGENCE TIERING ──
  const [selectedLodTier, setSelectedLodTier] = useState('auto');

  // ── PHASE 4: EPISTEMIC INTERROGATION & DEDUCTION CONSOLE ──
  const [isEpistemicConsoleOpen, setIsEpistemicConsoleOpen] = useState(false);
  const [epistemicTargetType, setEpistemicTargetType] = useState('npc');
  const [epistemicTargetName, setEpistemicTargetName] = useState('');
  const [epistemicQuery, setEpistemicQuery] = useState('');
  const [isEpistemicSubmitting, setIsEpistemicSubmitting] = useState(false);
  const [epistemicFeed, setEpistemicFeed] = useState([]);

  // Audio Atmosphere & Speech Synthesis (TTS)
  const [isAmbientDroneActive, setIsAmbientDroneActive] = useState(false);
  const [isSpeakingBeatId, setIsSpeakingBeatId] = useState(null);

  useEffect(() => {
    endOfBeatsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [beats, activeStreamingText, isGenerating]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleAmbientAudio = () => {
    if (isAmbientDroneActive) {
      AudioService.stopAmbientDrone();
      setIsAmbientDroneActive(false);
    } else {
      AudioService.startAmbientDrone();
      setIsAmbientDroneActive(true);
    }
  };

  const handleSpeakBeat = (beatId, text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Speech synthesis not supported in this environment');
      return;
    }

    if (isSpeakingBeatId === beatId) {
      window.speechSynthesis.cancel();
      setIsSpeakingBeatId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    utterance.onend = () => setIsSpeakingBeatId(null);
    utterance.onerror = () => setIsSpeakingBeatId(null);

    setIsSpeakingBeatId(beatId);
    window.speechSynthesis.speak(utterance);
  };

  // ── TANGENT 2D10 SKILL CHECK ARBITRATION ──
  const handleRollCheck = (skillName, dc = 12) => {
    let subAttrKey = 'attr-might';
    const lower = (skillName || '').toLowerCase();

    if (lower.includes('kinetic') || lower.includes('might') || lower.includes('melee') || lower.includes('strength')) {
      subAttrKey = 'attr-might';
    } else if (lower.includes('agility') || lower.includes('reflex') || lower.includes('stealth') || lower.includes('ballistics')) {
      subAttrKey = 'attr-reflex';
    } else if (lower.includes('slicing') || lower.includes('tech') || lower.includes('intellect') || lower.includes('logic')) {
      subAttrKey = 'attr-logic';
    } else if (lower.includes('fortitude') || lower.includes('stamina') || lower.includes('endurance') || lower.includes('soak')) {
      subAttrKey = 'attr-fortitude';
    } else if (lower.includes('perception') || lower.includes('survival') || lower.includes('psionic') || lower.includes('will')) {
      subAttrKey = 'attr-will';
    } else if (lower.includes('influence') || lower.includes('culture') || lower.includes('diplomacy') || lower.includes('charisma')) {
      subAttrKey = 'attr-etiquette';
    }

    const checkResult = evaluateTangentCheck({
      operative: activeOperative,
      skillName,
      subAttrKey,
      targetCR: dc,
      activeModifiers
    });

    if (checkResult.isSuccess) {
      AudioService.playCriticalChime(true);
    } else {
      AudioService.playCombatHit(checkResult.tier === 'critical_fumble');
    }

    setSkillCheckRoll(checkResult);
  };

  // ── ADVANCE STORY BEAT ──
  const handleAdvanceBeat = async (selectedOptionText, targetScenarioId = null) => {
    if (isGenerating) return;
    const chosenAction = (selectedOptionText || customActionInput || '').trim();
    if (!chosenAction) return;

    AudioService.playTerminalBeep(980, 0.08);
    setIsGenerating(true);
    setGeneratingActionText(chosenAction);
    setActiveStreamingText('');

    // Pre-authored graph branch transition
    if (targetScenarioId && targetScenarioId !== activeScenario?.id) {
      setSelectedScenarioId(targetScenarioId);
      if (typeof onSelectScenario === 'function') onSelectScenario(targetScenarioId);
      if (typeof setActiveScenarioId === 'function') setActiveScenarioId(targetScenarioId);
      
      const targetScenarioNode = allFoundryScenarios.find(s => s.id === targetScenarioId);
      if (targetScenarioNode?.mapId && typeof setActiveMapId === 'function') {
        setActiveMapId(targetScenarioNode.mapId);
      }
    }

    // 1. NEURO-SYMBOLIC ISOLATION: Deterministic Game Engine Master
    // Adjudicate check and establish immutable structural mandate BEFORE AI generation
    const storyFlags = useAdeStore.getState().storyFlags || {};
    const mandate = adjudicateActionCheck({
      actionText: chosenAction,
      operative: activeOperative,
      targetEntity: activeScenario,
      targetDC: skillCheckRoll ? skillCheckRoll.targetCR : 12,
      skillName: skillCheckRoll ? skillCheckRoll.skillName : '',
      subAttrKey: skillCheckRoll ? skillCheckRoll.subAttrKey : '',
      activeModifiers,
      storyFlags,
      diceOverride: skillCheckRoll ? [skillCheckRoll.dice1, skillCheckRoll.dice2] : null
    });

    // Audio cue based on immutable systemic intent
    if (mandate.systemIntent === 'CRITICAL_TRIUMPH' || mandate.systemIntent === 'EXECUTE_SUCCESS') {
      AudioService.playCriticalChime(mandate.systemIntent === 'CRITICAL_TRIUMPH');
    } else if (mandate.systemIntent === 'CRITICAL_FUMBLE' || mandate.systemIntent === 'REFUSE_ACTION') {
      AudioService.playCombatHit(true);
    } else {
      AudioService.playCombatHit(false);
    }

    // Apply mechanical outcomes immediately to operative vitals and VTT
    if (activeOperative && (mandate.mechanicalOutcomes?.shieldsDelta || mandate.mechanicalOutcomes?.hpDelta)) {
      const currentVitals = activeOperative.vitals || { shields: 10, maxShields: 10, health: 10, maxHealth: 10, strain: 0 };
      const nextShields = Math.max(0, Math.min(currentVitals.maxShields || 10, (currentVitals.shields || 0) + (mandate.mechanicalOutcomes.shieldsDelta || 0)));
      const nextHealth = Math.max(0, Math.min(currentVitals.maxHealth || 10, (currentVitals.health || 0) + (mandate.mechanicalOutcomes.hpDelta || 0)));
      handleUpdateOperativeVitals(activeOperative.id, {
        ...currentVitals,
        shields: nextShields,
        health: nextHealth
      });
    }

    if (mandate.mechanicalOutcomes?.conditionsApplied && typeof applyVTTStatusConditions === 'function') {
      mandate.mechanicalOutcomes.conditionsApplied.forEach(cond => {
        applyVTTStatusConditions(cond);
      });
    }

    if (mandate.mechanicalOutcomes?.flagUpdates) {
      Object.entries(mandate.mechanicalOutcomes.flagUpdates).forEach(([k, v]) => {
        useAdeStore.getState().setStoryFlag(k, v, 'scenario', activeScenario?.id);
      });
    }

    // Mark previous beat with chosen decision & mandate summary
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
            checkResult: mandate.diceSummary ? mandate.diceSummary.formula : (skillCheckRoll ? skillCheckRoll.summary : null)
          }
        };
        setBeats(updatedBeats);
      }
    }

    const protagonistContext = activeOperative
      ? `Protagonist: ${activeOperative.name} (${activeOperative.species} ${activeOperative.archetype}). Focus: ${activeOperative.focus || activeOperative.concept}. Vitals: Shields ${activeOperative.vitals.shields}/${activeOperative.vitals.maxShields}, Health ${activeOperative.vitals.health}/${activeOperative.vitals.maxHealth}. Source: ${activeOperative.sourceLabel}. Active Modifiers: ${activeModifiers.map(m => m.name).join(', ') || 'None'}.`
      : 'Perspective: Open Narrative Script / Omniscient Director Directive.';

    const scenarioContext = `
Foundry Scenario: "${activeScenario?.title || 'Tactical Encounter'}"
Location Type: ${activeScenario?.type || 'Encounter Area'}
Read-Aloud Briefing: ${activeScenario?.fields?.readAloud || activeScenario?.content || 'Immediate tactical engagement'}
Tactical Clues & Obstacles: ${(activeScenario?.fields?.bulletPoints || []).join('; ')}
Threats: ${(activeScenario?.fields?.threats || []).map(t => `${t.name} (${t.tier})`).join(', ')}
Guidance: ${typeof getActiveGemsText === 'function' ? getActiveGemsText() : 'Sci-Fi Action'}
`;

    const recentBeatsText = updatedBeats.slice(-3).map(b => `[Beat #${b.beatIndex} - ${b.protagonistName}]: ${b.text}`).join('\n\n');

    // Structural mandate prompt formatting ensures 100% subordination of the LLM
    const mandatePromptText = formatMandateForPrompt(mandate);

    const prompt = `You are AIME, the Creative AI Overseer running an interactive Tangent SFF RPG tactical encounter.
${scenarioContext}
${protagonistContext}

Story history so far:
${recentBeatsText || 'Scene commencement.'}

${mandatePromptText}

INSTRUCTIONS:
1. Write exactly ONE OR TWO atmospheric paragraphs (120-180 words) depicting direct sensory consequences. Honor Tangent SFF rules (Tech Levels 0-5, kinetic shields, physical armor soak, called shots, and trauma thresholds).
2. Conclude with a Decision Gate containing exactly 3 distinct tactical branching options for the next action.
FORMAT YOUR OUTPUT AS VALID JSON:
{
  "narrative": "Paragraph text here...",
  "mandateExecutionSummary": "${mandate.systemIntent} - ${mandate.narrativeBounds.prescribedOutcome.replace(/"/g, "'")}",
  "gate": {
    "prompt": "What is the operative's next move?",
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
        mandate,
        enforceJson: true,
        tierKey: selectedLodTier,
        onChunk: (chunk) => {
          accumulated += chunk;
          setActiveStreamingText(accumulated);
        }
      });

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
              { id: "1", text: "Press offensive from cover", skill: "Ballistics CR 12" },
              { id: "2", text: "Slice terminal to cycle blast doors", skill: "Slicing CR 13" },
              { id: "3", text: "Reposition and assess perimeter", skill: "Reflex CR 11" }
            ]
          }
        };
      }

      const newBeat = {
        id: `beat_${Date.now()}`,
        beatIndex: updatedBeats.length + 1,
        scenarioId: activeScenario?.id,
        scenarioTitle: activeScenario?.title,
        protagonistName: activeOperative?.name || 'Operative',
        text: parsed.narrative || accumulated,
        gate: parsed.gate || null,
        mandate: mandate,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalBeats = [...updatedBeats, newBeat];
      setBeats(finalBeats);
      setActiveStreamingText('');
      setCustomActionInput('');
      setSkillCheckRoll(null);
      AudioService.playTerminalBeep(1200, 0.05);

      // Auto-save to session storage
      syncSessionToStorage({
        id: currentSessionId,
        storyId: universeState?.id || 'default_story',
        activeScenarioId: activeScenario?.id,
        activeScenarioTitle: activeScenario?.title,
        mode: directorMode,
        partyMode,
        operatives,
        activeOperativeId,
        activeModifiers,
        beats: finalBeats,
        updatedAt: new Date().toISOString()
      });

      if (directorMode === 'director') {
        VttEventBus.emit('chat-message', {
          sender: `DIRECTOR • ${activeScenario?.title || 'Story'}`,
          text: newBeat.text,
          type: 'narration',
          timestamp: newBeat.timestamp
        });
      }
    } catch (err) {
      console.error('Interactive beat error:', err);
      showToast('Error synthesizing story beat');
    } finally {
      setIsGenerating(false);
      setGeneratingActionText('');
    }
  };

  // ── PHASE 4: EPISTEMIC INTERROGATION & DEDUCTION HANDLER ──
  const handleExecuteEpistemicInterrogation = async () => {
    if (!epistemicQuery.trim() || isEpistemicSubmitting) return;
    setIsEpistemicSubmitting(true);
    AudioService.playTerminalBeep(1100, 0.05);

    try {
      const skillName = epistemicTargetType === 'terminal' ? 'Slicing' : (epistemicTargetType === 'artifact' ? 'Perception' : 'Etiquette');
      const dc = 12;

      const check = adjudicateActionCheck({
        actionText: `Epistemic interrogation: "${epistemicQuery}" directed at ${epistemicTargetName || epistemicTargetType}`,
        operative: activeOperative,
        targetEntity: activeScenario,
        targetDC: dc,
        skillName,
        activeModifiers,
        storyFlags: useAdeStore.getState().storyFlags || {}
      });

      const prompt = `Epistemic Investigation & Deduction Query:
Target: ${epistemicTargetName || epistemicTargetType} (${epistemicTargetType.toUpperCase()})
Investigator: ${activeOperative?.name || 'Operative'}
Question: "${epistemicQuery}"
Check Result: ${check.systemIntent} (${check.diceSummary?.formula || 'Adjudicated'})

Instructions:
Ground your response strictly in the scenario lore, active story flags, and facts from the database.
If the check succeeded (${check.systemIntent === 'EXECUTE_SUCCESS' || check.systemIntent === 'CRITICAL_TRIUMPH'}), reveal genuine verifiable clues, tactical frequencies, motives, or logical deductions without halluncinating invalid stats.
If the check failed or was refused, have the target stonewall, deflect with disinformation, or emit a security rejection bark.
Respond in 2-3 concise in-character sentences.`;

      const response = await generateContent({
        prompt,
        context: activeScenario,
        tierKey: selectedLodTier
      });

      const logEntry = {
        id: `epi_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        target: epistemicTargetName || (epistemicTargetType === 'npc' ? 'Interrogated NPC' : epistemicTargetType === 'terminal' ? 'Security Terminal' : 'Investigated Artifact'),
        targetType: epistemicTargetType,
        query: epistemicQuery,
        checkSummary: check.diceSummary?.formula || check.systemIntent,
        systemIntent: check.systemIntent,
        isSuccess: check.systemIntent === 'EXECUTE_SUCCESS' || check.systemIntent === 'CRITICAL_TRIUMPH',
        answer: response
      };

      setEpistemicFeed(prev => [logEntry, ...prev]);
      setEpistemicQuery('');

      if (check.systemIntent === 'CRITICAL_TRIUMPH') {
        useAdeStore.getState().setStoryFlag('epistemic_breakthrough', true, 'scenario', activeScenario?.id);
      } else if (check.systemIntent === 'CRITICAL_FUMBLE') {
        useAdeStore.getState().setStoryFlag('investigation_compromised', true, 'scenario', activeScenario?.id);
      }

      AudioService.playTerminalBeep(1300, 0.06);
    } catch (e) {
      console.warn('Epistemic interrogation failed:', e);
      showToast('Epistemic interrogation query failed');
    } finally {
      setIsEpistemicSubmitting(false);
    }
  };

  const handleCommitToStoryWeaver = () => {
    if (beats.length === 0 || !activeScenario?.id) return;
    const beatTexts = beats.map(b => `<p><strong>[Beat #${b.beatIndex} - ${b.protagonistName}]:</strong> ${b.text}</p>`).join('');
    const existing = activeScenario.content || '';
    const merged = existing ? `${existing}<br/><hr/><h3>Interactive Play Beats Log:</h3>${beatTexts}` : beatTexts;

    if (typeof updateStory === 'function') {
      updateStory(activeScenario.id, { content: merged });
      AudioService.playTerminalBeep(1300, 0.08);
      showToast(`✓ Committed ${beats.length} beats into Story Weaver for "${activeScenario.title}"!`);
    }
  };

  const handleExportMarkdown = () => {
    const md = exportSessionMarkdown({
      id: currentSessionId,
      activeScenarioTitle: activeScenario?.title,
      partyMode,
      mode: directorMode,
      operatives,
      activeModifiers,
      beats,
      createdAt: new Date().toISOString()
    }, activeScenario);

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeScenario?.title || 'interactive-session').toLowerCase().replace(/\s+/g, '-')}-transcript.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Exported Markdown Transcript');
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
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#080c14] font-mono select-none">
      {/* ── TOP INTEGRATED HEADER: SCENARIO & DATABASE PERSONA SELECTOR ── */}
      <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-2.5 shrink-0 flex-wrap text-xs z-20">
        {/* Left: Scenario Selector & Presentation Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={14} className="text-amber-400 shrink-0" />
          <select
            value={activeScenario?.id || ''}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedScenarioId(val);
              if (onSelectScenario) onSelectScenario(val);
              if (setActiveScenarioId) setActiveScenarioId(val);
            }}
            className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold px-2 py-1 rounded-lg outline-none focus:border-cyan-400 text-xs max-w-[170px] md:max-w-[210px] truncate cursor-pointer"
            title="Select Scenario to Play"
          >
            {allFoundryScenarios.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                {s.title || 'Untitled Scenario'} ({s.type || 'Scene'})
              </option>
            ))}
          </select>

          {/* Presentation Mode Selector: Fullscreen Play vs Split View vs Fullscreen Stage */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs ml-1">
            <button
              type="button"
              onClick={() => setLayoutMode('fullscreen_play')}
              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                layoutMode === 'fullscreen_play'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fullscreen Interactive Play"
            >
              <Maximize2 size={11} />
              <span className="hidden sm:inline">Play</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                layoutMode === 'split'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Side-by-Side Dual-Pane Split View"
            >
              <Columns size={11} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('fullscreen_stage')}
              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                layoutMode === 'fullscreen_stage'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fullscreen Tactical Stage (VTT)"
            >
              <Swords size={11} />
              <span className="hidden sm:inline">Stage</span>
            </button>
          </div>

          {/* Split Ratio Presets */}
          {layoutMode === 'split' && (
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-950 px-1 py-0.5 rounded-lg border border-emerald-500/30 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => setSplitRatio('story_bias')}
                className={`px-1.5 py-0.2 rounded ${splitRatio === 'story_bias' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                title="75% Story / 25% Stage"
              >
                75/25
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio('50_50')}
                className={`px-1.5 py-0.2 rounded ${splitRatio === '50_50' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                title="50% Story / 50% Stage"
              >
                50/50
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio('stage_bias')}
                className={`px-1.5 py-0.2 rounded ${splitRatio === 'stage_bias' ? 'bg-emerald-500/30 text-emerald-300 font-extrabold' : 'text-slate-400'}`}
                title="25% Story / 75% Stage"
              >
                25/75
              </button>
            </div>
          )}
        </div>

        {/* Center/Right: Database Persona Selector & Party Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Database Personas Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-0.5 text-xs">
            <Database size={11} className="text-cyan-400 shrink-0" />
            <span className="text-[10px] text-slate-400 uppercase font-bold hidden xl:inline">Operative DB:</span>
            <select
              value={selectedOperativeId}
              onChange={(e) => setSelectedOperativeId(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-bold text-xs outline-none max-w-[160px] md:max-w-[190px] truncate cursor-pointer"
              title="Select Operative from Database Content"
            >
              {allDatabasePersonas.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.name} [{p.sourceLabel}]
                </option>
              ))}
            </select>
          </div>

          {/* Party Mode: Solo by default vs Group */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPartyMode('solo')}
              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                partyMode === 'solo'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Solo Operative Mode (Default)"
            >
              <User size={11} />
              <span>Solo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPartyMode('group');
                if (operatives.length < 2 && allDatabasePersonas.length > 1) {
                  setOperatives(allDatabasePersonas.slice(0, 3));
                }
              }}
              className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                partyMode === 'group'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/60'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fireteam Squad Mode"
            >
              <Users size={11} />
              <span>Squad</span>
            </button>
          </div>

          {/* Hardware Mitigation & Level-of-Detail (LOD) Tiering */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2 py-0.5 text-xs" title="Level-of-Detail (LOD) Hardware Mitigation & KV-Cache GQA Compression">
            <Cpu size={11} className="text-cyan-400 shrink-0" />
            <select
              value={selectedLodTier}
              onChange={(e) => setSelectedLodTier(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-mono text-xs outline-none cursor-pointer"
              title="Select Inference LOD Tier"
            >
              <option value="auto" className="bg-slate-900 text-slate-100">Auto LOD (Adaptive)</option>
              <option value="tier1_hero" className="bg-slate-900 text-slate-100">LOD-1: 8B Q4_K_M (Hero/Boss)</option>
              <option value="tier2_tactical" className="bg-slate-900 text-slate-100">LOD-2: 3B Q4_K_M (Tactical)</option>
              <option value="tier3_ambient" className="bg-slate-900 text-slate-100">LOD-3: 1B Q4_K_M (Ambient)</option>
            </select>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono hidden xl:inline">
              {calculateVramTelemetry(selectedLodTier).badge} • {calculateVramTelemetry(selectedLodTier).fits8GbVram ? '✓ Fits 8GB' : 'High VRAM'}
            </span>
          </div>

          {/* Epistemic Interrogation Toggle */}
          <button
            type="button"
            onClick={() => setIsEpistemicConsoleOpen(prev => !prev)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              isEpistemicConsoleOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Epistemic Interrogation & Deduction Console"
          >
            <Brain size={11} className={isEpistemicConsoleOpen ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
            <span className="hidden md:inline">Epistemic Investigation</span>
          </button>

          {/* Director Mode */}
          <button
            type="button"
            onClick={() => setDirectorMode(prev => prev === 'solo' ? 'director' : 'solo')}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              directorMode === 'director'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle GM Director Overseer mode with stage chat broadcast"
          >
            <Radio size={11} className={directorMode === 'director' ? 'animate-pulse text-rose-400' : ''} />
            <span className="hidden md:inline">{directorMode === 'director' ? 'GM DIRECTOR' : 'SOLO PLAY'}</span>
          </button>

          {/* Ambient Audio Toggle */}
          <button
            type="button"
            onClick={handleToggleAmbientAudio}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isAmbientDroneActive
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-xs'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isAmbientDroneActive ? "Mute Ambient Sci-Fi Drone" : "Start Ambient Sci-Fi Drone"}
          >
            {isAmbientDroneActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Markdown & Commit Actions */}
          {beats.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCommitToStoryWeaver}
                className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Commit narrative beats into Story Weaver manuscript"
              >
                <FileText size={10} />
                <span className="hidden xl:inline">Weaver</span>
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                title="Export session transcript as Markdown (.md)"
              >
                MD
              </button>
            </div>
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

      {/* ── TOP SUB-BARS: FIRETEAM VITALS & DYNAMIC DATABASE MODIFIERS ── */}
      <FireteamVitalsBar
        partyMode={partyMode}
        operatives={operatives}
        activeOperativeId={activeOperativeId}
        onSelectActiveOperative={setActiveOperativeId}
        onUpdateOperativeVitals={handleUpdateOperativeVitals}
        isFolioLinked={activeOperative?.sourceType === 'folio'}
      />

      <ActiveModifiersPillBar
        activeModifiers={activeModifiers}
        onAddModifier={handleAddModifier}
        onRemoveModifier={handleRemoveModifier}
        availableDatabaseModifiers={availableDatabaseModifiers}
        folioCharacter={characterData}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-28 right-6 z-50 bg-slate-900 border border-cyan-500 text-cyan-200 text-xs px-3 py-1.5 rounded-xl shadow-2xl animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* ── MAIN WORKSPACE PRESENTATION BRANCHES ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full relative">
        {/* PRESENTATION 1: FULLSCREEN TACTICAL STAGE */}
        {layoutMode === 'fullscreen_stage' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <TacticalStageViewport
              activeNode={activeScenario}
              linkedMap={propLinkedMap}
              allAvailableMaps={propAllAvailableMaps || mapsCatalog}
              universeState={universeState}
              updateStory={updateStory}
              setActiveMapId={setActiveMapId}
              addMap={addMap}
              handleCreateNewMapForElement={handleCreateNewMapForElement}
            />
          </div>
        )}

        {/* PRESENTATION 2: FULLSCREEN INTERACTIVE PLAY */}
        {layoutMode === 'fullscreen_play' && (
          <div className="h-full w-full flex flex-col overflow-hidden bg-[#090d16]">
            {/* Scrollable Story Beats Stream */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 scrollbar-thin">
              {beats.length === 0 && !activeStreamingText && !isGenerating && (
                <div className="max-w-xl mx-auto text-center py-16 text-slate-500 space-y-3 font-mono text-xs">
                  <Compass size={40} className="mx-auto text-cyan-500/60 animate-pulse" />
                  <p className="text-slate-300 font-bold uppercase tracking-wider text-sm">
                    {activeScenario?.title || 'Interactive Tactical Scenario'}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                    {activeScenario?.fields?.readAloud
                      ? `"${activeScenario.fields.readAloud.slice(0, 160)}..."`
                      : 'Select a tactical action or author-scripted branch in the Decision Gate below to commence.'}
                  </p>
                </div>
              )}

              {/* Existing Beats Feed */}
              {beats.map((beat) => (
                <div
                  key={beat.id}
                  className="max-w-3xl mx-auto bg-slate-900/85 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850 pb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase tracking-wider">
                      Beat #{beat.beatIndex} • {beat.protagonistName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSpeakBeat(beat.id, beat.text)}
                        className={`hover:text-cyan-300 transition-colors p-0.5 rounded cursor-pointer ${
                          isSpeakingBeatId === beat.id ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
                        }`}
                        title="Narrate Beat Aloud (TTS)"
                      >
                        <Volume2 size={13} />
                      </button>
                      <span>{beat.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-slate-100 text-sm leading-relaxed font-sans select-text">
                    {beat.text}
                  </p>

                  {/* Neuro-Symbolic Structural Mandate Badge */}
                  {beat.mandate && (
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs shadow-inner">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded uppercase tracking-wider ${
                            beat.mandate.systemIntent === 'CRITICAL_TRIUMPH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                            beat.mandate.systemIntent === 'EXECUTE_SUCCESS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60' :
                            beat.mandate.systemIntent === 'REFUSE_ACTION' ? 'bg-amber-950 text-amber-300 border border-amber-600/70' :
                            beat.mandate.systemIntent === 'CRITICAL_FUMBLE' ? 'bg-red-950 text-red-300 border border-red-600/70 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                            'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}>
                            ⚙️ {beat.mandate.systemIntent}
                          </span>
                          {beat.mandate.narrativeBounds?.refusalReason && (
                            <span className="text-amber-300 text-[10px] bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                              [{beat.mandate.narrativeBounds.refusalReason}]
                            </span>
                          )}
                        </div>
                        {beat.mandate.diceSummary && (
                          <span className="text-[10px] font-mono text-slate-400">
                            🎲 {beat.mandate.diceSummary.formula}
                          </span>
                        )}
                      </div>

                      {beat.mandate.narrativeBounds?.requiredSensoryCues?.length > 0 && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                          <span className="text-slate-500 font-semibold">Sensory Mandate:</span>
                          <span className="italic text-slate-300">{beat.mandate.narrativeBounds.requiredSensoryCues.join('; ')}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-0.5">
                        {beat.mandate.mechanicalOutcomes?.shieldsDelta !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                            Shields: {beat.mandate.mechanicalOutcomes.shieldsDelta > 0 ? '+' : ''}{beat.mandate.mechanicalOutcomes.shieldsDelta}
                          </span>
                        )}
                        {beat.mandate.mechanicalOutcomes?.damageDealt !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-rose-300 font-mono">
                            Damage: {beat.mandate.mechanicalOutcomes.damageDealt}
                          </span>
                        )}
                        {beat.mandate.mechanicalOutcomes?.conditionsApplied?.map(cond => (
                          <span key={cond} className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-800 text-red-300">
                            + {cond}
                          </span>
                        ))}
                        {beat.mandate.mechanicalOutcomes?.bulkheadToggled && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                            Bulkhead: {beat.mandate.mechanicalOutcomes.bulkheadToggled.state}
                          </span>
                        )}
                        {beat.mandate.mechanicalOutcomes?.alarmRaised && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800 text-amber-300 animate-pulse">
                            Security Alert Raised
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {beat.gate?.chosenOption && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-900/50 flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <ArrowRight size={12} className="text-cyan-400 shrink-0" />
                        <span>Action Taken: {beat.gate.chosenOption}</span>
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

              {/* Streaming Active Beat */}
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

            {/* Bottom Decision Cockpit */}
            <div className="border-t border-slate-800 bg-slate-950/95 p-3 md:p-4 shrink-0 shadow-2xl">
              <div className="max-w-3xl mx-auto space-y-3">
                {/* Pre-authored Graph Branches from Scenario Database */}
                {preAuthoredBranches.length > 0 && (
                  <div className="space-y-1.5 border-b border-slate-800/80 pb-2.5">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <GitBranch size={12} className="text-purple-400" />
                      <span>Author-Scripted Story Branches:</span>
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {preAuthoredBranches.map((branch) => (
                        <button
                          key={branch.id}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleAdvanceBeat(branch.text, branch.targetScenarioId)}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <ChevronRight size={12} className="text-purple-400" />
                          <span>{branch.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Gate Header & Dice Check Results */}
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
                    <ChevronRight size={14} className="text-amber-400" />
                    <span>Decision Gate: {activeBeat?.gate?.prompt || 'Declare Operative Action:'}</span>
                  </span>

                  {skillCheckRoll && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                      skillCheckRoll.isSuccess 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm' 
                        : 'bg-rose-950 text-rose-300 border-rose-500/50'
                    }`}>
                      {skillCheckRoll.formula} ➔ {skillCheckRoll.tierLabel}
                    </span>
                  )}
                </div>

                {/* 3 AI Dynamic Branching Options */}
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
                              title="Roll Canonical 2d10 with Operative Sub-Attributes & Active Modifiers"
                            >
                              🎲 Roll 2d10
                            </button>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Epistemic Interrogation & Deduction Console */}
                {isEpistemicConsoleOpen && (
                  <div className="p-3 bg-slate-900/90 border border-amber-500/50 rounded-xl space-y-2.5 animate-in fade-in shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Brain size={13} className="text-amber-400" />
                        <span>Epistemic Interrogation & Free-Form Deduction</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('npc')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'npc' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          Interrogate NPC
                        </button>
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('terminal')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'terminal' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          Slice Terminal
                        </button>
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('artifact')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${epistemicTargetType === 'artifact' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          Deduce Clue
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={epistemicTargetName}
                        onChange={e => setEpistemicTargetName(e.target.value)}
                        placeholder={epistemicTargetType === 'npc' ? "Target Name (e.g. Syndicate Officer, Smuggler)..." : epistemicTargetType === 'terminal' ? "Terminal ID (e.g. Sub-deck Data Core)..." : "Clue Object (e.g. Ancient Cipher Disc)..."}
                        className="w-1/3 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        value={epistemicQuery}
                        onChange={e => setEpistemicQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleExecuteEpistemicInterrogation(); }}
                        placeholder="Ask free-form deduction or interrogation question..."
                        className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        disabled={isEpistemicSubmitting || !epistemicQuery.trim()}
                        onClick={handleExecuteEpistemicInterrogation}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isEpistemicSubmitting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                        <span>Inquire</span>
                      </button>
                    </div>

                    {/* Interrogation Clue Feed */}
                    {epistemicFeed.length > 0 && (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1.5 border-t border-slate-800 text-[11px] scrollbar-thin">
                        {epistemicFeed.slice(0, 3).map(entry => (
                          <div key={entry.id} className="p-2 rounded bg-slate-950/80 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-amber-300">Target: {entry.target}</span>
                              <span className={`px-1 py-0.2 rounded font-mono ${entry.isSuccess ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                                {entry.systemIntent}
                              </span>
                            </div>
                            <div className="text-slate-400 italic">"{entry.query}"</div>
                            <div className="text-slate-200">{entry.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    placeholder={activeOperative ? `Declare ${activeOperative.name}'s action or tactical response...` : 'Declare operative action...'}
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
        )}

        {/* PRESENTATION 3: SIDE-BY-SIDE SPLIT VIEW */}
        {layoutMode === 'split' && (
          <Split
            sizes={splitSizes}
            minSize={[300, 300]}
            gutterSize={6}
            direction="horizontal"
            className="flex h-full w-full overflow-hidden split-horizontal flex-1 min-h-0"
          >
            {/* Left Pane: Interactive Play Studio */}
            <div className="h-full w-full overflow-hidden bg-[#090d16] flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
                {beats.length === 0 && !activeStreamingText && !isGenerating && (
                  <div className="text-center py-12 text-slate-500 space-y-2 font-mono text-xs">
                    <Compass size={32} className="mx-auto text-cyan-500/60 animate-pulse" />
                    <p className="text-slate-300 font-bold uppercase">{activeScenario?.title || 'Tactical Scenario'}</p>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                      Declare an operative move below to synthesize the initial scenario beat.
                    </p>
                  </div>
                )}

                {beats.map((beat) => (
                  <div
                    key={beat.id}
                    className="bg-slate-900/85 border border-slate-800 rounded-xl p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850 pb-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase">
                        Beat #{beat.beatIndex} • {beat.protagonistName}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakBeat(beat.id, beat.text)}
                          className="hover:text-cyan-300 p-0.5 cursor-pointer"
                          title="TTS Read-Aloud"
                        >
                          <Volume2 size={12} className={isSpeakingBeatId === beat.id ? 'text-cyan-400 animate-pulse' : 'text-slate-500'} />
                        </button>
                        <span>{beat.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-slate-100 text-xs leading-relaxed font-sans select-text">
                      {beat.text}
                    </p>

                    {/* Neuro-Symbolic Structural Mandate Badge */}
                    {beat.mandate && (
                      <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                            beat.mandate.systemIntent === 'CRITICAL_TRIUMPH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/70' :
                            beat.mandate.systemIntent === 'EXECUTE_SUCCESS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60' :
                            beat.mandate.systemIntent === 'REFUSE_ACTION' ? 'bg-amber-950 text-amber-300 border border-amber-600/70' :
                            beat.mandate.systemIntent === 'CRITICAL_FUMBLE' ? 'bg-red-950 text-red-300 border border-red-600/70' :
                            'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}>
                            ⚙️ {beat.mandate.systemIntent}
                          </span>
                          {beat.mandate.diceSummary && (
                            <span className="text-[9px] font-mono text-slate-400">
                              🎲 {beat.mandate.diceSummary.formula}
                            </span>
                          )}
                        </div>
                        {beat.mandate.narrativeBounds?.requiredSensoryCues?.length > 0 && (
                          <div className="text-[9px] text-slate-400 truncate">
                            <span className="text-slate-500 font-semibold">Cues:</span> {beat.mandate.narrativeBounds.requiredSensoryCues.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {beat.gate?.chosenOption && (
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-cyan-900/40 text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
                        <ArrowRight size={11} className="text-cyan-400 shrink-0" />
                        <span>Decision: {beat.gate.chosenOption}</span>
                      </div>
                    )}
                  </div>
                ))}

                {activeStreamingText && (
                  <div className="bg-slate-900/90 border border-cyan-500/60 rounded-xl p-4 animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-1.5 font-bold uppercase">
                      <span>Synthesizing Beat #{beats.length + 1}...</span>
                      <Loader2 size={11} className="animate-spin" />
                    </div>
                    <p className="text-slate-100 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                      {activeStreamingText}
                    </p>
                  </div>
                )}
                <div ref={endOfBeatsRef} />
              </div>

              {/* Bottom Decision Cockpit for Split Mode */}
              <div className="border-t border-slate-800 bg-slate-950 p-3 shrink-0 space-y-2">
                {preAuthoredBranches.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pb-1 border-b border-slate-850">
                    {preAuthoredBranches.map(branch => (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => handleAdvanceBeat(branch.text, branch.targetScenarioId)}
                        className="px-2 py-1 rounded-lg bg-purple-950/70 border border-purple-500/50 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronRight size={10} />
                        <span className="truncate max-w-[140px]">{branch.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3 AI Options in Split Mode */}
                {activeBeat?.gate?.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {activeBeat.gate.options.map((opt, i) => (
                      <button
                        key={opt.id || i}
                        type="button"
                        disabled={isGenerating}
                        onClick={() => handleAdvanceBeat(opt.text)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left text-[11px] text-slate-200 flex flex-col justify-between gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <span className="leading-snug">{opt.text}</span>
                        {opt.skill && (
                          <div className="flex items-center justify-between text-[9px] text-amber-300 pt-1 border-t border-slate-800">
                            <span className="truncate">{opt.skill}</span>
                            <span
                              onClick={(e) => { e.stopPropagation(); handleRollCheck(opt.skill, 12); }}
                              className="font-bold cursor-pointer hover:underline"
                            >
                              🎲 2d10
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Epistemic Interrogation Console in Split View */}
                {isEpistemicConsoleOpen && (
                  <div className="p-2.5 bg-slate-900/95 border border-amber-500/50 rounded-lg space-y-2 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] gap-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Brain size={12} className="text-amber-400" />
                        <span>Epistemic Deduction</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('npc')}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${epistemicTargetType === 'npc' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                        >
                          NPC
                        </button>
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('terminal')}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${epistemicTargetType === 'terminal' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                        >
                          Terminal
                        </button>
                        <button
                          type="button"
                          onClick={() => setEpistemicTargetType('artifact')}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${epistemicTargetType === 'artifact' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                        >
                          Artifact
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={epistemicQuery}
                        onChange={e => setEpistemicQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleExecuteEpistemicInterrogation(); }}
                        placeholder="Ask epistemic question..."
                        className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-[11px] px-2 py-1 rounded outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        disabled={isEpistemicSubmitting || !epistemicQuery.trim()}
                        onClick={handleExecuteEpistemicInterrogation}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold rounded uppercase cursor-pointer disabled:opacity-50"
                      >
                        {isEpistemicSubmitting ? <Loader2 size={11} className="animate-spin" /> : 'Inquire'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Input row */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customActionInput}
                    onChange={e => setCustomActionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdvanceBeat(); }}
                    disabled={isGenerating}
                    placeholder="Declare operative action..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-[11px] px-2.5 py-1.5 rounded-lg outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    disabled={isGenerating || !customActionInput.trim()}
                    onClick={() => handleAdvanceBeat()}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg uppercase cursor-pointer disabled:opacity-50"
                  >
                    Act
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Live Tactical Stage (VTT) */}
            <div className="h-full w-full overflow-hidden bg-[#070b13] flex flex-col border-l border-slate-800 min-w-0 relative">
              <TacticalStageViewport
                activeNode={activeScenario}
                linkedMap={propLinkedMap}
                allAvailableMaps={propAllAvailableMaps || mapsCatalog}
                universeState={universeState}
                updateStory={updateStory}
                setActiveMapId={setActiveMapId}
                addMap={addMap}
                handleCreateNewMapForElement={handleCreateNewMapForElement}
              />
            </div>
          </Split>
        )}
      </div>
    </div>
  );
};

export default InteractiveStoryStudio;
