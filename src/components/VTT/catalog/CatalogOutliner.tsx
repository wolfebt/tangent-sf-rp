/**
 * @file CatalogOutliner.tsx
 * @description Master Hierarchical Outliner Tree for the Left Module Catalog.
 * Connects directly to CampaignContext, FolioContext, and Omnicortex DBM,
 * providing search filtering, visibility toggles, and drag-and-drop handles.
 */

import React, { useRef, useState } from 'react';
import { 
  Map, 
  BookOpen, 
  Users, 
  Swords, 
  Shield, 
  Scroll, 
  Package, 
  Flame, 
  Key, 
  Sparkles,
  Upload,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { CatalogNodeItem } from './CatalogNodeItem';
import { useCampaign } from '../../../context/CampaignContext';
import { useFolio } from '../../../context/FolioContext';
import { useEngineStore } from '../../../engine/index';
import { useUILayoutStore } from '../store/uiLayoutStore';
import { AudioService } from '../../../services/audioService';

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
  const { universeState, activeMapId, setActiveMapId, updateMap } = useCampaign();
  const folio = (useFolio() || {}) as any;

  // Data sources
  const maps = universeState?.maps || [];
  const scenarios = universeState?.scenarios || [];
  const storyCards = universeState?.creativeState?.storyCards || [];
  const personaRoster: any[] = (folio?.personaRoster && folio.personaRoster.length > 0) 
    ? folio.personaRoster 
    : (folio?.characterData?.name ? [folio.characterData] : []);

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

  // Spawn Token onto Stage
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
  }) => {
    const newId = `${entity.id}-${Date.now()}`;
    const isSyn = String(entity.species || '').toLowerCase().includes('synthetic') || String(entity.species || '').toLowerCase().includes('mecha');
    const staticToken = {
      id: newId,
      character_doc_id: entity.id,
      name: entity.name,
      image_url: entity.imageUrl,
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

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin select-none">
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
            <span>Hero Operatives & Squad</span>
            <span className="text-emerald-400 font-bold">{personaRoster.length}</span>
          </div>

          {personaRoster.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
              No operative loaded from Persona Folio (/folio).
            </div>
          ) : (
            personaRoster
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
                const img = p.portrait_url || p.image_url || p.avatar;

                const sub = isSyn 
                  ? `${pSpecies} • ${pArchetype} • ${struct} SP`
                  : `${pSpecies} • ${pArchetype} • ${vit} VP / ${hp} HP`;

                return (
                  <CatalogNodeItem
                    key={pId}
                    id={pId}
                    title={pName}
                    subtitle={sub}
                    badge="HERO"
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
                      isPersona: true
                    })}
                    isVisibleToPlayers={true}
                  />
                );
              })
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ENCOUNTERS & HAZARDS TAXONOMY                                       */}
      {/* ===================================================================== */}
      {activeCategory === 'encounters' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Tactical Formations & Hazards</span>
            <span className="text-red-400 font-bold">3</span>
          </div>

          <CatalogNodeItem
            id="enc-plasma-hazard"
            title="Thermal Plasma Leak"
            subtitle="Hazard Field &bull; 10ft Radius &bull; 2d10 Thermal"
            badge="HAZARD"
            icon={<Flame size={14} />}
            iconColor="text-amber-500"
            dragPayload={{
              type: 'hazard',
              hazardType: 'thermal',
              radius: 120
            }}
            isVisibleToPlayers={false}
          />

          <CatalogNodeItem
            id="enc-security-squad"
            title="Synthetix Guard Drone"
            subtitle="Adversary &bull; 45 SP &bull; Armor DR 6 &bull; TL 4"
            badge="NPC"
            icon={<Swords size={14} />}
            iconColor="text-red-400"
            dragPayload={{
              type: 'npc',
              id: 'drone-guard',
              name: 'Synthetix Guard Drone',
              structure: 45,
              dr: 6,
              species: 'Synthetic',
              archetype: 'Security'
            }}
            onSpawn={() => handleDeployToken({
              id: 'drone-guard',
              name: 'Synthetix Guard Drone',
              structure: 45,
              dr: 6,
              species: 'Synthetic',
              archetype: 'Security'
            })}
            isVisibleToPlayers={false}
          />

          <CatalogNodeItem
            id="enc-elite-vanguard"
            title="Centauri Vanguard Mech"
            subtitle="Heavy Chassis &bull; 120 SP &bull; Armor DR 16 &bull; TL 6"
            badge="BOSS"
            icon={<Shield size={14} />}
            iconColor="text-purple-400"
            dragPayload={{
              type: 'npc',
              id: 'centauri-mech',
              name: 'Centauri Vanguard Mech',
              structure: 120,
              dr: 16,
              species: 'Mecha',
              archetype: 'Assault'
            }}
            onSpawn={() => handleDeployToken({
              id: 'centauri-mech',
              name: 'Centauri Vanguard Mech',
              structure: 120,
              dr: 16,
              species: 'Mecha',
              archetype: 'Assault'
            })}
            isVisibleToPlayers={false}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. FACTIONS TAXONOMY                                                  */}
      {/* ===================================================================== */}
      {activeCategory === 'factions' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1">
            Factions & Power Dynamics
          </div>

          <CatalogNodeItem
            id="fac-kitin"
            title="Kitin Collective"
            subtitle="Symbiotic Hive &bull; Standing: Neutral &bull; Power: Tier IV"
            badge="FACTION"
            icon={<Shield size={14} />}
            iconColor="text-amber-400"
            isVisibleToPlayers={true}
          />

          <CatalogNodeItem
            id="fac-syndicate"
            title="Orion Free Traders"
            subtitle="Mercantile Cartel &bull; Standing: Friendly &bull; Power: Tier III"
            badge="FACTION"
            icon={<Shield size={14} />}
            iconColor="text-cyan-400"
            isVisibleToPlayers={true}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. LORE, CLUES & HANDOUTS TAXONOMY                                    */}
      {/* ===================================================================== */}
      {activeCategory === 'lore' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Investigative Clues & Handouts</span>
            <span className="text-sky-400 font-bold">2</span>
          </div>

          <CatalogNodeItem
            id="clue-sublevel-pass"
            title="Encrypted Vault Keycard"
            subtitle="Hardware Clue &bull; Grants Level 3 Security Access"
            badge="CLUE"
            icon={<Key size={14} />}
            iconColor="text-sky-400"
            dragPayload={{
              type: 'item_clue',
              id: 'vault-keycard',
              name: 'Encrypted Vault Keycard'
            }}
            isVisibleToPlayers={false}
          />

          <CatalogNodeItem
            id="lore-station-manifest"
            title="Audio Log #402: Atmospheric Breach"
            subtitle="Epistolary Handout &bull; Station Outpost Logs"
            badge="HANDOUT"
            icon={<Scroll size={14} />}
            iconColor="text-purple-400"
            isVisibleToPlayers={true}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. COMPENDIUM ARMORY TAXONOMY                                         */}
      {/* ===================================================================== */}
      {activeCategory === 'armory' && (
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center justify-between">
            <span>Compendium Armory & Hardware</span>
            <span className="text-indigo-400 font-bold">2</span>
          </div>

          <CatalogNodeItem
            id="arm-carbine"
            title="Centauri Plasma Carbine"
            subtitle="Weapon &bull; Longarms &bull; 2d10+4 Thermal &bull; Range: Med"
            badge="WEAPON"
            icon={<Package size={14} />}
            iconColor="text-indigo-400"
            dragPayload={{
              type: 'equipment',
              id: 'plasma-carbine',
              name: 'Centauri Plasma Carbine',
              category: 'weapon'
            }}
            isVisibleToPlayers={true}
          />

          <CatalogNodeItem
            id="arm-nanoweave"
            title="Nanoweave Tactical Vest"
            subtitle="Armor &bull; +8 Kinetic DR &bull; +4 Energy DR &bull; TL 4"
            badge="ARMOR"
            icon={<Shield size={14} />}
            iconColor="text-indigo-400"
            dragPayload={{
              type: 'equipment',
              id: 'nanoweave-vest',
              name: 'Nanoweave Tactical Vest',
              category: 'armor'
            }}
            isVisibleToPlayers={true}
          />
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
