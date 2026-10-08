/**
 * @file AssetIngestionModal.tsx
 * @description Dialog for importing external art assets (PNG/WebP/SVG/ZIP) into canonical AssetUnits.
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Scissors 
} from 'lucide-react';
import { 
  ASSET_CATEGORIES, 
  type AssetUnit, 
  type AssetCategory 
} from '../../../schemas/assetUnitSchema';
import { AssetIngestionPipeline } from '../../../engine/assets/AssetIngestionPipeline';
import { SpriteSheetCutterModal } from './SpriteSheetCutterModal';

export interface AssetIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetIngested: (asset: AssetUnit) => void;
}

export const AssetIngestionModal: React.FC<AssetIngestionModalProps> = ({
  isOpen,
  onClose,
  onAssetIngested
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('doodad');
  const [treePathInput, setTreePathInput] = useState('Custom / Props');
  const [tagsInput, setTagsInput] = useState('custom, scifi');
  const [dimW, setDimW] = useState(1);
  const [dimH, setDimH] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSlicerOpen, setIsSlicerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please provide an asset name.');
      return;
    }
    if (!previewUrl) {
      setError('Please upload an image file.');
      return;
    }

    const treePath = treePathInput
      .split(/[\/\>]/)
      .map(s => s.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const result = AssetIngestionPipeline.ingestSingleAsset({
      name: name.trim(),
      category,
      treePath: treePath.length > 0 ? treePath : ['Custom Uploads', category],
      tags,
      dimensions: [dimW, dimH],
      imageDataUrl: previewUrl,
      thumbnailUrl: previewUrl
    });

    if (result.success && result.asset) {
      onAssetIngested(result.asset);
      onClose();
    } else {
      setError(result.error || 'Failed to ingest asset.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-cyan-800/80 rounded-lg shadow-2xl shadow-cyan-950/80 w-full max-w-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/40">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
                External Asset Ingestion
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsSlicerOpen(true)}
                className="flex items-center space-x-1 text-xs font-mono px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-700/60 transition-colors"
                title="Slice a sprite sheet or tile map into frames"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Sprite Slicer</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar font-mono text-xs">
            {error && (
              <div className="flex items-center space-x-2 p-2 bg-red-950/60 border border-red-800 text-red-300 rounded">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drop / Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 object-contain rounded border border-cyan-900/60 bg-black/40 p-1"
                  />
                  <span className="text-[10px] text-cyan-400 group-hover:underline">
                    Click to change file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-slate-400">
                  <ImageIcon className="w-8 h-8 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-xs">Drag & drop PNG/WebP or click to browse</span>
                  <span className="text-[10px] text-slate-600">Supports transparent alpha channels</span>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Plasma Reactor Coil"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssetCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
                >
                  {ASSET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tree Path & Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Folder Hierarchy (Tree Path)</label>
                <input
                  type="text"
                  value={treePathInput}
                  onChange={(e) => setTreePathInput(e.target.value)}
                  placeholder="Environments / Sci-Fi / Industrial"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="scifi, reactor, hazard, cover_half"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Grid Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Width (Grid Cells)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={dimW}
                  onChange={(e) => setDimW(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Height (Grid Cells)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={dimH}
                  onChange={(e) => setDimH(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 px-4 py-3 bg-slate-950 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1 px-4 py-1.5 rounded text-xs font-mono font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-900/50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Register Asset</span>
            </button>
          </div>
        </div>
      </div>

      {isSlicerOpen && (
        <SpriteSheetCutterModal
          isOpen={isSlicerOpen}
          onClose={() => setIsSlicerOpen(false)}
          onBatchIngested={(assets) => {
            assets.forEach(a => onAssetIngested(a));
            setIsSlicerOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default AssetIngestionModal;
