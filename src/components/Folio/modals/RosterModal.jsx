import React, { useState } from 'react';

export const RosterModal = ({
  isOpen,
  onClose,
  personaRoster = [],
  activeDocId = '',
  onSelectCharacter,
  onSaveCurrent,
  onNewCharacter,
  onDuplicateCharacter,
  onDeleteCharacter,
  onUpdateNote,
  onToggleVisibility,
  onLoadPublicGallery,
  publicCatalog = [],
  onSelectPublicPersona,
  onClonePublicPersona
}) => {
  const [catalogTab, setCatalogTab] = useState('my-roster'); // 'my-roster' | 'public-gallery'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [editingNoteDocId, setEditingNoteDocId] = useState(null);
  const [noteTextState, setNoteTextState] = useState('');
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isFetchingPublic, setIsFetchingPublic] = useState(false);

  if (!isOpen) return null;

  const handleTabSwitch = (tab) => {
    setCatalogTab(tab);
    if (tab === 'public-gallery' && onLoadPublicGallery) {
      setIsFetchingPublic(true);
      onLoadPublicGallery().finally(() => setIsFetchingPublic(false));
    }
  };

  const handleCopyShareLink = (ownerUid, docId) => {
    const url = `${window.location.origin}/folio?user=${ownerUid || ''}&id=${docId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`Public Share Link copied to clipboard:\n\n${url}`);
      }).catch(() => {
        prompt("Copy this public share link:", url);
      });
    } else {
      prompt("Copy this public share link:", url);
    }
  };

  // Helper to extract string value from identity fields
  const getFieldValue = (val) => {
    if (!val) return 'Unspecified';
    if (typeof val === 'object') return val.name || val.title || 'Unspecified';
    return String(val).trim() || 'Unspecified';
  };

  const activeSourceList = catalogTab === 'my-roster' ? personaRoster : publicCatalog;

  // Filter roster by search query
  const filteredRoster = activeSourceList.filter((char) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (char['char-name'] || '').toLowerCase();
    const species = getFieldValue(char['char-species']).toLowerCase();
    const faction = getFieldValue(char['char-faction']).toLowerCase();
    const origin = getFieldValue(char['char-origin']).toLowerCase();
    const occupation = getFieldValue(char['char-occu']).toLowerCase();
    const author = (char.authorHandle || char.creatorHandle || '').toLowerCase();
    const notesText = (char.notes && Array.isArray(char.notes) ? char.notes.map(n => n.text || '').join(' ') : '').toLowerCase();
    const tagsText = (char.tags ? (Array.isArray(char.tags) ? char.tags.join(' ') : String(char.tags)) : '').toLowerCase();

    return (
      name.includes(query) ||
      species.includes(query) ||
      faction.includes(query) ||
      origin.includes(query) ||
      occupation.includes(query) ||
      author.includes(query) ||
      notesText.includes(query) ||
      tagsText.includes(query)
    );
  });

  const handleStartEditNote = (docId, currentNoteText) => {
    setEditingNoteDocId(docId);
    setNoteTextState(currentNoteText || '');
  };

  const handleSaveNote = (docId) => {
    if (onUpdateNote) {
      onUpdateNote(docId, noteTextState);
    }
    setEditingNoteDocId(null);
  };

  const promptDeleteConfirmation = (docId, name) => {
    setDeleteConfirmDocId(docId);
    setDeleteConfirmName(name || 'Unnamed Operative');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmDocId) {
      onDeleteCharacter(deleteConfirmDocId);
    }
    setDeleteConfirmDocId(null);
    setDeleteConfirmName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">STORY FOUNDRY</span>
              <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-[9px] font-mono uppercase font-bold">
                OPERATIVE CATALOG
              </span>
            </div>
            <h2 className="text-xl font-bold text-amber-400 uppercase tracking-wider mt-0.5">
              Character Roster
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onSaveCurrent();
                alert("Active Persona saved to catalog roster!");
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase shadow transition-colors flex items-center gap-1"
            >
              <span>+</span> Save Active
            </button>
            <button
              onClick={() => {
                onNewCharacter();
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold uppercase shadow transition-colors flex items-center gap-1"
            >
              <span>+</span> New Sheet
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold ml-2 text-lg px-2">
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher & Filter Bar */}
        <div className="bg-slate-950/90 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleTabSwitch('my-roster')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                catalogTab === 'my-roster'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              My Roster ({personaRoster.length})
            </button>
            <button
              onClick={() => handleTabSwitch('public-gallery')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                catalogTab === 'public-gallery'
                  ? 'bg-amber-950 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Public Gallery ({publicCatalog.length})
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Layout:</span>
            <button
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] transition-colors ${
                viewMode === 'card'
                  ? 'bg-cyan-600 text-white border border-cyan-400'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] transition-colors ${
                viewMode === 'table'
                  ? 'bg-cyan-600 text-white border border-cyan-400'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-950/80 p-3 px-6 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder={catalogTab === 'my-roster' ? "Search my roster..." : "Search community public operatives by name, species, author..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {personaRoster.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
              <h3 className="text-base font-bold text-slate-300 uppercase">No Saved Operatives in Catalog</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Save your active character folio to your catalog to easily manage your party or switch between characters.
              </p>
              <button
                onClick={onSaveCurrent}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs uppercase shadow"
              >
                Save Current Active Persona
              </button>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-lg">
              <span className="text-2xl mb-2 block">🔍</span>
              <h4 className="text-sm font-bold text-slate-400 uppercase">No Operatives Match Search Criteria</h4>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query "{searchQuery}".</p>
            </div>
          ) : viewMode === 'card' ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoster.map(char => {
                const docId = char['character-doc-id'];
                const isActive = docId === activeDocId;
                const name = char['char-name'] || 'UNNAMED OPERATIVE';
                const species = getFieldValue(char['char-species']);
                const faction = getFieldValue(char['char-faction']);
                const origin = getFieldValue(char['char-origin']);
                const occupation = getFieldValue(char['char-occu']);

                const noteContent = (char.notes && Array.isArray(char.notes) && char.notes[0]?.text) ? char.notes[0].text : '';
                const isEditingThisNote = editingNoteDocId === docId;

                return (
                  <div
                    key={docId || name}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-b from-cyan-950/80 to-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Header Row */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white uppercase tracking-wider">
                              {name}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9px] font-bold uppercase tracking-wider">
                                ACTIVE
                              </span>
                            )}
                            {catalogTab === 'my-roster' && (
                              <button
                                onClick={() => onToggleVisibility && onToggleVisibility(docId, !char.isPublic)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                                  char.isPublic
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 hover:bg-cyan-900'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                                title="Toggle whether this character is publicly viewable by other players via link"
                              >
                                <span>{char.isPublic ? 'Public' : 'Private'}</span>
                              </button>
                            )}
                            {catalogTab === 'my-roster' && char.isPublic && (
                              <button
                                onClick={() => handleCopyShareLink(char.ownerUid, docId)}
                                className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded text-[9px] font-mono font-bold uppercase transition-colors"
                                title="Copy public share link to clipboard"
                              >
                                Share Link
                              </button>
                            )}
                            {catalogTab === 'public-gallery' && (
                              <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-600/50 rounded text-[9px] font-mono font-bold">
                                By {char.authorHandle || char.creatorHandle || 'Community Creator'}
                              </span>
                            )}
                            {((Array.isArray(char.tags) && char.tags.find(t => typeof t === 'string' && t.startsWith('@'))) || (typeof char.tags === 'string' && char.tags.includes('@'))) && (
                              <span className="px-2 py-0.5 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-mono font-bold">
                                {Array.isArray(char.tags) ? char.tags.find(t => typeof t === 'string' && t.startsWith('@')) : char.tags.split(',').map(t=>t.trim()).find(t => t.startsWith('@'))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Character Attributes Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Species</span>
                          <span className="text-slate-200 font-bold truncate" title={species}>{species}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Occupation</span>
                          <span className="text-slate-200 font-bold truncate" title={occupation}>{occupation}</span>
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Faction</span>
                          <span className="text-amber-300 font-bold truncate" title={faction}>{faction}</span>
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Origin</span>
                          <span className="text-cyan-300 font-bold truncate" title={origin}>{origin}</span>
                        </div>
                      </div>

                      {/* Tech/Magic Level Bar */}
                      <div className="flex justify-end items-center text-[10px] font-mono text-slate-400 px-1 my-2">
                        <span>TL-{char['tech-level'] || 3} / ML-{char['magic-level'] || 1}</span>
                      </div>

                      {/* Note Block */}
                      <div className="mt-3 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            Note Block
                          </span>
                          {!isEditingThisNote && catalogTab === 'my-roster' && (
                            <button
                              onClick={() => handleStartEditNote(docId, noteContent)}
                              className="text-[9px] text-slate-400 hover:text-cyan-300 underline uppercase"
                            >
                              {noteContent ? 'Edit Note' : '+ Add Note'}
                            </button>
                          )}
                        </div>

                        {isEditingThisNote ? (
                          <div className="space-y-2 mt-1">
                            <textarea
                              rows={3}
                              value={noteTextState}
                              onChange={(e) => setNoteTextState(e.target.value)}
                              placeholder="Write tactical notes, character background, or equipment logs..."
                              className="w-full p-2 bg-slate-950 border border-cyan-500/60 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNoteDocId(null)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNote(docId)}
                                className="px-3 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase rounded shadow"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-300 font-sans italic line-clamp-3 leading-relaxed">
                            {noteContent || <span className="text-slate-600 not-italic">No notes logged for this operative.</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                      {catalogTab === 'my-roster' ? (
                        <>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onDuplicateCharacter(docId)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-bold uppercase transition-colors"
                              title="Duplicate operative persona"
                            >
                              Clone
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
                            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider px-2">Currently Active</span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                          <button
                            onClick={() => handleCopyShareLink(char.ownerUid, docId)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-bold uppercase transition-colors"
                            title="Copy link to clipboard"
                          >
                            Share Link
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSelectPublicPersona(char.ownerUid, docId);
                                onClose();
                              }}
                              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-bold uppercase shadow transition-colors flex items-center gap-1"
                            >
                              View Sheet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Detailed Table View */
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-950 text-[10px] text-cyan-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Operative Name</th>
                    <th className="p-3">Species</th>
                    <th className="p-3">Faction</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3">Occupation</th>
                    <th className="p-3">Note Excerpt</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {filteredRoster.map(char => {
                    const docId = char['character-doc-id'];
                    const isActive = docId === activeDocId;
                    const name = char['char-name'] || 'UNNAMED OPERATIVE';
                    const species = getFieldValue(char['char-species']);
                    const faction = getFieldValue(char['char-faction']);
                    const origin = getFieldValue(char['char-origin']);
                    const occupation = getFieldValue(char['char-occu']);
                    const noteText = char.notes && Array.isArray(char.notes) ? char.notes[0]?.text : '';

                    return (
                      <tr key={docId || name} className={`hover:bg-slate-850 transition-colors ${isActive ? 'bg-cyan-950/40' : ''}`}>
                        <td className="p-3 whitespace-nowrap">
                          {isActive ? (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[9px] font-bold uppercase">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase">READY</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-white uppercase whitespace-nowrap">
                          {name}
                        </td>
                        <td className="p-3 text-slate-300 whitespace-nowrap">{species}</td>
                        <td className="p-3 text-amber-300 whitespace-nowrap">{faction}</td>
                        <td className="p-3 text-cyan-300 whitespace-nowrap">{origin}</td>
                        <td className="p-3 text-slate-300 whitespace-nowrap">{occupation}</td>
                        <td className="p-3 text-slate-400 italic text-[11px] max-w-xs truncate">
                          {noteText || '—'}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {catalogTab === 'my-roster' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onToggleVisibility && onToggleVisibility(docId, !char.isPublic)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                                  char.isPublic
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                                }`}
                                title="Toggle Public Visibility"
                              >
                                {char.isPublic ? 'Public' : 'Private'}
                              </button>
                              {char.isPublic && (
                                <button
                                  onClick={() => handleCopyShareLink(char.ownerUid, docId)}
                                  className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40 rounded text-[9px] font-mono font-bold uppercase"
                                  title="Copy Share Link"
                                >
                                  Share
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEditNote(docId, noteText)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] uppercase font-bold"
                                title="Edit Note"
                              >
                                Note
                              </button>
                              <button
                                onClick={() => onDuplicateCharacter(docId)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] uppercase font-bold"
                                title="Clone"
                              >
                                Clone
                              </button>
                              {!isActive && (
                                <button
                                  onClick={() => {
                                    onSelectCharacter(docId);
                                    onClose();
                                  }}
                                  className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] uppercase font-bold shadow"
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCopyShareLink(char.ownerUid, docId)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] uppercase font-bold"
                                title="Copy Share Link"
                              >
                                Share
                              </button>
                              <button
                                onClick={() => {
                                  onSelectPublicPersona(char.ownerUid, docId);
                                  onClose();
                                }}
                                className="px-2.5 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[10px] uppercase font-bold shadow"
                              >
                                View
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredRoster.length} of {personaRoster.length} Operatives
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase"
          >
            Close Catalog
          </button>
        </div>

        {/* MANDATORY DELETE CONFIRMATION OVERLAY */}
        {deleteConfirmDocId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-red-500/70 rounded-xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-slate-100 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-red-900/60 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <span>⚠️</span> Confirm Persona Deletion
                </h3>
                <button
                  onClick={() => {
                    setDeleteConfirmDocId(null);
                    setDeleteConfirmName('');
                  }}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to delete operative <strong className="text-white uppercase">"{deleteConfirmName}"</strong>? This will remove the character sheet and all associated stats from your catalog.
              </p>

              <div className="bg-red-950/30 border border-red-500/30 p-2.5 rounded text-[11px] text-red-300 font-mono">
                ⚠️ Warning: This action is permanent and cannot be undone.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmDocId(null);
                    setDeleteConfirmName('');
                  }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs uppercase font-bold tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterModal;
