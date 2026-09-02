import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MAP_TYPES, PENCIL_COLORS } from './MapConstants';
import { getTerrainsForScale, getObjectsForScale, getCategoriesForScale } from './MapAssetCatalog';
import { TERRAIN_TEXTURE_PATTERNS, PRESET_OBJECT_SPRITES } from './MapTextures';
import AssetDrawingStudio from './AssetDrawingStudio';
import { confirmTypedDeletion } from '../../../../utils/confirmationUtils';

const OBJECT_SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'rect', label: 'Rectangle' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'star', label: 'Star' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'line', label: 'Line / Beam' }
];

export default function MapAssetManagerModal({
  isOpen,
  onClose,
  customAssets = { terrains: [], objects: [] },
  onAddCustomTerrain,
  onUpdateCustomTerrain,
  onDeleteCustomTerrain,
  onAddCustomObject,
  onUpdateCustomObject,
  onDeleteCustomObject,
  currentScale = 'Planetary'
}) {
  const [activeTab, setActiveTab] = useState('terrains'); // 'terrains' | 'objects'
  const [editorSubTab, setEditorSubTab] = useState('attributes'); // 'attributes' | 'studio'
  const [filterSource, setFilterSource] = useState('All'); // 'All' | 'Preset' | 'Custom'
  const [filterScale, setFilterScale] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const bulkFileInputRef = useRef(null);
  const singleFileInputRef = useRef(null);

  // Selected asset for editing/viewing (null = creation mode)
  const [editingAsset, setEditingAsset] = useState(null);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Form State - Terrain
  const [terrainForm, setTerrainForm] = useState({
    id: '',
    label: '',
    scale: 'Planetary',
    color: '#06b6d4',
    strokeWidth: 40,
    desc: '',
    engineProps: '',
    textureUrl: ''
  });

  // Form State - Object
  const [objectForm, setObjectForm] = useState({
    id: '',
    label: '',
    scale: 'Planetary',
    category: 'Custom',
    shape: 'circle',
    color: '#38bdf8',
    radius: 30,
    width: 40,
    height: 40,
    desc: '',
    hazard: '',
    engineProps: '',
    scaleTarget: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFilterScale(currentScale || 'Planetary');
      resetToNewForm('terrains', currentScale || 'Planetary');
      setEditorSubTab('attributes');
    }
  }, [isOpen, currentScale]);

  const resetToNewForm = (type = activeTab, scale = filterScale) => {
    setEditingAsset(null);
    setIsEditingCustom(false);

    const targetScale = scale === 'All' ? 'Planetary' : scale;

    if (type === 'terrains') {
      setTerrainForm({
        id: `custom_terrain_${uuidv4().substring(0, 8)}`,
        label: '',
        scale: targetScale,
        color: '#06b6d4',
        strokeWidth: 40,
        desc: '',
        engineProps: '',
        textureUrl: ''
      });
    } else {
      setObjectForm({
        id: `custom_object_${uuidv4().substring(0, 8)}`,
        label: '',
        scale: targetScale,
        category: 'Custom',
        shape: 'circle',
        color: '#38bdf8',
        radius: 30,
        width: 40,
        height: 40,
        desc: '',
        hazard: '',
        engineProps: '',
        scaleTarget: '',
        imageUrl: ''
      });
    }
  };

  if (!isOpen) return null;

  const allTerrains = getTerrainsForScale(filterScale, customAssets.terrains || []);
  const allCategories = getCategoriesForScale(filterScale, customAssets.objects || []);
  const allObjects = getObjectsForScale(filterScale, filterCategory, customAssets.objects || []);

  const filteredTerrains = allTerrains.filter(t => {
    if (filterSource === 'Preset' && t.isCustom) return false;
    if (filterSource === 'Custom' && !t.isCustom) return false;
    if (searchQuery && !t.label?.toLowerCase().includes(searchQuery.toLowerCase()) && !t.desc?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredObjects = allObjects.filter(o => {
    if (filterSource === 'Preset' && o.isCustom) return false;
    if (filterSource === 'Custom' && !o.isCustom) return false;
    if (searchQuery && !o.label?.toLowerCase().includes(searchQuery.toLowerCase()) && !o.desc?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectAssetForEdit = (asset, kind) => {
    setEditingAsset(asset);
    setIsEditingCustom(!!asset.isCustom);

    if (kind === 'terrains') {
      setTerrainForm({
        id: asset.isCustom ? asset.id : `custom_${asset.id}_${uuidv4().substring(0, 4)}`,
        label: asset.isCustom ? asset.label : `${asset.label} (Custom)`,
        scale: asset.scale || (filterScale === 'All' ? 'Planetary' : filterScale),
        color: asset.color || '#06b6d4',
        strokeWidth: asset.strokeWidth || 40,
        desc: asset.desc || '',
        engineProps: asset.engineProps || '',
        textureUrl: asset.textureUrl || ''
      });
    } else {
      setObjectForm({
        id: asset.isCustom ? asset.id : `custom_${asset.id}_${uuidv4().substring(0, 4)}`,
        label: asset.isCustom ? asset.label : `${asset.label} (Custom)`,
        scale: asset.scale || (filterScale === 'All' ? 'Planetary' : filterScale),
        category: asset.category || 'Custom',
        shape: asset.shape || 'circle',
        color: asset.color || '#38bdf8',
        radius: asset.radius || 30,
        width: asset.width || 40,
        height: asset.height || 40,
        desc: asset.desc || '',
        hazard: asset.hazard || '',
        engineProps: asset.engineProps || '',
        scaleTarget: asset.scaleTarget || '',
        imageUrl: asset.imageUrl || ''
      });
    }
  };

  // Single File Upload (Data URL)
  const handleSingleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (activeTab === 'terrains') {
        setTerrainForm(prev => ({ ...prev, textureUrl: dataUrl }));
      } else {
        setObjectForm(prev => ({ ...prev, imageUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Bulk Multi-File Upload
  const handleBulkFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const targetScale = filterScale === 'All' ? 'Planetary' : filterScale;

        if (activeTab === 'terrains') {
          onAddCustomTerrain?.({
            id: `custom_terrain_${uuidv4().substring(0, 8)}`,
            label: cleanName,
            scale: targetScale,
            color: '#06b6d4',
            strokeWidth: 40,
            desc: `Imported texture asset from ${file.name}`,
            engineProps: '',
            textureUrl: dataUrl,
            isCustom: true
          });
        } else {
          onAddCustomObject?.({
            id: `custom_object_${uuidv4().substring(0, 8)}`,
            label: cleanName,
            scale: targetScale,
            category: filterCategory === 'All' ? 'Imported' : filterCategory,
            shape: 'circle',
            color: '#38bdf8',
            radius: 30,
            width: 40,
            height: 40,
            desc: `Imported image sprite from ${file.name}`,
            hazard: '',
            engineProps: '',
            scaleTarget: '',
            imageUrl: dataUrl,
            isCustom: true
          });
        }
      };
      reader.readAsDataURL(file);
    });

    alert(`Successfully queued ${files.length} file(s) for catalog import.`);
    e.target.value = '';
  };

  const handleSaveTerrainSubmit = (e) => {
    if (e) e.preventDefault();
    if (!terrainForm.label.trim()) {
      alert('Please enter a terrain name.');
      return;
    }

    if (isEditingCustom && editingAsset) {
      onUpdateCustomTerrain?.(editingAsset.id, terrainForm);
    } else {
      onAddCustomTerrain?.(terrainForm);
    }
    resetToNewForm('terrains');
    setEditorSubTab('attributes');
  };

  const handleSaveObjectSubmit = (e) => {
    if (e) e.preventDefault();
    if (!objectForm.label.trim()) {
      alert('Please enter an object name.');
      return;
    }

    if (isEditingCustom && editingAsset) {
      onUpdateCustomObject?.(editingAsset.id, objectForm);
    } else {
      onAddCustomObject?.(objectForm);
    }
    resetToNewForm('objects');
    setEditorSubTab('attributes');
  };

  const handleDeleteSelected = () => {
    if (!editingAsset || !editingAsset.isCustom) return;
    const targetLabel = editingAsset.label || editingAsset.name || 'Custom Asset';

    if (confirmTypedDeletion(targetLabel, 'custom map asset')) {
      if (activeTab === 'terrains') {
        onDeleteCustomTerrain?.(editingAsset.id);
      } else {
        onDeleteCustomObject?.(editingAsset.id);
      }
      resetToNewForm(activeTab);
      setEditorSubTab('attributes');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 pt-6 sm:pt-10 md:pt-12 pb-8 overflow-y-auto select-none font-sans">
      <div className="bg-[#161b22] border border-[#0D5C63] rounded-xl w-full max-w-7xl max-h-[88vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-3 bg-[#0d1117] border-b border-[#0D5C63]/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <span>Mapmaker Asset & Texture Catalog Manager</span>
              </h2>
              <p className="text-xs text-cyan-400 font-mono">
                Create & customize terrain textures & placeable sprites using brushes, pencils, shapes, procedural synthesizers, and adjustment filters
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkFileInputRef.current?.click()}
              className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors"
            >
              <span>📁</span> Bulk Import Files...
            </button>
            <input
              type="file"
              ref={bulkFileInputRef}
              multiple
              accept="image/*"
              onChange={handleBulkFileUpload}
              className="hidden"
            />

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="px-6 py-2 bg-[#161b22] border-b border-[#0D5C63]/40 flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0d1117] p-1.5 rounded-full border border-[#0D5C63]/40 shrink-0">
            <button
              onClick={() => {
                setActiveTab('terrains');
                resetToNewForm('terrains');
                setEditorSubTab('attributes');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'terrains'
                  ? 'bg-cyan-950/90 text-[#22d3ee] border-[#22d3ee]/80 shadow-[0_0_12px_rgba(34,211,238,0.3)] ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span>🎨</span> Terrains ({customAssets.terrains?.length || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab('objects');
                resetToNewForm('objects');
                setEditorSubTab('attributes');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border ${
                activeTab === 'objects'
                  ? 'bg-cyan-950/90 text-[#22d3ee] border-[#22d3ee]/80 shadow-[0_0_12px_rgba(34,211,238,0.3)] ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span>📦</span> Objects ({customAssets.objects?.length || 0})
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Source:</label>
              <select
                value={filterSource}
                onChange={e => setFilterSource(e.target.value)}
                className="bg-[#0d1117] border border-[#0D5C63]/60 text-xs text-white px-2 py-1 rounded outline-none focus:border-[#22d3ee]"
              >
                <option value="All">All Sources</option>
                <option value="Preset">Presets Only</option>
                <option value="Custom">Custom Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Scale:</label>
              <select
                value={filterScale}
                onChange={e => {
                  setFilterScale(e.target.value);
                  setFilterCategory('All');
                }}
                className="bg-[#0d1117] border border-[#0D5C63]/60 text-xs text-white px-2 py-1 rounded outline-none focus:border-[#22d3ee]"
              >
                <option value="All">All Scales</option>
                {MAP_TYPES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {activeTab === 'objects' && (
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Category:</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-[#0d1117] border border-[#0D5C63]/60 text-xs text-white px-2 py-1 rounded outline-none focus:border-[#22d3ee]"
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#0D5C63]/50 text-xs text-white px-2.5 py-1 rounded w-36 outline-none focus:border-[#22d3ee]"
            />
          </div>
        </div>

        {/* Content Layout: Left List + Right Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Catalog List */}
          <div className="w-[36%] border-r border-[#0D5C63]/40 flex flex-col bg-[#0d1117]/60 p-3.5 gap-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#22d3ee] tracking-wider">
                {activeTab === 'terrains' ? `Terrains (${filteredTerrains.length})` : `Objects (${filteredObjects.length})`}
              </span>
              <button
                onClick={() => {
                  resetToNewForm(activeTab);
                  setEditorSubTab('attributes');
                }}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md transition-all"
              >
                <span>➕</span> New Asset
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {activeTab === 'terrains' ? (
                filteredTerrains.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-8 italic">No terrain textures match criteria</div>
                ) : (
                  filteredTerrains.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectAssetForEdit(t, 'terrains')}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        editingAsset?.id === t.id
                          ? 'border-[#22d3ee] bg-cyan-950/80 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                          : t.isCustom
                          ? 'border-cyan-500/40 bg-[#161b22] hover:border-cyan-400'
                          : 'border-[#0D5C63]/30 bg-[#0d1117] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {t.textureUrl ? (
                          <div className="w-9 h-9 rounded border border-cyan-500/60 overflow-hidden shrink-0 bg-[#0d1117]">
                            <img src={t.textureUrl} alt={t.label} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span
                            className="w-6 h-6 rounded-full border border-white/40 shadow shrink-0"
                            style={{ backgroundColor: t.color || '#333' }}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{t.label}</span>
                            {t.isCustom && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-mono uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          {t.desc && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.desc}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                        {t.scale || 'Planetary'}
                      </span>
                    </div>
                  ))
                )
              ) : (
                filteredObjects.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-8 italic">No objects match criteria</div>
                ) : (
                  filteredObjects.map(o => (
                    <div
                      key={o.id}
                      onClick={() => handleSelectAssetForEdit(o, 'objects')}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        editingAsset?.id === o.id
                          ? 'border-[#22d3ee] bg-cyan-950/80 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                          : o.isCustom
                          ? 'border-cyan-500/40 bg-[#161b22] hover:border-cyan-400'
                          : 'border-[#0D5C63]/30 bg-[#0d1117] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {o.imageUrl ? (
                          <div className="w-9 h-9 rounded border border-cyan-500/60 overflow-hidden shrink-0 bg-[#0d1117] p-0.5">
                            <img src={o.imageUrl} alt={o.label} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <span
                            className="w-6 h-6 rounded border border-white/40 shadow shrink-0"
                            style={{ backgroundColor: o.color || '#38bdf8' }}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{o.label}</span>
                            {o.isCustom && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 rounded font-mono uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {o.category && (
                              <span className="text-[9px] text-amber-300 font-mono">[{o.category}]</span>
                            )}
                            {o.hazard && (
                              <span className="text-[9px] text-red-400 font-mono">⚠️ {o.hazard}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                        {o.scale || 'Planetary'}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Editor Workspace */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col bg-[#161b22]">
            
            {/* Top Workspace Bar: Status & Editor Sub-Tabs */}
            <div className="flex items-center justify-between mb-3 border-b border-[#0D5C63]/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-[#22d3ee] tracking-wider">
                  {isEditingCustom
                    ? `✏️ Edit Custom Asset: "${editingAsset?.label}"`
                    : editingAsset
                    ? `📋 Base Asset Remix: "${editingAsset?.label}"`
                    : '✨ Create New Asset'}
                </span>
              </div>

              {/* Sub-Tab Switcher: Attributes vs Canvas & Drawing Studio */}
              <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-lg border border-[#0D5C63]/40">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('attributes')}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    editorSubTab === 'attributes'
                      ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📋</span> Attributes
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('studio')}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    editorSubTab === 'studio'
                      ? 'bg-cyan-950 text-[#22d3ee] border border-cyan-500/80 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎨</span> Canvas & Drawing Studio
                </button>

                {isEditingCustom && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] font-bold uppercase transition-colors ml-2"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: ATTRIBUTES & PROPERTIES */}
            {/* ========================================================================= */}
            {editorSubTab === 'attributes' && (
              <div className="flex flex-col gap-4">
                
                {/* Visual Thumbnail & Direct Canvas Studio Action Header */}
                <div className="bg-[#0d1117] border border-[#0D5C63]/60 rounded-xl p-3 flex items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    {activeTab === 'terrains' ? (
                      terrainForm.textureUrl ? (
                        <div className="w-14 h-14 rounded-lg border-2 border-cyan-500/60 overflow-hidden bg-[#090d13] shrink-0">
                          <img src={terrainForm.textureUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-lg border-2 border-white/40 shadow-inner shrink-0"
                          style={{ backgroundColor: terrainForm.color }}
                        />
                      )
                    ) : (
                      objectForm.imageUrl ? (
                        <div className="w-14 h-14 rounded-lg border-2 border-cyan-500/60 p-1 overflow-hidden bg-[#090d13] shrink-0 flex items-center justify-center">
                          <img src={objectForm.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-lg border-2 border-white/40 shadow-inner shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase"
                          style={{ backgroundColor: objectForm.color }}
                        >
                          {objectForm.shape}
                        </div>
                      )
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {activeTab === 'terrains' ? (terrainForm.label || 'Unnamed Terrain') : (objectForm.label || 'Unnamed Object')}
                      </div>
                      <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                        {activeTab === 'terrains'
                          ? (terrainForm.textureUrl ? '✓ Custom / Preset Texture Loaded' : 'Solid Color / Procedural')
                          : (objectForm.imageUrl ? '✓ Custom / Preset Sprite Loaded' : `Fallback Shape: ${objectForm.shape}`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorSubTab('studio')}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all"
                    >
                      <span>🎨</span> Open in Drawing Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => singleFileInputRef.current?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold uppercase transition-all"
                    >
                      <span>📁</span> Upload Image
                    </button>
                    <input
                      type="file"
                      ref={singleFileInputRef}
                      accept="image/*"
                      onChange={handleSingleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* TERRAIN ATTRIBUTES FORM */}
                {activeTab === 'terrains' && (
                  <form onSubmit={handleSaveTerrainSubmit} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Terrain Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Crystalline Void Crust"
                        value={terrainForm.label}
                        onChange={e => setTerrainForm({ ...terrainForm, label: e.target.value })}
                        className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Scale Scope</label>
                        <select
                          value={terrainForm.scale}
                          onChange={e => setTerrainForm({ ...terrainForm, scale: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        >
                          {MAP_TYPES.map(st => (
                            <option key={st} value={st}>{st} Scale</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Default Brush Width (px)</label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={terrainForm.strokeWidth}
                          onChange={e => setTerrainForm({ ...terrainForm, strokeWidth: Number(e.target.value) })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        />
                      </div>
                    </div>

                    {/* Preset Texture Pattern Selector */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Preset Seamless Textures</label>
                        <span className="text-[10px] text-cyan-400">Click to select or paint over in Studio</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 bg-[#0d1117] p-2 rounded border border-[#0D5C63]/60">
                        {Object.entries(TERRAIN_TEXTURE_PATTERNS).map(([key, dataUrl]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setTerrainForm({ ...terrainForm, textureUrl: dataUrl })}
                            className={`h-12 rounded border overflow-hidden transition-all ${
                              terrainForm.textureUrl === dataUrl
                                ? 'border-[#22d3ee] ring-2 ring-[#22d3ee]/60 scale-105'
                                : 'border-[#0D5C63]/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={dataUrl} alt={key} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Tint Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Base Tint Color Palette / Hex</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={terrainForm.color}
                          onChange={e => setTerrainForm({ ...terrainForm, color: e.target.value })}
                          className="w-9 h-9 rounded cursor-pointer border border-[#0D5C63]/60 bg-[#0d1117] p-0.5"
                        />
                        <input
                          type="text"
                          value={terrainForm.color}
                          onChange={e => setTerrainForm({ ...terrainForm, color: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs font-mono w-28 outline-none focus:border-[#22d3ee]"
                        />
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {PENCIL_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setTerrainForm({ ...terrainForm, color: c })}
                              className="w-5 h-5 rounded-full border border-white/40 shrink-0 hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Visual & Narrative Description</label>
                      <textarea
                        rows="2"
                        placeholder="Visual description of the terrain surface..."
                        value={terrainForm.desc}
                        onChange={e => setTerrainForm({ ...terrainForm, desc: e.target.value })}
                        className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Engine / Game Mechanics Notes</label>
                      <input
                        type="text"
                        placeholder="e.g., Transit Speed: 1.5x | Sensor Interference: High"
                        value={terrainForm.engineProps}
                        onChange={e => setTerrainForm({ ...terrainForm, engineProps: e.target.value })}
                        className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs font-mono outline-none focus:border-[#22d3ee]"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#0D5C63]/40 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => resetToNewForm('terrains')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                      >
                        {isEditingCustom ? 'Save Terrain Changes' : 'Create Custom Terrain'}
                      </button>
                    </div>
                  </form>
                )}

                {/* OBJECT ATTRIBUTES FORM */}
                {activeTab === 'objects' && (
                  <form onSubmit={handleSaveObjectSubmit} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Object Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Orbital Defense Bastion"
                        value={objectForm.label}
                        onChange={e => setObjectForm({ ...objectForm, label: e.target.value })}
                        className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Scale Scope</label>
                        <select
                          value={objectForm.scale}
                          onChange={e => setObjectForm({ ...objectForm, scale: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        >
                          {MAP_TYPES.map(st => (
                            <option key={st} value={st}>{st} Scale</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Category Tag</label>
                        <input
                          type="text"
                          placeholder="e.g., Megastructures, Outposts, Custom"
                          value={objectForm.category}
                          onChange={e => setObjectForm({ ...objectForm, category: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        />
                      </div>
                    </div>

                    {/* Preset Object Sprite Selector */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">Preset SVG Object Sprites</label>
                        <span className="text-[10px] text-cyan-400">Click to select or edit sprite in Studio</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 bg-[#0d1117] p-2 rounded border border-[#0D5C63]/60">
                        {Object.entries(PRESET_OBJECT_SPRITES).map(([key, dataUrl]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setObjectForm({ ...objectForm, imageUrl: dataUrl })}
                            className={`h-10 rounded border p-1 overflow-hidden transition-all bg-[#161b22] ${
                              objectForm.imageUrl === dataUrl
                                ? 'border-[#22d3ee] ring-2 ring-[#22d3ee]/60 scale-105'
                                : 'border-[#0D5C63]/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={dataUrl} alt={key} className="w-full h-full object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Fallback Vector Shape</label>
                        <select
                          value={objectForm.shape}
                          onChange={e => setObjectForm({ ...objectForm, shape: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        >
                          {OBJECT_SHAPES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {['rect', 'line'].includes(objectForm.shape) ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-300">Width</label>
                            <input
                              type="number"
                              min="5"
                              max="500"
                              value={objectForm.width}
                              onChange={e => setObjectForm({ ...objectForm, width: Number(e.target.value) })}
                              className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-300">Height</label>
                            <input
                              type="number"
                              min="5"
                              max="500"
                              value={objectForm.height}
                              onChange={e => setObjectForm({ ...objectForm, height: Number(e.target.value) })}
                              className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-300">Radius (px)</label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={objectForm.radius}
                            onChange={e => setObjectForm({ ...objectForm, radius: Number(e.target.value) })}
                            className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Color Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Fill / Tint Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={objectForm.color}
                          onChange={e => setObjectForm({ ...objectForm, color: e.target.value })}
                          className="w-9 h-9 rounded cursor-pointer border border-[#0D5C63]/60 bg-[#0d1117] p-0.5"
                        />
                        <input
                          type="text"
                          value={objectForm.color}
                          onChange={e => setObjectForm({ ...objectForm, color: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-1.5 rounded text-xs font-mono w-28 outline-none focus:border-[#22d3ee]"
                        />
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {PENCIL_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setObjectForm({ ...objectForm, color: c })}
                              className="w-5 h-5 rounded-full border border-white/40 shrink-0 hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Hazard Indicator (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Radiation Sweep"
                          value={objectForm.hazard}
                          onChange={e => setObjectForm({ ...objectForm, hazard: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-red-300 p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Scale Target Drilldown (Optional)</label>
                        <select
                          value={objectForm.scaleTarget}
                          onChange={e => setObjectForm({ ...objectForm, scaleTarget: e.target.value })}
                          className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                        >
                          <option value="">None</option>
                          {MAP_TYPES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Description</label>
                      <textarea
                        rows="2"
                        placeholder="Description of the placeable structure..."
                        value={objectForm.desc}
                        onChange={e => setObjectForm({ ...objectForm, desc: e.target.value })}
                        className="bg-[#0d1117] border border-[#0D5C63]/60 text-white p-2 rounded text-xs outline-none focus:border-[#22d3ee]"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#0D5C63]/40 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => resetToNewForm('objects')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                      >
                        {isEditingCustom ? 'Save Object Changes' : 'Create Custom Object'}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: CANVAS & DRAWING STUDIO */}
            {/* ========================================================================= */}
            {editorSubTab === 'studio' && (
              <div className="flex flex-col gap-3">
                <AssetDrawingStudio
                  key={editingAsset?.id || (activeTab === 'terrains' ? terrainForm.id : objectForm.id)}
                  initialImage={activeTab === 'terrains' ? terrainForm.textureUrl : objectForm.imageUrl}
                  onChange={(dataUrl) => {
                    if (activeTab === 'terrains') {
                      setTerrainForm(prev => ({ ...prev, textureUrl: dataUrl }));
                    } else {
                      setObjectForm(prev => ({ ...prev, imageUrl: dataUrl }));
                    }
                  }}
                  label={
                    activeTab === 'terrains'
                      ? `Terrain Texture Studio (${terrainForm.label || 'New Terrain'})`
                      : `Object Sprite Studio (${objectForm.label || 'New Object'})`
                  }
                  assetType={activeTab === 'terrains' ? 'terrain' : 'object'}
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#0D5C63]/40">
                  <button
                    type="button"
                    onClick={() => setEditorSubTab('attributes')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>⬅️</span> Back to Attributes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'terrains') handleSaveTerrainSubmit();
                      else handleSaveObjectSubmit();
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <span>💾</span> Save Changes to Catalog
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
