import React, { useState } from 'react';
import DraggablePanel from '../../pages/Foundry/MapMaker/map/DraggablePanel';
import { useFolio } from '../../context/FolioContext';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';
import { synthesizeCharacterWithBastion } from '../../services/bastionCharacterEngine';

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
  const [generatorMode, setGeneratorMode] = useState('synthesis'); // 'synthesis' (5 pillars) | 'fields' (selective)
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
                  onClick={() => setGeneratorMode('synthesis')}
                  className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    generatorMode === 'synthesis'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏛️ 5 Pillars Synthesizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGeneratorMode('fields')}
                  className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    generatorMode === 'fields'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📝 Selective Fields</span>
                </button>
              </div>

              {/* Sub-Mode 1: 5 Pillars Synthesizer */}
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
