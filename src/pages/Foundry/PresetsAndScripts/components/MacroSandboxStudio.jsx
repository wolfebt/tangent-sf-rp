/**
 * @file MacroSandboxStudio.jsx
 * @description Stage 6.3: WebAssembly QuickJS Macro Sandbox Studio.
 * Provides safe script execution with 500ms watchdog timeouts, ReDoS prevention,
 * pre-built macro templates, live console telemetry, and module asset binding.
 */

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Trash2, 
  Sparkles, 
  Copy, 
  Save, 
  Check, 
  AlertTriangle, 
  Clock, 
  Code, 
  Terminal,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { QuickJSSandbox } from '../../../../engine/scripting/QuickJSSandbox';
import { AudioService } from '../../../../services/audioService';
import { MACRO_TEMPLATES } from '../constants/macroTemplates.js';

export { MACRO_TEMPLATES };


export const MacroSandboxStudio = ({
  selectedAsset = null,
  onSaveMacroToModule,
  onAttachMacroToAsset
}) => {
  const [activeCode, setActiveCode] = useState(
    selectedAsset?.scriptData?.code || MACRO_TEMPLATES[0].code
  );
  const [macroName, setMacroName] = useState(
    selectedAsset?.type === 'Macro' ? selectedAsset.title : 'Custom Sector Routine'
  );
  const [macroCategory, setMacroCategory] = useState('Game Logic');
  const [executionLogs, setExecutionLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sandboxRef = useRef(new QuickJSSandbox());

  // Execute macro inside QuickJSSandbox with watchdog timer
  const handleExecute = async () => {
    setIsRunning(true);
    AudioService.playTerminalBeep(1200, 0.05);

    const startTime = performance.now();
    try {
      // Execute in isolated sandbox
      const result = await sandboxRef.current.execute(activeCode, {
        targetAsset: selectedAsset ? { id: selectedAsset.id, title: selectedAsset.title, type: selectedAsset.type } : null,
        timestamp: Date.now()
      });
      const elapsed = performance.now() - startTime;

      setExecutionLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          status: 'success',
          elapsedMs: elapsed.toFixed(2),
          output: result
        },
        ...prev.slice(0, 15)
      ]);
      AudioService.playTerminalBeep(1400, 0.08);
    } catch (err) {
      const elapsed = performance.now() - startTime;
      setExecutionLogs(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          elapsedMs: elapsed.toFixed(2),
          error: err.message
        },
        ...prev.slice(0, 15)
      ]);
      AudioService.playTerminalBeep(450, 0.12);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectTemplate = (template) => {
    AudioService.playTerminalBeep(1000, 0.02);
    setActiveCode(template.code);
    setMacroName(template.name);
    setMacroCategory(template.category);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveToModule = () => {
    if (!onSaveMacroToModule) return;
    AudioService.playTerminalBeep(1300, 0.04);
    onSaveMacroToModule({
      id: selectedAsset?.type === 'Macro' ? selectedAsset.rawId : `macro-${Date.now()}`,
      name: macroName,
      category: macroCategory,
      code: activeCode,
      updatedAt: new Date().toISOString()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAttachToAsset = () => {
    if (!selectedAsset || !onAttachMacroToAsset) return;
    AudioService.playTerminalBeep(1300, 0.04);
    onAttachMacroToAsset(selectedAsset, activeCode);
  };

  const linesCount = activeCode.split('\n').length;

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none text-slate-100">
      {/* ── TOP ACTION BAR ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <Code size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                className="font-bold text-sm text-white bg-transparent border-b border-dashed border-slate-700 focus:border-fuchsia-400 outline-none pb-0.5"
                placeholder="Macro Name..."
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 border border-slate-800 text-fuchsia-300">
                QuickJS Wasm
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure WebAssembly execution sandbox with 500ms watchdog protection.
            </p>
          </div>
        </div>

        {/* Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedAsset && selectedAsset.type !== 'Macro' && (
            <button
              type="button"
              onClick={handleAttachToAsset}
              className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title={`Bind this script to ${selectedAsset.title}`}
            >
              <Paperclip size={13} />
              <span>Attach to {selectedAsset.title}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            title="Copy script"
          >
            {copySuccess ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>

          <button
            type="button"
            onClick={handleSaveToModule}
            className="px-3 py-1.5 rounded-xl bg-fuchsia-950/60 hover:bg-fuchsia-900 border border-fuchsia-500/50 text-fuchsia-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save size={13} />
            <span>{saveSuccess ? 'Saved!' : 'Save Macro'}</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleExecute}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Running...' : 'Run Macro'}</span>
          </button>
        </div>
      </div>

      {/* ── TEMPLATES SELECTOR ROW ── */}
      <div className="flex items-center flex-wrap gap-1.5 p-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Snippets:
        </span>
        {MACRO_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleSelectTemplate(tpl)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-fuchsia-500/40 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <Sparkles size={11} className="text-amber-400" />
            <span>{tpl.name}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN WORKSPACE: EDITOR & CONSOLE ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Monospace Code Editor */}
        <div className="flex flex-col rounded-2xl bg-[#080d16] border border-slate-800 overflow-hidden shadow-inner">
          <div className="px-4 py-2 border-b border-slate-800/80 bg-[#0c121e] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>JavaScript (ES2022)</span>
            </span>
            <span>{linesCount} Lines</span>
          </div>

          <div className="flex-1 relative flex overflow-hidden">
            {/* Line numbers gutter */}
            <div className="w-10 py-3 pr-2 select-none bg-[#060a10] border-r border-slate-800/60 font-mono text-[11px] text-slate-400 text-right leading-relaxed">
              {Array.from({ length: linesCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable code text area */}
            <textarea
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent p-3 font-mono text-xs text-fuchsia-100 placeholder:text-slate-600 outline-none resize-none leading-relaxed overflow-y-auto selection:bg-fuchsia-900/60"
            />
          </div>
        </div>

        {/* Right Column: Execution Output Console */}
        <div className="flex flex-col rounded-2xl bg-[#080d16] border border-slate-800 overflow-hidden shadow-inner">
          <div className="px-4 py-2 border-b border-slate-800/80 bg-[#0c121e] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-cyan-400" />
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                Execution Output & Telemetry
              </span>
            </div>
            {executionLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setExecutionLogs([])}
                className="hover:text-red-400 p-0.5 cursor-pointer"
                title="Clear console"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2.5">
            {executionLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 select-none">
                <Terminal size={24} className="opacity-30" />
                <p className="text-xs">No execution telemetry yet.</p>
                <p className="text-[10px] text-slate-400">Click &ldquo;Run Macro&rdquo; above to execute in isolated sandbox.</p>
              </div>
            ) : (
              executionLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-[11px] font-mono ${
                    log.status === 'success'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      {log.status === 'success' ? (
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      ) : (
                        <AlertTriangle size={12} className="text-rose-400" />
                      )}
                      <span>{log.status === 'success' ? 'Clean Execution' : 'Watchdog / Runtime Error'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={10} />
                      <span>{log.elapsedMs}ms</span>
                    </span>
                  </div>

                  {log.status === 'success' ? (
                    <pre className="overflow-x-auto whitespace-pre-wrap text-emerald-300">
                      {typeof log.output === 'object' 
                        ? JSON.stringify(log.output, null, 2) 
                        : String(log.output)}
                    </pre>
                  ) : (
                    <div className="text-rose-300 font-bold">{log.error}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroSandboxStudio;
