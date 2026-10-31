import React, { useState, useRef, useEffect } from 'react';
import DraggablePanel from '../MapMaker/map/DraggablePanel';
import { streamChatContent, parseRollCommand, formatCronicleContextForAIME } from '../../../services/aimeService';
import { useStory } from '../../../context/CampaignContext';
import { useConfirm } from '../../../context/ConfirmContext';

const QUICK_ACTIONS = [
  { label: '💡 Brainstorm Hook', prompt: 'Brainstorm 3 compelling narrative hooks or dramatic conflicts for this story context.' },
  { label: '📖 Expand Narrative', prompt: 'Expand on the sensory details, atmosphere, and narrative description for this element.' },
  { label: '🤖 BASTION Rules', prompt: 'Check with BASTION: What are the canonical Tangent SFF RPG mechanics, Tech Level rules, or dice check guidelines relevant to this?' },
  { label: '🪐 Omnicortex Lore', prompt: 'Synthesize Omnicortex lore: How does this connect to galactic factions, alien species, and history in the Tangent Universe?' }
];

export default function AIMEChatBox({ onClose, contextData, activeNode: propActiveNode, cronicle: propCronicle }) {
  const storyContext = useStory ? useStory() : null;
  const universeState = storyContext?.universeState || {};
  const activeScenarioId = storyContext?.activeScenarioId;
  const getActiveGemsText = storyContext?.getActiveGemsText;
  const activeCronicle = propCronicle || storyContext?.cronicle || universeState?.cronicle || null;

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
  const activeTitle = activeNode?.title || 'ADE Studio Workspace';
  const activeType = activeNode?.type || 'Campaign';
  const guidanceGemsText = getActiveGemsText ? getActiveGemsText() : '';

  // Formulate structured context for AIME & BASTION/Omnicortex
  const effectiveContext = React.useMemo(() => {
    if (contextData) {
      if (typeof contextData === 'string') {
        let text = contextData;
        if (activeCronicle) {
          try {
            const cronicleText = formatCronicleContextForAIME(activeCronicle, 2500);
            if (cronicleText) {
              text = `${text}\n\n${cronicleText}`;
            }
          } catch (e) {
            console.warn('Could not inject Cronicle context into chat:', e);
          }
        }
        return text;
      }
      return {
        ...contextData,
        cronicle: contextData.cronicle || activeCronicle,
        customCatalog: storyContext?.elementsCatalog || []
      };
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
      draft: universeState?.creativeState?.storyDraft || '',
      customCatalog: storyContext?.elementsCatalog || [],
      cronicle: activeCronicle
    };
  }, [contextData, projectName, activeNode, guidanceGemsText, universeState, storyContext?.elementsCatalog, activeCronicle]);

  const AIME_CHAT_STORAGE_KEY = 'tangent_aime_chat_history_v1';
  const defaultGreeting = [
    {
      role: 'model',
      content: `Greetings, ARCHITECT. I am **AIME** (Artificial Intellect Mythopoeic Environ), your creative narrative co-pilot and AI overseer for the Tangent Foundry.\n\nI monitor story state, consult **BASTION** rules and **OMNICORTEX** lore, resolve dice checks (\`/roll\`), and synthesize narrative beats. How can I assist your scenario today?`
    }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(AIME_CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultGreeting;
  });
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedConversation, setCopiedConversation] = useState(false);
  const [copiedBlockIdx, setCopiedBlockIdx] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(AIME_CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const extractExpandablePoints = (text) => {
    if (!text || typeof text !== 'string') return [];
    const matches = [];
    const seen = new Set();
    const regex = /(?:^|\n)\s*(?:[•*-]|\d+\.)\s*\*\*([^*:\n]{2,45})\*\*/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const clean = m[1].replace(/^\d+\.\s*/, '').replace(/:$/, '').trim();
      if (clean && !seen.has(clean.toLowerCase()) && clean.length >= 3) {
        seen.add(clean.toLowerCase());
        matches.push(clean);
      }
      if (matches.length >= 5) break;
    }
    return matches;
  };

  const getSummarizedDisplayText = (text, isExpanded) => {
    if (!text || isExpanded || text.length <= 450) {
      return { displayText: text, isTruncated: false };
    }
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 6) {
      return {
        displayText: lines.slice(0, 6).join('\n') + '\n…',
        isTruncated: true
      };
    }
    return {
      displayText: text.slice(0, 420).trimEnd() + '…',
      isTruncated: true
    };
  };

  const handleCopyConversation = () => {
    const transcript = messages
      .map(m => `[${m.role === 'user' ? 'ARCHITECT' : 'AIME'}]:\n${m.content}`)
      .join('\n\n---\n\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(transcript).catch(() => {});
    }
    setCopiedConversation(true);
    setTimeout(() => setCopiedConversation(false), 2000);
  };

  const handleCopyBlock = (text, idx) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text || '').catch(() => {});
    }
    setCopiedBlockIdx(idx);
    setTimeout(() => {
      setCopiedBlockIdx(prev => (prev === idx ? null : prev));
    }, 2000);
  };

  const toggleExpandBlock = (idx) => {
    setExpandedBlocks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const runAimeQuery = async (textToSend, baseMessages, replaceAtIdx = null) => {
    // Check if user entered a dice roll command like /roll 2d10+4
    if (textToSend.startsWith('/roll')) {
      const rollResult = parseRollCommand(textToSend);
      if (rollResult.success) {
        const rollReply = {
          role: 'model',
          isRoll: true,
          promptText: textToSend,
          content: `🎲 **DICE ROLL [${rollResult.expr}]**: Total = **${rollResult.total}** (Rolls: [${rollResult.rolls.join(', ')}] ${rollResult.mod !== 0 ? `Mod: ${rollResult.mod}` : ''})\n\n*(BASTION Tactical Dice Resolution Engine)*`
        };
        setMessages(prev => {
          if (replaceAtIdx !== null && prev[replaceAtIdx]) {
            const updated = [...prev];
            updated[replaceAtIdx] = rollReply;
            return updated;
          }
          return [...prev, { role: 'user', content: textToSend }, rollReply];
        });
        return;
      }
    }

    const isExpandRequest = /^expand\b/i.test(textToSend);
    const targetIdx = replaceAtIdx !== null ? replaceAtIdx : baseMessages.length;

    if (replaceAtIdx === null) {
      setMessages([...baseMessages, { role: 'model', promptText: textToSend, content: '', isExpandedResponse: isExpandRequest }]);
    } else {
      setMessages(prev => {
        const updated = [...prev];
        if (updated[replaceAtIdx]) {
          updated[replaceAtIdx] = { role: 'model', promptText: textToSend, content: '', isExpandedResponse: isExpandRequest };
        }
        return updated;
      });
    }

    if (isExpandRequest) {
      setExpandedBlocks(prev => ({ ...prev, [targetIdx]: true }));
    }

    setIsGenerating(true);

    try {
      let currentResponse = '';
      await streamChatContent({
        messages: baseMessages,
        context: effectiveContext,
        onChunk: (chunk) => {
          currentResponse += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const idxToUpdate = replaceAtIdx !== null ? replaceAtIdx : updated.length - 1;
            if (updated[idxToUpdate] && updated[idxToUpdate].role === 'model') {
              updated[idxToUpdate] = {
                ...updated[idxToUpdate],
                content: currentResponse
              };
            }
            return updated;
          });
        }
      });
    } catch (error) {
      console.error("AIME Chat error:", error);
      setMessages(prev => {
        const updated = [...prev];
        const idxToUpdate = replaceAtIdx !== null ? replaceAtIdx : updated.length - 1;
        if (updated[idxToUpdate] && updated[idxToUpdate].role === 'model') {
          updated[idxToUpdate] = {
            ...updated[idxToUpdate],
            content: `⚠️ **AIME System Notice**: ${error.message}`
          };
        }
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || inputValue).trim();
    if (!textToSend || isGenerating) return;

    if (!customPrompt) setInputValue('');
    if (textToSend.startsWith('/roll')) {
      await runAimeQuery(textToSend, messages, null);
      return;
    }

    const userMessage = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await runAimeQuery(textToSend, newMessages, null);
  };

  const handleRetryBlock = async (blockIdx) => {
    if (isGenerating) return;
    const targetMsg = messages[blockIdx];
    if (!targetMsg) return;

    let promptToRetry = targetMsg.promptText || '';
    if (!promptToRetry) {
      for (let i = blockIdx - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user' && messages[i]?.content) {
          promptToRetry = messages[i].content;
          break;
        }
      }
    }
    if (!promptToRetry) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user' && messages[i]?.content) {
          promptToRetry = messages[i].content;
          break;
        }
      }
    }
    if (!promptToRetry) {
      promptToRetry = 'Provide a concise summary of our current ADE scenario focus.';
    }

    let priorMessages = messages.slice(0, Math.max(0, blockIdx));
    if (priorMessages.length === 0 || priorMessages[priorMessages.length - 1]?.role !== 'user') {
      priorMessages = [...priorMessages, { role: 'user', content: promptToRetry }];
    }
    await runAimeQuery(promptToRetry, priorMessages, blockIdx);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const confirm = useConfirm();

  const handleClearHistory = async () => {
    const ok = await confirm({
      title: 'Clear Conversation',
      message: 'Are you sure you want to clear your AIME conversation history?',
      danger: true,
      confirmLabel: 'Clear History'
    });
    if (ok) {
      const resetMsgs = [
        {
          role: 'model',
          content: `Chat history cleared. AIME is standing by for **${projectName}** [${activeType}: "${activeTitle}"].`
        }
      ];
      setMessages(resetMsgs);
      setExpandedBlocks({});
      try {
        localStorage.removeItem(AIME_CHAT_STORAGE_KEY);
      } catch (e) {}
    }
  };

  const renderInnerContent = () => (
    <>
      {/* Header Bar */}
      <div className={`drag-handle flex justify-between items-center px-3.5 py-2.5 bg-slate-950 border-b border-cyan-900/60 select-none shrink-0 ${!isDocked ? 'cursor-move' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <h3 className="text-cyan-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span>✨</span> AI ASSISTANT
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
              title={isMinimized ? "Expand Chat" : "Minimize Chat"}
            >
              {isMinimized ? '◻' : '—'}
            </button>
          )}

          {/* Copy Conversation & Clear history buttons */}
          {(!isMinimized || isDocked) && (
            <>
              <button
                type="button"
                data-no-drag="true"
                onClick={handleCopyConversation}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors rounded border flex items-center gap-1 cursor-pointer ${
                  copiedConversation
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                    : 'text-cyan-300 hover:text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/70 border-cyan-500/40'
                }`}
                title="Copy entire conversation to clipboard"
              >
                <span>{copiedConversation ? '✓ Copied' : '📋 Copy'}</span>
              </button>
              <button 
                type="button"
                data-no-drag="true"
                onClick={handleClearHistory} 
                className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 hover:text-rose-200 bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/40 transition-colors rounded flex items-center gap-1 cursor-pointer"
                title="Clear Conversation"
              >
                <span>🗑️ Clear</span>
              </button>
            </>
          )}

          {/* Close button */}
          <button 
            type="button"
            data-no-drag="true"
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
          <div className="bg-[#161b22] px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-300 shrink-0 gap-2">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <span className="text-amber-400 font-bold shrink-0">📍 FOCUS:</span>
              <span className="text-slate-400 font-mono">[{activeType}]</span>
              <span className="font-semibold text-cyan-200 truncate">{activeTitle}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(activeNode?.fields?.['char-faction'] || activeNode?.fields?.['linkedFaction'] || activeNode?.fields?.['char-species']) && (
                <span className="text-[9px] text-cyan-300 font-mono px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/40 rounded truncate max-w-[120px] hidden sm:inline" title="Omnicortex Lore Linked">
                  ⚡ {activeNode?.fields?.['char-faction'] || activeNode?.fields?.['linkedFaction'] || activeNode?.fields?.['char-species']}
                </span>
              )}
              <span className="text-[9px] text-emerald-400 font-mono shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                LIVE
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 bg-[#0d1117]/80 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isBlockExpanded = Boolean(expandedBlocks[idx] || msg.isExpandedResponse);
              const { displayText, isTruncated } = isUser
                ? { displayText: msg.content, isTruncated: false }
                : getSummarizedDisplayText(msg.content, isBlockExpanded);
              const expandablePoints = !isUser && idx > 0 ? extractExpandablePoints(msg.content) : [];

              return (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[88%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <span className="text-[9px] mb-0.5 font-bold uppercase tracking-wider text-slate-500">
                    {isUser ? 'ARCHITECT' : 'AIME System'}
                  </span>
                  <div 
                    className={`p-3 rounded-lg shadow-sm whitespace-pre-wrap leading-relaxed ${
                      isUser 
                        ? 'bg-cyan-950 text-cyan-100 border border-cyan-500/50 rounded-tr-none font-sans'
                        : msg.isRoll
                        ? 'bg-amber-950/70 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-mono'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                    }`}
                  >
                    <div>{displayText}</div>

                    {/* Expandable Bullet Topics */}
                    {expandablePoints.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1">
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mr-1">
                          Expand Point:
                        </span>
                        {expandablePoints.map((pt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            disabled={isGenerating}
                            onClick={() => handleSend(`Expand in detail on: ${pt}`)}
                            className="px-1.5 py-0.5 rounded bg-slate-950/90 hover:bg-cyan-950/80 border border-slate-700/80 hover:border-cyan-500/50 text-[10px] font-mono text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                            title={`Ask AIME to expand in detail on "${pt}"`}
                          >
                            + {pt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Output Block Actions: Copy, Retry, and Expand/Summarize Toggle */}
                    {!isUser && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/70 flex items-center justify-end gap-1.5 text-[10px] font-mono">
                        {(isTruncated || (msg.content && msg.content.length > 450)) && (
                          <button
                            type="button"
                            onClick={() => toggleExpandBlock(idx)}
                            className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-800 border border-slate-700/70 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer mr-auto"
                            title={isBlockExpanded ? 'Collapse back to concise summary' : 'Expand full output text'}
                          >
                            {isBlockExpanded ? '▴ Summarize' : '▾ Expand Full Text'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyBlock(msg.content, idx)}
                          className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                            copiedBlockIdx === idx
                              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-950/80 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-cyan-300'
                          }`}
                          title="Copy this output block"
                        >
                          <span>{copiedBlockIdx === idx ? '✓ Copied' : '📋 Copy'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleRetryBlock(idx)}
                          className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-cyan-950/80 border border-slate-700/70 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Retry / regenerate this response"
                        >
                          <span>🔄 Retry</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          className="fixed top-[var(--header-height,52px)] inset-x-0 bottom-0 z-40 bg-black/40 backdrop-blur-[2px]" 
          onClick={onClose} 
        />
        <div className="fixed top-[var(--header-height,52px)] bottom-0 right-0 z-50 w-96 sm:w-[440px] bg-[#0d1117]/95 border-l border-cyan-500/50 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col font-sans">
          {renderInnerContent()}
        </div>
      </>
    );
  }

  return (
    <DraggablePanel 
      id="aime-floating-copilot"
      defaultPosition={{ x: Math.max(10, window.innerWidth - 460), y: 64 }}
      className={`fixed z-[110] flex flex-col bg-[#0d1117]/95 border border-cyan-500/50 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md overflow-hidden font-sans transition-all duration-150 ${
        isMinimized ? 'w-[320px] h-[48px]' : 'w-[390px] sm:w-[440px] h-[580px]'
      }`}
    >
      {renderInnerContent()}
    </DraggablePanel>
  );
}
