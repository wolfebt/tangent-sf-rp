/**
 * @file VttExportTab.tsx
 * @description Dedicated Universal VTT (.dd2vtt) & Foundry VTT Compendium Export Tab.
 */

import React, { useState } from 'react';
import { 
  Download, 
  Package, 
  FileCode, 
  Image as ImageIcon, 
  Check
} from 'lucide-react';
import { UniversalVttPackager } from '../../../../engine/compilers/UniversalVttPackager';
import { FoundryVttJsonExporterService } from '../../../../engine/compilers/FoundryVttJsonExporter';
import { MapGraphicsCompiler } from '../../../../engine/compilers/MapGraphicsCompiler';

export interface VttExportTabProps {
  currentMap: any;
  onExportPNG: () => void;
}

export const VttExportTab: React.FC<VttExportTabProps> = ({ currentMap, onExportPNG }) => {
  const [pixelsPerGrid, setPixelsPerGrid] = useState<number>(100);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const rawWalls = (currentMap?.walls || []).map((w: any) => ({
    p1: [w.x1 || 0, w.y1 || 0] as [number, number],
    p2: [w.x2 || 0, w.y2 || 0] as [number, number],
    blocksLight: w.blocksLight ?? true
  }));

  const portals = (currentMap?.portals || currentMap?.doors || []).map((d: any) => ({
    col: d.x || d.col || 0,
    row: d.y || d.row || 0,
    horizontal: d.horizontal ?? true,
    closed: d.closed ?? true,
    freemove: false
  }));

  const lights = (currentMap?.lights || []).map((l: any) => ({
    col: l.x || l.col || 0,
    row: l.y || l.row || 0,
    rangeFt: l.radius || 20,
    colorHex: l.color || '#f59e0b',
    intensity: l.intensity || 1.0
  }));

  const mapWidthCells = currentMap?.gridWidth || 30;
  const mapHeightCells = currentMap?.gridHeight || 20;

  // Calculate collinear reduction
  const reducedWalls = UniversalVttPackager.reduceCollinearSegments(rawWalls);
  const reductionPercent = rawWalls.length > 0
    ? Math.round(((rawWalls.length - reducedWalls.length) / rawWalls.length) * 100)
    : 0;

  const handleDownloadUvtt = () => {
    const base64Image = currentMap?.thumbnail || MapGraphicsCompiler.compileForUniversalVtt({
      widthCells: mapWidthCells,
      heightCells: mapHeightCells,
      pixelsPerGrid,
      terrains: currentMap?.terrains || [],
      underlays: currentMap?.underlays || []
    });

    const result = UniversalVttPackager.package({
      widthCells: mapWidthCells,
      heightCells: mapHeightCells,
      pixelsPerGrid,
      base64Image,
      walls: rawWalls,
      portals,
      lights
    });

    const blob = new Blob([result.jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentMap?.title || 'tactical-map').toLowerCase().replace(/\s+/g, '-')}.dd2vtt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('Universal VTT (.dd2vtt) file downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadFoundryJson = () => {
    const service = new FoundryVttJsonExporterService();
    const result = service.exportToFoundryJson({
      packageId: 'tangent-tactical-pack',
      title: currentMap?.title || 'Tangent SF RP Tactical Map',
      scenarios: [],
      elements: [],
      maps: [currentMap]
    });

    const blob = new Blob([result.jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foundry-vtt-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('Foundry VTT Compendium package downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-cyan-900/60">
          <Download className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-lg font-mono font-bold uppercase text-slate-100">
              Universal VTT & Foundry Compendium Exporter
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Compile tactical map geometry, collinear line-of-sight vectors, and dynamic lighting into industry-standard VTT packages.
            </p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-mono shadow-md animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* 1. Universal VTT (.dd2vtt) Section */}
        <div className="bg-slate-900/90 border border-cyan-800/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wide">
                  Universal VTT Standard (.dd2vtt)
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Compatible with Foundry VTT, Roll20, Fantasy Grounds, and Owlbear Rodeo.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Format 0.2
            </span>
          </div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Map Dimensions</span>
              <span className="text-cyan-300 font-bold text-sm">{mapWidthCells} × {mapHeightCells} cells</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Collinear Optimization</span>
              <span className="text-emerald-400 font-bold text-sm">
                {rawWalls.length} ➔ {reducedWalls.length} ({reductionPercent}% saved)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Portals / Doors</span>
              <span className="text-amber-400 font-bold text-sm">{portals.length} doors</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Dynamic Lights</span>
              <span className="text-cyan-400 font-bold text-sm">{lights.length} emitters</span>
            </div>
          </div>

          {/* Pixels per grid slider */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-200">Grid Resolution:</span>
              <span className="text-slate-400 block text-[11px]">Pixels per tactical grid cell</span>
            </div>
            <div className="flex items-center space-x-2">
              {[70, 100, 140, 200].map(px => (
                <button
                  key={px}
                  type="button"
                  onClick={() => setPixelsPerGrid(px)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    pixelsPerGrid === px
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {px}px
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadUvtt}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/80 transition-all hover:scale-101"
          >
            <Download className="w-4 h-4" />
            <span>Download .dd2vtt File</span>
          </button>
        </div>

        {/* 2. Foundry VTT & High-Res Image Export Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Foundry Compendium */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-mono font-semibold">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Foundry VTT v11/v12 Compendium</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Exports complete Foundry scenes with grid alignment, ambient lighting, walls, and @UUID inter-document linkage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadFoundryJson}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-cyan-700 text-slate-200 hover:text-white font-mono text-xs font-semibold border border-slate-700 hover:border-cyan-600 transition-colors"
            >
              Export Foundry VTT JSON
            </button>
          </div>

          {/* High-Res PNG / WebP */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-mono font-semibold">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>High-Resolution PNG / WebP</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Flattens active canvas terrain, decals, structures, and walls into a pristine lossless graphic for physical printing or custom VTTs.
              </p>
            </div>

            <button
              type="button"
              onClick={onExportPNG}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-cyan-700 text-slate-200 hover:text-white font-mono text-xs font-semibold border border-slate-700 hover:border-cyan-600 transition-colors"
            >
              Export High-Res Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
