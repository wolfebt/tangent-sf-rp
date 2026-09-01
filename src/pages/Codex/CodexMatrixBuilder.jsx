import React, { useState, useEffect } from 'react';
import { useDBM } from '../../context/DBMContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Save, 
  X, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Bot,
  Trash2,
  Calculator,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { CodexIngestionModal } from './CodexIngestionModal';
import { AudioService } from '../../services/audioService';
import { confirmTypedDeletion } from '../../utils/confirmationUtils';
import { useComputedState } from './hooks/useComputedState';
import {
  ComputedOutputPanel,
  UDUCapacityMeter,
  EquipmentCategoryConfigurator,
  WeaponModStacker,
  ArmorCoverageSelector,
  AugmentationNodeConfigurator,
  MechaChassisConfigurator,
  ArchitectureBlueprintConfigurator,
  SpeciesTraitSelector,
  ModularStatBlockConfigurator,
  CompanionPackageSelector,
  InvocationParameterConfigurator,
  MetaTechImbuementConfigurator,
  PlanetaryDesignConfigurator
} from './components';
import * as econEngine from '../../engines/tangentEconEngine';
import * as techEngine from '../../engines/tangentTechEngine';
import * as uduEngine from '../../engines/tangentUDUEngine';
import * as itemEngines from '../../engines/tangentItemEngines';
import * as complexEngines from '../../engines/tangentComplexEngines';
import * as entityEngines from '../../engines/tangentEntityEngines';
import * as planetaryEngine from '../../engines/tangentPlanetaryEngine';

const CUSTOM_COMPONENTS = {
  EquipmentCategoryConfigurator,
  WeaponModStacker,
  ArmorCoverageSelector,
  AugmentationNodeConfigurator,
  MechaChassisConfigurator,
  ArchitectureBlueprintConfigurator,
  SpeciesTraitSelector,
  ModularStatBlockConfigurator,
  CompanionPackageSelector,
  InvocationParameterConfigurator,
  MetaTechImbuementConfigurator,
  PlanetaryDesignConfigurator
};

