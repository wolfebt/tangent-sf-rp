import React, { useState, useEffect } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { X, ChevronRight, ChevronLeft, Check, Search, Shield, Target, User } from 'lucide-react';
import { attachCreatorTag } from '../../../utils/creatorUtils';

const STEPS = [
  { id: 'concept', title: 'Concept & Identity', desc: 'Basic Biography' },
  { id: 'species', title: 'Species', desc: 'Biological Traits' },
  { id: 'origin', title: 'Origin & Faction', desc: 'Background & Affiliation' },
  { id: 'occupation', title: 'Occupation', desc: 'Career & Training' },
  { id: 'attributes', title: 'Core Stats', desc: 'Physical & Mental Aptitude' },
  { id: 'tech', title: 'Tech Level', desc: 'Advancement & Wealth' },
  { id: 'skills', title: 'Finalize Skills', desc: 'Allocate remaining BP' },
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

// Simple fetcher for collections
const fetchCollectionData = async (path) => {
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items = [];
    querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    return items.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
  } catch (err) {
    console.error(`Error fetching ${path}:`, err);
    return [];
  }
};

const GuidedCreatorModal = ({ isOpen, onClose }) => {
  const { applyGuidedCharacter } = useFolio();
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [bpRemaining, setBpRemaining] = useState(150);
  
  // Data Caches
  const [dbData, setDbData] = useState({
    species: [],
    origins: [],
    factions: [],
    occupations: [],
    skills: [],
    features: []
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selection state for complex picks
  const [selectedSpeciesObj, setSelectedSpeciesObj] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch options if they aren't loaded
      if (dbData.species.length === 0) {
        setIsLoadingData(true);
        Promise.all([
          fetchCollectionData('omnicortex/species/items'),
          fetchCollectionData('omnicortex/origins/items'),
          fetchCollectionData('omnicortex/factions/items'),
          fetchCollectionData('omnicortex/occupations/items'),
          fetchCollectionData('omnicortex/skills/items'),
          fetchCollectionData('omnicortex/features/items')
        ]).then(([species, origins, factions, occupations, skills, features]) => {
          setDbData({ species, origins, factions, occupations, skills, features });
          setIsLoadingData(false);
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let spent = 0;
    
    // Attributes cost 5 BP per point allocated beyond 0 (Max +4 initially)
    spent += (draft.strength + draft.agility + draft.stamina + draft.intellect + draft.wisdom + draft.charisma) * 5;
    
    // Species BP Cost
    if (selectedSpeciesObj && selectedSpeciesObj.cp) {
      spent += parseInt(selectedSpeciesObj.cp, 10) || 0;
    }

    // Technology Level
    if (draft.technologyLevel === 4) spent += 10;
    else if (draft.technologyLevel === 5) spent += 20;
    else if (draft.technologyLevel < 3) spent -= 10; // TL 1 or 2 give back BP

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
    // Combine allocated skills
    const combinedSkills = {};
    const addToSkills = (pool) => {
      Object.entries(pool.skills || {}).forEach(([sName, sRank]) => {
        combinedSkills[sName] = (combinedSkills[sName] || 0) + sRank;
      });
    };
    addToSkills(draft.originAllocations);
    addToSkills(draft.factionAllocations);
    addToSkills(draft.occuAllocations);
    addToSkills(draft.generalAllocations);

    const finalSkillsList = Object.entries(combinedSkills).map(([name, rank], i) => ({
      id: `skill_${i}`,
      name,
      rank,
      attr: 'Intellect' // Fallback
    }));

    // Combine allocated features
    const combinedFeatures = new Set();
    draft.originAllocations.features.forEach(f => combinedFeatures.add(f));
    draft.factionAllocations.features.forEach(f => combinedFeatures.add(f));
    draft.occuAllocations.features.forEach(f => combinedFeatures.add(f));
    draft.generalAllocations.features.forEach(f => combinedFeatures.add(f));

    const finalFeaturesList = Array.from(combinedFeatures).map((name, i) => ({
      id: `feat_${i}`,
      name,
      cp: 3
    }));

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

  // ------------------- STEP RENDERS -------------------
  
  const renderConcept = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Concept & Identity</h3>
        <p className="text-sm text-slate-400">Who is your operative? Enter basic biographical data.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">Operative Name</label>
          <input 
            type="text" value={draft['char-name']} onChange={e => updateDraft('char-name', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
            placeholder="Name or Callsign" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">General Concept</label>
          <input 
            type="text" value={draft['char-concept']} onChange={e => updateDraft('char-concept', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" 
            placeholder="e.g., Cynical Smuggler, Ex-Corporate Mercenary" 
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
            <input type="text" value={draft['char-age']} onChange={e => updateDraft('char-age', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="32" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Height</label>
            <input type="text" value={draft['char-height']} onChange={e => updateDraft('char-height', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="1.8m" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Weight</label>
            <input type="text" value={draft['char-weight']} onChange={e => updateDraft('char-weight', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="80kg" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelectionList = (title, items, selectedName, onSelect, icon = <User size={16}/>) => (
    <div className="space-y-4 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
        <p className="text-sm text-slate-400">Select an option to define your operative's background.</p>
      </div>
      
      {isLoadingData ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-cyan-500"><Search size={32} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 pb-4">
          {items.map(item => {
            const isSelected = selectedName === (item.name || item.title);
            return (
              <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-bold flex items-center gap-2 ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {icon} {item.name || item.title}
                  </h4>
                  {item.cp !== undefined && (
                    <span className="text-xs font-bold bg-slate-900 px-2 py-1 rounded text-amber-400">
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
      updateDraft('char-species', sp.name || sp.title);
      setSelectedSpeciesObj(sp);
    }
  );

  const renderOriginFaction = () => (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Origin & Faction</h3>
        <p className="text-sm text-slate-400">Choose where you come from and who you serve. Each grants 20 free skill ranks.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        {/* Origin Column */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="font-bold text-amber-400 uppercase tracking-widest text-sm mb-3">Origin</h4>
          {dbData.origins.map(org => (
            <div 
              key={org.id} onClick={() => updateDraft('char-origin', org.name || org.title)}
              className={`p-3 rounded border text-sm cursor-pointer transition-all ${
                draft['char-origin'] === (org.name || org.title)
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-bold">{org.name || org.title}</div>
            </div>
          ))}
        </div>
        {/* Faction Column */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm mb-3">Faction</h4>
          {dbData.factions.map(fac => (
            <div 
              key={fac.id} onClick={() => updateDraft('char-faction', fac.name || fac.title)}
              className={`p-3 rounded border text-sm cursor-pointer transition-all ${
                draft['char-faction'] === (fac.name || fac.title)
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-bold">{fac.name || fac.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOccupation = () => renderSelectionList(
    'Occupation', 
    dbData.occupations, 
    draft['char-occu'], 
    (occ) => updateDraft('char-occu', occ.name || occ.title),
    <Shield size={16} />
  );

  const renderAttributes = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-cyan-400">Core Stats</h3>
        <p className="text-sm text-slate-400">Allocate your base attributes. Max +4 before species modifiers. Each +1 point costs <strong className="text-amber-400">5 BP</strong>.</p>
        {selectedSpeciesObj && (
          <div className="mt-3 p-3 bg-cyan-950/30 border border-cyan-800 rounded-lg text-xs">
            <span className="font-bold text-cyan-300 block mb-1">Species Modifiers ({selectedSpeciesObj.name || selectedSpeciesObj.title}):</span>
            <div className="flex gap-4">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => {
                const mod = selectedSpeciesObj[`${attr}_modifier`] || selectedSpeciesObj[`${attr}_mod`] || 0;
                if (mod === 0) return null;
                return <span key={attr} className="text-slate-300 capitalize">{attr}: <span className={mod > 0 ? 'text-emerald-400' : 'text-red-400'}>{mod > 0 ? `+${mod}` : mod}</span></span>;
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
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors"
                >
                  -
                </button>
                <div className="w-8 text-center text-xl font-black text-cyan-300">{val}</div>
                <button 
                  onClick={() => updateDraft(attr, Math.min(4, val + 1))} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-black text-slate-400 hover:text-white transition-colors"
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
          { level: 1, label: 'TL1 - Primitive', desc: 'Pre-industrial. Grants +10 BP.', cost: -10 },
          { level: 2, label: 'TL2 - Industrial', desc: 'Early modern. Grants +10 BP.', cost: -10 },
          { level: 3, label: 'TL3 - Spacefaring', desc: 'Standard galactic baseline. Costs 0 BP.', cost: 0 },
          { level: 4, label: 'TL4 - Advanced', desc: 'Cutting-edge tech. Costs 10 BP.', cost: 10 },
          { level: 5, label: 'TL5 - Theoretical', desc: 'Post-scarcity, exotic tech. Costs 20 BP.', cost: 20 },
        ].map(tl => (
          <div 
            key={tl.level}
            onClick={() => updateDraft('technologyLevel', tl.level)}
            className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
              draft.technologyLevel === tl.level 
                ? 'bg-cyan-950/40 border-cyan-500' 
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
    const renderPoolSection = (title, sourceName, poolKey, colorClass, maxSkills = 20) => {
      if (!sourceName) return null;
      
      const alloc = draft[poolKey] || { skills: {}, features: [] };
      let spentSkills = 0;
      Object.values(alloc.skills).forEach(v => spentSkills += v);
      
      return (
        <div className={`p-4 rounded-xl border bg-slate-900/50 ${colorClass}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-lg uppercase tracking-widest">{title}: {sourceName}</h4>
              <p className="text-xs opacity-70">Allocate {maxSkills} Free Skill Ranks. Select up to 2 Free Traits.</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-xl font-black">{maxSkills - spentSkills} <span className="text-xs">Ranks Left</span></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase block mb-2 opacity-70">Add Skill Ranks</span>
              <div className="flex gap-2 mb-2">
                <select 
                  id={`select_${poolKey}`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                >
                  <option value="">-- Select a Skill --</option>
                  {dbData.skills.map(s => <option key={s.id} value={s.name || s.title}>{s.name || s.title}</option>)}
                </select>
                <button 
                  onClick={() => {
                    const sel = document.getElementById(`select_${poolKey}`);
                    if (sel.value && spentSkills < maxSkills) {
                      setDraft(prev => ({
                        ...prev,
                        [poolKey]: {
                          ...prev[poolKey],
                          skills: {
                            ...prev[poolKey].skills,
                            [sel.value]: (prev[poolKey].skills[sel.value] || 0) + 1
                          }
                        }
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded"
                >Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alloc.skills).map(([skillName, rank]) => (
                  <div key={skillName} className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-700 text-sm">
                    <span className="text-slate-300">{skillName}</span>
                    <span className="font-bold text-white">+{rank}</span>
                    <button 
                      onClick={() => {
                        setDraft(prev => {
                          const newSkills = { ...prev[poolKey].skills };
                          if (newSkills[skillName] > 1) newSkills[skillName] -= 1;
                          else delete newSkills[skillName];
                          return { ...prev, [poolKey]: { ...prev[poolKey], skills: newSkills } };
                        });
                      }}
                      className="text-red-400 hover:text-red-300 ml-1"
                    ><X size={12}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <span className="text-xs font-bold uppercase block mb-2 opacity-70">Select Free Features ({2 - alloc.features.length} left)</span>
              <div className="flex gap-2 mb-2">
                <select 
                  id={`feat_${poolKey}`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                  disabled={alloc.features.length >= 2}
                >
                  <option value="">-- Select a Feature --</option>
                  {dbData.features.map(f => <option key={f.id} value={f.name || f.title}>{f.name || f.title}</option>)}
                </select>
                <button 
                  disabled={alloc.features.length >= 2}
                  onClick={() => {
                    const sel = document.getElementById(`feat_${poolKey}`);
                    if (sel.value && alloc.features.length < 2 && !alloc.features.includes(sel.value)) {
                      setDraft(prev => ({
                        ...prev,
                        [poolKey]: {
                          ...prev[poolKey],
                          features: [...prev[poolKey].features, sel.value]
                        }
                      }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded disabled:opacity-50"
                >Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {alloc.features.map(featName => (
                  <div key={featName} className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-700 text-sm">
                    <span className="text-slate-300">{featName}</span>
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
                      className="text-red-400 hover:text-red-300 ml-1"
                    ><X size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Finalize Skills & Features</h3>
          <p className="text-sm text-slate-400">Allocate your free skill ranks and traits from your background selections.</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {renderPoolSection('Origin', draft['char-origin'], 'originAllocations', 'border-amber-500/50 text-amber-100')}
          {renderPoolSection('Faction', draft['char-faction'], 'factionAllocations', 'border-emerald-500/50 text-emerald-100')}
          {renderPoolSection('Occupation', draft['char-occu'], 'occuAllocations', 'border-purple-500/50 text-purple-100')}
          
          <div className="p-4 rounded-xl border bg-slate-900/50 border-cyan-500/50 text-cyan-100">
            <h4 className="font-bold text-lg uppercase tracking-widest">General BP Spend</h4>
            <p className="text-xs opacity-70 mb-4">Spend any remaining BP ({bpRemaining} BP) on additional skills (1 BP) or features (3 BP).</p>
            <p className="text-sm italic opacity-50">Note: You can skip this and spend your BP directly in the Folio later.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
      <Target size={48} className="opacity-20" />
      <h3 className="text-xl font-bold">{STEPS[currentStep].title}</h3>
      <p className="max-w-md text-center text-sm">
        This section is under construction.
      </p>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-widest">Initialization Complete</h3>
        <p className="text-slate-400 mt-2">Ready to compile character matrix.</p>
      </div>
      
      <div className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl space-y-6 shadow-xl">
        <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 block">Name</span>
            <span className="text-lg font-bold text-white">{draft['char-name'] || 'Unnamed'}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Concept</span>
            <span className="text-lg text-slate-300">{draft['char-concept'] || '—'}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 block">Species</span>
            <span className="font-bold text-cyan-300">{draft['char-species'] || 'None'}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Origin</span>
            <span className="font-bold text-amber-300">{draft['char-origin'] || 'None'}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Occupation</span>
            <span className="font-bold text-purple-400">{draft['char-occu'] || 'None'}</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-500 block mb-2">Base Core Stats</span>
          <div className="grid grid-cols-6 gap-2 text-center">
            {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map(attr => (
              <div key={attr} className="bg-slate-950 rounded p-2 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">{attr.substring(0,3)}</div>
                <div className="text-lg font-black text-slate-200">{draft[attr]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Final BP Remaining</span>
          <span className={`text-2xl font-black ${bpRemaining < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
            {bpRemaining}
          </span>
        </div>
        
        {bpRemaining < 0 && (
          <div className="p-3 bg-red-950/30 border border-red-900 rounded text-red-400 text-sm font-bold text-center">
            Warning: Your build exceeds the 150 BP limit. You can finalize now and correct it in the Folio later.
          </div>
        )}
      </div>
    </div>
  );

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
      default: return renderPlaceholder();
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
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
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
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
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
                className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-bold uppercase tracking-wider text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <div className="flex gap-3">
                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Finalize
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
