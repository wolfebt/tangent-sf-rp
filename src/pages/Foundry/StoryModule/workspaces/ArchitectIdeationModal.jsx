/**
 * @file ArchitectIdeationModal.jsx
 * @description Stepped Human-Guided Ideation & Responsive Flavor Modal for ADE StoryWeaver.
 * Enforces Architectural Principle:
 *   1. Full human authority: The Architect defines all core narrative nodes (Climax, Resolution, Crisis, Beats).
 *   2. Zero unsolicited generation: Restricts AIME from inventing plot structures from scratch.
 *   3. Responsive Flavor Layer: AIME reacts dynamically to active variables:
 *      - Active Folio character status conditions & vitals
 *      - Active Atmospheric / Weather Presets from PresetsAndScriptsDashboard
 *      - Active story flags and mechanical target DC
 */

import React, { useState } from 'react';
import { generateContent } from '../../../../services/aimeService.js';
import { ATMOSPHERIC_PRESETS } from '../../PresetsAndScripts/constants/atmosphericPresets.js';
import { AudioService } from '../../../../services/audioService.js';
import { 
  Sparkles, 
  Target, 
  Layers, 
  CloudRain, 
  ShieldAlert, 
  Check, 
  X, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Flame,
  Brain,
  Sliders
} from 'lucide-react';

