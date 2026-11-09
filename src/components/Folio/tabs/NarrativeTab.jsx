import React, { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFolio } from '../../../context/FolioContext';
import { useStory } from '../../../context/CampaignContext';
import { useDBM } from '../../../context/DBMContext';
import ChatParser from '../../UI/ChatParser';
import { FOLIO_NARRATIVE_SECTIONS } from '../../../utils/personaBridge';
import { buildUnifiedAdeCatalog } from '../../../utils/cortexAdeAssetBridge';
import AimeThreeTierStack from '../../../pages/Foundry/ElementForge/components/AimeThreeTierStack';
import { NpcScriptBuilder } from '../../../pages/Foundry/ElementForge/components/NpcScriptBuilder';
import { AimeGuidanceFlyout } from '../../StoryFoundry/AimeGuidanceFlyout';
import { AimeGuidanceButton } from '../../StoryFoundry/AimeGuidanceButton';
import { Bot, Sparkles, Plus, Trash2, BookOpen, Sliders } from 'lucide-react';

const AutoExpandingTextarea = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(38, el.scrollHeight)}px`;
    }
  }, []);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [adjustHeight]);

  const isEmpty = !value || !String(value).trim();
  const emptyShadowStyle = isEmpty
    ? 'shadow-[inset_0_2px_6px_rgba(0,0,0,0.6),0_0_10px_rgba(6,182,212,0.18)] border-cyan-700/60 focus:shadow-[0_0_14px_rgba(6,182,212,0.35)]'
    : 'border-slate-700/60 shadow-inner';

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className={`${className} ${emptyShadowStyle}`}
      style={{ fieldSizing: 'content' }}
    />
  );
};

// Bidirectional alias map between AIME Layer 2 Core Traits keys and Persona Folio keys
const AIME_TO_FOLIO_KEY_MAP = {
  name: 'char-name',
  archetype: 'char-concept',
  oneLinePitch: 'summary',
  physicalDescription: 'appearance',
  personalityMannerisms: 'mannerisms',
  backgroundHistory: 'backstory',
  goalsMotivations: 'char-motive',
  strengthsFlaws: 'positiveTraits',
  roleInStory: 'role',
  relationships: 'keyRelationships'
};

const FOLIO_TO_AIME_KEY_MAP = Object.entries(AIME_TO_FOLIO_KEY_MAP).reduce((acc, [aimeKey, folioKey]) => {
  acc[folioKey] = aimeKey;
  return acc;
}, {});

const NarrativeTab = ({ initialSubTab = null }) => {
  const { characterData, updateField, isLocked, isPlayerOverride, personaRoster, publicCatalog } = useFolio();
  const storyCtx = useStory() || {};
  const dbmCtx = useDBM() || {};
  const isSheetLocked = Boolean(isLocked && !isPlayerOverride);

  const [activeTabId, setActiveTabId] = useState(initialSubTab || 'profile');
  const [isAimeGuidanceOpen, setIsAimeGuidanceOpen] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTabId(initialSubTab);
    }
  }, [initialSubTab]);

  // Listen for custom navigation events to jump directly to Scripting or Custom Fields sub-tab
  useEffect(() => {
    const handleSelectSubTab = (e) => {
      if (e?.detail?.subTab) {
        setActiveTabId(e.detail.subTab);
      }
    };
    window.addEventListener('folio-narrative-subtab', handleSelectSubTab);
    return () => window.removeEventListener('folio-narrative-subtab', handleSelectSubTab);
  }, []);

  const handleTextChange = useCallback((field, value) => {
    if (characterData?.[field] === value) return;
    updateField(field, value);
    // Keep AIME Layer 2 alias and Folio canonical key in sync
    if (AIME_TO_FOLIO_KEY_MAP[field]) {
      const folioKey = AIME_TO_FOLIO_KEY_MAP[field];
      if (characterData?.[folioKey] !== value) {
        updateField(folioKey, value);
      }
    } else if (FOLIO_TO_AIME_KEY_MAP[field]) {
      const aimeKey = FOLIO_TO_AIME_KEY_MAP[field];
      if (characterData?.[aimeKey] !== value) {
        updateField(aimeKey, value);
      }
    }
    if (field === 'narrativeProse' && characterData?.content !== value) {
      updateField('content', value);
    } else if (field === 'content' && characterData?.narrativeProse !== value) {
      updateField('narrativeProse', value);
    }
  }, [characterData, updateField]);

  // Unified fields view for AimeThreeTierStack & NpcScriptBuilder
  const syncedAimeFields = useMemo(() => {
    const d = characterData || {};
    return {
      ...d,
      name: d['char-name'] || d.name || '',
      archetype: d['char-concept'] || d.archetype || d['char-archetype'] || '',
      oneLinePitch: d.summary || d.oneLinePitch || '',
      physicalDescription: d.appearance || d.physicalDescription || '',
      personalityMannerisms: d.mannerisms || d.personalityMannerisms || '',
      backgroundHistory: d.backstory || d.backgroundHistory || '',
      goalsMotivations: d['char-motive'] || d.goalsMotivations || d.goals || '',
      strengthsFlaws: d.positiveTraits || d.strengthsFlaws || '',
      roleInStory: d.role || d.roleInStory || '',
      relationships: d.keyRelationships || d.relationships || '',
      mcmRole: d.mcmRole || d.competencyRole || 'Tank',
      mcmTier: String(d.mcmTier ?? d.threatTier ?? 3),
      mcmDesignation: d.mcmDesignation || d.designation || 'Ally'
    };
  }, [characterData]);

  // Available ecosystem assets for Layer 3 Asset Hub linking
  const availableElements = useMemo(() => {
    try {
      return buildUnifiedAdeCatalog({
        elementsCatalog: storyCtx.elementsCatalog || [],
        dbData: dbmCtx.dbData || {},
        folioRoster: personaRoster || [],
        publicPersonas: publicCatalog || []
      });
    } catch {
      return storyCtx.elementsCatalog || [];
    }
  }, [storyCtx.elementsCatalog, dbmCtx.dbData, personaRoster, publicCatalog]);

  // Custom fields array helpers
  const customFields = useMemo(() => {
    const raw = characterData?.customFields;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }, [characterData?.customFields]);

  const handleAddCustomField = () => {
    const next = [...customFields, { id: uuidv4(), label: '', value: '' }];
    updateField('customFields', next);
  };

  const handleUpdateCustomField = (id, key, val) => {
    const next = customFields.map((cf) => (cf.id === id ? { ...cf, [key]: val } : cf));
    updateField('customFields', next);
  };

  const handleRemoveCustomField = (id) => {
    const next = customFields.filter((cf) => cf.id !== id);
    updateField('customFields', next);
  };

  const allSubTabs = [
    ...FOLIO_NARRATIVE_SECTIONS.map((s) => ({ id: s.id, title: s.title })),
    { id: 'custom-fields', title: `Custom Fields${customFields.length > 0 ? ` (${customFields.length})` : ''}` },
    { id: 'scripting', title: '🤖 Scripting' }
  ];

  const currentNarrativeSection = FOLIO_NARRATIVE_SECTIONS.find((s) => s.id === activeTabId) || FOLIO_NARRATIVE_SECTIONS[0];

  return (
    <div className="tab-panel active p-4 space-y-4 pb-20 w-full">
      {/* Narrative Sub-Tabs Navigation Bar */}
      <div className="flex flex-wrap border-b border-cyan-900/50 mb-2 pb-1 gap-1">
        {allSubTabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const isScriptingTab = tab.id === 'scripting';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors flex-1 sm:flex-none text-center rounded-t-lg cursor-pointer ${
                isActive
                  ? isScriptingTab
                    ? 'border-b-2 border-purple-400 text-purple-300 bg-purple-950/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'border-b-2 border-cyan-500 text-cyan-400 bg-cyan-950/40'
                  : isScriptingTab
                  ? 'text-purple-300/80 hover:text-purple-200 hover:bg-purple-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      {/* ── SUB-TABS 1–4: CANONICAL PERSONA FOLIO NARRATIVE SECTIONS + PROSE & LORE ── */}
      {FOLIO_NARRATIVE_SECTIONS.some((s) => s.id === activeTabId) && (
        <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-cyan-900/40 w-full space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
            <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
              {currentNarrativeSection.title}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Synced with MCM &amp; Story Persona Element
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentNarrativeSection.fields.map((field) => {
              const isSpanned = Boolean(
                field.span2 ||
                ['backstory', 'summary', 'appearance', 'worldview', 'goals', 'plotHooks'].includes(field.id)
              );
              const val =
                characterData[field.id] ||
                (field.aliasKeys || []).map((k) => characterData[k]).find(Boolean) ||
                '';

              return (
                <div key={field.id} className={`flex flex-col gap-1 ${isSpanned ? 'lg:col-span-2' : ''}`}>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                    {field.label}
                  </label>
                  {isSheetLocked ? (
                    <div className="w-full min-h-[32px] px-3 py-1.5 text-sm text-slate-200 whitespace-pre-wrap font-sans bg-slate-950/40 rounded border border-slate-800/60">
                      {val ? (
                        <ChatParser text={val} />
                      ) : (
                        <span className="text-slate-600 italic text-xs font-mono">None</span>
                      )}
                    </div>
                  ) : (
                    <AutoExpandingTextarea
                      value={val}
                      onChange={(nextVal) => handleTextChange(field.id, nextVal)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950/80 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 outline-none resize-none overflow-hidden transition-colors min-h-[38px]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Narrative Prose & Lore (Persona Element Detailed Description & Narrative Notes) */}
          <div className="pt-4 border-t border-cyan-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <BookOpen size={13} className="text-cyan-400" />
                <span>Narrative Prose &amp; Lore (Persona Element Dossier Body)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Shared with Persona Element &amp; MCM Prose
              </span>
            </div>
            {isSheetLocked ? (
              <div className="w-full min-h-[48px] px-3 py-2 text-sm text-slate-200 whitespace-pre-wrap font-sans bg-slate-950/40 rounded border border-slate-800/60">
                {characterData.narrativeProse || characterData.content ? (
                  <ChatParser text={characterData.narrativeProse || characterData.content} />
                ) : (
                  <span className="text-slate-600 italic text-xs font-mono">No extended narrative prose recorded.</span>
                )}
              </div>
            ) : (
              <AutoExpandingTextarea
                value={characterData.narrativeProse || characterData.content || ''}
                onChange={(val) => handleTextChange('narrativeProse', val)}
                placeholder="Write extended narrative prose, lore notes, dialogue samples, or dossier exposition..."
                className="w-full bg-slate-950/80 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 outline-none resize-none overflow-hidden transition-colors min-h-[72px]"
              />
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 5: CUSTOM FIELDS & KEY-VALUE ATTRIBUTES ── */}
      {activeTabId === 'custom-fields' && (
        <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-cyan-900/40 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
            <div>
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Custom Fields &amp; Key-Value Attributes
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Define custom key-value properties carried across Persona Folio, MCM, and Story Persona Elements.
              </p>
            </div>
            {!isSheetLocked && (
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Custom Field</span>
              </button>
            )}
          </div>

          {customFields.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              No custom fields defined yet. Click &quot;+ Add Custom Field&quot; to attach custom attributes or metadata.
            </div>
          ) : (
            <div className="space-y-3">
              {customFields.map((cf, idx) => (
                <div
                  key={cf.id || idx}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    {isSheetLocked ? (
                      <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                        {cf.label || `Field #${idx + 1}`}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={cf.label || ''}
                        onChange={(e) => handleUpdateCustomField(cf.id, 'label', e.target.value)}
                        placeholder="Field Label (e.g. Clearance Code, Bounty Value, Secret)"
                        className="bg-slate-900 border border-slate-700 text-cyan-300 p-1.5 rounded text-xs font-bold outline-none focus:border-cyan-400 flex-1"
                      />
                    )}
                    {!isSheetLocked && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(cf.id)}
                        className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove Custom Field"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  {isSheetLocked ? (
                    <div className="text-sm text-slate-200 whitespace-pre-wrap font-sans px-1">
                      {cf.value || <span className="text-slate-600 italic text-xs">Empty</span>}
                    </div>
                  ) : (
                    <AutoExpandingTextarea
                      value={cf.value || ''}
                      onChange={(val) => handleUpdateCustomField(cf.id, 'value', val)}
                      placeholder="Field value / description..."
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-xs outline-none focus:border-cyan-400"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUB-TAB 6: SCRIPTING (AUTOMATED VTT ROUTINES, AI GUIDANCE & AIME 3-TIER ARCHITECTURE) ── */}
      {activeTabId === 'scripting' && (
        <div className="space-y-5">
          {/* Scripting & AI Guidance Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-[#141026] to-slate-950 border border-purple-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black font-mono uppercase tracking-wider text-purple-300">
                    Scripting &amp; AIME 3-Tier Architecture
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                    AI &amp; VTT Automation
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Configure autonomous VTT routines, relational directives, and the AIME 3-Tier Architecture (Layer 1 Guidance, Layer 2 Core Traits &amp; Lorebook, Layer 3 Asset Hub).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AimeGuidanceButton
                onClick={() => setIsAimeGuidanceOpen(true)}
                label="AIME AI Guidance"
                size="sm"
              />
            </div>
          </div>

          {/* 1. Autonomous VTT Script & Relations Builder */}
          <NpcScriptBuilder
            fields={syncedAimeFields}
            onFieldChange={handleTextChange}
            elementTitle={characterData['char-name'] || 'Persona'}
            onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
          />

          {/* 2. Full AIME 3-Tier Architecture Stack (Layer 1 Guidance, Layer 2 Traits & Lorebook, Layer 3 Asset Hub) */}
          <AimeThreeTierStack
            elementType="Persona"
            fields={syncedAimeFields}
            onChangeField={handleTextChange}
            guidance={characterData.guidance || {}}
            onChangeGuidance={(nextGuidance) => updateField('guidance', nextGuidance)}
            assetHub={characterData.assetHub || []}
            onChangeAssetHub={(nextHub) => updateField('assetHub', nextHub)}
            availableElements={availableElements}
            currentElementId={characterData['character-doc-id'] || characterData.id}
            onOpenAimeGuidance={() => setIsAimeGuidanceOpen(true)}
          />
        </div>
      )}

      {isAimeGuidanceOpen && (
        <AimeGuidanceFlyout
          isOpen={isAimeGuidanceOpen}
          onClose={() => setIsAimeGuidanceOpen(false)}
          targetType="Persona"
          contextData={{
            title: characterData['char-name'] || 'Unnamed Persona',
            type: 'Persona',
            fields: syncedAimeFields,
            content: characterData.narrativeProse || characterData.content || ''
          }}
          onApplyGuidance={(suggestion) => {
            if (!characterData.narrativeProse && !characterData.content) {
              handleTextChange('narrativeProse', suggestion);
            } else if (!characterData.summary) {
              handleTextChange('summary', suggestion.slice(0, 200));
            }
          }}
        />
      )}
    </div>
  );
};

export default NarrativeTab;
