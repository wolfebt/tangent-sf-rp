/**
 * @file VttModuleIngestionModal.tsx
 * @description Ingestion interface for VTT Story Modules compiled from the Story Gallery.
 * Parses, inspects, and deploys complete packages (maps, tokens, objects, and situational modifiers).
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Play, 
  Map as MapIcon, 
  Sliders
} from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { AudioService } from '../../services/audioService';
import { deployCompiledPackage } from '../../utils/deployVttPackage';
import type { CompiledVttPackage } from '../../types/vttPackage';

export interface VttModuleIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleIngested?: (pkg: CompiledVttPackage) => void;
}

export const VttModuleIngestionModal: React.FC<VttModuleIngestionModalProps> = ({
  isOpen,
  onClose,
  onModuleIngested
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { universeState, activeMapId, setActiveMapId, updateMap, addMap, setGalleryModifiers } = useCampaign();
  const availableMaps = universeState?.maps || [];

  const [parsedPackage, setParsedPackage] = useState<CompiledVttPackage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [selectedTargetMapId, setSelectedTargetMapId] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    AudioService.playTerminalBeep(1100, 0.03);
    setErrorMsg(null);
    setIngestStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.manifest || (!json.map && !json.gallery)) {
          throw new Error('File does not appear to be a valid Tangent VTT Module bundle (missing manifest/gallery/map).');
        }
        setParsedPackage(json as CompiledVttPackage);
        setSelectedTargetMapId(json.map?.id || (json.gallery?.maps && json.gallery.maps[0]?.id) || activeMapId || '');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse JSON file.');
        setParsedPackage(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
      setParsedPackage(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeploy = () => {
    if (!parsedPackage) return;
    AudioService.playCriticalChime(true);

    const targetMap = selectedTargetMapId || activeMapId || (availableMaps[0] && availableMaps[0].id);

    // If target map doesn't exist in campaign, check if module has it in gallery
    const targetMapExists = availableMaps.some((m: any) => m.id === targetMap);
    if (!targetMapExists && parsedPackage.map) {
      addMap({
        id: parsedPackage.map.id,
        title: parsedPackage.map.title || 'Imported Scenario Map',
        width: parsedPackage.map.width || 2400,
        height: parsedPackage.map.height || 1800,
        gridSize: parsedPackage.map.gridSize || 50,
        walls: parsedPackage.map.walls || [],
        objects: parsedPackage.map.objects || [],
        tokens: parsedPackage.map.tokens || []
      });
      setActiveMapId(parsedPackage.map.id);
    }

    const result = deployCompiledPackage(
      parsedPackage,
      updateMap,
      targetMap,
      {
        mergeMode: 'replace',
        setGalleryModifiers,
        addMap,
        availableMaps
      }
    );

    setIngestStatus(`✅ Successfully ingested: ${result.tokensDeployed} tokens, ${result.objectsDeployed} objects, ${result.modifiersDeployed} modifiers!`);

    if (onModuleIngested) {
      onModuleIngested(parsedPackage);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const manifest = parsedPackage?.manifest;
  const gallery = parsedPackage?.gallery;
  const automations = parsedPackage?.automations;

  return (
    <div className="fixed inset-0 z-[230] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-200 overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Upload size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
                <span>VTT Module Ingestion Pipeline</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  Gallery Ingestion
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Load compiled Story Gallery modules (Maps, Tokens, Objects & Situational Modifiers) into VTT Stage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl bg-cyan-950/10 hover:bg-cyan-950/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText size={28} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200 block text-xs">
                Select or Drop Compiled VTT Module (.json)
              </span>
              <span className="text-[10px] text-slate-400">
                Exports produced by the ADE Story Gallery Module Compiler
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 flex items-center gap-2 text-[11px]">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Module Inspection Preview */}
          {parsedPackage && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Manifest Info */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold uppercase text-[11px]">
                  <span>{manifest?.title || 'Compiled VTT Module'}</span>
                  <span className="text-slate-400 text-[10px]">TL {manifest?.techLevel || 3} • ML {manifest?.magicLevel || 0}</span>
                </div>
                {parsedPackage.story?.summary && (
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {parsedPackage.story.summary}
                  </p>
                )}
              </div>

              {/* Telemetry Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">Tokens</span>
                  <span className="text-sm font-bold text-purple-300 font-mono">
                    {manifest?.stats?.totalTokens || (parsedPackage.map?.tokens || []).length}
                  </span>
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">Maps</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {gallery?.maps?.length || 1}
                  </span>
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">Gallery Mods</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">
                    {gallery?.modifiers?.length || automations?.activeModifiers?.length || 0}
                  </span>
                </div>

                <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 block uppercase">Traps & Hazards</span>
                  <span className="text-sm font-bold text-rose-300 font-mono">
                    {manifest?.stats?.reactiveTraps || 0}
                  </span>
                </div>
              </div>

              {/* Gallery Modifiers Preview */}
              {(gallery?.modifiers || automations?.activeModifiers || []).length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Sliders size={11} className="text-purple-400" />
                    <span>Included Situational Modifiers</span>
                  </label>
                  <div className="space-y-1">
                    {(gallery?.modifiers || automations?.activeModifiers || []).map((m: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200">{m.name}</span>
                        <span className="text-[10px] uppercase text-purple-300">{m.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Map Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <MapIcon size={11} className="text-cyan-400" />
                  <span>Target Tactical Map for Deployment</span>
                </label>
                <select
                  value={selectedTargetMapId}
                  onChange={(e) => setSelectedTargetMapId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                >
                  {parsedPackage.map && (
                    <option value={parsedPackage.map.id}>
                      Module Primary Map: {parsedPackage.map.title || 'Default Scene'}
                    </option>
                  )}
                  {availableMaps.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      Existing Stage Map: {m.title || m.name || m.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {ingestStatus ? (
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 size={14} />
              <span>{ingestStatus}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500">
              Module will deploy to engine memory and Stage VTT.
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeploy}
              disabled={!parsedPackage}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={12} className="fill-slate-950" />
              <span>Ingest & Deploy Module</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VttModuleIngestionModal;
