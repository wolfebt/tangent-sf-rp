import React, { useState, useEffect, useMemo } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { X, ChevronRight, ChevronLeft, Check, Search, Shield, Target, User, Sparkles, BookOpen, Layers, Plus } from 'lucide-react';
import { DEFAULT_SKILLS } from '../../../data/skillsData';
import { DEFAULT_FEATURES, FEATURE_CATEGORIES } from '../../../data/featuresData';

const STEPS = [
  { id: 'concept', title: 'Concept & Identity', desc: 'Basic Biography' },
  { id: 'species', title: 'Species', desc: 'Biological Traits' },
  { id: 'origin', title: 'Origin & Faction', desc: 'Background & Affiliation' },
  { id: 'occupation', title: 'Occupation', desc: 'Career & Training' },
  { id: 'attributes', title: 'Core Stats', desc: 'Physical & Mental Aptitude' },
  { id: 'tech', title: 'Tech Level', desc: 'Advancement & Wealth' },
  { id: 'skills', title: 'Skills & Features', desc: 'Background & General Allocations' },
  { id: 'review', title: 'Review', desc: 'Final Check' }
];

const INITIAL_DRAFT = {
  'char-name': '',
  'char-concept': '',
  'char-age': '',
  'char-height': '',
  'char-weight': '',
  'char-species': '',
  'char-origin': '',
  'char-faction': '',
  'char-occu': '',
  strength: 0,
  agility: 0,
  stamina: 0,
  intellect: 0,
  wisdom: 0,
  charisma: 0,
  technologyLevel: 3, // Default is 3 (0 BP)
  skills: [],
  features: [],
  originAllocations: { skills: {}, features: [] },
  factionAllocations: { skills: {}, features: [] },
  occuAllocations: { skills: {}, features: [] },
  generalAllocations: { skills: {}, features: [] }
};

// Flatten canonical skills with structured category names
const ALL_CANONICAL_SKILLS = Object.entries(DEFAULT_SKILLS).flatMap(([groupKey, groupList]) =>
  groupList.flatMap(subgroup =>
    subgroup.skills.map(s => ({
      ...s,
      group: groupKey,
      subcategory: subgroup.title || 'General',
      groupLabel: groupKey.charAt(0).toUpperCase() + groupKey.slice(1) + (subgroup.title ? ` - ${subgroup.title}` : '')
    }))
  )
);

// Fallback collections fetcher with multi-path resilience
const fetchCollectionWithFallback = async (primaryPath, fallbackPath) => {
  try {
    const qSnap = await getDocs(collection(db, primaryPath));
    if (!qSnap.empty) {
      const items = [];
      qSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
      return items;
    }
  } catch (e) {
    // Primary path query failed, try fallback
  }

  if (fallbackPath) {
    try {
      const qSnap = await getDocs(collection(db, fallbackPath));
      if (!qSnap.empty) {
        const items = [];
        qSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
        return items;
      }
    } catch (e) {
      // Fallback query failed
    }
  }
  return [];
};

