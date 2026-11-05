/**
 * @file Stage5WebAndFinalize.jsx
 * @description Stage 5 of Guided Element Forge: Layer 3 Asset Hub Web, Dynamic Lorebook Triggers,
 * Preloaded Artist Hub Visual Identity, and Active Scenario Linking.
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Palette,
  Upload,
  Globe,
  Link2
} from 'lucide-react';
import AssetHubDeck from '../../components/AssetHubDeck';
import {
  recommendResonantAssets,
  deriveLorebookTriggersFromDraft,
  buildArtistHubVisualBrief
} from '../guidedElementAiService';
import { showToast } from '../../../../../context/ToastContext';
import { AudioService } from '../../../../../services/audioService';

export default function Stage5WebAndFinalize({
  draft,
  onChangeField,
  onMergeFields,
  assetHub = [],
  onChangeAssetHub,
  elementsCatalog = [],
  imageUrl = '',
  onUploadImageClick,
  onSetImageUrl,
  onOpenArtistHub,
  activeScenario = null,
  linkToActiveScenario = false,
  onToggleLinkToScenario
}) {
  const [showAdvancedLorebook, setShowAdvancedLorebook] = useState(false);
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const fields = draft.fields || {};

  const suggestions = useMemo(
    () =>
      recommendResonantAssets({
        draft,
        catalog: elementsCatalog,
        currentElementId: draft.id
      }),
    [draft, elementsCatalog]
  );

  const visualBrief = useMemo(() => buildArtistHubVisualBrief(draft), [draft]);

  const handleAcceptSuggestion = (sug) => {
    AudioService.playTerminalBeep(1260, 0.03);
    const nextEntry = {
      assetId: sug.assetId,
      assetTitle: sug.assetTitle,
      assetType: sug.assetType,
      importance: sug.suggestedImportance,
      annotation: sug.suggestedAnnotation
    };
    onChangeAssetHub?.([...assetHub, nextEntry]);
    showToast({
      type: 'success',
      text: `Linked "${sug.assetTitle}" (${sug.suggestedImportance} importance) to Asset Hub.`
    });
  };

  const handleAutoDeriveTriggers = () => {
    AudioService.playCriticalChime(true);
    const derived = deriveLorebookTriggersFromDraft(draft);
    onMergeFields?.(derived);
    showToast({
      type: 'success',
      text: 'Generated Pass-1 Primary & Pass-2 Secondary Lorebook triggers!'
    });
  };

  return (
    <div className="space-y-5">
      {/* ── 1. RESONANT ASSET HUB RECOMMENDER + LAYER 3 DECK ── */}
      {suggestions.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/40 bg-emerald-950/15 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono">
              <Sparkles size={15} className="text-emerald-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Resonant Catalog Entities Detected ({suggestions.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              1-click link into Layer 3 Asset Hub
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {suggestions.map((sug) => (
              <div
                key={sug.assetId}
                className="p-3 rounded-xl bg-slate-950/85 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {sug.assetTitle}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 uppercase shrink-0">
                      {sug.assetType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{sug.matchReason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAcceptSuggestion(sug)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 text-[10px] font-mono font-bold uppercase flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Link</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AssetHubDeck
        assetHub={assetHub}
        onChangeAssetHub={onChangeAssetHub}
        availableElements={elementsCatalog}
        currentElementId={draft.id}
        isCollapsedByDefault={false}
      />

      {/* ── 2. DYNAMIC LOREBOOK TRIGGER GENERATOR ── */}
      <section className="rounded-2xl border border-amber-500/35 bg-[#0c121e]/95 p-4 sm:p-5 space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound size={15} className="text-amber-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Dynamic Lorebook Injection Triggers
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Controls when AIME automatically injects this dossier into live scene prompts without bloating the context window.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoDeriveTriggers}
            className="px-3.5 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400/70 text-amber-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Auto-Generate Trigger Keys</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
              Pass-1 Primary Triggers (Comma-Separated)
            </label>
            <input
              type="text"
              value={fields.primaryTriggers || ''}
              onChange={(e) => onChangeField?.('primaryTriggers', e.target.value)}
              placeholder="e.g. Commander Vane, Vane, Kestrel Dock"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
              Pass-2 Secondary / Associative Triggers
            </label>
            <input
              type="text"
              value={fields.secondaryTriggers || ''}
              onChange={(e) => onChangeField?.('secondaryTriggers', e.target.value)}
              placeholder="e.g. Syndicate, trauma surgeon, cyberware"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-slate-100 p-2.5 rounded-xl text-xs outline-none font-sans"
            />
          </div>
        </div>

        {/* Progressive Disclosure for Regex & Story Flag Conditions */}
        <div className="pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedLorebook((prev) => !prev)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            {showAdvancedLorebook ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>Advanced Boolean, Speaker Regex &amp; Story Flag Conditions</span>
          </button>

          {showAdvancedLorebook && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/60">
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                  Selective Boolean Logic
                </label>
                <select
                  value={fields.triggerLogic || 'OR'}
                  onChange={(e) => onChangeField?.('triggerLogic', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-200 p-2 rounded-lg text-xs outline-none"
                >
                  <option value="OR">OR (Any Primary Match)</option>
                  <option value="AND_ANY">AND ANY (1 Primary + 1 Secondary)</option>
                  <option value="AND_ALL">AND ALL (All Primary Present)</option>
                  <option value="NOT_ANY">NOT ANY (Primary &amp; None of Secondary)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1">
                  Speaker Code Filter
                </label>
                <select
                  value={fields.speakerFilter || 'any'}
                  onChange={(e) => onChangeField?.('speakerFilter', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-purple-200 p-2 rounded-lg text-xs outline-none"
                >
                  <option value="any">Any Dialogue or Prose</option>
                  <option value="user_only">Operator Direct Address Only</option>
                  <option value="npc_only">NPC Direct Address Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">
                  Story Flag Requirement (Must Be True)
                </label>
                <input
                  type="text"
                  value={fields.loreRequireCondition || ''}
                  onChange={(e) => onChangeField?.('loreRequireCondition', e.target.value)}
                  placeholder="e.g. alarm_active && !stealth_mode"
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-200 p-2 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1">
                  Story Flag Suppression (Hidden If True)
                </label>
                <input
                  type="text"
                  value={fields.loreSuppressCondition || ''}
                  onChange={(e) => onChangeField?.('loreSuppressCondition', e.target.value)}
                  placeholder="e.g. sector_cleared"
                  className="w-full bg-slate-950 border border-slate-800 text-rose-200 p-2 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. VISUAL IDENTITY & PRELOADED ARTIST HUB ── */}
      <section className="rounded-2xl border border-purple-500/35 bg-[#0c121e]/95 p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <Palette size={15} className="text-purple-400" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
              Visual Portrait &amp; Concept Art
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <button
              type="button"
              onClick={onUploadImageClick}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={12} />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlBar((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Globe size={12} />
              <span>Image URL</span>
            </button>

            <button
              type="button"
              onClick={onOpenArtistHub}
              className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-400/70 text-purple-200 text-[11px] font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer"
            >
              <Palette size={12} />
              <span>Launch Artist Hub (Preloaded Brief)</span>
            </button>
          </div>
        </div>

        {showUrlBar && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://example.com/portrait.png"
              className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => {
                if (urlDraft.trim()) {
                  onSetImageUrl?.(urlDraft.trim());
                  setUrlDraft('');
                  setShowUrlBar(false);
                }
              }}
              className="px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-200 text-xs font-mono font-bold uppercase cursor-pointer"
            >
              Apply
            </button>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Element Visual"
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-xl shrink-0">
              🎨
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase text-purple-300 font-bold">
              Synthesized Artist Hub Prompt Brief
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{visualBrief}</p>
          </div>
        </div>
      </section>

      {/* ── 4. ONE-CLICK SCENARIO BINDING ON SAVE ── */}
      {activeScenario && (
        <label className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-cyan-400/70 transition-colors">
          <div className="flex items-center gap-3">
            <Link2 size={16} className="text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-cyan-200 uppercase tracking-wider">
                Link to Active Scenario: {activeScenario.title || activeScenario.name || 'Current Node'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically attaches this {draft.type} to the active Weaver scenario&apos;s Asset Hub upon saving.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(linkToActiveScenario)}
            onChange={(e) => onToggleLinkToScenario?.(e.target.checked)}
            className="w-4 h-4 accent-cyan-400 cursor-pointer shrink-0"
          />
        </label>
      )}
    </div>
  );
}
