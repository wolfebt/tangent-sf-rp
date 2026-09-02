import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Compass, Shield } from 'lucide-react';
import { parseUniversalVtt } from '../../../../services/uvttImportService';
import { AudioService } from '../../../../services/audioService';

export const UvttImportModal = ({
  isOpen = false,
  onClose,
  onImportComplete
}) => {
  const [mapName, setMapName] = useState('Imported Sector Battlemap');
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setMapName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').toUpperCase());

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);
        
        const losCount = (parsed.line_of_sight || []).reduce((acc, chain) => acc + (chain.length - 1), 0);
        const portalCount = (parsed.portals || []).length;
        const width = (parsed.resolution?.map_size?.x || 0) * (parsed.resolution?.pixels_per_grid || 70);
        const height = (parsed.resolution?.map_size?.y || 0) * (parsed.resolution?.pixels_per_grid || 70);

        setFileData(parsed);
        setStats({
          walls: losCount,
          portals: portalCount,
          width,
          height,
          gridSize: parsed.resolution?.pixels_per_grid || 70,
          hasImage: !!parsed.image
        });
        AudioService.playTerminalBeep(1200, 0.04);
      } catch (err) {
        setError('Invalid Universal VTT JSON file. Please provide a valid .dd2vtt or .uvtt file.');
        setFileData(null);
        setStats(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!fileData) return;
    setIsProcessing(true);
    try {
      const importedMap = parseUniversalVtt(fileData, mapName);
      AudioService.playCriticalSuccess();
      onImportComplete?.(importedMap);
      onClose?.();
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] max-h-[85vh] sm:max-h-[88vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="text-cyan-400" size={20} />
            <div>
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                Universal VTT (.dd2vtt) Importer
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Import DungeonDraft / UVTT Maps with automated walls and portals
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              AudioService.playTerminalBeep(800, 0.02);
              onClose?.();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Map Name Input */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1.5">
              Battlemap Title
            </label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-cyan-400 outline-none"
              placeholder="e.g. DERELICT STATION LEVEL 02"
            />
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              fileData
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-slate-700 hover:border-cyan-500/60 bg-slate-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".dd2vtt,.uvtt,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className={fileData ? 'text-emerald-400 mb-2' : 'text-cyan-400 mb-2'} size={32} />
            <p className="text-xs font-mono font-bold text-slate-200">
              {fileName ? fileName : 'Click or Drop .dd2vtt / .uvtt File Here'}
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Supports DungeonDraft, Arkenforge, and Universal VTT exports
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs font-mono text-red-300">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Preview Card */}
          {stats && (
            <div className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Extracted Map Components:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-xs font-bold text-white">{stats.walls}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Wall Segments</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-xs font-bold text-white">{stats.portals}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Doors / Portals</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-xs font-bold text-white">{stats.width} × {stats.height}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Dimensions (px)</div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400">{stats.hasImage ? 'READY' : 'NONE'}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Raster Texture</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-bold uppercase transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={!fileData || isProcessing}
            className={`px-5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              fileData && !isProcessing
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isProcessing ? 'Generating Sector...' : 'Import to Campaign'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default UvttImportModal;
