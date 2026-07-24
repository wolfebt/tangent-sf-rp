import React from 'react';

export const RosterModal = ({
  isOpen,
  onClose,
  personaRoster = [],
  activeDocId = '',
  onSelectCharacter,
  onSaveCurrent,
  onNewCharacter,
  onDuplicateCharacter,
  onDeleteCharacter
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">PERSONA PORTFOLIO</span>
            <h2 className="text-xl font-bold text-amber-400 uppercase tracking-wider">
              Character Selection Roster
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSaveCurrent();
                alert("Current Persona saved to roster!");
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase shadow transition-colors"
            >
              + Save Active Persona
            </button>
            <button
              onClick={() => {
                onNewCharacter();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase shadow transition-colors"
            >
              + New Blank Sheet
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold ml-3 text-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body - Saved Characters Roster Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {personaRoster.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
              <span className="text-4xl mb-3 block">📇</span>
              <h3 className="text-base font-bold text-slate-300 uppercase">No Saved Personas in Roster</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Save your active character folio to your roster to easily switch between characters or manage a campaign party.
              </p>
              <button
                onClick={onSaveCurrent}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs uppercase shadow"
              >
                Save Current Persona to Roster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personaRoster.map(char => {
                const docId = char['character-doc-id'];
                const isActive = docId === activeDocId;
                const name = char['char-name'] || 'UNNAMED OPERATIVE';
                const species = char['char-species'] || 'Unknown Species';
                const occupation = char['char-occu'] || 'Unknown Occupation';
                const startingCP = char['starting-cp'] || 150;

                return (
                  <div
                    key={docId || name}
                    className={`p-4 rounded-lg border flex flex-col justify-between transition-all ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            {name}
                          </h4>
                          <span className="text-[10px] text-cyan-300 font-mono">
                            {species} • {occupation}
                          </span>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9px] font-bold uppercase tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 my-2 pt-2 border-t border-slate-900">
                        <div>
                          <span className="block text-[9px] text-slate-500 uppercase">Starting CP</span>
                          <span className="text-white font-bold">{startingCP} CP</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-500 uppercase">Tech / Magic</span>
                          <span className="text-white font-bold">TL-{char['tech-level'] || 3} / ML-{char['magic-level'] || 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-slate-800/80">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onDuplicateCharacter(docId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-bold uppercase transition-colors"
                          title="Duplicate persona"
                        >
                          📋 Clone
                        </button>
                        <button
                          onClick={() => onDeleteCharacter(docId)}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase transition-colors"
                          title="Delete persona"
                        >
                          🗑️
                        </button>
                      </div>

                      {!isActive ? (
                        <button
                          onClick={() => {
                            onSelectCharacter(docId);
                            onClose();
                          }}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase shadow transition-colors"
                        >
                          Select Persona
                        </button>
                      ) : (
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Currently Active</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterModal;
