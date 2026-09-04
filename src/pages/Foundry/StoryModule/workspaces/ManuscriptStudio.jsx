/**
 * @file ManuscriptStudio.jsx
 * @description Fiction Manuscript Studio for Story Foundry.
 * Minimalist writing environment featuring live word count, reading time,
 * active POV character lock, and integrated 5-act scene beat progression.
 */

import React, { useState } from 'react';
import { 
  Feather, 
  UserCheck, 
  Sparkles, 
  Clock, 
  Hash, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { AudioService } from '../../../../services/audioService';

export default function ManuscriptStudio({ 
  activeNode, 
  onSaveDraft 
}) {
  const [content, setContent] = useState(
    activeNode?.content || ''
  );

  const [activePov, setActivePov] = useState(activeNode?.fields?.pov || '');
  const [copied, setCopied] = useState(false);

  // Compute live word count & reading time
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#080c14] text-slate-200 overflow-y-auto p-8 font-serif select-none space-y-6 scrollbar-thin">
      {/* Studio Header Bar */}
      <div className="border-b border-slate-800/80 pb-4 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <Feather size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
            MANUSCRIPT STUDIO &bull; {activeNode?.title || 'CHAPTER MANUSCRIPT'}
          </h2>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Hash size={12} className="text-cyan-400" />
            <span className="font-bold text-slate-200">{words}</span> words
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock size={12} className="text-amber-400" />
            <span className="font-bold text-slate-200">~{readingTimeMinutes}</span> min read
          </div>

          {/* POV Lock */}
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
            <UserCheck size={12} className="text-purple-400" />
            <span className="text-slate-500">POV:</span>
            <span className="font-bold text-purple-300">{activePov || 'Unassigned'}</span>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title="Copy Manuscript to Clipboard"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Manuscript Textarea Canvas */}
      <div className="max-w-3xl mx-auto space-y-4">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (onSaveDraft) onSaveDraft(e.target.value);
          }}
          placeholder="Begin writing prose narrative..."
          className="w-full h-[600px] p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl font-serif text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed shadow-xl"
        />
      </div>
    </div>
  );
}
