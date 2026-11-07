import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
  X,
  Ratio,
  PenTool,
  Layers,
  User,
  Building2,
  Rocket,
  ChevronDown,
  ChevronUp,
  Sliders,
  Zap,
  Maximize2
} from 'lucide-react';
import { generateContent } from '../../services/aimeService';
import { useToast } from '../../context/ToastContext';
import {
  ARTIST_STYLE_OPTIONS,
  ARTIST_TEMPLATE_OPTIONS,
  ASPECT_RATIOS,
  getArtistStyleById,
  getArtistTemplateById,
  inferTemplateFromContext,
  buildDeterministicModularSections,
  buildArtistHubAimeMetaPrompt,
  parseAimeModularResponse,
  compileModularArtistPrompt
} from '../../services/artistHubFramework';

// Re-export canonical constants for consumers & backwards compatibility
export {
  ARTIST_STYLE_OPTIONS,
  ARTIST_TEMPLATE_OPTIONS,
  ASPECT_RATIOS,
  compileModularArtistPrompt,
  inferTemplateFromContext
};
export const STYLE_PRESETS = ARTIST_STYLE_OPTIONS;

const TEMPLATE_ICONS = {
  master: Layers,
  closeup: Maximize2,
  character_concept: User,
  architectural: Building2,
  vehicle: Rocket,
  interior: Sliders
};

