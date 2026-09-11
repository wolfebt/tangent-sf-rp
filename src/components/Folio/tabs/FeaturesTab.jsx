import React, { useState, useMemo, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { Sparkles, AlertTriangle, Cpu, Zap, Plus, Edit3, Trash2, Check, Lock, BookOpen, Dices, Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import FolioTooltip from '../shared/FolioTooltip';
import { checkPrerequisite } from '../../../utils/prerequisiteEvaluator';
import { enrichItemWithModifiers } from '../../../engines/tangentModifierEngine';
import AugmentationsManager from '../augmentations/AugmentationsManager';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_FEATURES } from '../../../data/featuresData';

export const FeaturesTab = ({ 
  onOpenSelectorModal, 
  onOpenAssetModal, 
  activeSection = 'all', 
  onOpenMetaphysicsModal,
  onBackToHub,
  onNavigate
}) => {
  const { characterData, updateField, handleAddItem, handleUpdateItem, handleDeleteItem } = useFolio();
  const { openDiceRoller } = useDice();
  const [selectedSubTab, setSelectedSubTab] = useState(activeSection || 'all');
  const [metaInnerTab, setMetaInnerTab] = useState('disciplines'); // 'disciplines' | 'invocations'
  const [metaSearchQuery, setMetaSearchQuery] = useState('');
  const [metaTypeFilter, setMetaTypeFilter] = useState('all');
  const [metaDisciplineFilter, setMetaDisciplineFilter] = useState('all');

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

  const [isRecExpanded, setIsRecExpanded] = useState(true);

  // Helper to normalize feature or trait name
  const normalizeFeatName = (name) => {
    if (!name) return '';
    return String(name).replace(/^(feature|trait)-/i, '').replace(/[-_]/g, ' ').trim().toLowerCase();
  };

  // Aggregated Recommended Features from Selected Archetype, Occupation, Species, and Faction
  const recommendedFeaturesList = useMemo(() => {
    const list = [];
    const seen = new Set();

    const addRec = (rawItem, source, category) => {
      if (!rawItem) return;
      const rawName = typeof rawItem === 'object' ? (rawItem.name || rawItem.title || rawItem.id || '') : String(rawItem);
      const cleanName = rawName.replace(/^(feature|trait)-/i, '').replace(/[-_]/g, ' ').trim();
      const norm = cleanName.toLowerCase();
      if (!norm || seen.has(norm)) return;
      seen.add(norm);

      // Try finding canonical feature definition
      const matched = DEFAULT_FEATURES.find(f => {
        const fNorm = (f.name || f.id || '').replace(/^(feature|trait)-/i, '').replace(/[-_]/g, ' ').trim().toLowerCase();
        return fNorm === norm || fNorm.includes(norm) || norm.includes(fNorm);
      });

      list.push({
        id: matched?.id || `rec_${norm.replace(/\s+/g, '_')}`,
        name: matched?.name || cleanName,
        cp: matched?.cp !== undefined ? matched.cp : 3,
        source,
        category: matched?.category || category || 'Recommended',
        description: matched?.description || matched?.mechanic || (typeof rawItem === 'object' ? rawItem.description : '') || 'Recommended character feature.',
        rawObj: matched || (typeof rawItem === 'object' ? rawItem : { name: cleanName, cp: 3 })
      });
    };

    // 1. Archetype Signature Features
    const archName = characterData['char-archetype'];
    if (archName) {
      const arch = DEFAULT_ARCHETYPES.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase());
      if (arch && Array.isArray(arch.signature_features)) {
        arch.signature_features.forEach(f => addRec(f, `Archetype: ${arch.name}`, 'Archetype'));
      }
    }

    // 2. Species Recommended / Bonus Features
    const spName = characterData['char-species'];
    if (spName) {
      const sp = DEFAULT_SPECIES.find(s => (s.name || s.title || s.id || '').toLowerCase() === String(spName).toLowerCase());
      if (sp) {
        if (Array.isArray(sp.recommended_features)) sp.recommended_features.forEach(f => addRec(f, `Species: ${sp.name}`, 'Species'));
        if (Array.isArray(sp.bonus_feature_choices)) sp.bonus_feature_choices.forEach(f => addRec(f, `Species: ${sp.name}`, 'Species'));
      }
    }

    // 3. Occupation Traits / Features
    const occName = characterData['char-occu'];
    if (occName) {
      const occ = DEFAULT_OCCUPATIONS.find(o => (o.name || o.id || '').toLowerCase() === String(occName).toLowerCase());
      if (occ) {
        if (Array.isArray(occ.traits)) occ.traits.forEach(t => addRec(t, `Occupation: ${occ.name}`, 'Occupation'));
        if (Array.isArray(occ.features)) occ.features.forEach(f => addRec(f, `Occupation: ${occ.name}`, 'Occupation'));
      }
    }

    // 4. Faction Features / Packages
    const facName = characterData['char-faction'];
    if (facName) {
      const fac = DEFAULT_FACTIONS.find(f => (f.name || f.id || '').toLowerCase().includes(String(facName).toLowerCase()) || String(facName).toLowerCase().includes((f.name || f.id || '').toLowerCase()));
      if (fac) {
        if (Array.isArray(fac.traits)) fac.traits.forEach(t => addRec(t, `Faction: ${fac.name}`, 'Faction'));
        if (Array.isArray(fac.features)) fac.features.forEach(f => addRec(f, `Faction: ${fac.name}`, 'Faction'));
      }
    }

    return list;
  }, [characterData['char-archetype'], characterData['char-species'], characterData['char-occu'], characterData['char-faction']]);

  // Check if a recommended feature is currently acquired
  const isFeatureAcquired = (featName) => {
    if (!featName) return false;
    const normTarget = normalizeFeatName(featName);
    const existing = getItemList('features');
    return existing.some(item => {
      const n = typeof item === 'object' ? (item.name || item.title || item.id || '') : String(item);
      const nNorm = normalizeFeatName(n);
      return nNorm === normTarget || (normTarget.length > 3 && (nNorm.includes(normTarget) || normTarget.includes(nNorm)));
    });
  };

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

  // Character Special Abilities list
  const characterSpecialAbilities = useMemo(() => {
    return getItemList('special_abilities').map((abil, idx) => ({
      ...(typeof abil === 'object' ? abil : { name: abil }),
      sourceIndex: idx,
      powerType: 'special_ability'
    }));
  }, [characterData.special_abilities]);

  const totalSpecialAbilitiesCP = useMemo(() => {
    return characterSpecialAbilities.reduce((sum, abil) => {
      const cp = abil.cp !== undefined ? parseInt(abil.cp, 10) : 5;
      return sum + (isNaN(cp) ? 5 : cp);
    }, 0);
  }, [characterSpecialAbilities]);

  // Combined Character Powers (Invocations + Special Abilities)
  const characterPowers = useMemo(() => {
    const invs = learnedInvocations.map(inv => ({ ...inv, powerType: 'invocation' }));
    const abs = characterSpecialAbilities.map(abil => ({ ...abil, powerType: 'special_ability' }));
    return [...invs, ...abs];
  }, [learnedInvocations, characterSpecialAbilities]);

  const filteredCharacterPowers = useMemo(() => {
    return characterPowers.filter(p => {
      if (metaTypeFilter === 'invocations' && p.powerType !== 'invocation') return false;
      if (metaTypeFilter === 'special_abilities' && p.powerType !== 'special_ability') return false;

      if (metaDisciplineFilter !== 'all') {
        const disc = (p.discipline || '').toLowerCase();
        if (!disc.includes(metaDisciplineFilter.toLowerCase())) return false;
      }

      if (metaSearchQuery.trim()) {
        const q = metaSearchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || p.body || '').toLowerCase().includes(q);
        const matchDisc = (p.discipline || '').toLowerCase().includes(q);
        const matchSub = (p.subSkill || '').toLowerCase().includes(q);
        const matchDmg = (p.damage || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDisc && !matchSub && !matchDmg) return false;
      }

      return true;
    });
  }, [characterPowers, metaTypeFilter, metaDisciplineFilter, metaSearchQuery]);

  const handleUpdateInvocationRank = (idx, newRank) => {
    const raw = getItemList('invocations');
    const clamped = Math.min(10, Math.max(1, parseInt(newRank, 10) || 1));
    const updated = [...raw];
    if (updated[idx]) {
      updated[idx] = typeof updated[idx] === 'object' ? { ...updated[idx], rank: clamped } : { name: updated[idx], rank: clamped };
      updateField('invocations', updated);
    }
  };

  const totalMetaphysicsCP = totalAwakenedCP + totalInvocationsCP + totalSpecialAbilitiesCP;

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
          {onBackToHub && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.02);
                onBackToHub();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-950 hover:border-cyan-400 shadow-sm mr-1"
              title="Return to Features Selection Hub"
            >
              <span>◀</span>
              <span>Hub</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedSubTab('all');
              if (onNavigate) onNavigate('features-standard');
            }}
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
            onClick={() => {
              setSelectedSubTab('features');
              if (onNavigate) onNavigate('features-standard');
            }}
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
            onClick={() => {
              setSelectedSubTab('metaphysics');
              if (onNavigate) onNavigate('features-metaphysics');
            }}
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
            onClick={() => {
              setSelectedSubTab('augmentations');
              if (onNavigate) onNavigate('features-augmentations');
            }}
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
            onClick={() => {
              setSelectedSubTab('hindrances');
              if (onNavigate) onNavigate('features-hindrances');
            }}
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
      {/* 0. RECOMMENDED FEATURES DRAWER (Aggregated from Archetype, Species, Occupation, Faction) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showStandardFeatures && recommendedFeaturesList.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 shadow-lg space-y-3">
          <div
            onClick={() => setIsRecExpanded(prev => !prev)}
            className="flex items-center justify-between cursor-pointer select-none border-b border-amber-950/80 pb-2.5"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400">
                Recommended Features ({recommendedFeaturesList.length})
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • Synergistic picks from Archetype, Species, Occupation & Faction
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
                {recommendedFeaturesList.filter(f => isFeatureAcquired(f.name)).length} / {recommendedFeaturesList.length} Acquired
              </span>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title={isRecExpanded ? "Collapse recommendations" : "Expand recommendations"}
              >
                {isRecExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRecExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {recommendedFeaturesList.map((rec) => {
                const acquired = isFeatureAcquired(rec.name);
                return (
                  <div
                    key={rec.id}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                      acquired
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1">
                            <span>{rec.name}</span>
                            {acquired && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold">
                                ✓ Acquired
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] font-mono text-amber-400/90 block">
                            {rec.source}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 shrink-0">
                          {rec.cp} CP
                        </span>
                      </div>

                      {rec.description && (
                        <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                          {rec.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1.5 mt-auto border-t border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {rec.category}
                      </span>
                      {!acquired ? (
                        <button
                          type="button"
                          onClick={() => handleAddItem('features', {
                            id: rec.id || `feat_${Date.now()}`,
                            name: rec.name,
                            category: rec.category || 'General',
                            type: (rec.category || 'general').toLowerCase(),
                            cp: rec.cp !== undefined ? rec.cp : 3,
                            description: rec.description
                          })}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-none active:scale-95"
                          title={`Add ${rec.name} to character features`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Feature</span>
                        </button>
                      ) : (
                        <span className="text-[9.5px] font-mono text-emerald-400 font-bold">
                          Active in Sheet
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                      {group.items.map((rawItem) => {
                        const item = enrichItemWithModifiers(rawItem);
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
                        const featMechanic = typeof item === 'object' ? (item.mechanic || item.mechanics || '') : '';
                        const featRules = typeof item === 'object' ? (item.rules || item.special_rules || '') : '';
                        const featNotes = typeof item === 'object' ? (item.notes || '') : '';
                        const featModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];
                        const featBadgeColor = featCategory.toLowerCase().includes('combat') ? 'rose' :
                          featCategory.toLowerCase().includes('ability') ? 'amber' :
                          featCategory.toLowerCase().includes('karma') ? 'purple' :
                          featCategory.toLowerCase().includes('skill') ? 'emerald' : 'cyan';

                        const prereqResult = checkPrerequisite(item, characterData, 'features');
                        const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                        return (
                          <div
                            key={`${item.sourceList}_${item.sourceIndex}`}
                            className={`border rounded-lg p-3 shadow-sm flex flex-col justify-between transition-all group relative ${
                              isPrereqUnmet
                                ? 'bg-slate-950/70 border-dashed border-rose-900/60 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                                : 'bg-slate-950/80 border-slate-800 hover:border-cyan-800/70'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <FolioTooltip
                                  title={name}
                                  badge={featCategory}
                                  badgeColor={featBadgeColor}
                                  description={desc || 'Operative feature.'}
                                  formula={featMechanic || undefined}
                                  rules={featRules || undefined}
                                  notes={featNotes || undefined}
                                  modifiers={featModifiers}
                                  prerequisites={featPrereq || prereqResult.prerequisiteText || undefined}
                                  prerequisiteMet={!isPrereqUnmet}
                                  prerequisiteUnmetReasons={prereqResult.unmetReasons}
                                  cost={cpCostDisplay}
                                  tags={[
                                    typeof item === 'object' && item.is_ranked ? 'Ranked' : null,
                                    typeof item === 'object' && item.is_multiple ? 'Multiple' : null,
                                    isSpeciesGranted ? 'Species Inherent' : null
                                  ].filter(Boolean)}
                                  showInfoIcon={true}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <h4 className={`font-semibold text-xs leading-snug pr-1 transition-colors ${
                                      isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : 'text-slate-100 hover:text-cyan-300'
                                    }`}>
                                      {name}
                                    </h4>
                                    {isPrereqUnmet && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-rose-950/80 border border-rose-800/80 text-rose-300" title={`Missing: ${prereqResult.unmetReasons.join(', ')}`}>
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>Prereq Missing</span>
                                      </span>
                                    )}
                                  </div>
                                </FolioTooltip>
                                <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                                  isSpeciesGranted 
                                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 shadow-sm'
                                    : 'text-cyan-300 bg-cyan-950/80 border border-cyan-800/80'
                                }`}>
                                  {cpCostDisplay}
                                </span>
                              </div>

                              {/* Active Modifier Chips */}
                              {featModifiers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {featModifiers.map((m, mIdx) => {
                                    const val = typeof m === 'object' ? m.value : null;
                                    const isNeg = typeof val === 'number' && val < 0;
                                    const label = typeof m === 'object' ? (m.description || `${val >= 0 ? '+' : ''}${val} ${m.target}`) : String(m);
                                    return (
                                      <span
                                        key={mIdx}
                                        className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${
                                          isNeg
                                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/70'
                                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/70'
                                        }`}
                                      >
                                        {label}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {desc && (
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-2">
                                  {desc}
                                </p>
                              )}

                              {/* Inline Mechanics Snippet */}
                              {featMechanic && (
                                <div className="bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-[10px] font-mono text-cyan-200/90 mb-2 line-clamp-2">
                                  <span className="font-bold text-slate-500 mr-1 uppercase text-[8.5px]">Mech:</span>
                                  {featMechanic}
                                </div>
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

          {/* Section Inner Tabs: Disciplines vs Invocations */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-purple-950/80">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMetaInnerTab('disciplines')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  metaInnerTab === 'disciplines'
                    ? 'bg-purple-950 text-purple-200 border border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>🔮</span>
                <span>Awakened Disciplines ({awakenedList.length}/6)</span>
              </button>

              <button
                type="button"
                onClick={() => setMetaInnerTab('invocations')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  metaInnerTab === 'invocations'
                    ? 'bg-purple-950 text-purple-200 border border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>📜</span>
                <span>Invocations &amp; Special Abilities ({characterPowers.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenMetaphysicsModal) onOpenMetaphysicsModal();
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-purple-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen size={12} className="text-purple-400" />
                <span>Launch Full Codex</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Consolidated Disciplines List-Type Layout */}
          {metaInnerTab === 'disciplines' && (
            <div className="space-y-2.5">
              {METAPHYSICAL_DISCIPLINES.map((disc) => {
              const isAwakened = isDisciplineAwakened(disc.name);
              const pairedSkillNames = disc.skills.map(s => s.name).join(', ');
              const cardInvocations = invocationsByDiscipline[disc.name.toLowerCase()] || [];

              return (
                <div
                  key={disc.id}
                  className={`rounded-xl p-3 sm:p-4 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                    isAwakened
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-[0_0_16px_rgba(168,85,247,0.12)] ring-1 ring-purple-500/30'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700/80'
                  }`}
                >
                  {/* Left: Discipline Identity & Description */}
                  <div className="flex items-start gap-3 min-w-[260px] lg:max-w-xs xl:max-w-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border shrink-0 ${
                      isAwakened 
                        ? 'bg-purple-950/90 border-purple-500/50 text-purple-200 shadow-inner' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {disc.icon}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <FolioTooltip
                          title={`Awakened: ${disc.name}`}
                          badge="Metaphysics Discipline"
                          badgeColor="purple"
                          description={disc.description}
                          formula={`Unlocks skills: ${pairedSkillNames} & Attune`}
                          cost="3 CP"
                          tags={['Metaphysics', 'Void Channeling']}
                          showInfoIcon={true}
                        >
                          <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wide hover:text-purple-300 transition-colors">
                            {disc.name}
                          </h4>
                        </FolioTooltip>
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider border ${
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
                    </div>
                  </div>

                  {/* Middle: Paired Skills & Invocations Counter */}
                  <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/80 p-2 sm:p-2.5 rounded-xl border border-slate-800/90">
                    <div className="flex-1 min-w-[130px] p-1.5 rounded-lg bg-slate-950/70 border border-slate-850 text-[10.5px] font-mono">
                      <span className="text-slate-400 block text-[9.5px] uppercase font-bold text-cyan-400/90 mb-0.5">
                        Paired Skills:
                      </span>
                      <span className={isAwakened ? 'text-purple-200 font-bold' : 'text-slate-400'}>
                        {pairedSkillNames}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-850">
                      <span className="text-[10.5px] font-mono text-slate-400">
                        Invocations: <strong className="text-purple-300">{cardInvocations.length}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal('invocations', `${disc.name} Invocations Catalog (Omnicortex)`, 'invocations', disc.name)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 border border-purple-500/60 text-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Browse Invocations for ${disc.name}`}
                      >
                        <Plus className="w-3 h-3 text-purple-300" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Cost & Awaken Toggle Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-850">
                    <span className="text-[11px] font-mono text-slate-400">
                      Cost: <strong className="text-amber-300">3 CP</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAwakenedDiscipline(disc)}
                      className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
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
                          <span>Awaken (3 CP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}

          {/* TAB 2: CATALOG OF THE CHARACTER'S INVOCATIONS & SPECIAL ABILITIES */}
          {metaInnerTab === 'invocations' && (
            <div className="bg-slate-950/80 border border-purple-900/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-inner">
            {/* Catalog Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-950 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-cyan-200 flex items-center gap-2">
                  <span>📋</span> Character Powers Catalog ({characterPowers.length} Active)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Manifest of all codified invocations and inherent special abilities acquired by this operative.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSelectorModal('invocations', 'Omnicortex Invocations Catalog', 'invocations')}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/70 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus size={12} />
                  <span>+ Add Invocation</span>
                </button>

                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAssetModal('special_abilities', 'Special Ability', 'add')}
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus size={12} />
                    <span>+ Add Special Ability</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMetaphysicsModal) onOpenMetaphysicsModal();
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-purple-200 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <BookOpen size={12} className="text-purple-400" />
                  <span>Launch Codex</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMetaTypeFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    metaTypeFilter === 'all'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Powers ({characterPowers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMetaTypeFilter('invocations')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    metaTypeFilter === 'invocations'
                      ? 'bg-purple-950 text-purple-200 border border-purple-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📜</span>
                  <span>Invocations ({learnedInvocations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetaTypeFilter('special_abilities')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    metaTypeFilter === 'special_abilities'
                      ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡</span>
                  <span>Special Abilities ({characterSpecialAbilities.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <select
                  value={metaDisciplineFilter}
                  onChange={(e) => setMetaDisciplineFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 outline-none font-mono"
                >
                  <option value="all">All Disciplines</option>
                  {METAPHYSICAL_DISCIPLINES.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={metaSearchQuery}
                    onChange={(e) => setMetaSearchQuery(e.target.value)}
                    placeholder="Search powers & abilities..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50"
                  />
                  {metaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMetaSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Catalog Items Grid */}
            {filteredCharacterPowers.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl space-y-2 bg-slate-950/40">
                <span className="text-2xl">🔮</span>
                <div className="text-xs text-slate-300 font-bold">
                  {metaSearchQuery || metaTypeFilter !== 'all' || metaDisciplineFilter !== 'all'
                    ? 'No matching powers found'
                    : 'No Invocations or Special Abilities acquired'}
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Browse the Omnicortex Invocations library or add inherent special abilities.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenSelectorModal('invocations', 'Omnicortex Invocations Catalog', 'invocations')}
                    className="px-3 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap size={12} className="text-purple-300" />
                    <span>Browse Omnicortex Invocations</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCharacterPowers.map((power, pIdx) => {
                  const isInv = power.powerType === 'invocation';
                  const invRank = Math.min(10, Math.max(1, parseInt(power.rank || 1, 10)));
                  const discName = power.discipline || 'Metaphysics';
                  const subName = power.subSkill || 'Focus';
                  const disciplineObj = METAPHYSICAL_DISCIPLINES.find(d => d.name.toLowerCase() === discName.toLowerCase());
                  const pairedSkill = disciplineObj?.skills.find(s => s.name.toLowerCase() === subName.toLowerCase()) || disciplineObj?.skills[0];
                  const skillRank = pairedSkill ? parseInt(characterData[`skill-${pairedSkill.id}-rank`] || 0, 10) : 0;
                  const attrVal = parseInt(characterData['attr-wisdom'] || 0, 10);
                  const attrMod = Math.floor(attrVal / 2);
                  const invTotal = skillRank + attrMod + invRank + (parseInt(power.mod || 0, 10));

                  const prereqResult = checkPrerequisite(power, characterData, isInv ? 'invocations' : 'special_abilities');
                  const isPrereqUnmet = prereqResult.hasPrerequisite && !prereqResult.isPossessed;

                  return (
                    <div
                      key={power.id || `${power.powerType}_${pIdx}`}
                      className={`border rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between transition-all ${
                        isPrereqUnmet
                          ? 'bg-slate-950/70 border-dashed border-rose-900/60 opacity-60 grayscale-[70%] hover:opacity-100 hover:grayscale-0'
                          : isInv
                          ? 'bg-slate-950/80 border-purple-900/60 hover:border-purple-700/70'
                          : 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-700/70'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`px-2 py-0.2 text-[9.5px] font-mono font-bold uppercase rounded border ${
                                isInv
                                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              }`}>
                                {isInv ? `📜 Invocation (Lvl ${invRank})` : '⚡ Special Ability'}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                {discName} {subName ? `(${subName})` : ''}
                              </span>
                              {isPrereqUnmet && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-rose-950/80 border border-rose-800/80 text-rose-300" title={`Missing: ${prereqResult.unmetReasons.join(', ')}`}>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Prereq Missing</span>
                                </span>
                              )}
                            </div>
                            <FolioTooltip
                              title={power.name}
                              prerequisites={prereqResult.prerequisiteText}
                              prerequisiteMet={!isPrereqUnmet}
                              prerequisiteUnmetReasons={prereqResult.unmetReasons}
                              description={power.description || power.body}
                              tags={[discName, subName].filter(Boolean)}
                            >
                              <h4 className={`font-bold text-xs cursor-pointer ${
                                isPrereqUnmet ? 'text-slate-400 hover:text-rose-300' : isInv ? 'text-purple-100 hover:text-purple-300' : 'text-cyan-100 hover:text-cyan-300'
                              }`}>
                                {power.name}
                              </h4>
                            </FolioTooltip>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isInv ? (
                              <button
                                type="button"
                                onClick={() => {
                                  openDiceRoller({
                                    baseModifier: invTotal,
                                    expression: `2d10${invTotal !== 0 ? (invTotal > 0 ? `+${invTotal}` : `${invTotal}`) : ''}`,
                                    label: `${discName}: ${power.name} Check`,
                                    characterName: characterData['char-name'] || 'Operative',
                                    autoRoll: true
                                  });
                                }}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                title={`Roll 2d10 + ${invTotal} vs DC ${power.baseDC || 15}`}
                              >
                                <Dices className="w-3 h-3 text-purple-200" />
                                <span>+{invTotal}</span>
                              </button>
                            ) : (
                              power.damage ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    openDiceRoller({
                                      baseModifier: 0,
                                      expression: power.damage,
                                      label: `${power.name} Activation`,
                                      characterName: characterData['char-name'] || 'Operative',
                                      autoRoll: true
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                >
                                  <Dices className="w-3 h-3 text-amber-200" />
                                  <span>{power.damage}</span>
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                  Inherent
                                </span>
                              )
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (isInv) {
                                  confirmTypedDeletion({
                                    title: `Remove Invocation: ${power.name}`,
                                    message: `Are you sure you want to remove ${power.name}?`,
                                    expectedConfirmation: power.name,
                                    onConfirm: () => handleDeleteItem('invocations', power.sourceIndex)
                                  });
                                } else {
                                  confirmTypedDeletion({
                                    title: `Remove Special Ability: ${power.name}`,
                                    message: `Are you sure you want to remove ${power.name}?`,
                                    expectedConfirmation: power.name,
                                    onConfirm: () => handleDeleteItem('special_abilities', power.sourceIndex)
                                  });
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Remove Power"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {(power.description || power.body) && (
                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                            {power.description || power.body}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                          <div>Time: <span className="text-slate-200">{power.time || '1 Action'}</span></div>
                          <div>Range: <span className="text-slate-200">{power.range || 'Touch'}</span></div>
                          <div>Duration: <span className="text-slate-200">{power.duration || 'Instant'}</span></div>
                          <div>Save: <span className="text-amber-300">{power.resistance || 'None'}</span></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                        {isInv ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-[10px] text-slate-400">Lvl:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateInvocationRank(power.sourceIndex, invRank - 1)}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-amber-300 px-1">{invRank}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateInvocationRank(power.sourceIndex, invRank + 1)}
                                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            Cost: <strong className="text-amber-300">{power.cp || 5} CP</strong>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-slate-400">
                          {isInv ? `DC ${power.baseDC || 15} • 1 CP` : 'Inherent Trait'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 3. AUGMENTATIONS SUBSECTION */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showAugmentations && (
        <AugmentationsManager
          onOpenSelectorModal={onOpenSelectorModal}
          onOpenAssetModal={onOpenAssetModal}
        />
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
                      {group.items.map((rawItem) => {
                        const item = enrichItemWithModifiers(rawItem);
                        const name = typeof item === 'object' ? (item.name || item.title) : item;
                        const refundCp = typeof item === 'object' && item.cp !== undefined ? item.cp : 3;
                        const desc = typeof item === 'object' ? (item.description || item.summary || '') : '';
                        const hindMechanic = typeof item === 'object' ? (item.mechanic || item.mechanics || '') : '';
                        const hindRules = typeof item === 'object' ? (item.rules || item.special_rules || '') : '';
                        const hindNotes = typeof item === 'object' ? (item.notes || '') : '';
                        const hindModifiers = Array.isArray(item?.modifiers) ? item.modifiers : [];

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
                                  formula={hindMechanic || undefined}
                                  rules={hindRules || undefined}
                                  notes={hindNotes || undefined}
                                  modifiers={hindModifiers}
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

                              {/* Active Modifier / Penalty Chips */}
                              {hindModifiers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {hindModifiers.map((m, mIdx) => {
                                    const val = typeof m === 'object' ? m.value : null;
                                    const isNeg = typeof val === 'number' && val < 0;
                                    const label = typeof m === 'object' ? (m.description || `${val >= 0 ? '+' : ''}${val} ${m.target}`) : String(m);
                                    return (
                                      <span
                                        key={mIdx}
                                        className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${
                                          isNeg
                                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/70'
                                            : 'bg-amber-950/80 text-amber-300 border-amber-800/70'
                                        }`}
                                      >
                                        {label}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {desc && (
                                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-2">
                                  {desc}
                                </p>
                              )}

                              {/* Inline Mechanics Snippet */}
                              {hindMechanic && (
                                <div className="bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1 text-[10px] font-mono text-rose-200/90 mb-2 line-clamp-2">
                                  <span className="font-bold text-slate-500 mr-1 uppercase text-[8.5px]">Mech:</span>
                                  {hindMechanic}
                                </div>
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
