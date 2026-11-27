import React from 'react';
import {
  FolderOpen,
  ChevronDown,
  Save,
  Download,
  Copy,
  Trash2,
  Compass,
  Zap,
  ExternalLink
} from 'lucide-react';
import { getElementFileExtension, getTypePillStyle } from '../elementSchemas';
import { AimeGuidanceButton } from '../../../../components/StoryFoundry/AimeGuidanceButton';
import { AudioService } from '../../../../services/audioService';
import { applyAutoFix } from '../../../../services/canonRulesLinterService';
import {
  sendMcmToFolioRoster,
  convertPersonaElementToFolio
} from '../../../../utils/personaBridge';

/**
 * Header, Canon Linter drawer, and Type-Change confirmation overlay for EditElementModal.
 */
export default function EditElementModalHeader({
  editorMode,
  setEditorMode,
  type,
  title,
  element,
  fields,
  imageUrl,
  content,
  customFields,
  guidance,
  assetHub,
  saveCurrentToRoster,
  switchRosterCharacter,
  onClose,
  navigate,
  showToast,
  fileMenuRef,
  isFileMenuOpen,
  setIsFileMenuOpen,
  handleSubmit,
  handleExportElement,
  handleDuplicateElement,
  handleDeleteElement,
  isFolioOrigin,
  isCortexOrigin,
  isModulePinnedOrigin,
  isAdmin,
  onDeleteCortex,
  isCanonOpen,
  setIsCanonOpen,
  canonDiagnostics,
  setContent,
  setFields,
  dbmSyncStatus,
  setDbmSyncStatus,
  setIsAimeGuidanceOpen,
  isStoryReadOnly,
  isPublicElement,
  setIsPublicElement,
  handleRequestClose,
  showTypeConfirm,
  pendingType,
  cancelTypeChange,
  confirmTypeChange
}) {
  return (
    <>
      {/* ── MODAL HEADER WITH DUAL-MODE [ 🧭 GUIDED | ⚡ SHEET ] SWITCHER ── */}
      <div className="relative z-30 px-4 sm:px-6 py-3.5 bg-[#0d1117] border-b border-[#0D5C63]/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-cyan-600 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            {editorMode === 'guided' ? '🧭' : '⚡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                {editorMode === 'guided' ? 'Guided Element Forge' : 'Element Master Sheet'}
              </h2>
              <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full border font-bold uppercase ${getTypePillStyle(type)}`}>
                {type}
                {type === 'Property' && (fields.propertySubcategory || element.propertySubcategory)
                  ? ` • ${fields.propertySubcategory || element.propertySubcategory}`
                  : ''}
              </span>
              {type === 'Persona' && (
                <div className="flex items-center gap-1.5">
                  {!element.isFolioPersona && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentElementSnapshot = {
                          ...element,
                          title: title || element.title || 'Unnamed Persona',
                          type: 'Persona',
                          imageUrl,
                          content,
                          fields,
                          customFields,
                          guidance,
                          assetHub
                        };
                        const folioData = convertPersonaElementToFolio(currentElementSnapshot);
                        const sent = sendMcmToFolioRoster(folioData, {
                          createCopy: false,
                          preserveOrigin: element.sourceOrigin !== 'mcm',
                          lockForVtt: true,
                          openInFolio: false,
                          activateInFolio: false
                        });
                        showToast({
                          type: 'success',
                          text: `Sent "${sent['char-name'] || sent.character_name || title || 'Persona'}" to Persona Folio Roster!`
                        });
                      }}
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900 flex items-center gap-1 cursor-pointer"
                      title="Send this MCM / Story Persona to the Persona Folio Roster (VTT & Folio Ready)"
                    >
                      <span>🧬 Send to Folio</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const currentElementSnapshot = {
                        ...element,
                        title: title || element.title || 'Unnamed Persona',
                        type: 'Persona',
                        imageUrl,
                        content,
                        fields,
                        customFields,
                        guidance,
                        assetHub
                      };
                      const folioData = convertPersonaElementToFolio(currentElementSnapshot);
                      if (element.isFolioPersona && typeof saveCurrentToRoster === 'function') {
                        const savedChar = await saveCurrentToRoster(folioData);
                        const targetDocId = savedChar?.['character-doc-id'] || folioData?.['character-doc-id'];
                        if (targetDocId && typeof switchRosterCharacter === 'function') {
                          switchRosterCharacter(targetDocId);
                        }
                      } else {
                        sendMcmToFolioRoster(folioData, {
                          lockForVtt: false,
                          openInFolio: true
                        });
                      }
                      onClose();
                      navigate('/folio');
                    }}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-200 hover:bg-purple-900 flex items-center gap-1 cursor-pointer"
                    title="Send & Open in Persona Folio to continue full character development"
                  >
                    <span>🪪 {element.isFolioPersona ? 'Open in Folio' : 'Expand in Folio'}</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              )}
              {element.codexMatrixId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/codex?matrix=${element.codexMatrixId}`);
                  }}
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900 flex items-center gap-1 cursor-pointer"
                  title="Open canonical entry in Codex Studio"
                >
                  <span>⚡ Open in Codex</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[260px] sm:max-w-md">
              {title ? `${title} • ` : ''}ID: {element.id}
            </p>
          </div>
        </div>

        {/* Segmented Dual-Mode Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1180, 0.025);
              setEditorMode('guided');
            }}
            className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              editorMode === 'guided'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="5-Stage Guided Studio with AIME & BASTION Step-Assist"
          >
            <Compass size={13} className={editorMode === 'guided' ? 'text-cyan-400' : 'text-slate-500'} />
            <span>Guided</span>
          </button>

          <button
            type="button"
            onClick={() => {
              AudioService.playTerminalBeep(1040, 0.025);
              setEditorMode('sheet');
            }}
            className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              editorMode === 'sheet'
                ? 'bg-amber-950 text-amber-200 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Direct 3-Tier Master Sheet & Custom Key-Value Editor"
          >
            <Zap size={13} className={editorMode === 'sheet' ? 'text-amber-400' : 'text-slate-500'} />
            <span>Sheet</span>
          </button>
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Consolidated Single FILE Pulldown */}
          <div className="relative" ref={fileMenuRef}>
            <button
              type="button"
              onClick={() => setIsFileMenuOpen((prev) => !prev)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Element File Actions (Save, Export, Duplicate, Delete)"
            >
              <FolderOpen size={13} className="text-cyan-400" />
              <span>FILE</span>
              <ChevronDown size={11} className={`text-slate-400 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFileMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-[#0b101b] border border-cyan-500/40 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] py-1.5 z-50 text-xs font-mono divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsFileMenuOpen(false);
                      handleSubmit(e);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportElement}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export {getElementFileExtension(type, fields?.propertySubcategory)} Asset</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicateElement}
                    className="w-full text-left px-3 py-1.5 hover:bg-purple-950/60 text-purple-300 hover:text-purple-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Duplicate Element</span>
                  </button>
                </div>
                {element &&
                  (element.id || element.title) &&
                  !((isFolioOrigin && !isModulePinnedOrigin) || (isCortexOrigin && !isModulePinnedOrigin && (!isAdmin || typeof onDeleteCortex !== 'function'))) && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDeleteElement}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>
                        {(isCortexOrigin || isFolioOrigin) && isModulePinnedOrigin
                          ? 'Unpin from Story Module'
                          : isCortexOrigin
                          ? 'Delete from OmniCortex (Admin)'
                          : 'Delete Element'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCanonOpen((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
              canonDiagnostics.length > 0
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 hover:bg-amber-900/70'
                : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            }`}
            title="Inspect Tangent v6 Canon Rules Linter diagnostics"
          >
            Canon: {canonDiagnostics.length}
          </button>

          <AimeGuidanceButton
            onClick={() => setIsAimeGuidanceOpen(true)}
            label="AIME Guidance"
            size="sm"
          />
          <button
            type="button"
            onClick={() => !isStoryReadOnly && setIsPublicElement((v) => !v)}
            disabled={isStoryReadOnly}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-colors ${
              isStoryReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              isPublicElement
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/70'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200'
            }`}
            title={
              isPublicElement
                ? 'Public / Shared: visible across stories & community browser (click to restrict to this project)'
                : 'Project Only: scoped to the current Story Module (click to share publicly)'
            }
          >
            {isPublicElement ? '🌐 Public' : '🔒 Project'}
          </button>
          <button
            type="button"
            onClick={handleRequestClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white text-2xl font-bold px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE CANON LINTER DRAWER ── */}
      {isCanonOpen && (
        <div className="px-5 py-2.5 bg-slate-950/95 border-b border-amber-500/40 text-xs font-mono space-y-1.5 max-h-44 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-300">
            <span>Tangent v6 Canon Linter ({canonDiagnostics.length} finding{canonDiagnostics.length === 1 ? '' : 's'})</span>
            <button type="button" onClick={() => setIsCanonOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
          {canonDiagnostics.length === 0 ? (
            <div className="text-emerald-300 text-[11px]">✓ Element conforms to Tangent v6 Canon rules.</div>
          ) : (
            canonDiagnostics.map((diag) => (
              <div key={diag.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-amber-200">{diag.message}</div>
                  <div className="text-[10px] text-slate-400">{diag.suggestion}</div>
                </div>
                {diag.autoFixReplacement && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextContent = applyAutoFix(content || '', diag);
                      const contentChanged = nextContent !== (content || '');
                      if (contentChanged) {
                        setContent(nextContent);
                      }
                      const lintedFieldKeys = ['summary', 'oneLinePitch', 'description', 'mechanic', 'readAloud', 'cast_time', 'sceneBeats'];
                      const base = fields || {};
                      const patch = {};
                      let fieldsChanged = false;
                      for (const fk of lintedFieldKeys) {
                        const rawVal = base[fk];
                        if (typeof rawVal === 'string' && rawVal) {
                          const fixedVal = applyAutoFix(rawVal, diag);
                          if (fixedVal !== rawVal) {
                            patch[fk] = fixedVal;
                            fieldsChanged = true;
                          }
                        }
                      }
                      if (fieldsChanged) {
                        setFields({ ...base, ...patch });
                      }
                      if (fields?.dbmRef && dbmSyncStatus === 'synced' && (contentChanged || fieldsChanged)) {
                        setDbmSyncStatus('local_override');
                      }
                      if (contentChanged || fieldsChanged) {
                        showToast({ type: 'success', text: `Auto-fixed "${diag.matchText || diag.ruleCode}"` });
                      } else {
                        showToast({ type: 'info', text: `No auto-fixable match found for "${diag.matchText || diag.ruleCode}".` });
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] shrink-0 cursor-pointer"
                  >
                    Auto-Fix
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SHARED TYPE CHANGE CONFIRMATION OVERLAY ── */}
      {showTypeConfirm && (
        <div className="absolute inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-4 pt-16 pb-12 overflow-y-auto">
          <div className="bg-[#161b22] border border-amber-500/70 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl mx-auto shadow-md">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-400 uppercase tracking-wider">
                Change Element Type?
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Changing type from{' '}
                <span className="font-bold text-amber-300 px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/30">
                  {type}
                </span>{' '}
                to{' '}
                <span className="font-bold text-cyan-300 px-1.5 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/30">
                  {pendingType}
                </span>{' '}
                will reset type-specific fields as data will not carry over.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={cancelTypeChange}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTypeChange}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
