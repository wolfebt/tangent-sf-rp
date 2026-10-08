/**
 * @file SpriteSheetCutterModal.tsx
 * @description Interactive visual grid slicer for extracting sprite frames into AssetUnits.
 */

import React, { useState, useRef, useMemo } from 'react';
import { Scissors, X, Check, Image as ImageIcon, Grid } from 'lucide-react';
import { ASSET_CATEGORIES, type AssetCategory, type AssetUnit } from '../../../schemas/assetUnitSchema';
import { SpriteSheetSlicer } from '../../../engine/assets/SpriteSheetSlicer';
import { AssetIngestionPipeline } from '../../../engine/assets/AssetIngestionPipeline';

export interface SpriteSheetCutterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchIngested: (assets: AssetUnit[]) => void;
}

export const SpriteSheetCutterModal: React.FC<SpriteSheetCutterModalProps> = ({
  isOpen,
  onClose,
  onBatchIngested
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [cellWidth, setCellWidth] = useState<number>(64);
  const [cellHeight, setCellHeight] = useState<number>(64);
  const [margin, setMargin] = useState<number>(0);
  const [padding, setPadding] = useState<number>(0);
  const [baseName, setBaseName] = useState<string>('Tile');
  const [category, setCategory] = useState<AssetCategory>('terrain_brush');
  const [treePathInput, setTreePathInput] = useState<string>('Custom Slices / Modular Tiles');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setBaseName(base.charAt(0).toUpperCase() + base.slice(1));

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
        // Automatically suggest standard cell size if cleanly divisible
        if (img.naturalWidth % 64 === 0 && img.naturalHeight % 64 === 0) {
          setCellWidth(64);
          setCellHeight(64);
        } else if (img.naturalWidth % 32 === 0 && img.naturalHeight % 32 === 0) {
          setCellWidth(32);
          setCellHeight(32);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const frames = useMemo(() => {
    if (!imageDims.width || !imageDims.height) return [];
    return SpriteSheetSlicer.computeGridFrames(imageDims.width, imageDims.height, {
      cellWidth,
      cellHeight,
      margin,
      padding
    });
  }, [imageDims, cellWidth, cellHeight, margin, padding]);

  const handleBatchImport = async () => {
    if (!imageElementRef.current || frames.length === 0) return;

    const slicedWithDataUrls = await SpriteSheetSlicer.sliceImageToDataUrls(
      imageElementRef.current,
      imageDims.width,
      imageDims.height,
      { cellWidth, cellHeight, margin, padding }
    );

    const treePath = treePathInput
      .split(/[\/\>]/)
      .map(s => s.trim())
      .filter(Boolean);

    const assets = AssetIngestionPipeline.ingestSlicedFrames(
      baseName,
      category,
      treePath.length > 0 ? treePath : ['Custom Uploads', category],
      slicedWithDataUrls,
      ['spritesheet', category]
    );

    onBatchIngested(assets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/40">
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
              Interactive Sprite Sheet & Tile Slicer
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-72 bg-slate-950 p-4 border-r border-slate-800 flex flex-col space-y-3 font-mono text-xs overflow-y-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{imageSrc ? 'Replace Sheet' : 'Load Sprite Sheet'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageSrc && (
              <>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  <div>Source: {imageDims.width} x {imageDims.height} px</div>
                  <div>Frames Detected: <span className="text-cyan-400 font-bold">{frames.length}</span></div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cell Width (px)</label>
                  <input
                    type="number"
                    min="8"
                    step="8"
                    value={cellWidth}
                    onChange={(e) => setCellWidth(Math.max(8, parseInt(e.target.value, 10) || 8))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cell Height (px)</label>
                  <input
                    type="number"
                    min="8"
                    step="8"
                    value={cellHeight}
                    onChange={(e) => setCellHeight(Math.max(8, parseInt(e.target.value, 10) || 8))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Margin (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={margin}
                      onChange={(e) => setMargin(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Padding (px)</label>
                    <input
                      type="number"
                      min="0"
                      value={padding}
                      onChange={(e) => setPadding(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Base Name</label>
                  <input
                    type="text"
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Target Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                  >
                    {ASSET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tree Path</label>
                  <input
                    type="text"
                    value={treePathInput}
                    onChange={(e) => setTreePathInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                  />
                </div>
              </>
            )}
          </div>

          {/* Slicing Viewport */}
          <div className="flex-1 bg-slate-950/90 p-4 flex items-center justify-center overflow-auto relative select-none">
            {imageSrc ? (
              <div className="relative inline-block border border-slate-700 shadow-md">
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Sprite Sheet"
                  className="max-w-none block"
                />

                {/* Slicing Grid Overlay */}
                <svg
                  className="absolute inset-0 pointer-events-none w-full h-full"
                  viewBox={`0 0 ${imageDims.width} ${imageDims.height}`}
                >
                  {frames.map((f) => (
                    <rect
                      key={f.index}
                      x={f.x}
                      y={f.y}
                      width={f.width}
                      height={f.height}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.8"
                    />
                  ))}
                </svg>
              </div>
            ) : (
              <div className="text-center text-slate-500 font-mono text-xs">
                <Grid className="w-12 h-12 mx-auto mb-2 opacity-30 text-cyan-400" />
                <p>Load an image file on the left to initialize visual slicing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            {frames.length > 0 ? `Ready to extract ${frames.length} assets` : 'No frames defined'}
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={frames.length === 0}
              onClick={handleBatchImport}
              className="flex items-center space-x-1 px-4 py-1.5 rounded text-xs font-mono font-medium bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-sm shadow-cyan-900/50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Batch Extract & Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpriteSheetCutterModal;
