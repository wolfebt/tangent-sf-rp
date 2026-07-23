import React from 'react';

const PreviewModal = ({ isOpen, onClose, characterData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getArray = (key) => {
    const val = characterData[key];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/60 rounded-xl max-w-3xl w-full p-6 shadow-2xl text-slate-100 space-y-6 my-8">
        
        <div className="flex justify-between items-center border-b border-cyan-900/60 pb-3 print:hidden">
          <h3 className="text-base font-bold uppercase tracking-wider text-cyan-400">
            Character Sheet Preview
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs uppercase font-bold tracking-wider"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl font-bold leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="space-y-6 text-slate-200 text-sm font-sans" id="printable-sheet">
          <div className="border-b-2 border-cyan-500 pb-3">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-cyan-300">
              {characterData['char-name'] || 'UNNAMED CHARACTER'}
            </h1>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">
              {characterData['char-concept'] || 'No Concept Defined'} | {characterData['char-species'] || 'Human'} | {characterData['char-occu'] || 'Freelancer'}
            </p>
          </div>

          {/* Bio Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950/60 p-3 rounded border border-slate-800">
            <div><span className="text-slate-400 font-bold block">ORIGIN:</span> {characterData['char-origin'] || 'N/A'}</div>
            <div><span className="text-slate-400 font-bold block">FACTION:</span> {characterData['char-faction'] || 'N/A'}</div>
            <div><span className="text-slate-400 font-bold block">AGE / GENDER:</span> {characterData['char-age'] || '-'} / {characterData['char-gender'] || '-'}</div>
            <div><span className="text-slate-400 font-bold block">HEIGHT / WEIGHT:</span> {characterData['char-height'] || '-'} / {characterData['char-weight'] || '-'}</div>
          </div>

          {/* Attributes Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-1">
              Core Attributes
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
              {['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].map((attr) => (
                <div key={attr} className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    {attr.slice(0, 3)}
                  </span>
                  <span className="text-base font-bold text-cyan-300">
                    {parseInt(characterData[`attr-${attr}`] || 0, 10) + parseInt(characterData[`attr-${attr}-mod`] || 0, 10)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals & Status Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-1">
              Combat & Vitals Status
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">HEALTH</span>
                <span className="text-sm font-bold text-emerald-400">{characterData['health'] ?? 30}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">VITALITY</span>
                <span className="text-sm font-bold text-purple-400">{characterData['vitality'] ?? 30}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">TECH LEVEL</span>
                <span className="text-sm font-bold text-amber-400">{characterData['tech-level'] ?? 3}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">META LEVEL</span>
                <span className="text-sm font-bold text-cyan-300">{characterData['magic-level'] ?? 1}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">KARMA</span>
                <span className="text-sm font-bold text-yellow-400">{characterData['karma'] ?? 3}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">ESSENCE</span>
                <span className="text-sm font-bold text-cyan-300">
                  {(['strength', 'agility', 'stamina', 'intellect', 'wisdom', 'charisma'].reduce((sum, a) => sum + (parseInt(characterData[`attr-${a}`] || 0, 10) + parseInt(characterData[`attr-${a}-mod`] || 0, 10)), 0)) +
                   (Object.keys(characterData).filter(k => (k.startsWith('skill-meta-') || k.startsWith('skill-meta-attune')) && k.endsWith('-rank')).reduce((sum, k) => sum + (parseInt(characterData[k] || 0, 10)), 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Abilities & Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1">
                Features & Abilities
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {getArray('features').map((f, i) => <li key={i}>{f}</li>)}
                {getArray('special_abilities').map((sa, i) => <li key={i}>{sa}</li>)}
                {getArray('awakened').map((d, i) => <li key={i}>{d} (Discipline)</li>)}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1">
                Equipment & Property
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {getArray('weapons').map((w, i) => <li key={i}>{typeof w === 'object' ? w.name : w}</li>)}
                {getArray('armoring').map((a, i) => <li key={i}>{typeof a === 'object' ? a.name : a}</li>)}
                {getArray('gear').map((g, i) => <li key={i}>{typeof g === 'object' ? g.name : g}</li>)}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(PreviewModal);
