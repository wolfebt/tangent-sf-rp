/**
 * @file CatalogOutliner.tsx
 * @description Master Hierarchical Outliner Tree for the Left Module Catalog.
 * Connects directly to CampaignContext, FolioContext, and Omnicortex DBM,
 * providing search filtering, visibility toggles, and drag-and-drop handles.
 */

import React, { useRef, useState, useMemo } from 'react';
import { 
  Map, 
  BookOpen, 
  Users, 
  Swords, 
  Shield, 
  Scroll, 
  Package, 
  Key, 
  Sparkles, 
  Upload, 
  Trash2, 
  FolderOpen,
  Boxes
} from 'lucide-react';
import { CatalogNodeItem } from './CatalogNodeItem';
import { useCampaign } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { useDBM } from '../../../context/DBMContext';
import { useEngineStore } from '../../../engine/index';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { AudioService } from '../../../services/audioService';
import { DEFAULT_WEAPONRY } from '../../../data/weaponryData';
import { DEFAULT_ARMORING } from '../../../data/armoringData';
import { DEFAULT_AUGMENTATIONS } from '../../../data/augmentationsData';
import { DEFAULT_FACTIONS } from '../../../data/factionsData';
import { DEFAULT_SPECIES } from '../../../data/speciesData';
import { adeElementToStageToken, adeElementToInteractiveObject } from '../../../utils/storyAssetAdapter';

export interface CatalogOutlinerProps {
  searchQuery: string;
  activeFilterTag: string | null;
  onSelectMap?: (mapId: string) => void;
}

