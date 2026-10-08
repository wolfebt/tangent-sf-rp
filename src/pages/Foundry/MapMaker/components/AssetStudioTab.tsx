/**
 * @file AssetStudioTab.tsx
 * @description Full-featured Asset Studio, Catalog, and Property Forge tab view.
 * Unifies the Universal Asset Tree, Ingestion Modals, Sprite Slicer, and In-Situ Asset Studio.
 */

import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  Upload, 
  Scissors, 
  Sliders, 
  Shield, 
  Box, 
  Download, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { AssetUnit, AssetCategory } from '../../../../schemas/assetUnitSchema';
import { UniversalAssetTree } from '../../../../components/VTT/tree/UniversalAssetTree';
import { AssetSearchFilterBar } from '../../../../components/VTT/tree/AssetSearchFilterBar';
import { AssetIngestionModal } from '../../../../components/VTT/ingestion/AssetIngestionModal';
import { SpriteSheetCutterModal } from '../../../../components/VTT/ingestion/SpriteSheetCutterModal';
import { AssetStudioModal } from '../../../../components/VTT/studio/AssetStudioModal';
import { TangentPackager } from '../../../../engine/assets/TangentPackager';
import coreSeedUnits from '../../../../data/seed_units/science_fantasy_core.json';

export interface AssetStudioTabProps {
  onStampAssetOnMap: (unit: AssetUnit) => void;
}

