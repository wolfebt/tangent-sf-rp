import React, { useState } from 'react';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';
import { AudioService } from '../../../services/audioService';
import { Users, Globe, Search, LayoutGrid, List, Plus, Sparkles, Copy, Trash2, Edit3, Share2, Eye, EyeOff, Shield, Activity, Award, User, Lock, ExternalLink } from 'lucide-react';

export const RosterCatalogView = ({
  personaRoster = [],
  activeDocId = '',
  onSelectCharacter,
  onNewCharacter,
  onGuidedCreator,
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

  const handleTabSwitch = (tab) => {
    AudioService.playTerminalBeep(1150, 0.02);
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

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>OPERATIVE CATALOG</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-normal">
                  {filteredRoster.length} Dossiers
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Select an operative to inspect or edit their dossier, create a new persona, or explore the public gallery.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onGuidedCreator && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.03);
                onGuidedCreator();
              }}
              className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Guided Creator</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              onNewCharacter();
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Blank Sheet</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 border-b border-slate-800/80 shrink-0">
        {/* Gallery / Roster Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabSwitch('my-roster')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              catalogTab === 'my-roster'
                ? 'bg-cyan-950 border border-cyan-400/80 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users size={13} />
            <span>My Operatives</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {personaRoster.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('public-gallery')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              catalogTab === 'public-gallery'
                ? 'bg-purple-950 border border-purple-400/80 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe size={13} />
            <span>Public Gallery</span>
            {isFetchingPublic ? (
              <span className="w-2.5 h-2.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin ml-1" />
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {publicCatalog.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto min-w-0">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, species, faction, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'card' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'}`}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'}`}
              title="Table Directory View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Content Area */}
      <div className="flex-1 overflow-y-auto py-4">
        {filteredRoster.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
              <Users size={28} />
            </div>
            <p className="text-sm font-bold text-slate-400">NO OPERATIVES FOUND</p>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              {searchQuery ? `No dossiers match "${searchQuery}".` : catalogTab === 'my-roster' ? 'Your operative roster is currently empty. Click Guided Creator or New Blank Sheet to begin.' : 'No public dossiers loaded yet.'}
            </p>
            {catalogTab === 'my-roster' && (
              <button
                type="button"
                onClick={onNewCharacter}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors"
              >
                Create First Operative
              </button>
            )}
          </div>
        ) : viewMode === 'card' ? (
          /* Card Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredRoster.map((char) => {
              const docId = char['character-doc-id'] || char.id;
              const isActive = docId === activeDocId;
              const charName = char['char-name'] || 'Unnamed Operative';
              const species = getFieldValue(char['char-species']);
              const faction = getFieldValue(char['char-faction']);
              const origin = getFieldValue(char['char-origin']);
              const occupation = getFieldValue(char['char-occu']);
              const archetype = getFieldValue(char['char-archetype']);
              const isPublic = Boolean(char.isPublic);
              const author = char.authorHandle || char.creatorHandle || 'Operator';
              const isDeletingThis = deleteConfirmDocId === docId;
              const isLocked = Boolean(char.is_locked || char.folio_phase === 'locked');

              return (
                <div
                  key={docId}
                  className={`bg-[#121722]/90 hover:bg-[#161c2b] border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group relative shadow-md ${
                    isActive
                      ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] bg-[#101b2b]'
                      : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400 text-[9.5px] font-mono font-bold text-cyan-300 uppercase">
                            Active Dossier
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[9.5px] font-mono text-slate-300 uppercase">
                          {archetype !== 'Unspecified' ? archetype : 'Operative'}
                        </span>
                        {isLocked && (
                          <span 
                            className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9.5px] font-mono font-bold uppercase flex items-center gap-1 shadow-[0_0_6px_rgba(6,182,212,0.3)]"
                            title="Dossier Locked & Set for VTT"
                          >
                            <Lock size={10} className="text-cyan-400" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      {catalogTab === 'my-roster' ? (
                        <button
                          type="button"
                          onClick={() => onToggleVisibility && onToggleVisibility(docId, !isPublic)}
                          className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer border ${
                            isPublic
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                          title={isPublic ? 'Public Persona (Click to make Private)' : 'Private Persona (Click to make Public)'}
                        >
                          {isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                          <span>{isPublic ? 'Public' : 'Private'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-purple-400">
                          by @{author}
                        </span>
                      )}
                    </div>

                    {/* Operative Name */}
                    <h3 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                      {charName}
                    </h3>

                    {/* Meta Traits Grid */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Species</span>
                        <span className="text-slate-300 truncate block font-bold">{species}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Faction</span>
                        <span className="text-slate-300 truncate block font-bold">{faction}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Origin</span>
                        <span className="text-slate-300 truncate block">{origin}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Occupation</span>
                        <span className="text-slate-300 truncate block">{occupation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {catalogTab === 'my-roster' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            AudioService.playTerminalBeep(1100, 0.02);
                            onSelectCharacter(docId);
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                              : 'bg-slate-800 hover:bg-cyan-950 hover:border-cyan-500/50 hover:text-cyan-300 border border-slate-700 text-slate-200'
                          }`}
                        >
                          <User size={12} />
                          <span>{isActive ? 'Edit Dossier' : 'Open Sheet'}</span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {isPublic && (
                            <button
                              type="button"
                              onClick={() => handleCopyShareLink(char.ownerUid, docId)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="Copy Public Share Link"
                            >
                              <Share2 size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDuplicateCharacter && onDuplicateCharacter(docId)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Clone Operative"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirmTypedDeletion(charName, 'operative dossier')) {
                                onDeleteCharacter(docId);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Operative"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectPublicPersona && onSelectPublicPersona(char)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onClonePublicPersona && onClonePublicPersona(char)}
                          className="py-1.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Clone to My Operatives"
                        >
                          <Copy size={12} />
                          <span>Clone</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table Directory View */
          <div className="bg-[#121722]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Operative Name</th>
                    <th className="py-3 px-3">Species</th>
                    <th className="py-3 px-3">Faction</th>
                    <th className="py-3 px-3">Archetype</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRoster.map((char) => {
                    const docId = char['character-doc-id'] || char.id;
                    const isActive = docId === activeDocId;
                    const charName = char['char-name'] || 'Unnamed Operative';
                    const species = getFieldValue(char['char-species']);
                    const faction = getFieldValue(char['char-faction']);
                    const archetype = getFieldValue(char['char-archetype']);
                    const isPublic = Boolean(char.isPublic);
                    const isLocked = Boolean(char.is_locked || char.folio_phase === 'locked');

                    return (
                      <tr
                        key={docId}
                        className={`hover:bg-slate-800/40 transition-colors ${isActive ? 'bg-cyan-950/30' : ''}`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                          {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                          <span className="uppercase">{charName}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{species}</td>
                        <td className="py-3 px-3 text-slate-400">{faction}</td>
                        <td className="py-3 px-3 text-slate-400">{archetype}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isLocked && (
                              <span 
                                className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[9px] uppercase font-bold flex items-center gap-1 shadow-[0_0_6px_rgba(6,182,212,0.3)]"
                                title="Dossier Locked & Set for VTT"
                              >
                                <Lock size={9} className="text-cyan-400" />
                                <span>Locked</span>
                              </span>
                            )}
                            {isPublic ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] uppercase font-bold">
                                Public
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-700 text-[9px] uppercase">
                                Private
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {catalogTab === 'my-roster' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onSelectCharacter(docId)}
                                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10.5px] font-bold rounded-lg uppercase cursor-pointer"
                                >
                                  {isActive ? 'Edit' : 'Select'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDuplicateCharacter && onDuplicateCharacter(docId)}
                                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                                  title="Clone"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirmTypedDeletion(charName, 'operative dossier')) {
                                      onDeleteCharacter(docId);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onClonePublicPersona && onClonePublicPersona(char)}
                                className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-[10.5px] font-bold rounded-lg uppercase cursor-pointer flex items-center gap-1"
                              >
                                <Copy size={11} /> Clone
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RosterCatalogView;