const GuidedCreatorModal = ({ isOpen, onClose }) => {
  const { applyGuidedCharacter } = useFolio();
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [bpRemaining, setBpRemaining] = useState(150);
  
  // Search & Filter state for step 7
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('All');

  // Data Caches
  const [dbData, setDbData] = useState({
    species: [],
    origins: [],
    factions: [],
    occupations: [],
    skills: ALL_CANONICAL_SKILLS,
    features: DEFAULT_FEATURES
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected object tracking
  const [selectedSpeciesObj, setSelectedSpeciesObj] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      Promise.all([
        fetchCollectionWithFallback('species', 'omnicortex/species/items'),
        fetchCollectionWithFallback('origins', 'omnicortex/origins/items'),
        fetchCollectionWithFallback('factions', 'omnicortex/factions/items'),
        fetchCollectionWithFallback('occupations', 'omnicortex/occupations/items'),
        fetchCollectionWithFallback('skills', 'omnicortex/skills/items'),
        fetchCollectionWithFallback('features', 'omnicortex/features/items')
      ]).then(([species, origins, factions, occupations, cloudSkills, cloudFeatures]) => {
        // Merge cloud skills with canonical defaults
        const skillMap = new Map();
        ALL_CANONICAL_SKILLS.forEach(s => skillMap.set(s.name.toLowerCase(), s));
        cloudSkills.forEach(s => {
          const name = s.name || s.title;
          if (name) skillMap.set(name.toLowerCase(), { ...s, name });
        });

        // Merge cloud features with canonical defaults
        const featureMap = new Map();
        DEFAULT_FEATURES.forEach(f => featureMap.set(f.name.toLowerCase(), f));
        cloudFeatures.forEach(f => {
          const name = f.name || f.title;
          if (name) featureMap.set(name.toLowerCase(), { ...f, name, cp: f.cp || 3 });
        });

        setDbData({
          species: species.length > 0 ? species : [],
          origins: origins.length > 0 ? origins : [],
          factions: factions.length > 0 ? factions : [],
          occupations: occupations.length > 0 ? occupations : [],
          skills: Array.from(skillMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
          features: Array.from(featureMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        });
        setIsLoadingData(false);
      }).catch(err => {
        console.warn('Guided creator background fetch notice:', err);
        setIsLoadingData(false);
      });
    }
  }, [isOpen]);

  // Recalculate remaining BP
  useEffect(() => {
    let spent = 0;
    
    // Core attributes: 5 BP per point (starts at 0)
    spent += (draft.strength + draft.agility + draft.stamina + draft.intellect + draft.wisdom + draft.charisma) * 5;
    
    // Species Cost
    if (selectedSpeciesObj && selectedSpeciesObj.cp) {
      spent += parseInt(selectedSpeciesObj.cp, 10) || 0;
    }

    // Technology Level Cost
    if (draft.technologyLevel === 4) spent += 10;
    else if (draft.technologyLevel === 5) spent += 20;
    else if (draft.technologyLevel < 3) spent -= 10; // Primitive TL refund

    // General allocated skills (1 BP per rank beyond background pools)
    if (draft.generalAllocations?.skills) {
      Object.values(draft.generalAllocations.skills).forEach(rank => {
        spent += (parseInt(rank, 10) || 0) * 1;
      });
    }

    // General allocated features (3 BP each)
    if (draft.generalAllocations?.features) {
      spent += (draft.generalAllocations.features.length) * 3;
    }

    setBpRemaining(150 - spent);
  }, [draft, selectedSpeciesObj]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleFinish = () => {
    // Combine all allocated skill ranks
    const combinedSkills = {};
    const skillAttrMap = {};

    dbData.skills.forEach(s => {
      if (s.name) skillAttrMap[s.name] = s.baseAttr || 'attr-intellect';
    });

    const aggregatePoolSkills = (pool) => {
      Object.entries(pool?.skills || {}).forEach(([sName, sRank]) => {
        combinedSkills[sName] = (combinedSkills[sName] || 0) + (parseInt(sRank, 10) || 0);
      });
    };

    aggregatePoolSkills(draft.originAllocations);
    aggregatePoolSkills(draft.factionAllocations);
    aggregatePoolSkills(draft.occuAllocations);
    aggregatePoolSkills(draft.generalAllocations);

    const finalSkillsList = Object.entries(combinedSkills).map(([name, rank], i) => ({
      id: `skill_${i}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      rank: Math.min(20, Math.max(0, rank)),
      baseAttr: skillAttrMap[name] || 'attr-intellect'
    }));

    // Combine all unique features
    const combinedFeaturesMap = new Map();
    const featDetailMap = new Map();
    dbData.features.forEach(f => {
      if (f.name) featDetailMap.set(f.name, f);
    });

    const addFeatsFromPool = (pool, categoryLabel) => {
      (pool?.features || []).forEach(fName => {
        if (!combinedFeaturesMap.has(fName)) {
          const detail = featDetailMap.get(fName) || {};
          combinedFeaturesMap.set(fName, {
            id: detail.id || `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: fName,
            category: detail.category || categoryLabel,
            description: detail.description || '',
            mechanic: detail.mechanic || '',
            cp: detail.cp !== undefined ? detail.cp : 3
          });
        }
      });
    };

    addFeatsFromPool(draft.originAllocations, 'Origin Trait');
    addFeatsFromPool(draft.factionAllocations, 'Faction Feature');
    addFeatsFromPool(draft.occuAllocations, 'Occupation Trait');
    addFeatsFromPool(draft.generalAllocations, 'General Feature');

    // Add Inherent Species Features if present
    if (selectedSpeciesObj && Array.isArray(selectedSpeciesObj.inherent_features)) {
      selectedSpeciesObj.inherent_features.forEach(feat => {
        const featName = typeof feat === 'object' ? (feat.name || feat.title) : feat;
        if (featName && !combinedFeaturesMap.has(featName)) {
          combinedFeaturesMap.set(featName, {
            id: `feat_species_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: featName,
            category: 'Species Inherent',
            description: typeof feat === 'object' ? feat.description || '' : '',
            cp: 0
          });
        }
      });
    }

    const finalFeaturesList = Array.from(combinedFeaturesMap.values());

    // Generate final sheet payload
    const payload = {
      ...draft,
      skills: finalSkillsList,
      features: finalFeaturesList
    };
    
    if (applyGuidedCharacter(payload)) {
      onClose();
      setTimeout(() => {
        setCurrentStep(0);
        setDraft(INITIAL_DRAFT);
        setSelectedSpeciesObj(null);
      }, 300);
    }
  };

  const updateDraft = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  // Grouped skills for organized selection
  const groupedSkillsForSelect = useMemo(() => {
    const groups = {};
    dbData.skills.forEach(s => {
      const gLabel = s.groupLabel || (s.group ? s.group.toUpperCase() : 'GENERAL SKILLS');
      if (!groups[gLabel]) groups[gLabel] = [];
      groups[gLabel].push(s);
    });
    return groups;
  }, [dbData.skills]);

  // Grouped features for organized selection
  const groupedFeaturesForSelect = useMemo(() => {
    const groups = {};
    dbData.features.forEach(f => {
      const cat = f.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [dbData.features]);

  // ------------------- STEP RENDERS -------------------
  
  const renderConcept = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Concept & Identity</h3>
        <p className="text-sm text-slate-400">Establish the baseline identity of your operative.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Operative Name / Callsign</label>
          <input 
            type="text" value={draft['char-name']} onChange={e => updateDraft('char-name', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
            placeholder="e.g. Commander Xy'larra, Dash Rendar" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Character Concept</label>
          <input 
            type="text" value={draft['char-concept']} onChange={e => updateDraft('char-concept', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
            placeholder="e.g. Cybernetic Infiltrator, Void-Wandering Diplomat" 
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
            <input type="text" value={draft['char-age']} onChange={e => updateDraft('char-age', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="28" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Height</label>
            <input type="text" value={draft['char-height']} onChange={e => updateDraft('char-height', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="1.85m" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Weight</label>
            <input type="text" value={draft['char-weight']} onChange={e => updateDraft('char-weight', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="78kg" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectionList = (title, items, selectedName, onSelect, icon = <User size={16}/>) => (
    <div className="space-y-4 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        <p className="text-sm text-slate-400">Select an option to define your operative's background archetype.</p>
      </div>
      
      {isLoadingData && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-cyan-500"><Search size={32} /></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
          <p>No predefined database entries found. You may enter a custom {title} name below:</p>
          <div className="mt-4 max-w-md mx-auto flex gap-2">
            <input
              type="text"
              defaultValue={selectedName}
              placeholder={`Enter custom ${title}...`}
              id={`custom_${title}`}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
            <button
              onClick={() => {
                const el = document.getElementById(`custom_${title}`);
                if (el && el.value.trim()) onSelect({ name: el.value.trim() });
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg"
            >
              Set
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 pb-4">
          {items.map(item => {
            const name = item.name || item.title || item.id;
            const isSelected = selectedName === name;
            return (
              <div 
                key={item.id || name} 
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold flex items-center gap-2 ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {icon} {name}
                  </h4>
                  {item.cp !== undefined && item.cp !== 0 && (
                    <span className="text-xs font-bold bg-slate-900 px-2 py-1 rounded text-amber-400 border border-amber-500/30">
                      {item.cp} BP
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{item.description || 'No description available.'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSpecies = () => renderSelectionList(
    'Species', 
    dbData.species, 
    draft['char-species'], 
    (sp) => {
      updateDraft('char-species', sp.name || sp.title || sp.id);
      setSelectedSpeciesObj(sp);
    }
  );

  const renderOriginFaction = () => (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Origin & Faction</h3>
        <p className="text-sm text-slate-400">Choose your homeworld origin and faction allegiance. Each grants 20 skill ranks and 2 traits.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto pr-1">
        {/* Origin Column */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="font-bold text-amber-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <BookOpen size={16} /> Origin Homeworld
          </h4>
          {dbData.origins.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 italic">No origin presets found. Enter custom origin:</p>
              <input 
                type="text" 
                value={draft['char-origin']} 
                onChange={e => updateDraft('char-origin', e.target.value)}
                placeholder="e.g. Core World, Outer Fringe, Orbital Station"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
          ) : (
            dbData.origins.map(org => {
              const name = org.name || org.title || org.id;
              return (
                <div 
                  key={org.id || name} onClick={() => updateDraft('char-origin', name)}
                  className={`p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                    draft['char-origin'] === name
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{name}</div>
                  {org.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{org.description}</p>}
                </div>
              );
            })
          )}
        </div>

        {/* Faction Column */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <Shield size={16} /> Faction Allegiance
          </h4>
          {dbData.factions.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 italic">No faction presets found. Enter custom faction:</p>
              <input 
                type="text" 
                value={draft['char-faction']} 
                onChange={e => updateDraft('char-faction', e.target.value)}
                placeholder="e.g. Sol Alliance, Syndicate Guild, Independent"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
              />
            </div>
          ) : (
            dbData.factions.map(fac => {
              const name = fac.name || fac.title || fac.id;
              return (
                <div 
                  key={fac.id || name} onClick={() => updateDraft('char-faction', name)}
                  className={`p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                    draft['char-faction'] === name
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold">{name}</div>
                  {fac.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{fac.description}</p>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderOccupation = () => renderSelectionList(
    'Occupation', 
    dbData.occupations, 
    draft['char-occu'], 
    (occ) => updateDraft('char-occu', occ.name || occ.title || occ.id),
    <Shield size={16} />
  );

  const renderAttributes = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Core Stats (Attributes)</h3>
        <p className="text-sm text-slate-400">Allocate your base attributes. Maximum +4 before species modifiers. Each +1 point costs <strong className="text-amber-400">5 BP</strong>.</p>
        {selectedSpeciesObj && (
          <div className="mt-3 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg text-xs">
            <span className="font-bold text-cyan-300 block mb-1">Species Modifiers ({selectedSpeciesObj.name || selectedSpeciesObj.title || 'Selected Species'}):</span>
            <div className="flex flex-wrap gap-4">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => {
                const mod = selectedSpeciesObj[`${attr}_modifier`] || selectedSpeciesObj[`${attr}_mod`] || 0;
                if (mod === 0) return null;
                return <span key={attr} className="text-slate-300 capitalize">{attr}: <span className={mod > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{mod > 0 ? `+${mod}` : mod}</span></span>;
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => {
          const val = draft[attr];
          return (
            <div key={attr} className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="capitalize font-bold text-slate-200 tracking-wide">{attr}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateDraft(attr, Math.max(0, val - 1))} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="w-8 text-center text-xl font-black text-cyan-300">{val}</div>
                <button 
                  onClick={() => updateDraft(attr, Math.min(4, val + 1))} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTechLevel = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Technology Level</h3>
        <p className="text-sm text-slate-400">Determine your access to advanced tech. Default is TL3 (0 BP).</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { level: 1, label: 'TL1 - Primitive', desc: 'Pre-industrial societies. Grants +10 BP refund.', cost: -10 },
          { level: 2, label: 'TL2 - Industrial', desc: 'Combustion engines & early electrical grids. Grants +10 BP refund.', cost: -10 },
          { level: 3, label: 'TL3 - Spacefaring (Standard)', desc: 'Interstellar baseline: grav-drives, standard blasters, kinetic shields. Costs 0 BP.', cost: 0 },
          { level: 4, label: 'TL4 - Advanced', desc: 'Subspace relays, plasma lattice armor, quantum AI. Costs 10 BP.', cost: 10 },
          { level: 5, label: 'TL5 - Theoretical', desc: 'Post-scarcity matter transmuters, exotic dark-matter drives. Costs 20 BP.', cost: 20 },
        ].map(tl => (
          <div 
            key={tl.level}
            onClick={() => updateDraft('technologyLevel', tl.level)}
            className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
              draft.technologyLevel === tl.level 
                ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-600'
            }`}
          >
            <div>
              <div className={`font-bold ${draft.technologyLevel === tl.level ? 'text-cyan-300' : 'text-slate-200'}`}>{tl.label}</div>
              <div className="text-xs text-slate-500">{tl.desc}</div>
            </div>
            <div className={`font-mono text-sm font-bold ${tl.cost > 0 ? 'text-red-400' : tl.cost < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {tl.cost > 0 ? `-${tl.cost} BP` : tl.cost < 0 ? `+${Math.abs(tl.cost)} BP` : '0 BP'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinalizeSkillsFeatures = () => {
    const renderPoolSection = (title, sourceName, poolKey, colorClass, maxSkills = 20, maxFeatures = 2, isGeneral = false) => {
      const alloc = draft[poolKey] || { skills: {}, features: [] };
      let spentSkills = 0;
      Object.values(alloc.skills || {}).forEach(v => spentSkills += (parseInt(v, 10) || 0));

      const filteredSkills = dbData.skills.filter(s => {
        if (!skillSearchQuery.trim()) return true;
        return (s.name || '').toLowerCase().includes(skillSearchQuery.toLowerCase());
      });

      const filteredFeatures = dbData.features.filter(f => {
        const matchesSearch = !featureSearchQuery.trim() ||
          (f.name || '').toLowerCase().includes(featureSearchQuery.toLowerCase()) ||
          (f.description || '').toLowerCase().includes(featureSearchQuery.toLowerCase());
        const matchesCat = featureCategoryFilter === 'All' || f.category === featureCategoryFilter;
        return matchesSearch && matchesCat;
      });

      return (
        <div className={`p-4 rounded-xl border bg-slate-900/60 ${colorClass}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h4 className="font-bold text-base uppercase tracking-widest flex items-center gap-2">
                <Layers size={16} /> {title}{sourceName ? `: ${sourceName}` : ''}
              </h4>
              <p className="text-xs opacity-75">
                {isGeneral 
                  ? `Spend remaining general Build Points (${bpRemaining} BP). Skills: 1 BP/rank, Features: 3 BP.`
                  : `Allocate up to ${maxSkills} Free Skill Ranks & ${maxFeatures} Free Features/Traits.`}
              </p>
            </div>
            {!isGeneral && (
              <div className="flex gap-3 text-right shrink-0">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-700">
                  <strong className={maxSkills - spentSkills > 0 ? 'text-cyan-400' : 'text-slate-400'}>{maxSkills - spentSkills}</strong> Ranks Left
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-700">
                  <strong className={maxFeatures - alloc.features.length > 0 ? 'text-amber-400' : 'text-slate-400'}>{maxFeatures - alloc.features.length}</strong> Feats Left
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Skill Selector */}
            <div>
              <span className="text-xs font-bold uppercase block mb-1.5 opacity-80">Add Skill Ranks</span>
              <div className="flex gap-2 mb-2">
                <select 
                  id={`select_${poolKey}`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-cyan-500 outline-none"
                >
                  <option value="">-- Choose from all {dbData.skills.length} available skills --</option>
                  {Object.entries(groupedSkillsForSelect).map(([grpName, skList]) => (
                    <optgroup key={grpName} label={grpName} className="bg-slate-900 text-cyan-300 font-bold">
                      {skList.map(s => (
                        <option key={s.id || s.name} value={s.name} className="text-white font-normal">
                          {s.name} ({s.group || 'Skill'})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const sel = document.getElementById(`select_${poolKey}`);
                    if (sel && sel.value) {
                      if (!isGeneral && spentSkills >= maxSkills) {
                        alert(`You have allocated all ${maxSkills} ranks in this background pool.`);
                        return;
                      }
                      if (isGeneral && bpRemaining < 1) {
                        alert('Not enough remaining BP to purchase additional skill ranks.');
                        return;
                      }
                      const skName = sel.value;
                      setDraft(prev => ({
                        ...prev,
                        [poolKey]: {
                          ...prev[poolKey],
                          skills: {
                            ...prev[poolKey].skills,
                            [skName]: (prev[poolKey].skills[skName] || 0) + 1
                          }
                        }
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Display Chosen Skills in this pool */}
              <div className="flex flex-wrap gap-2 min-h-[30px] p-2 bg-slate-950/70 rounded-lg border border-slate-800">
                {Object.entries(alloc.skills || {}).length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No skill ranks assigned in this pool yet.</span>
                ) : (
                  Object.entries(alloc.skills).map(([skillName, rank]) => (
                    <div key={skillName} className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-md border border-slate-700 text-xs shadow-sm">
                      <span className="text-slate-200 font-medium">{skillName}</span>
                      <span className="font-bold text-cyan-400 font-mono">+{rank}</span>
                      <div className="flex items-center gap-1 ml-1 border-l border-slate-700 pl-1.5">
                        <button
                          onClick={() => {
                            if (!isGeneral && spentSkills >= maxSkills) return;
                            if (isGeneral && bpRemaining < 1) return;
                            setDraft(prev => ({
                              ...prev,
                              [poolKey]: {
                                ...prev[poolKey],
                                skills: { ...prev[poolKey].skills, [skillName]: rank + 1 }
                              }
                            }));
                          }}
                          className="text-cyan-400 hover:text-cyan-200 font-bold px-1"
                        >+</button>
                        <button
                          onClick={() => {
                            setDraft(prev => {
                              const newSkills = { ...prev[poolKey].skills };
                              if (newSkills[skillName] > 1) newSkills[skillName] -= 1;
                              else delete newSkills[skillName];
                              return { ...prev, [poolKey]: { ...prev[poolKey], skills: newSkills } };
                            });
                          }}
                          className="text-red-400 hover:text-red-300 font-bold px-1"
                        >-</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feature Selector */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold uppercase opacity-80">
                  Select {isGeneral ? 'Additional Features (3 BP each)' : `Free Features/Traits (${maxFeatures - alloc.features.length} remaining)`}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <select 
                  id={`feat_${poolKey}`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-cyan-500 outline-none"
                  disabled={!isGeneral && alloc.features.length >= maxFeatures}
                >
                  <option value="">-- Choose from all {dbData.features.length} available features --</option>
                  {Object.entries(groupedFeaturesForSelect).map(([catName, featList]) => (
                    <optgroup key={catName} label={catName} className="bg-slate-900 text-amber-300 font-bold">
                      {featList.map(f => (
                        <option key={f.id || f.name} value={f.name} className="text-white font-normal">
                          {f.name} ({f.category || 'General'} - {f.cp !== undefined ? `${f.cp} BP` : '3 BP'})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button 
                  disabled={!isGeneral && alloc.features.length >= maxFeatures}
                  onClick={() => {
                    const sel = document.getElementById(`feat_${poolKey}`);
                    if (sel && sel.value) {
                      const featName = sel.value;
                      if (alloc.features.includes(featName)) {
                        alert('This feature is already selected in this pool.');
                        return;
                      }
                      if (!isGeneral && alloc.features.length >= maxFeatures) {
                        alert(`You can only select up to ${maxFeatures} features in this pool.`);
                        return;
                      }
                      if (isGeneral && bpRemaining < 3) {
                        alert('Not enough remaining BP to purchase an additional feature (Cost: 3 BP).');
                        return;
                      }
                      setDraft(prev => ({
                        ...prev,
                        [poolKey]: {
                          ...prev[poolKey],
                          features: [...prev[poolKey].features, featName]
                        }
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Display Chosen Features */}
              <div className="flex flex-wrap gap-2 min-h-[30px] p-2 bg-slate-950/70 rounded-lg border border-slate-800">
                {alloc.features.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No features selected in this pool yet.</span>
                ) : (
                  alloc.features.map(featName => {
                    const detail = dbData.features.find(f => f.name === featName);
                    return (
                      <div key={featName} className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-md border border-slate-700 text-xs shadow-sm">
                        <Sparkles size={12} className="text-amber-400 shrink-0" />
                        <span className="text-slate-200 font-medium" title={detail?.description || ''}>{featName}</span>
                        <button 
                          onClick={() => {
                            setDraft(prev => ({
                              ...prev,
                              [poolKey]: {
                                ...prev[poolKey],
                                features: prev[poolKey].features.filter(f => f !== featName)
                              }
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 ml-1 font-bold"
                          title="Remove feature"
                        ><X size={12}/></button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Skills & Features Allocation</h3>
          <p className="text-sm text-slate-400">
            Allocate your free background ranks (20 ranks & 2 traits each for Origin, Faction, and Occupation), plus spend any remaining BP on additional skills and features.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {renderPoolSection('Origin Homeworld', draft['char-origin'] || 'General Origin', 'originAllocations', 'border-amber-500/50 text-amber-100', 20, 2)}
          {renderPoolSection('Faction Allegiance', draft['char-faction'] || 'General Faction', 'factionAllocations', 'border-emerald-500/50 text-emerald-100', 20, 2)}
          {renderPoolSection('Occupation Career', draft['char-occu'] || 'General Occupation', 'occuAllocations', 'border-purple-500/50 text-purple-100', 20, 2)}
          {renderPoolSection('General Point Buy', 'Remaining Build Points', 'generalAllocations', 'border-cyan-500/50 text-cyan-100', 99, 99, true)}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    // Combine all skills for summary display
    const summarySkills = {};
    const countSkills = (pool) => {
      Object.entries(pool?.skills || {}).forEach(([n, r]) => {
        summarySkills[n] = (summarySkills[n] || 0) + (parseInt(r, 10) || 0);
      });
    };
    countSkills(draft.originAllocations);
    countSkills(draft.factionAllocations);
    countSkills(draft.occuAllocations);
    countSkills(draft.generalAllocations);

    // Combine all features
    const summaryFeatures = new Set();
    draft.originAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.factionAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.occuAllocations?.features?.forEach(f => summaryFeatures.add(f));
    draft.generalAllocations?.features?.forEach(f => summaryFeatures.add(f));

    return (
      <div className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
        <div className="text-center">
          <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-widest">Initialization Matrix Complete</h3>
          <p className="text-slate-400 mt-1 text-sm">Review your operative parameters before deploying to the Persona Folio.</p>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl space-y-5 shadow-xl flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Operative Name</span>
              <span className="text-lg font-bold text-white">{draft['char-name'] || 'Unnamed Operative'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Concept</span>
              <span className="text-sm text-slate-300">{draft['char-concept'] || '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Species</span>
              <span className="font-bold text-cyan-300">{draft['char-species'] || 'None'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Origin</span>
              <span className="font-bold text-amber-300">{draft['char-origin'] || 'None'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase">Occupation</span>
              <span className="font-bold text-purple-400">{draft['char-occu'] || 'None'}</span>
            </div>
          </div>

          {/* Core Stats */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">Base Attributes</span>
            <div className="grid grid-cols-6 gap-2 text-center">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => (
                <div key={attr} className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">{attr.substring(0,3)}</div>
                  <div className="text-lg font-black text-cyan-300">{draft[attr]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allocated Skills Summary */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">
              Allocated Skills ({Object.keys(summarySkills).length})
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {Object.keys(summarySkills).length === 0 ? (
                <span className="text-xs text-slate-500 italic">No skills allocated.</span>
              ) : (
                Object.entries(summarySkills).map(([sName, r]) => (
                  <span key={sName} className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-200">
                    {sName} <strong className="text-cyan-400 font-mono">+{r}</strong>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Allocated Features Summary */}
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500 block mb-2 uppercase">
              Acquired Features & Traits ({summaryFeatures.size})
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {summaryFeatures.size === 0 ? (
                <span className="text-xs text-slate-500 italic">No traits selected.</span>
              ) : (
                Array.from(summaryFeatures).map(fName => (
                  <span key={fName} className="text-xs bg-slate-900 border border-amber-500/40 px-2.5 py-1 rounded text-amber-200 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" /> {fName}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Budget Display */}
          <div className="bg-slate-950 p-4 rounded-lg flex justify-between items-center border border-slate-800">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs block">Remaining Build Points</span>
              <span className="text-[11px] text-slate-500">Starting Budget: 150 BP</span>
            </div>
            <span className={`text-2xl font-black font-mono ${bpRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {bpRemaining} BP
            </span>
          </div>
          
          {bpRemaining < 0 && (
            <div className="p-3 bg-red-950/30 border border-red-900 rounded text-red-400 text-xs font-bold text-center">
              ⚠️ Warning: Your build exceeds the 150 BP starting pool by {Math.abs(bpRemaining)} BP. You can still finalize and balance it manually in the Persona Folio.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'concept': return renderConcept();
      case 'species': return renderSpecies();
      case 'origin': return renderOriginFaction();
      case 'occupation': return renderOccupation();
      case 'attributes': return renderAttributes();
      case 'tech': return renderTechLevel();
      case 'skills': return renderFinalizeSkillsFeatures();
      case 'review': return renderReview();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-5xl max-h-full h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest flex items-center gap-2">
              <Shield size={20} className="text-cyan-400"/>
              Guided Creator
            </h2>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Budget</span>
              <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded border ${
                bpRemaining >= 0 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-950/30 border-red-500/30 text-red-400'
              }`}>
                {bpRemaining} BP
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Steps */}
          <div className="w-56 bg-slate-950 border-r border-slate-800 p-4 hidden md:flex flex-col gap-1 overflow-y-auto">
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-950/40 border-cyan-500/50' 
                      : isPast 
                        ? 'bg-slate-900/50 border-transparent hover:bg-slate-800' 
                        : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-600'
                  }`}
                >
                  <div className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-cyan-400' : isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                    Step {idx + 1}
                  </div>
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {renderStepContent()}
            </div>

            {/* Footer / Navigation */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-bold uppercase tracking-wider text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <div className="flex gap-3">
                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} /> Finalize & Deploy to Folio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedCreatorModal;
