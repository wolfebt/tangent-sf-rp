/**
 * @file Stage3CoreReality.jsx
 * @description Stage 3 of Guided Element Forge: Layer 2 Objective Reality ("The What").
 * Combines manual schema trait authoring with non-destructive AIME Structured JSON drafting
 * (auto-filling empty fields while surfacing inline [Accept | Keep Current] diff cards for populated fields).
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import DOMPurify from 'dompurify';
import {
  Wand2,
  Check,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import {
  getPlaybookForType,
  getCoreSchemaFieldsForStage3
} from '../elementPlaybooks';
import { resolveSchemaFieldValue } from '../../elementSchemas';
import { draftStructuredElementTraits } from '../guidedElementAiService';
import { formatAimeProseToHtml } from '../../../AIME/aimeTextUtils';
import { FOLIO_NARRATIVE_SECTIONS } from '../../../../../utils/personaBridge';
import { useDBM } from '../../../../../context/DBMContext';
import { showToast } from '../../../../../context/ToastContext';
import { AudioService } from '../../../../../services/audioService';

function toSanitizedRichHtml(raw = '') {
  const str = String(raw || '').trim();
  if (!str) return '';
  const html = /<[a-z][\s\S]*>/i.test(str) ? str : formatAimeProseToHtml(str);
  return DOMPurify.sanitize(html);
}

export default function Stage3CoreReality({
  draft,
  onChangeField,
  onMergeFields,
  content = '',
  onChangeContent,
  elementsCatalog = [],
  projectName = 'Tangent Universe',
  cronicle = null,
  pendingDiffs: controlledDiffs,
  onChangePendingDiffs,
  pendingProseDiff: controlledProseDiff,
  onChangePendingProseDiff
}) {
  const { dbData = {} } = useDBM() || {};
  const playbook = useMemo(() => getPlaybookForType(draft.type), [draft.type]);
  const stage3Fields = useMemo(() => getCoreSchemaFieldsForStage3(draft.type), [draft.type]);

  // Group fields by schema sub-tab (e.g. Overview, Geography & Astronomy, etc.)
  const loreTabs = useMemo(() => {
    const groups = new Map();
    for (const f of stage3Fields) {
      const tabName = f.tab || 'Core Traits';
      if (!groups.has(tabName)) groups.set(tabName, []);
      groups.get(tabName).push(f);
    }
    return Array.from(groups.entries()).map(([tabName, items]) => ({
      tabName,
      items
    }));
  }, [stage3Fields]);

  const [activeSubTab, setActiveSubTab] = useState('');
  const resolvedSubTab =
    loreTabs.find((g) => g.tabName === activeSubTab)?.tabName ||
    loreTabs[0]?.tabName ||
    'Core Traits';

  const [isDrafting, setIsDrafting] = useState(false);
  const [localPendingDiffs, setLocalPendingDiffs] = useState([]);
  const [localPendingProseDiff, setLocalPendingProseDiff] = useState('');
  const pendingDiffs = controlledDiffs !== undefined ? controlledDiffs : localPendingDiffs;
  const setPendingDiffs = onChangePendingDiffs || setLocalPendingDiffs;
  const pendingProseDiff = controlledProseDiff !== undefined ? controlledProseDiff : localPendingProseDiff;
  const setPendingProseDiff = onChangePendingProseDiff || setLocalPendingProseDiff;
  const [isProseExpanded, setIsProseExpanded] = useState(Boolean(content));
  const [isFolioDossierExpanded, setIsFolioDossierExpanded] = useState(false);
  const draftReqIdRef = useRef(0);
  const draftAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      draftReqIdRef.current += 1;
      draftAbortRef.current?.abort();
    };
  }, []);

  const handleDraftTraitsWithAime = async () => {
    const reqId = ++draftReqIdRef.current;
    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;

    setIsDrafting(true);
    AudioService.playTerminalBeep(1240, 0.04);

    try {
      const res = await draftStructuredElementTraits({
        draft,
        catalog: elementsCatalog,
        campaignName: projectName,
        cronicle,
        dbData,
        signal: controller.signal
      });
      if (draftReqIdRef.current !== reqId) return;

      if (res.appliedKeys.length > 0) {
        const patch = {};
        for (const k of res.appliedKeys) {
          patch[k] = res.mergedFields[k];
        }
        onMergeFields?.(patch);
      }

      setPendingDiffs(res.diffs || []);

      const cleanExistingProse = String(content || '').replace(/<[^>]*>?/gm, '').trim();
      if (res.proposedProse) {
        const safeHtml = toSanitizedRichHtml(res.proposedProse);
        if (!cleanExistingProse) {
          onChangeContent?.(safeHtml);
          if (draft.type === 'Persona') {
            onChangeField?.('narrativeProse', safeHtml);
          }
          setIsProseExpanded(true);
          setPendingProseDiff('');
        } else if (safeHtml.trim() !== String(content || '').trim()) {
          setPendingProseDiff(safeHtml);
          setIsProseExpanded(true);
        }
      }

      AudioService.playCriticalChime(!res.usedFallback);
      if (res.usedFallback) {
        showToast({
          type: 'warning',
          text: `Offline fallback draft generated (${res.appliedKeys.length} field(s)) — configure Gemini/local AI for live drafting.`
        });
      } else {
        showToast({
          type: 'success',
          text: `Filled ${res.appliedKeys.length} empty trait(s)${
            res.diffs.length > 0 ? ` • ${res.diffs.length} optional diff(s) ready for review` : ''
          }.`
        });
      }
    } catch (err) {
      if (err?.name === 'AbortError' || draftReqIdRef.current !== reqId) return;
      showToast({
        type: 'error',
        text: `Trait drafting failed: ${err?.message || 'Unknown error'}`
      });
    } finally {
      if (draftReqIdRef.current === reqId) {
        setIsDrafting(false);
      }
    }
  };

  const handleAcceptSingleDiff = (diff) => {
    AudioService.playTerminalBeep(1300, 0.025);
    onChangeField?.(diff.key, diff.proposedValue);
    setPendingDiffs((prev) => prev.filter((d) => d.key !== diff.key));
  };

  const handleDismissSingleDiff = (key) => {
    AudioService.playTerminalBeep(900, 0.02);
    setPendingDiffs((prev) => prev.filter((d) => d.key !== key));
  };

  const handleAcceptAllDiffs = () => {
    AudioService.playCriticalChime(true);
    const patch = {};
    for (const d of pendingDiffs) {
      patch[d.key] = d.proposedValue;
    }
    onMergeFields?.(patch);
    setPendingDiffs([]);
  };

  const activeGroup =
    loreTabs.find((g) => g.tabName === resolvedSubTab) || loreTabs[0] || { items: [] };

  const diffByKey = useMemo(() => {
    const map = new Map();
    for (const d of pendingDiffs) map.set(d.key, d);
    return map;
  }, [pendingDiffs]);

  return (
    <div className="space-y-5">
      {/* ── HYBRID AIME ASSIST HEADER ── */}
      <section className="rounded-2xl border border-purple-500/35 bg-gradient-to-r from-[#130f24] via-[#0c121e] to-[#0c121e] p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/50 text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-purple-200">
              {playbook.stage3Title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Author manually or let AIME populate blank fields using your Stage 1 Pitch &amp; Stage 2 Gems. Existing traits are never overwritten without your approval.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isDrafting}
          onClick={handleDraftTraitsWithAime}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/70 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_16px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isDrafting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>AIME Drafting Traits...</span>
            </>
          ) : (
            <>
              <Wand2 size={14} />
              <span>AIME Draft Empty Traits</span>
            </>
          )}
        </button>
      </section>

      {/* ── NON-DESTRUCTIVE DIFF SUMMARY BANNER (WHEN EXISTING FIELDS HAD ALTERNATIVES) ── */}
      {pendingDiffs.length > 0 && (
        <section className="rounded-2xl border border-amber-500/50 bg-amber-950/25 p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="text-amber-200">
            <strong>{pendingDiffs.length} field(s)</strong> already had content and were preserved. Review inline proposals below or batch-resolve:
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAllDiffs}
              className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 text-[10px] font-bold uppercase cursor-pointer"
            >
              ✓ Accept All ({pendingDiffs.length})
            </button>
            <button
              type="button"
              onClick={() => setPendingDiffs([])}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase cursor-pointer"
            >
              Dismiss All
            </button>
          </div>
        </section>
      )}

      {/* ── SUB-TAB PILLS IF SCHEMA HAS MULTIPLE LORE SECTIONS ── */}
      {loreTabs.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {loreTabs.map((grp) => {
            const filled = grp.items.filter((f) => {
              const v = draft.fields?.[f.key];
              return v !== undefined && v !== null && String(v).trim().length > 0;
            }).length;
            const tabDiffCount = grp.items.filter((f) => diffByKey.has(f.key)).length;
            const isSelected = grp.tabName === resolvedSubTab;

            return (
              <button
                key={grp.tabName}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1080, 0.02);
                  setActiveSubTab(grp.tabName);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-sm'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{grp.tabName}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-700 text-slate-300">
                  {filled}/{grp.items.length}
                </span>
                {tabDiffCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-bold">
                    +{tabDiffCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── STRUCTURED TRAITS GRID ── */}
      <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGroup.items.map((f) => {
            const val = resolveSchemaFieldValue(draft.fields, f);
            const pendingDiff = diffByKey.get(f.key);
            const dbOptions = f.dbSource && Array.isArray(dbData?.[f.dbSource]) ? dbData[f.dbSource] : [];

            return (
              <div
                key={f.key}
                className={`space-y-1.5 ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-mono font-extrabold text-slate-300 uppercase tracking-wider">
                    {f.label}
                  </label>

                  {dbOptions.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          onChangeField?.(f.key, e.target.value);
                        }
                      }}
                      className="bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 rounded-lg px-2 py-0.5 text-[10px] font-mono outline-none cursor-pointer max-w-[180px]"
                    >
                      <option value="">☁️ Canon {f.dbSource}...</option>
                      {dbOptions.map((opt) => {
                        const optLabel = opt.name || opt.title || opt.id;
                        return (
                          <option key={opt.id || optLabel} value={optLabel} className="bg-slate-950 text-slate-100">
                            {optLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                {f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => onChangeField?.(f.key, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}...`}
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none transition-colors leading-relaxed"
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={val}
                    onChange={(e) => onChangeField?.(f.key, e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none transition-colors cursor-pointer"
                  >
                    <option value="">{f.placeholder || `Select ${f.label}...`}</option>
                    {(Array.isArray(f.options) ? f.options : []).map((opt) => {
                      const optVal = typeof opt === 'object' ? (opt.value ?? opt.label) : opt;
                      const optLabel = typeof opt === 'object' ? (opt.label ?? opt.value) : opt;
                      return (
                        <option key={String(optVal)} value={optVal}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : f.type === 'number' ? (
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => onChangeField?.(f.key, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}...`}
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChangeField?.(f.key, e.target.value)}
                    placeholder={f.placeholder || `Enter ${f.label}...`}
                    className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none transition-colors"
                  />
                )}

                {/* Inline Non-Destructive Diff Pill */}
                {pendingDiff && (
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/50 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-purple-300 font-bold uppercase">
                      <span>✨ AIME Proposed Alternative</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAcceptSingleDiff(pendingDiff)}
                          className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={10} />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissSingleDiff(pendingDiff.key)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 flex items-center gap-1 cursor-pointer"
                        >
                          <X size={10} />
                          <span>Keep Current</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{pendingDiff.proposedValue}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── COLLAPSIBLE NARRATIVE PROSE & LORE EDITOR ── */}
      <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsProseExpanded((prev) => !prev)}
          className="w-full px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 font-mono">
            <BookOpen size={14} className="text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Narrative Prose &amp; Codex Lore
            </span>
            {content && (
              <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                Populated
              </span>
            )}
          </div>
          {isProseExpanded ? (
            <ChevronUp size={15} className="text-slate-400" />
          ) : (
            <ChevronDown size={15} className="text-slate-400" />
          )}
        </button>

        {isProseExpanded && (
          <div className="p-4 space-y-3">
            {pendingProseDiff && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-purple-300">
                  <span>✨ AIME Proposed Narrative Prose</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const safeHtml = toSanitizedRichHtml(pendingProseDiff);
                        onChangeContent?.(safeHtml);
                        if (draft.type === 'Persona') {
                          onChangeField?.('narrativeProse', safeHtml);
                        }
                        setPendingProseDiff('');
                      }}
                      className="px-2.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 cursor-pointer"
                    >
                      Replace Prose
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const safeHtml = toSanitizedRichHtml(pendingProseDiff);
                        const combined = `${content || ''}<hr/>${safeHtml}`;
                        onChangeContent?.(combined);
                        if (draft.type === 'Persona') {
                          onChangeField?.('narrativeProse', combined);
                        }
                        setPendingProseDiff('');
                      }}
                      className="px-2.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 cursor-pointer"
                    >
                      Append Below
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingProseDiff('')}
                      className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <div
                  className="max-h-56 overflow-y-auto rounded-lg bg-slate-950/80 border border-purple-500/30 p-3 text-slate-200 font-sans leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pendingProseDiff) }}
                />
              </div>
            )}

            <div className="bg-slate-950 text-white rounded-xl border border-slate-800 overflow-hidden min-h-[220px]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(val) => {
                  onChangeContent?.(val);
                  if (draft.type === 'Persona') {
                    onChangeField?.('narrativeProse', val);
                  }
                }}
                placeholder="Compose atmospheric codex prose, secrets, or history..."
                className="text-slate-100"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── COLLAPSIBLE EXTENDED FOLIO DOSSIER FIELDS (PERSONA ONLY) ── */}
      {draft.type === 'Persona' && Array.isArray(FOLIO_NARRATIVE_SECTIONS) && (
        <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsFolioDossierExpanded((prev) => !prev)}
            className="w-full px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 font-mono">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Extended Folio Dossier Fields
              </span>
            </div>
            {isFolioDossierExpanded ? (
              <ChevronUp size={15} className="text-slate-400" />
            ) : (
              <ChevronDown size={15} className="text-slate-400" />
            )}
          </button>

          {isFolioDossierExpanded && (
            <div className="p-4 space-y-4">
              {FOLIO_NARRATIVE_SECTIONS.map((sec) => (
                <div key={sec.id} className="space-y-2.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 border-b border-slate-800 pb-1">
                    {sec.title}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(sec.fields || []).map((nf) => {
                      const resolvedVal = resolveSchemaFieldValue(draft.fields, {
                        key: nf.id,
                        aliasKeys: nf.aliasKeys
                      });
                      return (
                        <div key={nf.id} className={nf.span2 ? 'md:col-span-2 space-y-1' : 'space-y-1'}>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                            {nf.label}
                          </label>
                          <textarea
                            rows={nf.span2 ? 2 : 1}
                            value={resolvedVal}
                            onChange={(e) => {
                              const nextVal = e.target.value;
                              if (nf.aliasKeys?.length && typeof onMergeFields === 'function') {
                                onMergeFields({ [nf.id]: nextVal, [nf.aliasKeys[0]]: nextVal });
                              } else {
                                onChangeField?.(nf.id, nextVal);
                              }
                            }}
                            placeholder={nf.placeholder || `Enter ${nf.label}...`}
                            className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-400 text-slate-100 p-2 rounded-xl text-xs outline-none transition-colors"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
