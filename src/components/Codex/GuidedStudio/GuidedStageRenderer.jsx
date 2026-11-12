import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Zap,
  BookOpen,
  Eye,
  Edit3,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Layers,
  Code,
  Copy,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Cpu
} from 'lucide-react';

import {
  UDUCapacityMeter,
  SpeciesTraitSelector,
  EconomatrixStudioWorkflow,
  TechnologyStudioWorkflow,
  ScalingStudioWorkflow,
  PlanetaryCivilizationWorkflow
} from '../../../pages/Codex/components';

import { CostEconomyWidget } from '../../DBM/widgets/CostEconomyWidget';
import { UniversalModifiersWidget } from '../../DBM/widgets/UniversalModifiersWidget';
import { ModificationsWidget } from '../../DBM/widgets/ModificationsWidget';
import { CriticalDetailsWidget } from '../../DBM/widgets/CriticalDetailsWidget';
import { SocketsAllocationWidget } from '../../DBM/widgets/SocketsAllocationWidget';

import {
  getItemCosts,
  getItemModifiers,
  getItemModifications,
  getItemCriticalDetails,
  getItemSockets
} from '../../../utils/tangentSchemaAdapters';

import { evaluateStepReadiness } from './studioPlaybooks';
import { findReverseCortexDependencies } from './intelligence/cortexExemplarService';
import { CortexStepCopilotPanel } from './CortexStepCopilotPanel';
import { Step1BlueprintSeeder } from './Step1BlueprintSeeder';

/**
 * GuidedStageRenderer
 * Renders the active stage of any Guided Studio Playbook (`blueprint_specs`,
 * `configurator`, `suite_workflow`, or `final_review`) with step-scoped
 * Omnicortex RAG citations, peer benchmarks, and user-cued BASTION diffing.
 */
