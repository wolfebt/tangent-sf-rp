import React, { useState, useMemo } from 'react';
import DraggablePanel from '../../pages/Foundry/MapMaker/map/DraggablePanel';
import { useFolio } from '../../context/FolioContext';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';
import {
  synthesizeCharacterWithBastion,
  getArchetypeRecommendations,
  getSpeciesRecommendations,
  getFactionRecommendations,
  getOriginRecommendations,
  getOccupationRecommendations,
  calculateRulesLedger
} from '../../services/bastionCharacterEngine';
import { DEFAULT_ARCHETYPES } from '../../data/archetypesData.js';
import { DEFAULT_SPECIES } from '../../data/speciesData.js';
import { DEFAULT_FACTIONS } from '../../data/factionsData.js';
import { DEFAULT_ORIGINS } from '../../data/originsData.js';
import { DEFAULT_OCCUPATIONS } from '../../data/occupationsData.js';

const CHARACTER_FIELDS = [
  // Core Identity
  { key: 'char-name', label: 'Character Name', category: 'Core Identity' },
  { key: 'char-archetype', label: 'Archetype', category: 'Core Identity' },
  { key: 'char-species', label: 'Species', category: 'Core Identity' },
  { key: 'char-occu', label: 'Occupation / Role', category: 'Core Identity' },
  { key: 'char-origin', label: 'Origin / Homeworld', category: 'Core Identity' },
  { key: 'char-faction', label: 'Faction Allegiance', category: 'Core Identity' },
  { key: 'char-style', label: 'Aesthetic / Style', category: 'Core Identity' },
  { key: 'notes', label: 'Tactical Notes', category: 'Core Identity' },

  // Narrative 1: Profile & Identity (8 fields)
  { key: 'role', label: 'Role in Story', category: 'Profile & Identity' },
  { key: 'char-concept', label: 'Character Archetype / Concept', category: 'Profile & Identity' },
  { key: 'summary', label: 'One-Sentence Summary', category: 'Profile & Identity' },
  { key: 'char-motive', label: 'Core Motivation', category: 'Profile & Identity' },
  { key: 'primaryConflict', label: 'Primary Conflict/Goal', category: 'Profile & Identity' },
  { key: 'nicknames', label: 'Nicknames / Aliases', category: 'Profile & Identity' },
  { key: 'socialClass', label: 'Social Class & Status', category: 'Profile & Identity' },
  { key: 'currentResidence', label: 'Current Residence', category: 'Profile & Identity' },

  // Narrative 2: Physicality & Persona (9 fields)
  { key: 'appearance', label: 'Physical Description', category: 'Physicality & Persona' },
  { key: 'voice', label: 'Voice & Speech', category: 'Physicality & Persona' },
  { key: 'clothing', label: 'Typical Clothing Style', category: 'Physicality & Persona' },
  { key: 'mannerisms', label: 'Mannerisms & Body Language', category: 'Physicality & Persona' },
  { key: 'positiveTraits', label: 'Positive Traits', category: 'Physicality & Persona' },
  { key: 'negativeTraits', label: 'Negative Traits / Flaws', category: 'Physicality & Persona' },
  { key: 'likesDislikes', label: 'Likes & Dislikes', category: 'Physicality & Persona' },
  { key: 'hobbies', label: 'Hobbies & Skills', category: 'Physicality & Persona' },
  { key: 'personalityType', label: 'Personality Type', category: 'Physicality & Persona' },

  // Narrative 3: History & Backstory (6 fields)
  { key: 'backstory', label: 'Detailed Backstory', category: 'History & Backstory' },
  { key: 'definingTrauma', label: 'Defining Trauma / Wound', category: 'History & Backstory' },
  { key: 'greatestAccomplishment', label: 'Greatest Accomplishment(s)', category: 'History & Backstory' },
  { key: 'childhoodEvents', label: 'Childhood & Adolescence Events', category: 'History & Backstory' },
  { key: 'keyRelationships', label: 'Key Relationships & Dynamics', category: 'History & Backstory' },
  { key: 'romanticHistory', label: 'Romantic History & Philosophy', category: 'History & Backstory' },

  // Narrative 4: Psychology & Metanarrative (8 fields)
  { key: 'worldview', label: 'Worldview & Ethics', category: 'Psychology & Metanarrative' },
  { key: 'theLie', label: 'The Lie They Believe', category: 'Psychology & Metanarrative' },
  { key: 'theTruth', label: 'The Truth They Must Learn', category: 'Psychology & Metanarrative' },
  { key: 'deepestFear', label: 'Deepest Fear & Secret', category: 'Psychology & Metanarrative' },
  { key: 'goals', label: 'External Goal vs Internal Need', category: 'Psychology & Metanarrative' },
  { key: 'stakes', label: 'Stakes & Character Arc', category: 'Psychology & Metanarrative' },
  { key: 'plotHooks', label: 'Plot Connection & Motives', category: 'Psychology & Metanarrative' },
  { key: 'tags', label: 'Tags', category: 'Psychology & Metanarrative' }
];

const CATEGORIES = [
  'Core Identity',
  'Profile & Identity',
  'Physicality & Persona',
  'History & Backstory',
  'Psychology & Metanarrative'
];

const BastionDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { characterData, updateField, applyGuidedCharacter } = useFolio();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator'
  const [isMinimized, setIsMinimized] = useState(false);

  // Dock / Undock state (Persisted in localStorage)
  const [isDocked, setIsDocked] = useState(() => {
    try {
      const saved = localStorage.getItem('bastion_folio_dock_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleDock = () => {
    setIsDocked(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bastion_folio_dock_mode', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'bastion', text: 'Greetings, OPERATOR. BASTION AI Assistant online. How can I assist your Tangent SFF RPG persona session today? Type /character [concept] to synthesize a canonical 5-pillar character, or /roll [dice] to roll dice (e.g. /roll 2d10+4).' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Generator State
  const [generatorMode, setGeneratorMode] = useState('staged'); // 'staged' (user-in-the-loop) | 'synthesis' (1-click 5 pillars) | 'fields' (selective)
  const [synthesizedResult, setSynthesizedResult] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    'char-name': true,
    'char-concept': true,
    'char-motive': true,
    'backstory': true
  });
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState(null);
  // Overwrite protection mode: false = Fill Blank Only (default safe mode), true = Allow Overwriting
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Staged Generator State (User in the Loop)
  const [stagedStep, setStagedStep] = useState(0); // 0: Archetype, 1: Species, 2: Faction & Origin, 3: Occupation, 4: Rules & Stats, 5: Dossier
  const [stagedPrompt, setStagedPrompt] = useState('Covert stealth sniper operative');
  const [stagedArchetype, setStagedArchetype] = useState(null);
  const [stagedSpecies, setStagedSpecies] = useState(null);
  const [stagedFaction, setStagedFaction] = useState(null);
  const [stagedOrigin, setStagedOrigin] = useState(null);
  const [stagedOccupation, setStagedOccupation] = useState(null);
  const [stagedRawAttrs, setStagedRawAttrs] = useState({
    'attr-strength': 0,
    'attr-agility': 3,
    'attr-stamina': 1,
    'attr-intellect': 2,
    'attr-wisdom': 0,
    'attr-charisma': 0
  });
  const [stagedTechLevel, setStagedTechLevel] = useState(characterData?.['tech-level'] || 3);
  const [stagedCustomName, setStagedCustomName] = useState('');
  const [stagedCustomMotive, setStagedCustomMotive] = useState('');

  // Staged Recommendations Computations
  const archetypeRecs = useMemo(() => {
    return getArchetypeRecommendations(stagedPrompt, DEFAULT_ARCHETYPES, 3);
  }, [stagedPrompt]);

  const activeArchetype = stagedArchetype || archetypeRecs[0]?.archetype || DEFAULT_ARCHETYPES[0];

  const speciesRecs = useMemo(() => {
    return getSpeciesRecommendations(activeArchetype, stagedPrompt, DEFAULT_SPECIES, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeSpecies = stagedSpecies || speciesRecs[0]?.species || DEFAULT_SPECIES[0];

  const factionRecs = useMemo(() => {
    return getFactionRecommendations(activeArchetype, stagedPrompt, DEFAULT_FACTIONS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeFaction = stagedFaction || factionRecs[0]?.faction || DEFAULT_FACTIONS[0];

  const originRecs = useMemo(() => {
    return getOriginRecommendations(activeArchetype, stagedPrompt, DEFAULT_ORIGINS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeOrigin = stagedOrigin || originRecs[0]?.origin || DEFAULT_ORIGINS[0];

  const occupationRecs = useMemo(() => {
    return getOccupationRecommendations(activeArchetype, stagedPrompt, DEFAULT_OCCUPATIONS, 3);
  }, [activeArchetype, stagedPrompt]);

  const activeOccupation = stagedOccupation || occupationRecs[0]?.occupation || DEFAULT_OCCUPATIONS[0];

  // Rules Ledger for Stage 4
  const stagedRulesLedger = useMemo(() => {
    return calculateRulesLedger({
      archetype: activeArchetype,
      species: activeSpecies,
      faction: activeFaction,
      origin: activeOrigin,
      occupation: activeOccupation,
      techLevel: stagedTechLevel,
      rawAttributes: stagedRawAttrs
    });
  }, [activeArchetype, activeSpecies, activeFaction, activeOrigin, activeOccupation, stagedTechLevel, stagedRawAttrs]);

  // Complete Dossier Synthesis for Stage 5
  const stagedPersonaResult = useMemo(() => {
    return synthesizeCharacterWithBastion({
      prompt: stagedPrompt,
      preferredArchetype: activeArchetype?.name,
      preferredSpecies: activeSpecies?.name,
      preferredFaction: activeFaction?.name,
      preferredOrigin: activeOrigin?.name,
      preferredOccupation: activeOccupation?.name,
      techLevel: stagedTechLevel,
      rawAttributes: stagedRawAttrs
    });
  }, [stagedPrompt, activeArchetype, activeSpecies, activeFaction, activeOrigin, activeOccupation, stagedTechLevel, stagedRawAttrs]);

  const handleApplyStagedPersona = async () => {
    if (!stagedPersonaResult?.character || !applyGuidedCharacter) return;
    setIsGenerating(true);
    try {
      const finalPayload = {
        ...stagedPersonaResult.character,
        'char-name': stagedCustomName.trim() || stagedPersonaResult.character['char-name'],
        'char-motive': stagedCustomMotive.trim() || stagedPersonaResult.character['char-motive']
      };
      const ok = await applyGuidedCharacter(finalPayload);
      if (ok) {
        setGenStatus({ success: `Applied Staged Persona "${finalPayload['char-name']}" to active Folio sheet!` });
      }
    } catch (err) {
      setGenStatus({ error: `Apply error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInGuidedCreator = () => {
    if (!stagedPersonaResult?.character) return;
    const finalPayload = {
      ...stagedPersonaResult.character,
      'char-name': stagedCustomName.trim() || stagedPersonaResult.character['char-name'],
      'char-motive': stagedCustomMotive.trim() || stagedPersonaResult.character['char-motive']
    };
    try {
      localStorage.setItem('bastion_staged_draft', JSON.stringify(finalPayload));
      window.dispatchEvent(new CustomEvent('open-folio-guided-creator', { detail: finalPayload }));
      setGenStatus({ success: 'Loaded Staged Persona into Guided Character Creator!' });
    } catch (e) {
      console.warn('Error saving staged draft to localStorage:', e);
    }
  };

  const updateRawAttr = (attrKey, delta) => {
    setStagedRawAttrs(prev => {
      const current = prev[attrKey] || 0;
      const next = Math.max(0, Math.min(4, current + delta)); // Canonical ceiling: max 4 at creation
      return { ...prev, [attrKey]: next };
    });
  };

  if (!isOpen) return null;

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleSynthesizePersona = async () => {
    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter a character concept or theme before synthesizing.' });
      return;
    }
    setIsGenerating(true);
    setGenStatus(null);
    try {
      const result = synthesizeCharacterWithBastion({
        prompt: genPrompt,
        techLevel: characterData?.['tech-level'] || 3
      });
      if (result.success) {
        setSynthesizedResult(result);
        setGenStatus({
          success: `BASTION synthesized persona based on 5 Pillars: ${result.pillars.archetype.name} · ${result.pillars.species.name} · ${result.pillars.faction.name} · ${result.pillars.origin.name} · ${result.pillars.occupation.name}!`
        });
      } else {
        setGenStatus({ error: result.error || 'Failed to synthesize character.' });
      }
    } catch (err) {
      setGenStatus({ error: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySynthesizedPersona = async () => {
    if (!synthesizedResult?.character || !applyGuidedCharacter) return;
    setIsGenerating(true);
    try {
      const ok = await applyGuidedCharacter(synthesizedResult.character);
      if (ok) {
        setGenStatus({ success: `Applied "${synthesizedResult.character['char-name']}" to active Persona Folio!` });
      }
    } catch (err) {
      setGenStatus({ error: `Apply error: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isChatLoading) return;

    const userText = inputVal.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputVal('');

    // Check for /roll command
    if (userText.startsWith('/roll')) {
      const rollResult = parseRollCommand(userText);
      if (rollResult.success) {
        setMessages([
          ...newMessages,
          {
            sender: 'bastion',
            isRoll: true,
            text: `🎲 DICE ROLL RESULT [${rollResult.expr}]: Total = ${rollResult.total} (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})`
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          { sender: 'bastion', text: rollResult.error }
        ]);
      }
      return;
    }

    // Check for /character command or character creation queries
    const lowerText = userText.toLowerCase();
    if (lowerText.startsWith('/character') || lowerText.startsWith('/char') || lowerText.includes('create a character') || lowerText.includes('create character') || lowerText.includes('build a character') || lowerText.includes('build an operative')) {
      const promptQuery = userText.replace(/^\/(character|char)\s*/i, '').trim() || 'Tactical operative';
      const synth = synthesizeCharacterWithBastion({
        prompt: promptQuery,
        techLevel: characterData?.['tech-level'] || 3
      });

      if (synth.success) {
        const { pillars, character, allocationsReport } = synth;
        const replyText = `🤖 **BASTION 5-PILLAR CHARACTER SYNTHESIS**\n\n` +
          `Grounded strictly in the Omnicortex Canonical Database:\n` +
          `* **1. Archetype:** ${pillars.archetype.name} (${pillars.archetype.sphere})\n` +
          `* **2. Species:** ${pillars.species.name}\n` +
          `* **3. Faction:** ${pillars.faction.name}\n` +
          `* **4. Origin:** ${pillars.origin.name}\n` +
          `* **5. Occupation:** ${pillars.occupation.name}\n\n` +
          `**Core Attributes:** STR ${character['attr-strength']}, AGI ${character['attr-agility']}, STA ${character['attr-stamina']}, INT ${character['attr-intellect']}, WIS ${character['attr-wisdom']}, CHA ${character['attr-charisma']}\n` +
          `**Skills (${allocationsReport.skillsCount} Ranks):** ${character.skills.slice(0, 6).map(s => `${s.name} ${s.rank}`).join(', ')}...\n` +
          `**Features & Traits:** ${character.features.slice(0, 2).map(f => f.name).join(', ')} | ${character.traits.slice(0, 2).map(t => t.name).join(', ')}\n` +
          `**Property:** ${character.weapons.map(w => w.name).join(', ')} · ${character.armor.map(a => a.name).join(', ')}\n\n` +
          `*Summary: ${character.summary}*\n\n` +
          `*(Switch to the **⚡ Generator** tab to review and apply this 5-pillar persona to your sheet!)*`;

        setSynthesizedResult(synth);
        setMessages(prev => [...prev, { sender: 'bastion', text: replyText }]);
        return;
      }
    }

    setIsChatLoading(true);
    const response = await sendBastionChatMessage({ 
      prompt: userText, 
      history: messages,
      contextData: { activeCharacter: characterData } 
    });
    setIsChatLoading(false);

    setMessages(prev => [...prev, { sender: 'bastion', text: response.text }]);
  };

  const safeCharData = characterData || {};

  // Helper to check if a character field currently has non-empty text
  const hasFieldContent = (key) => {
    if (key === 'notes') {
      return Boolean(Array.isArray(safeCharData.notes) && safeCharData.notes[0] && safeCharData.notes[0].text && safeCharData.notes[0].text.trim());
    }
    return Boolean(safeCharData[key] && String(safeCharData[key]).trim());
  };

  // Select all fields helper
  const selectAllFields = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      newSelected[f.key] = true;
    });
    setSelectedFields(newSelected);
  };

  // Select narrative fields only helper
  const selectNarrativeOnly = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      if (f.category !== 'Core Identity') {
        newSelected[f.key] = true;
      }
    });
    setSelectedFields(newSelected);
  };

  // Select all blank fields helper
  const selectBlankOnly = () => {
    const newSelected = {};
    CHARACTER_FIELDS.forEach(f => {
      newSelected[f.key] = !hasFieldContent(f.key);
    });
    setSelectedFields(newSelected);
  };

  // Clear all selections
  const clearAllFields = () => {
    setSelectedFields({});
  };

  const handleGenerate = async () => {
    let fieldsToGen = Object.keys(selectedFields).filter(k => selectedFields[k]);
    if (fieldsToGen.length === 0) {
      setGenStatus({ error: 'Please select at least one character field to generate.' });
      return;
    }

    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter instructions/prompt before generating.' });
      return;
    }

    // Overwrite Protection Filter: If overwriteMode is false, filter out fields that already have content
    if (!overwriteMode) {
      const emptyFieldsOnly = fieldsToGen.filter(k => !hasFieldContent(k));
      if (emptyFieldsOnly.length === 0) {
        setGenStatus({ error: 'All selected character fields already contain content! Enable "⚡ Allow Overwrite" mode to replace existing content, or select blank fields.' });
        return;
      }
      fieldsToGen = emptyFieldsOnly;
    }

    setIsGenerating(true);
    setGenStatus(null);

    const currentValues = {};
    fieldsToGen.forEach(k => {
      if (k === 'notes') {
        currentValues[k] = Array.isArray(characterData.notes) && characterData.notes[0] ? characterData.notes[0].text : '';
      } else {
        currentValues[k] = characterData[k] || '';
      }
    });

    const result = await generateSelectiveFields({
      selectedFields: fieldsToGen,
      currentValues,
      userPrompt: genPrompt,
      elementType: 'Character Persona'
    });

    setIsGenerating(false);

    if (result.success) {
      const updatedKeys = [];
      Object.keys(result.generated).forEach(key => {
        const val = result.generated[key];
        if (key === 'notes') {
          updateField('notes', [{ text: val }]);
        } else {
          updateField(key, val);
        }
        updatedKeys.push(key);
      });

      setGenStatus({
        success: `BASTION updated character sheet fields: [${updatedKeys.map(k => CHARACTER_FIELDS.find(f => f.key === k)?.label || k).join(', ')}].`
      });
    } else {
      setGenStatus({ error: result.error || 'Character generation failed.' });
    }
  };

  const renderInnerContent = () => (
    <>
      {/* Header Bar */}
      <div className={`drag-handle flex justify-between items-center px-3.5 py-2.5 bg-slate-950 border-b border-cyan-900/60 select-none shrink-0 ${!isDocked ? 'cursor-move' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h3 className="text-cyan-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>🤖</span> BASTION AI ASSISTANT
          </h3>
          <span className="text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
            {isDocked ? 'Docked Right' : 'Floating'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Dock / Undock Toggle Button */}
          <button
            type="button"
            data-no-drag="true"
            onClick={toggleDock}
            className="text-slate-400 hover:text-cyan-300 px-2 py-0.5 text-[11px] font-mono transition-colors rounded hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1"
            title={isDocked ? "Undock into a movable floating window" : "Dock to right sidebar drawer"}
          >
            <span>{isDocked ? '↗ Undock' : '📌 Dock Right'}</span>
          </button>

          {/* Minimize toggle (only available when floating) */}
          {!isDocked && (
            <button 
              type="button"
              data-no-drag="true"
              onClick={() => setIsMinimized(prev => !prev)} 
              className="text-slate-400 hover:text-cyan-300 p-1 text-xs font-mono transition-colors rounded hover:bg-slate-800"
              title={isMinimized ? "Expand Panel" : "Minimize Panel"}
            >
              {isMinimized ? '◻' : '—'}
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            data-no-drag="true"
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 p-1 text-sm font-bold transition-colors leading-none rounded hover:bg-slate-800 ml-0.5"
            title="Close BASTION Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {(!isMinimized || isDocked) && (
        <>
          {/* Mode Selection Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/80 p-1 gap-1 shrink-0">
            <button
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'chat'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chatbot
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'generator'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('generator')}
            >
              ⚡ Generator
            </button>
          </div>

          {/* Tab 1: Chatbot */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d1117]/80">
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0d1117]/90 text-xs font-mono">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                      {msg.sender === 'user' ? 'OPERATOR' : 'BASTION System'}
                    </span>
                    <div
                      className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 rounded-br-none font-sans'
                          : msg.isRoll
                          ? 'bg-amber-950/60 text-amber-200 border border-amber-500/60 font-mono shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none font-sans'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>BASTION analyzing request...</span>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask BASTION or /roll 2d10+4..."
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Character Field Generator & 5 Pillars Persona Synthesizer */}
          {activeTab === 'generator' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3.5 text-xs bg-[#0d1117]/80">
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block">
                    Active Persona
                  </span>
                  <span className="font-bold text-amber-400 text-xs truncate block max-w-[200px]">
                    {characterData['char-name'] ? characterData['char-name'].toUpperCase() : 'UNNAMED PERSONA'}
                  </span>
                </div>
                <span className="text-[10px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-mono">
                  TL-{characterData['tech-level'] || 3}
                </span>
              </div>

              {/* Generator Sub-Mode Selector */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-cyan-900/40 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setGeneratorMode('staged')}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    generatorMode === 'staged'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🧭 Staged Persona</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode('synthesis')}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    generatorMode === 'synthesis'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚡ 1-Click Fast</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode('fields')}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    generatorMode === 'fields'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📝 Selective</span>
                </button>
              </div>

              {/* Sub-Mode 0: Staged Persona Generator (User in the Loop) */}
              {generatorMode === 'staged' && (
                <div className="space-y-3">
                  {/* Stage Progress Stepper */}
                  <div className="bg-slate-950/90 p-1 rounded-lg border border-cyan-900/50 flex items-center justify-between text-[10px] font-mono gap-1">
                    {[
                      { step: 0, label: '1. Archetype' },
                      { step: 1, label: '2. Species' },
                      { step: 2, label: '3. Faction/Origin' },
                      { step: 3, label: '4. Occupation' },
                      { step: 4, label: '5. Rules & Stats' },
                      { step: 5, label: '6. Dossier' }
                    ].map(s => (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setStagedStep(s.step)}
                        className={`px-1.5 py-1 rounded transition-all truncate text-center flex-1 ${
                          stagedStep === s.step
                            ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                            : stagedStep > s.step
                            ? 'text-emerald-400 hover:text-emerald-300 bg-slate-900/60'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Stage 0: Concept & Archetype */}
                  {stagedStep === 0 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 1 of 6: Concept & Archetype Chassis
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                            100 Canonical Archetypes
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Define your persona concept or tactical archetype. BASTION evaluates your prompt and ranks canonical archetypes from the 4 Spheres (Sentinels, Operatives, Visionaries, Savants).
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {[
                            'Covert Operative Sniper',
                            'Syndicate Cyber-Decker',
                            'Frontline Shock Trooper',
                            'Alterian Diplomat Envoy',
                            'Combat Trauma Medic',
                            'Awakened Mystic Mentalist'
                          ].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setStagedPrompt(preset);
                                setStagedArchetype(null);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10px] transition-colors"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={stagedPrompt}
                          onChange={(e) => {
                            setStagedPrompt(e.target.value);
                            setStagedArchetype(null);
                          }}
                          placeholder="Enter character concept, tactical role, cybernetics, or background..."
                          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded text-xs outline-none font-sans"
                        />
                      </div>

                      {/* BASTION Archetype Recommendations */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                            🤖 BASTION Recommendations ({archetypeRecs.length} Matches)
                          </span>
                          <span className="text-slate-400 text-[10px]">Click to Select Chassis</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {archetypeRecs.map((rec) => {
                            const isSelected = (activeArchetype?.name === rec.archetype.name);
                            return (
                              <div
                                key={rec.archetype.name}
                                onClick={() => setStagedArchetype(rec.archetype)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-amber-300 text-xs">{rec.archetype.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                                        {rec.archetype.sphere}
                                      </span>
                                      {rec.isTopPick && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                          ⭐ Top Pick
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-0.5">{rec.archetype.core_concept || rec.archetype.summary}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                      <span>Role: {rec.archetype.tactical_role}</span>
                                      <span>•</span>
                                      <span>Attrs: {rec.archetype.primary_attribute} / {rec.archetype.secondary_attribute}</span>
                                    </div>
                                    <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                      💡 {rec.rationale}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                      isSelected
                                        ? 'bg-amber-500 text-slate-950 font-black'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Or Select Any Other Archetype */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Browse all 100 Archetypes:</span>
                          <select
                            value={activeArchetype?.name || ''}
                            onChange={(e) => {
                              const found = DEFAULT_ARCHETYPES.find(a => a.name === e.target.value);
                              if (found) setStagedArchetype(found);
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
                          >
                            {DEFAULT_ARCHETYPES.map(a => (
                              <option key={a.name} value={a.name}>{a.name} ({a.sphere})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStagedStep(1)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Species Selection</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 1: Lineage & Species */}
                  {stagedStep === 1 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 2 of 6: Canonical Species & Lineage
                          </span>
                          <span className="text-[10px] font-bold text-amber-300">
                            Archetype: {activeArchetype?.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          BASTION recommends canonical species matching {activeArchetype?.name}'s core attributes ({activeArchetype?.primary_attribute} & {activeArchetype?.secondary_attribute}).
                        </p>
                      </div>

                      {/* Species Recommendations */}
                      <div className="space-y-2">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
                          🤖 Recommended Species ({speciesRecs.length} Options)
                        </span>

                        <div className="grid grid-cols-1 gap-2">
                          {speciesRecs.map((rec) => {
                            const isSelected = (activeSpecies?.name === rec.species.name);
                            return (
                              <div
                                key={rec.species.name}
                                onClick={() => setStagedSpecies(rec.species)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-cyan-300 text-xs">{rec.species.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                                        {rec.attributeModifiersSummary}
                                      </span>
                                      {rec.isTopPick && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                          ⭐ Synergized Pick
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-1">{rec.species.summary || rec.species.description}</p>
                                    {rec.inherentTraits?.length > 0 && (
                                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                                        Inherent: {rec.inherentTraits.slice(0, 3).join(', ')}
                                      </div>
                                    )}
                                    <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                      💡 {rec.rationale}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                      isSelected
                                        ? 'bg-cyan-500 text-slate-950 font-black'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* All Species Dropdown */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Or pick from all species:</span>
                          <select
                            value={activeSpecies?.name || ''}
                            onChange={(e) => {
                              const found = DEFAULT_SPECIES.find(s => s.name === e.target.value);
                              if (found) setStagedSpecies(found);
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
                          >
                            {DEFAULT_SPECIES.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(0)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(2)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Faction & Origin</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Faction & Origin */}
                  {stagedStep === 2 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                          Stage 3 of 6: Interstellar Allegiance & Homeworld
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Each grants a dedicated 20 SP background skill package. Recommendations are canonically derived from {activeArchetype?.name}'s doctrine.
                        </p>
                      </div>

                      {/* Faction Section */}
                      <div className="space-y-2">
                        <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px] block">
                          🏛️ Canonical Faction (20 SP Package)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {factionRecs.map(rec => {
                            const isSelected = (activeFaction?.name === rec.faction.name);
                            return (
                              <div
                                key={rec.faction.name}
                                onClick={() => setStagedFaction(rec.faction)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-purple-950/40 border-purple-500/80'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                                }`}
                              >
                                <div className="min-w-0">
                                  <span className="font-bold text-purple-300 text-xs block">{rec.faction.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate">{rec.rationale}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">Skills: {rec.skillPackage?.slice(0, 3).join(', ')}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {isSelected ? '✓ Picked' : 'Select'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Origin Section */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                          🌍 Homeworld Origin (20 SP Package + 2 Traits)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {originRecs.map(rec => {
                            const isSelected = (activeOrigin?.name === rec.origin.name);
                            return (
                              <div
                                key={rec.origin.name}
                                onClick={() => setStagedOrigin(rec.origin)}
                                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-emerald-950/40 border-emerald-500/80'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                                }`}
                              >
                                <div className="min-w-0">
                                  <span className="font-bold text-emerald-300 text-xs block">{rec.origin.name}</span>
                                  <span className="text-[10px] text-slate-400 block truncate">{rec.rationale}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">Skills: {rec.skills?.slice(0, 3).join(', ')}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {isSelected ? '✓ Picked' : 'Select'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(1)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(3)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Continue to Occupation</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Occupation */}
                  {stagedStep === 3 && (
                    <div className="space-y-3">
                      <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-1.5">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                          Stage 4 of 6: Professional Career & Training
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Occupations provide the third 20 SP skill package, 2 occupational traits, and career features. BASTION suggests options aligned with {activeArchetype?.name}.
                        </p>
                      </div>

                      {/* Occupation Recommendations */}
                      <div className="space-y-2">
                        <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px] block">
                          💼 Canonical Occupations ({occupationRecs.length} Matches)
                        </span>

                        <div className="grid grid-cols-1 gap-2">
                          {occupationRecs.map((rec) => {
                            const isSelected = (activeOccupation?.name === rec.occupation.name);
                            return (
                              <div
                                key={rec.occupation.name}
                                onClick={() => setStagedOccupation(rec.occupation)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-950/40 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-sky-300 text-xs">{rec.occupation.name}</span>
                                      {rec.isTopPick && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 border border-amber-600 font-bold">
                                          ⭐ Career Match
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 mt-1">{rec.occupation.summary || rec.occupation.description}</p>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                      Professional Skills: {rec.skills?.slice(0, 4).join(', ')}
                                    </div>
                                    <p className="text-[10px] text-cyan-300/80 italic mt-1 font-sans">
                                      💡 {rec.rationale}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 transition-all ${
                                      isSelected
                                        ? 'bg-sky-500 text-slate-950 font-black'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                                    }`}
                                  >
                                    {isSelected ? '✓ Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* All Occupations Dropdown */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Or choose from all occupations:</span>
                          <select
                            value={activeOccupation?.name || ''}
                            onChange={(e) => {
                              const found = DEFAULT_OCCUPATIONS.find(oc => oc.name === e.target.value);
                              if (found) setStagedOccupation(found);
                            }}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
                          >
                            {DEFAULT_OCCUPATIONS.map(oc => (
                              <option key={oc.name} value={oc.name}>{oc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(2)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(4)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Review Rules & Allocate Stats</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 4: Rules Ledger & Stat Allocation */}
                  {stagedStep === 4 && (
                    <div className="space-y-3">
                      {/* Rules Budget Ledger */}
                      <div className="bg-slate-950/95 border border-cyan-500/40 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                            Stage 5 of 6: 150 BP Rules Economics & Core Stats
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            stagedRulesLedger.bpRemaining >= 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                              : 'bg-red-950 text-red-300 border border-red-600/50'
                          }`}>
                            Budget: {stagedRulesLedger.bpRemaining} / 150 BP Available
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300">
                          Tangent creation rules: Base attributes cost 5 BP per point (max +4 raw before species bonuses). Sub-attributes derive from Base 2 + (Primary * 2).
                        </p>

                        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Attributes Cost</span>
                            <span className="text-amber-300 font-bold">{stagedRulesLedger.breakdown.attributesCost} BP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Species Cost</span>
                            <span className="text-cyan-300 font-bold">{stagedRulesLedger.breakdown.speciesCost} BP</span>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-center">
                            <span className="text-slate-400 block text-[9px]">Tech Level Cost</span>
                            <span className="text-sky-300 font-bold">{stagedRulesLedger.breakdown.techLevelCost} BP</span>
                          </div>
                        </div>
                      </div>

                      {/* 6 Core Attributes Allocator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                            Core Attributes (Max +4 Raw at Creation)
                          </span>
                          <span className="text-slate-400 text-[10px]">5 BP per raw point</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'attr-strength', name: 'Strength', sub: 'Might' },
                            { key: 'attr-agility', name: 'Agility', sub: 'Reflex' },
                            { key: 'attr-stamina', name: 'Stamina', sub: 'Fortitude' },
                            { key: 'attr-intellect', name: 'Intellect', sub: 'Logic' },
                            { key: 'attr-wisdom', name: 'Wisdom', sub: 'Will' },
                            { key: 'attr-charisma', name: 'Charisma', sub: 'Etiquette' }
                          ].map(attr => {
                            const raw = stagedRawAttrs[attr.key] || 0;
                            const spMod = stagedRulesLedger.speciesModifiers[attr.key] || 0;
                            const finalVal = raw + spMod;
                            const subKey = `attr-${attr.sub.toLowerCase()}`;
                            const subVal = stagedRulesLedger.finalAttributes[subKey] ?? ((finalVal * 2) + 2);

                            return (
                              <div key={attr.key} className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200 text-xs">{attr.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{attr.sub}: {subVal}</span>
                                </div>
                                <div className="flex items-center justify-between pt-0.5">
                                  <div className="text-[11px] font-mono">
                                    <span className="text-amber-300 font-bold">+{raw}</span>
                                    {spMod !== 0 && (
                                      <span className="text-cyan-300 text-[10px] ml-1">({spMod > 0 ? `+${spMod}` : spMod})</span>
                                    )}
                                    <span className="text-slate-500 mx-1">=</span>
                                    <span className="text-white font-black text-xs">+{finalVal}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateRawAttr(attr.key, -1)}
                                      disabled={raw <= 0}
                                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 font-mono text-xs flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateRawAttr(attr.key, 1)}
                                      disabled={raw >= 4}
                                      className="w-5 h-5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 disabled:opacity-30 font-mono text-xs flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Foundation Skills Summary */}
                      <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1 text-[11px]">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Foundation Skill Packages (60 Free Skill Ranks)
                        </span>
                        <div className="text-slate-300 space-y-0.5 text-[10px] font-mono">
                          <div>• Faction ({activeFaction?.name}): 20 SP dedicated pool</div>
                          <div>• Origin ({activeOrigin?.name}): 20 SP dedicated pool</div>
                          <div>• Occupation ({activeOccupation?.name}): 20 SP dedicated pool</div>
                        </div>
                      </div>

                      {/* Tech Level Selector */}
                      <div className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-lg">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                          Technology Level:
                        </span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5].map(tl => (
                            <button
                              key={tl}
                              type="button"
                              onClick={() => setStagedTechLevel(tl)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                                stagedTechLevel === tl
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                                  : 'bg-slate-950 text-slate-400 hover:text-white'
                              }`}
                            >
                              TL-{tl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(3)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStagedStep(5)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <span>Synthesize Persona Dossier</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage 5: Final Review & Apply */}
                  {stagedStep === 5 && stagedPersonaResult && (
                    <div className="space-y-3">
                      <div className="bg-slate-950 border border-emerald-500/50 rounded-lg p-3 space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex-1 mr-2">
                            <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block">
                              Validated 5-Pillar Persona
                            </span>
                            <input
                              type="text"
                              value={stagedCustomName || stagedPersonaResult.character['char-name']}
                              onChange={(e) => setStagedCustomName(e.target.value)}
                              placeholder="Operative Designation..."
                              className="bg-transparent text-amber-300 font-bold text-sm outline-none border-b border-amber-500/40 focus:border-amber-400 w-full"
                            />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold shrink-0">
                            150 BP Compliant
                          </span>
                        </div>

                        {/* 5 Pillars Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded bg-amber-950/40 border border-amber-600/40">
                            <span className="text-slate-400 block text-[9px]">1. Archetype</span>
                            <span className="font-bold text-amber-300 truncate block">{stagedPersonaResult.pillars.archetype.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-600/40">
                            <span className="text-slate-400 block text-[9px]">2. Species</span>
                            <span className="font-bold text-cyan-300 truncate block">{stagedPersonaResult.pillars.species.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-purple-950/40 border border-purple-600/40">
                            <span className="text-slate-400 block text-[9px]">3. Faction</span>
                            <span className="font-bold text-purple-300 truncate block">{stagedPersonaResult.pillars.faction.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-600/40">
                            <span className="text-slate-400 block text-[9px]">4. Origin</span>
                            <span className="font-bold text-emerald-300 truncate block">{stagedPersonaResult.pillars.origin.name}</span>
                          </div>
                          <div className="p-1.5 rounded bg-sky-950/40 border border-sky-600/40 col-span-2 sm:col-span-2">
                            <span className="text-slate-400 block text-[9px]">5. Occupation</span>
                            <span className="font-bold text-sky-300 truncate block">{stagedPersonaResult.pillars.occupation.name}</span>
                          </div>
                        </div>

                        {/* Stats & Property Summary */}
                        <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] space-y-1 font-mono">
                          <div>
                            <span className="text-slate-400 uppercase">Core Stats:</span> STR {stagedPersonaResult.character['attr-strength']}, AGI {stagedPersonaResult.character['attr-agility']}, STA {stagedPersonaResult.character['attr-stamina']}, INT {stagedPersonaResult.character['attr-intellect']}, WIS {stagedPersonaResult.character['attr-wisdom']}, CHA {stagedPersonaResult.character['attr-charisma']}
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Sub-Attributes:</span> Might {stagedPersonaResult.character['attr-might']}, Reflex {stagedPersonaResult.character['attr-reflex']}, Fort {stagedPersonaResult.character['attr-fortitude']}, Logic {stagedPersonaResult.character['attr-logic']}, Will {stagedPersonaResult.character['attr-will']}, Etiq {stagedPersonaResult.character['attr-etiquette']}
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Skills ({stagedPersonaResult.allocationsReport.skillsCount}):</span> {stagedPersonaResult.character.skills.slice(0, 5).map(s => `${s.name} ${s.rank}`).join(', ')}...
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase">Property (TL-{stagedTechLevel}):</span> {stagedPersonaResult.character.weapons.map(w => w.name).join(', ')} · {stagedPersonaResult.character.armor.map(a => a.name).join(', ')}
                          </div>
                        </div>

                        {/* Narrative Summary */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Backstory Dossier</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto bg-slate-900/60 p-2 rounded border border-slate-800 font-sans">
                            {stagedPersonaResult.character.backstory}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={handleApplyStagedPersona}
                            disabled={isGenerating}
                            className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <span>✅ Apply to Folio</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenInGuidedCreator}
                            className="py-2.5 px-3 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>🧭 Open in Wizard</span>
                          </button>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStagedStep(4)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-xs transition-colors"
                        >
                          ← Back to Stats
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStagedStep(0);
                            setStagedArchetype(null);
                            setStagedSpecies(null);
                            setStagedFaction(null);
                            setStagedOrigin(null);
                            setStagedOccupation(null);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs transition-colors"
                        >
                          🔄 Reset Builder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Mode 1: 5 Pillars Fast Auto-Synthesizer */}
              {generatorMode === 'synthesis' && (
                <div className="space-y-3">
                  <div className="bg-slate-900/90 border border-cyan-900/40 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                      Canonical Pillars Workflow
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      BASTION will evaluate your concept and ground the character strictly within the game database without fabricating content:
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60">1. Archetype</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/60">2. Species</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/60">3. Faction</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">4. Origin</span>
                      <span className="text-slate-500">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-600/60">5. Occupation</span>
                    </div>
                  </div>

                  {/* Concept Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Concept Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Covert Operative Sniper',
                        'Master Armorer & Blacksmith',
                        'Syndicate Cyber-Decker',
                        'Alterian Diplomat & Envoy',
                        'Heavy Shock Trooper Vanguard'
                      ].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setGenPrompt(preset)}
                          className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10px] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      BASTION Character Concept:
                    </label>
                    <textarea
                      rows={3}
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      placeholder="Describe operative concept, tactical role, cybernetics, or background..."
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleSynthesizePersona}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>BASTION Synthesizing 5 Pillars...</span>
                      </>
                    ) : (
                      <span>🤖 Synthesize Persona with BASTION</span>
                    )}
                  </button>

                  {/* Synthesized Pillars Result Card */}
                  {synthesizedResult && synthesizedResult.pillars && (
                    <div className="bg-slate-950/90 border border-cyan-500/40 rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] text-cyan-400 uppercase font-bold block">Synthesized Operative</span>
                          <span className="font-bold text-amber-300 text-sm">{synthesizedResult.character['char-name']}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleApplySynthesizedPersona}
                          disabled={isGenerating}
                          className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 rounded text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        >
                          ✅ Apply to Folio
                        </button>
                      </div>

                      {/* 5 Pillars Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <div className="p-1.5 rounded bg-amber-950/40 border border-amber-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Archetype:</span>
                          <span className="font-bold text-amber-300">{synthesizedResult.pillars.archetype.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Species:</span>
                          <span className="font-bold text-cyan-300">{synthesizedResult.pillars.species.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-purple-950/40 border border-purple-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Faction:</span>
                          <span className="font-bold text-purple-300 truncate max-w-[150px]">{synthesizedResult.pillars.faction.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">Origin:</span>
                          <span className="font-bold text-emerald-300">{synthesizedResult.pillars.origin.name}</span>
                        </div>
                        <div className="p-1.5 rounded bg-sky-950/40 border border-sky-600/40 flex items-center justify-between col-span-1 sm:col-span-2">
                          <span className="text-slate-400 text-[10px]">Occupation:</span>
                          <span className="font-bold text-sky-300">{synthesizedResult.pillars.occupation.name}</span>
                        </div>
                      </div>

                      {/* Brief Stats Overview */}
                      <div className="text-[10px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80 font-mono">
                        <div>
                          <span className="text-slate-500 uppercase">Core Stats:</span> STR {synthesizedResult.character['attr-strength']}, AGI {synthesizedResult.character['attr-agility']}, STA {synthesizedResult.character['attr-stamina']}, INT {synthesizedResult.character['attr-intellect']}, WIS {synthesizedResult.character['attr-wisdom']}, CHA {synthesizedResult.character['attr-charisma']}
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Skills ({synthesizedResult.allocationsReport.skillsCount}):</span> {synthesizedResult.character.skills.slice(0, 4).map(s => `${s.name} ${s.rank}`).join(', ')}...
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Property:</span> {synthesizedResult.character.weapons.map(w => w.name).join(', ')} · {synthesizedResult.character.armor.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Mode 2: Selective Fields */}
              {generatorMode === 'fields' && (
                <div className="space-y-3">
                  {/* Overwrite Protection Setting */}
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                        Overwrite Protection
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {overwriteMode ? 'Will replace existing character field text' : 'Safely fills blank fields only'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOverwriteMode(!overwriteMode)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                        overwriteMode 
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      <span>{overwriteMode ? '⚡ Overwrite Allowed' : '🛡️ Fill Blank Only'}</span>
                    </button>
                  </div>

                  {/* Field Selection Controls */}
                  <div className="bg-slate-900/90 border border-cyan-900/50 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                        Select Character Fields to Generate:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase">
                        <button type="button" onClick={selectAllFields} className="text-cyan-400 hover:text-cyan-300 underline">
                          + All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={selectNarrativeOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                          + Narrative
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={selectBlankOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                          + Blank
                        </button>
                        <span className="text-slate-600">|</span>
                        <button type="button" onClick={clearAllFields} className="text-slate-400 hover:text-slate-200 underline">
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {CATEGORIES.map(category => {
                        const catFields = CHARACTER_FIELDS.filter(f => f.category === category);
                        if (catFields.length === 0) return null;
                        return (
                          <div key={category} className="space-y-1">
                            <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider bg-slate-950/80 px-2 py-1 rounded border border-cyan-900/40">
                              {category}
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 pl-1">
                              {catFields.map(f => (
                                <label key={f.key} className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <input
                                      type="checkbox"
                                      checked={!!selectedFields[f.key]}
                                      onChange={() => toggleField(f.key)}
                                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 shrink-0"
                                    />
                                    <span className="font-semibold text-xs truncate">{f.label}</span>
                                  </div>
                                  {hasFieldContent(f.key) ? (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono shrink-0">Has Content</span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono shrink-0">Blank</span>
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      BASTION Character Prompt:
                    </label>
                    <textarea
                      rows={3}
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      placeholder="Describe character archetype, cybernetics, origin, faction allegiance, or motivation..."
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>BASTION Generating Selected Fields...</span>
                      </>
                    ) : (
                      <span>⚡ Generate Selected Fields</span>
                    )}
                  </button>
                </div>
              )}

              {/* Status Message */}
              {genStatus && (
                <div className={`p-2.5 rounded border text-xs leading-relaxed ${
                  genStatus.error 
                    ? 'bg-red-950/60 border-red-800 text-red-300' 
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                }`}>
                  {genStatus.error || genStatus.success}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );

  if (isDocked) {
    return (
      <>
        {/* Backdrop Overlay to close on outside click */}
        <div 
          className="fixed top-[52px] inset-x-0 bottom-0 z-40 bg-black/40 backdrop-blur-[2px]" 
          onClick={onClose} 
        />
        <div className="fixed top-[52px] bottom-0 right-0 z-50 w-80 sm:w-[420px] bg-[#0d1117]/95 border-l border-cyan-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans backdrop-blur-md">
          {renderInnerContent()}
        </div>
      </>
    );
  }

  return (
    <DraggablePanel
      id="bastion-folio-floating-frame"
      defaultPosition={{ x: Math.max(10, window.innerWidth - 460), y: 64 }}
      className={`fixed z-[110] flex flex-col bg-[#0d1117]/95 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md overflow-hidden font-sans transition-all duration-150 ${
        isMinimized ? 'w-[320px] h-[48px]' : 'w-[390px] sm:w-[440px] h-[600px]'
      }`}
    >
      {renderInnerContent()}
    </DraggablePanel>
  );
};

export default React.memo(BastionDrawer);
