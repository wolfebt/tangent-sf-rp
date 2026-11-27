/**
 * @file WikiHoverDossierCard.jsx
 * @description Floating Wiki-Link Hover Dossier preview card for referenced Story Elements inside StoryWeaver.
 */

import React from 'react';
import { Edit3, ExternalLink, Shield, Sparkles } from 'lucide-react';
import { getTypePillStyle } from '../../../ElementForge/elementSchemas';
import { useAdeStore } from '../../../store/adeStore';
import { stripGmSecretHtmlBlocks } from '../../../../../utils/gmSecretSanitizer';

export default function WikiHoverDossierCard({ element, onEdit }) {
  const perspectiveMode = useAdeStore((state) => state.perspectiveMode || 'architect');
  if (!element) return null;

  const isOperator = perspectiveMode === 'operator';
  const rawSummary =
    element.fields?.summary ||
    element.fields?.description ||
    element.content ||
    '';
  const safeHtml = isOperator ? stripGmSecretHtmlBlocks(String(rawSummary)) : String(rawSummary);
  const plainSummary = safeHtml.replace(/<[^>]+>/g, '').trim();
  const summary = plainSummary ? plainSummary.slice(0, 160) : 'No dossier summary yet.';

  const imageUrl = element.fields?.imageUrl || element.imageUrl || '';
  const tl = element.fields?.['tech-level'] ?? element.fields?.tech_level;
  const cr = element.fields?.defense_cr ?? element.fields?.cr;

  return (
    <div className="w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto p-3 rounded-2xl bg-[#0b101d]/98 border border-amber-500/50 shadow-2xl font-mono text-xs text-slate-200 backdrop-blur-xl space-y-2 z-50">
      <div className="flex items-start gap-2.5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={element.title || 'Element'}
            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles size={16} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white truncate">{element.title || element.name}</div>
          <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getTypePillStyle(element.type)}`}>
            {element.type}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 font-sans leading-snug line-clamp-3">
        {summary}
      </p>

      {(tl !== undefined || cr !== undefined) && (
        <div className="flex items-center gap-2 text-[10px] text-cyan-300">
          <Shield size={11} />
          {tl !== undefined && <span>TL-{tl}</span>}
          {cr !== undefined && <span>CR {cr}</span>}
        </div>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(element)}
          className="w-full py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-200 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Edit3 size={11} />
          <span>Edit In-Situ Dossier</span>
          <ExternalLink size={10} />
        </button>
      )}
    </div>
  );
}
