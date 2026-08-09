import React, { useState } from 'react';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';
import { useCampaign } from '../../context/CampaignContext';
import { ELEMENT_SCHEMAS } from './elementSchemas';

const PRESETS = [
  { label: 'Derelict Ship Encounter', type: 'Encounter', prompt: 'Derelict starship floating in deep space with environmental hazards, automated defense turrets, and valuable salvaged data core.' },
  { label: 'Sci-Fi Character Fixer', type: 'Character', prompt: 'Cynical cyberpunk information broker with cybernetic ocular implants, clandestine faction ties, and a secret agenda.' },
  { label: 'Ancient Psi Artifact Clue', type: 'Clue', prompt: 'Strange crystalline monolith emitting psionic pulses, decipherable only by attuned individuals.' },
  { label: 'High-Tech Facility Location', type: 'Location', prompt: 'Heavily fortified subterranean research station guarded by tactical drones and biometric security doors.' },
  { label: 'Faction Shadow War', type: 'Story Arc', prompt: 'Escalating covert conflict between rival megacorporations competing for control of a newly discovered warp gate.' }
];

const ELEMENT_TYPES = [
  'Story Arc', 'Adventure', 'Character', 'Location', 'Faction', 
  'Encounter', 'Item', 'Clue', 'Map', 'Handout', 'Custom'
];

