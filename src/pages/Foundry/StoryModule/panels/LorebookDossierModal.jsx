/**
 * @file LorebookDossierModal.jsx
 * @description In-Situ Lorebook & Compendium Dossier Inspector for Interactive Play & Book Mode.
 * Displays canonical Element lore, Tech/Meta Levels, user-defined Custom Codex fields,
 * and scanning trigger telemetry when players inspect lorebook references during narrative play.
 */

import React from 'react';
import { X, BookOpen, Tag, Cpu, Shield, Zap, Info, Layers, ExternalLink, Bookmark, Edit3 } from 'lucide-react';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import { useDirtyModalClose } from '../../../../hooks/useDirtyModalClose';

export default function LorebookDossierModal({ isOpen, onClose, entry, onNavigateToElement, onEditElement }) {
  const { handleBackdropClick, handleGuardedClose } = useDirtyModalClose({
    isOpen,
    isDirty: false,
    onClose
  });

  if (!isOpen || !entry) return null;

  const raw = entry.rawElement || {};
  const fields = raw.fields || {};
  const type = entry.type || raw.type || 'Element';
  const pillStyle = getTypePillStyle(type);

  // Extract key traits
  const concept = fields.oneLinePitch || fields.summary || fields.corePremise || '';
  const description = fields.description || raw.content || entry.snippet || '';
  const techLevel = fields.techLevel || fields['tech-level'] || null;
  const metaLevel = fields.metaLevel || fields['magic-level'] || null;
  const category = fields.category || fields.customDataType || null;
  const archetype = fields.archetype || fields.classification || null;
  const tags = fields.tags || raw.tags || null;
  const customFields = Array.isArray(raw.customFields) ? raw.customFields : [];

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none font-sans text-slate-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0e131f] border border-cyan-500/60 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lorebook-dossier-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-[#101726] to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
              <Bookmark size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="lorebook-dossier-title" className="text-sm font-bold text-white tracking-wide truncate">
                  {entry.title || raw.title || 'Lorebook Dossier'}
                </h3>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${pillStyle}`}>
                  {type}
                </span>
                {category && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {category}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>Trigger: {entry.triggerMatched || 'Associative Match'}</span>
                <span>•</span>
                <span>Pass #{entry.passMatched || 1}</span>
                <span>•</span>
                <span>Budget: {entry.allocatedTokens || 250} tok</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuardedClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dossier"
          >
            <X size={16} />
          </button>
        </div>

        {/* Banner Image if Available */}
        {raw.imageUrl && (
          <div className="w-full h-36 bg-slate-950 overflow-hidden relative border-b border-slate-800">
            <img 
              src={raw.imageUrl} 
              alt={entry.title} 
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] via-transparent to-transparent" />
          </div>
        )}

        {/* Scrollable Dossier Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs scrollbar-thin">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Tech Level</span>
              <span className="text-xs font-bold text-amber-300">{techLevel || 'Standard'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Meta Level</span>
              <span className="text-xs font-bold text-purple-300">{metaLevel || 'ML-0 (Null)'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Archetype / Role</span>
              <span className="text-xs font-bold text-slate-200 truncate block">{archetype || 'Canonical'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Scan Priority</span>
              <span className="text-xs font-bold text-cyan-300">{entry.priority || 50} / 100</span>
            </div>
          </div>

          {/* High Concept / Pitch */}
          {concept && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                Concept & High-Level Summary
              </span>
              <p className="text-xs font-sans leading-relaxed italic">
                "{concept}"
              </p>
            </div>
          )}

          {/* Canonical Lore & Detailed Description */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <BookOpen size={12} className="text-amber-400" />
              <span>Canonical Dossier & Narrative Text</span>
            </span>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-wrap select-text">
              {description}
            </div>
          </div>

          {/* User-Defined Dynamic Custom Fields (Custom Codex) */}
          {customFields.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-teal-300 flex items-center gap-1.5">
                <Tag size={12} className="text-teal-400" />
                <span>Custom Codex User-Defined Parameters</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customFields.map((cf) => (
                  <div key={cf.id || cf.label} className="p-2 rounded-lg bg-slate-950 border border-teal-500/30">
                    <span className="text-[9px] text-teal-400 uppercase font-bold block">{cf.label}</span>
                    <span className="text-xs text-slate-200 font-sans">{cf.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && (
            <div className="pt-2 border-t border-slate-850 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
              <span className="text-slate-500">Keywords:</span>
              {(typeof tags === 'string' ? tags.split(',') : tags).map((t, i) => (
                <span key={i} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            ID: <span className="text-slate-400">{entry.id}</span>
          </span>
          <div className="flex items-center gap-2">
            {typeof onEditElement === 'function' && (raw.id || entry.id) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditElement(raw.id ? raw : entry);
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 size={12} />
                <span>Edit Element</span>
              </button>
            )}
            {typeof onNavigateToElement === 'function' && raw.id && (
              <button
                type="button"
                onClick={() => onNavigateToElement(raw.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ExternalLink size={12} />
                <span>Open in Foundry</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleGuardedClose}
              className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
