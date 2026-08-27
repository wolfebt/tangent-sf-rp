import React, { useState, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { Sparkles, AlertTriangle, Cpu, Plus, Edit3, Trash2 } from 'lucide-react';

export const FeaturesTab = ({ 
  onOpenSelectorModal, 
  onOpenAssetModal, 
  activeSection = 'all', 
  onOpenMetaphysicsModal 
}) => {
  const { characterData, updateField } = useFolio();

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

  // Hindrances list (replaces Disadvantages & Flaws, supports backwards compatibility)
  const hindrancesList = useMemo(() => {
    const rawList = characterData.hindrances && Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0
      ? characterData.hindrances
      : getItemList('disadvantages');

    return rawList.map((item, idx) => ({
      ...(typeof item === 'object' ? item : { name: item }),
      originalIndex: idx
    }));
  }, [characterData.hindrances, characterData.disadvantages]);

  // Group hindrances by type & sort alphabetically
  const groupedHindrances = useMemo(() => {
    const groups = {};
    hindrancesList.forEach((item) => {
      let typeStr = 'Hindrance';
      if (typeof item === 'object' && (item.type || item.category)) {
        typeStr = item.type || item.category;
      }
      const type = typeStr.trim() || 'Hindrance';
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
  }, [hindrancesList]);

  // Remove Feature Item
  const handleRemoveFeature = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Feature') : String(item);
    if (!confirmTypedDeletion(itemName, 'feature')) return;

    const listKey = item.sourceList || 'features';
    const currentList = getItemList(listKey);
    const updated = currentList.filter((_, i) => i !== item.sourceIndex);
    updateField(listKey, updated);
  };

  // Remove Hindrance Item
  const handleRemoveHindrance = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Hindrance') : String(item);
    if (!confirmTypedDeletion(itemName, 'hindrance')) return;

    const targetKey = Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0 ? 'hindrances' : 'disadvantages';
    const currentList = getItemList(targetKey);
    const updated = currentList.filter((_, i) => i !== item.originalIndex);
    updateField(targetKey, updated);
  };

  // Total Features CP calculation
  const totalFeaturesCP = useMemo(() => {
    return allFeatures.reduce((acc, feat) => {
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      return acc + (isNaN(cost) ? 3 : cost);
    }, 0);
  }, [allFeatures]);

  // Total Hindrances CP refund calculation
  const totalHindrancesRefund = useMemo(() => {
    return hindrancesList.reduce((acc, dis) => {
      const refund = typeof dis === 'object' && dis.cp !== undefined ? parseInt(dis.cp, 10) : 3;
      return acc + (isNaN(refund) ? 3 : refund);
    }, 0);
  }, [hindrancesList]);

  // Helper for group header badge color styling
  const getTypeBadgeStyle = (typeStr) => {
    const lower = typeStr.toLowerCase();
    if (lower.includes('awakened')) return 'bg-purple-950/80 text-purple-300 border-purple-800';
    if (lower.includes('aug')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    if (lower.includes('combat')) return 'bg-rose-950/80 text-rose-300 border-rose-800';
    if (lower.includes('hindrance') || lower.includes('disadvantage') || lower.includes('flaw')) return 'bg-red-950/80 text-red-300 border-red-800';
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  };

  const showFeaturesBlock = activeSection === 'all' || activeSection === 'features' || activeSection === 'augmentations';
  const showHindrancesBlock = activeSection === 'all' || activeSection === 'hindrances';

  return (
    <div className="tab-panel active p-4 space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* 1. FEATURES STACKED BLOCK */}
      {showFeaturesBlock && (
        <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-5 shadow-lg space-y-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Features &amp; Permanent Traits
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                General Perks, Awakened Metaphysical Disciplines, and Cybernetic/Biological Augmentations (1 to 3 CP).
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
              No features selected yet. Click below to browse features catalog or configure Metaphysics and Augmentations.
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
                                  className="text-slate-400 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Edit feature properties"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(item)}
                                className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors cursor-pointer"
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

          {/* Action Buttons Toolbar for Features & Metaphysics & Augmentations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('features', 'Features', 'features')}
              className="py-2 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(34,211,238,0.15)] cursor-pointer"
            >
              <span>✨</span>
              <span>+ Add Feature</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenMetaphysicsModal) {
                  onOpenMetaphysicsModal();
                } else {
                  onOpenSelectorModal('disciplines', 'Awakened Disciplines', 'disciplines');
                }
              }}
              className="py-2 px-3 bg-purple-950/80 hover:bg-purple-900/90 border border-purple-700/80 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(168,85,247,0.15)] cursor-pointer"
            >
              <span>🔮</span>
              <span>Metaphysics Codex</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenSelectorModal('augmentations', 'Augmentations', 'augmentations')}
              className="py-2 px-3 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/80 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.15)] cursor-pointer"
              title="Open Augmentations catalog with build option"
            >
              <span>🦾</span>
              <span>+ Add Augmentation</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. HINDRANCES STACKED BLOCK (Relabeled from Disadvantages & Flaws) */}
      {showHindrancesBlock && (
        <div id="hindrances-section" className="bg-slate-900/80 border border-red-900/40 rounded-xl p-5 shadow-lg space-y-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-red-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                Hindrances
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Character hindrances, biological flaws, physical handicaps, or debts that yield Creation Point (CP) refunds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold rounded">
                {hindrancesList.length} {hindrancesList.length === 1 ? 'Hindrance' : 'Hindrances'}
              </span>
              <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded">
                -{totalHindrancesRefund} CP Refund
              </span>
            </div>
          </div>

          {/* Hindrances Items List (Grouped by Type, Alpha order) */}
          {hindrancesList.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No hindrances selected. Taking hindrances grants bonus Creation Points (CP) to invest in attributes, skills, and features.
            </div>
          ) : (
            <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
              {groupedHindrances.map((group) => {
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
                                  onClick={() => onOpenAssetModal('disadvantages', 'Hindrance', 'edit', item.originalIndex, item)}
                                  className="text-slate-400 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Edit hindrance properties"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveHindrance(item)}
                                className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors cursor-pointer"
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

          {/* Action Button for Hindrances */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('disadvantages', 'Hindrances', 'disadvantages')}
              className="w-full sm:w-auto px-6 py-2 bg-red-950/80 hover:bg-red-900/90 border border-red-700/80 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(239,68,68,0.15)] cursor-pointer"
            >
              <span>⚠️</span>
              <span>+ Add Hindrance</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(FeaturesTab);
