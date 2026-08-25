import React, { useState, useEffect, useMemo } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { SPECIES_LINEAGES, DEFAULT_SPECIES } from '../../../data/speciesData';
import { DEFAULT_ARCHETYPES } from '../../../data/archetypesData';

const IdentityTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField, applyArchetypeChassis, applySpeciesAdjustments } = useFolio();

  const [dbOptions, setDbOptions] = useState({});
  const [manualMode, setManualMode] = useState({});

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

  // Group species catalog by lineage for optgroups
  const groupedSpecies = useMemo(() => {
    const speciesList = (dbOptions.species && dbOptions.species.length > 0) ? dbOptions.species : DEFAULT_SPECIES;
    const groups = {};

    SPECIES_LINEAGES.forEach(lineage => {
      groups[lineage.name] = [];
    });
    groups['Other Xenotypes'] = [];

    speciesList.forEach(sp => {
      const parent = (sp.parent_species || sp.lineage || sp.category || '').toLowerCase();
      const name = (sp.name || sp.title || '').toLowerCase();

      let matched = SPECIES_LINEAGES.find(l => {
        const lid = l.id.toLowerCase();
        const lname = l.name.toLowerCase();
        return parent.includes(lid) || parent.includes(lname) || 
               (lid === 'aeld' && (parent.includes('aeld') || name.includes('aeld') || name.includes('celestine') || name.includes('draconian') || name.includes('fae-aeld'))) ||
               (lid === 'asi' && (parent.includes('asi') || parent.includes('fey') || name.includes('asi') || name.includes('elad') || name.includes('sylvan'))) ||
               (lid === 'aulurans' && (parent.includes('auluran') || name.includes('dar') || name.includes('koda') || name.includes('graa') || name.includes('prokos'))) ||
               (lid === 'gene' && (parent.includes('engineered') || parent.includes('gen-e') || parent.includes('transhuman') || name.includes('myrmidon') || name.includes('psion') || name.includes('chimera') || name.includes('goliath'))) ||
               (lid === 'humans' && (parent.includes('human') && !parent.includes('engineered') && !parent.includes('gen-e'))) ||
               (lid === 'kitin' && (parent.includes('kitin') || parent.includes('insect') || name.includes('kitin') || name.includes('chitin') || name.includes('mantodea'))) ||
               (lid === 'synthetics' && (parent.includes('synthetic') || parent.includes('android') || parent.includes('mech') || name.includes('android') || name.includes('cyber') || name.includes('silicon'))) ||
               (lid === 'shanor' && (parent.includes('shanor') || parent.includes('void') || parent.includes('spectral') || name.includes("sha'nor") || name.includes('eidolon'))) ||
               (lid === 'progenitors' && (parent.includes('progenitor') || parent.includes('ancient') || parent.includes('precursor'))) ||
               (lid === 'independent' && (parent.includes('independent') || parent.includes('alien') || parent.includes('xenotype')));
      });

      if (matched) {
        groups[matched.name].push(sp);
      } else {
        groups['Other Xenotypes'].push(sp);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [dbOptions.species]);

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

  const renderPickerField = (id, label, placeholder, browsePath) => {
    const isManual = manualMode[id] || false;
    const val = characterData[id] || '';
    const selectedObj = (dbOptions[browsePath] || []).find(o => o.name === val) || { name: val };

    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            {label}
            <div className="flex items-center gap-1">
              <input
                type="radio"
                className="w-3 h-3 cursor-pointer"
                checked={isManual}
                onClick={() => setManualMode(prev => ({ ...prev, [id]: !prev[id] }))}
                onChange={() => {}} // dummy onChange to suppress React warning
                title="Toggle manual entry"
              />
              <span className="text-[10px] text-slate-400 cursor-pointer" onClick={() => setManualMode(prev => ({ ...prev, [id]: !prev[id] }))}>Manual</span>
            </div>
          </label>
          <div className="flex items-center gap-1">
            {onOpenSelectorModal && (
              <button
                type="button"
                onClick={() => onOpenSelectorModal(id, label, browsePath)}
                className="text-[10px] font-bold uppercase text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                Browse DB
              </button>
            )}
            {onOpenAssetModal && val && (
              <button
                type="button"
                onClick={() => onOpenAssetModal(id, label, 'edit', null, selectedObj)}
                className="text-[10px] font-bold uppercase text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                title={`Edit ${label} properties & DB record`}
              >
                ✏️
              </button>
            )}
          </div>
        </div>

        {isManual ? (
          <input
            type="text"
            id={id}
            value={val}
            onChange={(e) => updateField(id, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none"
          />
        ) : id === 'char-species' ? (
          <select
            id={id}
            value={val}
            onChange={(e) => handleSpeciesChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none appearance-none cursor-pointer"
          >
            <option value="">-- Select Species (By Lineage) --</option>
            {groupedSpecies.map(([lineageName, speciesList]) => (
              <optgroup key={lineageName} label={`─── ${lineageName.toUpperCase()} ───`} className="bg-slate-950 text-cyan-400 font-bold">
                {speciesList.map(opt => (
                  <option key={opt.id || opt.name} value={opt.name} className="bg-slate-900 text-slate-100 font-normal">
                    {opt.name || opt.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <select
            id={id}
            value={val}
            onChange={(e) => {
              if (id === 'char-archetype') handleArchetypeChange(e.target.value);
              else updateField(id, e.target.value);
            }}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none appearance-none cursor-pointer"
          >
            <option value="">-- Select {label} --</option>
            {(dbOptions[browsePath] || (browsePath === 'archetypes' ? DEFAULT_ARCHETYPES : [])).map(opt => (
              <option key={opt.id || opt.name} value={opt.name}>{opt.name || opt.title}</option>
            ))}
          </select>
        )}
      </div>
    );
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

          {renderPickerField('char-archetype', 'Archetype (Optional)', 'Enter Archetype Name or Concept...', 'archetypes')}

          {/* Archetype 80 CP Pre-build Blueprint Action Card */}
          {selectedArchetype && (
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-lg p-3 space-y-2 text-xs shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase font-mono text-[11px]">
                  <span>🛡️</span>
                  <span>{selectedArchetype.name} 80 CP Blueprint</span>
                </div>
                {applyArchetypeChassis && (
                  <button
                    type="button"
                    onClick={() => applyArchetypeChassis(selectedArchetype)}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1"
                    title="Apply 80 CP Archetype Pre-build: +3 Primary Attr, +2 Secondary Attr, Essential Skills & Signature Features"
                  >
                    <span>⚡</span> Apply 80 CP Pre-build
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div>
                  <span className="text-slate-500">Primary:</span> <strong className="text-amber-300">{selectedArchetype.primary_attribute || 'Strength'} (+3)</strong>
                </div>
                <div>
                  <span className="text-slate-500">Secondary:</span> <strong className="text-amber-300">{selectedArchetype.secondary_attribute || 'Agility'} (+2)</strong>
                </div>
              </div>

              {Array.isArray(selectedArchetype.essential_skills) && selectedArchetype.essential_skills.length > 0 && (
                <div className="text-[10px] text-slate-400 font-mono">
                  <span className="text-slate-500">Essential Skills:</span> {selectedArchetype.essential_skills.slice(0, 4).join(', ')} (Trained Rank 6)
                </div>
              )}
            </div>
          )}

          {renderPickerField('char-species', 'Species', 'Enter Species Name...', 'species')}

          {/* Species Inherent Traits & Adjustments Info Card */}
          {selectedSpecies && (
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-lg p-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 uppercase">
                <span>🧬 {selectedSpecies.name || selectedSpecies.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">{selectedSpecies.parent_species || 'Lineage'}</span>
              </div>
              {Array.isArray(selectedSpecies.inherent_features) && selectedSpecies.inherent_features.length > 0 && (
                <div className="text-[10px] text-slate-300 font-mono">
                  <span className="text-cyan-400">Inherent Traits:</span> {selectedSpecies.inherent_features.map(f => typeof f === 'object' ? f.name : f).join(', ')}
                </div>
              )}
            </div>
          )}

          {renderPickerField('char-occu', 'Occupation', 'Enter Occupation Name...', 'occupations')}
          {renderPickerField('char-origin', 'Origin', 'Enter Origin Name...', 'origins')}
          {renderPickerField('char-faction', 'Faction', 'Enter Faction Name...', 'factions')}
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
              placeholder="1.85m"
            />

            <FolioInput
              id="char-weight"
              label="Weight"
              value={characterData['char-weight'] || ''}
              onChange={updateField}
              placeholder="82 kg"
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
    </div>
  );
};

export default React.memo(IdentityTab);
