import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFolio } from '../../../context/FolioContext';
import { extractCreatorInfo } from '../../../utils/creatorUtils';
import { AudioService } from '../../../services/audioService';
import { 
  Users, X, Plus, Sparkles, Search, Copy, Check, Trash2, 
  ChevronRight, ArrowUpRight, Lock 
} from 'lucide-react';
import { confirmTypedDeletion } from '../../../utils/confirmationUtils';

export const FolioRosterDrawer = ({ onClose, onOpenSheet, onOpenDrawer }) => {
  const navigate = useNavigate();
  const {
    personaRoster,
    roster,
    characterData,
    switchRosterCharacter,
    handleNewCharacter,
    duplicateRosterCharacter,
    deleteRosterCharacter,
    togglePersonaVisibility,
    loadPublicPersonas,
    publicCatalog,
    clonePublicPersona
  } = useFolio();

  const [rosterTab, setRosterTab] = useState('my-roster');
  const [rosterSearch, setRosterSearch] = useState('');
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [copiedLink, setCopiedLink] = useState('');
  const [isFetchingPublic, setIsFetchingPublic] = useState(false);

  const activeDocId = characterData?.['character-doc-id'] || '';

  const getFieldValue = (val) => {
    if (!val) return 'Unspecified';
    if (typeof val === 'object') return val.name || val.title || 'Unspecified';
    return String(val).trim() || 'Unspecified';
  };

  const handleCopyShareLink = (url, key) => {
    AudioService.playTerminalBeep(1200, 0.03);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(key);
        setTimeout(() => setCopiedLink(''), 2500);
      });
    } else {
      prompt('Copy share link:', url);
    }
  };

  const handleOpenOperative = (docId) => {
    AudioService.playTerminalBeep(1200, 0.03);
    switchRosterCharacter(docId);
    if (onOpenSheet) {
      onOpenSheet();
    } else if (onOpenDrawer) {
      onOpenDrawer('persona-sheet');
    } else {
      navigate('/folio');
    }
  };

  const activeList = rosterTab === 'my-roster' ? (personaRoster || roster || []) : (publicCatalog || []);
  
  const filtered = activeList.filter((char) => {
    if (!rosterSearch.trim()) return true;
    const q = rosterSearch.toLowerCase();
    const name = (char['char-name'] || '').toLowerCase();
    const species = getFieldValue(char['char-species']).toLowerCase();
    const faction = getFieldValue(char['char-faction']).toLowerCase();
    const origin = getFieldValue(char['char-origin']).toLowerCase();
    const occupation = getFieldValue(char['char-occu']).toLowerCase();
    return name.includes(q) || species.includes(q) || faction.includes(q) || origin.includes(q) || occupation.includes(q);
  });

  return (
    <div className="flex flex-col h-full space-y-3.5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold uppercase">
              PERSONA FOLIO
            </span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="text-slate-400 font-mono text-xs">OPERATIVE CATALOG</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Character Roster
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.03);
              if (onOpenSheet) onOpenSheet();
              else if (onOpenDrawer) onOpenDrawer('persona-sheet');
              else navigate('/folio');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-folio-guided-creator'));
              }, 100);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} /> Guided Creator
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1300, 0.03);
              handleNewCharacter();
              if (onOpenSheet) onOpenSheet();
              else if (onOpenDrawer) onOpenDrawer('persona-sheet');
              else navigate('/folio');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> New Sheet
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1200, 0.02);
              navigate('/folio');
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono font-bold uppercase transition-colors hidden sm:flex items-center gap-1"
            title="Open Full Browser View (/folio)"
          >
            <ArrowUpRight size={13} />
            <span>FULL BROWSER</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Drawer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setRosterTab('my-roster');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              rosterTab === 'my-roster'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Users size={13} /> My Operatives ({personaRoster?.length || 0})
          </button>

          <button
            onClick={() => {
              AudioService.playTerminalBeep(1000, 0.02);
              setRosterTab('public-gallery');
              if (loadPublicPersonas) {
                setIsFetchingPublic(true);
                loadPublicPersonas().finally(() => setIsFetchingPublic(false));
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              rosterTab === 'public-gallery'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>🌐</span> Public Community ({publicCatalog?.length || 0})
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter operatives..."
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Operatives Vertical Stacked Gem-Like List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[calc(100vh-320px)]">
        {isFetchingPublic ? (
          <div className="p-10 text-center border border-dashed border-amber-500/30 rounded-xl bg-slate-950/40">
            <span className="text-2xl block mb-2 animate-bounce">🌐</span>
            <h4 className="text-sm font-mono font-bold text-amber-300 uppercase animate-pulse">
              Connecting to Community Network...
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Fetching shared operatives from public database.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          rosterTab === 'public-gallery' ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <span className="text-3xl block mb-2">🌐</span>
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Public Community Operatives Found</h4>
              <p className="text-xs text-slate-500 font-mono mt-1 mb-3 max-w-sm mx-auto">
                {rosterSearch 
                  ? `No public community operatives match "${rosterSearch}".` 
                  : 'No operatives have been shared with the community yet.'}
              </p>
              {!rosterSearch && (
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg max-w-sm mx-auto text-left">
                  <p className="text-[11px] text-slate-400 font-mono">
                    💡 <strong className="text-cyan-300">How to share:</strong> Switch to <span className="text-cyan-300 font-bold">My Operatives</span> and toggle the <span className="text-amber-300 font-bold">Private/Public</span> badge on any character to make it available to other players.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Users size={28} className="mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-mono font-bold text-slate-300 uppercase">No Operatives Found</h4>
              <p className="text-xs text-slate-500 font-mono mt-1 mb-4">
                {rosterSearch ? `No character sheets match "${rosterSearch}".` : 'Create your first operative persona to get started.'}
              </p>
              <button
                onClick={() => {
                  handleNewCharacter();
                  if (onOpenSheet) onOpenSheet();
                  else if (onOpenDrawer) onOpenDrawer('persona-sheet');
                  else navigate('/folio');
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase rounded-lg shadow inline-flex items-center gap-1.5"
              >
                <Plus size={13} /> Create Sheet
              </button>
            </div>
          )
        ) : (
          <div className="space-y-1.5">
            {filtered.map(char => {
              const docId = char['character-doc-id'] || char.id;
              const isActive = docId === activeDocId;
              const name = char['char-name'] || 'UNNAMED OPERATIVE';
              const species = getFieldValue(char['char-species']);
              const faction = getFieldValue(char['char-faction']);
              const origin = getFieldValue(char['char-origin']);
              const occu = getFieldValue(char['char-occu']);
              const creatorInfo = extractCreatorInfo(char);
              const shareUrl = `${window.location.origin}/folio?user=${char.ownerUid || ''}&id=${docId}`;
              const initial = (name.charAt(0) || 'O').toUpperCase();
              const isLocked = Boolean(char.is_locked || char.folio_phase === 'locked');

              return (
                <div
                  key={docId || name}
                  onClick={() => {
                    if (rosterTab === 'my-roster') {
                      handleOpenOperative(docId);
                    } else {
                      AudioService.playTerminalBeep(1200, 0.03);
                      clonePublicPersona(char.ownerUid, docId);
                      if (onOpenSheet) onOpenSheet();
                      else if (onOpenDrawer) onOpenDrawer('persona-sheet');
                      else navigate('/folio');
                    }
                  }}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-cyan-500/60 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Left: Gem Avatar & Details */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Gem Avatar Pill */}
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.2)] shrink-0">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white font-mono uppercase group-hover:text-cyan-200 transition-colors truncate">
                          {name}
                        </span>
                        {isLocked && (
                          <span
                            className="px-1.5 py-0.2 bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 rounded text-[8.5px] font-mono font-bold flex items-center gap-1 shadow-[0_0_6px_rgba(6,182,212,0.3)]"
                            title="Dossier Locked & Set for VTT"
                          >
                            <Lock size={9} className="text-cyan-400" />
                            <span>Locked</span>
                          </span>
                        )}
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded text-[8.5px] font-bold font-mono uppercase">
                            ACTIVE
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-[8.5px] font-mono font-bold">
                          {creatorInfo.creatorTag}
                        </span>
                      </div>

                      {/* Compact Gem Metadata Chips */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5 truncate flex-wrap">
                        <span className="text-slate-300">{species}</span>
                        <span>•</span>
                        <span className="text-slate-400">{occu}</span>
                        {faction !== 'Unspecified' && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300/90">{faction}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">CP: {char['starting-cp'] || 150}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {rosterTab === 'my-roster' ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (togglePersonaVisibility) togglePersonaVisibility(docId, !char.isPublic);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border transition-colors ${
                            char.isPublic
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="Toggle Public Sharing"
                        >
                          {char.isPublic ? 'Public' : 'Private'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            AudioService.playTerminalBeep(1100, 0.02);
                            duplicateRosterCharacter(docId);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono uppercase font-bold"
                          title="Clone persona"
                        >
                          Clone
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetName = name || 'Unnamed Operative';
                            if (confirmTypedDeletion(targetName, 'operative persona')) {
                              deleteRosterCharacter(docId);
                            }
                          }}
                          className="p-1.5 bg-red-950/30 hover:bg-red-900 text-red-400 rounded border border-red-800/40"
                          title="Delete persona"
                        >
                          <Trash2 size={12} />
                        </button>

                        <button
                          onClick={() => handleOpenOperative(docId)}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold uppercase shadow transition-colors flex items-center gap-1"
                        >
                          <span>Open Sheet</span>
                          <ChevronRight size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopyShareLink(shareUrl, docId)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1"
                        >
                          {copiedLink === docId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedLink === docId ? 'Copied' : 'Share'}</span>
                        </button>

                        <button
                          onClick={() => {
                            AudioService.playTerminalBeep(1200, 0.03);
                            clonePublicPersona(char.ownerUid, docId);
                            if (onOpenSheet) onOpenSheet();
                            else if (onOpenDrawer) onOpenDrawer('persona-sheet');
                            else navigate('/folio');
                          }}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold uppercase shadow flex items-center gap-1"
                        >
                          <span>Import</span>
                          <ArrowUpRight size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteConfirmDocId && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-4 pt-16 pb-12 overflow-y-auto select-none font-sans">
          <div className="bg-slate-900 border border-red-500/70 rounded-xl max-w-md w-full p-5 text-slate-100 space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold font-mono uppercase text-red-400 flex items-center gap-2">
              <Trash2 size={16} /> Confirm Persona Deletion
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Are you sure you want to delete operative <strong className="text-white uppercase font-mono">"{deleteConfirmName}"</strong>? This action is permanent.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDocId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteRosterCharacter(deleteConfirmDocId);
                  setDeleteConfirmDocId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold uppercase shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolioRosterDrawer;
