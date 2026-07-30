import React, { useState, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';

const METAFOCUS_DISCIPLINES = [
  { name: 'Dimension', desc: 'Spatial distortion, teleportation, gravity fields, and portal manipulation.' },
  { name: 'Energy', desc: 'Thermal, electrical, kinetic, plasma, and radiant energy control.' },
  { name: 'Entropy', desc: 'Probability manipulation, decay, probability fields, and chaos resonance.' },
  { name: 'Illusion', desc: 'Sensory phantasms, holographic weaves, and mental trickery.' },
  { name: 'Matter', desc: 'Molecular alteration, density shifting, synthesis, and transmutation.' },
  { name: 'Mental', desc: 'Telepathy, psionic force, neural influence, and cognitive attunement.' }
];

const PRESET_AUGMENTATIONS = [
  { name: 'Ocular Cyber-Implants', cp: 1, desc: 'Enhanced spectrum vision and target tracking overlay (1 CP).' },
  { name: 'Audio Synthesizer Array', cp: 1, desc: 'Sub-audible frequency receiver and acoustic dampener (1 CP).' },
  { name: 'Subdermal Interface Jack', cp: 1, desc: 'Direct neural link port for machinery and networks (1 CP).' },
  { name: 'Subdermal Armor Weave', cp: 2, desc: 'Under-skin ballistic weave providing permanent kinetic resistance (2 CP).' },
  { name: 'Cybernetic Limb', cp: 2, desc: 'Reinforced artificial limb with integrated servo-motors (2 CP).' },
  { name: 'Bioware Gland Synthesizer', cp: 2, desc: 'Biological stim-injector for metabolic recovery (2 CP).' },
  { name: 'Neural Accelerator Unit', cp: 3, desc: 'Synaptic speed booster granting heightened reaction speed (3 CP).' },
  { name: 'Reflex Booster Array', cp: 3, desc: 'Full-body neuromuscular booster for twitch dodge capabilities (3 CP).' },
  { name: 'Dermal Plating Matrix', cp: 3, desc: 'Heavy subdermal composite plating for maximum physical protection (3 CP).' }
];

const AbilitiesTab = ({ onOpenSelectorModal }) => {
  const { characterData, updateField } = useFolio();

  // Active Modals
  const [activeModal, setActiveModal] = useState(null); // 'awakened' | 'augmentation' | 'custom_feature' | 'custom_disadvantage' | null
  
  // Custom Feature Form State
  const [featureName, setFeatureName] = useState('');
  const [featureCp, setFeatureCp] = useState(3);
  const [featureType, setFeatureType] = useState('Feature');
  const [featureDesc, setFeatureDesc] = useState('');

  // Custom Disadvantage Form State
  const [disName, setDisName] = useState('');
  const [disCp, setDisCp] = useState(3);
  const [disDesc, setDisDesc] = useState('');

  // Augmentation Builder State
  const [augPreset, setAugPreset] = useState('');
  const [augName, setAugName] = useState('');
  const [augCp, setAugCp] = useState(1);
  const [augDesc, setAugDesc] = useState('');

  // Awakened Selector State
  const [selectedDiscipline, setSelectedDiscipline] = useState(METAFOCUS_DISCIPLINES[0].name);

  // Helper to extract items array
  const getItemList = (key) => {
    const data = characterData[key];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [data];
      }
    }
    return [];
  };

  // Combine features list including legacy characterData.augmentations & characterData.awakened for data retention
  const allFeatures = useMemo(() => {
    const mainFeatures = getItemList('features');
    const legacyAugs = getItemList('augmentations').map(a => 
      typeof a === 'object' ? { ...a, type: 'Augmentation', cp: a.cp || 2 } : { name: a, type: 'Augmentation', cp: 2 }
    );
    const legacyAwakened = getItemList('awakened').map(w => 
      typeof w === 'object' ? { ...w, type: 'Awakened', cp: w.cp || 3 } : { name: typeof w === 'string' && !w.startsWith('Awakened') ? `Awakened: ${w}` : w, type: 'Awakened', cp: 3 }
    );
    return [...mainFeatures, ...legacyAugs, ...legacyAwakened];
  }, [characterData.features, characterData.augmentations, characterData.awakened]);

  const disadvantagesList = useMemo(() => {
    return getItemList('disadvantages');
  }, [characterData.disadvantages]);

  // Remove Feature Item
  const handleRemoveFeature = (index) => {
    const targetItem = allFeatures[index];
    const itemName = typeof targetItem === 'object' ? (targetItem.name || targetItem.title || 'Feature') : String(targetItem);
    if (!window.confirm(`Are you sure you want to remove feature "${itemName}"?`)) return;

    const mainFeatures = getItemList('features');
    if (index < mainFeatures.length) {
      const updated = mainFeatures.filter((_, i) => i !== index);
      updateField('features', updated);
    } else {
      // If legacy item
      const adjustedIndex = index - mainFeatures.length;
      const legacyAugs = getItemList('augmentations');
      if (adjustedIndex < legacyAugs.length) {
        const updated = legacyAugs.filter((_, i) => i !== adjustedIndex);
        updateField('augmentations', updated);
      } else {
        const awakenedIndex = adjustedIndex - legacyAugs.length;
        const legacyAwakened = getItemList('awakened');
        const updated = legacyAwakened.filter((_, i) => i !== awakenedIndex);
        updateField('awakened', updated);
      }
    }
  };

  // Remove Disadvantage Item
  const handleRemoveDisadvantage = (index) => {
    const targetItem = disadvantagesList[index];
    const itemName = typeof targetItem === 'object' ? (targetItem.name || targetItem.title || 'Disadvantage') : String(targetItem);
    if (!window.confirm(`Are you sure you want to remove flaw "${itemName}"?`)) return;

    const list = getItemList('disadvantages');
    const updated = list.filter((_, i) => i !== index);
    updateField('disadvantages', updated);
  };

  // Add Item to Features
  const addFeatureItem = (itemObj) => {
    const current = getItemList('features');
    updateField('features', [...current, itemObj]);
  };

  // Add Item to Disadvantages
  const addDisadvantageItem = (itemObj) => {
    const current = getItemList('disadvantages');
    updateField('disadvantages', [...current, itemObj]);
  };

  // Submit Awakened Discipline
  const handleAddAwakened = (e) => {
    e.preventDefault();
    const disc = METAFOCUS_DISCIPLINES.find(d => d.name === selectedDiscipline) || METAFOCUS_DISCIPLINES[0];
    const item = {
      id: `awakened_${Date.now()}`,
      name: `Awakened: ${disc.name}`,
      cp: 3,
      type: 'Awakened',
      category: 'Awakened Discipline',
      description: disc.desc
    };
    addFeatureItem(item);
    setActiveModal(null);
  };

  // Submit Augmentation
  const handleAddAugmentation = (e) => {
    e.preventDefault();
    const nameToUse = augName.trim() || (augPreset ? augPreset : 'Cybernetic Augmentation');
    const item = {
      id: `aug_${Date.now()}`,
      name: nameToUse,
      cp: Math.min(3, Math.max(1, parseInt(augCp, 10) || 1)),
      type: 'Augmentation',
      category: 'Augmentation',
      description: augDesc.trim()
    };
    addFeatureItem(item);
    setAugPreset('');
    setAugName('');
    setAugCp(1);
    setAugDesc('');
    setActiveModal(null);
  };

  // Submit Custom Feature
  const handleAddCustomFeature = (e) => {
    e.preventDefault();
    if (!featureName.trim()) return;
    const item = {
      id: `feat_${Date.now()}`,
      name: featureName.trim(),
      cp: parseInt(featureCp, 10) || 3,
      type: featureType || 'Feature',
      category: featureType || 'Feature',
      description: featureDesc.trim()
    };
    addFeatureItem(item);
    setFeatureName('');
    setFeatureCp(3);
    setFeatureType('Feature');
    setFeatureDesc('');
    setActiveModal(null);
  };

  // Submit Custom Disadvantage
  const handleAddCustomDisadvantage = (e) => {
    e.preventDefault();
    if (!disName.trim()) return;
    const item = {
      id: `dis_${Date.now()}`,
      name: disName.trim(),
      cp: parseInt(disCp, 10) || 3,
      category: 'Disadvantage',
      description: disDesc.trim()
    };
    addDisadvantageItem(item);
    setDisName('');
    setDisCp(3);
    setDisDesc('');
    setActiveModal(null);
  };

  // Total Features CP calculation
  const totalFeaturesCP = useMemo(() => {
    return allFeatures.reduce((acc, feat) => {
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      return acc + (isNaN(cost) ? 3 : cost);
    }, 0);
  }, [allFeatures]);

  // Total Disadvantages CP refund calculation
  const totalDisadvantagesRefund = useMemo(() => {
    return disadvantagesList.reduce((acc, dis) => {
      const refund = typeof dis === 'object' && dis.cp !== undefined ? parseInt(dis.cp, 10) : 3;
      return acc + (isNaN(refund) ? 3 : refund);
    }, 0);
  }, [disadvantagesList]);

  return (
    <div className="tab-panel active p-4 space-y-6 max-w-5xl mx-auto">
      
      {/* 1. FEATURES STACKED BLOCK */}
      <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-5 shadow-lg space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-950 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Features & Permanent Trait Augmentations
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Includes General Perks, Awakened Discipline Traits, and Cybernetic/Biological Augmentations (1 to 3 CP).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold rounded">
              {allFeatures.length} {allFeatures.length === 1 ? 'Feature' : 'Features'}
            </span>
            <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
              {totalFeaturesCP} CP Total
            </span>
          </div>
        </div>

        {/* Feature Items List */}
        {allFeatures.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
            No features selected yet. Click below to add Awakened Metafocus disciplines, Augmentations, or Perks.
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {allFeatures.map((item, index) => {
              const name = typeof item === 'object' ? (item.name || item.title) : item;
              const cpCost = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
              const type = typeof item === 'object' ? (item.type || item.category || (name.startsWith('Awakened') ? 'Awakened' : 'Feature')) : 'Feature';
              const desc = typeof item === 'object' ? item.description : '';

              let badgeStyle = 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
              if (type === 'Awakened' || name.startsWith('Awakened')) {
                badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-800';
              } else if (type === 'Augmentation') {
                badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-800';
              }

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 transition-colors gap-2"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${badgeStyle}`}>
                        {type}
                      </span>
                      <span className="font-semibold text-slate-100">{name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 rounded">
                        {cpCost} CP
                      </span>
                    </div>
                    {desc && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {desc}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="self-end sm:self-center text-slate-500 hover:text-red-400 text-base font-bold leading-none px-2 py-1 transition-colors rounded hover:bg-slate-900"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons Toolbar for Features */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenSelectorModal('features', 'Features', 'features')}
            className="py-2 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🔍</span> Browse Database
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('awakened')}
            className="py-2 px-3 bg-purple-950/80 hover:bg-purple-900/90 border border-purple-700/80 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>✨</span> Awakened Discipline
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('augmentation')}
            className="py-2 px-3 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/80 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🦾</span> Augmentation (1-3 CP)
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('custom_feature')}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>+</span> Custom Feature
          </button>
        </div>
      </div>


      {/* 2. DISADVANTAGES STACKED BLOCK */}
      <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-5 shadow-lg space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-red-950 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              Disadvantages & Flaws
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Character flaws, physical limitations, or debts that yield Creation Point (CP) refunds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold rounded">
              {disadvantagesList.length} {disadvantagesList.length === 1 ? 'Disadvantage' : 'Disadvantages'}
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded">
              -{totalDisadvantagesRefund} CP Refund
            </span>
          </div>
        </div>

        {/* Disadvantage Items List */}
        {disadvantagesList.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
            No disadvantages selected. Adding disadvantages grants extra CP for features & attributes.
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {disadvantagesList.map((item, index) => {
              const name = typeof item === 'object' ? (item.name || item.title) : item;
              const refundCp = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
              const desc = typeof item === 'object' ? item.description : '';

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 transition-colors gap-2"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-950/80 text-red-300 border-red-800">
                        Disadvantage
                      </span>
                      <span className="font-semibold text-slate-100">{name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-700/80 px-1.5 py-0.5 rounded">
                        -{refundCp} CP Refund
                      </span>
                    </div>
                    {desc && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {desc}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDisadvantage(index)}
                    className="self-end sm:self-center text-slate-500 hover:text-red-400 text-base font-bold leading-none px-2 py-1 transition-colors rounded hover:bg-slate-900"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons Toolbar for Disadvantages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenSelectorModal('disadvantages', 'Disadvantages', 'disadvantages')}
            className="py-2 px-3 bg-red-950/80 hover:bg-red-900/90 border border-red-700/80 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🔍</span> Browse Disadvantages Database
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('custom_disadvantage')}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>+</span> Custom Disadvantage
          </button>
        </div>
      </div>


      {/* INLINE MODALS FOR QUICK ACTIONS */}

      {/* 1. Awakened Discipline Modal */}
      {activeModal === 'awakened' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-purple-500/60 rounded-xl max-w-md w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="flex justify-between items-center border-b border-purple-900/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                ✨ Add Awakened Metafocus Discipline
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddAwakened} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                  Select Metafocus Discipline (3 CP)
                </label>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-800 rounded px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-400 font-semibold"
                >
                  {METAFOCUS_DISCIPLINES.map(d => (
                    <option key={d.name} value={d.name}>
                      Awakened: {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Preview */}
              {(() => {
                const current = METAFOCUS_DISCIPLINES.find(d => d.name === selectedDiscipline);
                return (
                  <div className="bg-slate-950/80 border border-purple-900/40 p-3 rounded text-xs text-purple-200 leading-relaxed">
                    <span className="font-bold text-purple-300 block mb-1">Discipline Domain Effect:</span>
                    {current ? current.desc : ''}
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-900 hover:bg-purple-800 border border-purple-600 text-purple-200 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Add Awakened Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 2. Augmentation Feature Builder Modal */}
      {activeModal === 'augmentation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-amber-500/60 rounded-xl max-w-lg w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="flex justify-between items-center border-b border-amber-900/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                🦾 Add Augmentation Feature (1 to 3 CP)
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddAugmentation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-amber-300 mb-1">
                  Preset Augmentations (Optional)
                </label>
                <select
                  value={augPreset}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setAugPreset(selectedName);
                    const preset = PRESET_AUGMENTATIONS.find(p => p.name === selectedName);
                    if (preset) {
                      setAugName(preset.name);
                      setAugCp(preset.cp);
                      setAugDesc(preset.desc);
                    }
                  }}
                  className="w-full bg-slate-950 border border-amber-800 rounded px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose preset or type custom below --</option>
                  {PRESET_AUGMENTATIONS.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.cp} CP)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold uppercase text-slate-300 mb-1">
                    Augmentation Name
                  </label>
                  <input
                    type="text"
                    required
                    value={augName}
                    onChange={(e) => setAugName(e.target.value)}
                    placeholder="e.g. Subdermal Armor Weave"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-amber-300 mb-1">
                    CP Cost (1-3)
                  </label>
                  <select
                    value={augCp}
                    onChange={(e) => setAugCp(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-amber-700 rounded px-3 py-2 text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                  >
                    <option value={1}>1 CP (Minor)</option>
                    <option value={2}>2 CP (Moderate)</option>
                    <option value={3}>3 CP (Major)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">
                  Description / Effect
                </label>
                <textarea
                  rows={3}
                  value={augDesc}
                  onChange={(e) => setAugDesc(e.target.value)}
                  placeholder="Describe permanent cybernetic or biological enhancement..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 border border-amber-600 text-amber-200 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Add Augmentation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 3. Custom Feature Modal */}
      {activeModal === 'custom_feature' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-cyan-500/60 rounded-xl max-w-lg w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                + Add Custom Feature / Perk
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddCustomFeature} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold uppercase text-slate-300 mb-1">Feature Name</label>
                  <input
                    type="text"
                    required
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder="e.g. Iron Will"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-cyan-300 mb-1">CP Cost</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={featureCp}
                    onChange={(e) => setFeatureCp(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-700 rounded px-3 py-2 text-cyan-300 font-mono font-bold outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Category / Type Tag</label>
                <select
                  value={featureType}
                  onChange={(e) => setFeatureType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                >
                  <option value="Feature">General Feature / Perk</option>
                  <option value="Combat">Combat Perk</option>
                  <option value="Awakened">Awakened Trait</option>
                  <option value="Augmentation">Augmentation</option>
                  <option value="Exotic">Exotic Ability</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Description / Effect</label>
                <textarea
                  rows={3}
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  placeholder="Describe feature benefits and mechanics..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-900 hover:bg-cyan-800 border border-cyan-600 text-cyan-200 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 4. Custom Disadvantage Modal */}
      {activeModal === 'custom_disadvantage' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-red-500/60 rounded-xl max-w-lg w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex justify-between items-center border-b border-red-900/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                + Add Custom Disadvantage
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddCustomDisadvantage} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold uppercase text-slate-300 mb-1">Disadvantage Name</label>
                  <input
                    type="text"
                    required
                    value={disName}
                    onChange={(e) => setDisName(e.target.value)}
                    placeholder="e.g. Cybernetic Rejection"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-emerald-400 mb-1">CP Refund</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={disCp}
                    onChange={(e) => setDisCp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Description / Flaw Details</label>
                <textarea
                  rows={3}
                  value={disDesc}
                  onChange={(e) => setDisDesc(e.target.value)}
                  placeholder="Describe penalty, behavioral flaw, or debt..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 outline-none focus:border-red-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-900 hover:bg-red-800 border border-red-600 text-red-200 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Save Disadvantage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(AbilitiesTab);
