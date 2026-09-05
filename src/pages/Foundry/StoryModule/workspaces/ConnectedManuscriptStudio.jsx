/**
 * @file ConnectedManuscriptStudio.jsx
 * @description Connected Fiction Manuscript Studio workspace for ADE Scenarios.
 * Provides a dedicated tabbed writing environment with live word count, reading time telemetry,
 * active POV lock, rich typography, and AI pair-authoring assistants with thinking indicators.
 */

import React, { useState, useEffect } from 'react';
import { 
  Feather, 
  UserCheck, 
  Clock, 
  Hash, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  Download 
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';
import { generateContent } from '../../../../services/aimeService';

export default function ConnectedManuscriptStudio({
  activeNode,
  updateStory,
  linkedElements = [],
  guidanceGems = ''
}) {
  if (!activeNode) return null;

  const [content, setContent] = useState(activeNode.content || '');
  const [activePov, setActivePov] = useState(activeNode.fields?.pov || '');
  const [copied, setCopied] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [aiActionLabel, setAiActionLabel] = useState('');

  // Synchronize with external changes to activeNode
  useEffect(() => {
    if (activeNode.content !== content) {
      setContent(activeNode.content || '');
    }
    setActivePov(activeNode.fields?.pov || '');
  }, [activeNode.id, activeNode.content]);

  // Telemetry
  const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleContentChange = (val) => {
    setContent(val);
    updateStory(activeNode.id, { content: val });
  };

  const handlePovChange = (newPov) => {
    setActivePov(newPov);
    updateStory(activeNode.id, {
      fields: {
        ...(activeNode.fields || {}),
        pov: newPov
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    const filename = `${(activeNode.title || 'Chapter').replace(/[^a-zA-Z0-9_-]/g, '_')}_manuscript.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI Pair-Authoring Assists with Status Spinners
  const handleAiAssist = async (actionType) => {
    if (isAiWorking) return;
    setIsAiWorking(true);
    AudioService.playTerminalBeep(1000, 0.05);

    let prompt = '';
    if (actionType === 'continue') {
      setAiActionLabel('Continuing Scene Narrative...');
      prompt = `Continue writing the narrative from this exact point for 2 evocative paragraphs. Maintain the POV (${activePov || 'Third Person'}), active tone (${guidanceGems || 'Sci-Fi'}), and established atmosphere:\n\n${content.slice(-800)}`;
    } else if (actionType === 'expand') {
      setAiActionLabel('Expanding Sensory Details...');
      prompt = `Rewrite and expand the following scene segment with rich sensory textures (tactile details, lighting, sci-fi acoustics, character interiority) while preserving the plot beats:\n\n${content.slice(-600)}`;
    } else if (actionType === 'polish') {
      setAiActionLabel('Polishing Prose & Style...');
      prompt = `Line-edit and polish the following prose for maximum dramatic tension, crisp pacing, and evocative science-fantasy style:\n\n${content.slice(-800)}`;
    }

    try {
      const generated = await generateContent({ prompt, context: activeNode });
      if (generated) {
        let updated = content;
        if (actionType === 'continue') {
          updated = content ? `${content.trim()}\n\n${generated.trim()}` : generated.trim();
        } else {
          updated = content ? `${content.trim()}\n\n[REFINED SEGMENT]:\n${generated.trim()}` : generated.trim();
        }
        handleContentChange(updated);
        AudioService.playTerminalBeep(1300, 0.1);
      }
    } catch (err) {
      console.warn('Manuscript AI assist failed:', err);
    } finally {
      setIsAiWorking(false);
      setAiActionLabel('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070a11] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* Studio Header Bar */}
      <div className="p-3.5 px-6 bg-[#0a0e18] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Title & Telemetry */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Feather size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-purple-300">
              Manuscript Studio
            </h2>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              &bull; {activeNode.title || 'Untitled Chapter'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
              <Hash size={11} className="text-cyan-400" />
              <span className="font-bold text-slate-200">{words}</span> words
            </div>
            <div className="flex items-center gap-1 text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
              <Clock size={11} className="text-amber-400" />
              <span className="font-bold text-slate-200">~{readingTimeMinutes}</span> min read
            </div>
          </div>
        </div>

        {/* Right Tools & POV Lock */}
        <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
          
          {/* POV Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
            <UserCheck size={12} className="text-purple-400 shrink-0" />
            <span className="text-slate-500">POV:</span>
            <input
              type="text"
              value={activePov}
              onChange={(e) => handlePovChange(e.target.value)}
              placeholder="e.g. Jax (First Person)"
              className="bg-transparent border-none outline-none text-purple-300 font-bold w-28 sm:w-36 text-[11px] placeholder-slate-600"
            />
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Copy Manuscript to Clipboard"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Download as Markdown"
          >
            <Download size={12} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* AI Pair-Authoring Assist Toolbar */}
      <div className="px-6 py-2 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-amber-400 mr-1 flex items-center gap-1">
            <Sparkles size={12} />
            <span>AI Authoring:</span>
          </span>

          <button
            type="button"
            onClick={() => handleAiAssist('continue')}
            disabled={isAiWorking}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAiWorking && aiActionLabel.includes('Continuing') ? (
              <Loader2 size={11} className="animate-spin text-cyan-400" />
            ) : (
              <span>✨</span>
            )}
            <span>Continue Scene</span>
          </button>

          <button
            type="button"
            onClick={() => handleAiAssist('expand')}
            disabled={isAiWorking}
            className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAiWorking && aiActionLabel.includes('Expanding') ? (
              <Loader2 size={11} className="animate-spin text-purple-400" />
            ) : (
              <span>🔍</span>
            )}
            <span>Expand Sensory Details</span>
          </button>

          <button
            type="button"
            onClick={() => handleAiAssist('polish')}
            disabled={isAiWorking}
            className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAiWorking && aiActionLabel.includes('Polishing') ? (
              <Loader2 size={11} className="animate-spin text-amber-400" />
            ) : (
              <span>📝</span>
            )}
            <span>Polish Prose</span>
          </button>
        </div>

        {/* Live Thinking Status Banner */}
        {isAiWorking && (
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold animate-pulse">
            <Loader2 size={12} className="animate-spin text-cyan-400" />
            <span>{aiActionLabel || 'AIME Thinking & Synthesizing...'}</span>
          </div>
        )}
      </div>

      {/* Main Manuscript Textarea Canvas */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center scrollbar-thin">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Begin writing fiction manuscript prose for this chapter..."
            className="flex-1 w-full p-8 bg-slate-950/70 border border-slate-800 rounded-2xl font-serif text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed shadow-2xl select-text scrollbar-thin"
          />
        </div>
      </div>

    </div>
  );
}
