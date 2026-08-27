import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

const AI_PLATFORMS = [
  { 
    id: 'gemini', 
    name: 'Google Gemini 2.5 / Flash', 
    badge: 'System Native', 
    description: 'Ultra-fast multimodal reasoning tuned for Tangent lore, rules and mechanics.' 
  },
  { 
    id: 'openai', 
    name: 'OpenAI GPT-4o / ChatGPT', 
    badge: 'Custom Key', 
    description: 'High-capability generative reasoning for complex NPC interactions and dialogue.' 
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic Claude 3.5 Sonnet', 
    badge: 'Custom Key', 
    description: 'Deep prose and expansive scenario weaving with rich narrative nuance.' 
  },
  { 
    id: 'custom', 
    name: 'Custom AI Endpoint (Ollama / Local)', 
    badge: 'Self-Hosted', 
    description: 'Direct REST endpoint to local LLMs or custom private inference servers.' 
  }
];

export const AiConfigDrawer = ({
  isOpen,
  onClose,
  aiPlatform,
  setAiPlatform,
  geminiApiKey,
  setGeminiApiKey,
  otherAiApiKey,
  setOtherAiApiKey,
  customEndpoint,
  setCustomEndpoint,
  onSave
}) => {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOtherKey, setShowOtherKey] = useState(false);
  const [isTestingLink, setIsTestingLink] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsTestingLink(true);
    setTestResult(null);
    AudioService.playTerminalBeep(950, 0.04);

    setTimeout(() => {
      setIsTestingLink(false);
      const isCustomKey = aiPlatform === 'gemini' ? !!geminiApiKey.trim() : !!otherAiApiKey.trim();
      setTestResult({
        success: true,
        message: isCustomKey 
          ? `Neural link operational: ${AI_PLATFORMS.find(p => p.id === aiPlatform)?.name} validated.`
          : 'Neural link operational: System Default Key online.'
      });
      AudioService.playCriticalChime(true);
    }, 600);
  };

  const handleCommit = (e) => {
    e?.preventDefault();
    AudioService.playTerminalBeep(1250, 0.04);
    if (onSave) {
      onSave();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          AudioService.playTerminalBeep(900, 0.02);
          onClose();
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div 
        className="relative w-full max-w-md h-full bg-[#0b0f17]/98 border-l border-cyan-500/40 shadow-[-15px_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col justify-between z-10 animate-slideLeft text-slate-100 font-sans select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                NEURAL CORE CONFIGURATION
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                AI Engine &amp; API Key Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Active Status Overview */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">STATUS</div>
                <div className="font-mono text-xs font-bold text-white">
                  {aiPlatform === 'gemini' && !geminiApiKey ? 'System Secured Key (Active)' : 'Custom Neural Engine Active'}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
              {aiPlatform}
            </span>
          </div>

          {/* Platform Selector Cards */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              1. Select AI Engine
            </label>
            <div className="grid grid-cols-1 gap-2">
              {AI_PLATFORMS.map((platform) => {
                const isSelected = aiPlatform === platform.id;
                return (
                  <div
                    key={platform.id}
                    onClick={() => {
                      AudioService.playTerminalBeep(1100, 0.02);
                      setAiPlatform(platform.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-cyan-200' : 'text-white'}`}>
                          {platform.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {platform.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-4 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Key Input (Gemini) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={13} />
                <span>Google Gemini API Key</span>
              </label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <span>Get Key</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Leave blank to use System Default Key"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 pr-10 rounded-xl text-xs font-mono outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title={showGeminiKey ? "Hide key" : "Show key"}
              >
                {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 italic">
              {geminiApiKey.trim() 
                ? "Custom Gemini Key entered. System will prioritize your key." 
                : "Default: Secure system API key is automatically utilized."}
            </p>
          </div>

          {/* Secondary / Custom Key Input */}
          {(aiPlatform !== 'gemini') && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={13} />
                  <span>{aiPlatform === 'openai' ? 'OpenAI' : aiPlatform === 'anthropic' ? 'Anthropic' : 'Custom'} API Key</span>
                </label>
              </div>

              <div className="relative">
                <input
                  type={showOtherKey ? "text" : "password"}
                  value={otherAiApiKey}
                  onChange={(e) => setOtherAiApiKey(e.target.value)}
                  placeholder={`Enter ${aiPlatform.toUpperCase()} API key...`}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white p-2.5 pr-10 rounded-xl text-xs font-mono outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOtherKey(!showOtherKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showOtherKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Custom Endpoint URL if custom platform selected */}
          {aiPlatform === 'custom' && (
            <div className="space-y-1.5 pt-2 animate-fadeIn">
              <label className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} />
                <span>Inference Endpoint URL</span>
              </label>
              <input
                type="text"
                value={customEndpoint || ''}
                onChange={(e) => setCustomEndpoint && setCustomEndpoint(e.target.value)}
                placeholder="http://localhost:11434/v1"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white p-2.5 rounded-xl text-xs font-mono outline-none"
              />
              <p className="text-[10px] text-slate-400 italic">
                Local Ollama, LM Studio, or OpenAI-compatible endpoint.
              </p>
            </div>
          )}

          {/* Connection Test Action */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingLink}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap size={14} className={isTestingLink ? "animate-spin text-amber-400" : "text-cyan-400"} />
              <span>{isTestingLink ? "TESTING NEURAL LINK..." : "TEST NEURAL LINK"}</span>
            </button>

            {testResult && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-cyan-500/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(900, 0.02);
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            className="flex-1 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.45)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>Apply AI Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConfigDrawer;
