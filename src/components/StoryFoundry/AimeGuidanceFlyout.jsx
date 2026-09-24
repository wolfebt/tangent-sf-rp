import React, { useState } from 'react';
import { generateContent } from '../../services/aimeService';
import { AudioService } from '../../services/audioService';
import { 
  Sparkles, X, Send, Loader2, Copy, Check, 
  ArrowRight, Wand2, Shield, Swords, Compass, BookOpen 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GUIDANCE_PRESETS = {
  Persona: [
    { label: 'Suggest MCM Tier & Role', prompt: 'Analyze this character concept. Recommend an appropriate Tangent MCM Threat Tier (0-20), Chassis array (Combatant, Specialist, Socialite, Balanced), and Tactical Role package grounded in Omnicortex rules.' },
    { label: 'Enrich Heritage & Biology', prompt: 'Based on this character and species, suggest physiological features, biological resistances/vulnerabilities, and sensory quirks from the Omnicortex Species database.' },
    { label: 'Deepen Psychology & Trauma', prompt: 'Synthesize compelling character psychology: defining trauma, "The Lie" they believe, "The Truth" they must realize, and their deepest fear.' },
    { label: 'Generate Voice & Speech Style', prompt: 'Craft an evocative speech pattern, verbal mannerisms, typical catchphrases, and vocal cadence suited for science fantasy roleplay.' }
  ],
  Relations: [
    { label: 'Suggest Faction Dynamics', prompt: 'Analyze this character and faction affiliations. Propose compelling alliances, bitter rivalries, and subtle political friction with other factions in the Omnicortex universe.' },
    { label: 'Tether Guardian Directives', prompt: 'Generate tactical guardian directives: who this character should protect, their intervention triggers, and how they react when an ally takes critical trauma.' },
    { label: 'Marked Rival Directives', prompt: 'Design a bitter rivalry dynamic: specific triggers that draw this character\'s immediate hostility and tactical focus-fire during an encounter.' }
  ],
  VttScript: [
    { label: 'Architect Sentry Routine', prompt: 'Generate tactical sentry specifications: optimal vision cone angle (degrees), detection range (meters), facing direction, and atmospheric siren alert barks.' },
    { label: 'Architect Ambush Stalker', prompt: 'Design a stealth ambush routine: decloak proximity distance, surprise round tactics, and sudden dramatic transmission text.' },
    { label: 'Craft Comms / Dialogue Barks', prompt: 'Write 4-5 high-tension radio comms transmission barks for proximity greetings, under-fire barks, taking damage, and morale breaking.' },
    { label: 'Recommend Morale & Retreat FSM', prompt: 'Recommend an appropriate morale break threshold percentage and emergency contingency actions (e.g. smoke grenades, calling escorts, tactical retreat).' }
  ],
  Story: [
    { label: 'Escalate Scene Tension', prompt: 'Propose 3 escalating dramatic complications that raise the stakes in this scene based on the active story arc.' },
    { label: 'Atmosphere & Sensory Sights', prompt: 'Describe vivid sensory atmosphere: lighting, environmental sounds, smells, and tech level aesthetics.' },
    { label: 'Connect Scene to Map Hazards', prompt: 'Suggest strategic placements of environmental hazards, security terminals, and cover on the tactical map for this scene.' }
  ],
  Compiler: [
    { label: 'Pre-Flight Scenario Audit', prompt: 'Review this compiled scenario, map, and element automations. Audit for tactical balance, narrative cohesion, and missing NPC scripts.' },
    { label: 'Encounter Threat Assessment', prompt: 'Assess the combat threat level of all scripted adversaries on this map against a standard 4-operative player party.' }
  ]
};

export const AimeGuidanceFlyout = ({
  isOpen,
  onClose,
  targetType = 'Persona',
  contextData = {},
  onApplyGuidance = null
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presets = GUIDANCE_PRESETS[targetType] || GUIDANCE_PRESETS.Persona;

  const handleGenerate = async (promptText) => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    AudioService.playTerminalBeep(980, 0.05);

    try {
      const result = await generateContent({
        prompt: promptText,
        context: {
          activeNode: {
            title: contextData.title || contextData.name || 'Active Subject',
            type: targetType,
            fields: contextData.fields || contextData
          },
          guidanceGems: 'Ground recommendations in canonical Omnicortex rules, realistic science fantasy mechanics, and high-agency tabletop roleplay.'
        }
      });
      setResponse(result || 'No response generated.');
      AudioService.playTerminalBeep(1150, 0.08);
    } catch (err) {
      setResponse(`[AIME Connection Error]: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none font-sans">
      <div className="bg-[#0b0f19] border border-amber-500/60 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.25)] w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm">
              ✨
            </span>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 font-mono flex items-center gap-2">
                <span>AIME Guidance System</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/30">
                  {targetType} Co-Pilot
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-md">
                Subject: {contextData.title || contextData.name || 'Scenario Context'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Preset Prompt Chips */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 shrink-0 flex items-center gap-1">
            <Wand2 size={11} /> Presets:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleGenerate(preset.prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-amber-950/80 border border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-200 text-[10px] font-mono whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Response Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080c14]/70 min-h-[220px] max-h-[460px] scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin text-amber-400" />
              <p className="text-xs font-mono text-amber-300/80 animate-pulse">
                AIME Consulting Omnicortex Compendium & Lore Matrix...
              </p>
            </div>
          ) : response ? (
            <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans select-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {response}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-12 text-slate-500 text-center font-mono">
              <Sparkles size={28} className="text-amber-400/40" />
              <p className="text-xs">
                Select a preset directive above or ask AIME a custom question about this {targetType}.
              </p>
            </div>
          )}
        </div>

        {/* Input Bar & Actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate(customPrompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Ask AIME to advise, detail, or configure this ${targetType}...`}
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <Send size={12} />
              <span>Ask</span>
            </button>
          </form>

          {/* Footer Toolstrip */}
          {response && (
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
              <span>Grounding: Omnicortex Vector RAG</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {onApplyGuidance && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyGuidance(response);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-500/60 text-amber-300 flex items-center gap-1 transition-colors cursor-pointer font-bold"
                  >
                    <ArrowRight size={11} />
                    <span>Apply to Element</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AimeGuidanceFlyout;
