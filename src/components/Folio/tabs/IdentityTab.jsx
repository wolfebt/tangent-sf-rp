import React, { useState, useEffect, useMemo } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { useDBM } from '../../../context/DBMContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { SPECIES_LINEAGES, DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';
import { DEFAULT_OCCUPATIONS } from '../../../data/occupationsData';
import { DEFAULT_ORIGINS } from '../../../data/originsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { ChevronDown, ChevronUp, Eye, X, BookOpen, Shield, Check, Sparkles } from 'lucide-react';
import {
  formatHeightWithConversion,
  getHeightConversion,
  formatWeightWithConversion,
  getWeightConversion
} from '../../../engines/tangentMeasurementEngine';

const normalizeTraitName = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
};

const extractNameList = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(item => {
    if (typeof item === 'object' && item !== null) {
      return item.name || item.title || item.skill || item.id || '';
    }
    return String(item);
  }).filter(Boolean);
};

const formatList = (items) => {
  if (!items) return '—';
  if (Array.isArray(items)) {
    if (items.length === 0) return '—';
    return items.map(i => typeof i === 'object' ? (i.name || i.title || i.id || '') : String(i)).join(', ');
  }
  return String(items);
};

const formatTraitsList = (items) => {
  if (!items) return '—';
  const list = Array.isArray(items) ? items : [items];
  if (list.length === 0) return '—';
  return list.map(normalizeTraitName).join(', ');
};

// Check if a skill name is trained on characterData and return rank
const getSkillTrainingStatus = (skillName, characterData) => {
  if (!skillName) return { isTrained: false, rank: 0 };
  const cleanTarget = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct check in characterData.skills if array or object
  if (Array.isArray(characterData.skills)) {
    const match = characterData.skills.find(s => {
      const n = (typeof s === 'object' ? (s.name || s.id) : String(s)).toLowerCase().replace(/[^a-z0-9]/g, '');
      return n === cleanTarget;
    });
    if (match) {
      const r = typeof match === 'object' ? (match.rank || match.value || 1) : 1;
      return { isTrained: true, rank: r };
    }
  } else if (characterData.skills && typeof characterData.skills === 'object') {
    for (const [k, v] of Object.entries(characterData.skills)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget) {
        const r = typeof v === 'object' ? (v.rank || v.value || 1) : Number(v) || 1;
        return { isTrained: true, rank: r };
      }
    }
  }

  // 2. Check skill-*-rank keys in characterData
  for (const key of Object.keys(characterData)) {
    if (key.startsWith('skill-') && key.endsWith('-rank')) {
      const rawId = key.replace('skill-', '').replace('-rank', '');
      const cleanId = rawId.replace(/[^a-z0-9]/g, '');
      const storedName = characterData[`skill-${rawId}-name`];
      if (storedName && storedName.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget) {
        const r = parseInt(characterData[key], 10);
        if (!isNaN(r) && r > 0) return { isTrained: true, rank: r };
      }
      if (cleanId === cleanTarget || cleanId.includes(cleanTarget) || cleanTarget.includes(cleanId)) {
        const r = parseInt(characterData[key], 10);
        if (!isNaN(r) && r > 0) return { isTrained: true, rank: r };
      }
    }
  }

  return { isTrained: false, rank: 0 };
};

// Check if a trait or feature is acquired on characterData
const getFeatureAcquiredStatus = (featRef, characterData) => {
  if (!featRef) return false;
  const targetNorm = normalizeTraitName(featRef).toLowerCase();
  const targetRaw = (typeof featRef === 'object' ? (featRef.name || featRef.id || '') : String(featRef)).toLowerCase();

  const feats = Array.isArray(characterData.features) ? characterData.features : [];
  return feats.some(f => {
    const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
    const norm = normalizeTraitName(fName).toLowerCase();
    const raw = fName.toLowerCase();
    return norm === targetNorm || raw === targetRaw || (targetNorm.length > 3 && (norm.includes(targetNorm) || targetNorm.includes(norm)));
  });
};

// Check if a disadvantage is active on characterData
const getDisadvantageActiveStatus = (disRef, characterData) => {
  if (!disRef) return false;
  const targetNorm = normalizeTraitName(disRef).toLowerCase();
  const targetRaw = (typeof disRef === 'object' ? (disRef.name || disRef.id || '') : String(disRef)).toLowerCase();

  const disList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
  return disList.some(d => {
    const dName = typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d);
    const norm = normalizeTraitName(dName).toLowerCase();
    const raw = dName.toLowerCase();
    return norm === targetNorm || raw === targetRaw || (targetNorm.length > 3 && (norm.includes(targetNorm) || targetNorm.includes(norm)));
  });
};

const IdentityTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField, applyArchetypeChassis, applySpeciesAdjustments } = useFolio();
  const dbm = useDBM();

  const [dbOptions, setDbOptions] = useState({});
  const [manualMode, setManualMode] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [inspectItem, setInspectItem] = useState(null);

  const toggleCard = (key) => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));

  const handleInspectItem = (item, categoryKey, title) => {
    if (!item) return;
    setInspectItem({ item, categoryKey, title: title || item.name || item.title || 'Entry Details' });
  };

  useEffect(() => {
    const paths = ['species', 'occupations', 'origins', 'factions', 'archetypes'];
    const unsubs = paths.map(path => {
      try {
        const colRef = collection(db, path);
        return onSnapshot(colRef, (snap) => {
          const items = snap.docs.map(doc => ({ name: doc.data().name || doc.id, ...doc.data(), id: doc.id }));
          setDbOptions(prev => ({ ...prev, [path]: items }));
        }, (e) => {
          console.warn(`Failed to load ${path} options`, e);
          setDbOptions(prev => ({ ...prev, [path]: [] }));
        });
      } catch (err) {
        console.warn(`Failed to subscribe to ${path}`, err);
        return () => {};
      }
    });

    return () => {
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  useEffect(() => {
    // Automatically set manual mode if value doesn't match dbOptions
    if (Object.keys(dbOptions).length > 0) {
      let changed = false;

      setManualMode((prev) => {
        const newManualModes = { ...prev };
        const checkField = (id, browsePath) => {
          const val = characterData[id];
          if (val && typeof val === 'string' && val.trim() !== '') {
             const options = dbOptions[browsePath] || [];
             const matches = options.some(opt => opt.name === val);
             if (!matches && !newManualModes[id]) {
               newManualModes[id] = true;
               changed = true;
             }
          }
        };

        checkField('char-archetype', 'archetypes');
        checkField('char-species', 'species');
        checkField('char-occu', 'occupations');
        checkField('char-origin', 'origins');
        checkField('char-faction', 'factions');

        return changed ? newManualModes : prev;
      });
    }
  }, [characterData, dbOptions]);

  // Selected Archetype Object lookup
  const selectedArchetype = useMemo(() => {
    const archName = characterData['char-archetype'];
    if (!archName) return null;
    const allArch = (dbOptions.archetypes && dbOptions.archetypes.length > 0) ? dbOptions.archetypes : DEFAULT_ARCHETYPES;
    return allArch.find(a => (a.name || a.id || '').toLowerCase() === String(archName).toLowerCase()) || null;
  }, [characterData['char-archetype'], dbOptions.archetypes]);

  // Selected Species Object lookup
  const selectedSpecies = useMemo(() => {
    const spName = characterData['char-species'];
    if (!spName) return null;
    const allSpecies = (dbOptions.species && dbOptions.species.length > 0) ? dbOptions.species : DEFAULT_SPECIES;
    return allSpecies.find(s => (s.name || s.title || s.id || '').toLowerCase() === String(spName).toLowerCase()) || null;
  }, [characterData['char-species'], dbOptions.species]);

  // Selected Occupation Object lookup
  const selectedOccupation = useMemo(() => {
    const occName = characterData['char-occu'];
    if (!occName) return null;
    const list = (dbOptions.occupations && dbOptions.occupations.length > 0)
      ? dbOptions.occupations
      : ((dbm?.dbData?.occupations && dbm.dbData.occupations.length > 0) ? dbm.dbData.occupations : DEFAULT_OCCUPATIONS);
    return list.find(o => (o.name || o.title || o.id || '').toLowerCase() === String(occName).toLowerCase()) || null;
  }, [characterData['char-occu'], dbOptions.occupations, dbm?.dbData?.occupations]);

  // Selected Origin Object lookup
  const selectedOrigin = useMemo(() => {
    const origName = characterData['char-origin'];
    if (!origName) return null;
    const list = (dbOptions.origins && dbOptions.origins.length > 0)
      ? dbOptions.origins
      : ((dbm?.dbData?.origins && dbm.dbData.origins.length > 0) ? dbm.dbData.origins : DEFAULT_ORIGINS);
    return list.find(o => (o.name || o.title || o.id || '').toLowerCase() === String(origName).toLowerCase()) || null;
  }, [characterData['char-origin'], dbOptions.origins, dbm?.dbData?.origins]);

  // Selected Faction Object lookup
  const selectedFaction = useMemo(() => {
    const facName = characterData['char-faction'];
    if (!facName) return null;
    const list = (dbOptions.factions && dbOptions.factions.length > 0)
      ? dbOptions.factions
      : ((dbm?.dbData?.factions && dbm.dbData.factions.length > 0) ? dbm.dbData.factions : DEFAULT_FACTIONS);
    return list.find(f => (f.name || f.title || f.id || '').toLowerCase() === String(facName).toLowerCase()) || null;
  }, [characterData['char-faction'], dbOptions.factions, dbm?.dbData?.factions]);

  // Chosen Occupation Traits from characterData
  const chosenOccupationTraits = useMemo(() => {
    if (!selectedOccupation) return [];
    const availableTraits = Array.isArray(selectedOccupation.traits) 
      ? selectedOccupation.traits 
      : (Array.isArray(selectedOccupation.trait) ? selectedOccupation.trait : []);
    const normalizedAvailable = new Set(availableTraits.map(t => normalizeTraitName(t).toLowerCase()));

    const chosen = new Set();
    const feats = Array.isArray(characterData.features) ? characterData.features : [];
    feats.forEach(f => {
      const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
      const fCat = typeof f === 'object' ? (f.category || '') : '';
      const normName = normalizeTraitName(fName);
      if (
        fCat.toLowerCase().includes('occupation') || 
        normalizedAvailable.has(normName.toLowerCase()) || 
        normalizedAvailable.has(fName.toLowerCase())
      ) {
        chosen.add(normName || fName);
      }
    });

    const explicit = characterData['char-occu-traits'] || characterData.occu_traits;
    if (Array.isArray(explicit)) {
      explicit.forEach(t => chosen.add(normalizeTraitName(t)));
    } else if (typeof explicit === 'string' && explicit.trim()) {
      explicit.split(',').forEach(t => chosen.add(normalizeTraitName(t.trim())));
    }

    if (Array.isArray(characterData.occuAllocations?.features)) {
      characterData.occuAllocations.features.forEach(t => chosen.add(normalizeTraitName(t)));
    }

    return Array.from(chosen);
  }, [selectedOccupation, characterData.features, characterData['char-occu-traits'], characterData.occu_traits, characterData.occuAllocations]);

  // Chosen Origin Traits from characterData
  const chosenOriginTraits = useMemo(() => {
    if (!selectedOrigin) return [];
    const availableTraits = Array.isArray(selectedOrigin.traits) 
      ? selectedOrigin.traits 
      : (Array.isArray(selectedOrigin.trait) ? selectedOrigin.trait : []);
    const normalizedAvailable = new Set(availableTraits.map(t => normalizeTraitName(t).toLowerCase()));

    const chosen = new Set();
    const feats = Array.isArray(characterData.features) ? characterData.features : [];
    feats.forEach(f => {
      const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
      const fCat = typeof f === 'object' ? (f.category || '') : '';
      const normName = normalizeTraitName(fName);
      if (
        fCat.toLowerCase().includes('origin') || 
        normalizedAvailable.has(normName.toLowerCase()) || 
        normalizedAvailable.has(fName.toLowerCase())
      ) {
        chosen.add(normName || fName);
      }
    });

    const explicit = characterData['char-origin-traits'] || characterData.origin_traits;
    if (Array.isArray(explicit)) {
      explicit.forEach(t => chosen.add(normalizeTraitName(t)));
    } else if (typeof explicit === 'string' && explicit.trim()) {
      explicit.split(',').forEach(t => chosen.add(normalizeTraitName(t.trim())));
    }

    if (Array.isArray(characterData.originAllocations?.features)) {
      characterData.originAllocations.features.forEach(t => chosen.add(normalizeTraitName(t)));
    }

    return Array.from(chosen);
  }, [selectedOrigin, characterData.features, characterData['char-origin-traits'], characterData.origin_traits, characterData.originAllocations]);

  // Faction Benefits & Hindrances
  const { factionBenefits, factionHindrances } = useMemo(() => {
    if (!selectedFaction) return { factionBenefits: [], factionHindrances: [] };

    const benefits = new Set();
    const hindrances = new Set();

    // 1. Direct properties on selectedFaction
    const rawBonus = selectedFaction.bonus_features || selectedFaction.bonusFeatures || selectedFaction.benefits;
    if (Array.isArray(rawBonus)) {
      rawBonus.forEach(b => benefits.add(typeof b === 'object' ? (b.name || b.id) : String(b)));
    } else if (typeof rawBonus === 'string' && rawBonus.trim()) {
      rawBonus.split(',').forEach(b => benefits.add(b.trim()));
    }

    if (selectedFaction.social_strengths) {
      benefits.add(String(selectedFaction.social_strengths).trim());
    }

    const rawHind = selectedFaction.hindrances || selectedFaction.disadvantages || selectedFaction.social_weaknesses;
    if (Array.isArray(rawHind)) {
      rawHind.forEach(h => hindrances.add(typeof h === 'object' ? (h.name || h.id) : String(h)));
    } else if (typeof rawHind === 'string' && rawHind.trim()) {
      rawHind.split(',').forEach(h => hindrances.add(h.trim()));
    }

    if (Array.isArray(selectedFaction.modifiers)) {
      selectedFaction.modifiers.forEach(m => {
        const val = typeof m === 'object' ? (m.value ?? 1) : 1;
        const desc = typeof m === 'object' ? (m.name || m.description || `${m.aspect || 'Modifier'} ${val > 0 ? `+${val}` : val}`) : String(m);
        if (Number(val) < 0) {
          hindrances.add(desc);
        } else {
          benefits.add(desc);
        }
      });
    }

    // 2. Acquired character features / disadvantages associated with faction
    const feats = Array.isArray(characterData.features) ? characterData.features : [];
    feats.forEach(f => {
      const fCat = typeof f === 'object' ? (f.category || '') : '';
      const fName = typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f);
      if (fCat.toLowerCase().includes('faction') || fName.toLowerCase().startsWith('benefit (')) {
        benefits.add(`[Gained] ${fName}`);
      }
    });

    const disList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disList.forEach(d => {
      const dCat = typeof d === 'object' ? (d.category || '') : '';
      const dName = typeof d === 'object' ? (d.name || d.title || d.id || '') : String(d);
      if (dCat.toLowerCase().includes('faction')) {
        hindrances.add(`[Gained] ${dName}`);
      }
    });

    return {
      factionBenefits: Array.from(benefits),
      factionHindrances: Array.from(hindrances)
    };
  }, [selectedFaction, characterData.features, characterData.disadvantages]);

  const handleSpeciesChange = (value) => {
    updateField('char-species', value);
    if (!value) return;
    const allSpecies = (dbOptions.species && dbOptions.species.length > 0) ? dbOptions.species : DEFAULT_SPECIES;
    const found = allSpecies.find(s => s.name === value || s.title === value || s.id === value);
    if (found && applySpeciesAdjustments) {
      applySpeciesAdjustments(found);
    }
  };

  const handleArchetypeChange = (value) => {
    updateField('char-archetype', value);
  };

  return (
    <div className="tab-panel active p-4 space-y-6 pb-20">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <FolioInput
            id="char-name"
            label="Character Name"
            value={characterData['char-name'] || ''}
            onChange={updateField}
            placeholder="Enter Character Name..."
          />

          <FolioInput
            id="char-concept"
            label="Concept"
            value={characterData['char-concept'] || ''}
            onChange={updateField}
            placeholder="Enter Character Concept..."
          />

          {/* 1. Consolidated Archetype Card */}
          {(() => {
            const fieldId = 'char-archetype';
            const label = 'Archetype';
            const browsePath = 'archetypes';
            const val = characterData[fieldId] || '';
            const isManual = Boolean(manualMode[fieldId]);
            const isExpanded = Boolean(expandedCards['archetype']);
            const essentialSkills = extractNameList(selectedArchetype?.essential_skills);
            const signatureFeatures = extractNameList(selectedArchetype?.signature_features);

            return (
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-lg overflow-hidden transition-all shadow-[0_0_10px_rgba(245,158,11,0.08)]">
                {/* Consolidated Header Bar */}
                <div
                  onClick={() => {
                    if (val && selectedArchetype) {
                      toggleCard('archetype');
                    } else if (onOpenSelectorModal) {
                      onOpenSelectorModal(fieldId, label, browsePath);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 select-none transition-colors cursor-pointer ${
                    val ? 'hover:bg-amber-950/30 bg-amber-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base shrink-0">🛡️</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-500/50 text-amber-300 shrink-0">
                      {label}
                    </span>
                    {val ? (
                      <span className="text-xs font-bold font-mono uppercase text-amber-400 truncate">
                        {val}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400/80 italic truncate">
                        None Selected <span className="text-slate-600 hidden sm:inline">(Optional)</span>
                      </span>
                    )}
                    {selectedArchetype?.sphere && val && (
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden md:inline">
                        • 80 CP Blueprint ({selectedArchetype.sphere})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                          val
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300 hover:text-amber-100 hover:border-amber-400'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-200 hover:text-white shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                        }`}
                        title="Open sorted Archetype catalog"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{val ? 'Change' : 'Select'}</span>
                      </button>
                    )}

                    {val && (
                      <button
                        type="button"
                        onClick={() => updateField(fieldId, '')}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isManual ? 'bg-slate-800 border-amber-500 text-amber-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle custom text input"
                    >
                      {isManual ? 'Custom' : 'Text'}
                    </button>

                    {selectedArchetype && (
                      <button
                        type="button"
                        onClick={() => handleInspectItem(selectedArchetype, browsePath, `Archetype: ${selectedArchetype.name}`)}
                        className="p-1 rounded text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="View entire archetype database entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedArchetype && (
                      <button
                        type="button"
                        onClick={() => toggleCard('archetype')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse summary" : "Expand summary"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Text Edit Field */}
                {isManual && (
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Archetype:</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleArchetypeChange(e.target.value)}
                      placeholder="Enter custom archetype concept..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Accordion Body */}
                {selectedArchetype && isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {selectedArchetype.core_concept || selectedArchetype.summary || selectedArchetype.tactical_role || 'Chassis Blueprint'}
                      </span>
                      {applyArchetypeChassis && (
                        <button
                          type="button"
                          onClick={() => applyArchetypeChassis(selectedArchetype)}
                          className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1 shrink-0 ml-2"
                          title="Apply 80 CP Archetype Pre-build: +3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Features"
                        >
                          <span>⚡</span> Apply 80 CP Pre-build
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Primary:</span> <strong className="text-amber-300">{selectedArchetype.primary_attribute || 'Strength'} (+3)</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Secondary:</span> <strong className="text-amber-300">{selectedArchetype.secondary_attribute || 'Agility'} (+2)</strong>
                      </div>
                    </div>

                    {/* Essential Skills (Options & Selections) */}
                    {essentialSkills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                          Essential Skills (Rank 6 Blueprint Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {essentialSkills.map(skName => {
                            const status = getSkillTrainingStatus(skName, characterData);
                            return (
                              <span
                                key={skName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  status.isTrained
                                    ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 font-bold'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Signature Features (Options & Selections) */}
                    {signatureFeatures.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                          Signature Features (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {signatureFeatures.map(fName => {
                            const acquired = getFeatureAcquiredStatus(fName, characterData);
                            return (
                              <span
                                key={fName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  acquired
                                    ? 'bg-amber-950/80 border-amber-500/70 text-amber-200 font-bold'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {fName} {acquired ? '✓' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Consolidated Species Card */}
          {(() => {
            const fieldId = 'char-species';
            const label = 'Species';
            const browsePath = 'species';
            const val = characterData[fieldId] || '';
            const isManual = Boolean(manualMode[fieldId]);
            const isExpanded = Boolean(expandedCards['species']);
            const inherentFeatures = extractNameList(selectedSpecies?.inherent_features);
            const bonusFeatureChoices = extractNameList(selectedSpecies?.bonus_feature_choices);
            const bonusSkillChoices = extractNameList(selectedSpecies?.bonus_skill_choices);
            const attrMods = Array.isArray(selectedSpecies?.inherent_attribute_modifiers) ? selectedSpecies.inherent_attribute_modifiers : [];
            const skillBonuses = Array.isArray(selectedSpecies?.specific_skill_bonuses) ? selectedSpecies.specific_skill_bonuses : [];

            return (
              <div className="bg-slate-950/90 border border-cyan-500/40 rounded-lg overflow-hidden transition-all shadow-[0_0_10px_rgba(34,211,238,0.08)]">
                {/* Consolidated Header Bar */}
                <div
                  onClick={() => {
                    if (val && selectedSpecies) {
                      toggleCard('species');
                    } else if (onOpenSelectorModal) {
                      onOpenSelectorModal(fieldId, label, browsePath);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 select-none transition-colors cursor-pointer ${
                    val ? 'hover:bg-cyan-950/30 bg-cyan-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base shrink-0">🧬</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shrink-0">
                      {label}
                    </span>
                    {val ? (
                      <span className="text-xs font-bold font-mono uppercase text-cyan-400 truncate">
                        {val}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400/80 italic truncate">
                        None Selected <span className="text-cyan-500/70 hidden sm:inline">(Required)</span>
                      </span>
                    )}
                    {selectedSpecies?.parent_species && val && (
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden md:inline">
                        • Lineage: {selectedSpecies.parent_species}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                          val
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-200 hover:text-white shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                        }`}
                        title="Open sorted Species catalog"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{val ? 'Change' : 'Select'}</span>
                      </button>
                    )}

                    {val && (
                      <button
                        type="button"
                        onClick={() => updateField(fieldId, '')}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isManual ? 'bg-slate-800 border-cyan-500 text-cyan-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle custom text input"
                    >
                      {isManual ? 'Custom' : 'Text'}
                    </button>

                    {selectedSpecies && (
                      <button
                        type="button"
                        onClick={() => handleInspectItem(selectedSpecies, browsePath, `Species: ${selectedSpecies.name || selectedSpecies.title}`)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="View entire species database entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedSpecies && (
                      <button
                        type="button"
                        onClick={() => toggleCard('species')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse summary" : "Expand summary"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Text Edit Field */}
                {isManual && (
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Species:</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleSpeciesChange(e.target.value)}
                      placeholder="Enter custom species name..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Accordion Body */}
                {selectedSpecies && isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/60">
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono bg-slate-900/60 p-2 rounded border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Lineage:</span> <strong className="text-cyan-300">{selectedSpecies.parent_species || 'Species'}</strong>
                      </div>
                      {selectedSpecies.type && (
                        <div>
                          <span className="text-slate-500">Type:</span> <strong className="text-cyan-300">{formatList(selectedSpecies.type)}</strong>
                        </div>
                      )}
                      {selectedSpecies.size && (
                        <div>
                          <span className="text-slate-500">Size:</span> <strong className="text-cyan-300">{formatList(selectedSpecies.size)}</strong>
                        </div>
                      )}
                      {selectedSpecies.movement && (
                        <div>
                          <span className="text-slate-500">Movement:</span> <strong className="text-cyan-300">{formatList(selectedSpecies.movement)}</strong>
                        </div>
                      )}
                    </div>

                    {attrMods.length > 0 && (
                      <div className="text-[10px] font-mono">
                        <span className="text-cyan-400 font-bold uppercase block mb-1">Inherent Attribute Adjustments:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {attrMods.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 font-bold">
                              {m.attribute}: {Number(m.bonus) > 0 ? `+${m.bonus}` : m.bonus}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {inherentFeatures.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-cyan-400 font-bold uppercase block">Inherent Guaranteed Traits:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {inherentFeatures.map(featName => (
                            <span key={featName} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 font-semibold flex items-center gap-1">
                              <span>🧬</span>
                              <span>{featName} ✓</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {skillBonuses.length > 0 && (
                      <div className="text-[10px] font-mono">
                        <span className="text-cyan-400 font-bold uppercase block mb-1">Specific Skill Bonuses:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skillBonuses.map((sb, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-900/60 text-cyan-300">
                              {sb.skill}: +{sb.bonus}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {bonusFeatureChoices.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-cyan-400 font-bold uppercase block">
                          Bonus Feature Choices (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {bonusFeatureChoices.map(fName => {
                            const acquired = getFeatureAcquiredStatus(fName, characterData);
                            return (
                              <span
                                key={fName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  acquired
                                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {fName} {acquired ? '✓' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {bonusSkillChoices.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-cyan-400 font-bold uppercase block">
                          Species Skill Choices (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {bonusSkillChoices.map(skName => {
                            const status = getSkillTrainingStatus(skName, characterData);
                            return (
                              <span
                                key={skName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  status.isTrained
                                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 font-bold'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSpecies.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-800/60">
                        {selectedSpecies.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 3. Consolidated Occupation Card */}
          {(() => {
            const fieldId = 'char-occu';
            const label = 'Occupation';
            const browsePath = 'occupations';
            const val = characterData[fieldId] || '';
            const isManual = Boolean(manualMode[fieldId]);
            const isExpanded = Boolean(expandedCards['occupation']);
            const profSkills = extractNameList(selectedOccupation?.professional_skills || selectedOccupation?.skills);
            const occTraits = extractNameList(selectedOccupation?.traits || selectedOccupation?.trait);

            return (
              <div className="bg-slate-950/90 border border-sky-500/40 rounded-lg overflow-hidden transition-all shadow-[0_0_10px_rgba(14,165,233,0.08)]">
                {/* Consolidated Header Bar */}
                <div
                  onClick={() => {
                    if (val && selectedOccupation) {
                      toggleCard('occupation');
                    } else if (onOpenSelectorModal) {
                      onOpenSelectorModal(fieldId, label, browsePath);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 select-none transition-colors cursor-pointer ${
                    val ? 'hover:bg-sky-950/30 bg-sky-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base shrink-0">🛠️</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-sky-950/80 border border-sky-500/50 text-sky-300 shrink-0">
                      {label}
                    </span>
                    {val ? (
                      <span className="text-xs font-bold font-mono uppercase text-sky-400 truncate">
                        {val}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400/80 italic truncate">
                        None Selected
                      </span>
                    )}
                    {val && (
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden md:inline">
                        • {selectedOccupation?.skill_points ? `${selectedOccupation.skill_points} SP Pool` : 'Career'}
                        {selectedOccupation?.tech_level !== undefined ? ` (TL ${selectedOccupation.tech_level})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                          val
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-sky-300 hover:text-sky-100 hover:border-sky-400'
                            : 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-500/60 text-sky-200 hover:text-white shadow-[0_0_10px_rgba(14,165,233,0.25)]'
                        }`}
                        title="Open sorted Occupation catalog"
                      >
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{val ? 'Change' : 'Select'}</span>
                      </button>
                    )}

                    {val && (
                      <button
                        type="button"
                        onClick={() => updateField(fieldId, '')}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isManual ? 'bg-slate-800 border-sky-500 text-sky-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle custom text input"
                    >
                      {isManual ? 'Custom' : 'Text'}
                    </button>

                    {selectedOccupation && (
                      <button
                        type="button"
                        onClick={() => handleInspectItem(selectedOccupation, browsePath, `Occupation: ${selectedOccupation.name || selectedOccupation.title}`)}
                        className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                        title="View entire occupation database entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedOccupation && (
                      <button
                        type="button"
                        onClick={() => toggleCard('occupation')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse summary" : "Expand summary"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Text Edit Field */}
                {isManual && (
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Occupation:</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateField(fieldId, e.target.value)}
                      placeholder="Enter custom occupation name..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-sky-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Accordion Body */}
                {selectedOccupation && isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/60">
                    {profSkills.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-sky-400 font-bold uppercase block">
                          Professional Skills (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {profSkills.map(skName => {
                            const status = getSkillTrainingStatus(skName, characterData);
                            return (
                              <span
                                key={skName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  status.isTrained
                                    ? 'bg-sky-950/90 border-sky-400 text-sky-100 font-bold shadow-[0_0_8px_rgba(14,165,233,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {occTraits.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-sky-400 font-bold uppercase block">
                          Occupation Traits (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {occTraits.map(tRef => {
                            const acquired = getFeatureAcquiredStatus(tRef, characterData);
                            const tTitle = normalizeTraitName(tRef);
                            return (
                              <span
                                key={tTitle}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  acquired
                                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {tTitle} {acquired ? '✓' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedOccupation.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-800/60">
                        {selectedOccupation.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 4. Consolidated Origin Card */}
          {(() => {
            const fieldId = 'char-origin';
            const label = 'Origin';
            const browsePath = 'origins';
            const val = characterData[fieldId] || '';
            const isManual = Boolean(manualMode[fieldId]);
            const isExpanded = Boolean(expandedCards['origin']);
            const socSkills = extractNameList(selectedOrigin?.society_skills);
            const origTraits = extractNameList(selectedOrigin?.traits || selectedOrigin?.trait);

            return (
              <div className="bg-slate-950/90 border border-emerald-500/40 rounded-lg overflow-hidden transition-all shadow-[0_0_10px_rgba(16,185,129,0.08)]">
                {/* Consolidated Header Bar */}
                <div
                  onClick={() => {
                    if (val && selectedOrigin) {
                      toggleCard('origin');
                    } else if (onOpenSelectorModal) {
                      onOpenSelectorModal(fieldId, label, browsePath);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 select-none transition-colors cursor-pointer ${
                    val ? 'hover:bg-emerald-950/30 bg-emerald-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base shrink-0">🌍</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shrink-0">
                      {label}
                    </span>
                    {val ? (
                      <span className="text-xs font-bold font-mono uppercase text-emerald-400 truncate">
                        {val}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400/80 italic truncate">
                        None Selected
                      </span>
                    )}
                    {val && (
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden md:inline">
                        • {selectedOrigin?.skill_points ? `${selectedOrigin.skill_points} SP Society Pool` : 'Homeworld'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                          val
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300 hover:text-emerald-100 hover:border-emerald-400'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/60 text-emerald-200 hover:text-white shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        }`}
                        title="Open sorted Origin catalog"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{val ? 'Change' : 'Select'}</span>
                      </button>
                    )}

                    {val && (
                      <button
                        type="button"
                        onClick={() => updateField(fieldId, '')}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isManual ? 'bg-slate-800 border-emerald-500 text-emerald-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle custom text input"
                    >
                      {isManual ? 'Custom' : 'Text'}
                    </button>

                    {selectedOrigin && (
                      <button
                        type="button"
                        onClick={() => handleInspectItem(selectedOrigin, browsePath, `Origin: ${selectedOrigin.name || selectedOrigin.title}`)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        title="View entire origin database entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedOrigin && (
                      <button
                        type="button"
                        onClick={() => toggleCard('origin')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse summary" : "Expand summary"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Text Edit Field */}
                {isManual && (
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Origin:</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateField(fieldId, e.target.value)}
                      placeholder="Enter custom origin homeworld name..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Accordion Body */}
                {selectedOrigin && isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/60">
                    {socSkills.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-emerald-400 font-bold uppercase block">
                          Society Skills (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {socSkills.map(skName => {
                            const status = getSkillTrainingStatus(skName, characterData);
                            return (
                              <span
                                key={skName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  status.isTrained
                                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {origTraits.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-emerald-400 font-bold uppercase block">
                          Homeworld Traits (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {origTraits.map(tRef => {
                            const acquired = getFeatureAcquiredStatus(tRef, characterData);
                            const tTitle = normalizeTraitName(tRef);
                            return (
                              <span
                                key={tTitle}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  acquired
                                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 font-bold shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {tTitle} {acquired ? '✓' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedOrigin.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-800/60">
                        {selectedOrigin.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. Consolidated Faction Card */}
          {(() => {
            const fieldId = 'char-faction';
            const label = 'Faction';
            const browsePath = 'factions';
            const val = characterData[fieldId] || '';
            const isManual = Boolean(manualMode[fieldId]);
            const isExpanded = Boolean(expandedCards['faction']);
            const pkgSkills = extractNameList(selectedFaction?.skill_package || selectedFaction?.skills);

            return (
              <div className="bg-slate-950/90 border border-purple-500/40 rounded-lg overflow-hidden transition-all shadow-[0_0_10px_rgba(168,85,247,0.08)]">
                {/* Consolidated Header Bar */}
                <div
                  onClick={() => {
                    if (val && selectedFaction) {
                      toggleCard('faction');
                    } else if (onOpenSelectorModal) {
                      onOpenSelectorModal(fieldId, label, browsePath);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 select-none transition-colors cursor-pointer ${
                    val ? 'hover:bg-purple-950/30 bg-purple-950/20' : 'hover:bg-slate-900/80 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-base shrink-0">🏛️</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 border border-purple-500/50 text-purple-300 shrink-0">
                      {label}
                    </span>
                    {val ? (
                      <span className="text-xs font-bold font-mono uppercase text-purple-400 truncate">
                        {val}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400/80 italic truncate">
                        None Selected
                      </span>
                    )}
                    {val && (
                      <span className="text-[10px] font-mono text-slate-400 truncate hidden md:inline">
                        • {selectedFaction?.archetype || selectedFaction?.faction_type || 'Allegiance'}
                        {selectedFaction?.tech_level !== undefined ? ` (TL ${selectedFaction.tech_level})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onOpenSelectorModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSelectorModal(fieldId, label, browsePath)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1 cursor-pointer ${
                          val
                            ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-purple-300 hover:text-purple-100 hover:border-purple-400'
                            : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/60 text-purple-200 hover:text-white shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                        }`}
                        title="Open sorted Faction catalog"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>{val ? 'Change' : 'Select'}</span>
                      </button>
                    )}

                    {val && (
                      <button
                        type="button"
                        onClick={() => updateField(fieldId, '')}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setManualMode(prev => ({ ...prev, [fieldId]: !prev[fieldId] }))}
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        isManual ? 'bg-slate-800 border-purple-500 text-purple-300' : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle custom text input"
                    >
                      {isManual ? 'Custom' : 'Text'}
                    </button>

                    {selectedFaction && (
                      <button
                        type="button"
                        onClick={() => handleInspectItem(selectedFaction, browsePath, `Faction: ${selectedFaction.name || selectedFaction.title}`)}
                        className="p-1 rounded text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                        title="View entire faction database entry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedFaction && (
                      <button
                        type="button"
                        onClick={() => toggleCard('faction')}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse summary" : "Expand summary"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Manual Text Edit Field */}
                {isManual && (
                  <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">Custom Faction:</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateField(fieldId, e.target.value)}
                      placeholder="Enter custom faction allegiance name..."
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded px-2.5 py-1 text-xs text-slate-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Accordion Body */}
                {selectedFaction && isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs bg-slate-950/60">
                    {(selectedFaction.driving_mandate || selectedFaction.mandate) && (
                      <div className="text-[11px] text-slate-300 italic font-mono bg-purple-950/30 p-2 rounded border border-purple-900/50">
                        <span className="text-purple-400 not-italic font-bold">Mandate:</span> "{selectedFaction.driving_mandate || selectedFaction.mandate}"
                      </div>
                    )}

                    {/* Faction Skill Package (Options & Selections) */}
                    {pkgSkills.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-purple-400 font-bold uppercase block">
                          Faction Skill Package (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pkgSkills.map(skName => {
                            const status = getSkillTrainingStatus(skName, characterData);
                            return (
                              <span
                                key={skName}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  status.isTrained
                                    ? 'bg-purple-950/90 border-purple-400 text-purple-100 font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {skName} {status.isTrained ? `[Rank ${status.rank}] ✓` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Benefits & Bonuses (Options & Selections) */}
                    {factionBenefits.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-emerald-400 font-bold uppercase block">
                          Benefits & Bonuses (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {factionBenefits.map((ben, idx) => {
                            const acquired = ben.startsWith('[Gained]') || getFeatureAcquiredStatus(ben, characterData);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  acquired
                                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {ben} {acquired ? '✓' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Hindrances & Restrictions (Options & Selections) */}
                    {factionHindrances.length > 0 && (
                      <div className="text-[10px] font-mono space-y-1">
                        <span className="text-rose-400 font-bold uppercase block">
                          Hindrances & Restrictions (Options & Selections):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {factionHindrances.map((hind, idx) => {
                            const active = hind.startsWith('[Gained]') || getDisadvantageActiveStatus(hind, characterData);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                  active
                                    ? 'bg-rose-950/90 border-rose-400 text-rose-100 font-bold shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                                }`}
                              >
                                {hind} {active ? '⚠' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedFaction.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-800/60">
                        {selectedFaction.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FolioInput
              id="char-age"
              label="Age"
              value={characterData['char-age'] || ''}
              onChange={updateField}
              placeholder="28"
            />

            <FolioInput
              id="char-gender"
              label="Gender"
              value={characterData['char-gender'] || ''}
              onChange={updateField}
              placeholder="Non-Binary / Female / Male"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FolioInput
              id="char-height"
              label="Height"
              value={characterData['char-height'] || ''}
              onChange={updateField}
              onBlur={(id, val) => {
                const formatted = formatHeightWithConversion(val);
                if (formatted !== val) {
                  updateField(id, formatted);
                }
              }}
              placeholder="e.g. 5'11&quot; or 1.80m"
              rightLabel={
                (() => {
                  const val = characterData['char-height'] || '';
                  const conv = getHeightConversion(val);
                  if (conv && !val.includes(`[${conv}]`)) {
                    return `≈ [${conv}]`;
                  }
                  return null;
                })()
              }
            />

            <FolioInput
              id="char-weight"
              label="Weight"
              value={characterData['char-weight'] || ''}
              onChange={updateField}
              onBlur={(id, val) => {
                const formatted = formatWeightWithConversion(val);
                if (formatted !== val) {
                  updateField(id, formatted);
                }
              }}
              placeholder="e.g. 180 lbs or 82kg"
              rightLabel={
                (() => {
                  const val = characterData['char-weight'] || '';
                  const conv = getWeightConversion(val);
                  if (conv && !val.includes(`[${conv}]`)) {
                    return `≈ [${conv}]`;
                  }
                  return null;
                })()
              }
            />
          </div>

          <FolioInput
            id="char-style"
            label="Description / Style"
            type="textarea"
            value={characterData['char-style'] || ''}
            onChange={updateField}
            placeholder="Physical features, clothing style, distinctive markings..."
          />

          <FolioInput
            id="char-motive"
            label="Personality / Motive"
            type="textarea"
            value={characterData['char-motive'] || ''}
            onChange={updateField}
            placeholder="Personal goals, flaws, motivations, quirks..."
          />

          {/* Creator & Contributors Identification */}
          {(() => {
            const creatorInfo = extractCreatorInfo(characterData, typeof window !== 'undefined' ? localStorage.getItem('userHandle') : '');
            return (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Creator &amp; Contributor Identification
                </label>
                <div className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Creator:</span>
                      <span className="px-2.5 py-0.5 bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 rounded-md text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                        <span>🏷️</span>
                        <span>{creatorInfo.creatorTag}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      (Auto-populated from Settings)
                    </span>
                  </div>
                  {creatorInfo.contributorTags && creatorInfo.contributorTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contributors:</span>
                      {creatorInfo.contributorTags.map((contrib, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-md text-[11px] font-mono font-bold">
                          {contrib}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Comprehensive Full Database Entry Inspector Modal */}
      {inspectItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          onClick={() => setInspectItem(null)}
        >
          <div 
            className="bg-slate-900 border border-cyan-500/60 rounded-xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] text-slate-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                    {inspectItem.categoryKey}
                  </span>
                  {inspectItem.item.id && (
                    <span className="text-[10px] font-mono text-slate-500">
                      #{inspectItem.item.id}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                  <span>{inspectItem.item.name || inspectItem.item.title || inspectItem.title}</span>
                </h2>
                {inspectItem.item.parent_species && (
                  <p className="text-xs text-cyan-400/90 font-mono">
                    Lineage: {inspectItem.item.parent_species}
                  </p>
                )}
                {inspectItem.item.sphere && (
                  <p className="text-xs text-amber-400/90 font-mono">
                    Sphere: {inspectItem.item.sphere}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onOpenAssetModal && (
                  <button
                    type="button"
                    onClick={() => {
                      const itemToEdit = inspectItem.item;
                      const colKey = inspectItem.categoryKey;
                      const modalTitle = inspectItem.title;
                      setInspectItem(null);
                      onOpenAssetModal(colKey, modalTitle, 'edit', null, itemToEdit);
                    }}
                    className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-amber-500/60 text-amber-300 hover:text-amber-100 transition-all flex items-center gap-1 cursor-pointer"
                    title="Edit database record"
                  >
                    <span>✏️</span>
                    <span className="hidden sm:inline">Edit in Database</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
              {/* Quote / Mandate */}
              {(inspectItem.item.quote || inspectItem.item.driving_mandate || inspectItem.item.mandate) && (
                <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 text-cyan-200 italic font-serif text-sm">
                  "{inspectItem.item.quote || inspectItem.item.driving_mandate || inspectItem.item.mandate}"
                </div>
              )}

              {/* Specification Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                {inspectItem.item.tech_level !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Tech Level</span>
                    <strong className="text-slate-200 font-mono">TL {inspectItem.item.tech_level}</strong>
                  </div>
                )}
                {inspectItem.item.meta_level !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Meta Level</span>
                    <strong className="text-slate-200 font-mono">ML {inspectItem.item.meta_level}</strong>
                  </div>
                )}
                {inspectItem.item.skill_points !== undefined && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Skill Points</span>
                    <strong className="text-cyan-300 font-mono">{inspectItem.item.skill_points} SP</strong>
                  </div>
                )}
                {inspectItem.item.capital_world && (
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Capital World</span>
                    <strong className="text-slate-200">{inspectItem.item.capital_world}</strong>
                  </div>
                )}
                {inspectItem.item.archetype && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Archetype / Focus</span>
                    <strong className="text-amber-300">{inspectItem.item.archetype}</strong>
                  </div>
                )}
              </div>

              {/* Lore / Description */}
              {(inspectItem.item.description || inspectItem.item.body || inspectItem.item.summary) && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
                    Comprehensive Dossier & Lore
                  </h4>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed whitespace-pre-line text-slate-300">
                    {inspectItem.item.description || inspectItem.item.body || inspectItem.item.summary}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {(() => {
                const allSkills = extractNameList(
                  inspectItem.item.professional_skills || 
                  inspectItem.item.society_skills || 
                  inspectItem.item.skill_package || 
                  inspectItem.item.essential_skills || 
                  inspectItem.item.bonus_skill_choices || 
                  inspectItem.item.skills
                );
                if (allSkills.length === 0) return null;

                return (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400">
                      Associated Skills ({allSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allSkills.map(sk => {
                        const status = getSkillTrainingStatus(sk, characterData);
                        return (
                          <span 
                            key={sk}
                            className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              status.isTrained
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {sk} {status.isTrained ? `[Trained Rank ${status.rank}] ✓` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Traits & Features Section */}
              {(() => {
                const allTraits = extractNameList(
                  inspectItem.item.inherent_features || 
                  inspectItem.item.signature_features || 
                  inspectItem.item.bonus_feature_choices || 
                  inspectItem.item.traits || 
                  inspectItem.item.trait || 
                  inspectItem.item.bonus_features || 
                  inspectItem.item.features
                );
                if (allTraits.length === 0) return null;

                return (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-amber-400">
                      Features, Traits & Bonuses ({allTraits.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allTraits.map(t => {
                        const acquired = getFeatureAcquiredStatus(t, characterData);
                        const tTitle = normalizeTraitName(t);
                        return (
                          <span 
                            key={tTitle}
                            className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              acquired
                                ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            {tTitle} {acquired ? '✓' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Faction Sociological Profile */}
              {inspectItem.categoryKey === 'factions' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-purple-400">
                    Sociological & Strategic Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {inspectItem.item.core_beliefs && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold block mb-0.5">Core Beliefs:</span>
                        <p className="text-slate-300">{inspectItem.item.core_beliefs}</p>
                      </div>
                    )}
                    {inspectItem.item.social_structure && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-purple-400 font-bold block mb-0.5">Social Structure:</span>
                        <p className="text-slate-300">{inspectItem.item.social_structure}</p>
                      </div>
                    )}
                    {inspectItem.item.social_strengths && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-emerald-400 font-bold block mb-0.5">Social Strengths:</span>
                        <p className="text-slate-300">{inspectItem.item.social_strengths}</p>
                      </div>
                    )}
                    {inspectItem.item.social_weaknesses && (
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-rose-400 font-bold block mb-0.5">Social Weaknesses:</span>
                        <p className="text-slate-300">{inspectItem.item.social_weaknesses}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mechanics & Rules Notes */}
              {(inspectItem.item.mechanic || inspectItem.item.note) && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
                    Mechanics & System Rules
                  </h4>
                  <p className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-slate-300 leading-relaxed font-mono text-[11px]">
                    {inspectItem.item.mechanic || inspectItem.item.note}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
              <span className="font-mono text-[10px]">
                {inspectItem.item.id ? `Record ID: ${inspectItem.item.id}` : 'Canonical Record'}
              </span>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(IdentityTab);
