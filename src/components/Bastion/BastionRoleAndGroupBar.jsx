import React, { useMemo } from 'react';
import { Eye, Users, Shield, Sparkles, UserCheck } from 'lucide-react';
import { useBastion } from '../../context/BastionContext';
import { useFolio } from '../../context/FolioContext';
import { extractGroupPersonas } from '../../services/bastionSessionService';

/**
 * Unified Role, Linguistic Voice ("you" vs "we"), Multi-Group Campaign Lens,
 * and Development Operator Preview bar shared across BASTION surfaces.
 */
export const BastionRoleAndGroupBar = ({ compact = false, onRoleChange }) => {
  const {
    sessionState,
    previewConfig,
    toggleOperatorPreview,
    setFocusGroupId,
    setPreviewGroupId,
    setPreviewPersonaId,
  } = useBastion();
  const folio = useFolio() || {};

  const safeSession = sessionState || {
    effectiveRole: 'operator',
    isArchitect: false,
    isOperator: true,
    isOperatorPreview: false,
    canToggleOperatorPreview: false,
    sessionGroups: [],
    allGroups: [],
    operatorGroups: [],
    focusedGroup: null,
    focusGroupId: 'all',
    activePersona: null,
  };

  const selectableGroups = useMemo(() => {
    if (safeSession.sessionGroups?.length > 0) return safeSession.sessionGroups;
    if (safeSession.allGroups?.length > 0) return safeSession.allGroups;
    return [];
  }, [safeSession.sessionGroups, safeSession.allGroups]);

  const previewablePersonas = useMemo(() => {
    const map = new Map();
    const groupPersonas = safeSession.focusedGroup
      ? extractGroupPersonas(safeSession.focusedGroup)
      : [];
    groupPersonas.forEach((p) => {
      if (p?.personaId) {
        map.set(String(p.personaId), {
          id: String(p.personaId),
          name: p.name || 'Operative',
          archetype: p.archetype || '',
          source: 'Squad',
        });
      }
    });

    const roster = folio.personaRoster || folio.roster || [];
    if (Array.isArray(roster)) {
      roster.forEach((r) => {
        const id = r?.id || r?.['character-doc-id'] || r?.personaId;
        if (id && !map.has(String(id))) {
          map.set(String(id), {
            id: String(id),
            name: r?.['char-name'] || r?.name || 'Roster Persona',
            archetype: r?.['char-archetype'] || r?.archetype || '',
            source: 'Roster',
          });
        }
      });
    }

    const activeChar = folio.characterData || folio.activePersona;
    const activeCharId =
      activeChar?.['character-doc-id'] || activeChar?.id || 'active-folio';
    if (activeChar?.['char-name'] && !map.has(String(activeCharId))) {
      map.set(String(activeCharId), {
        id: String(activeCharId),
        name: activeChar['char-name'],
        archetype: activeChar['char-archetype'] || '',
        source: 'Active Folio',
      });
    }

    return Array.from(map.values());
  }, [safeSession.focusedGroup, folio.personaRoster, folio.roster, folio.characterData, folio.activePersona]);

  const handleTogglePreview = () => {
    const nextPreview = !safeSession.isOperatorPreview;
    toggleOperatorPreview?.(nextPreview);
    if (typeof onRoleChange === 'function') {
      onRoleChange(nextPreview ? 'operator' : 'architect');
    }
  };

  return (
    <div
      className={`border-b border-slate-800/90 bg-slate-950/95 shrink-0 font-mono ${
        compact ? 'px-2.5 py-1.5 space-y-1.5 text-[10px]' : 'px-3.5 py-2 space-y-1.5 text-[10px]'
      }`}
    >
      {/* Top Row: Linguistic & Epistemic Mode Pill + Multi-Group Badge + Dev Operator Preview Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {safeSession.isArchitect ? (
            <span
              className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/60 text-purple-200 font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(168,85,247,0.25)]"
              title="BASTION Co-Architect Mode: Partnered plural ('we' / 'us' / 'our') voice + Full Campaign & Volume II Omnicortex access"
            >
              <Sparkles size={11} className="text-purple-300 shrink-0" />
              <span>ARCHITECT (&ldquo;WE&rdquo;)</span>
            </span>
          ) : safeSession.isOperatorPreview ? (
            <span
              className="px-2 py-0.5 rounded bg-amber-950/85 border border-amber-500/70 text-amber-200 font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
              title="Development Operator Preview: Simulating direct 2nd-person ('you' / 'your') Operator voice & strict epistemic firewall"
            >
              <Eye size={11} className="text-amber-300 animate-pulse shrink-0" />
              <span>OPERATOR PREVIEW (&ldquo;YOU&rdquo;)</span>
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 font-bold uppercase tracking-wider flex items-center gap-1"
              title="BASTION Tactical Advisor Mode: Direct ('you' / 'your') voice + Player-scoped Volume I rules"
            >
              <Shield size={11} className="text-emerald-300 shrink-0" />
              <span>OPERATOR (&ldquo;YOU&rdquo;)</span>
            </span>
          )}

          {selectableGroups.length > 1 && (
            <span
              className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[9px] font-bold uppercase flex items-center gap-1"
              title={`${selectableGroups.length} active groups available in session`}
            >
              <Users size={10} />
              <span>{selectableGroups.length} Groups</span>
            </span>
          )}
        </div>

        {/* Dev / Architect Operator Preview Toggle */}
        {safeSession.canToggleOperatorPreview && (
          <button
            type="button"
            onClick={handleTogglePreview}
            className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              safeSession.isOperatorPreview
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-200'
            }`}
            title={
              safeSession.isOperatorPreview
                ? 'Exit Operator Preview and return to partnered Architect ("we") view'
                : 'Preview BASTION as an Operator ("you") with group/persona epistemic scoping'
            }
          >
            <Eye size={11} />
            <span>{safeSession.isOperatorPreview ? 'Exit Preview' : 'Operator Preview'}</span>
          </button>
        )}
      </div>

      {/* Second Row: Multi-Group Campaign Lens OR Operator Preview Group/Persona Selectors */}
      {(safeSession.isArchitect && selectableGroups.length > 0) && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-slate-400 uppercase text-[9px] font-bold shrink-0 flex items-center gap-1">
            <Users size={10} className="text-cyan-400" />
            <span>Campaign Lens:</span>
          </span>
          <select
            aria-label="Architect Campaign Group Lens"
            value={previewConfig?.focusGroupId || 'all'}
            onChange={(e) => setFocusGroupId?.(e.target.value)}
            className="flex-1 min-w-0 bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded px-2 py-0.5 text-[10px] text-cyan-200 outline-none cursor-pointer"
          >
            <option value="all">
              All Campaign Groups ({selectableGroups.length}) — Synchronized We-View
            </option>
            {selectableGroups.map((g) => {
              const pCount = extractGroupPersonas(g).length;
              const loc = g.currentLocation || g.activeSceneTitle || '';
              return (
                <option key={g.id} value={g.id}>
                  {g.name || g.id} ({pCount} {pCount === 1 ? 'persona' : 'personas'}
                  {loc ? ` • ${loc}` : ''})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {safeSession.isOperatorPreview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-amber-400/90 uppercase text-[9px] font-bold shrink-0 flex items-center gap-0.5">
              <Users size={10} />
              <span>Group:</span>
            </span>
            <select
              aria-label="Preview Operator Group"
              value={safeSession.focusedGroup?.id || previewConfig?.previewGroupId || ''}
              onChange={(e) => setPreviewGroupId?.(e.target.value || null)}
              className="flex-1 min-w-0 bg-slate-900 border border-amber-500/40 rounded px-1.5 py-0.5 text-[10px] text-amber-100 outline-none cursor-pointer"
            >
              <option value="">Solo / Ungrouped Operator</option>
              {selectableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <span className="text-amber-400/90 uppercase text-[9px] font-bold shrink-0 flex items-center gap-0.5">
              <UserCheck size={10} />
              <span>Persona:</span>
            </span>
            <select
              aria-label="Preview Operator Persona"
              value={previewConfig?.previewPersonaId || safeSession.activePersona?.id || safeSession.activePersona?.['character-doc-id'] || ''}
              onChange={(e) => setPreviewPersonaId?.(e.target.value || null)}
              className="flex-1 min-w-0 bg-slate-900 border border-amber-500/40 rounded px-1.5 py-0.5 text-[10px] text-amber-100 outline-none cursor-pointer"
            >
              <option value="">Active Folio Persona</option>
              {previewablePersonas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.archetype ? ` (${p.archetype})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!safeSession.isArchitect &&
        !safeSession.isOperatorPreview &&
        safeSession.operatorGroups?.length > 1 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-emerald-400 uppercase text-[9px] font-bold shrink-0">
              Your Active Squad:
            </span>
            <select
              aria-label="Your Active Squad"
              value={safeSession.focusedGroup?.id || ''}
              onChange={(e) => setPreviewGroupId?.(e.target.value || null)}
              className="flex-1 min-w-0 bg-slate-900 border border-emerald-500/40 rounded px-2 py-0.5 text-[10px] text-emerald-100 outline-none cursor-pointer"
            >
              {safeSession.operatorGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || g.id}
                </option>
              ))}
            </select>
          </div>
        )}
    </div>
  );
};

export default BastionRoleAndGroupBar;
