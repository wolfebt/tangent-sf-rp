/**
 * @file AssetIngestionModal.tsx
 * @description Comprehensive Ingestion Pipeline for importing external art assets
 * and configuring all spatial, tactical, trigger, and script properties.
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Scissors,
  Sliders,
  Shield,
  Lightbulb,
  Layers,
  Tag,
  Zap,
  Code2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  ASSET_CATEGORIES, 
  STAGE_Z_LAYERS,
  SURFACE_MATERIALS,
  COVER_RATINGS,
  SAVE_TYPES,
  TRIGGER_CONDITIONS,
  type AssetUnit, 
  type AssetCategory,
  type StageZLayerName,
  type SurfaceMaterialType,
  type CoverRating,
  type TriggerType,
  type SaveType,
  type TriggerCondition,
  type ScriptHook,
  type AutoTileAlgorithm
} from '../../../schemas/assetUnitSchema';
import { 
  AssetIngestionPipeline, 
  INGESTION_ARCHETYPES,
  type IngestionArchetype 
} from '../../../engine/assets/AssetIngestionPipeline';
import { SpriteSheetCutterModal } from './SpriteSheetCutterModal';

export interface AssetIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetIngested: (asset: AssetUnit, andOpenForge?: boolean) => void;
}

type PipelineSection = 'identity' | 'physics' | 'tactical' | 'triggers' | 'script';

export const AssetIngestionModal: React.FC<AssetIngestionModalProps> = ({
  isOpen,
  onClose,
  onAssetIngested
}) => {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<PipelineSection>('identity');

  // Section 1: Identity & Visuals
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('doodad');
  const [treePathInput, setTreePathInput] = useState('Custom / Props');
  const [tagsInput, setTagsInput] = useState('custom, scifi');
  const [dimW, setDimW] = useState(1);
  const [dimH, setDimH] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSlicerOpen, setIsSlicerOpen] = useState(false);

  // Section 2: VTT Physics & Spatial
  const [blocksMovement, setBlocksMovement] = useState(false);
  const [blocksVision, setBlocksVision] = useState(false);
  const [zIndexLayer, setZIndexLayer] = useState<StageZLayerName>('interactive_objects');
  const [autoTile, setAutoTile] = useState<AutoTileAlgorithm>('none');

  // Section 3: Tactical & Dynamic Lighting
  const [emitsLight, setEmitsLight] = useState(false);
  const [lightColor, setLightColor] = useState('#38bdf8');
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [lightRadiusBright, setLightRadiusBright] = useState(10);
  const [lightRadiusDim, setLightRadiusDim] = useState(20);
  const [lightAnimation, setLightAnimation] = useState<'solid' | 'torch_flicker' | 'pulse' | 'emergency_strobe' | 'plasma_churn'>('solid');

  // Category specific
  const [surfaceMaterial, setSurfaceMaterial] = useState<SurfaceMaterialType>('metal_deck');
  const [movementCost, setMovementCost] = useState(1.0);
  const [coverRating, setCoverRating] = useState<CoverRating>('half_cover');
  const [isDestructible, setIsDestructible] = useState(false);
  const [structureHp, setStructureHp] = useState(25);
  const [hazardType, setHazardType] = useState<'plasma_leak' | 'acid_corrosive' | 'biohazard_spore' | 'radiation_leak' | 'thermal_fire' | 'vacuum'>('plasma_leak');
  const [hazardDamage, setHazardDamage] = useState('2d10 plasma');

  // Section 4: Triggers
  const [triggerEnabled, setTriggerEnabled] = useState(false);
  const [triggerType, setTriggerType] = useState<TriggerType>('step_on');
  const [triggerRadiusFt, setTriggerRadiusFt] = useState(5);
  const [saveType, setSaveType] = useState<SaveType>('Reflex (AGI)');
  const [saveDc, setSaveDc] = useState(14);
  const [triggerDamage, setTriggerDamage] = useState('2d10');
  const [triggerDamageType, setTriggerDamageType] = useState<'plasma' | 'energy' | 'kinetic' | 'chemical' | 'thermal' | 'emp' | 'lethal'>('plasma');
  const [appliedCondition, setAppliedCondition] = useState<TriggerCondition>('none');
  const [disarmDc, setDisarmDc] = useState(13);
  const [detectionDc, setDetectionDc] = useState(14);
  const [oneShotTrigger, setOneShotTrigger] = useState(true);
  const [gmSecretNotes, setGmSecretNotes] = useState('');

  // Section 5: Script
  const [scriptEnabled, setScriptEnabled] = useState(false);
  const [scriptHook, setScriptHook] = useState<ScriptHook>('on_interact');
  const [scriptAutorun, setScriptAutorun] = useState(false);
  const [sourceCode, setSourceCode] = useState(`// QuickJS Macro Script
const roll = Dice.check2d10(2, 14);
if (roll.success) {
  StoryFlags.set("power_active", true);
}
return roll;`);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Apply Quick Archetype Preset
  const handleApplyArchetype = (arch: IngestionArchetype) => {
    setCategory(arch.category);
    if (arch.defaultTags?.length) {
      setTagsInput(arch.defaultTags.join(', '));
    }
    const vp = arch.vttProperties;
    if (vp) {
      setBlocksMovement(vp.blocks_movement ?? false);
      setBlocksVision(vp.blocks_vision ?? false);
      if (vp.z_index_layer) setZIndexLayer(vp.z_index_layer);
      
      if (vp.doodad) {
        setCoverRating(vp.doodad.cover || 'none');
        setIsDestructible(vp.doodad.isDestructible ?? false);
        if (vp.doodad.structureHp) setStructureHp(vp.doodad.structureHp);
      }
      if (vp.terrain) {
        setSurfaceMaterial(vp.terrain.material || 'metal_deck');
        setMovementCost(vp.terrain.movementCost ?? 1.0);
      }
      if (vp.hazard) {
        setHazardType(vp.hazard.hazardType || 'plasma_leak');
        setHazardDamage(vp.hazard.damageFormula || '2d10 plasma');
      }
      if (vp.dynamicLighting) {
        setEmitsLight(vp.dynamicLighting.emits ?? true);
        if (vp.dynamicLighting.color) setLightColor(vp.dynamicLighting.color);
        if (vp.dynamicLighting.intensity) setLightIntensity(vp.dynamicLighting.intensity);
        if (vp.dynamicLighting.radiusBrightFt) setLightRadiusBright(vp.dynamicLighting.radiusBrightFt);
        if (vp.dynamicLighting.radiusDimFt) setLightRadiusDim(vp.dynamicLighting.radiusDimFt);
        if (vp.dynamicLighting.animation) setLightAnimation(vp.dynamicLighting.animation as any);
      }
      if (vp.trigger) {
        setTriggerEnabled(vp.trigger.enabled ?? true);
        setTriggerType(vp.trigger.triggerType || 'step_on');
        setTriggerRadiusFt(vp.trigger.triggerRadiusFt || 5);
        setSaveType(vp.trigger.saveType || 'Reflex (AGI)');
        setSaveDc(vp.trigger.saveDc || 14);
        if (vp.trigger.damageFormula) setTriggerDamage(vp.trigger.damageFormula);
        if (vp.trigger.damageType) setTriggerDamageType(vp.trigger.damageType as any);
        if (vp.trigger.appliedCondition) setAppliedCondition(vp.trigger.appliedCondition as any);
        if (vp.trigger.disarmDc) setDisarmDc(vp.trigger.disarmDc);
        if (vp.trigger.detectionDc) setDetectionDc(vp.trigger.detectionDc);
        if (vp.trigger.gmSecretNotes) setGmSecretNotes(vp.trigger.gmSecretNotes);
        setOneShotTrigger(vp.trigger.oneShot ?? true);
      }
      if (vp.script) {
        setScriptEnabled(vp.script.enabled ?? true);
        setScriptHook(vp.script.executionHook || 'on_interact');
        setScriptAutorun(vp.script.autorun ?? false);
        if (vp.script.sourceCode) setSourceCode(vp.script.sourceCode);
      }
    }
  };

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

  const handleExecuteIngestion = (andOpenForge: boolean = false) => {
    if (!name.trim()) {
      setError('Please provide an asset name.');
      setActiveSection('identity');
      return;
    }
    if (!previewUrl) {
      setError('Please upload an image file.');
      setActiveSection('identity');
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

    // Build comprehensive vtt_properties
    const compiledVttProperties: any = {
      blocks_movement: blocksMovement,
      blocks_vision: blocksVision,
      z_index_layer: zIndexLayer
    };

    if (category === 'terrain_brush') {
      compiledVttProperties.terrain = {
        material: surfaceMaterial,
        movementCost,
        slipperyFriction: 1.0,
        footstepSfxCategory: `footstep_${surfaceMaterial.split('_')[0] || 'metal'}`
      };
    } else if (category === 'doodad') {
      compiledVttProperties.doodad = {
        cover: coverRating,
        isDestructible,
        structureHp: isDestructible ? structureHp : undefined,
        armorDr: isDestructible ? { kinetic: 2, energy: 2 } : undefined
      };
    } else if (category === 'hazard') {
      compiledVttProperties.hazard = {
        hazardType,
        damageFormula: hazardDamage,
        triggerTiming: triggerType === 'turn_start' ? 'on_turn_start' : 'on_enter'
      };
    }

    if (emitsLight) {
      compiledVttProperties.dynamicLighting = {
        emits: true,
        color: lightColor,
        intensity: lightIntensity,
        radiusBrightFt: lightRadiusBright,
        radiusDimFt: lightRadiusDim,
        castsShadows: true,
        animation: lightAnimation
      };
    }

    if (triggerEnabled) {
      compiledVttProperties.trigger = {
        enabled: true,
        triggerType,
        triggerRadiusFt,
        saveType,
        saveDc,
        damageFormula: triggerDamage || undefined,
        damageType: triggerDamageType,
        appliedCondition,
        disarmDc,
        detectionDc,
        gmSecretNotes,
        oneShot: oneShotTrigger
      };
    }

    if (scriptEnabled) {
      compiledVttProperties.script = {
        enabled: true,
        autorun: scriptAutorun,
        executionHook: scriptHook,
        sourceCode,
        timeoutMs: 500
      };
    }

    const result = AssetIngestionPipeline.ingestSingleAsset({
      name: name.trim(),
      category,
      treePath: treePath.length > 0 ? treePath : ['Custom Uploads', category],
      tags,
      dimensions: [dimW, dimH],
      imageDataUrl: previewUrl,
      thumbnailUrl: previewUrl,
      autoTile: category === 'terrain_brush' ? autoTile : 'none',
      vttProperties: compiledVttProperties
    });

    if (result.success && result.asset) {
      onAssetIngested(result.asset, andOpenForge);
      onClose();
    } else {
      setError(result.error || 'Failed to ingest asset.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-8 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-cyan-800/90 rounded-xl shadow-2xl shadow-cyan-950/80 w-full max-w-3xl flex flex-col h-[82vh] max-h-[calc(100vh-6rem)] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-cyan-900/50">
            <div className="flex items-center space-x-2.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <div>
                <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                  Asset Ingestion & Property Pipeline
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  Ingest textures, define physical bounding boxes, configure triggers and attach macros.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsSlicerOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-700/60 transition-colors"
                title="Slice a sprite sheet or tile map into frames"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Sprite Slicer</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Archetype Preset Bar */}
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px] font-mono">
            <div className="flex items-center space-x-1 text-slate-400 shrink-0 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Presets:</span>
            </div>
            {INGESTION_ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleApplyArchetype(arch)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/50 shrink-0 transition-colors"
                title={arch.description}
              >
                {arch.label}
              </button>
            ))}
          </div>

          {/* Pipeline Step Navigation Tabs */}
          <div className="flex items-center space-x-1 px-5 py-2 bg-slate-900/90 border-b border-slate-800 font-mono text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('identity')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
                activeSection === 'identity' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>1. Identity & File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('physics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
                activeSection === 'physics' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>2. Spatial & Physics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('tactical')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
                activeSection === 'tactical' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Tactical & Light</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('triggers')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
                activeSection === 'triggers' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>4. Triggers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('script')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
                activeSection === 'script' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>5. Script Macro</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-xs space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1: Identity & File */}
            {activeSection === 'identity' && (
              <div className="space-y-4">
                {/* Drop / Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60 group"
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
                        className="max-h-36 object-contain rounded-lg border border-cyan-900/60 bg-black/60 p-2 shadow-inner"
                      />
                      <span className="text-[11px] text-cyan-400 group-hover:underline">
                        Click to change image
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-400">
                      <ImageIcon className="w-10 h-10 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-sm font-semibold">Drop PNG / WebP / SVG or click to browse</span>
                      <span className="text-[10px] text-slate-500">Supports transparent alpha channels and pixel-perfect scaling</span>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-[11px] text-slate-400 mb-1">Asset Category</label>
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
            )}

            {/* SECTION 2: Spatial & Physics */}
            {activeSection === 'physics' && (
              <div className="space-y-4 max-w-xl">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-cyan-400 font-bold uppercase text-xs">Tactical Spatial Rules</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blocksMovement}
                        onChange={(e) => setBlocksMovement(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span className="text-slate-200">Blocks Movement (Operatives cannot walk through)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blocksVision}
                        onChange={(e) => setBlocksVision(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span className="text-slate-200">Blocks Vision (Casts Raycast Shadows & Fog of War walls)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Stage Z-Index Compositing Layer</label>
                    <select
                      value={zIndexLayer}
                      onChange={(e) => setZIndexLayer(e.target.value as StageZLayerName)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                    >
                      {STAGE_Z_LAYERS.map((layer) => (
                        <option key={layer} value={layer}>{layer.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {category === 'terrain_brush' && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Auto-Tile Bitmask Algorithm</label>
                      <select
                        value={autoTile}
                        onChange={(e) => setAutoTile(e.target.value as AutoTileAlgorithm)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="none">none (Individual Tile Pattern)</option>
                        <option value="marching_squares_4bit">Marching Squares 4-bit (Cardinal Smooth Transitions)</option>
                        <option value="marching_squares_8bit">Marching Squares 8-bit (Diagonal Edge Corner Transitions)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 3: Tactical Attributes & Dynamic Lighting */}
            {activeSection === 'tactical' && (
              <div className="space-y-4 max-w-xl">
                {/* Category Modifiers */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-cyan-400 font-bold uppercase text-xs">Category-Specific Parameters</h3>

                  {category === 'terrain_brush' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Surface Material</label>
                        <select
                          value={surfaceMaterial}
                          onChange={(e) => setSurfaceMaterial(e.target.value as SurfaceMaterialType)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                        >
                          {SURFACE_MATERIALS.map(m => (
                            <option key={m} value={m}>{m.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Movement Cost Multiplier</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="4"
                          value={movementCost}
                          onChange={(e) => setMovementCost(parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {category === 'doodad' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tactical Cover Rating</label>
                        <select
                          value={coverRating}
                          onChange={(e) => setCoverRating(e.target.value as CoverRating)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                        >
                          {COVER_RATINGS.map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDestructible}
                            onChange={(e) => setIsDestructible(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                          />
                          <span className="text-slate-300">Destructible Cover</span>
                        </label>

                        {isDestructible && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">Structure HP:</span>
                            <input
                              type="number"
                              min="5"
                              max="200"
                              value={structureHp}
                              onChange={(e) => setStructureHp(parseInt(e.target.value, 10) || 20)}
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {category === 'hazard' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Hazard Type</label>
                        <select
                          value={hazardType}
                          onChange={(e) => setHazardType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        >
                          <option value="plasma_leak">Plasma Leak (Energy / Thermal)</option>
                          <option value="acid_corrosive">Acid Pool (Corrosive / Chemical)</option>
                          <option value="biohazard_spore">Biohazard Spores (Toxic)</option>
                          <option value="radiation_leak">Radiation Leak</option>
                          <option value="thermal_fire">Thermal Firestorm</option>
                          <option value="vacuum">Hull Breach Vacuum</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Damage Formula</label>
                        <input
                          type="text"
                          value={hazardDamage}
                          onChange={(e) => setHazardDamage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Lighting Section */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h3 className="text-slate-200 font-bold uppercase text-xs">Dynamic Lighting Emitter</h3>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emitsLight}
                        onChange={(e) => setEmitsLight(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500"
                      />
                      <span className="text-amber-400 font-semibold">Emits Light</span>
                    </label>
                  </div>

                  {emitsLight && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Color</label>
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="color"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={lightColor}
                              onChange={(e) => setLightColor(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Bright Radius (ft)</label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={lightRadiusBright}
                            onChange={(e) => setLightRadiusBright(parseInt(e.target.value, 10) || 10)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Dim Radius (ft)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={lightRadiusDim}
                            onChange={(e) => setLightRadiusDim(parseInt(e.target.value, 10) || 20)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Intensity</label>
                          <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.1"
                            value={lightIntensity}
                            onChange={(e) => setLightIntensity(parseFloat(e.target.value) || 1.0)}
                            className="w-full accent-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Animation</label>
                          <select
                            value={lightAnimation}
                            onChange={(e) => setLightAnimation(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="solid">Solid Steady</option>
                            <option value="pulse">Pulse Oscillation</option>
                            <option value="torch_flicker">Flicker Glow</option>
                            <option value="emergency_strobe">Emergency Strobe</option>
                            <option value="plasma_churn">Plasma Churn</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 4: Triggers */}
            {activeSection === 'triggers' && (
              <div className="space-y-4 max-w-xl">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h3 className="text-slate-100 font-bold uppercase text-xs">Reactive Trigger Setup</h3>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={triggerEnabled}
                        onChange={(e) => setTriggerEnabled(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500"
                      />
                      <span className="text-amber-400 font-semibold">Arm Spatial Trigger</span>
                    </label>
                  </div>

                  {triggerEnabled ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Trigger Type</label>
                          <select
                            value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                          >
                            <option value="step_on">Step-On (Pressure Plate)</option>
                            <option value="proximity">Proximity (Sensor Radius)</option>
                            <option value="interact">Interaction (Player Click)</option>
                            <option value="turn_start">Turn Start (Hazard Pulse)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Radius: {triggerRadiusFt} ft
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="5"
                            value={triggerRadiusFt}
                            onChange={(e) => setTriggerRadiusFt(parseInt(e.target.value, 10))}
                            className="w-full accent-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Saving Throw</label>
                          <select
                            value={saveType}
                            onChange={(e) => setSaveType(e.target.value as SaveType)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            {SAVE_TYPES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Save DC Check</label>
                          <input
                            type="number"
                            min="5"
                            max="25"
                            value={saveDc}
                            onChange={(e) => setSaveDc(parseInt(e.target.value, 10) || 12)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Damage Formula</label>
                          <input
                            type="text"
                            value={triggerDamage}
                            onChange={(e) => setTriggerDamage(e.target.value)}
                            placeholder="e.g. 2d10"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Damage Type</label>
                          <select
                            value={triggerDamageType}
                            onChange={(e) => setTriggerDamageType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            {['plasma', 'energy', 'kinetic', 'chemical', 'thermal', 'emp', 'lethal'].map(dt => (
                              <option key={dt} value={dt}>{dt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Condition</label>
                          <select
                            value={appliedCondition}
                            onChange={(e) => setAppliedCondition(e.target.value as TriggerCondition)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            {TRIGGER_CONDITIONS.map(tc => (
                              <option key={tc} value={tc}>{tc}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">GM Secret & Investigation Notes</label>
                        <textarea
                          rows={2}
                          value={gmSecretNotes}
                          onChange={(e) => setGmSecretNotes(e.target.value)}
                          placeholder="Secret clues or disarm notes for the GM..."
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-xs">
                      No reactive trigger configured. Enable above if this asset should function as a mine, trap, pressure plate, or terminal.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 5: Script Macros */}
            {activeSection === 'script' && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-slate-100 font-bold uppercase text-xs">QuickJS Script Macro</h3>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scriptEnabled}
                        onChange={(e) => setScriptEnabled(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span className="text-cyan-400 font-semibold">Enable Script</span>
                    </label>
                  </div>

                  {scriptEnabled ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Execution Hook</label>
                          <select
                            value={scriptHook}
                            onChange={(e) => setScriptHook(e.target.value as ScriptHook)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="on_interact">on_interact (Operative clicks object)</option>
                            <option value="on_trigger">on_trigger (When trigger fires)</option>
                            <option value="on_turn_start">on_turn_start (Combat round start)</option>
                            <option value="manual">manual (GM invocation)</option>
                          </select>
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center space-x-2 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={scriptAutorun}
                              onChange={(e) => setScriptAutorun(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                            />
                            <span className="text-slate-300 text-[11px]">Autorun on proximity</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Macro JavaScript Code</label>
                        <textarea
                          rows={6}
                          value={sourceCode}
                          onChange={(e) => setSourceCode(e.target.value)}
                          className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded p-2.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-xs">
                      No script macro attached. Enable above to attach custom Dice rolls, Trauma calculations, or StoryFlag updates.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => handleExecuteIngestion(false)}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Register Asset</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteIngestion(true)}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/80 transition-colors"
                title="Save this asset and immediately open it in the Property Forge for advanced polygon/shader/macro editing"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Register & Open in Property Forge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {isSlicerOpen && (
        <SpriteSheetCutterModal
          isOpen={isSlicerOpen}
          onClose={() => setIsSlicerOpen(false)}
          onBatchIngested={(assets) => {
            assets.forEach(a => onAssetIngested(a, false));
            setIsSlicerOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default AssetIngestionModal;
