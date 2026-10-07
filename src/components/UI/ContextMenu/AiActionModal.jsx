import React, { useState } from 'react';
import { Bot, Sparkles, Check, Copy, X, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const AiActionModal = ({
  isOpen,
  onClose,
  title,
  aiType = 'BASTION', // 'BASTION' | 'AIME'
  promptSummary,
  targetContext,
  result,
  isLoading,
  error,
  onApply,
  onRetry,
  onOpenDrawer,
  applyLabel = 'Apply to Selection'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isBastion = aiType === 'BASTION';
  const themeColor = isBastion ? 'cyan' : 'purple';
  const borderClass = isBastion ? 'border-cyan-500/40' : 'border-purple-500/40';
  const bgBadge = isBastion ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50' : 'bg-purple-950/80 text-purple-300 border-purple-500/50';
  const glowShadow = isBastion ? 'shadow-[0_0_40px_rgba(6,182,212,0.18)]' : 'shadow-[0_0_40px_rgba(168,85,247,0.18)]';

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-2xl bg-[#0c1017] border ${borderClass} rounded-2xl ${glowShadow} overflow-hidden flex flex-col max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#121622]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${bgBadge}`}>
              {isBastion ? <Bot className="w-5 h-5 text-cyan-400" /> : <Sparkles className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${bgBadge}`}>
                  {isBastion ? 'BASTION // TACTICAL AI' : 'AIME // MYTHOPOEIC CO-PILOT'}
                </span>
                {targetContext && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    [{targetContext}]
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide mt-0.5">{title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Summary Banner */}
        {promptSummary && (
          <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="truncate pr-2 font-mono text-[11px]">Directive: {promptSummary}</span>
            {onRetry && !isLoading && (
              <button 
                onClick={onRetry} 
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-cyan-400 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-200 font-sans leading-relaxed selection:bg-cyan-500/30">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className={`w-8 h-8 border-2 ${isBastion ? 'border-cyan-400/20 border-t-cyan-400' : 'border-purple-400/20 border-t-purple-400'} rounded-full animate-spin`} />
              <div className="text-xs font-mono tracking-wider text-slate-400 animate-pulse">
                {isBastion ? 'CONSULTING OMNICORTEX & BASTION RULES LEDGER...' : 'SYNTHESIZING MYTHOPOEIC ATMOSPHERE & NARRATIVE...'}
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">AI Directive Failed</div>
                <div className="text-xs mt-1 opacity-90">{error}</div>
                <div className="text-[11px] mt-2 text-slate-400 font-mono">
                  Ensure a valid Gemini API Key is configured in Settings (⚙️).
                </div>
              </div>
            </div>
          ) : result ? (
            typeof result === 'string' ? (
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-cyan-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )
          ) : (
            <div className="text-center text-slate-500 py-8 font-mono text-xs">
              No content generated yet.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#121622]/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!result || isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>Full Chat View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
            {onApply && result && !isLoading && (
              <button
                onClick={() => {
                  onApply(result);
                  onClose();
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-lg ${
                  isBastion 
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{applyLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiActionModal;
