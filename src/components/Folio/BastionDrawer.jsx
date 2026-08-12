import React, { useState } from 'react';
import { useFolio } from '../../context/FolioContext';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';

const CHARACTER_FIELDS = [
  // Core Identity
  { key: 'char-name', label: 'Character Name', category: 'Core Identity' },
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
  const { characterData, updateField } = useFolio();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'generator'

  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'bastion', text: 'Greetings, OPERATOR. BASTION AI Assistant online. How can I assist your Tangent SFF RPG persona session today? Type /roll [dice] to roll dice (e.g. /roll 2d10+4).' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Generator State
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
            text: `DICE ROLL RESULT [${rollResult.expr}]: Total = ${rollResult.total} (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})`
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

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 left-0 z-50 w-80 sm:w-[420px] bg-[#0d1117] border-r border-cyan-500/50 shadow-2xl flex flex-col font-sans backdrop-blur-md">
        {/* Header */}
        <div className="p-3.5 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              BASTION AI ASSISTANT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-xl font-bold leading-none px-2 transition-colors"
            title="Close BASTION Panel"
          >
            &times;
          </button>
        </div>

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
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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

        {/* Tab 2: Character Field Generator */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block mb-1">
                Target Persona
              </span>
              <span className="font-bold text-amber-400 text-sm block truncate">
                {characterData['char-name'] ? characterData['char-name'].toUpperCase() : 'UNNAMED PERSONA'}
              </span>
            </div>

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
                  <button onClick={selectAllFields} className="text-cyan-400 hover:text-cyan-300 underline">
                    + All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button onClick={selectNarrativeOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                    + Narrative
                  </button>
                  <span className="text-slate-600">|</span>
                  <button onClick={selectBlankOnly} className="text-cyan-400 hover:text-cyan-300 underline">
                    + Blank
                  </button>
                  <span className="text-slate-600">|</span>
                  <button onClick={clearAllFields} className="text-slate-400 hover:text-slate-200 underline">
                    Clear
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
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

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>BASTION Generating Persona Fields...</span>
                </>
              ) : (
                <span>⚡ Generate Character Fields</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(BastionDrawer);
