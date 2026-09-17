import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dna, 
  Sparkles, 
  Check, 
  X, 
  Search, 
  Plus, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck,
  Zap,
  Edit3
} from 'lucide-react';
import { getOptionsForChoiceType } from '../../data/speciesTraitChoices';
import AudioService from '../../services/audioService';

/**
 * TraitChoiceModal
 * 
 * Interactive glass-cockpit selection modal that opens when a player selects
 * a species trait requiring specific parameters (e.g. Energy Types, Environments,
 * Skills, Features, Natural Weapons, Vocations).
 */
export const TraitChoiceModal = ({
  isOpen = false,
  trait = null,
  config = null,
  existingChoice = null,
  dbData = null,
  onConfirm = () => {},
  onClose = () => {}
}) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const maxSelections = config?.maxSelections || 1;

  // Initialize selected options when modal opens or trait changes
  useEffect(() => {
    if (isOpen) {
      if (existingChoice) {
        if (Array.isArray(existingChoice)) {
          setSelectedOptions(existingChoice);
        } else if (typeof existingChoice === 'string') {
          setSelectedOptions([existingChoice]);
        } else if (typeof existingChoice === 'object' && existingChoice.choice) {
          setSelectedOptions(Array.isArray(existingChoice.choice) ? existingChoice.choice : [existingChoice.choice]);
        }
      } else {
        setSelectedOptions([]);
      }
      setSearchQuery('');
      setCategoryFilter('all');
      setIsCustomMode(false);
      setCustomInput('');
    }
  }, [isOpen, existingChoice, trait]);

  // Load selectable options dynamically from Omnicortex
  const rawOptions = useMemo(() => {
    if (!config?.choiceType) return [];
    return getOptionsForChoiceType(config.choiceType, { dbData });
  }, [config?.choiceType, dbData]);

  // Extract unique categories from options
  const availableCategories = useMemo(() => {
    const cats = new Set();
    rawOptions.forEach(opt => {
      if (opt.category) cats.add(opt.category);
    });
    return Array.from(cats);
  }, [rawOptions]);

  // Filtered options based on search and category
  const filteredOptions = useMemo(() => {
    return rawOptions.filter(opt => {
      if (categoryFilter !== 'all' && opt.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = opt.name.toLowerCase().includes(q);
        const matchDesc = (opt.desc || '').toLowerCase().includes(q);
        const matchCat = (opt.category || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [rawOptions, categoryFilter, searchQuery]);

  // Toggle selection
  const handleToggleOption = (optName) => {
    if (maxSelections === 1) {
      setSelectedOptions([optName]);
    } else {
      if (selectedOptions.includes(optName)) {
        setSelectedOptions(selectedOptions.filter(o => o !== optName));
      } else {
        if (selectedOptions.length < maxSelections) {
          setSelectedOptions([...selectedOptions, optName]);
        } else {
          // Replace the oldest selection
          setSelectedOptions([...selectedOptions.slice(1), optName]);
        }
      }
    }
  };

  const handleConfirm = () => {
    const finalChoices = isCustomMode && customInput.trim()
      ? [customInput.trim()]
      : selectedOptions;

    if (finalChoices.length === 0) return;

    AudioService.playTerminalBeep(1200, 0.03);

    const choiceLabel = finalChoices.join(', ');
    const configuredTrait = {
      id: trait.id,
      name: `${trait.name} (${choiceLabel})`,
      base_name: trait.name,
      choice: maxSelections === 1 ? finalChoices[0] : finalChoices,
      choiceLabel,
      bp: trait.bp || 1,
      tier: trait.tier || 'basic',
      classification: trait.classification || 'Trait',
      description: trait.description,
      is_configured: true,
      custom_choice: isCustomMode
    };

    onConfirm(configuredTrait);
    onClose();
  };

  if (!isOpen || !trait || !config) return null;

  const isSelectionReady = isCustomMode 
    ? customInput.trim().length > 0 
    : (selectedOptions.length === maxSelections || (maxSelections > 1 && selectedOptions.length > 0));

  const badgeColor = config.badgeColor || '#a855f7';

  return (
    <div className="fixed inset-0 z-[350] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-mono">
      <div className="w-full max-w-2xl bg-[#080c16] border border-slate-700/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${badgeColor}20`,
                borderColor: `${badgeColor}60`,
                color: badgeColor
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {config.title || `Configure ${trait.name}`}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {trait.bp || 1} CP
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300">
                  {trait.tier || 'Basic'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-sans">
                BASTION Species Trait Parameterization
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Rule Prompt Box */}
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 shrink-0 space-y-2">
          <div className="flex items-start gap-2 text-xs text-slate-200">
            <Zap size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 font-mono font-bold mr-1">{trait.name}:</strong>
              {trait.description}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
            <span className="text-purple-200 font-bold">
              {config.prompt}
            </span>
            <span className="text-[11px] text-purple-400 font-mono font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              {maxSelections === 1 ? '1 Selection' : `${selectedOptions.length} / ${maxSelections} Selected`}
            </span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 sm:max-w-xs ml-auto">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search available choices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
          {filteredOptions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              No choices matching current search or category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredOptions.map(opt => {
                const isSelected = selectedOptions.includes(opt.name);
                return (
                  <button
                    key={opt.id || opt.name}
                    type="button"
                    onClick={() => {
                      if (isCustomMode) setIsCustomMode(false);
                      handleToggleOption(opt.name);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer select-none ${
                      isSelected && !isCustomMode
                        ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{opt.icon || '🔹'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-xs font-bold ${isSelected && !isCustomMode ? 'text-purple-200' : 'text-slate-200'}`}>
                          {opt.name}
                        </span>
                        {isSelected && !isCustomMode && (
                          <span className="w-4 h-4 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check size={11} className="stroke-[3]" />
                          </span>
                        )}
                      </div>
                      {opt.category && (
                        <span className="text-[9.5px] text-slate-500 font-mono uppercase block mt-0.5">
                          {opt.category}
                        </span>
                      )}
                      {opt.desc && (
                        <p className="text-[10.5px] text-slate-400 leading-snug font-sans mt-1 line-clamp-2">
                          {opt.desc}
                        </p>
                      )}
                      {opt.damageType && (
                        <div className="flex items-center gap-1.5 mt-1 text-[9.5px] font-mono text-purple-300">
                          <span>{opt.damageDice} {opt.damageType}</span>
                          <span>•</span>
                          <span>{opt.property}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Write-In Option Accordion */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Or enter a custom / homebrew choice</span>
            </button>
            {isCustomMode && (
              <div className="mt-2 p-3 bg-slate-950/90 border border-purple-500/40 rounded-xl space-y-2 animate-fade-in">
                <label className="text-[10px] text-purple-300 uppercase font-bold block">
                  Custom Choice Designation:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Plasma (Solar), Methane Ice Plains, Xenology..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                  {customInput && (
                    <button
                      type="button"
                      onClick={() => setCustomInput('')}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  *Custom choices are stored directly in your species biological record and tallied in character point accounting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Selected:</span>
            {isCustomMode ? (
              <span className="font-bold text-purple-300">Custom ({customInput || 'Pending...'})</span>
            ) : selectedOptions.length === 0 ? (
              <span className="text-slate-600 italic">None</span>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedOptions.map(opt => (
                  <span key={opt} className="px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                    {opt}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isSelectionReady}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                isSelectionReady
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Check size={14} />
              <span>Confirm & Equip Trait ({trait.bp || 1} CP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraitChoiceModal;
