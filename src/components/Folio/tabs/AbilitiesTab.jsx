import React, { useState, useMemo, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

// Core system disciplines — always present regardless of database state.
// These are inherent to the Awakening mechanic and unlock the base meta-skills.
const CORE_DISCIPLINES = [
  { name: 'Dimension', desc: 'Spatial distortion, teleportation, gravity fields, and portal manipulation.', isCore: true },
  { name: 'Energy', desc: 'Thermal, electrical, kinetic, plasma, and radiant energy control.', isCore: true },
  { name: 'Entropy', desc: 'Probability manipulation, decay, probability fields, and chaos resonance.', isCore: true },
  { name: 'Illusion', desc: 'Sensory phantasms, holographic weaves, and mental trickery.', isCore: true },
  { name: 'Matter', desc: 'Molecular alteration, density shifting, synthesis, and transmutation.', isCore: true },
  { name: 'Mental', desc: 'Telepathy, psionic force, neural influence, and cognitive attunement.', isCore: true }
];

const AbilitiesTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField } = useFolio();

  // Active Modals ('awakened' | 'augmentation' | null)
  const [activeModal, setActiveModal] = useState(null);



  // Disciplines — merged core + any extras from Firestore
  const [dbDisciplines, setDbDisciplines] = useState([]);
  const [disciplinesLoading, setDisciplinesLoading] = useState(false);

  // Merge core with DB: core always first, DB adds extras not already in core (by name, case-insensitive)
  const allDisciplines = useMemo(() => {
    const coreNames = new Set(CORE_DISCIPLINES.map(d => d.name.toLowerCase()));
    const extras = dbDisciplines.filter(d => !coreNames.has((d.name || '').toLowerCase()));
    return [
      ...CORE_DISCIPLINES,
      ...extras.map(d => ({ name: d.name, desc: d.description || '', isCore: false }))
    ];
  }, [dbDisciplines]);

  // Awakened Selector State — defaults to first core discipline
  const [selectedDiscipline, setSelectedDiscipline] = useState(CORE_DISCIPLINES[0].name);

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

  // Combine features list including legacy characterData.augmentations & characterData.awakened with source tracking
  const allFeatures = useMemo(() => {
    const mainFeatures = getItemList('features').map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      sourceList: 'features',
      sourceIndex: idx
    }));
    const legacyAugs = getItemList('augmentations').map((a, idx) => ({
      ...(typeof a === 'object' ? { ...a, type: a.type || 'Augmentation', cp: a.cp || 2 } : { name: a, type: 'Augmentation', cp: 2 }),
      sourceList: 'augmentations',
      sourceIndex: idx
    }));
    const legacyAwakened = getItemList('awakened').map((w, idx) => ({
      ...(typeof w === 'object' ? { ...w, type: w.type || 'Awakened', cp: w.cp || 3 } : { name: typeof w === 'string' && !w.startsWith('Awakened') ? `Awakened: ${w}` : w, type: 'Awakened', cp: 3 }),
      sourceList: 'awakened',
      sourceIndex: idx
    }));
    return [...mainFeatures, ...legacyAugs, ...legacyAwakened];
  }, [characterData.features, characterData.augmentations, characterData.awakened]);

  // Group features by type & sort alphabetically within group and group names
  const groupedFeatures = useMemo(() => {
    const groups = {};
    allFeatures.forEach((item) => {
      let typeStr = 'General Feature';
      if (typeof item === 'object') {
        if (item.type || item.category) {
          typeStr = item.type || item.category;
        } else if (item.name && item.name.startsWith('Awakened')) {
          typeStr = 'Awakened';
        }
      }
      const type = typeStr.trim() || 'General Feature';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => {
        const nameA = typeof a === 'object' ? (a.name || a.title || '') : String(a);
        const nameB = typeof b === 'object' ? (b.name || b.title || '') : String(b);
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      });
    });

    const sortedTypes = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return sortedTypes.map((type) => ({
      type,
      items: groups[type]
    }));
  }, [allFeatures]);

  // Disadvantages list with original index tracking
  const disadvantagesList = useMemo(() => {
    return getItemList('disadvantages').map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      originalIndex: idx
    }));
  }, [characterData.disadvantages]);

  // Group disadvantages by type & sort alphabetically
  const groupedDisadvantages = useMemo(() => {
    const groups = {};
    disadvantagesList.forEach((item) => {
      let typeStr = 'Disadvantage';
      if (typeof item === 'object' && (item.type || item.category)) {
        typeStr = item.type || item.category;
      }
      const type = typeStr.trim() || 'Disadvantage';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => {
        const nameA = typeof a === 'object' ? (a.name || a.title || '') : String(a);
        const nameB = typeof b === 'object' ? (b.name || b.title || '') : String(b);
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      });
    });

    const sortedTypes = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    return sortedTypes.map((type) => ({
      type,
      items: groups[type]
    }));
  }, [disadvantagesList]);

  // Remove Feature Item
  const handleRemoveFeature = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Feature') : String(item);
    if (!confirmTypedDeletion(itemName, 'feature')) return;

    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const updated = currentList.filter((_, i) => i !== item.sourceIndex);
    updateField(listKey, updated);
  };

  // Remove Disadvantage Item
  const handleRemoveDisadvantage = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Disadvantage') : String(item);
    if (!confirmTypedDeletion(itemName, 'flaw')) return;

    const currentList = getItemList('disadvantages');
    const updated = currentList.filter((_, i) => i !== item.originalIndex);
    updateField('disadvantages', updated);
  };

  // Add Item to Features
  const addFeatureItem = (itemObj) => {
    const current = getItemList('features');
    updateField('features', [...current, itemObj]);
  };

  // Fetch additional disciplines from Firestore when Awakened modal opens
  useEffect(() => {
    if (activeModal !== 'awakened') return;
    let isMounted = true;
    setDisciplinesLoading(true);
    const unsub = onSnapshot(collection(db, 'disciplines'), (snap) => {
      if (isMounted) {
        setDbDisciplines(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setDisciplinesLoading(false);
      }
    }, (err) => {
      console.warn('Failed to load disciplines from DB:', err);
      if (isMounted) setDisciplinesLoading(false);
    });
    return () => { isMounted = false; unsub(); };
  }, [activeModal]);

  // Submit Awakened Discipline
  const handleAddAwakened = (e) => {
    e.preventDefault();
    const disc = allDisciplines.find(d => d.name === selectedDiscipline) || allDisciplines[0];
    if (!disc) return;
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

  // Helper for group header badge color styling
  const getTypeBadgeStyle = (typeStr) => {
    const lower = typeStr.toLowerCase();
    if (lower.includes('awakened')) return 'bg-purple-950/80 text-purple-300 border-purple-800';
    if (lower.includes('aug')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    if (lower.includes('combat')) return 'bg-rose-950/80 text-rose-300 border-rose-800';
    if (lower.includes('disadvantage') || lower.includes('flaw')) return 'bg-red-950/80 text-red-300 border-red-800';
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  };

  return (
    <div className="tab-panel active p-4 space-y-6 max-w-5xl mx-auto">
      
      {/* 1. FEATURES STACKED BLOCK */}
      <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-5 shadow-lg space-y-5">
        
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

        {/* Feature Items List (Grouped by Type, Alpha order) */}
        {allFeatures.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
            No features selected yet. Click below to browse database or add Awakened / Augmentation features.
          </div>
        ) : (
          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
            {groupedFeatures.map((group) => {
              const groupCPTotal = group.items.reduce((sum, item) => {
                const cost = typeof item === 'object' && item.cp !== undefined ? parseInt(item.cp, 10) : 3;
                return sum + (isNaN(cost) ? 3 : cost);
              }, 0);

              return (
                <div key={group.type} className="space-y-2">
                  {/* Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getTypeBadgeStyle(group.type)}`}>
                        {group.type}
                      </span>
                      <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                        {group.type}s
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'} &bull; {groupCPTotal} CP
                    </span>
                  </div>

                  {/* Compact Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {group.items.map((item) => {
                      const name = typeof item === 'object' ? (item.name || item.title) : item;
                      const cpCost = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                      const desc = typeof item === 'object' ? item.description : '';

                      return (
                        <div
                          key={`${item.sourceList}_${item.sourceIndex}`}
                          className="bg-slate-950/80 border border-slate-800 hover:border-cyan-800/70 rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <h4 className="font-semibold text-xs text-slate-100 leading-snug pr-1">
                                {name}
                              </h4>
                              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 rounded">
                                {cpCost} CP
                              </span>
                            </div>
                            {desc && (
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-2">
                                {desc}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1 pt-1.5 mt-auto border-t border-slate-900">
                            {onOpenAssetModal && (
                              <button
                                type="button"
                                onClick={() => onOpenAssetModal(item.sourceList, 'Feature', 'edit', item.sourceIndex, item)}
                                className="text-slate-400 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors"
                                title="Edit feature properties"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(item)}
                              className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors"
                              title="Remove item"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons Toolbar for Features (Custom button removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
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
            <span>✨</span> Awakened
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('augmentation')}
            className="py-2 px-3 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/80 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🦾</span> Augmentation
          </button>
        </div>
      </div>


      {/* 2. DISADVANTAGES STACKED BLOCK */}
      <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-5 shadow-lg space-y-5">
        
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

        {/* Disadvantage Items List (Grouped by Type, Alpha order) */}
        {disadvantagesList.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
            No disadvantages selected. Adding disadvantages grants extra CP for features & attributes.
          </div>
        ) : (
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
            {groupedDisadvantages.map((group) => {
              const groupRefundTotal = group.items.reduce((sum, item) => {
                const refund = typeof item === 'object' && item.cp !== undefined ? parseInt(item.cp, 10) : 3;
                return sum + (isNaN(refund) ? 3 : refund);
              }, 0);

              return (
                <div key={group.type} className="space-y-2">
                  {/* Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-950/80 text-red-300 border-red-800">
                        {group.type}
                      </span>
                      <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                        {group.type}s
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'} &bull; -{groupRefundTotal} CP Refund
                    </span>
                  </div>

                  {/* Compact Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {group.items.map((item) => {
                      const name = typeof item === 'object' ? (item.name || item.title) : item;
                      const refundCp = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                      const desc = typeof item === 'object' ? item.description : '';

                      return (
                        <div
                          key={item.originalIndex}
                          className="bg-slate-950/80 border border-slate-800 hover:border-red-800/70 rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <h4 className="font-semibold text-xs text-slate-100 leading-snug pr-1">
                                {name}
                              </h4>
                              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-700/80 rounded">
                                -{refundCp} CP
                              </span>
                            </div>
                            {desc && (
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-2">
                                {desc}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-1 pt-1.5 mt-auto border-t border-slate-900">
                            {onOpenAssetModal && (
                              <button
                                type="button"
                                onClick={() => onOpenAssetModal('disadvantages', 'Disadvantage', 'edit', item.originalIndex, item)}
                                className="text-slate-400 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors"
                                title="Edit disadvantage properties"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveDisadvantage(item)}
                              className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors"
                              title="Remove item"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons Toolbar for Disadvantages (Custom Flaw button removed) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => onOpenSelectorModal('disadvantages', 'Disadvantages', 'disadvantages')}
            className="w-full sm:w-auto px-6 py-2 bg-red-950/80 hover:bg-red-900/90 border border-red-700/80 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>🔍</span> Browse Disadvantages Database
          </button>
        </div>
      </div>


      {/* INLINE MODALS FOR QUICK ACTIONS */}

      {/* 1. Awakened Discipline Modal */}
      {activeModal === 'awakened' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-purple-500/60 rounded-xl max-w-md w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="flex justify-between items-center border-b border-purple-900/60 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  ✨ Add Awakened Metafocus Discipline
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Core disciplines + {allDisciplines.length - CORE_DISCIPLINES.length} campaign extras from database.
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddAwakened} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
                  Select Metafocus Discipline (3 CP)
                  {disciplinesLoading && <span className="ml-2 text-purple-400/60 font-normal normal-case animate-pulse">Loading DB...</span>}
                </label>
                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-800 rounded px-3 py-2 text-xs text-slate-100 outline-none focus:border-purple-400 font-semibold"
                >
                  {/* Core disciplines group */}
                  <optgroup label="─── Core System Disciplines ───">
                    {CORE_DISCIPLINES.map(d => (
                      <option key={d.name} value={d.name}>
                        Awakened: {d.name}
                      </option>
                    ))}
                  </optgroup>
                  {/* Extra DB disciplines, only shown if any exist */}
                  {allDisciplines.filter(d => !d.isCore).length > 0 && (
                    <optgroup label="─── Campaign Disciplines ───">
                      {allDisciplines.filter(d => !d.isCore).map(d => (
                        <option key={d.name} value={d.name}>
                          Awakened: {d.name} [DB]
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Description Preview */}
              {(() => {
                const current = allDisciplines.find(d => d.name === selectedDiscipline);
                return current ? (
                  <div className="bg-slate-950/80 border border-purple-900/40 p-3 rounded text-xs text-purple-200 leading-relaxed">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-300">Discipline Domain Effect:</span>
                      {!current.isCore && (
                        <span className="px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-[10px] rounded font-mono uppercase tracking-wider">Campaign DB</span>
                      )}
                    </div>
                    {current.desc || <span className="italic text-slate-500">No description in database.</span>}
                  </div>
                ) : null;
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
                  disabled={allDisciplines.length === 0}
                  className="px-4 py-1.5 bg-purple-900 hover:bg-purple-800 border border-purple-600 text-purple-200 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Awakened Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 2. Augmentation Feature Modal */}
      {activeModal === 'augmentation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#121824] border border-amber-500/60 rounded-xl max-w-md w-full p-5 text-slate-100 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] my-8">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-amber-900/60 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>🦾</span> Add Augmentation Feature
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  OmniCortex Augmentation Database
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content & Action Buttons */}
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Select an option to add cybernetic or biological augmentations to your persona:
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {onOpenSelectorModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onOpenSelectorModal('augmentations', 'Augmentations Database', 'augmentations');
                    }}
                    className="p-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-lg text-left transition-all group flex items-start gap-3.5 shadow-sm cursor-pointer"
                  >
                    <span className="text-2xl p-2 bg-slate-900 group-hover:bg-cyan-950 border border-slate-700 group-hover:border-cyan-600/60 rounded-lg shrink-0 transition-colors">
                      🔍
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300 mb-0.5">
                        Browse Augmentations DB
                      </h4>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug">
                        Search and select preset cybernetic & biological augmentations from the OmniCortex database.
                      </p>
                    </div>
                  </button>
                )}

                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onOpenAssetModal('augmentations', 'Augmentation', 'create', null, { category: 'augmentations' });
                    }}
                    className="p-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-lg text-left transition-all group flex items-start gap-3.5 shadow-sm cursor-pointer"
                  >
                    <span className="text-2xl p-2 bg-slate-900 group-hover:bg-amber-950 border border-slate-700 group-hover:border-amber-600/60 rounded-lg shrink-0 transition-colors">
                      ⚙️
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 mb-0.5">
                        Build Augmentation Entry
                      </h4>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug">
                        Build and save a new custom augmentation entry with CP cost and effects in the OmniCortex DB.
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(AbilitiesTab);