export default function ArchitectIdeationModal({
  isOpen,
  onClose,
  activeNode,
  initialNodeType = 'Climax',
  folioCharacter,
  onCommitNode
}) {
  if (!isOpen) return null;

  // Step 1: Architect Intent | Step 2: Mechanical Stakes | Step 3: Sensory Flavor | Step 4: Review
  const [step, setStep] = useState(1);
  const [nodeType, setNodeType] = useState(initialNodeType || 'Climax');
  const [architectIntent, setArchitectIntent] = useState('');
  const [primaryObjective, setPrimaryObjective] = useState('');
  const [opposingForce, setOpposingForce] = useState('');
  const [targetDC, setTargetDC] = useState(13);
  
  // Dynamic Variables
  const [selectedWeather, setSelectedWeather] = useState(ATMOSPHERIC_PRESETS[3]?.id || 'cyberpunk_neon_rain');
  const activeWeatherObj = ATMOSPHERIC_PRESETS.find(w => w.id === selectedWeather) || ATMOSPHERIC_PRESETS[0];

  // Folio Status Conditions extraction
  const operativeConditions = folioCharacter?.conditions || 
    folioCharacter?.fields?.conditions || 
    (folioCharacter?.vitals?.shields === 0 ? ['Depleted Shields'] : ['Operational Vitals']);

  // AIME Flavor generation state
  const [isGeneratingFlavor, setIsGeneratingFlavor] = useState(false);
  const [flavorOptions, setFlavorOptions] = useState([]);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [assembledDraft, setAssembledDraft] = useState('');

  const handleGenerateFlavor = async () => {
    if (!architectIntent.trim()) return;
    setIsGeneratingFlavor(true);
    AudioService.playTerminalBeep(1100, 0.03);

    const prompt = `You are AIME acting strictly as a responsive sensory flavor layer for the ARCHITECT.
The Architect has authored this core narrative node:
• Node Type: ${nodeType}
• Core Narrative Intent: "${architectIntent.trim()}"
• Primary Objective: "${primaryObjective.trim() || 'Achieve tactical objective'}"
• Opposing Force: "${opposingForce.trim() || 'Sector Resistance'}" (Target DC: ${targetDC})

ACTIVE TACTICAL REALITY VARIABLES:
• Environmental Weather Preset: ${activeWeatherObj.name} (${activeWeatherObj.category}). ${activeWeatherObj.description}. Weather Rule: "${activeWeatherObj.rule}".
• Operative Status Conditions: ${operativeConditions.join(', ')}.

DIRECTORIAL MANDATE:
Do NOT invent new plot turns, resolution outcomes, or unapproved assets.
Write 3 distinct, concise (2-3 sentences each) sensory flavor text variations that faithfully ground the Architect's exact intent within the physical reality of the weather and operative status conditions.

Format strictly as:
Option 1: [Sensory depiction]
Option 2: [Sensory depiction]
Option 3: [Sensory depiction]`;

    try {
      const result = await generateContent({ prompt, context: activeNode });
      if (result) {
        const lines = result.split(/\n(?=Option [123]:)/i).map(l => l.replace(/^Option [123]:\s*/i, '').trim()).filter(Boolean);
        const options = lines.length >= 2 ? lines.slice(0, 3) : [result.trim()];
        setFlavorOptions(options);
        setSelectedFlavor(options[0] || '');
        setStep(3);
      }
    } catch (err) {
      console.warn('Flavor generation error:', err);
    } finally {
      setIsGeneratingFlavor(false);
    }
  };

  const handleProceedToReview = () => {
    const combined = `### [${nodeType.toUpperCase()}]: ${architectIntent.trim()}
**Objective:** ${primaryObjective.trim() || 'Overcome primary conflict'} (vs DC ${targetDC})
**Environmental Grounding:** ${activeWeatherObj.name} | *${activeWeatherObj.rule}*
**Tactical Conditions:** ${operativeConditions.join(', ')}

> 👁️ *Sensory Atmosphere:* ${selectedFlavor.trim()}`;

    setAssembledDraft(combined);
    setStep(4);
  };

  const handleFinalCommit = () => {
    if (onCommitNode) {
      onCommitNode(assembledDraft);
      AudioService.playCriticalChime(true);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#0b101b] border border-cyan-500/70 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                Architect-Directed Node Ideation
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Full human authority over narrative structure • AIME grounded flavor layer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        {/* Stepper Pill Indicator */}
        <div className="flex items-center justify-between px-2 text-[10px] font-bold">
          {[
            { num: 1, label: 'Architect Intent' },
            { num: 2, label: 'Mechanical Stakes' },
            { num: 3, label: 'AIME Sensory Flavor' },
            { num: 4, label: 'Review & Commit' }
          ].map(s => (
            <div 
              key={s.num} 
              className={`flex items-center gap-1.5 ${step === s.num ? 'text-cyan-300' : (step > s.num ? 'text-slate-400' : 'text-slate-600')}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono border ${
                step === s.num ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'border-slate-700'
              }`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Architect Intent */}
        {step === 1 && (
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Target Narrative Node Type
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['Climax', 'Resolution', 'Tactical Crisis', 'Story Beat'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNodeType(t)}
                    className={`py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                      nodeType === t
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                Core Intent & Conflict (Human Directed) *
              </label>
              <textarea
                rows={3}
                value={architectIntent}
                onChange={e => setArchitectIntent(e.target.value)}
                placeholder={`Describe the dramatic turning point for this ${nodeType}. E.g.: Operatives slice into the containment node while sirens strobe in amber alert...`}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Primary Mission Objective
              </label>
              <input
                type="text"
                value={primaryObjective}
                onChange={e => setPrimaryObjective(e.target.value)}
                placeholder="e.g. Prevent reactor containment meltdown"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2 rounded-xl text-xs outline-none font-sans"
              />
            </div>
          </div>
        )}

        {/* Step 2: Mechanical Stakes & Environmental Context */}
        {step === 2 && (
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            {/* Active Weather Preset from PresetsAndScriptsDashboard */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain size={12} />
                <span>Atmospheric & Weather Reality Preset</span>
              </label>
              <select
                value={selectedWeather}
                onChange={e => setSelectedWeather(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 text-emerald-200 p-2 rounded-xl text-xs outline-none cursor-pointer"
              >
                {ATMOSPHERIC_PRESETS.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.icon} {w.name} ({w.category}) — {w.modifiers.attackMod ? `Atk ${w.modifiers.attackMod}` : 'Clear'}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                🌧️ <strong>Rule:</strong> {activeWeatherObj.rule}
              </p>
            </div>

            {/* Folio Status Conditions */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={12} />
                <span>Active Operative Conditions</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {operativeConditions.map((cond, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-200 text-[10px]">
                    ⚠️ {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Opposing Force and Target DC */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Opposing Entity / Barrier
                </label>
                <input
                  type="text"
                  value={opposingForce}
                  onChange={e => setOpposingForce(e.target.value)}
                  placeholder="e.g. Sentry Drone / Security Lockdown"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Target DC (2d10 Check)
                </label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={targetDC}
                  onChange={e => setTargetDC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-300 p-2 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AIME Sensory Flavor Options */}
        {step === 3 && (
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            <p className="text-[11px] text-cyan-300">
              Select the sensory flavor layer that best fits your authorial vision:
            </p>

            <div className="space-y-2.5">
              {flavorOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFlavor(opt)}
                  className={`p-3 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all ${
                    selectedFlavor === opt
                      ? 'bg-cyan-950/80 border-cyan-400 text-slate-100 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                    <span>Variation #{idx + 1}</span>
                    {selectedFlavor === opt && <span>✓ SELECTED</span>}
                  </div>
                  <p className="font-sans italic">"{opt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review & Assemble */}
        {step === 4 && (
          <div className="space-y-3.5 flex-1 overflow-y-auto">
            <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
              Final Node Assembly (Editable by Architect)
            </label>
            <textarea
              rows={8}
              value={assembledDraft}
              onChange={e => setAssembledDraft(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-3 rounded-xl text-xs font-mono leading-relaxed outline-none"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!architectIntent.trim()}
                className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Next: Stakes & Weather</span>
                <ArrowRight size={13} />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleGenerateFlavor}
                disabled={isGeneratingFlavor}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isGeneratingFlavor ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Call AIME Flavor Layer</span>
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleProceedToReview}
                className="px-4 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Assemble Node</span>
                <ArrowRight size={13} />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleFinalCommit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={14} />
                <span>Commit into Story</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