export const AssetStudioTab: React.FC<AssetStudioTabProps> = ({ onStampAssetOnMap }) => {
  // Master asset list: starts with core seed units
  const [assets, setAssets] = useState<AssetUnit[]>(() => {
    try {
      const stored = localStorage.getItem('tangent_custom_asset_units');
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...(coreSeedUnits as AssetUnit[]), ...parsed];
      }
    } catch {
      // Fallback
    }
    return coreSeedUnits as AssetUnit[];
  });

  const [selectedUnitId, setSelectedUnitId] = useState<string>(assets[0]?.unit_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [provenanceFilter, setProvenanceFilter] = useState<'all' | 'preset' | 'custom_upload'>('all');

  // Modal visibility states
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isSlicerModalOpen, setIsSlicerModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  const selectedUnit = useMemo(() => {
    return assets.find(a => a.unit_id === selectedUnitId) || assets[0];
  }, [assets, selectedUnitId]);

  const handleSaveAsset = (updatedUnit: AssetUnit) => {
    const nextAssets = assets.map(a => a.unit_id === updatedUnit.unit_id ? updatedUnit : a);
    setAssets(nextAssets);
    try {
      const customOnly = nextAssets.filter(a => a.provenance.source === 'custom_upload');
      localStorage.setItem('tangent_custom_asset_units', JSON.stringify(customOnly));
    } catch {
      // Storage quota safety
    }
  };

  const handleIngestUnits = (newUnits: AssetUnit[]) => {
    const nextAssets = [...assets, ...newUnits];
    setAssets(nextAssets);
    try {
      const customOnly = nextAssets.filter(a => a.provenance.source === 'custom_upload');
      localStorage.setItem('tangent_custom_asset_units', JSON.stringify(customOnly));
    } catch {
      // Safety
    }
    if (newUnits.length > 0) {
      setSelectedUnitId(newUnits[0].unit_id);
    }
  };

  const handleExportPack = () => {
    const packJson = TangentPackager.createPack(
      'tangent-custom-export',
      'Custom Tangent Asset Pack',
      'Tactical Cartographer',
      'User Asset Pack',
      assets
    );
    const blob = new Blob([packJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tangent-assets-${Date.now()}.tangent-pack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-cyan-900/60 shadow-md gap-2">
        <div className="flex items-center space-x-2">
          <FolderTree className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-mono font-semibold tracking-wider uppercase text-slate-100">
            Universal Asset Studio & Property Forge
          </h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            {assets.length} Units Available
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsIngestionModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Assets</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSlicerModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-mono text-xs transition-colors shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Slice Sprite Sheet</span>
          </button>

          {selectedUnit && (
            <button
              type="button"
              onClick={() => setIsStudioModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs transition-colors shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Properties / Forge</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportPack}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Pack</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Master Tree on Left, Detail Forge on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Search & Hierarchical Tree */}
        <div className="w-80 sm:w-96 flex flex-col border-r border-cyan-900/40 bg-slate-950/80">
          <AssetSearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            provenanceFilter={provenanceFilter}
            onProvenanceChange={setProvenanceFilter}
          />

          <div className="flex-1 overflow-y-auto">
            <UniversalAssetTree
              assets={assets}
              selectedUnitId={selectedUnitId}
              onSelectUnit={(unit) => setSelectedUnitId(unit.unit_id)}
              searchQuery={searchQuery}
              categoryFilter={selectedCategory}
            />
          </div>
        </div>

        {/* Right Column: Asset Unit Inspector & Stamp Cockpit */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-900/40">
          {selectedUnit ? (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Asset Hero Card */}
              <div className="bg-slate-900/90 border border-cyan-900/60 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                {/* Visual Preview */}
                <div className="w-48 h-48 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-center p-3 relative overflow-hidden shrink-0 shadow-inner">
                  {selectedUnit.visuals.baseTexture ? (
                    <img
                      src={selectedUnit.visuals.baseTexture}
                      alt={selectedUnit.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                      onError={(e) => {
                        // Fallback icon on image error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Box className="w-16 h-16 text-cyan-400/40" />
                  )}

                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-cyan-300 border border-cyan-800/40">
                    {selectedUnit.dimensions[0]}x{selectedUnit.dimensions[1]} cells
                  </span>
                </div>

                {/* Meta & Quick Actions */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-mono text-cyan-300">{selectedUnit.name}</h2>
                      <p className="text-xs font-mono text-slate-400">{selectedUnit.unit_id}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {selectedUnit.category}
                    </span>
                  </div>

                  {/* Path hierarchy */}
                  <div className="flex items-center space-x-1 text-xs font-mono text-slate-400">
                    <span>Path:</span>
                    <span className="text-slate-200">{selectedUnit.tree_path.join(' / ')}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedUnit.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 text-[11px] font-mono border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Call to Action Buttons */}
                  <div className="flex items-center space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => onStampAssetOnMap(selectedUnit)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/80 transition-all hover:scale-102"
                    >
                      <span>Stamp onto Active Map</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStudioModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-colors"
                    >
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span>Configure Properties & Shaders</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Matrix Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* VTT Spatial Properties */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-cyan-400 font-semibold border-b border-slate-800 pb-2">
                    <Shield className="w-4 h-4" />
                    <span>Spatial & VTT Mechanics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Z-Layer: <span className="text-cyan-300">{selectedUnit.vtt_properties.z_index_layer}</span></div>
                    <div>Blocks Movement: <span className={selectedUnit.vtt_properties.blocks_movement ? 'text-amber-400' : 'text-slate-400'}>{String(selectedUnit.vtt_properties.blocks_movement)}</span></div>
                    <div>Blocks Vision: <span className={selectedUnit.vtt_properties.blocks_vision ? 'text-amber-400' : 'text-slate-400'}>{String(selectedUnit.vtt_properties.blocks_vision)}</span></div>
                    <div>Auto-Tile: <span className="text-slate-400">{selectedUnit.visuals.auto_tile || 'none'}</span></div>
                  </div>
                </div>

                {/* Category-Specific Properties */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-cyan-400 font-semibold border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Tactical Attributes</span>
                  </div>

                  {selectedUnit.vtt_properties.doodad && (
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Cover Rating: <span className="text-emerald-400">{selectedUnit.vtt_properties.doodad.cover}</span></div>
                      <div>Destructible: <span className="text-slate-400">{String(selectedUnit.vtt_properties.doodad.isDestructible)}</span></div>
                      {selectedUnit.vtt_properties.doodad.structureHp && (
                        <div>Structure HP: <span className="text-red-400">{selectedUnit.vtt_properties.doodad.structureHp}</span></div>
                      )}
                    </div>
                  )}

                  {selectedUnit.vtt_properties.terrain && (
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Material: <span className="text-cyan-300">{selectedUnit.vtt_properties.terrain.material}</span></div>
                      <div>Movement Cost: <span className="text-amber-400">{selectedUnit.vtt_properties.terrain.movementCost}x</span></div>
                      <div>Friction: <span className="text-slate-400">{selectedUnit.vtt_properties.terrain.slipperyFriction}</span></div>
                    </div>
                  )}

                  {selectedUnit.vtt_properties.hazard && (
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Hazard Type: <span className="text-amber-400">{selectedUnit.vtt_properties.hazard.hazardType}</span></div>
                      <div>Damage: <span className="text-red-400 font-bold">{selectedUnit.vtt_properties.hazard.damageFormula}</span></div>
                      <div>Trigger: <span className="text-slate-400">{selectedUnit.vtt_properties.hazard.triggerTiming}</span></div>
                    </div>
                  )}

                  {!selectedUnit.vtt_properties.doodad && !selectedUnit.vtt_properties.terrain && !selectedUnit.vtt_properties.hazard && (
                    <p className="text-slate-400 italic">No special category modifiers assigned.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FolderTree className="w-12 h-12 mb-2 opacity-50" />
              <p className="font-mono text-sm">Select an asset from the catalog tree to inspect.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssetIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onAssetIngested={(asset) => handleIngestUnits([asset])}
      />

      <SpriteSheetCutterModal
        isOpen={isSlicerModalOpen}
        onClose={() => setIsSlicerModalOpen(false)}
        onBatchIngested={handleIngestUnits}
      />

      {selectedUnit && (
        <AssetStudioModal
          isOpen={isStudioModalOpen}
          asset={selectedUnit}
          onClose={() => setIsStudioModalOpen(false)}
          onSaveAsset={handleSaveAsset}
        />
      )}
    </div>
  );
};