const BastionDrawer = ({ isOpen, onClose, initialTab = 'chat' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'chat' | 'generator'
  const { universeState, activeScenarioId, updateScenario } = useCampaign();

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bastion', text: 'Greetings, ARCHITECT. BASTION is online. How may I assist your Story Foundry session? Type /roll [dice] to roll (e.g. /roll 2d10+4).' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Generator State
  const [selectedFields, setSelectedFields] = useState({
    title: true,
    type: false,
    content: true
  });
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Overwrite protection mode: false = Fill Blank Only (default safe mode), true = Allow Overwriting
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Helper to check if a field currently has non-empty content
  const hasFieldContent = (key) => {
    if (!activeNode) return false;
    if (key === 'title') return Boolean(activeNode.title && activeNode.title.trim());
    if (key === 'content') return Boolean(activeNode.content && activeNode.content.trim());
    return Boolean(activeNode.fields?.[key] && activeNode.fields[key].trim());
  };

  // Select all blank fields helper
  const selectBlankOnly = () => {
    const newSelected = {
      title: !hasFieldContent('title'),
      content: !hasFieldContent('content')
    };
    if (activeNode) {
      (ELEMENT_SCHEMAS[activeNode.type] || []).forEach(f => {
        newSelected[f.key] = !hasFieldContent(f.key);
      });
    }
    setSelectedFields(newSelected);
  };

  // Clear all selections
  const clearAllFields = () => {
    setSelectedFields({});
  };

  // Find active node in scenario tree
  let activeNode = null;
  const findNode = (nodes) => {
    for (let n of nodes) {
      if (n.id === activeScenarioId) {
        activeNode = n;
        return;
      }
      if (n.children) findNode(n.children);
    }
  };
  if (activeScenarioId) findNode(universeState.scenarios);

  if (!isOpen) return null;

  // Toggle field checkbox
  const toggleField = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Handle Chat Send
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const newHistory = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newHistory);
    setChatInput('');

    // Check for /roll
    if (userText.startsWith('/roll')) {
      const rollResult = parseRollCommand(userText);
      if (rollResult.success) {
        setChatMessages([
          ...newHistory,
          {
            sender: 'bastion',
            isRoll: true,
            text: `DICE ROLL RESULT [${rollResult.expr}]: Total = ${rollResult.total} (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})`
          }
        ]);
      } else {
        setChatMessages([
          ...newHistory,
          { sender: 'bastion', text: rollResult.error }
        ]);
      }
      return;
    }

    setIsChatLoading(true);
    const response = await sendBastionChatMessage({ 
      prompt: userText, 
      history: chatMessages,
      contextData: {
        activeScenarioId,
        activeNode: activeNode ? { title: activeNode.title, type: activeNode.type, content: activeNode.content, fields: activeNode.fields } : null,
        campaign: { projectName: universeState.projectName }
      }
    });
    setIsChatLoading(false);

    setChatMessages(prev => [...prev, { sender: 'bastion', text: response.text }]);
  };

  // Handle Selective Generation
  const handleGenerate = async () => {
    let fieldsToGen = Object.keys(selectedFields).filter(k => selectedFields[k]);
    if (fieldsToGen.length === 0) {
      setGenStatus({ error: 'Please select at least one field to generate.' });
      return;
    }

    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Please enter a prompt or select a quick theme preset before generating.' });
      return;
    }

    if (!activeScenarioId || !activeNode) {
      setGenStatus({ error: 'No element selected in Contents. Please select or create an element first.' });
      return;
    }

    // Overwrite Protection Filter: If overwriteMode is false, filter out fields that already have content
    if (!overwriteMode) {
      const emptyFieldsOnly = fieldsToGen.filter(k => !hasFieldContent(k));
      if (emptyFieldsOnly.length === 0) {
        setGenStatus({ error: 'All selected fields already contain content! Enable "⚡ Allow Overwrite" mode to replace existing content, or select blank fields.' });
        return;
      }
      fieldsToGen = emptyFieldsOnly;
    }

    setIsGenerating(true);
    setGenStatus(null);

    const currentValues = {
      title: activeNode.title || '',
      type: activeNode.type || 'Story Arc',
      content: activeNode.content || '',
      ...(activeNode.fields || {})
    };

    const result = await generateSelectiveFields({
      selectedFields: fieldsToGen,
      currentValues,
      userPrompt: genPrompt,
      elementType: activeNode.type || 'Element',
      campaignContext: {
        projectName: universeState.projectName || 'Tangent Universe',
        activeNodeTitle: activeNode.title || '',
        techLevel: activeNode.fields?.tl || 3,
        metaLevel: activeNode.fields?.ml || 1
      }
    });

    setIsGenerating(false);

    if (result.success) {
      const topLevelUpdates = {};
      const fieldsUpdates = {};

      Object.keys(result.generated).forEach(key => {
        if (['title', 'type', 'content'].includes(key)) {
          topLevelUpdates[key] = result.generated[key];
        } else {
          fieldsUpdates[key] = result.generated[key];
        }
      });

      const finalUpdates = { ...topLevelUpdates };
      if (Object.keys(fieldsUpdates).length > 0) {
        finalUpdates.fields = {
          ...(activeNode.fields || {}),
          ...fieldsUpdates
        };
      }

      updateScenario(activeScenarioId, finalUpdates);
      setGenStatus({
        success: `BASTION generated content for: [${Object.keys(result.generated).join(', ')}]. Unselected fields remained unchanged.`
      });
    } else {
      setGenStatus({ error: result.error || 'Generation failed.' });
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 left-0 z-50 w-96 sm:w-[440px] bg-[#0d1117] border-r border-cyan-500/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans backdrop-blur-md">
      {/* Header Bar */}
      <div className="p-3.5 bg-slate-950 border-b border-cyan-900/60 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
            <span>🤖</span> BASTION
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

      {/* Tab 1: Interactive Chatbot */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0d1117]/90 text-xs font-mono">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                  {msg.sender === 'user' ? 'ARCHITECT' : 'BASTION System'}
                </span>
                <div
                  className={`p-3 rounded-lg max-w-[88%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 rounded-br-none font-sans'
                      : msg.isRoll
                      ? 'bg-amber-950/60 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
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
                <span>BASTION processing query...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask BASTION or type /roll 2d10+4..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-2 text-xs text-slate-100 outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isChatLoading}
              className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Selective Field Generator */}
      {activeTab === 'generator' && (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 text-xs">
          {/* Active Element Info */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block mb-1">
              Target Element
            </span>
            {activeNode ? (
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{activeNode.title || 'Untitled'}</span>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-bold uppercase">
                  {activeNode.type || 'Story Arc'}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No element selected in Contents. Please select one to edit.</span>
            )}
          </div>

          {/* Overwrite Protection Setting */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                Overwrite Protection
              </span>
              <span className="text-[9px] text-slate-400">
                {overwriteMode ? 'Will replace existing field content' : 'Safely fills blank fields only'}
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                Select Fields to Generate:
              </span>
              <div className="flex gap-2">
                <button onClick={selectBlankOnly} className="text-[9px] text-cyan-400 hover:text-cyan-300 underline font-bold uppercase">
                  + Blank Only
                </button>
                <span className="text-slate-600">|</span>
                <button onClick={clearAllFields} className="text-[9px] text-slate-400 hover:text-slate-200 underline font-bold uppercase">
                  Clear
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
              <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selectedFields.title}
                    onChange={() => toggleField('title')}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span className="font-semibold text-xs">Title / Name</span>
                </div>
                {hasFieldContent('title') ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">Has Content</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">Blank</span>
                )}
              </label>

              <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selectedFields.content}
                    onChange={() => toggleField('content')}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span className="font-semibold text-xs">Description / Detailed Text</span>
                </div>
                {hasFieldContent('content') ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">Has Content</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">Blank</span>
                )}
              </label>

              {activeNode && (ELEMENT_SCHEMAS[activeNode.type] || [])
                .filter(f => !['order', 'parent', 'parententry', 'parentid', 'id', '_id', 'created_at', 'updated_at'].includes(f.key.toLowerCase()))
                .map(f => (
                <label key={f.key} className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedFields[f.key]}
                      onChange={() => toggleField(f.key)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                    />
                    <span>{f.label}</span>
                  </div>
                  {hasFieldContent(f.key) ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">Has Content</span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">Blank</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Theme Presets */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
              Quick Theme Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setGenPrompt(preset.prompt)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-colors"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt / Instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
              BASTION Generation Prompt:
            </label>
            <textarea
              rows={3}
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              placeholder="Describe desired theme, Character traits, location details, hazards, or lore..."
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
            disabled={isGenerating || !activeNode}
            className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>BASTION Generating Selected Fields...</span>
              </>
            ) : (
              <span>⚡ Generate with BASTION</span>
            )}
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default React.memo(BastionDrawer);
