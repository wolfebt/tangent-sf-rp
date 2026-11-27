/**
 * @file AssetStudioModal.tsx
 * @description Master in-situ asset editor & property forge for customizing AssetUnits.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  X, 
  Check, 
  Palette, 
  Shield, 
  Lightbulb, 
  Layers, 
  Tag,
  Paintbrush,
  Upload,
  Sparkles,
  Zap,
  Code2,
  Play,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import type { 
  AssetUnit, 
  AssetCategory, 
  StageZLayerName, 
  SurfaceMaterialType,
  CoverRating,
  TriggerType,
  SaveType,
  TriggerCondition,
  ScriptHook
} from '../../../schemas/assetUnitSchema';
import { 
  ASSET_CATEGORIES, 
  STAGE_Z_LAYERS, 
  SURFACE_MATERIALS, 
  COVER_RATINGS,
  SAVE_TYPES,
  TRIGGER_CONDITIONS
} from '../../../schemas/assetUnitSchema';
import { CollisionHullEditor } from './CollisionHullEditor';
import { LightEmitterPlacer } from './LightEmitterPlacer';
import { ShaderTintCustomizer } from './ShaderTintCustomizer';
import { PassengerNodePlacer } from './PassengerNodePlacer';
import AssetDrawingStudio from '../../../pages/Foundry/MapMaker/map/AssetDrawingStudio';
import { resolveAssetTexture, TEXTURE_PRESET_LIBRARY } from '../../../engine/assets/assetVisualFallbacks';
import { QuickJSSandbox } from '../../../engine/scripting/QuickJSSandbox';
import { uploadAdeImageAsset } from '../../../services/adeMediaStorageService';
import { auth } from '../../../firebase';
import { showToast } from '../../../context/ToastContext';

export interface AssetStudioModalProps {
  isOpen: boolean;
  asset: AssetUnit;
  onClose: () => void;
  onSaveAsset: (updated: AssetUnit) => void;
}

type StudioTab = 'general' | 'visuals' | 'collision' | 'lighting' | 'mechanics' | 'triggers' | 'script';

export const AssetStudioModal: React.FC<AssetStudioModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSaveAsset
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('general');
  const [visualsSubTab, setVisualsSubTab] = useState<'canvas' | 'shader'>('canvas');
  const [form, setForm] = useState<AssetUnit>(() => JSON.parse(JSON.stringify(asset)));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QuickJS Sandbox Execution State for In-Situ Macro Script Testing
  const [sandboxOutput, setSandboxOutput] = useState<{
    result?: any;
    actions?: any[];
    error?: string;
    timeMs?: number;
    flags?: any;
  } | null>(null);
  const [isRunningScript, setIsRunningScript] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      setForm(JSON.parse(JSON.stringify(asset)));
      setSandboxOutput(null);
    }
  }, [isOpen, asset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestScript = async () => {
    setIsRunningScript(true);
    setSandboxOutput(null);
    try {
      const sandbox = new QuickJSSandbox();
      const code = form.vtt_properties.script?.sourceCode || '';
      const testFlags: Record<string, any> = { alarm_level: 0, power_grid: true, door_sealed: false };
      const start = performance.now();
      const exec = await sandbox.executeWithActions(code, {
        storyFlags: testFlags,
        operative: { id: 'op_test_lead', name: 'Agent Jax', hp: 45, maxHp: 50 },
        targetAsset: { id: form.unit_id, name: form.name }
      });
      const elapsed = exec.executionTimeMs ?? performance.now() - start;
      setSandboxOutput({
        result: exec.result !== undefined ? exec.result : '(Script executed cleanly with return code 0)',
        actions: Array.isArray(exec.actions) ? exec.actions : [],
        timeMs: Number(elapsed.toFixed(2)),
        flags: testFlags
      });
    } catch (err: any) {
      setSandboxOutput({
        error: err.message || String(err),
        timeMs: 0
      });
    } finally {
      setIsRunningScript(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const res = await uploadAdeImageAsset(file, {
        userId: auth?.currentUser?.uid,
        assetCategory: form.category === 'token' || form.category === 'creature' ? 'tokens' : 'maps',
        fileName: file.name
      });
      if (res?.url) {
        setForm(prev => ({
          ...prev,
          visuals: {
            ...prev.visuals,
            baseTexture: res.url,
            thumbnail: res.url
          }
        }));
      }
      if (res?.warning) {
        showToast({ type: 'warn', title: 'Large Offline Texture', text: res.warning });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Texture Upload Failed', text: err?.message || 'Unable to process uploaded image.' });
    }
  };

  const handleSave = () => {
    onSaveAsset(form);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Property Forge — ${form.name}`}
        className="bg-slate-900 border-2 border-cyan-400/80 rounded-lg shadow-[0_0_40px_rgba(6,182,212,0.3)] w-full max-w-4xl flex flex-col h-[86vh] max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/40">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
              Property Forge — {form.name}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 font-mono text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'general' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>General & Tags</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'visuals' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Visuals & Shaders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collision')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'collision' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Collisions & LoS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lighting')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'lighting' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dynamic Lighting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'mechanics' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tactical Properties</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('triggers')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'triggers' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Triggers & Traps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors shrink-0 ${
              activeTab === 'script' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script & Sandbox</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-xs space-y-4">
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
                  >
                    {ASSET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tree Path (Folder Hierarchy)</label>
                <input
                  type="text"
                  value={form.tree_path.join(' / ')}
                  onChange={(e) => setForm({
                    ...form,
                    tree_path: e.target.value.split(/[\/\>]/).map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags.join(', ')}
                  onChange={(e) => setForm({
                    ...form,
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Width (Cells)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.dimensions[0]}
                    onChange={(e) => setForm({
                      ...form,
                      dimensions: [Math.max(1, parseInt(e.target.value, 10) || 1), form.dimensions[1]]
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Height (Cells)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.dimensions[1]}
                    onChange={(e) => setForm({
                      ...form,
                      dimensions: [form.dimensions[0], Math.max(1, parseInt(e.target.value, 10) || 1)]
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Z-Index Layer</label>
                <select
                  value={form.vtt_properties.z_index_layer}
                  onChange={(e) => setForm({
                    ...form,
                    vtt_properties: {
                      ...form.vtt_properties,
                      z_index_layer: e.target.value as StageZLayerName
                    }
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
                >
                  {STAGE_Z_LAYERS.map((z) => (
                    <option key={z} value={z}>{z.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Visuals & Shaders */}
          {activeTab === 'visuals' && (
            <div className="flex flex-col space-y-4">
              {/* Visual Sub-Mode & Quick Tool Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 rounded-lg border border-cyan-900/60">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setVisualsSubTab('canvas')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                      visualsSubTab === 'canvas'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span>Canvas & Drawing Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisualsSubTab('shader')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                      visualsSubTab === 'shader'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Shader & Tint Filters</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preset Swatches Quick Selector */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold text-slate-300">Quick Texture & Sprite Presets</span>
                  </span>
                  <span>Click swatch to apply texture</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {TEXTURE_PRESET_LIBRARY.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          visuals: {
                            ...prev.visuals,
                            baseTexture: preset.dataUrl,
                            thumbnail: preset.dataUrl
                          }
                        }));
                      }}
                      title={preset.name}
                      className="group relative h-11 rounded border border-slate-700 hover:border-cyan-400 bg-slate-900 p-0.5 overflow-hidden transition-all hover:scale-105"
                    >
                      <img src={preset.dataUrl} alt={preset.name} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-cyan-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-cyan-300 font-bold transition-opacity">
                        Apply
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Studio Viewports */}
              {visualsSubTab === 'canvas' ? (
                <div className="overflow-x-auto pb-2">
                  <AssetDrawingStudio
                    key={form.unit_id}
                    initialImage={resolveAssetTexture(form)}
                    onChange={(dataUrl: string) => {
                      setForm(prev => ({
                        ...prev,
                        visuals: {
                          ...prev.visuals,
                          baseTexture: dataUrl,
                          thumbnail: dataUrl
                        }
                      }));
                    }}
                    onSaveToAsset={async (dataUrl: string) => {
                      let finalUrl = dataUrl;
                      try {
                        const res = await uploadAdeImageAsset(dataUrl, {
                          userId: auth?.currentUser?.uid,
                          assetCategory: form.category === 'token' || form.category === 'creature' ? 'tokens' : 'maps',
                          fileName: `${form.name || form.unit_id}_drawn`
                        });
                        if (res?.url) finalUrl = res.url;
                        if (res?.warning) {
                          showToast({ type: 'warn', title: 'Large Offline Texture', text: res.warning });
                        }
                      } catch (err: any) {
                        showToast({ type: 'warn', title: 'Saved Inline Texture', text: err?.message || 'Fallback to inline image data.' });
                      }
                      const updated = {
                        ...form,
                        visuals: {
                          ...form.visuals,
                          baseTexture: finalUrl,
                          thumbnail: finalUrl
                        }
                      };
                      setForm(updated);
                      onSaveAsset(updated);
                    }}
                    label={`Asset Image Canvas — ${form.name}`}
                    assetType={form.category === 'terrain_brush' ? 'terrain' : 'object'}
                  />
                </div>
              ) : (
                <div className="max-w-md mx-auto py-2">
                  <ShaderTintCustomizer
                    imageUrl={resolveAssetTexture(form)}
                    customization={form.visuals.customization}
                    onChange={(customization) => setForm({
                      ...form,
                      visuals: {
                        ...form.visuals,
                        customization
                      }
                    })}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Collisions & LoS */}
          {activeTab === 'collision' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.vtt_properties.blocks_movement}
                    onChange={(e) => setForm({
                      ...form,
                      vtt_properties: { ...form.vtt_properties, blocks_movement: e.target.checked }
                    })}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                  />
                  <span>Blocks Movement (Physical Impassable)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.vtt_properties.blocks_vision}
                    onChange={(e) => setForm({
                      ...form,
                      vtt_properties: { ...form.vtt_properties, blocks_vision: e.target.checked }
                    })}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                  />
                  <span>Blocks Vision (Generates LoS Wall)</span>
                </label>
              </div>

              <CollisionHullEditor
                imageUrl={resolveAssetTexture(form)}
                points={form.vtt_properties.customCollisionPolygon || [[0, 0], [1, 0], [1, 1], [0, 1]]}
                onChange={(points) => setForm({
                  ...form,
                  vtt_properties: { ...form.vtt_properties, customCollisionPolygon: points }
                })}
              />
            </div>
          )}

          {/* TAB 4: Lighting */}
          {activeTab === 'lighting' && (
            <div className="max-w-md">
              <LightEmitterPlacer
                imageUrl={resolveAssetTexture(form)}
                lightingProps={form.vtt_properties.dynamicLighting || {
                  emits: false,
                  color: '#ffffff',
                  intensity: 1.0,
                  radiusBrightFt: 10,
                  radiusDimFt: 20,
                  castsShadows: true,
                  animation: 'solid'
                }}
                onChange={(lightingProps) => setForm({
                  ...form,
                  vtt_properties: { ...form.vtt_properties, dynamicLighting: lightingProps }
                })}
              />
            </div>
          )}

          {/* TAB 5: Tactical Mechanics */}
          {activeTab === 'mechanics' && (
            <div className="space-y-4 max-w-2xl">
              {form.category === 'terrain_brush' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Terrain Properties</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Surface Material</label>
                      <select
                        value={form.vtt_properties.terrain?.material || 'metal_deck'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            terrain: {
                              movementCost: form.vtt_properties.terrain?.movementCost ?? 1,
                              slipperyFriction: form.vtt_properties.terrain?.slipperyFriction ?? 1,
                              footstepSfxCategory: form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal',
                              elevationOffsetFt: form.vtt_properties.terrain?.elevationOffsetFt,
                              material: e.target.value as SurfaceMaterialType
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {SURFACE_MATERIALS.map((mat) => (
                          <option key={mat} value={mat}>{mat.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Movement Cost Multiplier</label>
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        value={form.vtt_properties.terrain?.movementCost ?? 1}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            terrain: {
                              material: form.vtt_properties.terrain?.material || 'metal_deck',
                              slipperyFriction: form.vtt_properties.terrain?.slipperyFriction ?? 1,
                              footstepSfxCategory: form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal',
                              elevationOffsetFt: form.vtt_properties.terrain?.elevationOffsetFt,
                              movementCost: Math.max(0, Number(e.target.value) || 0)
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Traction / Friction (0-2)</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={2}
                        value={form.vtt_properties.terrain?.slipperyFriction ?? 1}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            terrain: {
                              material: form.vtt_properties.terrain?.material || 'metal_deck',
                              movementCost: form.vtt_properties.terrain?.movementCost ?? 1,
                              footstepSfxCategory: form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal',
                              elevationOffsetFt: form.vtt_properties.terrain?.elevationOffsetFt,
                              slipperyFriction: Math.max(0, Math.min(2, Number(e.target.value) || 0))
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Footstep Audio Tag</label>
                      <input
                        type="text"
                        value={form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            terrain: {
                              material: form.vtt_properties.terrain?.material || 'metal_deck',
                              movementCost: form.vtt_properties.terrain?.movementCost ?? 1,
                              slipperyFriction: form.vtt_properties.terrain?.slipperyFriction ?? 1,
                              elevationOffsetFt: form.vtt_properties.terrain?.elevationOffsetFt,
                              footstepSfxCategory: e.target.value
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Elevation Offset (ft)</label>
                      <input
                        type="number"
                        step="5"
                        value={form.vtt_properties.terrain?.elevationOffsetFt ?? 0}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            terrain: {
                              material: form.vtt_properties.terrain?.material || 'metal_deck',
                              movementCost: form.vtt_properties.terrain?.movementCost ?? 1,
                              slipperyFriction: form.vtt_properties.terrain?.slipperyFriction ?? 1,
                              footstepSfxCategory: form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal',
                              elevationOffsetFt: Number(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.category === 'doodad' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Prop Cover, Durability & Container</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Cover Rating</label>
                      <select
                        value={form.vtt_properties.doodad?.cover || 'none'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            doodad: {
                              ...form.vtt_properties.doodad,
                              cover: e.target.value as CoverRating,
                              isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                              isContainer: form.vtt_properties.doodad?.isContainer ?? false
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {COVER_RATINGS.map((cov) => (
                          <option key={cov} value={cov}>{cov.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Break / Force DC</label>
                      <input
                        type="number"
                        min={0}
                        value={form.vtt_properties.doodad?.breakDc ?? 15}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            doodad: {
                              ...form.vtt_properties.doodad,
                              cover: form.vtt_properties.doodad?.cover || 'none',
                              isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                              isContainer: form.vtt_properties.doodad?.isContainer ?? false,
                              breakDc: Number(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.doodad?.isDestructible ?? false}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            doodad: {
                              ...form.vtt_properties.doodad,
                              cover: form.vtt_properties.doodad?.cover || 'none',
                              isDestructible: e.target.checked,
                              isContainer: form.vtt_properties.doodad?.isContainer ?? false,
                              structureHp: form.vtt_properties.doodad?.structureHp ?? 25
                            }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span>Destructible Prop</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.doodad?.isContainer ?? false}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            doodad: {
                              ...form.vtt_properties.doodad,
                              cover: form.vtt_properties.doodad?.cover || 'none',
                              isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                              isContainer: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span>Lootable Container</span>
                    </label>
                  </div>
                  {form.vtt_properties.doodad?.isDestructible && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Structure HP</label>
                        <input
                          type="number"
                          min={1}
                          value={form.vtt_properties.doodad?.structureHp ?? 25}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: true,
                                isContainer: form.vtt_properties.doodad?.isContainer ?? false,
                                structureHp: Math.max(1, Number(e.target.value) || 1)
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Kinetic DR</label>
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.doodad?.armorDr?.kinetic ?? 0}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: true,
                                isContainer: form.vtt_properties.doodad?.isContainer ?? false,
                                armorDr: {
                                  kinetic: Math.max(0, Number(e.target.value) || 0),
                                  energy: form.vtt_properties.doodad?.armorDr?.energy ?? 0
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Energy DR</label>
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.doodad?.armorDr?.energy ?? 0}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: true,
                                isContainer: form.vtt_properties.doodad?.isContainer ?? false,
                                armorDr: {
                                  kinetic: form.vtt_properties.doodad?.armorDr?.kinetic ?? 0,
                                  energy: Math.max(0, Number(e.target.value) || 0)
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                  {form.vtt_properties.doodad?.isContainer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={form.vtt_properties.doodad?.containerDetails?.isLocked ?? false}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                                isContainer: true,
                                containerDetails: {
                                  ...form.vtt_properties.doodad?.containerDetails,
                                  isLocked: e.target.checked
                                }
                              }
                            }
                          })}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                        />
                        <span>Container Locked</span>
                      </label>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Lock Type</label>
                        <select
                          value={form.vtt_properties.doodad?.containerDetails?.lockType || 'electronic'}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                                isContainer: true,
                                containerDetails: {
                                  isLocked: form.vtt_properties.doodad?.containerDetails?.isLocked ?? true,
                                  hackDc: form.vtt_properties.doodad?.containerDetails?.hackDc,
                                  lootTableId: form.vtt_properties.doodad?.containerDetails?.lootTableId,
                                  lockType: e.target.value as 'physical' | 'electronic' | 'biometric'
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                        >
                          {(['physical', 'electronic', 'biometric'] as const).map((lt) => (
                            <option key={lt} value={lt}>{lt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Hack / Pick DC</label>
                        <input
                          type="number"
                          value={form.vtt_properties.doodad?.containerDetails?.hackDc ?? 14}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                                isContainer: true,
                                containerDetails: {
                                  isLocked: form.vtt_properties.doodad?.containerDetails?.isLocked ?? true,
                                  lockType: form.vtt_properties.doodad?.containerDetails?.lockType,
                                  lootTableId: form.vtt_properties.doodad?.containerDetails?.lootTableId,
                                  hackDc: Number(e.target.value) || 0
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Loot Table ID</label>
                        <input
                          type="text"
                          placeholder="e.g. syndicate_cache_t2"
                          value={form.vtt_properties.doodad?.containerDetails?.lootTableId || ''}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              doodad: {
                                ...form.vtt_properties.doodad,
                                cover: form.vtt_properties.doodad?.cover || 'none',
                                isDestructible: form.vtt_properties.doodad?.isDestructible ?? false,
                                isContainer: true,
                                containerDetails: {
                                  isLocked: form.vtt_properties.doodad?.containerDetails?.isLocked ?? false,
                                  lockType: form.vtt_properties.doodad?.containerDetails?.lockType,
                                  hackDc: form.vtt_properties.doodad?.containerDetails?.hackDc,
                                  lootTableId: e.target.value
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.category === 'wall_portal' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Wall & Portal Architecture</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Wall Composition</label>
                      <select
                        value={form.vtt_properties.wallPortal?.wallType || 'solid_titanium'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            wallPortal: {
                              isDoor: form.vtt_properties.wallPortal?.isDoor ?? false,
                              blocksLight: form.vtt_properties.wallPortal?.blocksLight ?? true,
                              blocksSensors: form.vtt_properties.wallPortal?.blocksSensors ?? true,
                              blocksMovement: form.vtt_properties.wallPortal?.blocksMovement ?? true,
                              soundMuffleFactor: form.vtt_properties.wallPortal?.soundMuffleFactor ?? 0.8,
                              doorType: form.vtt_properties.wallPortal?.doorType,
                              doorState: form.vtt_properties.wallPortal?.doorState,
                              wallType: e.target.value as 'solid_titanium' | 'blast_bulkhead' | 'reinforced_glass' | 'energy_shield' | 'mesh_grate'
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {(['solid_titanium', 'blast_bulkhead', 'reinforced_glass', 'energy_shield', 'mesh_grate'] as const).map((wt) => (
                          <option key={wt} value={wt}>{wt.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Sound Muffle Factor (0-1)</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1}
                        value={form.vtt_properties.wallPortal?.soundMuffleFactor ?? 0.8}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            wallPortal: {
                              wallType: form.vtt_properties.wallPortal?.wallType || 'solid_titanium',
                              isDoor: form.vtt_properties.wallPortal?.isDoor ?? false,
                              blocksLight: form.vtt_properties.wallPortal?.blocksLight ?? true,
                              blocksSensors: form.vtt_properties.wallPortal?.blocksSensors ?? true,
                              blocksMovement: form.vtt_properties.wallPortal?.blocksMovement ?? true,
                              doorType: form.vtt_properties.wallPortal?.doorType,
                              doorState: form.vtt_properties.wallPortal?.doorState,
                              soundMuffleFactor: Math.max(0, Math.min(1, Number(e.target.value) || 0))
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.wallPortal?.isDoor ?? false}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            wallPortal: {
                              wallType: form.vtt_properties.wallPortal?.wallType || 'solid_titanium',
                              blocksLight: form.vtt_properties.wallPortal?.blocksLight ?? true,
                              blocksSensors: form.vtt_properties.wallPortal?.blocksSensors ?? true,
                              blocksMovement: form.vtt_properties.wallPortal?.blocksMovement ?? true,
                              soundMuffleFactor: form.vtt_properties.wallPortal?.soundMuffleFactor ?? 0.8,
                              doorType: form.vtt_properties.wallPortal?.doorType || 'sliding',
                              doorState: form.vtt_properties.wallPortal?.doorState || 'closed',
                              isDoor: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span>Operable Portal / Door</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.wallPortal?.blocksLight ?? true}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            wallPortal: {
                              wallType: form.vtt_properties.wallPortal?.wallType || 'solid_titanium',
                              isDoor: form.vtt_properties.wallPortal?.isDoor ?? false,
                              blocksSensors: form.vtt_properties.wallPortal?.blocksSensors ?? true,
                              blocksMovement: form.vtt_properties.wallPortal?.blocksMovement ?? true,
                              soundMuffleFactor: form.vtt_properties.wallPortal?.soundMuffleFactor ?? 0.8,
                              doorType: form.vtt_properties.wallPortal?.doorType,
                              doorState: form.vtt_properties.wallPortal?.doorState,
                              blocksLight: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span>Blocks Light</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.wallPortal?.blocksSensors ?? true}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            wallPortal: {
                              wallType: form.vtt_properties.wallPortal?.wallType || 'solid_titanium',
                              isDoor: form.vtt_properties.wallPortal?.isDoor ?? false,
                              blocksLight: form.vtt_properties.wallPortal?.blocksLight ?? true,
                              blocksMovement: form.vtt_properties.wallPortal?.blocksMovement ?? true,
                              soundMuffleFactor: form.vtt_properties.wallPortal?.soundMuffleFactor ?? 0.8,
                              doorType: form.vtt_properties.wallPortal?.doorType,
                              doorState: form.vtt_properties.wallPortal?.doorState,
                              blocksSensors: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span>Blocks Sensors</span>
                    </label>
                  </div>
                  {form.vtt_properties.wallPortal?.isDoor && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Door Mechanism</label>
                        <select
                          value={form.vtt_properties.wallPortal?.doorType || 'sliding'}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              wallPortal: {
                                ...form.vtt_properties.wallPortal!,
                                doorType: e.target.value as 'sliding' | 'swinging' | 'iris' | 'portcullis'
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                        >
                          {(['sliding', 'swinging', 'iris', 'portcullis'] as const).map((dt) => (
                            <option key={dt} value={dt}>{dt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Initial State</label>
                        <select
                          value={form.vtt_properties.wallPortal?.doorState || 'closed'}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              wallPortal: {
                                ...form.vtt_properties.wallPortal!,
                                doorState: e.target.value as 'open' | 'closed' | 'locked' | 'jammed'
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize"
                        >
                          {(['open', 'closed', 'locked', 'jammed'] as const).map((ds) => (
                            <option key={ds} value={ds}>{ds}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.category === 'hazard' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Hazard Parameters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Hazard Class</label>
                      <select
                        value={form.vtt_properties.hazard?.hazardType || 'plasma_leak'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            hazard: {
                              damageFormula: form.vtt_properties.hazard?.damageFormula || '2d10+4 plasma',
                              triggerTiming: form.vtt_properties.hazard?.triggerTiming || 'on_enter',
                              saveDc: form.vtt_properties.hazard?.saveDc,
                              particlePreset: form.vtt_properties.hazard?.particlePreset,
                              hazardType: e.target.value as 'thermal_fire' | 'acid_corrosive' | 'plasma_leak' | 'radiation_leak' | 'biohazard_spore' | 'vacuum'
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {(['thermal_fire', 'acid_corrosive', 'plasma_leak', 'radiation_leak', 'biohazard_spore', 'vacuum'] as const).map((ht) => (
                          <option key={ht} value={ht}>{ht.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Trigger Timing</label>
                      <select
                        value={form.vtt_properties.hazard?.triggerTiming || 'on_enter'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            hazard: {
                              hazardType: form.vtt_properties.hazard?.hazardType || 'plasma_leak',
                              damageFormula: form.vtt_properties.hazard?.damageFormula || '2d10+4 plasma',
                              saveDc: form.vtt_properties.hazard?.saveDc,
                              particlePreset: form.vtt_properties.hazard?.particlePreset,
                              triggerTiming: e.target.value as 'on_enter' | 'on_turn_start' | 'on_turn_end' | 'continuous'
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {(['on_enter', 'on_turn_start', 'on_turn_end', 'continuous'] as const).map((tt) => (
                          <option key={tt} value={tt}>{tt.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Damage Formula</label>
                      <input
                        type="text"
                        value={form.vtt_properties.hazard?.damageFormula || '2d10+4 plasma'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            hazard: {
                              hazardType: form.vtt_properties.hazard?.hazardType || 'plasma_leak',
                              damageFormula: e.target.value,
                              triggerTiming: form.vtt_properties.hazard?.triggerTiming || 'on_enter',
                              saveDc: form.vtt_properties.hazard?.saveDc,
                              particlePreset: form.vtt_properties.hazard?.particlePreset
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Particle Preset</label>
                      <input
                        type="text"
                        placeholder="e.g. sparks_cyan, toxic_mist"
                        value={form.vtt_properties.hazard?.particlePreset || ''}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            hazard: {
                              hazardType: form.vtt_properties.hazard?.hazardType || 'plasma_leak',
                              damageFormula: form.vtt_properties.hazard?.damageFormula || '2d10+4 plasma',
                              triggerTiming: form.vtt_properties.hazard?.triggerTiming || 'on_enter',
                              saveDc: form.vtt_properties.hazard?.saveDc,
                              particlePreset: e.target.value
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.category === 'vehicle' && (
                <div className="space-y-4">
                  <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                    <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Vehicle Hull & Kinematics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Structure Max HP</label>
                        <input
                          type="number"
                          min={1}
                          value={form.vtt_properties.vehicleHull?.structureMaxHp ?? 100}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              vehicleHull: {
                                hullDr: form.vtt_properties.vehicleHull?.hullDr || { kinetic: 10, energy: 8 },
                                speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                                handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                                passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                                hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                                structureMaxHp: Math.max(1, Number(e.target.value) || 1)
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Hull Kinetic DR</label>
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.vehicleHull?.hullDr?.kinetic ?? 10}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              vehicleHull: {
                                structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                                speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                                handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                                passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                                hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                                hullDr: {
                                  kinetic: Math.max(0, Number(e.target.value) || 0),
                                  energy: form.vtt_properties.vehicleHull?.hullDr?.energy ?? 8
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Hull Energy DR</label>
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.vehicleHull?.hullDr?.energy ?? 8}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              vehicleHull: {
                                structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                                speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                                handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                                passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                                hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                                hullDr: {
                                  kinetic: form.vtt_properties.vehicleHull?.hullDr?.kinetic ?? 10,
                                  energy: Math.max(0, Number(e.target.value) || 0)
                                }
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Top Speed (mph)</label>
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.vehicleHull?.speedMph ?? 60}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              vehicleHull: {
                                structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                                hullDr: form.vtt_properties.vehicleHull?.hullDr || { kinetic: 10, energy: 8 },
                                handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                                passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                                hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                                speedMph: Math.max(0, Number(e.target.value) || 0)
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Handling Modifier</label>
                        <input
                          type="number"
                          value={form.vtt_properties.vehicleHull?.handlingModifier ?? 0}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              vehicleHull: {
                                structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                                hullDr: form.vtt_properties.vehicleHull?.hullDr || { kinetic: 10, energy: 8 },
                                speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                                passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                                hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                                handlingModifier: Number(e.target.value) || 0
                              }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  <PassengerNodePlacer
                    imageUrl={resolveAssetTexture(form)}
                    dimensions={form.dimensions}
                    passengerNodes={form.vtt_properties.vehicleHull?.passengerNodes || []}
                    hardpointSockets={form.vtt_properties.vehicleHull?.hardpointSockets || []}
                    onChangePassengers={(passengerNodes) => setForm({
                      ...form,
                      vtt_properties: {
                        ...form.vtt_properties,
                        vehicleHull: {
                          structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                          hullDr: form.vtt_properties.vehicleHull?.hullDr || { kinetic: 10, energy: 8 },
                          speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                          handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                          hardpointSockets: form.vtt_properties.vehicleHull?.hardpointSockets || [],
                          passengerNodes
                        }
                      }
                    })}
                    onChangeHardpoints={(hardpointSockets) => setForm({
                      ...form,
                      vtt_properties: {
                        ...form.vtt_properties,
                        vehicleHull: {
                          structureMaxHp: form.vtt_properties.vehicleHull?.structureMaxHp ?? 100,
                          hullDr: form.vtt_properties.vehicleHull?.hullDr || { kinetic: 10, energy: 8 },
                          speedMph: form.vtt_properties.vehicleHull?.speedMph ?? 60,
                          handlingModifier: form.vtt_properties.vehicleHull?.handlingModifier ?? 0,
                          passengerNodes: form.vtt_properties.vehicleHull?.passengerNodes || [],
                          hardpointSockets
                        }
                      }
                    })}
                  />
                </div>
              )}

              {(form.category === 'token' || form.category === 'creature') && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Entity Token & Vision Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Size Category</label>
                      <select
                        value={form.vtt_properties.tokenEntity?.sizeCategory || 'Medium'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            tokenEntity: {
                              visionCone: form.vtt_properties.tokenEntity?.visionCone || { type: 'standard', rangeFt: 60, arcDegrees: 360 },
                              disposition: form.vtt_properties.tokenEntity?.disposition || 'neutral',
                              dbmId: form.vtt_properties.tokenEntity?.dbmId,
                              standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                              sizeCategory: e.target.value as 'Fine' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal'
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      >
                        {(['Fine', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'] as const).map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Default Disposition</label>
                      <select
                        value={form.vtt_properties.tokenEntity?.disposition || 'neutral'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            tokenEntity: {
                              sizeCategory: form.vtt_properties.tokenEntity?.sizeCategory || 'Medium',
                              visionCone: form.vtt_properties.tokenEntity?.visionCone || { type: 'standard', rangeFt: 60, arcDegrees: 360 },
                              dbmId: form.vtt_properties.tokenEntity?.dbmId,
                              standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                              disposition: e.target.value as 'friendly' | 'neutral' | 'hostile' | 'secret'
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {(['friendly', 'neutral', 'hostile', 'secret'] as const).map((disp) => (
                          <option key={disp} value={disp}>{disp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Vision Mode</label>
                      <select
                        value={form.vtt_properties.tokenEntity?.visionCone?.type || 'standard'}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            tokenEntity: {
                              sizeCategory: form.vtt_properties.tokenEntity?.sizeCategory || 'Medium',
                              disposition: form.vtt_properties.tokenEntity?.disposition || 'neutral',
                              dbmId: form.vtt_properties.tokenEntity?.dbmId,
                              standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                              visionCone: {
                                rangeFt: form.vtt_properties.tokenEntity?.visionCone?.rangeFt ?? 60,
                                arcDegrees: form.vtt_properties.tokenEntity?.visionCone?.arcDegrees ?? 360,
                                type: e.target.value as 'standard' | 'darkvision' | 'thermal' | 'omni'
                              }
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                      >
                        {(['standard', 'darkvision', 'thermal', 'omni'] as const).map((vm) => (
                          <option key={vm} value={vm}>{vm}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Vision Range (ft) / Arc (°)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          value={form.vtt_properties.tokenEntity?.visionCone?.rangeFt ?? 60}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              tokenEntity: {
                                sizeCategory: form.vtt_properties.tokenEntity?.sizeCategory || 'Medium',
                                disposition: form.vtt_properties.tokenEntity?.disposition || 'neutral',
                                dbmId: form.vtt_properties.tokenEntity?.dbmId,
                                standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                                visionCone: {
                                  type: form.vtt_properties.tokenEntity?.visionCone?.type || 'standard',
                                  arcDegrees: form.vtt_properties.tokenEntity?.visionCone?.arcDegrees ?? 360,
                                  rangeFt: Math.max(0, Number(e.target.value) || 0)
                                }
                              }
                            }
                          })}
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                        <input
                          type="number"
                          min={15}
                          max={360}
                          value={form.vtt_properties.tokenEntity?.visionCone?.arcDegrees ?? 360}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              tokenEntity: {
                                sizeCategory: form.vtt_properties.tokenEntity?.sizeCategory || 'Medium',
                                disposition: form.vtt_properties.tokenEntity?.disposition || 'neutral',
                                dbmId: form.vtt_properties.tokenEntity?.dbmId,
                                standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                                visionCone: {
                                  type: form.vtt_properties.tokenEntity?.visionCone?.type || 'standard',
                                  rangeFt: form.vtt_properties.tokenEntity?.visionCone?.rangeFt ?? 60,
                                  arcDegrees: Math.max(15, Math.min(360, Number(e.target.value) || 360))
                                }
                              }
                            }
                          })}
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Linked Compendium / DBM ID (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. adversary_syndicate_enforcer"
                        value={form.vtt_properties.tokenEntity?.dbmId || ''}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            tokenEntity: {
                              sizeCategory: form.vtt_properties.tokenEntity?.sizeCategory || 'Medium',
                              disposition: form.vtt_properties.tokenEntity?.disposition || 'neutral',
                              visionCone: form.vtt_properties.tokenEntity?.visionCone || { type: 'standard', rangeFt: 60, arcDegrees: 360 },
                              standeeElevationHeight3d: form.vtt_properties.tokenEntity?.standeeElevationHeight3d,
                              dbmId: e.target.value
                            }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible PCG Scatter Rules */}
              <details className="bg-slate-950 p-3 rounded border border-slate-800">
                <summary className="cursor-pointer text-[11px] font-bold uppercase text-emerald-400 select-none">
                  Procedural Scatter & PCG Placement Rules
                </summary>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.scatter_rules?.allow_rotation ?? true}
                      onChange={(e) => setForm({
                        ...form,
                        scatter_rules: {
                          scale_variance: form.scatter_rules?.scale_variance || [0.9, 1.1],
                          avoid_center: form.scatter_rules?.avoid_center ?? false,
                          cluster_affinity: form.scatter_rules?.cluster_affinity ?? false,
                          clearance_radius_cells: form.scatter_rules?.clearance_radius_cells ?? 0,
                          allow_rotation: e.target.checked
                        }
                      })}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                    />
                    <span>Allow Random Rotation</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.scatter_rules?.avoid_center ?? false}
                      onChange={(e) => setForm({
                        ...form,
                        scatter_rules: {
                          allow_rotation: form.scatter_rules?.allow_rotation ?? true,
                          scale_variance: form.scatter_rules?.scale_variance || [0.9, 1.1],
                          cluster_affinity: form.scatter_rules?.cluster_affinity ?? false,
                          clearance_radius_cells: form.scatter_rules?.clearance_radius_cells ?? 0,
                          avoid_center: e.target.checked
                        }
                      })}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                    />
                    <span>Avoid Room Centers</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.scatter_rules?.cluster_affinity ?? false}
                      onChange={(e) => setForm({
                        ...form,
                        scatter_rules: {
                          allow_rotation: form.scatter_rules?.allow_rotation ?? true,
                          scale_variance: form.scatter_rules?.scale_variance || [0.9, 1.1],
                          avoid_center: form.scatter_rules?.avoid_center ?? false,
                          clearance_radius_cells: form.scatter_rules?.clearance_radius_cells ?? 0,
                          cluster_affinity: e.target.checked
                        }
                      })}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                    />
                    <span>Cluster Affinity</span>
                  </label>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Clearance Radius (cells)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={form.scatter_rules?.clearance_radius_cells ?? 0}
                      onChange={(e) => setForm({
                        ...form,
                        scatter_rules: {
                          allow_rotation: form.scatter_rules?.allow_rotation ?? true,
                          scale_variance: form.scatter_rules?.scale_variance || [0.9, 1.1],
                          avoid_center: form.scatter_rules?.avoid_center ?? false,
                          cluster_affinity: form.scatter_rules?.cluster_affinity ?? false,
                          clearance_radius_cells: Math.max(0, Number(e.target.value) || 0)
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* TAB 6: Triggers & Traps */}
          {activeTab === 'triggers' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <h3 className="text-slate-100 font-bold uppercase text-xs">Reactive Trigger System</h3>
                      <p className="text-[11px] text-slate-400">Configure spatial detection, saving throws, and automatic damage payloads.</p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vtt_properties.trigger?.enabled ?? false}
                      onChange={(e) => setForm({
                        ...form,
                        vtt_properties: {
                          ...form.vtt_properties,
                          trigger: {
                            enabled: e.target.checked,
                            triggerType: form.vtt_properties.trigger?.triggerType || 'step_on',
                            triggerRadiusFt: form.vtt_properties.trigger?.triggerRadiusFt || 5,
                            saveType: form.vtt_properties.trigger?.saveType || 'Reflex (AGI)',
                            saveDc: form.vtt_properties.trigger?.saveDc || 14,
                            damageFormula: form.vtt_properties.trigger?.damageFormula || '2d10 plasma',
                            damageType: form.vtt_properties.trigger?.damageType || 'plasma',
                            appliedCondition: form.vtt_properties.trigger?.appliedCondition || 'none',
                            disarmDc: form.vtt_properties.trigger?.disarmDc || 13,
                            detectionDc: form.vtt_properties.trigger?.detectionDc || 14,
                            sfx: form.vtt_properties.trigger?.sfx || 'proximity_plasma_mine',
                            gmSecretNotes: form.vtt_properties.trigger?.gmSecretNotes || '',
                            oneShot: form.vtt_properties.trigger?.oneShot ?? true
                          }
                        }
                      })}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold text-amber-400">Trigger Active</span>
                  </label>
                </div>

                {form.vtt_properties.trigger?.enabled ? (
                  <div className="space-y-4 pt-1">
                    {/* Trigger Event & Radius */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Trigger Event</label>
                        <select
                          value={form.vtt_properties.trigger.triggerType}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, triggerType: e.target.value as TriggerType }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
                        >
                          <option value="step_on">Step-On / Pressure Plate (Grid Entry)</option>
                          <option value="proximity">Proximity Radius (Motion Sensor)</option>
                          <option value="interact">Tactical Interaction (Manual Click)</option>
                          <option value="turn_start">Turn Start (Continuous Round Hazard)</option>
                          <option value="manual">Manual Trigger Only (Architect Action)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Trigger Radius: {form.vtt_properties.trigger.triggerRadiusFt || 5} ft ({Math.round((form.vtt_properties.trigger.triggerRadiusFt || 5) / 5)} cells)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="5"
                          value={form.vtt_properties.trigger.triggerRadiusFt || 5}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, triggerRadiusFt: parseInt(e.target.value, 10) }
                            }
                          })}
                          className="w-full accent-amber-400"
                        />
                      </div>
                    </div>

                    {/* Saving Throw Check & DC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Saving Throw Type</label>
                        <select
                          value={form.vtt_properties.trigger.saveType}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, saveType: e.target.value as SaveType }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        >
                          {SAVE_TYPES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Save DC / Target Check</label>
                        <input
                          type="number"
                          min="5"
                          max="30"
                          value={form.vtt_properties.trigger.saveDc}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, saveDc: parseInt(e.target.value, 10) || 10 }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Damage Formula, Type, and Condition */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Damage Formula</label>
                        <input
                          type="text"
                          value={form.vtt_properties.trigger.damageFormula || ''}
                          placeholder="e.g. 2d10+4"
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, damageFormula: e.target.value }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Damage Type</label>
                        <select
                          value={form.vtt_properties.trigger.damageType || 'plasma'}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, damageType: e.target.value as any }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
                        >
                          {['plasma', 'energy', 'kinetic', 'chemical', 'thermal', 'emp', 'lethal'].map(dt => (
                            <option key={dt} value={dt}>{dt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Applied Condition</label>
                        <select
                          value={form.vtt_properties.trigger.appliedCondition || 'none'}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, appliedCondition: e.target.value as TriggerCondition }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        >
                          {TRIGGER_CONDITIONS.map(tc => (
                            <option key={tc} value={tc}>{tc}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Disarm & Detection DC */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Detection DC (Perception)</label>
                        <input
                          type="number"
                          value={form.vtt_properties.trigger.detectionDc ?? 14}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, detectionDc: parseInt(e.target.value, 10) }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Disarm DC (Tech/Infiltration)</label>
                        <input
                          type="number"
                          value={form.vtt_properties.trigger.disarmDc ?? 13}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              trigger: { ...form.vtt_properties.trigger!, disarmDc: parseInt(e.target.value, 10) }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center space-x-2 cursor-pointer pb-2">
                          <input
                            type="checkbox"
                            checked={form.vtt_properties.trigger.oneShot ?? true}
                            onChange={(e) => setForm({
                              ...form,
                              vtt_properties: {
                                ...form.vtt_properties,
                                trigger: { ...form.vtt_properties.trigger!, oneShot: e.target.checked }
                              }
                            })}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500"
                          />
                          <span className="text-[11px] text-slate-300">One-Shot (Single Detonation)</span>
                        </label>
                      </div>
                    </div>

                    {/* Architect Secret Notes */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Architect Secret & Investigation Notes</label>
                      <textarea
                        rows={2}
                        value={form.vtt_properties.trigger.gmSecretNotes || ''}
                        placeholder="Secret details revealed upon successful Detection or Tech check..."
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            trigger: { ...form.vtt_properties.trigger!, gmSecretNotes: e.target.value }
                          }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">
                    Trigger mechanics are disabled for this asset. Enable the checkbox above to arm spatial traps, terminals, or proximity mines.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Script & QuickJS Sandbox */}
          {activeTab === 'script' && (
            <div className="space-y-4 max-w-3xl">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="text-slate-100 font-bold uppercase text-xs">QuickJS Script & Macro Automation</h3>
                      <p className="text-[11px] text-slate-400">Sandboxed game macros with direct access to Dice, Trauma, StoryFlags, and MathOps.</p>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vtt_properties.script?.enabled ?? false}
                      onChange={(e) => setForm({
                        ...form,
                        vtt_properties: {
                          ...form.vtt_properties,
                          script: {
                            enabled: e.target.checked,
                            autorun: form.vtt_properties.script?.autorun ?? false,
                            executionHook: form.vtt_properties.script?.executionHook || 'on_interact',
                            sourceCode: form.vtt_properties.script?.sourceCode || '// QuickJS Macro Script\nconst check = Dice.check2d10(2, 14);\nif (check.success) {\n  StoryFlags.set("station_power", true);\n}\nreturn check;',
                            timeoutMs: form.vtt_properties.script?.timeoutMs || 500
                          }
                        }
                      })}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span className="text-xs font-bold text-cyan-400">Script Enabled</span>
                  </label>
                </div>

                {form.vtt_properties.script?.enabled ? (
                  <div className="space-y-4 pt-1">
                    {/* Hook & Template Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Execution Hook</label>
                        <select
                          value={form.vtt_properties.script.executionHook}
                          onChange={(e) => setForm({
                            ...form,
                            vtt_properties: {
                              ...form.vtt_properties,
                              script: { ...form.vtt_properties.script!, executionHook: e.target.value as ScriptHook }
                            }
                          })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        >
                          <option value="on_interact">on_interact (Operator clicks/interacts with asset)</option>
                          <option value="on_trigger">on_trigger (When spatial trigger/trap fires)</option>
                          <option value="on_turn_start">on_turn_start (At start of each combat round)</option>
                          <option value="on_destruct">on_destruct (When structure HP reaches 0)</option>
                          <option value="manual">manual (Architect explicit execution)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Insert Script Template</label>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            let newCode = '';
                            if (val === 'terminal') {
                              newCode = `// Terminal Data Hack (2d10 Tech Check + StoryFlags)\nconst roll = Dice.check2d10(3, 15);\nif (roll.success) {\n  StoryFlags.set("mainframe_access", true);\n  StoryFlags.set("security_status", "BYPASS");\n} else {\n  StoryFlags.set("security_status", "LOCKDOWN");\n}\nreturn roll;`;
                            } else if (val === 'door') {
                              newCode = `// Bulkhead Door Cycle & Audio\nconst isSealed = StoryFlags.get("door_sealed", false);\nStoryFlags.set("door_sealed", !isSealed);\nreturn { doorOpen: isSealed, message: isSealed ? "Bulkhead unsealed" : "Bulkhead locked" };`;
                            } else if (val === 'trauma') {
                              newCode = `// Explosive Detonation with Called Shot Trauma\nconst trauma = Trauma.evaluateCalledShot("torso", 24, 4);\nStoryFlags.set("detonation_occurred", true);\nreturn trauma;`;
                            } else if (val === 'med') {
                              newCode = `// Nano-Med Station (2d6 Healing)\nconst healRoll = Dice.roll(2, 6);\nconst totalHeal = healRoll.reduce((a, b) => a + b, 0);\nStoryFlags.set("med_charges_left", Math.max(0, StoryFlags.get("med_charges_left", 3) - 1));\nreturn { healApplied: totalHeal, dice: healRoll };`;
                            }
                            if (newCode) {
                              setForm({
                                ...form,
                                vtt_properties: {
                                  ...form.vtt_properties,
                                  script: { ...form.vtt_properties.script!, sourceCode: newCode }
                                }
                              });
                            }
                            e.target.value = '';
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                        >
                          <option value="">-- Choose Template to Inject --</option>
                          <option value="terminal">Security Terminal Hack (2d10 + Flags)</option>
                          <option value="door">Bulkhead Door Toggle & Status</option>
                          <option value="trauma">Explosion & Trauma Evaluation</option>
                          <option value="med">Nano-Med Dispenser (2d6 Healing)</option>
                        </select>
                      </div>
                    </div>

                    {/* Autorun Option */}
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.vtt_properties.script.autorun ?? false}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            script: { ...form.vtt_properties.script!, autorun: e.target.checked }
                          }
                        })}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                      />
                      <span className="text-[11px] text-slate-300">Autorun instantly on proximity without prompting confirmation</span>
                    </label>

                    {/* Script Code Area */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Macro JavaScript Source (Isolated QuickJS Sandbox)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Globals: Dice, MathOps, Trauma, StoryFlags</span>
                      </div>
                      <textarea
                        rows={9}
                        value={form.vtt_properties.script.sourceCode}
                        onChange={(e) => setForm({
                          ...form,
                          vtt_properties: {
                            ...form.vtt_properties,
                            script: { ...form.vtt_properties.script!, sourceCode: e.target.value }
                          }
                        })}
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-lg p-3 text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        spellCheck={false}
                      />
                    </div>

                    {/* Test Execution Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleTestScript}
                        disabled={isRunningScript}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-mono text-xs font-semibold shadow transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isRunningScript ? 'Executing...' : 'Run Test in QuickJS Sandbox'}</span>
                      </button>

                      <span className="text-[11px] text-slate-500">
                        Watchdog Timeout: {form.vtt_properties.script.timeoutMs}ms
                      </span>
                    </div>

                    {/* Live Sandbox Execution Output Console */}
                    {sandboxOutput && (
                      <div className="mt-3 p-3 bg-black/80 rounded border border-slate-800 font-mono text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-slate-300 font-bold">Sandbox Execution Result</span>
                          </div>
                          {sandboxOutput.timeMs !== undefined && (
                            <span className="text-[10px] text-slate-400">{sandboxOutput.timeMs} ms</span>
                          )}
                        </div>

                        {sandboxOutput.error ? (
                          <div className="text-red-400 flex items-start space-x-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{sandboxOutput.error}</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-slate-500 text-[10px]">Return Value:</span>
                              <pre className="text-emerald-400 bg-slate-950 p-2 rounded overflow-x-auto text-[11px] mt-1 border border-slate-900">
                                {typeof sandboxOutput.result === 'object' 
                                  ? JSON.stringify(sandboxOutput.result, null, 2) 
                                  : String(sandboxOutput.result)}
                              </pre>
                            </div>

                            {sandboxOutput.flags && Object.keys(sandboxOutput.flags).length > 0 && (
                              <div>
                                <span className="text-slate-500 text-[10px]">Mutated StoryFlags:</span>
                                <pre className="text-cyan-300 bg-slate-950 p-2 rounded overflow-x-auto text-[11px] mt-1 border border-slate-900">
                                  {JSON.stringify(sandboxOutput.flags, null, 2)}
                                </pre>
                              </div>
                            )}

                            {Array.isArray(sandboxOutput.actions) && sandboxOutput.actions.length > 0 && (
                              <div>
                                <span className="text-slate-500 text-[10px]">
                                  Queued StageAPI Actions ({sandboxOutput.actions.length}):
                                </span>
                                <pre className="text-purple-300 bg-slate-950 p-2 rounded overflow-x-auto text-[11px] mt-1 border border-slate-900">
                                  {JSON.stringify(sandboxOutput.actions, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">
                    Script execution is disabled for this asset. Enable the checkbox above to attach programmable macros and game event listeners.
                  </p>
                )}
              </div>
            </div>
          )}
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
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetStudioModal;