export const CodexMatrixBuilder = ({
  matrix,
  initialData,
  onSaveComplete,
  onCancel,
  onOpenAiSynthesizer,
  onDelete
}) => {
  const { saveEntry, deleteEntry } = useDBM() || {};
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState(() => {
    return initialData ? { ...matrix.defaultValues, ...initialData } : { ...matrix.defaultValues, id: `codex_${matrix.id}_${Date.now()}` };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);

  // Reactive state derivation hook
  const { computedValues, isCalculating } = useComputedState(matrix, formData);

  // Synchronize when initialData or matrix changes
  useEffect(() => {
    if (initialData) {
      setFormData({ ...matrix.defaultValues, ...initialData });
    } else {
      setFormData({ ...matrix.defaultValues, id: `codex_${matrix.id}_${Date.now()}` });
    }
    setSaveSuccess(false);
    setErrorMessage('');
  }, [initialData, matrix]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    AudioService.playTerminalBeep(900, 0.03);
    setFormData({ ...matrix.defaultValues, id: `codex_${matrix.id}_${Date.now()}` });
    setErrorMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMessage('A valid designation or name is required.');
      AudioService.playErrorSound();
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      // Compute final derived values on save
      let derivedComputed = {};
      if (typeof matrix.computeOnSave === 'function') {
        derivedComputed = matrix.computeOnSave(formData, {
          econ: econEngine,
          tech: techEngine,
          udu: uduEngine,
          items: itemEngines,
          complex: complexEngines,
          entities: entityEngines,
          planetary: planetaryEngine
        });
      }

      const payload = {
        ...formData,
        matrix_type: matrix.id,
        category: matrix.name,
        _computed: {
          ...computedValues,
          ...derivedComputed
        },
        _computed_override: false,
        _lastComputedAt: new Date().toISOString(),
        author: currentUser?.displayName || currentUser?.email || 'Architect',
        authorUid: currentUser?.uid || 'local',
        updatedAt: new Date().toISOString()
      };

      const targetCol = matrix.targetCollection || 'compendium';
      const success = await saveEntry(payload, targetCol);

      if (success) {
        AudioService.playTerminalBeep(1400, 0.05);
        setSaveSuccess(true);
        setTimeout(() => {
          if (onSaveComplete) onSaveComplete(payload);
        }, 600);
      } else {
        setErrorMessage('Failed to commit to Omnicortex. Please check required fields.');
      }
    } catch (err) {
      setErrorMessage(`Commit error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const itemName = formData.name || formData.title || initialData?.name || initialData?.title || 'this entry';
    const confirmed = await confirmTypedDeletion(
      itemName,
      `delete the ${matrix.name} entry "${itemName}" from Omnicortex`
    );
    if (confirmed) {
      AudioService.playTerminalBeep(700, 0.04);
      const targetCol = matrix.targetCollection || 'compendium';
      const targetId = initialData?.id || formData?.id;
      if (deleteEntry && targetId) {
        await deleteEntry(targetId, targetCol);
      }
      if (onDelete && targetId) {
        await onDelete(initialData || formData);
      }
      if (onSaveComplete) onSaveComplete(null);
      if (onCancel) onCancel();
    }
  };

  const Icon = matrix.icon;

  return (
    <div className="bg-[#0e131f]/95 border border-slate-700/70 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5 text-slate-100 max-w-7xl mx-auto backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `${matrix.color}20`, border: `1px solid ${matrix.color}60`, color: matrix.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider" style={{ background: `${matrix.color}25`, color: matrix.color }}>
                {matrix.badge}
              </span>
              <span className="text-xs font-mono text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400 uppercase">OMNICORTEX: {matrix.targetCollection}</span>
            </div>
            <h2 className="text-xl font-bold font-mono tracking-wide text-white mt-0.5">
              {initialData ? `Edit ${matrix.name} Entry` : `Guided ${matrix.name} Builder`}
            </h2>
          </div>
        </div>

        {/* BASTION Ingestion Studio, Synthesizer & Close Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              setIsIngestionModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title={`Parse and ingest data for ${matrix.name} with BASTION Ingestion Studio`}
          >
            <Bot size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Ingestion Studio</span>
          </button>

          {onOpenAiSynthesizer && (
            <button
              type="button"
              onClick={onOpenAiSynthesizer}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer"
            >
              <Cpu size={14} />
              <span className="hidden sm:inline">BASTION Synthesizer</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Builder"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Error / Alert feedback */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle size={15} className="shrink-0 text-emerald-400" />
          <span>Successfully committed to Omnicortex database with computed metrics!</span>
        </div>
      )}

      {/* 2-Column Responsive Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Form Fields & Capacity Meters */}
        <form onSubmit={handleSave} className="flex-1 w-full space-y-5">
          {/* Capacity / Budget Meters if defined */}
          {Array.isArray(matrix.budgets) && matrix.budgets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-800/80">
              {matrix.budgets.map((budget) => {
                const maxVal = formData[budget.maxField] ?? 10;
                const usedVal = formData[budget.consumedByField] ?? 0;
                return (
                  <UDUCapacityMeter
                    key={budget.id}
                    label={budget.label}
                    used={usedVal}
                    max={maxVal}
                    tier={budget.tier}
                    color={budget.color || matrix.color}
                  />
                );
              })}
            </div>
          )}

          {/* Custom Interactive Forge Configurators (Phase 2 matrices) */}
          {matrix.customComponent && CUSTOM_COMPONENTS[matrix.customComponent] && (
            (() => {
              const CustomConfigurator = CUSTOM_COMPONENTS[matrix.customComponent];
              return (
                <div className="pb-1">
                  <CustomConfigurator
                    formData={formData}
                    onChange={handleChange}
                  />
                </div>
              );
            })()
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matrix.fields.map((field) => {
              const val = formData[field.name] ?? '';

              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      {field.label} {field.required && <span className="text-amber-400">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={val}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors resize-y shadow-inner"
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      {field.label} {field.required && <span className="text-amber-400">*</span>}
                    </label>
                    <select
                      value={val}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono transition-colors shadow-inner"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'boolean') {
                return (
                  <div key={field.name} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={!!val}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor={field.name} className="text-xs font-mono font-bold text-slate-300 uppercase cursor-pointer">
                      {field.label}
                    </label>
                  </div>
                );
              }

              if (field.type === 'number') {
                return (
                  <div key={field.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        {field.triggers && <Calculator size={12} className="text-amber-400" />}
                        <span>{field.label} {field.required && <span className="text-amber-400">*</span>}</span>
                      </label>
                      {field.min !== undefined && field.max !== undefined && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">[{val}]</span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={val}
                      onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
                      placeholder={field.placeholder || '0'}
                      className={`w-full p-2.5 bg-slate-950/80 border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono transition-colors shadow-inner ${
                        field.triggers ? 'border-amber-500/50 focus:border-amber-400' : 'border-slate-700/80 focus:border-cyan-400'
                      }`}
                    />
                    {field.helpText && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <HelpCircle size={10} className="text-slate-500 shrink-0" />
                        <span>{field.helpText}</span>
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {field.label} {field.required && <span className="text-amber-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors shadow-inner"
                  />
                </div>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset Form</span>
              </button>

              {initialData && initialData.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Delete Entry"
                >
                  <Trash2 size={13} />
                  <span>Delete Entry</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Committing to Omnicortex...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Commit to Omnicortex</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Computed Outputs Panel */}
        {Array.isArray(matrix.computedOutputs) && matrix.computedOutputs.length > 0 && (
          <ComputedOutputPanel
            computedOutputs={matrix.computedOutputs}
            computedValues={computedValues}
            formData={formData}
            matrix={matrix}
            isLoading={isCalculating}
          />
        )}
      </div>

      {/* Omnicortex Focused Ingestion Studio Modal */}
      <CodexIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        initialDatasetKey={matrix.ingestionKey || matrix.targetCollection || matrix.id}
        focusedMode={true}
        onApplyEntry={(appliedItem) => {
          setFormData(prev => ({
            ...prev,
            ...appliedItem,
            name: appliedItem.name || prev.name,
            description: appliedItem.description || appliedItem.body || prev.description,
            mechanic: appliedItem.mechanic || prev.mechanic,
            note: appliedItem.note || prev.note,
            tl: appliedItem.tech_level ?? appliedItem.tl ?? prev.tl,
            ml: appliedItem.meta_level ?? appliedItem.ml ?? prev.ml,
            craft_dc: appliedItem.craft_dc ?? appliedItem.design_dc ?? prev.craft_dc
          }));
          AudioService.playTerminalBeep(1400, 0.05);
        }}
      />
    </div>
  );
};

export default CodexMatrixBuilder;
