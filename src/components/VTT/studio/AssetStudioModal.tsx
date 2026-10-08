/**
 * @file AssetStudioModal.tsx
 * @description Master in-situ asset editor & property forge for customizing AssetUnits.
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  Check, 
  Palette, 
  Shield, 
  Lightbulb, 
  Layers, 
  Tag
} from 'lucide-react';
import type { 
  AssetUnit, 
  AssetCategory, 
  StageZLayerName, 
  SurfaceMaterialType,
  CoverRating
} from '../../../schemas/assetUnitSchema';
import { 
  ASSET_CATEGORIES, 
  STAGE_Z_LAYERS, 
  SURFACE_MATERIALS, 
  COVER_RATINGS 
} from '../../../schemas/assetUnitSchema';
import { CollisionHullEditor } from './CollisionHullEditor';
import { LightEmitterPlacer } from './LightEmitterPlacer';
import { ShaderTintCustomizer } from './ShaderTintCustomizer';

export interface AssetStudioModalProps {
  isOpen: boolean;
  asset: AssetUnit;
  onClose: () => void;
  onSaveAsset: (updated: AssetUnit) => void;
}

type StudioTab = 'general' | 'visuals' | 'collision' | 'lighting' | 'mechanics';

export const AssetStudioModal: React.FC<AssetStudioModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSaveAsset
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('general');
  const [form, setForm] = useState<AssetUnit>(() => JSON.parse(JSON.stringify(asset)));

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveAsset(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800 rounded-lg shadow-2xl shadow-cyan-950/80 w-full max-w-4xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-cyan-900/40">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-semibold text-slate-100 uppercase tracking-wider">
              Asset Studio & Property Forge — {form.name}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'general' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>General & Tags</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'visuals' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Visuals & Shaders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collision')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'collision' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Collisions & LoS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lighting')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'lighting' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dynamic Lighting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'mechanics' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tactical Mechanics</span>
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
            <div className="max-w-md">
              <ShaderTintCustomizer
                imageUrl={form.visuals.baseTexture || form.visuals.thumbnail}
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