export const GuidedStageRenderer = ({
  playbook,
  step,
  activeStepIndex = 0,
  onSelectStep,
  activeSubStepId = null,
  onSelectSubStep,
  domainKey = 'gear',
  matrix = {},
  isSpeciesStudio = false,
  isProperty = false,
  showSocketsAndUDU = false,
  showDamageOrEffect = false,
  showModifications = false,
  CustomConfigurator = null,
  isSectionAwareConfigurator = false,
  specsFields = [],
  visibleMechanicsFields = [],
  formData = {},
  computedValues = {},
  liveBuildCheck = null,
  speciesSummary = null,
  dbData = {},
  isEditMode = true,
  loreViewMode = 'preview',
  setLoreViewMode,
  activeGeneticsTab = 'chassis',
  onGeneticsTabChange,
  omnicortexMarkdownComponents,
  handleFieldChange,
  handleApplyBatchUpdates,
  handleApplySeed,
  onOpenPicker,
  renderFieldControl,
  renderRelationalGuidance
}) => {
  const [showEmbeddedSuite, setShowEmbeddedSuite] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const activeSubStep = useMemo(() => {
    if (!Array.isArray(step?.subSteps) || step.subSteps.length === 0) return null;
    return step.subSteps.find((s) => s.id === activeSubStepId) || step.subSteps[0];
  }, [step?.subSteps, activeSubStepId]);

  const reverseDeps = useMemo(() => {
    if (step?.viewType !== 'final_review') return [];
    const res = findReverseCortexDependencies(formData, domainKey, dbData, 14);
    return Array.isArray(res) ? res : (res?.sampleMatches || []);
  }, [step?.viewType, formData, domainKey, dbData]);

  if (!step) return null;

  const shouldRenderBlueprintConfigurator = Boolean(
    CustomConfigurator &&
      isSectionAwareConfigurator &&
      step.configuratorSection &&
      !['nature', 'astrography'].includes(step.configuratorSection)
  );

  const shouldRenderStepConfigurator = Boolean(
    CustomConfigurator &&
      !isSpeciesStudio &&
      (isSectionAwareConfigurator || ['chassis', 'imbuement'].includes(step.configuratorSection))
  );

  const widgetSet = new Set(Array.isArray(step.widgets) ? step.widgets : []);
  const widgetSlice = activeSubStep?.widgetSlice || null;

  const showCoreMechanicsGrid =
    !isSpeciesStudio &&
    visibleMechanicsFields.length > 0 &&
    (step.configuratorSection === 'mechanics' || !CustomConfigurator) &&
    (!widgetSlice || widgetSlice === 'core');

  const showSocketsWidget =
    isProperty && showSocketsAndUDU && widgetSet.has('sockets') && (!widgetSlice || widgetSlice === 'sockets_mods');
  const showModsWidget =
    isProperty && showModifications && widgetSet.has('modifications') && (!widgetSlice || widgetSlice === 'sockets_mods');
  const showCritsWidget =
    (showDamageOrEffect || widgetSet.has('critical_details')) &&
    widgetSet.has('critical_details') &&
    (!widgetSlice || widgetSlice === 'crits_modifiers');
  const showModifiersWidget =
    !isSpeciesStudio && widgetSet.has('modifiers') && (!widgetSlice || widgetSlice === 'crits_modifiers');
  const showCostsWidget = isProperty && widgetSet.has('costs');

  const effectiveLoreText = formData.body || formData.lore || '';
  const effectiveLoreMode =
    isEditMode && !effectiveLoreText && loreViewMode === 'preview' ? 'edit' : loreViewMode;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Top Cortex Intelligence & Step Copilot Header ── */}
      <CortexStepCopilotPanel
        playbook={playbook}
        step={step}
        activeSubStepId={activeSubStep?.id || activeSubStepId}
        onSelectSubStep={onSelectSubStep}
        domainKey={domainKey}
        formData={formData}
        dbData={dbData}
        computedValues={computedValues}
        liveBuildCheck={liveBuildCheck}
        isEditMode={isEditMode}
        onApplyFieldUpdates={handleApplyBatchUpdates}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          STAGE VIEW 1: BLUEPRINT, TAXONOMY & EXEMPLAR SEEDER
         ═══════════════════════════════════════════════════════════════════════ */}
      {step.viewType === 'blueprint_specs' && (
        <div className="space-y-4">
          <Step1BlueprintSeeder
            matrix={matrix}
            domainKey={domainKey}
            formData={formData}
            dbData={dbData}
            onApplySeed={handleApplySeed}
            isEditMode={isEditMode}
          />

          {specsFields.length > 0 && (
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specsFields.map((field) => renderFieldControl(field, 'specs'))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  High-Concept Summary & Visual Overview
                </label>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Define high-concept role, silhouette, operational purpose, or cultural origin..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400 resize-y leading-relaxed"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={omnicortexMarkdownComponents}>
                      {formData.description || 'No description provided.'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {shouldRenderBlueprintConfigurator && (
            <CustomConfigurator
              formData={formData}
              onChange={handleFieldChange}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              dbData={dbData}
              domainKey={domainKey}
              stepSection={step.configuratorSection}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STAGE VIEW 2: DOMAIN CONFIGURATOR, MECHANICS & SUB-WIDGETS
         ═══════════════════════════════════════════════════════════════════════ */}
      {step.viewType === 'configurator' && (
        <div className="space-y-4">
          {/* UDU Capacity Meter */}
          {showSocketsAndUDU && Array.isArray(matrix.budgets) && matrix.budgets.length > 0 && (
            <div className="space-y-2">
              {matrix.budgets.map((b) => (
                <UDUCapacityMeter
                  key={b.id}
                  budget={b}
                  formData={formData}
                  computedValues={computedValues}
                />
              ))}
            </div>
          )}

          {/* Species Multi-Step Genetics Studio */}
          {isSpeciesStudio && (
            <SpeciesTraitSelector
              formData={formData}
              onChange={handleFieldChange}
              isEditMode={isEditMode}
              onOpenPicker={onOpenPicker}
              dbData={dbData}
              activeTab={activeSubStep?.geneticsTab || step.geneticsTab || activeGeneticsTab}
              onTabChange={onGeneticsTabChange}
              hideNavRail={true}
            />
          )}

          {/* Specialized Domain Configurator */}
          {shouldRenderStepConfigurator && (
            <div className={isSectionAwareConfigurator ? 'space-y-4' : 'p-4 bg-slate-950/70 border border-amber-500/30 rounded-2xl shadow-inner'}>
              {!isSectionAwareConfigurator && (
                <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>{matrix.name} Chassis & System Configurator</span>
                </div>
              )}
              <CustomConfigurator
                formData={formData}
                onChange={handleFieldChange}
                isEditMode={isEditMode}
                onOpenPicker={onOpenPicker}
                dbData={dbData}
                domainKey={domainKey}
                stepSection={step.configuratorSection || 'all'}
              />
            </div>
          )}

          {/* Operational & Combat Schema Parameters */}
          {showCoreMechanicsGrid && (
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Zap size={14} />
                <span>
                  {matrix.name} {isProperty ? 'Operational Parameters & Combat Stats' : 'Mechanical Parameters'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleMechanicsFields.map((field) => renderFieldControl(field, 'mechanics'))}
              </div>
            </div>
          )}

          {/* Step-Scoped DBM Sub-Widgets */}
          {(showSocketsWidget || showModsWidget || showCritsWidget || showModifiersWidget || showCostsWidget) && (
            <div className="space-y-4">
              {showSocketsWidget && (
                <SocketsAllocationWidget
                  sockets={formData.sockets || getItemSockets(formData)}
                  onChange={(newSockets) => handleFieldChange('sockets', newSockets)}
                  isEditMode={isEditMode}
                />
              )}

              {showModsWidget && (
                <ModificationsWidget
                  modifications={formData.modifications || getItemModifications(formData)}
                  onChange={(newMods) => handleFieldChange('modifications', newMods)}
                  isEditMode={isEditMode}
                />
              )}

              {showCritsWidget && (
                <CriticalDetailsWidget
                  criticalDetails={formData.critical_details || getItemCriticalDetails(formData)}
                  onChange={(newCrit) => handleFieldChange('critical_details', newCrit)}
                  isEditMode={isEditMode}
                />
              )}

              {showModifiersWidget && (
                <UniversalModifiersWidget
                  modifiers={formData.modifiers || getItemModifiers(formData)}
                  onChange={(newMods) => handleFieldChange('modifiers', newMods)}
                  relationalData={dbData}
                  isEditMode={isEditMode}
                />
              )}

              {showCostsWidget && (
                <CostEconomyWidget
                  costs={formData.costs || getItemCosts(formData)}
                  onChange={(newCosts) => handleFieldChange('costs', newCosts)}
                  isEditMode={isEditMode}
                />
              )}
            </div>
          )}

          {/* Optional Embedded Suite Drawer (e.g., Scaling Simulator, 16-Domain Radar, or Economatrix) */}
          {step.includeSuiteTab && (
            <div className="bg-slate-950/75 border border-slate-800 rounded-2xl overflow-hidden">
              {step.includeSuiteTab === 'economatrix' || (domainKey === 'factions' && step.includeSuiteTab === 'technology') ? (
                <div className="p-4">
                  {step.includeSuiteTab === 'economatrix' ? (
                    <EconomatrixStudioWorkflow
                      matrix={matrix}
                      formData={formData}
                      onChange={handleFieldChange}
                      isEditMode={isEditMode}
                      computedValues={computedValues}
                    />
                  ) : (
                    <PlanetaryCivilizationWorkflow
                      matrix={matrix}
                      formData={formData}
                      onChange={handleFieldChange}
                      isEditMode={isEditMode}
                    />
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEmbeddedSuite((prev) => !prev)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-slate-900/80 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {step.includeSuiteTab === 'scaling' ? <Maximize2 size={13} /> : <Cpu size={13} />}
                      <span>
                        {step.includeSuiteTab === 'scaling'
                          ? 'Volumetric Scaling & Scale Matchup Simulator'
                          : 'Technology Spectrum & Schematic Reference'}
                      </span>
                    </span>
                    {showEmbeddedSuite ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {showEmbeddedSuite && (
                    <div className="p-4 border-t border-slate-800">
                      {step.includeSuiteTab === 'scaling' ? (
                        <ScalingStudioWorkflow
                          matrix={matrix}
                          formData={formData}
                          onChange={handleFieldChange}
                          isEditMode={isEditMode}
                          computedValues={computedValues}
                        />
                      ) : (
                        <TechnologyStudioWorkflow
                          matrix={matrix}
                          formData={formData}
                          onChange={handleFieldChange}
                          isEditMode={isEditMode}
                          computedValues={computedValues}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STAGE VIEW 3: INTERACTIVE SYSTEM SUITE WORKFLOW
         ═══════════════════════════════════════════════════════════════════════ */}
      {step.viewType === 'suite_workflow' && (
        <div className="space-y-4">
          {step.suiteType === 'economatrix' && (
            <EconomatrixStudioWorkflow
              matrix={matrix}
              formData={formData}
              onChange={handleFieldChange}
              isEditMode={isEditMode}
              computedValues={computedValues}
            />
          )}

          {step.suiteType === 'technology' && (
            ['planetary_design', 'world', 'factions'].includes(domainKey) ||
            ['planetary-design', 'factions', 'world'].includes(matrix.id) ? (
              <PlanetaryCivilizationWorkflow
                matrix={matrix}
                formData={formData}
                onChange={handleFieldChange}
                isEditMode={isEditMode}
              />
            ) : (
              <TechnologyStudioWorkflow
                matrix={matrix}
                formData={formData}
                onChange={handleFieldChange}
                isEditMode={isEditMode}
                computedValues={computedValues}
              />
            )
          )}

          {step.suiteType === 'scaling' && (
            <ScalingStudioWorkflow
              matrix={matrix}
              formData={formData}
              onChange={handleFieldChange}
              isEditMode={isEditMode}
              computedValues={computedValues}
            />
          )}

          {showCostsWidget && (
            <CostEconomyWidget
              costs={formData.costs || getItemCosts(formData)}
              onChange={(newCosts) => handleFieldChange('costs', newCosts)}
              isEditMode={isEditMode}
            />
          )}

          {showModifiersWidget && (
            <UniversalModifiersWidget
              modifiers={formData.modifiers || getItemModifiers(formData)}
              onChange={(newMods) => handleFieldChange('modifiers', newMods)}
              relationalData={dbData}
              isEditMode={isEditMode}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STAGE VIEW 4: FINAL REVIEW — LORE, CORTEX RELATIONS & READINESS AUDIT
         ═══════════════════════════════════════════════════════════════════════ */}
      {step.viewType === 'final_review' && (
        <div className="space-y-4">
          {/* SUB-SLICE A: NARRATIVE & MARKDOWN LORE */}
          {(!activeSubStep?.viewSlice || activeSubStep.viewSlice === 'narrative') && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Rules Summary & Operational Procedure
                </label>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={formData.mechanic || ''}
                    onChange={(e) => handleFieldChange('mechanic', e.target.value)}
                    placeholder="Concise mechanical summary, resolution procedure, or special operational notes..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono leading-relaxed">
                    {formData.mechanic || 'None defined.'}
                  </div>
                )}
              </div>

              {/* Markdown Dossier Editor */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-purple-400" />
                    <span>Compendium Markdown Dossier & Lore</span>
                  </label>

                  {isEditMode && setLoreViewMode && (
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setLoreViewMode('preview')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          effectiveLoreMode === 'preview'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Eye size={12} />
                        <span>Formatted</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoreViewMode('edit')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          effectiveLoreMode === 'edit'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Edit3 size={12} />
                        <span>Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoreViewMode('split')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                          effectiveLoreMode === 'split'
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sliders size={12} />
                        <span>Split</span>
                      </button>
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  effectiveLoreMode === 'split' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[320px]">
                      <div className="space-y-1 flex flex-col">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Raw Markdown Editor</span>
                        <textarea
                          rows={12}
                          value={effectiveLoreText}
                          onChange={(e) => handleFieldChange('body', e.target.value)}
                          placeholder="Write self-contained in-universe lore, history, and operational context..."
                          className="w-full flex-1 p-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed resize-y"
                        />
                      </div>
                      <div className="space-y-1 flex flex-col">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Live Formatted Preview</span>
                        <div className="flex-1 p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={omnicortexMarkdownComponents}>
                            {effectiveLoreText || '*No narrative lore recorded.*'}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : effectiveLoreMode === 'edit' ? (
                    <textarea
                      rows={10}
                      value={effectiveLoreText}
                      onChange={(e) => handleFieldChange('body', e.target.value)}
                      placeholder="Write self-contained in-universe lore, history, and operational context (supports Markdown)..."
                      className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 leading-relaxed"
                    />
                  ) : (
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={omnicortexMarkdownComponents}>
                        {effectiveLoreText || '*No narrative lore recorded.*'}
                      </ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={omnicortexMarkdownComponents}>
                      {effectiveLoreText || '*No narrative lore recorded.*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Canonical Rulebook Full Text (Origins 1.05, Occupations 1.06, Archetypes 1.02, Skills 1.07, Features 1.08) */}
              {(formData.full_text ||
                ['origins', 'occupations', 'archetypes', 'skills', 'features'].includes(domainKey)) && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} />
                    <span>Canonical Rulebook Full-Text Entry</span>
                  </label>
                  {isEditMode ? (
                    <textarea
                      rows={8}
                      value={formData.full_text || ''}
                      onChange={(e) => handleFieldChange('full_text', e.target.value)}
                      placeholder="Full canonical rulebook Markdown entry..."
                      className="w-full p-3 bg-slate-950/80 border border-emerald-500/40 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400 leading-relaxed"
                    />
                  ) : (
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={omnicortexMarkdownComponents}>
                        {formData.full_text || 'No full rules text recorded.'}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* Faction Sociological Chronicle Fields */}
              {domainKey === 'factions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                      Core Beliefs & Ideological Foundations
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isEditMode}
                      value={formData.core_beliefs || ''}
                      onChange={(e) => handleFieldChange('core_beliefs', e.target.value)}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                      Social Structure & Internal Hierarchy
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isEditMode}
                      value={formData.social_structure || ''}
                      onChange={(e) => handleFieldChange('social_structure', e.target.value)}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                      Diplomatic Posture & Foreign Relations
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isEditMode}
                      value={formData.relationship_to_others || ''}
                      onChange={(e) => handleFieldChange('relationship_to_others', e.target.value)}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                      Official Motto & Colloquial Slang
                    </label>
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={formData.motto || ''}
                      onChange={(e) => handleFieldChange('motto', e.target.value)}
                      placeholder="Official Motto..."
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono"
                    />
                    <input
                      type="text"
                      disabled={!isEditMode}
                      value={formData.colloquialisms || ''}
                      onChange={(e) => handleFieldChange('colloquialisms', e.target.value)}
                      placeholder="In-universe slang..."
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Architect Notes */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Architect Notes, Secrets & Plot Hooks
                </label>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={formData.note || ''}
                    onChange={(e) => handleFieldChange('note', e.target.value)}
                    placeholder="Confidential Architect campaign hooks, encounter triggers, or design notes..."
                    className="w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
                    {formData.note || 'No notes recorded.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-SLICE B: CORTEX RELATIONAL SYNERGIES & DEPENDENCY GRAPH */}
          {activeSubStep?.viewSlice === 'relational' && (
            <div className="space-y-4">
              {renderRelationalGuidance && renderRelationalGuidance()}

              {reverseDeps.length > 0 && (
                <div className="p-4 bg-slate-950/80 border border-cyan-500/35 rounded-2xl space-y-2.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                      <Layers size={13} />
                      <span>Reverse Omnicortex Dependency Graph</span>
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      {reverseDeps.length} referencing record{reverseDeps.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reverseDeps.map((dep, idx) => (
                      <span
                        key={`${dep.collection}-${dep.id || idx}`}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10.5px] text-slate-200"
                      >
                        <strong className="text-cyan-400 uppercase">{dep.collection}:</strong> {dep.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-SLICE C: PLAYBOOK READINESS SCORECARD & BASTION SCHEMA AUDIT */}
          {activeSubStep?.viewSlice === 'audit' && (
            <div className="space-y-4 font-mono">
              {/* Step-by-Step Readiness Scorecard */}
              <div className="p-4 bg-slate-950/85 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Guided Creation Readiness Scorecard
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    {playbook?.title || matrix.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(playbook?.steps || []).map((st, idx) => {
                    const r = evaluateStepReadiness(st, formData, liveBuildCheck);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => onSelectStep && onSelectStep(idx)}
                        className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {st.stepNumber}. {st.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{r.summary}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            r.status === 'valid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : r.status === 'warning'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-950 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {r.status === 'valid' ? 'Ready' : r.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Build Cost & Canonical Formula Certificate */}
              {liveBuildCheck && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    liveBuildCheck.status === 'error' || liveBuildCheck.hasUnaccountedItems
                      ? 'bg-amber-950/35 border-amber-500/45'
                      : 'bg-emerald-950/30 border-emerald-500/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-white">
                      {liveBuildCheck.status === 'error' || liveBuildCheck.hasUnaccountedItems ? (
                        <AlertTriangle size={14} className="text-amber-400" />
                      ) : (
                        <CheckCircle size={14} className="text-emerald-400" />
                      )}
                      <span>BASTION Build & Valuation Check: {liveBuildCheck.statusLabel}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300">
                      {isSpeciesStudio && speciesSummary
                        ? `${speciesSummary.bpData?.totalBPUsed ?? 0} CP`
                        : liveBuildCheck.primaryCostLabel}
                    </span>
                  </div>
                  {liveBuildCheck.summary && (
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {liveBuildCheck.summary}
                    </p>
                  )}
                </div>
              )}

              {/* Collapsible Raw JSON Document Inspector */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between bg-slate-900/70">
                  <button
                    type="button"
                    onClick={() => setShowRawJson((prev) => !prev)}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-300 cursor-pointer"
                  >
                    <Code size={13} />
                    <span>Raw Omnicortex Document Payload</span>
                    {showRawJson ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(JSON.stringify(formData, null, 2))}
                    className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={11} />
                    <span>Copy JSON</span>
                  </button>
                </div>
                {showRawJson && (
                  <pre className="p-4 text-[11px] text-emerald-300/90 overflow-x-auto bg-black/50 border-t border-slate-800 max-h-80">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GuidedStageRenderer);
