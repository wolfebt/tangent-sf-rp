/**
 * @file ModulePackageModal.jsx
 * @description Dialog for exporting and importing full-fidelity Tangent Adventure Modules.
 * Supports Architect Master packages and Sanitized Player/Operator editions.
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Package, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Check, 
  Layers, 
  Map as MapIcon, 
  Box, 
  FileCode 
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { 
  exportArchitectModuleToFile, 
  exportOperatorModuleToFile, 
  parseAndValidateModuleFile 
} from '../../services/modulePackageService';

export default function ModulePackageModal({
  isOpen,
  onClose,
  initialMode = 'export', // 'export' | 'import'
  universeState,
  elementsCatalog = [],
  onImportPackage
}) {
  const [mode, setMode] = useState(initialMode);
  const [exportType, setExportType] = useState('architect'); // 'architect' | 'operator'
  const [parsedPreview, setParsedPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const scenariosCount = (universeState?.scenarios || []).length;
  const mapsCount = (universeState?.maps || []).length;
  const elementsCount = elementsCatalog.length;
  const modifiersCount = (universeState?.galleryModifiers || []).length;

  const handleExport = () => {
    AudioService.playCriticalChime(true);
    if (exportType === 'architect') {
      exportArchitectModuleToFile(universeState, elementsCatalog);
    } else {
      exportOperatorModuleToFile(universeState, elementsCatalog);
    }
    setImportStatus('Export downloaded successfully.');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = parseAndValidateModuleFile(text);
        if (parsed.isValid) {
          setParsedPreview(parsed.data);
          AudioService.playTerminalBeep(1200, 0.04);
        } else {
          setImportError(parsed.error || 'Failed to parse module package.');
          AudioService.playTerminalBeep(600, 0.05);
        }
      } catch (err) {
        setImportError(err.message || 'Corrupt JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    AudioService.playCriticalChime(true);
    if (onImportPackage) {
      onImportPackage(parsedPreview);
    }
    setImportStatus('Module package successfully imported!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-slate-900/98 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                ADE Module Package Manager
              </h3>
              <p className="text-[10px] text-slate-400">
                Full-fidelity standalone adventure serialization & sharing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('export');
              setImportStatus(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'export'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={13} />
            <span>EXPORT BUNDLE</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('import');
              setImportStatus(null);
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'import'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload size={13} />
            <span>IMPORT BUNDLE</span>
          </button>
        </div>

        {/* Content for EXPORT Mode */}
        {mode === 'export' && (
          <div className="space-y-4">
            {/* Module Manifest Stats */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Module Inventory
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-cyan-300 font-bold text-sm">{scenariosCount}</div>
                  <div className="text-[9px] text-slate-500 uppercase">Scenarios</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-purple-300 font-bold text-sm">{mapsCount}</div>
                  <div className="text-[9px] text-slate-500 uppercase">Maps</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-emerald-300 font-bold text-sm">{elementsCount}</div>
                  <div className="text-[9px] text-slate-500 uppercase">Elements</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-amber-300 font-bold text-sm">{modifiersCount}</div>
                  <div className="text-[9px] text-slate-500 uppercase">Modifiers</div>
                </div>
              </div>
            </div>

            {/* Edition Choice */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Package Edition
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setExportType('architect')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    exportType === 'architect'
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-cyan-300">
                    <ShieldCheck size={14} />
                    <span>Architect Master</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Complete module package including GM notes, encounter mechanics, secrets, and trigger coordinates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExportType('operator')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    exportType === 'operator'
                      ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-purple-300">
                    <ShieldAlert size={14} />
                    <span>Player / Operator</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Sanitized player-safe edition. Strips GM secrets, hidden traps, and enemy stat blocks.
                  </p>
                </button>
              </div>
            </div>

            {/* Download CTA */}
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Download size={14} />
              <span>Download {exportType === 'architect' ? 'Master Package' : 'Player Edition'} (.json)</span>
            </button>
          </div>
        )}

        {/* Content for IMPORT Mode */}
        {mode === 'import' && (
          <div className="space-y-4">
            <input
              type="file"
              accept=".json,.tangent"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {!parsedPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-950/60 hover:bg-slate-950 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
              >
                <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  <Upload size={20} />
                </div>
                <div className="text-xs font-bold text-slate-200">
                  Click or drag a Tangent Module Package here
                </div>
                <p className="text-[10px] text-slate-500">
                  Accepts standard .json and .tangent-module bundle files
                </p>
              </div>
            ) : (
              <div className="p-3 bg-purple-950/30 border border-purple-500/50 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    Package Manifest Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setParsedPreview(null)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Change File
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-100">
                    {parsedPreview.manifest?.title || 'Adventure Module'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Author: {parsedPreview.manifest?.author || 'Unknown'} • Version: {parsedPreview.version || '2.0.0'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-purple-500/30">
                  <div className="p-1.5 rounded bg-slate-900/90 text-[10px]">
                    <span className="font-bold text-purple-300">
                      {(parsedPreview.scenarios || []).length}
                    </span> Scenarios
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/90 text-[10px]">
                    <span className="font-bold text-cyan-300">
                      {(parsedPreview.maps || []).length}
                    </span> Maps
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/90 text-[10px]">
                    <span className="font-bold text-emerald-300">
                      {(parsedPreview.elements || []).length}
                    </span> Elements
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
                >
                  <Check size={14} />
                  <span>Hydrate & Open Adventure</span>
                </button>
              </div>
            )}

            {importError && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-[11px]">
                {importError}
              </div>
            )}
          </div>
        )}

        {importStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px] text-center font-bold">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
}