export const ArtistHubModal = ({
  isOpen,
  onClose,
  onApplyAsset,
  initialPrompt = '',
  initialStyle = 'hifi_chroma',
  initialTemplate = '',
  elementContext = null
}) => {
  const { toast } = useToast();

  const resolvedDefaultTemplate = useMemo(
    () =>
      initialTemplate
        ? getArtistTemplateById(initialTemplate).id
        : inferTemplateFromContext(elementContext, initialPrompt),
    [initialTemplate, elementContext, initialPrompt]
  );

  const [styleId, setStyleId] = useState(() => getArtistStyleById(initialStyle).id);
  const [templateId, setTemplateId] = useState(resolvedDefaultTemplate);
  const [aspectRatio, setAspectRatio] = useState('native');
  const [prompt, setPrompt] = useState(initialPrompt || '');

  const [sections, setSections] = useState(() =>
    initialPrompt || elementContext
      ? buildDeterministicModularSections({
          seedPrompt: initialPrompt,
          styleId: getArtistStyleById(initialStyle).id,
          templateId: resolvedDefaultTemplate,
          element: elementContext
        })
      : {
          subject: '',
          narrative: '',
          settingStyle: '',
          context: '',
          atmosphere: '',
          extraNegative: ''
        }
  );

  const [hasAssembled, setHasAssembled] = useState(() => Boolean(initialPrompt || elementContext));
  const [showModularEditor, setShowModularEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMode, setCopiedMode] = useState(null); // 'full' | 'negative' | null

  // Re-sync seed & inferred defaults cleanly when modal opens with new context
  useEffect(() => {
    if (!isOpen) return;
    const nextStyleId = getArtistStyleById(initialStyle).id;
    const nextTemplateId = initialTemplate
      ? getArtistTemplateById(initialTemplate).id
      : inferTemplateFromContext(elementContext, initialPrompt);

    setStyleId(nextStyleId);
    setTemplateId(nextTemplateId);
    setPrompt(initialPrompt || '');
    setCopiedMode(null);

    if (initialPrompt || elementContext) {
      setSections(
        buildDeterministicModularSections({
          seedPrompt: initialPrompt,
          styleId: nextStyleId,
          templateId: nextTemplateId,
          element: elementContext
        })
      );
      setHasAssembled(true);
    } else {
      setHasAssembled(false);
    }
  }, [isOpen, initialPrompt, initialStyle, initialTemplate, elementContext]);

  const activeStyle = useMemo(() => getArtistStyleById(styleId), [styleId]);
  const activeTemplate = useMemo(() => getArtistTemplateById(templateId), [templateId]);

  const compiled = useMemo(
    () =>
      compileModularArtistPrompt({
        styleId,
        templateId,
        aspectRatio,
        sections
      }),
    [styleId, templateId, aspectRatio, sections]
  );

  if (!isOpen) return null;

  const handleUpdateSection = (key, val) => {
    setSections((prev) => ({ ...prev, [key]: val }));
    setHasAssembled(true);
  };

  const handleQuickAssemble = () => {
    if (!prompt.trim() && !elementContext) return;
    const built = buildDeterministicModularSections({
      seedPrompt: prompt,
      styleId,
      templateId,
      element: elementContext
    });
    setSections(built);
    setHasAssembled(true);
    setCopiedMode(null);
  };

  const handleSynthesizePrompt = async () => {
    if (!prompt.trim() && !elementContext) return;
    setIsLoading(true);
    setCopiedMode(null);

    const metaPrompt = buildArtistHubAimeMetaPrompt({
      seedPrompt: prompt.trim(),
      styleId,
      templateId,
      aspectRatio,
      element: elementContext
    });

    try {
      const result = await generateContent({ prompt: metaPrompt });
      const { sections: parsedSections } = parseAimeModularResponse(result, {
        seedPrompt: prompt.trim(),
        styleId,
        templateId,
        element: elementContext
      });
      setSections(parsedSections);
      setHasAssembled(true);
    } catch (err) {
      // Fall back gracefully to deterministic modular assembly while notifying the user
      const fallbackSections = buildDeterministicModularSections({
        seedPrompt: prompt.trim(),
        styleId,
        templateId,
        element: elementContext
      });
      setSections(fallbackSections);
      setHasAssembled(true);
      toast?.({
        type: 'warning',
        text: `AI synthesis unavailable (${err.message}); assembled canonical ${activeStyle.name} template locally.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (mode = 'full') => {
    const textToCopy = mode === 'negative' ? compiled.negativeTokens : compiled.fullPrompt;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2500);
  };

  const handleApply = () => {
    if (onApplyAsset && hasAssembled) {
      onApplyAsset({
        prompt: compiled.fullPrompt,
        style: activeStyle.name,
        styleId: activeStyle.id,
        template: activeTemplate.fullTitle,
        templateId: activeTemplate.id,
        aspectRatio,
        negativePrompt: compiled.negativeTokens,
        sections
      });
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-6 sm:pt-10 pb-10 overflow-y-auto font-sans select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0d1117] border border-purple-500/70 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-purple-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-purple-300 font-mono flex items-center gap-2">
                Artist Hub — Modular Prompt Studio
              </h2>
              <p className="text-[11px] text-slate-400">
                Canonical <span className="text-purple-300 font-semibold">HIFI CHROMA</span> &amp;{' '}
                <span className="text-cyan-300 font-semibold">HI-FI SKETCH</span> Image Prompt Framework
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Artist Hub"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Style Option Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Palette size={14} /> 1. Style Engine Option
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                Locks Rendering &amp; Negative Prompt Tokens
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Style Option">
              {ARTIST_STYLE_OPTIONS.map((s) => {
                const isSelected = styleId === s.id;
                const isSketch = s.id === 'hifi_sketch';
                const StyleIcon = isSketch ? PenTool : Palette;

                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setStyleId(s.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-1.5 cursor-pointer group ${
                      isSelected
                        ? isSketch
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.22)] ring-1 ring-cyan-400/50'
                          : 'bg-purple-950/70 border-purple-400 text-purple-50 shadow-[0_0_18px_rgba(168,85,247,0.28)] ring-1 ring-purple-400/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StyleIcon
                          size={15}
                          className={
                            isSelected
                              ? isSketch
                                ? 'text-cyan-300'
                                : 'text-purple-300'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }
                        />
                        <span className="font-extrabold text-xs font-mono tracking-wider uppercase">
                          {s.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                          isSelected
                            ? isSketch
                              ? 'bg-cyan-900/70 border-cyan-400/60 text-cyan-200'
                              : 'bg-purple-900/70 border-purple-400/60 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {s.subtitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug">
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Template Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Layers size={14} /> 2. Shot / Asset Template
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Form Modifier: <strong className="text-purple-300">{activeTemplate.fullTitle}</strong>
              </span>
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              role="radiogroup"
              aria-label="Template Selector"
            >
              {ARTIST_TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = templateId === tmpl.id;
                const TmplIcon = TEMPLATE_ICONS[tmpl.id] || Layers;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-950/75 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.22)] ring-1 ring-purple-400/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-xs font-mono leading-tight flex items-center gap-1.5">
                        <TmplIcon
                          size={13}
                          className={isSelected ? 'text-purple-300 shrink-0' : 'text-slate-500 shrink-0'}
                        />
                        <span>{tmpl.label}</span>
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                        {tmpl.recommendedRatioHint}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-slate-300 leading-snug line-clamp-2">
                      {tmpl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Aspect Ratio Override */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Ratio size={13} className="text-purple-400" /> Aspect Framing Tag (Optional)
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                Recommended for {activeTemplate.label}: {activeTemplate.recommendedRatioHint}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                    aspectRatio === ar.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Concept Seed + Modular Slot Editor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ImageIcon size={14} /> 3. Subject / Concept Seed
              </label>
              <button
                type="button"
                onClick={() => setShowModularEditor((prev) => !prev)}
                className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {showModularEditor ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                <span>{showModularEditor ? 'Hide Modular Slots' : 'Fine-Tune Modular Slots (5)'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your character, settlement vista, starship/mech, relic closeup, or interior space..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 text-slate-100 p-3 rounded-xl text-xs font-mono outline-none transition-all placeholder-slate-600 leading-relaxed shadow-inner"
            />

            {/* Collapsible Direct Modular Fields Editor */}
            {showModularEditor && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Direct Modular Structure Slots ([CONTENT PROMPT] &amp; [GUIDANCE PROMPT])
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
                      SUBJECT
                    </label>
                    <textarea
                      rows={2}
                      value={sections.subject}
                      onChange={(e) => handleUpdateSection('subject', e.target.value)}
                      placeholder="[Insert main subject]"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
                      NARRATIVE
                    </label>
                    <textarea
                      rows={2}
                      value={sections.narrative}
                      onChange={(e) => handleUpdateSection('narrative', e.target.value)}
                      placeholder="[Insert action or story elements]"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
                      SETTING STYLE
                    </label>
                    <input
                      type="text"
                      value={sections.settingStyle}
                      onChange={(e) => handleUpdateSection('settingStyle', e.target.value)}
                      placeholder="[Insert overall style]"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
                      CONTEXT
                    </label>
                    <input
                      type="text"
                      value={sections.context}
                      onChange={(e) => handleUpdateSection('context', e.target.value)}
                      placeholder="[Insert environmental context]"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
                      ATMOSPHERE
                    </label>
                    <input
                      type="text"
                      value={sections.atmosphere}
                      onChange={(e) => handleUpdateSection('atmosphere', e.target.value)}
                      placeholder="[Insert mood and lighting conditions]"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-rose-300/90 uppercase mb-1">
                      Subject-Specific Extra Negative Guardrails (Optional)
                    </label>
                    <input
                      type="text"
                      value={sections.extraNegative}
                      onChange={(e) => handleUpdateSection('extraNegative', e.target.value)}
                      placeholder="e.g. heavy armor, exposed wires, rust (appended to base Negative Prompt Tokens)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-400 text-slate-100 p-2 rounded-lg text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSynthesizePrompt}
                disabled={isLoading || (!prompt.trim() && !elementContext)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing {activeStyle.name} Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Synthesize with AIME ({activeStyle.name})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickAssemble}
                disabled={isLoading || (!prompt.trim() && !elementContext)}
                title="Instantly populate modular structure from your seed without calling AI"
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-200 font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Zap size={14} className="text-cyan-400" />
                <span>Quick Build</span>
              </button>
            </div>
          </div>

          {/* Compiled Modular Prompt Output */}
          {hasAssembled && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="p-4 bg-slate-950/95 border border-purple-500/40 rounded-xl shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                      ✨ Compiled Modular Prompt
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/90 border border-purple-500/40 text-purple-200 font-bold">
                      {activeStyle.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 font-bold">
                      {activeTemplate.fullTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy('negative')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold transition-all cursor-pointer"
                      title="Copy only Negative Prompt Tokens (for separate negative prompt inputs)"
                    >
                      {copiedMode === 'negative' ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>{copiedMode === 'negative' ? 'Copied Neg!' : 'Copy Negative'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy('full')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-100 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      {copiedMode === 'full' ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>{copiedMode === 'full' ? 'Copied!' : 'Copy Full Prompt'}</span>
                    </button>
                  </div>
                </div>

                <pre className="text-xs text-slate-200 font-mono leading-relaxed select-all whitespace-pre-wrap overflow-x-auto">
                  {compiled.fullPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#161b22] border-t border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Style: <span className="text-slate-300">{activeStyle.name}</span> • Template:{' '}
            <span className="text-slate-300">{activeTemplate.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            {onApplyAsset && hasAssembled && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                Apply to Element
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default ArtistHubModal;
