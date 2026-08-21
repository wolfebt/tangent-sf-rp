import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Sparkles, Copy, Check, X, Wand2, Ratio } from 'lucide-react';
import { generateContent } from '../../services/aimeService';

export const STYLE_PRESETS = [
  { id: 'cinematic_dark', name: 'Cinematic Dark & Moody Sci-Fi', desc: 'Deep volumetric shadows, anamorphic lens flares, gritty industrial aesthetic' },
  { id: 'cyberpunk_noir', name: 'Cyberpunk Neon Noir', desc: 'Rain-slicked asphalt, vibrant neon reflections, holographic chromatic aberration' },
  { id: 'high_scifi', name: 'High Science-Fantasy Concept Art', desc: 'Epic planetary scale, crystalline psionic energy, sleek matte ceramics' },
  { id: 'unreal_5', name: 'Photorealistic Unreal Engine 5', desc: 'Lumen raytracing, 8k micro-textures, photorealistic studio lighting' },
  { id: 'comic_novel', name: 'Gritty Comic Graphic Novel', desc: 'Inked bold outlines, cel-shading, dynamic high-contrast cross-hatching' },
  { id: 'hologram_schematic', name: 'Retro-Futuristic Hologram Schematic', desc: 'Cyan wireframe blueprints, CRT scanlines, vector isometric HUD' }
];

export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 (Square / Token)' },
  { id: '16:9', label: '16:9 (Landscape / Scene)' },
  { id: '4:3', label: '4:3 (Standard Tactical)' },
  { id: '9:16', label: '9:16 (Portrait / Hero)' },
  { id: '21:9', label: '21:9 (Ultrawide Cinematic)' }
];

export const ArtistHubModal = ({ isOpen, onClose, onApplyAsset, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [preset, setPreset] = useState(STYLE_PRESETS[0].name);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [visualBreakdown, setVisualBreakdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSynthesizePrompt = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setCopied(false);

    const metaPrompt = `You are the Lead Art Director for the Tangent Science Fantasy RPG universe.
Your goal is to synthesize a high-impact, production-ready AI image generation prompt and visual art specification.

Subject / Concept: "${prompt.trim()}"
Target Art Style: "${preset}"
Aspect Ratio: "${aspectRatio}"

Format your response in two distinct sections:
[IMAGE_PROMPT]
(Write the single-paragraph, hyper-detailed prompt ready to paste into Imagen / Midjourney / Stable Diffusion, specifying camera lens, lighting setup, color palette, render engine, and atmosphere tags)
[/IMAGE_PROMPT]

[VISUAL_SPEC]
- **Lighting & Atmosphere**: 
- **Color Palette & Accents**: 
- **Materials & Textures**: 
- **Composition & Framing**: 
[/VISUAL_SPEC]`;

    try {
      const result = await generateContent({ prompt: metaPrompt });
      
      const promptMatch = result.match(/\[IMAGE_PROMPT\]([\s\S]*?)\[\/IMAGE_PROMPT\]/i);
      const specMatch = result.match(/\[VISUAL_SPEC\]([\s\S]*?)\[\/VISUAL_SPEC\]/i);

      if (promptMatch && promptMatch[1]) {
        setGeneratedPrompt(promptMatch[1].trim());
      } else {
        setGeneratedPrompt(result.trim());
      }

      if (specMatch && specMatch[1]) {
        setVisualBreakdown(specMatch[1].trim());
      } else {
        setVisualBreakdown(null);
      }
    } catch (err) {
      alert(`Prompt synthesis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    if (onApplyAsset && generatedPrompt) {
      onApplyAsset({
        prompt: generatedPrompt,
        style: preset,
        aspectRatio: aspectRatio,
        visualSpec: visualBreakdown
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans select-none">
      <div className="w-full max-w-3xl bg-[#0d1117] border border-purple-500/50 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-purple-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-purple-300 font-mono flex items-center gap-2">
                Artist Hub — Visual Concept Generator
              </h2>
              <p className="text-[11px] text-slate-400">
                Synthesize cinematic AI image prompts and rendering specifications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Style Presets Grid */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Wand2 size={14} /> 1. Select Aesthetic Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {STYLE_PRESETS.map((p) => {
                const isSelected = preset === p.name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.name)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 group ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono leading-tight">{p.name}</div>
                    <div className="text-[10px] text-slate-400 group-hover:text-slate-300 leading-snug line-clamp-2">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Ratio size={14} /> 2. Aspect Ratio & Framing
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    aspectRatio === ar.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concept Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <ImageIcon size={14} /> 3. Subject / Concept Seed
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your character, tactical encounter map, cybernetic augment, creature, or sci-fi vehicle..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 text-slate-100 p-3 rounded-xl text-xs font-mono outline-none transition-all placeholder-slate-600 leading-relaxed shadow-inner"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleSynthesizePrompt}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Visual Spec & Prompt...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Expert Image Prompt & Spec</span>
              </>
            )}
          </button>

          {/* Generated Result Container */}
          {generatedPrompt && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Synthesized Prompt Card */}
              <div className="p-4 bg-slate-950/90 border border-purple-500/40 rounded-xl shadow-lg relative group">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    ✨ Synthesized Generation Prompt
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed select-all whitespace-pre-wrap">
                  {generatedPrompt}
                </p>
              </div>

              {/* Visual Breakdown if present */}
              {visualBreakdown && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    🎨 Art Direction Breakdown
                  </span>
                  <div className="text-xs text-slate-300 font-sans space-y-1 whitespace-pre-wrap leading-relaxed">
                    {visualBreakdown}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#161b22] border-t border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Powered by AIME &amp; Gemini Vision Synthesis
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors"
            >
              Close
            </button>
            {onApplyAsset && generatedPrompt && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
              >
                Apply to Element
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArtistHubModal;
