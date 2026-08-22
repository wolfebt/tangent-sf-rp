import React, { useState, useEffect } from 'react';
import FolioInput from '../shared/FolioInput';
import { useFolio } from '../../../context/FolioContext';
import { useAuth } from '../../../context/AuthContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { db } from '../../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const IdentityTab = ({ onOpenSelectorModal, onOpenAssetModal }) => {
  const { characterData, updateField } = useFolio();

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
                className="text-[10px] font-bold uppercase text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
              >
                Browse DB
              </button>
            )}
            {onOpenAssetModal && val && (
              <button
                type="button"
                onClick={() => onOpenAssetModal(id, label, 'edit', null, selectedObj)}
                className="text-[10px] font-bold uppercase text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors"
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
          {renderPickerField('char-species', 'Species', 'Enter Species Name...', 'species')}
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
