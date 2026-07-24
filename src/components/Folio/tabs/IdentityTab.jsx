import React, { useState, useEffect } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const IdentityTab = ({ onOpenSelectorModal }) => {
  const { characterData, updateField } = useFolio();

  const [dbOptions, setDbOptions] = useState({});
  const [manualMode, setManualMode] = useState({});

  useEffect(() => {
    const fetchOptions = async () => {
      const paths = ['species', 'occupations', 'origins', 'factions'];
      const results = {};
      for (const path of paths) {
        try {
          const colRef = collection(db, path);
          const snap = await getDocs(colRef);
          results[path] = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id }));
        } catch (e) {
          console.warn(`Failed to load ${path} options`, e);
          results[path] = [];
        }
      }
      setDbOptions(results);
    };
    fetchOptions();
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

        checkField('char-species', 'species');
        checkField('char-occu', 'occupations');
        checkField('char-origin', 'origins');
        checkField('char-faction', 'factions');

        return changed ? newManualModes : prev;
      });
    }
  }, [characterData, dbOptions]);

  const renderPickerField = (id, label, placeholder, browsePath) => {
    const isManual = manualMode[id] || false;
    const val = characterData[id] || '';

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
                onChange={() => {}} // dummy onChange to suppress React warning since we use onClick for toggle behavior
                title="Toggle manual entry"
              />
              <span className="text-[10px] text-slate-400 cursor-pointer" onClick={() => setManualMode(prev => ({ ...prev, [id]: !prev[id] }))}>Manual</span>
            </div>
          </label>
          {onOpenSelectorModal && (
            <button
              type="button"
              onClick={() => onOpenSelectorModal(id, label, browsePath)}
              className="text-[10px] font-bold uppercase text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
            >
              Browse DB
            </button>
          )}
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
        ) : (
          <select
            id={id}
            value={val}
            onChange={(e) => updateField(id, e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-slate-100 outline-none appearance-none"
          >
            <option value="">-- Select {label} --</option>
            {(dbOptions[browsePath] || []).map(opt => (
              <option key={opt.id} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="tab-panel active p-4 space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <FolioInput
            id="char-name"
            label="Character Name"
            value={characterData['char-name'] || ''}
            onChange={updateField}
            placeholder="e.g. Valen Vance"
          />

          <FolioInput
            id="char-concept"
            label="Concept"
            value={characterData['char-concept'] || ''}
            onChange={updateField}
            placeholder="e.g. Cybernetic Bounty Hunter"
          />

          {renderPickerField('char-species', 'Species', 'e.g. Human, Android, Vraxian', 'species')}
          {renderPickerField('char-occu', 'Occupation', 'e.g. Mercenary, Tech Specialist', 'occupations')}
          {renderPickerField('char-origin', 'Origin', 'e.g. Core Worlds, Outer Rim', 'origins')}
          {renderPickerField('char-faction', 'Faction', 'e.g. Syndicate, Alliance Guild', 'factions')}
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
        </div>
      </section>
    </div>
  );
};

export default React.memo(IdentityTab);
