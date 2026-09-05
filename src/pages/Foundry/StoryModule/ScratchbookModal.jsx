import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Download, 
  Copy, 
  Check, 
  X, 
  Boxes, 
  Search, 
  FileText, 
  Edit3, 
  Save, 
  Sparkles 
} from 'lucide-react';
import { useStory } from '../../../context/CampaignContext';
import { generateStoryScratchbook, findElementsUsed } from './scratchbookService';
import { AudioService } from '../../../services/audioService';

export default function ScratchbookModal({ isOpen, onClose, beats = [] }) {
  const { 
    universeState, 
    elementsCatalog = [], 
    updateCreativeState,
    triggerStorySave 
  } = useStory();

  const [activeTab, setActiveTab] = useState('doc'); // 'doc' | 'elements' | 'notes'
  const [copied, setCopied] = useState(false);
  const [elementSearch, setElementSearch] = useState('');
  
  const initialNotes = universeState?.scratchbookNotes || universeState?.developmentNotes || '';
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(false);

  const elementsUsed = useMemo(() => {
    return findElementsUsed(universeState, elementsCatalog);
  }, [universeState, elementsCatalog]);

  const compiledMarkdown = useMemo(() => {
    return generateStoryScratchbook({
      universeState,
      elementsCatalog,
      customNotes: notes,
      beatsLedger: beats
    });
  }, [universeState, elementsCatalog, notes, beats]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledMarkdown);
    AudioService.playTerminalBeep(1200, 0.05);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    AudioService.playTerminalBeep(1400, 0.08);
    const cleanTitle = (universeState?.projectName || 'Tangent_Story')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}_SCRATCHBOOK.md`;
    const blob = new Blob([compiledMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNotes = () => {
    AudioService.playTerminalBeep(1100, 0.06);
    if (updateCreativeState) {
      updateCreativeState({ scratchbookNotes: notes });
    }
    if (triggerStorySave) {
      triggerStorySave();
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const filteredElements = elementsUsed.filter(e => {
    if (!elementSearch) return true;
    const q = elementSearch.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.type && e.type.toLowerCase().includes(q)) ||
      (e.summary && e.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-[#0b0f19] border border-cyan-500/40 w-full max-w-5xl h-[88vh] rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header Bar */}
        <div className="p-4 px-6 bg-[#080c14] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider font-mono">
                  {universeState?.projectName || 'Project'} Scratchbook
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  {elementsUsed.length} Elements Used
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single source of truth documenting ongoing story lore, scenarios, and components for AI reference.
              </p>
            </div>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Copy full Scratchbook Markdown to clipboard"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Download Scratchbook as Markdown file"
            >
              <Download size={13} />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="px-6 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('doc')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'doc'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText size={13} />
              <span>Full Scratchbook MD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('elements')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'elements'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Boxes size={13} />
              <span>Elements Used ({elementsUsed.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Edit3 size={13} />
              <span>GM Notes & Directives</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Auto-synced with AIME & BASTION AI Grounding
          </div>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 overflow-hidden p-6 relative">
          
          {/* VIEW 1: FULL SCRATCHBOOK MARKDOWN */}
          {activeTab === 'doc' && (
            <div className="w-full h-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin">
              {compiledMarkdown}
            </div>
          )}

          {/* VIEW 2: ELEMENTS USED INSPECTOR */}
          {activeTab === 'elements' && (
            <div className="w-full h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={elementSearch}
                    onChange={(e) => setElementSearch(e.target.value)}
                    placeholder="Filter elements used by name or type..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredElements.length} of {elementsUsed.length} elements
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {filteredElements.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic text-xs font-mono">
                    No elements match the current search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredElements.map(el => (
                      <div
                        key={el.id}
                        className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 text-sm">{el.title || el.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 uppercase">
                            {el.type || 'Custom'}
                          </span>
                        </div>

                        {el.summary && (
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {el.summary}
                          </p>
                        )}

                        {el.usedIn && el.usedIn.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 flex-wrap">
                            <span className="text-slate-500 font-bold">Referenced in:</span>
                            {el.usedIn.map((scene, i) => (
                              <span key={i} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                                {scene}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: GM NOTES & DIRECTIVES */}
          {activeTab === 'notes' && (
            <div className="w-full h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between shrink-0">
                <p className="text-xs text-slate-400">
                  Record running development notes, open plot hooks, and rules reminders. This section is automatically embedded into the Scratchbook for AI context.
                </p>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  {isSaved ? <Check size={13} /> : <Save size={13} />}
                  <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Author ongoing GM campaign notes, session recaps, unresolved mystery threads, and rules reminders..."
                className="flex-1 w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed select-text"
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
