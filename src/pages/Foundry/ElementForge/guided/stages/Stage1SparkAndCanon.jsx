/**
 * @file Stage1SparkAndCanon.jsx
 * @description Stage 1 of Guided Element Forge: Identity, Pitch, Archetype Blueprints
 * (both Structured Spine Seeding & 1-Click Quick Markdown Dump), and Omnicortex Canon DBM Seeding.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Database,
  Wand2,
  Compass,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { ELEMENT_TYPES, getTypePillStyle } from '../../elementSchemas';
import {
  getPlaybookForType,
  ARCHETYPE_BLUEPRINTS
} from '../elementPlaybooks';
import { synthesizeQuickBlueprintMarkdown } from '../guidedElementAiService';
import { useDBM } from '../../../../../context/DBMContext';
import { showToast } from '../../../../../context/ToastContext';
import { AudioService } from '../../../../../services/audioService';

function formatMarkdownToQuillHtml(mdText = '') {
  const raw = String(mdText || '').trim();
  if (!raw) return '';
  if (raw.startsWith('<p>') || raw.startsWith('<h')) return raw;

  return raw
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith('> ')) return `<blockquote>${trimmed.slice(2)}</blockquote>`;
      const withBold = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
      return `<p>${withBold}</p>`;
    })
    .join('');
}

export default function Stage1SparkAndCanon({
  type,
  onRequestTypeChange,
  title,
  onChangeTitle,
  fields = {},
  onChangeField,
  onMergeFields,
  guidance = {},
  onChangeGuidance,
  onSetContent,
  onSetDbmSyncStatus,
  initialSeedTab = 'spark',
  onAdvanceStage,
  onSwitchToSheet,
  elementsCatalog = []
}) {
  const playbook = useMemo(() => getPlaybookForType(type), [type]);
  const { dbData = {} } = useDBM() || {};

  const [seedTab, setSeedTab] = useState(initialSeedTab || 'spark');
  const [showAllBlueprints, setShowAllBlueprints] = useState(false);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(ARCHETYPE_BLUEPRINTS[0]?.id || '');
  const [blueprintDirectives, setBlueprintDirectives] = useState('');
  const [isSynthesizingDump, setIsSynthesizingDump] = useState(false);
  const [dbmSearch, setDbmSearch] = useState('');
  const [showAllDbmCategories, setShowAllDbmCategories] = useState(false);

  useEffect(() => {
    if (initialSeedTab) {
      setSeedTab(initialSeedTab);
    }
  }, [initialSeedTab]);

  // Filter blueprints matching active type unless "Show All" is active or none match
  const matchingBlueprints = useMemo(
    () => ARCHETYPE_BLUEPRINTS.filter((bp) => bp.elementType === type),
    [type]
  );

  const visibleBlueprints = useMemo(() => {
    if (showAllBlueprints || matchingBlueprints.length === 0) {
      return ARCHETYPE_BLUEPRINTS;
    }
    return matchingBlueprints;
  }, [showAllBlueprints, matchingBlueprints]);

  const activeBlueprint = useMemo(() => {
    return (
      visibleBlueprints.find((b) => b.id === selectedBlueprintId) ||
      visibleBlueprints[0] ||
      ARCHETYPE_BLUEPRINTS[0]
    );
  }, [visibleBlueprints, selectedBlueprintId]);

  // Discover canonical DBM entries for this playbook
  const dbmCandidates = useMemo(() => {
    if (!dbData || typeof dbData !== 'object') return [];
    const defaultCats =
      playbook.dbmCategories.length > 0 && !showAllDbmCategories
        ? playbook.dbmCategories
        : ['archetypes', 'species', 'factions', 'weaponry', 'armoring', 'gear', 'augmentations', 'invocations', 'features'];

    const collected = [];
    for (const cat of defaultCats) {
      const list = Array.isArray(dbData[cat]) ? dbData[cat] : [];
      for (const item of list) {
        if (!item) continue;
        const itemTitle = item.name || item.title || item.factionName || item.speciesName;
        if (!itemTitle) continue;
        collected.push({
          ...item,
          id: item.id || `${cat}_${itemTitle}`,
          displayTitle: itemTitle,
          dbmCategory: cat,
          displaySummary: item.description || item.concept || item.summary || item.notes || ''
        });
      }
    }

    if (!dbmSearch.trim()) return collected.slice(0, 60);
    const q = dbmSearch.toLowerCase();
    return collected
      .filter(
        (c) =>
          c.displayTitle.toLowerCase().includes(q) ||
          c.dbmCategory.toLowerCase().includes(q) ||
          c.displaySummary.toLowerCase().includes(q)
      )
      .slice(0, 60);
  }, [dbData, playbook.dbmCategories, showAllDbmCategories, dbmSearch]);

  const pitchValue = fields[playbook.pitchKey] || '';

  const handleSeedGuidedSpine = () => {
    if (!activeBlueprint) return;
    AudioService.playCriticalChime(true);

    if (activeBlueprint.elementType && activeBlueprint.elementType !== type) {
      onRequestTypeChange?.(activeBlueprint.elementType, { silent: true });
    }

    const targetPlaybook = getPlaybookForType(activeBlueprint.elementType || type);
    const nextFields = {
      ...(activeBlueprint.seedFields || {}),
      tags: fields.tags
        ? `${fields.tags}, ${activeBlueprint.seedTags || activeBlueprint.name}`
        : activeBlueprint.seedTags || activeBlueprint.name
    };

    if (!fields[targetPlaybook.pitchKey]) {
      nextFields[targetPlaybook.pitchKey] = blueprintDirectives.trim() || activeBlueprint.summary;
    }

    onMergeFields?.(nextFields);

    if (activeBlueprint.seedGuidance) {
      onChangeGuidance?.({
        ...guidance,
        ...activeBlueprint.seedGuidance
      });
    }

    if (!title.trim()) {
      onChangeTitle?.(`New ${activeBlueprint.name}`);
    }

    showToast({
      type: 'success',
      text: `Seeded Guided Spine from "${activeBlueprint.name}" blueprint!`
    });
    onAdvanceStage?.('lens');
  };

  const handleQuickMarkdownDump = async () => {
    if (!activeBlueprint) return;
    if (!title.trim()) {
      showToast({
        type: 'warning',
        text: 'Enter an Element Title above before running Quick Markdown Dump.'
      });
      return;
    }

    setIsSynthesizingDump(true);
    AudioService.playTerminalBeep(1250, 0.04);

    try {
      if (activeBlueprint.elementType && activeBlueprint.elementType !== type) {
        onRequestTypeChange?.(activeBlueprint.elementType, { silent: true });
      }
      const targetPlaybook = getPlaybookForType(activeBlueprint.elementType || type);

      const generatedMd = await synthesizeQuickBlueprintMarkdown({
        blueprint: activeBlueprint,
        title: title.trim(),
        directives: blueprintDirectives,
        catalog: elementsCatalog,
        guidance
      });

      onSetContent?.(formatMarkdownToQuillHtml(generatedMd));
      onMergeFields?.({
        ...(activeBlueprint.seedFields || {}),
        [targetPlaybook.pitchKey]:
          fields[targetPlaybook.pitchKey] || blueprintDirectives.trim() || activeBlueprint.summary,
        summary:
          fields.summary || `Synthesized via Blueprint: ${activeBlueprint.name}`,
        tags: fields.tags
          ? `${fields.tags}, ${activeBlueprint.seedTags || activeBlueprint.name}`
          : activeBlueprint.seedTags || `ScenarioGuide, ${activeBlueprint.name}`
      });

      if (activeBlueprint.seedGuidance && Object.keys(guidance || {}).length === 0) {
        onChangeGuidance?.({ ...activeBlueprint.seedGuidance });
      }

      AudioService.playCriticalChime(true);
      showToast({
        type: 'success',
        text: `Synthesized "${title.trim()}" from ${activeBlueprint.name}! Reviewing in Sheet view.`
      });
      onSwitchToSheet?.();
    } catch (err) {
      showToast({
        type: 'error',
        text: `Blueprint synthesis failed: ${err?.message || 'Unknown error'}`
      });
    } finally {
      setIsSynthesizingDump(false);
    }
  };

  const handleSeedFromDbmItem = (item) => {
    AudioService.playCriticalChime(true);
    if (!title.trim()) {
      onChangeTitle?.(item.displayTitle);
    }

    const tl = item.tl ?? item.tech_level ?? item['tech-level'];
    const ml = item.ml ?? item.meta_level ?? item['meta-level'];

    const patch = {
      dbmRef: item.id,
      dbmCategory: item.dbmCategory,
      [playbook.pitchKey]: fields[playbook.pitchKey] || item.displaySummary || `${item.displayTitle} (${item.dbmCategory})`,
      summary: fields.summary || item.displaySummary || ''
    };

    if (tl !== undefined) patch['tech-level'] = String(tl);
    if (ml !== undefined) patch['meta-level'] = String(ml);
    if (type === 'Persona' && item.dbmCategory === 'archetypes') {
      patch.archetype = item.displayTitle;
    }

    onMergeFields?.(patch);
    onSetDbmSyncStatus?.('synced');

    showToast({
      type: 'success',
      text: `Anchored to Omnicortex Canon: ${item.displayTitle}`
    });
  };

  const handleUnlinkDbm = () => {
    AudioService.playTerminalBeep(820, 0.03);
    onMergeFields?.({ dbmRef: '', dbmCategory: '' });
    onSetDbmSyncStatus?.('standalone');
  };

  return (
    <div className="space-y-5">
      {/* ── CORE IDENTITY & HIGH-CONCEPT PITCH CARD ── */}
      <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/95 p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Element Type Selector */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Element Classification
            </label>
            <div className="flex items-center gap-2">
              <select
                value={type}
                onChange={(e) => onRequestTypeChange?.(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 text-amber-300 p-2.5 rounded-xl text-xs font-mono font-bold outline-none cursor-pointer"
              >
                {ELEMENT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-950 text-slate-100">
                    {t}
                  </option>
                ))}
              </select>
              <span
                className={`hidden sm:inline-block text-[9px] font-mono px-2.5 py-1 rounded-full border font-bold uppercase shrink-0 ${getTypePillStyle(
                  type
                )}`}
              >
                {playbook.family}
              </span>
            </div>
          </div>

          {/* Element Title */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Element Title / Designation <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onChangeTitle?.(e.target.value)}
              placeholder={`e.g. Commander Vane, Orbital Station Kestrel, Null-Phase Blade...`}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white p-2.5 rounded-xl text-sm font-semibold outline-none transition-colors"
            />
          </div>
        </div>

        {/* High-Concept One-Line Pitch */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
              {playbook.pitchLabel}
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              Maps to <code className="text-cyan-400">{playbook.pitchKey}</code>
            </span>
          </div>
          <textarea
            rows={2}
            value={pitchValue}
            onChange={(e) => onChangeField?.(playbook.pitchKey, e.target.value)}
            placeholder={playbook.pitchPlaceholder}
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-3 rounded-xl text-xs leading-relaxed outline-none transition-colors resize-none"
          />
        </div>

        {/* Active DBM Canon Sync Pill if linked */}
        {fields.dbmRef && (
          <div className="px-3.5 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-200 truncate">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="font-bold">Omnicortex Canon Anchor:</span>
              <span className="text-white truncate">{fields.dbmRef}</span>
              {fields.dbmCategory && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 uppercase">
                  {fields.dbmCategory}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleUnlinkDbm}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[10px] uppercase font-bold shrink-0 cursor-pointer"
            >
              <X size={12} />
              <span>Unlink</span>
            </button>
          </div>
        )}
      </section>

      {/* ── SEED SOURCE SELECTOR: SPARK vs BLUEPRINTS vs OMNICORTEX DBM ── */}
      <section className="rounded-2xl border border-slate-800 bg-[#0c121e]/90 overflow-hidden shadow-lg">
        <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center gap-2 font-mono">
          {[
            { id: 'spark', label: 'Custom Spark', icon: Sparkles, badge: 'Manual' },
            { id: 'blueprint', label: 'Archetype Blueprints', icon: BookOpen, badge: `${ARCHETYPE_BLUEPRINTS.length}` },
            { id: 'dbm', label: 'Omnicortex Canon DBM', icon: Database, badge: 'Canon' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = seedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  AudioService.playTerminalBeep(1080, 0.02);
                  setSeedTab(tab.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
                  active
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={14} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300">
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          {/* TAB 1: CUSTOM SPARK */}
          {seedTab === 'spark' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Catalog Tags &amp; Taxonomies (Optional)
                  </label>
                  <input
                    type="text"
                    value={fields.tags || ''}
                    onChange={(e) => onChangeField?.('tags', e.target.value)}
                    placeholder="e.g. Syndicate, Outer Rim, Act I, Boss..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 p-2.5 rounded-xl text-xs outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Short Catalog Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={fields.summary || ''}
                    onChange={(e) => onChangeField?.('summary', e.target.value)}
                    placeholder="Displayed on Element Forge gallery cards..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 p-2.5 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
                <Compass size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 font-mono uppercase text-[11px]">
                    Playbook Active: {playbook.familyLabel}
                  </strong>
                  <p className="mt-0.5">
                    Next stages adapt specifically for <strong className="text-amber-300">{type}</strong>:
                    Stage 2 sets your Directorial Gems, Stage 3 drafts{' '}
                    <span className="text-purple-300">{playbook.stage3Title}</span>, and Stage 4 calibrates{' '}
                    <span className="text-amber-300">{playbook.stage4Title}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHETYPE BLUEPRINTS (STRUCTURED SPINE + QUICK MARKDOWN DUMP) */}
          {seedTab === 'blueprint' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Choose a blueprint to either <strong className="text-cyan-300">Seed the 5-Stage Spine</strong> with
                  structured Gems &amp; fields, or run a 1-click{' '}
                  <strong className="text-amber-300">Quick Markdown Dump</strong> straight into lore prose.
                </p>
                {matchingBlueprints.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllBlueprints((prev) => !prev)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold uppercase text-cyan-300 cursor-pointer"
                  >
                    {showAllBlueprints
                      ? `Filter to ${type} (${matchingBlueprints.length})`
                      : `Show All Blueprints (${ARCHETYPE_BLUEPRINTS.length})`}
                  </button>
                )}
              </div>

              {/* Blueprint Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {visibleBlueprints.map((bp) => {
                  const isSelected = activeBlueprint?.id === bp.id;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(1140, 0.02);
                        setSelectedBlueprintId(bp.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_14px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-lg shrink-0">{bp.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-mono font-bold truncate">{bp.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 shrink-0">
                            {bp.elementType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {bp.summary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Blueprint Context / Directives */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Custom Directives / Twist for Blueprint (Optional)
                </label>
                <input
                  type="text"
                  value={blueprintDirectives}
                  onChange={(e) => setBlueprintDirectives(e.target.value)}
                  placeholder="e.g. Set on a cryo-locked moon, tied to the Entari Combine, TL-4 security traps..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              {/* Dual Action Row: Seed Guided Spine vs Quick Markdown Dump */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSeedGuidedSpine}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/80 text-cyan-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
                >
                  <Compass size={15} className="text-cyan-400" />
                  <span>Seed Guided Spine → Stage 2</span>
                </button>

                <button
                  type="button"
                  disabled={isSynthesizingDump}
                  onClick={handleQuickMarkdownDump}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400/70 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_18px_rgba(217,119,6,0.25)] disabled:opacity-50 cursor-pointer"
                >
                  {isSynthesizingDump ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>AIME Synthesizing Markdown...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} />
                      <span>Quick Markdown Dump (1-Shot)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OMNICORTEX CANON DBM SEEDING */}
          {seedTab === 'dbm' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={dbmSearch}
                    onChange={(e) => setDbmSearch(e.target.value)}
                    placeholder="Search Omnicortex Canon records..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-xs text-slate-100 font-mono outline-none"
                  />
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                </div>

                {playbook.dbmCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllDbmCategories((prev) => !prev)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold uppercase text-cyan-300 cursor-pointer"
                  >
                    {showAllDbmCategories
                      ? `Filter to ${playbook.dbmCategories.join('/')} Canon`
                      : 'Browse All Canon Categories'}
                  </button>
                )}
              </div>

              {dbmCandidates.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-xs text-slate-500 font-mono">
                  No matching Omnicortex DBM entries found. Try broadening your search or switching categories.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {dbmCandidates.map((item) => {
                    const isLinked = fields.dbmRef === item.id;
                    return (
                      <div
                        key={`${item.dbmCategory}_${item.id}`}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 transition-all ${
                          isLinked
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold truncate">
                              {item.displayTitle}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 uppercase shrink-0">
                              {item.dbmCategory}
                            </span>
                          </div>
                          {item.displaySummary && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {item.displaySummary}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSeedFromDbmItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] font-mono font-bold uppercase shrink-0 cursor-pointer"
                        >
                          {isLinked ? '✓ Seeded' : '⚡ Seed'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