export const CatalogOutliner: React.FC<CatalogOutlinerProps> = ({
  searchQuery,
  activeFilterTag,
  onSelectMap
}) => {
  const { activeCategory } = useUILayoutStore();
  const { universeState, activeMapId, setActiveMapId, updateMap, elementsCatalog, storyCatalog } = useCampaign();
  const folio = (useFolio() || {}) as any;
  const dbm = (useDBM() || {}) as any;
  const dbData = dbm.dbData || {};

  // ADE Import Modal State
  const [isAdeImportModalOpen, setIsAdeImportModalOpen] = useState(false);

  // Data sources
  const maps = universeState?.maps || [];
  const scenarios = universeState?.scenarios || [];
  const storyCards = universeState?.creativeState?.storyCards || [];
  const personaRoster: any[] = (folio?.personaRoster && folio.personaRoster.length > 0) 
    ? folio.personaRoster 
    : (folio?.characterData?.name ? [folio.characterData] : []);

  // Live Omnicortex entity collections
  const liveWeaponry = useMemo(() => (dbData.weaponry && dbData.weaponry.length > 0) ? dbData.weaponry : DEFAULT_WEAPONRY, [dbData.weaponry]);
  const liveArmoring = useMemo(() => (dbData.armoring && dbData.armoring.length > 0) ? dbData.armoring : DEFAULT_ARMORING, [dbData.armoring]);
  const liveGear = useMemo(() => dbData.gear || [], [dbData.gear]);
  const liveAugmentations = useMemo(() => (dbData.augmentations && dbData.augmentations.length > 0) ? dbData.augmentations : DEFAULT_AUGMENTATIONS, [dbData.augmentations]);
  const liveFactions = useMemo(() => (dbData.factions && dbData.factions.length > 0) ? dbData.factions : DEFAULT_FACTIONS, [dbData.factions]);
  const liveBestiary = useMemo(() => (dbData.bestiary && dbData.bestiary.length > 0) ? dbData.bestiary : (dbData.species && dbData.species.length > 0) ? dbData.species : DEFAULT_SPECIES, [dbData.bestiary, dbData.species]);

  // ADE World Elements collections
  const adeElements = elementsCatalog || [];
  const adePersonas = useMemo(() => adeElements.filter((e: any) => e.type === 'Persona'), [adeElements]);
  const adeItems = useMemo(() => adeElements.filter((e: any) => e.type === 'Item'), [adeElements]);
  const adeFactions = useMemo(() => adeElements.filter((e: any) => e.type === 'Faction'), [adeElements]);
  const adeLore = useMemo(() => adeElements.filter((e: any) => ['Clue', 'Lore', 'Document', 'Location', 'Quest'].includes(e.type)), [adeElements]);

  // Custom Assets Media Library State
  const [customAssets, setCustomAssets] = useState<Array<{ id: string; name: string; url: string; date: string }>>(() => {
    try {
      const stored = localStorage.getItem('tangent_vtt_custom_assets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|svg)$/i.test(file.name)) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const url = loadEvt.target?.result as string;
        if (!url) return;
        const newAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url,
          date: new Date().toLocaleDateString()
        };
        setCustomAssets(prev => {
          const next = [newAsset, ...prev];
          try {
            localStorage.setItem('tangent_vtt_custom_assets', JSON.stringify(next));
          } catch (e) {
            console.warn('LocalStorage quota reached for assets, kept in memory');
          }
          return next;
        });
        AudioService.playCriticalChime(true);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAsset = (assetId: string) => {
    setCustomAssets(prev => {
      const next = prev.filter(a => a.id !== assetId);
      try {
        localStorage.setItem('tangent_vtt_custom_assets', JSON.stringify(next));
      } catch {}
      return next;
    });
    AudioService.playTerminalBeep(800, 0.04);
  };

  const handleSetMapBackground = (assetUrl: string, assetName: string) => {
    const currentMap = maps.find((m: any) => m.id === activeMapId);
    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        background_url: assetUrl,
        name: currentMap.name || assetName
      });
      AudioService.playCriticalChime(true);
    }
  };

  // Filter helper supporting text search and tag filters
  const matchesSearch = (text: string, tagType?: string) => {
    if (activeFilterTag) {
      if (activeFilterTag === '#maps' && tagType !== 'map') return false;
      if (activeFilterTag === '#hero' && tagType !== 'hero') return false;
      if (activeFilterTag === '#npc' && tagType !== 'npc') return false;
      if (activeFilterTag === '#clue' && tagType !== 'clue') return false;
      if (activeFilterTag === '#item' && tagType !== 'item') return false;
    }
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Spawn Token onto Stage with icon & image alignment
  const handleDeployToken = (entity: {
    id: string;
    name: string;
    vitality?: number;
    health?: number;
    structure?: number;
    hp?: number;
    dr?: number;
    stamina_dr?: number;
    species?: string;
    archetype?: string;
    isPersona?: boolean;
    imageUrl?: string;
    image?: string;
    icon?: string;
    category?: string;
  }) => {
    const newId = `${entity.id}-${Date.now()}`;
    const isSyn = String(entity.species || '').toLowerCase().includes('synthetic') || String(entity.species || '').toLowerCase().includes('mecha');
    const staticToken = {
      id: newId,
      character_doc_id: entity.id,
      name: entity.name,
      image_url: entity.image || entity.imageUrl,
      icon: entity.icon || (entity.category === 'weapon' ? '⚔️' : entity.category === 'armor' ? '🛡️' : entity.isPersona ? '🧙‍♂️' : '📦'),
      base_hp: entity.health || entity.hp || 30,
      base_vitality: entity.vitality || 30,
      base_health: entity.health || entity.hp || 30,
      base_structure: entity.structure || 60,
      is_synthetic: isSyn,
      tech_level: 3,
      armor_dr: entity.dr || 6,
      stamina_dr: entity.stamina_dr || 2,
      size_modifier: 0,
      speed_ft: 30,
      species: entity.species || (isSyn ? 'Synthetic' : 'Human'),
      archetype: entity.archetype || 'Operative',
      is_persona: !!entity.isPersona
    };

    useEngineStore.getState().loadStaticEntity(staticToken);
    // Deploy at default stage center
    useEngineStore.getState().updatePosition(newId, 350, 350);
    useEngineStore.getState().clearSelection();
    useEngineStore.getState().setSelection(newId, true);

    // Persist to current map tokens in CampaignContext
    const currentMap = maps.find((m: any) => m.id === activeMapId);
    if (currentMap && updateMap) {
      updateMap(currentMap.id, {
        tokens: [...(currentMap.tokens || []), { ...staticToken, x: 350, y: 350 }]
      });
    }

    AudioService.playCriticalChime(true);
  };

  const handleImportAdeElement = (element: any, customPos?: { x: number; y: number }) => {
    if (!element) return;
    const pos = customPos || { x: 350 + (Math.random() - 0.5) * 80, y: 350 + (Math.random() - 0.5) * 80 };
    const currentMap = maps.find((m: any) => m.id === activeMapId);

    if (element.type === 'Persona') {
      const token = adeElementToStageToken(element, pos);
      if (token) {
        useEngineStore.getState().loadStaticEntity(token as any);
        useEngineStore.getState().updatePosition(token.id, pos.x, pos.y);
        useEngineStore.getState().clearSelection();
        useEngineStore.getState().setSelection(token.id, true);

        if (currentMap && updateMap) {
          updateMap(currentMap.id, {
            tokens: [...(currentMap.tokens || []), { ...token, x: pos.x, y: pos.y }]
          });
        }
      }
    } else {
      // Deploy as Interactive Scene Object (Items as loot caches, props as terminals/doors, hazards as traps)
      const obj = adeElementToInteractiveObject(element, pos);
      if (obj && currentMap && updateMap) {
        updateMap(currentMap.id, {
          objects: [...(currentMap.objects || []), obj]
        });
      }
    }
    AudioService.playCriticalChime(true);
  };

  const handleDeployScenarioBundle = (scenarioId?: string) => {
    const targetScenario = scenarios.find((s: any) => s.id === scenarioId) || scenarios[0];
    if (!targetScenario) return;

    const linkedIds = targetScenario.linkedElements || [];
    const elementsToDeploy = (elementsCatalog || []).filter((e: any) => linkedIds.includes(e.id));

    if (elementsToDeploy.length === 0) {
      alert('No linked elements found for this scenario. Link elements in the ADE Story Weaver first!');
      return;
    }

    elementsToDeploy.forEach((elem: any, idx: number) => {
      const angle = (idx / Math.max(1, elementsToDeploy.length)) * Math.PI * 2;
      const radius = 120;
      const x = Math.round(400 + Math.cos(angle) * radius);
      const y = Math.round(350 + Math.sin(angle) * radius);
      handleImportAdeElement(elem, { x, y });
    });

    AudioService.playCriticalChime(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin select-none">
      {/* Quick ADE Module & Elements Ingestion Header Bar */}
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-slate-800/80">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">OMNICORTEX & ADE REPO</span>
        <button
          type="button"
          onClick={() => setIsAdeImportModalOpen(true)}
          className="px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-mono text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
          title="Import Adventure Modules and Worldbuilding Elements directly from ADE Story Foundry"
        >
          <FolderOpen size={10} />
          <span>Import from ADE</span>
        </button>
      </div>

      {/* ADE Import Modal */}
      {isAdeImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e131b] border border-purple-500/60 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 font-mono max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                <FolderOpen size={16} className="text-purple-400" />
                <span>ADE Story Foundry Importer</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdeImportModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Import narrative adventure modules, scenes, and worldbuilding elements directly into the active Stage tactical session.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-900">
              {/* Adventure Modules */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Story Modules ({(storyCatalog || []).length})</div>
              {(storyCatalog || []).length === 0 ? (
                <div className="text-[10px] text-slate-600 italic p-2 border border-dashed border-slate-800 rounded">No saved ADE adventure modules found.</div>
              ) : (
                storyCatalog.map((mod: any) => (
                  <div key={mod.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-purple-300 truncate">{mod.name || mod.title}</div>
                      <div className="text-[9px] text-slate-500">{mod.scenarios?.length || 0} scenarios • {mod.maps?.length || 0} maps</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (mod.maps && mod.maps.length > 0 && updateMap) {
                          mod.maps.forEach((m: any) => {
                            if (!maps.some((existing: any) => existing.id === m.id)) {
                              maps.push(m);
                            }
                          });
                        }
                        setIsAdeImportModalOpen(false);
                        AudioService.playCriticalChime(true);
                      }}
                      className="px-2 py-1 rounded bg-purple-600 text-white font-bold text-[10px] cursor-pointer hover:bg-purple-500 shrink-0"
                    >
                      Import Module
                    </button>
                  </div>
                ))
              )}

              {/* Active Scenarios & Element Bundles */}
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pt-2 border-t border-slate-800">
                Active Scenarios &amp; Element Bundles ({scenarios.length})
              </div>
              {scenarios.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic p-2 border border-dashed border-slate-800 rounded">No active ADE scenarios found.</div>
              ) : (
                scenarios.map((sc: any) => {
                  const linkedCount = (sc.linkedElements || []).length;
                  return (
                    <div key={sc.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-cyan-300 truncate">{sc.title || 'Untitled Scenario'}</div>
                        <div className="text-[9px] text-slate-500">{linkedCount} linked story element(s)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeployScenarioBundle(sc.id);
                          setIsAdeImportModalOpen(false);
                        }}
                        className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-[10px] cursor-pointer hover:from-cyan-500 hover:to-blue-500 shrink-0 shadow-sm"
                        title="Deploy all linked story elements onto the stage around active center"
                      >
                        Deploy Bundle
                      </button>
                    </div>
                  );
                })
              )}

              {/* Elements Catalog */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-800">
                World Elements ({adeElements.length})
              </div>
              {adeElements.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic p-2 border border-dashed border-slate-800 rounded">No ADE elements in current campaign.</div>
              ) : (
                adeElements.map((elem: any) => (
                  <div key={elem.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-sm">{elem.icon || (elem.type === 'Persona' ? '🧙‍♂️' : elem.type === 'Item' ? '📦' : elem.type === 'Faction' ? '🛡️' : '📜')}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{elem.title || elem.name}</div>
                        <div className="text-[9px] text-slate-500">{elem.type} • {elem.fields?.species || elem.category || 'Asset'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleImportAdeElement(elem);
                        setIsAdeImportModalOpen(false);
                      }}
                      className="px-2 py-1 rounded bg-cyan-600 text-black font-bold text-[10px] cursor-pointer hover:bg-cyan-500 shrink-0"
                    >
                      Spawn
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. SCENES & MAPS TAXONOMY                                             */}
      {/* ===================================================================== */}
      {activeCategory === 'scenes' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Tactical Battlemaps</span>
            <span className="text-cyan-400 font-bold">{maps.length}</span>
          </div>

          {maps.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No tactical scenes loaded in module.
            </div>
          ) : (
            maps
              .filter((m: any) => matchesSearch(m.name || m.title || ''))
              .map((map: any, idx: number) => {
                const isSelected = map.id === activeMapId;
                const tokenCount = (map.tokens || []).length;
                const wallCount = (map.walls || []).length;

                return (
                  <CatalogNodeItem
                    key={map.id || idx}
                    id={map.id}
                    title={map.name || map.title || `Sector ${idx + 1}`}
                    subtitle={`${tokenCount} tokens &bull; ${wallCount} walls &bull; ${map.gridType || 'sq'}`}
                    badge={isSelected ? 'ACTIVE' : undefined}
                    icon={<Map size={14} />}
                    iconColor={isSelected ? 'text-cyan-400' : 'text-slate-400'}
                    isSelected={isSelected}
                    dragPayload={{
                      type: 'scene_switch',
                      mapId: map.id,
                      name: map.name || map.title
                    }}
                    onClick={() => {
                      if (onSelectMap) onSelectMap(map.id);
                      if (setActiveMapId) setActiveMapId(map.id);
                    }}
                    onToggleVisibility={() => {
                      if (updateMap) {
                        updateMap(map.id, { isVisibleToPlayers: !map.isVisibleToPlayers });
                      }
                    }}
                    isVisibleToPlayers={map.isVisibleToPlayers !== false}
                  />
                );
              })
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. STORY ARCS & QUESTS TAXONOMY                                       */}
      {/* ===================================================================== */}
      {activeCategory === 'story' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Story Acts & Scenarios</span>
            <span className="text-purple-400 font-bold">{scenarios.length}</span>
          </div>

          {scenarios.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No narrative scenarios created.
            </div>
          ) : (
            scenarios
              .filter((sc: any) => matchesSearch(sc.title || ''))
              .map((sc: any, idx: number) => (
                <CatalogNodeItem
                  key={sc.id || idx}
                  id={sc.id}
                  title={sc.title || `Act ${idx + 1}`}
                  subtitle={sc.type || 'Scenario Act'}
                  icon={<BookOpen size={14} />}
                  iconColor="text-purple-400"
                  dragPayload={{
                    type: 'scenario',
                    id: sc.id,
                    title: sc.title
                  }}
                  isVisibleToPlayers={true}
                />
              ))
          )}

          {storyCards.length > 0 && (
            <div className="pt-2 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1">
                Narrative Beats & Cards ({storyCards.length})
              </div>
              {storyCards.map((card: any, idx: number) => (
                <CatalogNodeItem
                  key={card.id || idx}
                  id={card.id || `card-${idx}`}
                  title={card.title || `Beat ${idx + 1}`}
                  subtitle="Story Card"
                  icon={<Sparkles size={13} />}
                  iconColor="text-amber-400"
                  isVisibleToPlayers={card.revealed !== false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. DRAMATIS PERSONAE & FOLIO TAXONOMY                                 */}
      {/* ===================================================================== */}
      {activeCategory === 'personae' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Hero Operatives & Personas</span>
            <span className="text-emerald-400 font-bold">{personaRoster.length + adePersonas.length}</span>
          </div>

          {personaRoster.length === 0 && adePersonas.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
              No operative loaded from Persona Folio (/folio) or ADE Elements.
            </div>
          ) : (
            <>
              {personaRoster
                .filter((p: any) => matchesSearch(p.name || p['char-name'] || ''))
                .map((p: any, idx: number) => {
                  const pId = p['character-doc-id'] || p.id || `hero-${idx}`;
                  const pName = p.name || p['char-name'] || 'Operative';
                  const pSpecies = p.species || p['char-species'] || 'Human';
                  const pArchetype = p.archetype || p['char-archetype'] || 'Operator';
                  const isSyn = String(pSpecies).toLowerCase().includes('synthetic');
                  const vit = p.vitality ?? p.base_vitality ?? 30;
                  const hp = p.health ?? p['hit-points']?.max ?? 30;
                  const struct = p.structure?.max ?? p.base_structure ?? 60;
                  const dr = p['armor-dr']?.kinetic ?? p.armor_dr ?? 8;
                  const img = p.portrait_url || p.image_url || p.avatar || p.image;
                  const icon = p.icon || (isSyn ? '🤖' : '🧙‍♂️');

                  const sub = isSyn 
                    ? `${pSpecies} • ${pArchetype} • ${struct} SP`
                    : `${pSpecies} • ${pArchetype} • ${vit} VP / ${hp} HP`;

                  return (
                    <CatalogNodeItem
                      key={pId}
                      id={pId}
                      title={pName}
                      subtitle={sub}
                      badge="FOLIO HERO"
                      icon={<Users size={14} />}
                      iconColor="text-emerald-400"
                      dragPayload={{
                        type: 'hero',
                        id: pId,
                        name: pName,
                        vitality: vit,
                        health: hp,
                        structure: struct,
                        dr,
                        species: pSpecies,
                        archetype: pArchetype,
                        imageUrl: img,
                        image: img,
                        icon,
                        isPersona: true
                      }}
                      onSpawn={() => handleDeployToken({
                        id: pId,
                        name: pName,
                        vitality: vit,
                        health: hp,
                        structure: struct,
                        dr,
                        species: pSpecies,
                        archetype: pArchetype,
                        imageUrl: img,
                        image: img,
                        icon,
                        isPersona: true
                      })}
                      isVisibleToPlayers={true}
                    />
                  );
                })}

              {adePersonas
                .filter((p: any) => matchesSearch(p.title || p.name || ''))
                .map((p: any, idx: number) => {
                  const pId = p.id || `ade-persona-${idx}`;
                  const pName = p.title || p.name || 'ADE Persona';
                  const pSpecies = p.fields?.species || 'Human';
                  const pArchetype = p.fields?.archetype || 'Operative';
                  const img = p.imageUrl || p.image;
                  const icon = p.icon || '🧙‍♂️';

                  return (
                    <CatalogNodeItem
                      key={pId}
                      id={pId}
                      title={pName}
                      subtitle={`ADE Persona • ${pSpecies} • ${pArchetype}`}
                      badge="ADE PERSONA"
                      icon={<Users size={14} />}
                      iconColor="text-emerald-300"
                      dragPayload={{
                        type: 'hero',
                        id: pId,
                        name: pName,
                        species: pSpecies,
                        archetype: pArchetype,
                        imageUrl: img,
                        image: img,
                        icon,
                        isPersona: true
                      }}
                      onSpawn={() => handleDeployToken({
                        id: pId,
                        name: pName,
                        species: pSpecies,
                        archetype: pArchetype,
                        imageUrl: img,
                        image: img,
                        icon,
                        isPersona: true
                      })}
                      isVisibleToPlayers={true}
                    />
                  );
                })}
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ENCOUNTERS & HAZARDS TAXONOMY (Live Omnicortex Bestiary)           */}
      {/* ===================================================================== */}
      {activeCategory === 'encounters' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Tactical Formations & Adversaries</span>
            <span className="text-red-400 font-bold">{scenarios.reduce((acc: number, s: any) => acc + (s.encounters?.length || 0), 0) + liveBestiary.length}</span>
          </div>

          {/* Scenario Encounters */}
          {scenarios.flatMap((s: any) => s.encounters || []).map((enc: any, idx: number) => {
            const encId = enc.id || `sc-enc-${idx}`;
            return (
              <CatalogNodeItem
                key={encId}
                id={encId}
                title={enc.name || enc.title || 'Tactical Squad'}
                subtitle={`${enc.type || 'Encounter'} • ${(enc.units || []).length || 1} units`}
                badge="SCENARIO"
                icon={<Swords size={14} />}
                iconColor="text-red-400"
                dragPayload={{
                  type: 'encounter',
                  id: encId,
                  name: enc.name || enc.title,
                  icon: enc.icon || '⚔️',
                  imageUrl: enc.image || enc.imageUrl
                }}
                onSpawn={() => handleDeployToken({
                  id: encId,
                  name: enc.name || enc.title,
                  icon: enc.icon || '⚔️',
                  imageUrl: enc.image || enc.imageUrl
                })}
                isVisibleToPlayers={false}
              />
            );
          })}

          {/* Omnicortex Bestiary & Adversaries */}
          {liveBestiary
            .filter((sp: any) => matchesSearch(sp.name || ''))
            .map((sp: any, idx: number) => {
              const spId = sp.id || `species-${idx}`;
              const isSyn = String(sp.name || sp.type || '').toLowerCase().includes('synthetic') || String(sp.name || '').toLowerCase().includes('mecha');
              const struct = isSyn ? 45 : 30;
              const dr = isSyn ? 6 : 2;
              const icon = sp.icon || (isSyn ? '🤖' : '👾');
              const img = sp.image || sp.imageUrl || sp.portrait_url;

              return (
                <CatalogNodeItem
                  key={spId}
                  id={spId}
                  title={sp.name}
                  subtitle={`${sp.size || 'Medium'} • ${sp.type || 'Adversary'} • ${isSyn ? `${struct} SP` : '30 HP'}`}
                  badge={isSyn ? 'SYNTHETIC' : 'BESTIARY'}
                  icon={<Swords size={14} />}
                  iconColor="text-red-400"
                  dragPayload={{
                    type: 'npc',
                    id: spId,
                    name: sp.name,
                    species: sp.name,
                    structure: struct,
                    dr,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  onSpawn={() => handleDeployToken({
                    id: spId,
                    name: sp.name,
                    species: sp.name,
                    structure: struct,
                    dr,
                    icon,
                    imageUrl: img,
                    image: img
                  })}
                  isVisibleToPlayers={false}
                />
              );
            })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. FACTIONS TAXONOMY (Live Omnicortex & ADE)                           */}
      {/* ===================================================================== */}
      {activeCategory === 'factions' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Factions & Power Dynamics</span>
            <span className="text-amber-400 font-bold">{liveFactions.length + adeFactions.length}</span>
          </div>

          {liveFactions
            .filter((f: any) => matchesSearch(f.name || ''))
            .map((f: any, idx: number) => {
              const fId = f.id || `fac-${idx}`;
              const icon = f.icon || '🛡️';
              const img = f.image || f.imageUrl || f.emblem_url;
              return (
                <CatalogNodeItem
                  key={fId}
                  id={fId}
                  title={f.name}
                  subtitle={`${f.standing || 'Neutral'} • Power: ${f.influence || f.tier || 'Tier III'}`}
                  badge="OMNICORTEX"
                  icon={<Shield size={14} />}
                  iconColor="text-amber-400"
                  dragPayload={{
                    type: 'faction',
                    id: fId,
                    name: f.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  isVisibleToPlayers={true}
                />
              );
            })}

          {adeFactions
            .filter((f: any) => matchesSearch(f.title || f.name || ''))
            .map((f: any, idx: number) => {
              const fId = f.id || `ade-fac-${idx}`;
              const icon = f.icon || '🛡️';
              const img = f.image || f.imageUrl;
              return (
                <CatalogNodeItem
                  key={fId}
                  id={fId}
                  title={f.title || f.name}
                  subtitle="ADE Faction Element"
                  badge="ADE"
                  icon={<Shield size={14} />}
                  iconColor="text-amber-300"
                  dragPayload={{
                    type: 'faction',
                    id: fId,
                    name: f.title || f.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  isVisibleToPlayers={true}
                />
              );
            })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. LORE, CLUES & HANDOUTS TAXONOMY (Live Omnicortex & ADE)            */}
      {/* ===================================================================== */}
      {activeCategory === 'lore' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Investigative Clues & Lore</span>
            <span className="text-sky-400 font-bold">{storyCards.length + (universeState?.lore?.length || 0) + adeLore.length}</span>
          </div>

          {storyCards.map((card: any, idx: number) => (
            <CatalogNodeItem
              key={card.id || `card-${idx}`}
              id={card.id || `card-${idx}`}
              title={card.title || `Beat ${idx + 1}`}
              subtitle="Narrative Story Card"
              badge="STORY BEAT"
              icon={<Sparkles size={14} />}
              iconColor="text-amber-400"
              dragPayload={{
                type: 'story_card',
                id: card.id,
                title: card.title,
                icon: '✨'
              }}
              isVisibleToPlayers={card.revealed !== false}
            />
          ))}

          {adeLore
            .filter((l: any) => matchesSearch(l.title || l.name || ''))
            .map((lore: any, idx: number) => {
              const lId = lore.id || `ade-lore-${idx}`;
              const icon = lore.icon || (lore.type === 'Clue' ? '🗝️' : '📜');
              const img = lore.image || lore.imageUrl;
              return (
                <CatalogNodeItem
                  key={lId}
                  id={lId}
                  title={lore.title || lore.name}
                  subtitle={`ADE ${lore.type} • ${(lore.content || '').replace(/<[^>]+>/g, '').slice(0, 45)}...`}
                  badge={lore.type?.toUpperCase() || 'LORE'}
                  icon={lore.type === 'Clue' ? <Key size={14} /> : <Scroll size={14} />}
                  iconColor="text-sky-400"
                  dragPayload={{
                    type: 'item_clue',
                    id: lId,
                    name: lore.title || lore.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  isVisibleToPlayers={lore.revealed !== false}
                />
              );
            })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. COMPENDIUM ARMORY TAXONOMY (Live Omnicortex & ADE Hardware)         */}
      {/* ===================================================================== */}
      {activeCategory === 'armory' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Compendium Armory & Hardware</span>
            <span className="text-indigo-400 font-bold">{liveWeaponry.length + liveArmoring.length + liveGear.length + liveAugmentations.length + adeItems.length}</span>
          </div>

          {/* Weaponry */}
          {liveWeaponry
            .filter((w: any) => matchesSearch(w.name || ''))
            .map((wpn: any, idx: number) => {
              const wId = wpn.id || `wpn-${idx}`;
              const icon = wpn.icon || '⚔️';
              const img = wpn.image || wpn.imageUrl;
              return (
                <CatalogNodeItem
                  key={wId}
                  id={wId}
                  title={wpn.name}
                  subtitle={`${wpn.category || 'Weapon'} • ${wpn.damage || '2d8'} • Rng: ${wpn.range || '50 ft'} • AP ${wpn.ap || 0}`}
                  badge="WEAPON"
                  icon={<Package size={14} />}
                  iconColor="text-indigo-400"
                  dragPayload={{
                    type: 'equipment',
                    category: 'weapon',
                    id: wId,
                    name: wpn.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  onSpawn={() => handleDeployToken({
                    id: wId,
                    name: wpn.name,
                    category: 'weapon',
                    icon,
                    imageUrl: img,
                    image: img
                  })}
                  isVisibleToPlayers={true}
                />
              );
            })}

          {/* Armoring */}
          {liveArmoring
            .filter((a: any) => matchesSearch(a.name || ''))
            .map((arm: any, idx: number) => {
              const aId = arm.id || `arm-${idx}`;
              const icon = arm.icon || '🛡️';
              const img = arm.image || arm.imageUrl;
              return (
                <CatalogNodeItem
                  key={aId}
                  id={aId}
                  title={arm.name}
                  subtitle={`${arm.category || 'Armor'} • +${arm.dr || arm.kineticDr || 4} DR • TL ${arm.tl || 3}`}
                  badge="ARMOR"
                  icon={<Shield size={14} />}
                  iconColor="text-cyan-400"
                  dragPayload={{
                    type: 'equipment',
                    category: 'armor',
                    id: aId,
                    name: arm.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  onSpawn={() => handleDeployToken({
                    id: aId,
                    name: arm.name,
                    category: 'armor',
                    icon,
                    imageUrl: img,
                    image: img
                  })}
                  isVisibleToPlayers={true}
                />
              );
            })}

          {/* Gear & Hardware */}
          {liveGear
            .filter((g: any) => matchesSearch(g.name || ''))
            .map((gear: any, idx: number) => {
              const gId = gear.id || `gear-${idx}`;
              const icon = gear.icon || '📦';
              const img = gear.image || gear.imageUrl;
              return (
                <CatalogNodeItem
                  key={gId}
                  id={gId}
                  title={gear.name}
                  subtitle={`${gear.category || 'Gear'} • ${gear.description || 'Hardware gear'}`}
                  badge="GEAR"
                  icon={<Boxes size={14} />}
                  iconColor="text-amber-400"
                  dragPayload={{
                    type: 'equipment',
                    category: 'gear',
                    id: gId,
                    name: gear.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  isVisibleToPlayers={true}
                />
              );
            })}

          {/* Augmentations & Cybernetics */}
          {liveAugmentations
            .filter((aug: any) => matchesSearch(aug.name || ''))
            .map((aug: any, idx: number) => {
              const augId = aug.id || `aug-${idx}`;
              const icon = aug.icon || '⚡';
              const img = aug.image || aug.imageUrl;
              return (
                <CatalogNodeItem
                  key={augId}
                  id={augId}
                  title={aug.name}
                  subtitle={`${aug.type || 'Cyberware'} • Stage: ${aug.stage || 'Standard'} • ${aug.essence || aug.strain || 1} Strain`}
                  badge="AUGMENT"
                  icon={<Sparkles size={14} />}
                  iconColor="text-cyan-400"
                  dragPayload={{
                    type: 'equipment',
                    category: 'augmentation',
                    id: augId,
                    name: aug.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  isVisibleToPlayers={true}
                />
              );
            })}

          {/* ADE Custom Items */}
          {adeItems
            .filter((it: any) => matchesSearch(it.title || it.name || ''))
            .map((item: any, idx: number) => {
              const itId = item.id || `ade-item-${idx}`;
              const icon = item.icon || '📦';
              const img = item.image || item.imageUrl;
              return (
                <CatalogNodeItem
                  key={itId}
                  id={itId}
                  title={item.title || item.name}
                  subtitle={`ADE Item • ${item.category || 'World Asset'}`}
                  badge="ADE ITEM"
                  icon={<Package size={14} />}
                  iconColor="text-emerald-400"
                  dragPayload={{
                    type: 'equipment',
                    category: 'item',
                    id: itId,
                    name: item.title || item.name,
                    icon,
                    imageUrl: img,
                    image: img
                  }}
                  onSpawn={() => handleDeployToken({
                    id: itId,
                    name: item.title || item.name,
                    category: 'item',
                    icon,
                    imageUrl: img,
                    image: img
                  })}
                  isVisibleToPlayers={true}
                />
              );
            })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. ASSETS & MEDIA LIBRARY TAXONOMY                                    */}
      {/* ===================================================================== */}
      {activeCategory === 'assets' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Media & Custom Assets
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-500/50 text-teal-300 font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title="Upload PNG, JPG, WEBP, or SVG images from local disk"
            >
              <Upload size={11} /> Upload Asset
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Quick Drop Zone Hint */}
          <div className="p-2 text-center rounded-lg border border-dashed border-teal-500/30 bg-teal-950/20 text-[10px] text-teal-300/80 font-mono">
            Drop images directly onto The Stage or upload here.
          </div>

          {/* Asset List */}
          {customAssets.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-1">
              <FolderOpen size={20} className="mx-auto text-slate-600 mb-1" />
              <div>No custom media uploaded yet.</div>
              <p className="text-[10px] text-slate-600">
                Click [Upload Asset] above to import battlemaps, tokens, and props.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {customAssets
                .filter(a => matchesSearch(a.name))
                .map(asset => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({
                        id: asset.id,
                        name: asset.name,
                        imageUrl: asset.url,
                        hp: 30,
                        vitality: 30,
                        health: 30,
                        dr: 6
                      }));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-all flex items-center justify-between gap-2 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={asset.url} 
                        alt={asset.name} 
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0 bg-slate-900" 
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-200 truncate text-[11px] font-mono">
                          {asset.name}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          Uploaded {asset.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeployToken({
                          id: asset.id,
                          name: asset.name,
                          imageUrl: asset.url,
                          vitality: 30,
                          health: 30,
                          dr: 6
                        })}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-[9.5px] font-mono font-bold transition-colors cursor-pointer"
                        title="Spawn as token onto Stage"
                      >
                        + Token
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetMapBackground(asset.url, asset.name)}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[9.5px] font-mono font-bold transition-colors cursor-pointer"
                        title="Set as active battlemap background"
                      >
                        Set Map
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogOutliner;
