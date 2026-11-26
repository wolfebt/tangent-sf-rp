/**
 * @file AssetStudioTab.tsx
 * @description Full-featured Asset Studio, Catalog, and Property Forge tab view.
 * Unifies the Universal Asset Tree, Ingestion Modals, Sprite Slicer, Drawing Studio, and In-Situ Asset Forge.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FolderTree, 
  Upload, 
  Scissors, 
  Sliders, 
  Shield, 
  Box, 
  Download, 
  ArrowRight,
  Sparkles,
  Paintbrush,
  X,
  Zap,
  Code2,
  Lightbulb,
  Plus,
  Copy,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { createDefaultAssetUnit, type AssetUnit, type AssetCategory } from '../../../../schemas/assetUnitSchema';
import { UniversalAssetTree } from '../../../../components/VTT/tree/UniversalAssetTree';
import { AssetSearchFilterBar } from '../../../../components/VTT/tree/AssetSearchFilterBar';
import { AssetIngestionModal } from '../../../../components/VTT/ingestion/AssetIngestionModal';
import { SpriteSheetCutterModal } from '../../../../components/VTT/ingestion/SpriteSheetCutterModal';
import { AssetStudioModal } from '../../../../components/VTT/studio/AssetStudioModal';
import AssetDrawingStudio from '../map/AssetDrawingStudio';
import { TileSynthesizerModal } from './TileSynthesizerModal';
import { TangentPackager } from '../../../../engine/assets/TangentPackager';
import { uploadAdeImageAsset } from '../../../../services/adeMediaStorageService';
import { auth } from '../../../../firebase';
import {
  useAssetUnitStore,
  ASSET_UNITS_UPDATED_EVENT,
  isCorePresetUnitId
} from '../../../../engine/assets/assetUnitStore';
import { buildCssFilterFromCustomization } from '../../../../engine/canvas/AssetCustomizerShader';
import { 
  resolveAssetTexture, 
  getAssetVisualFallback, 
  TEXTURE_PRESET_LIBRARY 
} from '../../../../engine/assets/assetVisualFallbacks';
import {
  type TileSynthesisRecipe,
  compileRecipeToAssetUnit,
  synthesizeTileDataUrl,
  generateAutoTileVariants4Bit,
  generateStateTextures
} from '../../../../engine/assets/MicroTileSynthesizer';
import { confirmTypedDeletion } from '../../../../utils/confirmationUtils';
import { showToast } from '../../../../context/ToastContext';

export interface AssetStudioTabProps {
  onStampAssetOnMap: (unit: AssetUnit) => void;
  onEquipTerrainBrush?: (unit: AssetUnit) => void;
  onOpenChunkStudio?: () => void;
}

export const AssetStudioTab: React.FC<AssetStudioTabProps> = ({
  onStampAssetOnMap,
  onEquipTerrainBrush,
  onOpenChunkStudio
}) => {
  const assets = useAssetUnitStore((s) => s.assets);
  const modifiedSeedIds = useAssetUnitStore((s) => s.modifiedSeedIds);
  const upsertAssetUnit = useAssetUnitStore((s) => s.upsertAssetUnit);
  const ingestAssetUnits = useAssetUnitStore((s) => s.ingestAssetUnits);
  const duplicateAssetUnit = useAssetUnitStore((s) => s.duplicateAssetUnit);
  const deleteAssetUnit = useAssetUnitStore((s) => s.deleteAssetUnit);
  const resetPresetAssetUnit = useAssetUnitStore((s) => s.resetPresetAssetUnit);
  const importTangentPack = useAssetUnitStore((s) => s.importTangentPack);
  const reloadFromStorage = useAssetUnitStore((s) => s.reloadFromStorage);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => assets[0]?.unit_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [provenanceFilter, setProvenanceFilter] = useState<'all' | 'preset' | 'custom_upload'>('all');

  // Modal visibility states
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isSlicerModalOpen, setIsSlicerModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [isDrawingStudioOpen, setIsDrawingStudioOpen] = useState(false);
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false);
  const [isTileSynthModalOpen, setIsTileSynthModalOpen] = useState(false);

  // Viewport & Error tracking
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [previewBackdrop, setPreviewBackdrop] = useState<'checker' | 'dark' | 'grid' | 'light'>('checker');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const packInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onExternalUpdate = () => reloadFromStorage();
    window.addEventListener(ASSET_UNITS_UPDATED_EVENT, onExternalUpdate);
    return () => window.removeEventListener(ASSET_UNITS_UPDATED_EVENT, onExternalUpdate);
  }, [reloadFromStorage]);

  useEffect(() => {
    if (!isDrawingStudioOpen && !isPresetPickerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPresetPickerOpen) setIsPresetPickerOpen(false);
        else if (isDrawingStudioOpen) setIsDrawingStudioOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isDrawingStudioOpen, isPresetPickerOpen]);

  const selectedUnit = useMemo(() => {
    return assets.find(a => a.unit_id === selectedUnitId) || assets[0];
  }, [assets, selectedUnitId]);

  const handleSaveAsset = (updatedUnit: AssetUnit) => {
    const outcome = upsertAssetUnit(updatedUnit);
    if (outcome.quotaExceeded) {
      showToast({
        type: 'error',
        title: 'Browser Storage Full',
        text: 'LocalStorage quota exceeded. Sign in to offload heavy textures to Cloud Storage or delete unused custom units.'
      });
    }
  };

  const handleIngestUnits = (newUnits: AssetUnit[]) => {
    const outcome = ingestAssetUnits(newUnits);
    if (outcome.quotaExceeded) {
      showToast({
        type: 'error',
        title: 'Browser Storage Full',
        text: 'LocalStorage quota exceeded while saving ingested assets. Heavy textures were skipped from disk cache.'
      });
    }
    if (newUnits.length > 0) {
      setSelectedUnitId(newUnits[0].unit_id);
    }
  };

  const handleCreateBlankUnit = () => {
    const unitId = `custom_unit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const blank = createDefaultAssetUnit({
      unit_id: unitId,
      name: 'New Custom Asset',
      category: 'doodad',
      tree_path: ['Custom', 'Drafts'],
      provenance: {
        source: 'custom_upload',
        dateAdded: new Date().toISOString()
      },
      visuals: {
        thumbnail: TEXTURE_PRESET_LIBRARY[0]?.dataUrl || '',
        baseTexture: TEXTURE_PRESET_LIBRARY[0]?.dataUrl || '',
        variants: [],
        auto_tile: 'none'
      }
    });
    handleIngestUnits([blank]);
    setIsStudioModalOpen(true);
    showToast({ type: 'success', text: `Created blank AssetUnit "${blank.name}"` });
  };

  const handleDuplicateSelected = () => {
    if (!selectedUnit) return;
    const copy = duplicateAssetUnit(selectedUnit.unit_id);
    if (copy) {
      setSelectedUnitId(copy.unit_id);
      showToast({ type: 'success', text: `Duplicated "${selectedUnit.name}" as "${copy.name}"` });
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedUnit || isCorePresetUnitId(selectedUnit.unit_id)) return;
    if (!(await confirmTypedDeletion(selectedUnit.name, 'custom asset unit'))) return;
    const deletedName = selectedUnit.name;
    const removed = deleteAssetUnit(selectedUnit.unit_id);
    if (removed) {
      const remaining = useAssetUnitStore.getState().assets;
      setSelectedUnitId(remaining[0]?.unit_id || '');
      showToast({ type: 'info', text: `Deleted asset unit "${deletedName}".` });
    }
  };

  const handleResetPresetSelected = () => {
    if (!selectedUnit || !isCorePresetUnitId(selectedUnit.unit_id)) return;
    const restored = resetPresetAssetUnit(selectedUnit.unit_id);
    if (restored) {
      setImageErrorMap(prev => ({ ...prev, [restored.unit_id]: false }));
      showToast({ type: 'info', text: `Reset core preset "${restored.name}" to factory defaults.` });
    }
  };

  const handleImportPackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const res = importTangentPack(text);
      if (res.success) {
        showToast({ type: 'success', title: 'Pack Imported', text: `Imported ${res.count} AssetUnits from ${file.name}.` });
      } else {
        showToast({ type: 'error', title: 'Pack Import Failed', text: res.error || 'Malformed .tangent-pack file.' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Pack Read Failed', text: err?.message || 'Unable to read pack file.' });
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

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedUnit) return;
    try {
      const uploaded = await uploadAdeImageAsset(file, {
        userId: auth?.currentUser?.uid,
        assetCategory: 'tokens',
        fileName: `${selectedUnit.unit_id}_${file.name}`
      });
      const updated: AssetUnit = {
        ...selectedUnit,
        visuals: {
          ...selectedUnit.visuals,
          baseTexture: uploaded.url,
          thumbnail: uploaded.url
        }
      };
      handleSaveAsset(updated);
      setImageErrorMap(prev => ({ ...prev, [selectedUnit.unit_id]: false }));
      showToast({
        type: 'success',
        text: uploaded.offloaded
          ? `Uploaded & offloaded image for "${selectedUnit.name}"`
          : `Uploaded custom image for "${selectedUnit.name}"`
      });
    } catch (err: any) {
      showToast({ type: 'error', text: err?.message || 'Failed to upload custom image.' });
    }
  };

  const handleApplyPreset = (dataUrl: string, presetName: string) => {
    if (!selectedUnit) return;
    const updated: AssetUnit = {
      ...selectedUnit,
      visuals: {
        ...selectedUnit.visuals,
        baseTexture: dataUrl,
        thumbnail: dataUrl
      }
    };
    handleSaveAsset(updated);
    setImageErrorMap(prev => ({ ...prev, [selectedUnit.unit_id]: false }));
    setIsPresetPickerOpen(false);
    showToast({ type: 'success', text: `Applied preset "${presetName}" to "${selectedUnit.name}"` });
  };

  const handleDrawingStudioSave = async (dataUrl: string) => {
    if (!selectedUnit) return;
    try {
      const uploaded = await uploadAdeImageAsset(dataUrl, {
        userId: auth?.currentUser?.uid,
        assetCategory: 'tokens',
        fileName: `${selectedUnit.unit_id}_drawn`
      });
      const updated: AssetUnit = {
        ...selectedUnit,
        visuals: {
          ...selectedUnit.visuals,
          baseTexture: uploaded.url,
          thumbnail: uploaded.url
        }
      };
      handleSaveAsset(updated);
      setImageErrorMap(prev => ({ ...prev, [selectedUnit.unit_id]: false }));
      setIsDrawingStudioOpen(false);
      showToast({ type: 'success', text: `Saved custom texture for "${selectedUnit.name}"` });
    } catch (err: any) {
      showToast({ type: 'error', text: err?.message || 'Failed to save drawn texture.' });
    }
  };

  const handleSynthesizeRecipeToSelected = (
    recipe: TileSynthesisRecipe,
    dataUrlOrOptions?: string | { includeAutoTiles?: boolean; includeStateTextures?: boolean }
  ) => {
    if (!selectedUnit) return;
    const explicitUrl = typeof dataUrlOrOptions === 'string' ? dataUrlOrOptions : undefined;
    const opts = typeof dataUrlOrOptions === 'object' && dataUrlOrOptions !== null ? dataUrlOrOptions : {};
    const tex = explicitUrl || synthesizeTileDataUrl(recipe);
    const isAutoTile = recipe.outputMode === 'marching_squares_4bit' || Boolean(opts.includeAutoTiles);
    const shouldStates = opts.includeStateTextures ?? true;
    const variants = isAutoTile ? generateAutoTileVariants4Bit(recipe, 64) : [tex];
    const stateTextures = shouldStates ? generateStateTextures(recipe) : { pristine: tex };

    const updated: AssetUnit = {
      ...selectedUnit,
      visuals: {
        ...selectedUnit.visuals,
        baseTexture: tex,
        thumbnail: tex,
        variants,
        auto_tile: isAutoTile ? 'marching_squares_4bit' : selectedUnit.visuals.auto_tile,
        stateTextures
      },
      vtt_properties: {
        ...selectedUnit.vtt_properties,
        blocks_movement: recipe.vtt.blocksMovement,
        blocks_vision: recipe.vtt.blocksVision,
        terrain: {
          material: recipe.vtt.material,
          movementCost: recipe.vtt.movementCost,
          slipperyFriction: recipe.vtt.slipperyFriction,
          footstepSfxCategory: `footstep_${recipe.vtt.material.split('_')[0]}`
        },
        dynamicLighting: recipe.vtt.emitsLight
          ? {
              emits: true,
              color: recipe.palette.glow || recipe.palette.accent,
              intensity: Math.max(0.5, recipe.ligneClaire.emissiveStrength * 2),
              radiusBrightFt: recipe.vtt.lightRadiusBrightFt ?? 10,
              radiusDimFt: recipe.vtt.lightRadiusDimFt ?? 20,
              castsShadows: true,
              animation: recipe.vtt.lightAnimation || 'pulse'
            }
          : selectedUnit.vtt_properties.dynamicLighting,
        hazard: recipe.vtt.isHazard
          ? {
              hazardType: recipe.vtt.hazardType || 'plasma_leak',
              damageFormula: recipe.vtt.damageFormula || '2d10+4 plasma',
              triggerTiming: 'on_enter',
              saveDc: {
                attribute: recipe.vtt.saveAttribute || 'Reflex (AGI)',
                target: recipe.vtt.saveDc ?? 14
              }
            }
          : selectedUnit.vtt_properties.hazard
      }
    };
    handleSaveAsset(updated);
    setImageErrorMap(prev => ({ ...prev, [selectedUnit.unit_id]: false }));
    showToast({ type: 'success', text: `Synthesized "${recipe.name}" + 2d10 VTT mechanics onto "${selectedUnit.name}"` });
  };

  const handleMintNewTileUnit = (
    recipe: TileSynthesisRecipe,
    options: { includeAutoTiles: boolean; includeStateTextures: boolean }
  ) => {
    const newUnit = compileRecipeToAssetUnit(recipe, {
      includeAutoTiles: options.includeAutoTiles || recipe.outputMode === 'marching_squares_4bit',
      includeStateTextures: options.includeStateTextures
    });
    handleIngestUnits([newUnit]);
    setIsTileSynthModalOpen(false);
    showToast({ type: 'success', text: `Minted synthesized AssetUnit "${newUnit.name}" into catalog!` });
  };

  const backdropClasses = {
    checker: 'bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-950',
    dark: 'bg-[#090d13]',
    grid: 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] bg-[#090d13]',
    light: 'bg-slate-200'
  };

  const isErrored = selectedUnit ? imageErrorMap[selectedUnit.unit_id] : false;
  const activeImageUrl = selectedUnit 
    ? (isErrored ? getAssetVisualFallback(selectedUnit) : resolveAssetTexture(selectedUnit))
    : '';
  const heroCustomCss = buildCssFilterFromCustomization(selectedUnit?.visuals?.customization);

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
          {onOpenChunkStudio && (
            <button
              type="button"
              onClick={onOpenChunkStudio}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-semibold transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
              title="Open Map Chunk Forge Studio (Multi-Tile Prefabs & Construction Points)"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Chunk Forge Studio</span>
            </button>
          )}
          {selectedUnit && (
            <>
              <button
                type="button"
                onClick={() => setIsDrawingStudioOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-all shadow-md shadow-cyan-950/60"
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Paint / Edit Image</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPresetPickerOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 font-mono text-xs transition-colors"
                title="Select from pre-built textures and sprites"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsTileSynthModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-mono text-xs font-semibold transition-all shadow-md shadow-purple-950/60"
            title="HIFI CHROMA Micro-Tile Synthesizer — Generate Seamless Tiles, 4-Bit Auto-Tiles & VTT Hazards"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize Tile Unit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIngestionModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60 font-mono text-xs transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Assets</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSlicerModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 font-mono text-xs transition-colors shadow-sm"
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
              <span>Property Forge</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCreateBlankUnit}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-cyan-900/70 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/60 font-mono text-xs transition-colors"
            title="Create a brand-new blank custom AssetUnit and open Property Forge"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Blank Unit</span>
          </button>

          <button
            type="button"
            onClick={() => packInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs border border-slate-700 transition-colors"
            title="Import a .tangent-pack.json archive into the catalog"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Pack</span>
          </button>
          <input
            ref={packInputRef}
            type="file"
            accept=".json,.tangent-pack"
            onChange={handleImportPackFile}
            className="hidden"
          />

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
              provenanceFilter={provenanceFilter}
            />
          </div>
        </div>

        {/* Right Column: Asset Unit Inspector & Stamp Cockpit */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-900/40">
          {selectedUnit ? (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Asset Hero Card */}
              <div className="bg-slate-900/90 border border-cyan-900/60 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 items-start">
                
                {/* Visual Preview Box & Quick Image Action Rails */}
                <div className="flex flex-col items-center gap-2.5 shrink-0">
                  <div
                    className={`w-48 h-48 border border-slate-700 rounded-lg flex items-center justify-center p-3 relative overflow-hidden shadow-inner group ${backdropClasses[previewBackdrop]}`}
                  >
                    {activeImageUrl ? (
                      <>
                        <img
                          key={`${selectedUnit.unit_id}-${activeImageUrl}`}
                          src={activeImageUrl}
                          alt={selectedUnit.name}
                          style={{ filter: heroCustomCss.filter }}
                          className="max-w-full max-h-full object-contain drop-shadow-md select-none transition-transform group-hover:scale-105"
                          onError={() => {
                            setImageErrorMap(prev => ({ ...prev, [selectedUnit.unit_id]: true }));
                          }}
                        />
                        {heroCustomCss.tintOverlay && (
                          <div
                            className="pointer-events-none absolute inset-0"
                            style={{ backgroundColor: heroCustomCss.tintOverlay, mixBlendMode: 'multiply' }}
                          />
                        )}
                      </>
                    ) : (
                      <Box className="w-16 h-16 text-cyan-400/40" />
                    )}

                    {/* Interactive Hover Overlay with Quick Edit & Upload */}
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setIsDrawingStudioOpen(true)}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Edit Canvas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    {/* Cell dimensions badge */}
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-cyan-300 border border-cyan-800/40 pointer-events-none">
                      {selectedUnit.dimensions[0]}x{selectedUnit.dimensions[1]} cells
                    </span>

                    {/* Backdrop mode switchers in top-left */}
                    <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/70 p-1 rounded-md border border-slate-800 shadow">
                      {(['checker', 'dark', 'grid', 'light'] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPreviewBackdrop(mode)}
                          title={`Backdrop: ${mode}`}
                          className={`w-3 h-3 rounded-full transition-transform ${
                            previewBackdrop === mode ? 'ring-2 ring-cyan-400 scale-110' : 'opacity-60 hover:opacity-100'
                          } ${
                            mode === 'checker' ? 'bg-slate-500' : (mode === 'dark' ? 'bg-black' : (mode === 'grid' ? 'bg-cyan-700' : 'bg-white'))
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Image Edit & Texture Toolbar Below Preview */}
                  <div className="flex items-center gap-1.5 w-48">
                    <button
                      type="button"
                      onClick={() => setIsDrawingStudioOpen(true)}
                      className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-[11px] font-medium transition-colors"
                      title="Open in Drawing Studio (Brushes, Shapes, Shaders, Procedural Generation)"
                    >
                      <Paintbrush className="w-3 h-3" />
                      <span>Paint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
                      title="Upload local PNG/WebP/SVG file"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPresetPickerOpen(true)}
                      className="px-2 py-1.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 font-mono text-[11px] transition-colors"
                      title="Choose from preset library"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Direct Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleDirectImageUpload}
                  className="hidden"
                />

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
                  <div className="flex items-center space-x-3 pt-3 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onStampAssetOnMap(selectedUnit)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-950/80 transition-all hover:scale-102"
                    >
                      <span>Stamp onto Active Map</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {selectedUnit.category === 'terrain_brush' && onEquipTerrainBrush && (
                      <button
                        type="button"
                        onClick={() => onEquipTerrainBrush(selectedUnit)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-mono text-xs font-semibold transition-colors"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Equip Terrain Brush</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsDrawingStudioOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-mono text-xs border border-cyan-700/60 transition-colors"
                    >
                      <Paintbrush className="w-4 h-4 text-cyan-400" />
                      <span>Edit in Drawing Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStudioModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-xs font-semibold border border-emerald-600 transition-colors shadow-sm"
                    >
                      <Sliders className="w-4 h-4 text-emerald-300" />
                      <span>Open Property Forge</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDuplicateSelected}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-colors"
                      title="Clone this AssetUnit as a new custom variant"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duplicate</span>
                    </button>

                    {isCorePresetUnitId(selectedUnit.unit_id) ? (
                      modifiedSeedIds.includes(selectedUnit.unit_id) && (
                        <button
                          type="button"
                          onClick={handleResetPresetSelected}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-mono text-xs border border-amber-700/60 transition-colors"
                          title="Revert edits back to factory preset defaults"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Preset</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 font-mono text-xs border border-red-800/60 transition-colors"
                        title="Permanently delete this custom AssetUnit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Unit</span>
                      </button>
                    )}
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

                {/* Dynamic Lighting */}
                {selectedUnit.vtt_properties.dynamicLighting?.emits && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold border-b border-slate-800 pb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Dynamic Lighting</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Color: <span className="font-mono text-cyan-300">{selectedUnit.vtt_properties.dynamicLighting.color}</span></div>
                      <div>Intensity: <span className="text-amber-400">{selectedUnit.vtt_properties.dynamicLighting.intensity}x</span></div>
                      <div>Bright/Dim: <span className="text-slate-300">{selectedUnit.vtt_properties.dynamicLighting.radiusBrightFt}ft / {selectedUnit.vtt_properties.dynamicLighting.radiusDimFt}ft</span></div>
                      <div>Animation: <span className="text-slate-400 capitalize">{selectedUnit.vtt_properties.dynamicLighting.animation}</span></div>
                    </div>
                  </div>
                )}

                {/* Triggers & Traps */}
                {selectedUnit.vtt_properties.trigger?.enabled && (
                  <div className="bg-slate-900/80 border border-amber-900/50 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-amber-400 font-semibold border-b border-slate-800 pb-2">
                      <Zap className="w-4 h-4" />
                      <span>Reactive Trigger</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Type: <span className="text-amber-300 capitalize">{selectedUnit.vtt_properties.trigger.triggerType.replace('_', ' ')}</span></div>
                      <div>Radius: <span className="text-slate-300">{selectedUnit.vtt_properties.trigger.triggerRadiusFt} ft</span></div>
                      <div>Save: <span className="text-cyan-300">{selectedUnit.vtt_properties.trigger.saveType} (DC {selectedUnit.vtt_properties.trigger.saveDc})</span></div>
                      {selectedUnit.vtt_properties.trigger.damageFormula && (
                        <div>Damage: <span className="text-red-400 font-bold">{selectedUnit.vtt_properties.trigger.damageFormula} {selectedUnit.vtt_properties.trigger.damageType}</span></div>
                      )}
                      {selectedUnit.vtt_properties.trigger.appliedCondition && selectedUnit.vtt_properties.trigger.appliedCondition !== 'none' && (
                        <div>Condition: <span className="text-purple-400 font-bold">{selectedUnit.vtt_properties.trigger.appliedCondition}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Script & Macros */}
                {selectedUnit.vtt_properties.script?.enabled && (
                  <div className="bg-slate-900/80 border border-cyan-900/50 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-cyan-400 font-semibold border-b border-slate-800 pb-2">
                      <Code2 className="w-4 h-4" />
                      <span>Script & Automation</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Hook: <span className="text-cyan-300 font-mono">{selectedUnit.vtt_properties.script.executionHook}</span></div>
                      <div>Autorun: <span className={selectedUnit.vtt_properties.script.autorun ? 'text-amber-400' : 'text-slate-400'}>{String(selectedUnit.vtt_properties.script.autorun)}</span></div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[10px] text-slate-500">Script Preview:</span>
                      <pre className="text-slate-300 bg-slate-950 p-2 rounded text-[10px] overflow-x-auto max-h-16 mt-0.5 border border-slate-800 font-mono">
                        {selectedUnit.vtt_properties.script.sourceCode}
                      </pre>
                    </div>
                  </div>
                )}
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

      {/* MODAL 1: Dedicated Image & Canvas Drawing Studio */}
      {isDrawingStudioOpen && selectedUnit && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDrawingStudioOpen(false);
          }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Asset Drawing Studio — ${selectedUnit.name}`}
            className="bg-slate-900 border border-cyan-800 rounded-xl shadow-2xl shadow-cyan-950/80 w-full max-w-5xl flex flex-col h-[88vh] max-h-[92vh] overflow-hidden"
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/50">
              <div className="flex items-center space-x-2">
                <Paintbrush className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
                  Asset Drawing & Image Studio — {selectedUnit.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawingStudioOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-y-auto custom-scrollbar">
              <AssetDrawingStudio
                key={selectedUnit.unit_id}
                initialImage={activeImageUrl}
                assetType={selectedUnit.category === 'terrain_brush' ? 'terrain' : 'object'}
                label={`Drawing Studio — ${selectedUnit.name}`}
                onChange={() => {}}
                onSaveToAsset={handleDrawingStudioSave}
                onSynthesizeRecipe={handleSynthesizeRecipeToSelected}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1B: Shared HIFI CHROMA Tile Unit Synthesizer Modal */}
      <TileSynthesizerModal
        isOpen={isTileSynthModalOpen}
        onClose={() => setIsTileSynthModalOpen(false)}
        selectedUnitName={selectedUnit?.name}
        onApplyToSelected={(recipe, options) => {
          handleSynthesizeRecipeToSelected(recipe, options);
          setIsTileSynthModalOpen(false);
        }}
        onMintNewUnit={handleMintNewTileUnit}
      />

      {/* MODAL 2: Preset Textures & Sprites Library */}
      {isPresetPickerOpen && selectedUnit && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPresetPickerOpen(false);
          }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Preset Textures and Sprites Library"
            className="bg-slate-900 border border-cyan-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
                  Preset Textures & Sprites Library
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetPickerOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[68vh] custom-scrollbar">
              {TEXTURE_PRESET_LIBRARY.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.dataUrl, preset.name)}
                  className="flex flex-col items-center p-3 rounded-lg border border-slate-700 hover:border-cyan-400 bg-slate-950/80 hover:bg-slate-900 transition-all text-center group shadow-md"
                >
                  <div className="w-20 h-20 rounded bg-slate-900 border border-slate-800 p-1.5 flex items-center justify-center mb-2 overflow-hidden group-hover:scale-105 transition-transform shadow-inner">
                    <img src={preset.dataUrl} alt={preset.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate w-full">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                    {preset.category.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ingestion & Slicer Modals */}
      <AssetIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onAssetIngested={(asset, andOpenForge) => {
          handleIngestUnits([asset]);
          if (andOpenForge) {
            setSelectedUnitId(asset.unit_id);
            setIsStudioModalOpen(true);
          }
        }}
        onPackImported={(assetsList) => {
          handleIngestUnits(assetsList);
        }}
      />

      <SpriteSheetCutterModal
        isOpen={isSlicerModalOpen}
        onClose={() => setIsSlicerModalOpen(false)}
        onBatchIngested={handleIngestUnits}
      />

      {/* Property Forge Modal */}
      {selectedUnit && (
        <AssetStudioModal
          key={selectedUnit.unit_id}
          isOpen={isStudioModalOpen}
          asset={selectedUnit}
          onClose={() => setIsStudioModalOpen(false)}
          onSaveAsset={handleSaveAsset}
        />
      )}
    </div>
  );
};
