import React from 'react';
import { Download, ExternalLink, Pin, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { getElementFileExtension } from '../elementSchemas';

/**
 * Shared vault action buttons for ElementForge cards and table rows.
 * Enforces strict OmniCortex protection: only pure Story Module drafts can be deleted;
 * Cortex and Folio entries only support Pin / Unpin (into Campaign-local elementsCatalog).
 */
export function ElementCardActions({
  el,
  variant = 'card',
  isStoryReadOnly = false,
  onTogglePin,
  onOpenFolio,
  onOpenCodex,
  onPullFromDbm,
  onExportAime,
  onExportMarkdown,
  onDeleteDraft,
  onEdit
}) {
  if (!el) return null;

  const isCortexOrFolio = Boolean(el.isCortexAsset || el.isFolioPersona);
  const isPureModuleDraft = Boolean(
    !el.isFolioPersona &&
      !el.isCortexAsset &&
      !el.fields?.dbmRef &&
      !el.dbmRef &&
      !el.dbmId
  );
  const canPullFromDbm = Boolean(
    el.isPinnedToModule &&
      (el.fields?.dbmRef || el.dbmRef || el.dbmId || el.dbmSyncStatus === 'synced')
  );
  const fileExt = getElementFileExtension(el.type, el.propertySubcategory);
  const gapClass = variant === 'table' ? 'gap-1.5 justify-end' : 'gap-1';

  return (
    <div className={`flex items-center ${gapClass}`}>
      {isCortexOrFolio && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin?.(el, e);
          }}
          className={`p-1.5 rounded border transition-colors cursor-pointer ${
            el.isPinnedToModule
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800 border-slate-700/70'
          }`}
          title={
            el.isPinnedToModule
              ? 'Unpin from Story Module (canonical record preserved)'
              : 'Pin to active Story Module'
          }
          aria-label={el.isPinnedToModule ? 'Unpin from Story Module' : 'Pin to Story Module'}
        >
          <Pin size={12} />
        </button>
      )}

      {el.isFolioPersona && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFolio?.(el, e);
          }}
          className="p-1.5 rounded text-purple-300 hover:text-purple-100 hover:bg-purple-950/70 border border-purple-500/30 transition-colors cursor-pointer"
          title="Open character sheet in Persona Folio"
          aria-label="Open in Persona Folio"
        >
          <ExternalLink size={12} />
        </button>
      )}

      {!el.isFolioPersona && el.codexMatrixId && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCodex?.(el, e);
          }}
          className="p-1.5 rounded text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors cursor-pointer"
          title={`Open in Codex Studio (${el.codexMatrixId})`}
          aria-label="Open in Codex Studio"
        >
          <ExternalLink size={12} />
        </button>
      )}

      {canPullFromDbm && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPullFromDbm?.(el, e);
          }}
          className="p-1.5 rounded text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors cursor-pointer"
          title="Pull canonical updates from Omnicortex DBM"
          aria-label="Pull canonical updates from Omnicortex DBM"
        >
          <RefreshCw size={12} />
        </button>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExportAime?.(el, e);
        }}
        className="p-1.5 rounded text-amber-400 hover:text-amber-200 hover:bg-amber-950/60 border border-amber-500/30 transition-colors cursor-pointer"
        title={`Export AIME Asset (${fileExt})`}
        aria-label={`Export AIME Asset (${fileExt})`}
      >
        <Sparkles size={12} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExportMarkdown?.(el, e);
        }}
        className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors cursor-pointer"
        title="Export as ELEMENTS.md Markdown"
        aria-label="Export as Markdown"
      >
        <Download size={12} />
      </button>

      {isPureModuleDraft && !isStoryReadOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteDraft?.(el, e);
          }}
          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
          title="Delete Story Module Element"
          aria-label="Delete Story Module Element"
        >
          <Trash2 size={12} />
        </button>
      )}

      {variant === 'table' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(el, e);
          }}
          className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[10px] text-cyan-300 font-bold uppercase cursor-pointer"
        >
          Edit
        </button>
      ) : (
        <span className="text-[10px] text-cyan-400 group-hover:text-amber-300 transition-colors ml-1 font-bold">
          Edit ✏️
        </span>
      )}
    </div>
  );
}

export default ElementCardActions;
