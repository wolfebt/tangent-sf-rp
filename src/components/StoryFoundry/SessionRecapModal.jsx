import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  X,
  Send,
  Calendar,
  Layers,
  Flame
} from 'lucide-react';
import { SessionJournal } from '../../services/sessionRecapService';
import { AudioService } from '../../services/audioService';

export default function SessionRecapModal({
  isOpen,
  onClose,
  campaignName = 'Active Operation',
  onBroadcastToChat
}) {
  if (!isOpen) return null;

  SessionJournal.setCampaignName(campaignName);
  const [recapMarkdown, setRecapMarkdown] = useState(() => SessionJournal.generateMarkdownRecap());
  const [copied, setCopied] = useState(false);
  const events = SessionJournal.getEvents();

  const handleRefresh = () => {
    const fresh = SessionJournal.generateMarkdownRecap();
    setRecapMarkdown(fresh);
    AudioService.playTerminalBeep(880, 0.08);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recapMarkdown);
    setCopied(true);
    AudioService.playTerminalBeep(1100, 0.05);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([recapMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tangent_Mission_Recap_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    AudioService.playTerminalBeep(980, 0.08);
  };

  const handleBroadcast = () => {
    if (onBroadcastToChat) {
      onBroadcastToChat(recapMarkdown);
      AudioService.playTerminalBeep(1040, 0.08);
      onClose();
    }
  };

  const handleClear = () => {
    SessionJournal.clearEvents();
    handleRefresh();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] sm:max-h-[88vh] bg-[#0d121c] border-2 border-emerald-500/70 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-emerald-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-emerald-300 flex items-center gap-2">
                Tactical Session Chronicler &amp; Recap Synthesizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {events.length} EVENTS CAPTURED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1-Click episodic summary of combat strikes, critical breakthroughs, and dramatic complications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Re-Synthesize
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-600 rounded text-xs font-bold text-slate-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Journal
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 rounded text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Download .MD
            </button>
          </div>
        </div>

        {/* Markdown Content Display */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text border-b border-slate-800">
          {recapMarkdown}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Export directly to campaign notes or broadcast as a post-session mission debrief.
          </span>

          <div className="flex items-center gap-2">
            {onBroadcastToChat && (
              <button
                type="button"
                onClick={handleBroadcast}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Broadcast to CommLink Relay
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
