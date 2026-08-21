import React, { useState } from 'react';
import DraggablePanel from '../../pages/Foundry/MapMaker/map/DraggablePanel';
import { sendBastionChatMessage, parseRollCommand, generateSelectiveFields } from '../../services/bastionService';
import { useStory, useCampaign } from '../../context/CampaignContext';
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

const BastionDrawer = ({ isOpen, onClose, initialTab = 'chat', activeNode: propActiveNode }) => {
  const campaignContext = useCampaign ? useCampaign() : useStory();
  const universeState = campaignContext?.universeState || {};
  const activeScenarioId = campaignContext?.activeScenarioId;
  const updateScenario = campaignContext?.updateScenario || campaignContext?.updateStory;

  const [activeTab, setActiveTab] = useState(initialTab); // 'chat' | 'generator'
  const [isMinimized, setIsMinimized] = useState(false);

  // Dock / Undock state (Persisted in localStorage)
  const [isDocked, setIsDocked] = useState(() => {
    try {
      const saved = localStorage.getItem('bastion_dock_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleDock = () => {
    setIsDocked(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bastion_dock_mode', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bastion', text: 'Greetings, ARCHITECT. BASTION Tactical AI is online. How may I assist your session? Type /roll [dice] to roll (e.g. /roll 2d10+4).' }
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
  const [genStatus, setGenStatus] = useState(null);
  // Overwrite protection mode: false = Fill Blank Only (default safe mode), true = Allow Overwriting
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Find active node in scenario tree
  let activeNode = propActiveNode;
  if (!activeNode && activeScenarioId && universeState?.scenarios) {
    const findNode = (nodes) => {
      if (!Array.isArray(nodes)) return null;
      for (const n of nodes) {
        if (n.id === activeScenarioId) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    activeNode = findNode(universeState.scenarios);
  }

  // Helper to check if a field currently has non-empty content
  const hasFieldContent = (key) => {
    if (!activeNode) return false;
    if (key === 'title') return Boolean(activeNode.title && activeNode.title.trim());
    if (key === 'content') return Boolean(activeNode.content && activeNode.content.trim());
    return Boolean(activeNode.fields?.[key] && String(activeNode.fields[key]).trim());
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
            text: `🎲 DICE ROLL RESULT [${rollResult.expr}]: Total = ${rollResult.total} (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})`
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

      if (updateScenario) {
        updateScenario(activeScenarioId, finalUpdates);
      }
      setGenStatus({
        success: `BASTION generated content for: [${Object.keys(result.generated).join(', ')}]. Unselected fields remained unchanged.`
      });
    } else {
      setGenStatus({ error: result.error || 'Generation failed.' });
    }
  };

  const renderInnerContent = () => (
    <>
      {/* Header Bar */}
      <div className={`drag-handle flex justify-between items-center px-3.5 py-2.5 bg-slate-950 border-b border-cyan-900/60 select-none shrink-0 ${!isDocked ? 'cursor-move' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h3 className="text-cyan-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>🤖</span> BASTION TACTICAL
          </h3>
          <span className="text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
            {isDocked ? 'Docked Right' : 'Floating'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Dock / Undock Toggle Button */}
          <button
            type="button"
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

          {/* Active Target Banner */}
          <div className="bg-[#161b22] px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 truncate max-w-[85%]">
              <span className="text-cyan-400 font-bold shrink-0">📍 TARGET:</span>
              <span className="text-slate-400 font-mono">[{activeNode?.type || 'Campaign'}]</span>
              <span className="font-semibold text-amber-200 truncate">{activeNode?.title || 'No active element'}</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-mono shrink-0">
              WOLFE.BT
            </span>
          </div>

          {/* Tab 1: Chatbot */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]/80">
              {/* Messages Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[88%] ${msg.sender === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'}`}
                  >
                    <span className="text-[9px] mb-0.5 font-bold uppercase tracking-wider text-slate-500">
                      {msg.sender === 'user' ? 'ARCHITECT' : 'BASTION System'}
                    </span>
                    <div 
                      className={`p-3 rounded-lg shadow-sm whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950 text-cyan-100 border border-cyan-500/50 rounded-tr-none font-sans'
                          : msg.isRoll
                          ? 'bg-amber-950/70 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-mono'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="self-start flex items-center gap-2 text-cyan-400 text-xs mt-1 font-semibold">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>BASTION synthesizing tactical cognition...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask BASTION or type /roll [dice]..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none font-sans"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold px-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md disabled:shadow-none shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Generator */}
          {activeTab === 'generator' && (
            <div className="flex-1 p-3.5 overflow-y-auto space-y-4 bg-[#0d1117]/80 text-xs">
              {/* Field Selectors */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    Select Fields to Populate:
                  </span>
                  <div className="flex gap-2 text-[10px]">
                    <button onClick={selectBlankOnly} className="text-slate-400 hover:text-cyan-300 transition-colors">
                      Select Blanks
                    </button>
                    <span className="text-slate-600">|</span>
                    <button onClick={clearAllFields} className="text-slate-400 hover:text-red-400 transition-colors">
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  {/* Core Base Fields */}
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={Boolean(selectedFields.title)} 
                      onChange={() => toggleField('title')}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Title / Name</span>
                    {hasFieldContent('title') && <span className="text-[9px] text-amber-500 ml-auto">Filled</span>}
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={Boolean(selectedFields.content)} 
                      onChange={() => toggleField('content')}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Overview / Content</span>
                    {hasFieldContent('content') && <span className="text-[9px] text-amber-500 ml-auto">Filled</span>}
                  </label>

                  {/* Schema Specific Custom Fields */}
                  {activeNode && (ELEMENT_SCHEMAS[activeNode.type] || []).map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={Boolean(selectedFields[f.key])} 
                        onChange={() => toggleField(f.key)}
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span className="truncate">{f.label}</span>
                      {hasFieldContent(f.key) && <span className="text-[9px] text-amber-500 ml-auto">Filled</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Overwrite Protection Mode Toggle */}
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">Overwrite Mode</span>
                  <span className="text-[10px] text-slate-400">
                    {overwriteMode ? 'Will replace existing text in selected fields' : 'Safely fills blank fields only'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOverwriteMode(!overwriteMode)}
                  className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors border ${
                    overwriteMode 
                      ? 'bg-amber-950 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {overwriteMode ? '⚡ Overwrite ON' : '🛡️ Blank Only'}
                </button>
              </div>

              {/* Quick Themes Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Quick Themes / Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setGenPrompt(p.prompt);
                        if (activeNode && activeNode.type !== p.type) {
                          // Update node type preset if applicable
                        }
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded text-[10px] text-slate-300 transition-colors text-left truncate max-w-full"
                    >
                      {p.label}
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
                className="w-full py-2.5 bg-gradient-to-r from-cyan-700 to-cyan-900 hover:from-cyan-600 hover:to-cyan-800 border border-cyan-500/60 text-cyan-100 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
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
        </>
      )}
    </>
  );

  if (isDocked) {
    return (
      <>
        {/* Semi-transparent backdrop to easily close drawer on outside click */}
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
          onClick={onClose} 
        />
        <div className="fixed inset-y-0 right-0 z-50 w-96 sm:w-[440px] bg-[#0d1117]/95 border-l border-cyan-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col font-sans">
          {renderInnerContent()}
        </div>
      </>
    );
  }

  return (
    <DraggablePanel 
      id="bastion-floating-frame"
      defaultPosition={{ x: Math.max(10, window.innerWidth - 460), y: 70 }}
      className={`fixed z-50 flex flex-col bg-[#0d1117]/95 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md overflow-hidden font-sans transition-all duration-150 ${
        isMinimized ? 'w-[320px] h-[48px]' : 'w-[390px] sm:w-[440px] h-[600px]'
      }`}
    >
      {renderInnerContent()}
    </DraggablePanel>
  );
};

export default React.memo(BastionDrawer);
