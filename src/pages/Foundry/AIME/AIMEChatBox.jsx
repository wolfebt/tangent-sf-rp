import React, { useState, useRef, useEffect } from 'react';
import DraggablePanel from '../MapMaker/map/DraggablePanel';
import { streamChatContent, parseRollCommand } from '../../../services/aimeService';
import { useStory } from '../../../context/CampaignContext';

const QUICK_ACTIONS = [
  { label: '💡 Brainstorm Hook', prompt: 'Brainstorm 3 compelling narrative hooks or dramatic conflicts for this story context.' },
  { label: '📖 Expand Narrative', prompt: 'Expand on the sensory details, atmosphere, and narrative description for this element.' },
  { label: '🤖 BASTION Rules', prompt: 'Check with BASTION: What are the canonical Tangent SFF RPG mechanics, Tech Level rules, or dice check guidelines relevant to this?' },
  { label: '🪐 Omnicortex Lore', prompt: 'Synthesize Omnicortex lore: How does this connect to galactic factions, alien species, and history in the Tangent Universe?' }
];

export default function AIMEChatBox({ onClose, contextData, activeNode: propActiveNode }) {
  const storyContext = useStory ? useStory() : null;
  const universeState = storyContext?.universeState || {};
  const activeScenarioId = storyContext?.activeScenarioId;
  const getActiveGemsText = storyContext?.getActiveGemsText;

  // Dock / Undock state (Persisted in localStorage)
  const [isDocked, setIsDocked] = useState(() => {
    try {
      const saved = localStorage.getItem('aime_dock_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleDock = () => {
    setIsDocked(prev => {
      const next = !prev;
      try {
        localStorage.setItem('aime_dock_mode', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Locate active node if not explicitly provided as prop
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

  // Active Context Label & Details
  const projectName = universeState?.projectName || 'Tangent Universe';
  const activeTitle = activeNode?.title || 'Story Foundry Workspace';
  const activeType = activeNode?.type || 'Campaign';
  const guidanceGemsText = getActiveGemsText ? getActiveGemsText() : '';

  // Formulate structured context for AIME & BASTION/Omnicortex
  const effectiveContext = React.useMemo(() => {
    if (contextData) {
      if (typeof contextData === 'string') return contextData;
      return contextData;
    }
    return {
      projectName,
      activeNode: activeNode ? {
        id: activeNode.id,
        title: activeNode.title,
        type: activeNode.type,
        content: activeNode.content,
        fields: activeNode.fields
      } : null,
      guidanceGems: guidanceGemsText || 'Standard',
      outline: universeState?.creativeState?.storyOutline || '',
      sceneBeats: universeState?.creativeState?.sceneBeats || '',
      draft: universeState?.creativeState?.storyDraft || ''
    };
  }, [contextData, projectName, activeNode, guidanceGemsText, universeState]);

  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Greetings, ARCHITECT. I am **AIME**, your creative storytelling and worldbuilding co-pilot.\n\nI have direct access to consult **BASTION** and the **OMNICORTEX** for rules, mechanics, and canon lore whenever needed. How can I assist your narrative today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || inputValue).trim();
    if (!textToSend || isGenerating) return;

    // Check if user entered a dice roll command like /roll 2d10+4
    if (textToSend.startsWith('/roll')) {
      const rollResult = parseRollCommand(textToSend);
      if (rollResult.success) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: textToSend },
          {
            role: 'model',
            isRoll: true,
            content: `🎲 **DICE ROLL [${rollResult.expr}]**: Total = **${rollResult.total}** (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})\n\n*(BASTION Tactical Dice Resolution Engine)*`
          }
        ]);
        if (!customPrompt) setInputValue('');
        return;
      }
    }

    const userMessage = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInputValue('');
    setIsGenerating(true);

    // Placeholder for AIME's streaming response
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      let currentResponse = '';
      await streamChatContent({
        messages: newMessages,
        context: effectiveContext,
        onChunk: (chunk) => {
          currentResponse += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === 'model') {
              updated[lastIdx].content = currentResponse;
            }
            return updated;
          });
        }
      });
    } catch (error) {
      console.error("AIME Chat error:", error);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === 'model') {
          updated[lastIdx].content = `⚠️ **AIME System Notice**: ${error.message}`;
        }
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear AIME conversation history?")) {
      setMessages([
        {
          role: 'model',
          content: `Chat history cleared. AIME is standing by for **${projectName}** [${activeType}: "${activeTitle}"].`
        }
      ]);
    }
  };

  const renderInnerContent = () => (
    <>
      {/* Header Bar */}
      <div className={`drag-handle flex justify-between items-center px-3.5 py-2.5 bg-slate-950 border-b border-cyan-900/60 select-none shrink-0 ${!isDocked ? 'cursor-move' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h3 className="text-cyan-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>✨</span> AIME CO-PILOT
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
              title={isMinimized ? "Expand Chat" : "Minimize Chat"}
            >
              {isMinimized ? '◻' : '—'}
            </button>
          )}

          {/* Clear history button */}
          {(!isMinimized || isDocked) && (
            <button 
              type="button"
              onClick={handleClearHistory} 
              className="text-slate-400 hover:text-amber-400 p-1 text-xs transition-colors rounded hover:bg-slate-800"
              title="Clear Conversation"
            >
              🗑️
            </button>
          )}

          {/* Close button */}
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-red-400 p-1 text-sm font-bold transition-colors leading-none rounded hover:bg-slate-800 ml-0.5"
            title="Close AIME Co-Pilot"
          >
            ✕
          </button>
        </div>
      </div>

      {(!isMinimized || isDocked) && (
        <>
          {/* Active Context Banner */}
          <div className="bg-[#161b22] px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 truncate max-w-[80%]">
              <span className="text-amber-400 font-bold shrink-0">📍 FOCUS:</span>
              <span className="text-slate-400 font-mono">[{activeType}]</span>
              <span className="font-semibold text-cyan-200 truncate">{activeTitle}</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              LIVE
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 bg-[#0d1117]/80 text-xs">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[88%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-[9px] mb-0.5 font-bold uppercase tracking-wider text-slate-500">
                  {msg.role === 'user' ? 'ARCHITECT' : 'AIME System'}
                </span>
                <div 
                  className={`p-3 rounded-lg shadow-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-950 text-cyan-100 border border-cyan-500/50 rounded-tr-none font-sans'
                      : msg.isRoll
                      ? 'bg-amber-950/70 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-mono'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="self-start flex items-center gap-2 text-cyan-400 text-xs mt-1 font-semibold">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>AIME synthesizing narrative & Omnicortex lore...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="px-3 py-1.5 bg-[#161b22] border-t border-slate-800 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(action.prompt)}
                disabled={isGenerating}
                className="whitespace-nowrap px-2 py-0.5 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/50 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold transition-all shrink-0 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <div className="flex gap-2">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AIME for story lore, plot beats, or /roll 2d10+4..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none h-[54px] font-sans"
              />
              <button 
                type="button"
                onClick={() => handleSend()}
                disabled={isGenerating || !inputValue.trim()}
                className="bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold px-3.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md disabled:shadow-none flex items-center justify-center shrink-0"
              >
                Send
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 px-0.5">
              <span>Shift+Enter for newline • Type /roll for dice</span>
              <span className="text-cyan-400/80 font-mono">BASTION-SYNTHESIS</span>
            </div>
          </div>
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
      id="aime-floating-copilot"
      defaultPosition={{ x: Math.max(10, window.innerWidth - 460), y: 70 }}
      className={`fixed z-50 flex flex-col bg-[#0d1117]/95 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md overflow-hidden font-sans transition-all duration-150 ${
        isMinimized ? 'w-[320px] h-[48px]' : 'w-[390px] sm:w-[440px] h-[580px]'
      }`}
    >
      {renderInnerContent()}
    </DraggablePanel>
  );
}
