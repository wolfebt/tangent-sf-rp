/**
 * @file AssetStudioModal.tsx
 * @description Master in-situ asset editor & property forge for customizing AssetUnits.
 */

import React, { useState, useRef } from 'react';
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
import AssetDrawingStudio from '../../../pages/Foundry/MapMaker/map/AssetDrawingStudio';
import { resolveAssetTexture, TEXTURE_PRESET_LIBRARY } from '../../../engine/assets/assetVisualFallbacks';
import { QuickJSSandbox } from '../../../engine/scripting/QuickJSSandbox';

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
  const [sandboxOutput, setSandboxOutput] = useState<{ result?: any; error?: string; timeMs?: number; flags?: any } | null>(null);
  const [isRunningScript, setIsRunningScript] = useState(false);

  if (!isOpen) return null;

  const handleTestScript = async () => {
    setIsRunningScript(true);
    setSandboxOutput(null);
    try {
      const sandbox = new QuickJSSandbox();
      const code = form.vtt_properties.script?.sourceCode || '';
      const testFlags: Record<string, any> = { alarm_level: 0, power_grid: true, door_sealed: false };
      const start = performance.now();
      const res = await sandbox.execute(code, {
        storyFlags: testFlags,
        operative: { id: 'op_test_lead', name: 'Agent Jax', hp: 45, maxHp: 50 },
        targetAsset: { id: form.unit_id, name: form.name }
      });
      const elapsed = performance.now() - start;
      setSandboxOutput({
        result: res !== undefined ? res : '(Script executed cleanly with return code 0)',
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setForm(prev => ({
          ...prev,
          visuals: {
            ...prev.visuals,
            baseTexture: dataUrl,
            thumbnail: dataUrl
          }
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    onSaveAsset(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-8 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800 rounded-lg shadow-2xl shadow-cyan-950/80 w-full max-w-4xl flex flex-col h-[82vh] max-h-[calc(100vh-6rem)] overflow-hidden">
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
                    onSaveToAsset={(dataUrl: string) => {
                      const updated = {
                        ...form,
                        visuals: {
                          ...form.visuals,
                          baseTexture: dataUrl,
                          thumbnail: dataUrl
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
                imageUrl={form.visuals.baseTexture || form.visuals.thumbnail}
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
                imageUrl={form.visuals.baseTexture || form.visuals.thumbnail}
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
            <div className="space-y-4 max-w-lg">
              {/* Category-Specific Settings */}
              {form.category === 'terrain_brush' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Terrain Properties</h3>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Surface Material</label>
                    <select
                      value={form.vtt_properties.terrain?.material || 'metal_deck'}
                      onChange={(e) => setForm({
                        ...form,
                        vtt_properties: {
                          ...form.vtt_properties,
                          terrain: {
                            material: e.target.value as SurfaceMaterialType,
                            movementCost: form.vtt_properties.terrain?.movementCost ?? 1,
                            slipperyFriction: form.vtt_properties.terrain?.slipperyFriction ?? 1,
                            footstepSfxCategory: form.vtt_properties.terrain?.footstepSfxCategory ?? 'footstep_metal'
                          }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 capitalize"
                    >
                      {SURFACE_MATERIALS.map((mat) => (
                        <option key={mat} value={mat}>{mat.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {form.category === 'doodad' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Prop Cover & Durability</h3>
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
                        <option key={cov} value={cov}>{cov.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {form.category === 'hazard' && (
                <div className="space-y-3 bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-cyan-400 font-bold uppercase text-[11px]">Hazard Parameters</h3>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Damage Formula</label>
                    <input
                      type="text"
                      value={form.vtt_properties.hazard?.damageFormula || '2d10 plasma'}
                      onChange={(e) => setForm({
                        ...form,
                        vtt_properties: {
                          ...form.vtt_properties,
                          hazard: {
                            hazardType: form.vtt_properties.hazard?.hazardType || 'plasma_leak',
                            damageFormula: e.target.value,
                            triggerTiming: form.vtt_properties.hazard?.triggerTiming || 'on_enter'
                          }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                    />
                  </div>
                </div>
              )}
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
                          <option value="manual">Manual Trigger Only (GM Action)</option>
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

                    {/* GM Secret Notes */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">GM Secret & Investigation Notes</label>
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
                          <option value="on_interact">on_interact (Operative clicks/interacts with asset)</option>
                          <option value="on_trigger">on_trigger (When spatial trigger/trap fires)</option>
                          <option value="on_turn_start">on_turn_start (At start of each combat round)</option>
                          <option value="on_destruct">on_destruct (When structure HP reaches 0)</option>
                          <option value="manual">manual (GM explicit execution)</option>
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
