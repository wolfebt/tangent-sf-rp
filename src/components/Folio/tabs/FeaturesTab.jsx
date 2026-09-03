import React, { useState, useMemo, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { Sparkles, AlertTriangle, Cpu, Zap, Plus, Edit3, Trash2, Check, Lock, BookOpen, Dices } from 'lucide-react';
import { METAPHYSICAL_DISCIPLINES } from '../../../data/skillsData';
import FolioTooltip from '../shared/FolioTooltip';

export const FeaturesTab = ({ 
  onOpenSelectorModal, 
  onOpenAssetModal, 
  activeSection = 'all', 
  onOpenMetaphysicsModal 
}) => {
  const { characterData, updateField, handleAddItem, handleUpdateItem, handleDeleteItem } = useFolio();
  const { openDiceRoller } = useDice();
  const [selectedSubTab, setSelectedSubTab] = useState(activeSection || 'all');

  // Synchronize internal subtab state when parent activeSection changes
  useEffect(() => {
    if (activeSection) {
      setSelectedSubTab(activeSection);
    }
  }, [activeSection]);

  // Helper to extract items array safely
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

  // Helper to check if an item is an Awakened discipline feature
  const isAwakenedItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    const id = (typeof item === 'object' ? (item.id || '') : '').toLowerCase();
    return (
      type.includes('awakened') ||
      type.includes('discipline') ||
      name.startsWith('awakened') ||
      name.includes('awakened:') ||
      id.startsWith('awakened') ||
      ['dimension', 'energy', 'entropy', 'illusion', 'matter', 'mental'].some(d => name === `awakened: ${d}` || name === `awakened ${d}`)
    );
  };

  // Helper to check if an item is an Augmentation feature
  const isAugmentationItem = (item) => {
    if (!item) return false;
    const name = (typeof item === 'object' ? (item.name || item.title || '') : String(item)).toLowerCase();
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('aug') || type.includes('cyber') || type.includes('bio-mod') || name.startsWith('aug:');
  };

  // Helper to check if an item is a Hindrance / Disadvantage
  const isHindranceItem = (item) => {
    if (!item) return false;
    const type = (typeof item === 'object' ? (item.type || item.category || '') : '').toLowerCase();
    return type.includes('hindrance') || type.includes('disadvantage') || type.includes('flaw');
  };

  // 1. Standard / General Features list (Cleanly segregated from awakened, augs, hindrances)
  const standardFeatures = useMemo(() => {
    const rawFeatures = getItemList('features');
    const result = [];
    rawFeatures.forEach((item, idx) => {
      if (!isAwakenedItem(item) && !isAugmentationItem(item) && !isHindranceItem(item)) {
        result.push({
          ...(typeof item === 'object' ? item : { name: item }),
          sourceList: 'features',
          sourceIndex: idx
        });
      }
    });
    return result;
  }, [characterData.features]);

  // Group standard features by category/type
  const groupedStandardFeatures = useMemo(() => {
    const groups = {};
    standardFeatures.forEach((item) => {
      let typeStr = 'General';
      if (typeof item === 'object') {
        if (item.type || item.category) {
          typeStr = item.type || item.category;
        }
      }
      const type = typeStr.trim() || 'General';
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
  }, [standardFeatures]);

  // 2. Awakened Disciplines & Metaphysics list
  const awakenedList = useMemo(() => {
    const fromAwakened = getItemList('awakened').map((w, idx) => ({
      ...(typeof w === 'object' ? { ...w, type: 'Awakened', cp: w.cp || 3 } : { name: typeof w === 'string' && !w.startsWith('Awakened') ? `Awakened: ${w}` : w, type: 'Awakened', cp: 3 }),
      sourceList: 'awakened',
      sourceIndex: idx
    }));

    const fromFeatures = getItemList('features').map((item, idx) => {
      if (isAwakenedItem(item)) {
        return {
          ...(typeof item === 'object' ? { ...item, type: 'Awakened', cp: item.cp || 3 } : { name: item, type: 'Awakened', cp: 3 }),
          sourceList: 'features',
          sourceIndex: idx
        };
      }
      return null;
    }).filter(Boolean);

    // Merge without duplicates by discipline key
    const seen = new Set();
    const combined = [];
    [...fromAwakened, ...fromFeatures].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase().replace('awakened:', '').replace('awakened', '').trim();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });

    return combined;
  }, [characterData.awakened, characterData.features]);

  // Check if a specific discipline name is awakened on this character
  const isDisciplineAwakened = (discName) => {
    const target = discName.toLowerCase();
    return awakenedList.some(item => {
      const n = (item.name || item.title || item.discipline || '').toLowerCase();
      return n.includes(target);
    });
  };

  // Toggle Awakened status for one of the 6 canonical disciplines
  const handleToggleAwakenedDiscipline = (disc) => {
    const isCurrentlyAwakened = isDisciplineAwakened(disc.name);
    const targetKey = disc.name.toLowerCase();

    if (isCurrentlyAwakened) {
      if (!confirmTypedDeletion(`Awakened: ${disc.name}`, 'awakened discipline feature')) return;
      
      // Remove from characterData.awakened
      const rawAwakened = getItemList('awakened');
      const updatedAwakened = rawAwakened.filter(d => {
        const n = typeof d === 'object' ? (d.name || d.discipline || '') : String(d);
        return !n.toLowerCase().includes(targetKey);
      });
      updateField('awakened', updatedAwakened);

      // Remove from characterData.features if present
      const rawFeatures = getItemList('features');
      const updatedFeatures = rawFeatures.filter(f => {
        const n = typeof f === 'object' ? (f.name || f.title || '') : String(f);
        return !n.toLowerCase().includes(`awakened: ${targetKey}`) && !n.toLowerCase().includes(`awakened ${targetKey}`);
      });
      updateField('features', updatedFeatures);
    } else {
      // Purchase / Grant Awakened Feature (3 CP)
      const newItem = {
        id: `awakened_${disc.id}_${Date.now()}`,
        name: `Awakened: ${disc.name}`,
        discipline: disc.name,
        type: 'Awakened',
        category: 'Awakened Discipline',
        cp: 3,
        description: disc.description
      };

      const rawAwakened = getItemList('awakened');
      updateField('awakened', [...rawAwakened, newItem]);
      handleAddItem('features', newItem);

      // Ensure Attune skill is trained/unlocked if 0
      const currentAttuneRank = parseInt(characterData['skill-meta-attune-rank'] || 0, 10);
      if (currentAttuneRank === 0) {
        updateField('skill-meta-attune-rank', 1);
        updateField('skill-meta-attune-name', 'Attune');
        updateField('skill-meta-attune-group', 'meta');
      }
    }
  };

  // 3. Augmentations list
  const augmentationsList = useMemo(() => {
    const fromAugs = getItemList('augmentations').map((a, idx) => ({
      ...(typeof a === 'object' ? { ...a, type: a.type || 'Augmentation', cp: a.cp || 2 } : { name: a, type: 'Augmentation', cp: 2 }),
      sourceList: 'augmentations',
      sourceIndex: idx
    }));

    const fromFeatures = getItemList('features').map((item, idx) => {
      if (isAugmentationItem(item)) {
        return {
          ...(typeof item === 'object' ? { ...item, type: 'Augmentation', cp: item.cp || 2 } : { name: item, type: 'Augmentation', cp: 2 }),
          sourceList: 'features',
          sourceIndex: idx
        };
      }
      return null;
    }).filter(Boolean);

    // Deduplicate
    const seen = new Set();
    const combined = [];
    [...fromAugs, ...fromFeatures].forEach(item => {
      const name = (item.name || item.title || '').toLowerCase();
      if (!seen.has(name)) {
        seen.add(name);
        combined.push(item);
      }
    });

    return combined;
  }, [characterData.augmentations, characterData.features]);

  // 4. Hindrances list (replaces Disadvantages & Flaws)
  const hindrancesList = useMemo(() => {
    const fromHindrances = (Array.isArray(characterData.hindrances) && characterData.hindrances.length > 0)
      ? characterData.hindrances
      : getItemList('disadvantages');

    return fromHindrances.map((item, idx) => ({
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

  // CP Totals
  const totalStandardFeaturesCP = useMemo(() => {
    return standardFeatures.reduce((acc, feat) => {
      const isSpecies = typeof feat === 'object' && (
        feat.source === 'species' || 
        feat.category === 'Species Inherent' || 
        feat.category === 'Species' ||
        feat.cp === 0
      );
      if (isSpecies) return acc;
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      return acc + (isNaN(cost) ? 3 : cost);
    }, 0);
  }, [standardFeatures]);

  const totalAwakenedCP = useMemo(() => {
    return awakenedList.reduce((acc, feat) => {
      const cost = typeof feat === 'object' && feat.cp !== undefined ? parseInt(feat.cp, 10) : 3;
      return acc + (isNaN(cost) ? 3 : cost);
    }, 0);
  }, [awakenedList]);

  // Learned Invocations list from characterData.invocations
  const learnedInvocations = useMemo(() => {
    return getItemList('invocations').map((inv, idx) => ({
      ...(typeof inv === 'object' ? inv : { name: inv }),
      sourceIndex: idx
    }));
  }, [characterData.invocations]);

  // Map learned invocations by discipline (supports composite disciplines e.g. "Entropy + Dimension")
  const invocationsByDiscipline = useMemo(() => {
    const map = {};
    learnedInvocations.forEach((inv) => {
      const disc = (inv.discipline || '').toLowerCase();
      METAPHYSICAL_DISCIPLINES.forEach((d) => {
        const dNameLower = d.name.toLowerCase();
        if (disc.includes(dNameLower)) {
          if (!map[dNameLower]) map[dNameLower] = [];
          map[dNameLower].push(inv);
        }
      });
    });
    return map;
  }, [learnedInvocations]);

  // Invocations cost 1 CP each (as skill specializations)
  const totalInvocationsCP = useMemo(() => {
    return learnedInvocations.reduce((sum, inv) => {
      const cp = inv.cp !== undefined ? parseInt(inv.cp, 10) : 1;
      return sum + (isNaN(cp) ? 1 : cp);
    }, 0);
  }, [learnedInvocations]);

  const totalMetaphysicsCP = totalAwakenedCP + totalInvocationsCP;

  const totalAugmentationsCP = useMemo(() => {
    return augmentationsList.reduce((acc, aug) => {
      const cost = typeof aug === 'object' && aug.cp !== undefined ? parseInt(aug.cp, 10) : 2;
      return acc + (isNaN(cost) ? 2 : cost);
    }, 0);
  }, [augmentationsList]);

  const totalHindrancesRefund = useMemo(() => {
    return hindrancesList.reduce((acc, dis) => {
      const refund = typeof dis === 'object' && dis.cp !== undefined ? parseInt(dis.cp, 10) : 3;
      return acc + (isNaN(refund) ? 3 : refund);
    }, 0);
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

  // Remove Augmentation Item
  const handleRemoveAugmentation = (item) => {
    const itemName = typeof item === 'object' ? (item.name || item.title || 'Augmentation') : String(item);
    if (!confirmTypedDeletion(itemName, 'augmentation')) return;

    const listKey = item.sourceList || 'augmentations';
    const currentList = getItemList(listKey);
    const updated = currentList.filter((_, i) => i !== item.sourceIndex);
    updateField(listKey, updated);

    // Also clean from features if stored there
    if (listKey !== 'features' && Array.isArray(characterData.features)) {
      const updatedFeats = characterData.features.filter(f => {
        const n = typeof f === 'object' ? (f.name || f.title || '') : String(f);
        return n !== itemName;
      });
      updateField('features', updatedFeats);
    }
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

  // Visibility Flags
  const showStandardFeatures = selectedSubTab === 'all' || selectedSubTab === 'features' || selectedSubTab === 'features-standard';
  const showAwakened = selectedSubTab === 'all' || selectedSubTab === 'metaphysics' || selectedSubTab === 'features-metaphysics' || selectedSubTab === 'awakened' || selectedSubTab === 'features-awakened';
  const showAugmentations = selectedSubTab === 'all' || selectedSubTab === 'augmentations' || selectedSubTab === 'features-augmentations';
  const showHindrances = selectedSubTab === 'all' || selectedSubTab === 'hindrances' || selectedSubTab === 'features-hindrances';

  const getTypeBadgeStyle = (typeStr) => {
    const lower = typeStr.toLowerCase();
    if (lower.includes('combat')) return 'bg-rose-950/80 text-rose-300 border-rose-800';
    if (lower.includes('ability')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    if (lower.includes('karma')) return 'bg-purple-950/80 text-purple-300 border-purple-800';
    if (lower.includes('skill')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
  };

  return (
    <div className="tab-panel active p-4 space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* Sub-Tab Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-900/60 pb-2.5 gap-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSubTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedSubTab === 'all'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Subsections
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('features')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubTab === 'features' || selectedSubTab === 'features-standard'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Standard Features</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-cyan-300 font-mono">
              {standardFeatures.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('metaphysics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubTab === 'metaphysics' || selectedSubTab === 'features-metaphysics' || selectedSubTab === 'awakened' || selectedSubTab === 'features-awakened'
                ? 'bg-purple-950 border border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Metaphysics / Awakened</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-purple-300 font-mono">
              {awakenedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('augmentations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubTab === 'augmentations' || selectedSubTab === 'features-augmentations'
                ? 'bg-amber-950 border border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Augmentations</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-amber-300 font-mono">
              {augmentationsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab('hindrances')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSubTab === 'hindrances' || selectedSubTab === 'features-hindrances'
                ? 'bg-red-950 border border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Hindrances</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-red-300 font-mono">
              {hindrancesList.length}
            </span>
          </button>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold rounded">
            Total Features: {totalStandardFeaturesCP + totalAwakenedCP + totalAugmentationsCP} CP
          </span>
          {totalHindrancesRefund > 0 && (
            <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded">
              Refund: -{totalHindrancesRefund} CP
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. STANDARD / GENERAL FEATURES SUBSECTION */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showStandardFeatures && (
        <div className="bg-slate-900/80 border border-cyan-900/60 rounded-xl p-5 shadow-lg space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Standard Character Features
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permanent character perks, combat bonuses, ability knacks, and racial talents (1 to 3 CP).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold rounded">
                {standardFeatures.length} {standardFeatures.length === 1 ? 'Feature' : 'Features'}
              </span>
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
                {totalStandardFeaturesCP} CP Total
              </span>
            </div>
          </div>

          {/* Feature Items List */}
          {standardFeatures.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg space-y-1">
              <p>No standard features acquired yet.</p>
              <p className="text-[11px] text-slate-600">Click below to open the complete Features Catalog containing all 218+ canonical entries.</p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
              {groupedStandardFeatures.map((group) => {
                const groupCPTotal = group.items.reduce((sum, item) => {
                  const isSpecies = typeof item === 'object' && (
                    item.source === 'species' || 
                    item.category === 'Species Inherent' || 
                    item.category === 'Species' ||
                    item.cp === 0
                  );
                  if (isSpecies) return sum;
                  const cost = typeof item === 'object' && item.cp !== undefined ? parseInt(item.cp, 10) : 3;
                  return sum + (isNaN(cost) ? 3 : cost);
                }, 0);

                return (
                  <div key={group.type} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getTypeBadgeStyle(group.type)}`}>
                          {group.type}
                        </span>
                        <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                          {group.type} Features
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'} &bull; {groupCPTotal} CP
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.items.map((item) => {
                        const name = typeof item === 'object' ? (item.name || item.title) : item;
                        const isSpeciesGranted = typeof item === 'object' && (
                          item.source === 'species' || 
                          item.category === 'Species Inherent' || 
                          item.category === 'Species' || 
                          item.category === 'Species Trait' ||
                          item.cp === 0
                        );
                        const standalone = typeof item === 'object' && item.standaloneCp !== undefined
                          ? item.standaloneCp
                          : ((typeof item === 'object' && item.bp !== undefined) ? item.bp : 3);
                        const cpCostDisplay = isSpeciesGranted ? `0 [${standalone}] CP` : `${typeof item === 'object' && item.cp !== undefined ? item.cp : 3} CP`;
                        const desc = typeof item === 'object' ? (item.description || item.mechanic || item.summary || '') : '';
                        const featCategory = typeof item === 'object' ? (item.category || item.type || group.type || 'Feature') : (group.type || 'Feature');
                        const featPrereq = typeof item === 'object' ? (item.prerequisites || item.prereq || '') : '';
                        const featMechanic = typeof item === 'object' ? (item.mechanic || '') : '';
                        const featBadgeColor = featCategory.toLowerCase().includes('combat') ? 'rose' :
                          featCategory.toLowerCase().includes('ability') ? 'amber' :
                          featCategory.toLowerCase().includes('karma') ? 'purple' :
                          featCategory.toLowerCase().includes('skill') ? 'emerald' : 'cyan';

                        return (
                          <div
                            key={`${item.sourceList}_${item.sourceIndex}`}
                            className="bg-slate-950/80 border border-slate-800 hover:border-cyan-800/70 rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <FolioTooltip
                                  title={name}
                                  badge={featCategory}
                                  badgeColor={featBadgeColor}
                                  description={desc || 'Operative feature.'}
                                  formula={featMechanic || undefined}
                                  prerequisites={featPrereq || undefined}
                                  cost={cpCostDisplay}
                                  tags={[
                                    typeof item === 'object' && item.is_ranked ? 'Ranked' : null,
                                    typeof item === 'object' && item.is_multiple ? 'Multiple' : null,
                                    isSpeciesGranted ? 'Species Inherent' : null
                                  ].filter(Boolean)}
                                  showInfoIcon={true}
                                >
                                  <h4 className="font-semibold text-xs text-slate-100 hover:text-cyan-300 leading-snug pr-1 transition-colors">
                                    {name}
                                  </h4>
                                </FolioTooltip>
                                <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                                  isSpeciesGranted 
                                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 shadow-sm'
                                    : 'text-cyan-300 bg-cyan-950/80 border border-cyan-800/80'
                                }`}>
                                  {cpCostDisplay}
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
                                  onClick={() => onOpenAssetModal('features', 'Feature', 'edit', item.sourceIndex, item)}
                                  className="text-slate-400 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Edit feature properties"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
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

          {/* Action Button: Opens Full 218+ Features Catalog */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('features', 'Features Catalog', 'features')}
              className="py-2 px-6 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(34,211,238,0.2)] cursor-pointer active:scale-95"
              title="Open full categorized Features Database (Ability, Combat, General, Skill, Karma, Special, etc.)"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>+ Add Feature (Browse Catalog)</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. METAPHYSICS & AWAKENED DISCIPLINES SUBSECTION */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showAwakened && (
        <div className="bg-slate-900/80 border border-purple-900/60 rounded-xl p-5 shadow-lg space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-purple-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Metaphysics &amp; Awakened Disciplines
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Awakening a discipline costs 3 CP, unlocking the discipline and its 2 paired skills. The first awakened feature also unlocks the Attune skill.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded">
                {awakenedList.length} Awakened ({totalAwakenedCP} CP)
              </span>
              <span className="px-2.5 py-1 bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono font-bold rounded">
                {learnedInvocations.length} Invocations ({totalInvocationsCP} CP)
              </span>
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
                {totalMetaphysicsCP} CP Total
              </span>
            </div>
          </div>

          {/* 6 Canonical Disciplines Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {METAPHYSICAL_DISCIPLINES.map((disc) => {
              const isAwakened = isDisciplineAwakened(disc.name);
              const pairedSkillNames = disc.skills.map(s => s.name).join(', ');
              const cardInvocations = invocationsByDiscipline[disc.name.toLowerCase()] || [];

              return (
                <div
                  key={disc.id}
                  className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                    isAwakened
                      ? 'bg-purple-950/40 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{disc.icon}</span>
                        <FolioTooltip
                          title={`Awakened: ${disc.name}`}
                          badge="Metaphysics Discipline"
                          badgeColor="purple"
                          description={disc.description}
                          formula={`Unlocks skills: ${pairedSkillNames} & Attune`}
                          cost="3 CP"
                          tags={['Metaphysics', 'Code Resonance', 'Void Channeling']}
                          showInfoIcon={true}
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wide hover:text-purple-300 transition-colors">
                              {disc.name}
                            </h4>
                            <span className="text-[10px] font-mono text-purple-300/80">
                              3 CP Feature
                            </span>
                          </div>
                        </FolioTooltip>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                          isAwakened
                            ? 'bg-purple-900/90 border-purple-400 text-purple-100 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {isAwakened ? '✨ Awakened' : '🔒 Dormant'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300/90 leading-relaxed line-clamp-2">
                      {disc.description}
                    </p>

                    <div className="p-2 rounded bg-slate-900/70 border border-slate-800 text-[10.5px] font-mono">
                      <span className="text-slate-400 block text-[9.5px] uppercase font-bold text-cyan-400/90 mb-0.5">
                        Paired Skills:
                      </span>
                      <span className={isAwakened ? 'text-purple-200 font-bold' : 'text-slate-400'}>
                        {pairedSkillNames}
                      </span>
                    </div>

                    {/* Invocations Section on Discipline Card */}
                    <div className="mt-3 pt-2.5 border-t border-purple-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-purple-300 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-purple-400" />
                          Invocations ({cardInvocations.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenSelectorModal('invocations', `${disc.name} Invocations Catalog (Omnicortex)`, 'invocations', disc.name)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 border border-purple-500/60 text-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title={`Browse Omnicortex Invocations for ${disc.name}`}
                        >
                          <Plus className="w-3 h-3 text-purple-300" />
                          <span>+ Invocations</span>
                        </button>
                      </div>

                      {/* Learned Invocations List for this Discipline */}
                      {cardInvocations.length > 0 ? (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {cardInvocations.map((inv) => {
                            const invRank = Math.min(10, Math.max(1, parseInt(inv.rank || 1, 10)));
                            const subName = inv.subSkill || disc.skills[0]?.name || 'Focus';
                            const pairedSkill = disc.skills.find(s => s.name.toLowerCase() === subName.toLowerCase()) || disc.skills[0];
                            const skillRank = parseInt(characterData[`skill-${pairedSkill.id}-rank`] || 0, 10);
                            const attrVal = parseInt(characterData['attr-wisdom'] || 0, 10);
                            const attrMod = Math.floor(attrVal / 2);
                            const invTotal = skillRank + attrMod + invRank + (parseInt(inv.mod || 0, 10));

                            return (
                              <div
                                key={inv.id || inv.name}
                                className="flex items-center justify-between p-1.5 rounded bg-purple-950/70 border border-purple-900/50 hover:border-purple-700/60 text-xs transition-colors group"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FolioTooltip
                                    title={inv.name}
                                    badge={`${disc.name} (${subName})`}
                                    badgeColor="purple"
                                    description={inv.description || inv.body}
                                    formula={`Skill: ${subName} (+${invRank} rank, DC ${inv.baseDC || 15})`}
                                    cost="1 CP"
                                    tags={[disc.name, subName, 'Invocation']}
                                    showInfoIcon={false}
                                  >
                                    <span className="font-bold text-slate-200 truncate cursor-help group-hover:text-purple-300">
                                      {inv.name}
                                    </span>
                                  </FolioTooltip>
                                  <span className="px-1 py-0.2 text-[9px] font-mono bg-purple-900/80 border border-purple-700/70 text-purple-300 rounded shrink-0">
                                    {subName} +{invRank}
                                  </span>
                                  <span className="px-1 py-0.2 text-[9px] font-mono bg-amber-950/70 border border-amber-800 text-amber-300 rounded shrink-0">
                                    1 CP
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openDiceRoller({
                                        mode: 'check',
                                        mod: invTotal,
                                        label: `${disc.name}: ${inv.name} Invocation Check (${subName})`,
                                        tags: ['invocation', disc.name.toLowerCase(), subName.toLowerCase()]
                                      });
                                    }}
                                    className="p-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 border border-purple-600 transition-colors cursor-pointer"
                                    title={`Roll ${inv.name} Check (2d10 + ${invTotal})`}
                                  >
                                    <Dices className="w-3 h-3 text-purple-300" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      confirmTypedDeletion({
                                        title: `Remove Invocation: ${inv.name}`,
                                        message: `Are you sure you want to remove the ${inv.name} invocation? This will refund 1 CP.`,
                                        expectedConfirmation: inv.name,
                                        onConfirm: () => handleDeleteItem('invocations', inv.sourceIndex)
                                      });
                                    }}
                                    className="p-1 rounded hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Remove Invocation"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-2 text-center text-[10.5px] font-mono text-slate-500 bg-slate-950/40 rounded border border-slate-900/80">
                          0 Invocations learned (1 CP each)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleAwakenedDiscipline(disc)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAwakened
                          ? 'bg-purple-900/80 hover:bg-red-950 border border-purple-500 hover:border-red-600 text-purple-100 hover:text-red-200'
                          : 'bg-purple-950 hover:bg-purple-900 border border-purple-700/80 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                      }`}
                    >
                      {isAwakened ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Awakened (3 CP)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-purple-400" />
                          <span>Awaken Discipline (3 CP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar for Omnicortex Invocations & Metaphysics Codex */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('invocations', 'Omnicortex Invocations Catalog', 'invocations')}
              className="py-2 px-5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/80 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.25)] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span>+ Browse All Invocations (Omnicortex)</span>
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
              className="py-2 px-5 bg-slate-900 hover:bg-slate-800 border border-purple-900/60 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Launch Metaphysics Codex</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3. AUGMENTATIONS SUBSECTION */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showAugmentations && (
        <div className="bg-slate-900/80 border border-amber-900/60 rounded-xl p-5 shadow-lg space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                Cybernetic &amp; Biological Augmentations
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Installed prosthetic hardware, neural cyberware, and bio-mod implants requiring socket allocations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
                {augmentationsList.length} {augmentationsList.length === 1 ? 'Augmentation' : 'Augmentations'}
              </span>
              <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold rounded">
                {totalAugmentationsCP} CP Total
              </span>
            </div>
          </div>

          {/* Augmentations Items Grid */}
          {augmentationsList.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg space-y-1">
              <p>No cybernetic or biological augmentations installed.</p>
              <p className="text-[11px] text-slate-600">Click below to browse the Augmentations catalog and allocate hardware.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-1">
              {augmentationsList.map((aug) => {
                const name = typeof aug === 'object' ? (aug.name || aug.title) : aug;
                const cpCost = typeof aug === 'object' && aug.cp !== undefined ? aug.cp : 2;
                const desc = typeof aug === 'object' ? (aug.description || aug.summary || '') : '';
                const location = typeof aug === 'object' ? (aug.location || aug.slot || aug.type || 'Cyberware') : 'Cyberware';

                return (
                  <div
                    key={`${aug.sourceList}_${aug.sourceIndex}`}
                    className="bg-slate-950/80 border border-amber-900/40 hover:border-amber-700/70 rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <FolioTooltip
                          title={name}
                          badge={location || 'Augmentation'}
                          badgeColor="amber"
                          description={desc || 'Prosthetic hardware, neural cyberware, or bio-mod implant.'}
                          cost={`${cpCost} CP`}
                          tags={['Augmentation', location]}
                          showInfoIcon={true}
                        >
                          <h4 className="font-semibold text-xs text-slate-100 hover:text-amber-300 leading-snug pr-1 transition-colors cursor-help">
                            {name}
                          </h4>
                        </FolioTooltip>
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 rounded">
                          {cpCost} CP
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400/90 block mb-1">
                        📍 {location}
                      </span>
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
                          onClick={() => onOpenAssetModal('augmentations', 'Augmentation', 'edit', aug.sourceIndex, aug)}
                          className="text-slate-400 hover:text-amber-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Edit augmentation properties"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveAugmentation(aug)}
                        className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Remove augmentation"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button: Opens Augmentations Catalog */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('augmentations', 'Augmentations Catalog', 'augmentations')}
              className="py-2 px-6 bg-amber-950/90 hover:bg-amber-900 border border-amber-700/80 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
              title="Open Augmentations Database"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>+ Add Augmentation (Browse Catalog)</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 4. HINDRANCES SUBSECTION */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showHindrances && (
        <div id="hindrances-section" className="bg-slate-900/80 border border-red-900/50 rounded-xl p-5 shadow-lg space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-red-950 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Hindrances &amp; Disadvantages
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Character handicaps, social debts, and physiological flaws that yield Creation Point (CP) refunds.
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

          {/* Hindrances Items List */}
          {hindrancesList.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-lg space-y-1">
              <p>No hindrances selected.</p>
              <p className="text-[11px] text-slate-600">Taking hindrances grants bonus Creation Points (CP) to invest into attributes, skills, and features.</p>
            </div>
          ) : (
            <div className="space-y-5 max-h-[450px] overflow-y-auto pr-1">
              {groupedHindrances.map((group) => {
                const groupRefundTotal = group.items.reduce((sum, item) => {
                  const refund = typeof item === 'object' && item.cp !== undefined ? parseInt(item.cp, 10) : 3;
                  return sum + (isNaN(refund) ? 3 : refund);
                }, 0);

                return (
                  <div key={group.type} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-950/80 text-red-300 border-red-800">
                          {group.type}
                        </span>
                        <span className="text-xs font-bold text-slate-300 tracking-wide uppercase">
                          {group.type} Hindrances
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {group.items.length} {group.items.length === 1 ? 'entry' : 'entries'} &bull; -{groupRefundTotal} CP Refund
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.items.map((item) => {
                        const name = typeof item === 'object' ? (item.name || item.title) : item;
                        const refundCp = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                        const desc = typeof item === 'object' ? (item.description || item.summary || '') : '';

                        return (
                          <div
                            key={item.originalIndex}
                            className="bg-slate-950/80 border border-slate-800 hover:border-red-800/70 rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <FolioTooltip
                                  title={name}
                                  badge={group.type || 'Hindrance'}
                                  badgeColor="rose"
                                  description={desc || 'Operative handicap, social flaw, or physical penalty.'}
                                  cost={`-${refundCp} CP Refund`}
                                  tags={['Hindrance', 'CP Refund']}
                                  showInfoIcon={true}
                                >
                                  <h4 className="font-semibold text-xs text-slate-100 hover:text-rose-300 leading-snug pr-1 transition-colors cursor-help">
                                    {name}
                                  </h4>
                                </FolioTooltip>
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
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveHindrance(item)}
                                className="text-slate-500 hover:text-red-400 text-sm font-bold px-1.5 py-0.5 leading-none rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                title="Remove hindrance"
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

          {/* Action Button: Opens Hindrances Catalog */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => onOpenSelectorModal('disadvantages', 'Hindrances Catalog', 'disadvantages')}
              className="py-2 px-6 bg-red-950/80 hover:bg-red-900/90 border border-red-700/80 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.2)] cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>+ Add Hindrance (Browse Catalog)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(FeaturesTab);
