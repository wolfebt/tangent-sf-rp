/**
 * @file CatalogOutliner.tsx
 * @description Master Hierarchical Outliner Tree for the Left Module Catalog.
 * Connects directly to CampaignContext, FolioContext, and Omnicortex DBM,
 * providing search filtering, visibility toggles, and drag-and-drop handles.
 */

import React from 'react';
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
  Sparkles
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
  const character = folio?.characterData;
  const storyCards = universeState?.creativeState?.storyCards || [];

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
    hp?: number;
    dr?: number;
    species?: string;
    archetype?: string;
    isPersona?: boolean;
  }) => {
    const newId = `${entity.id}-${Date.now()}`;
    const staticToken = {
      id: newId,
      character_doc_id: entity.id,
      name: entity.name,
      base_hp: entity.hp || 30,
      tech_level: 3,
      armor_dr: entity.dr || 6,
      size_modifier: 0,
      speed_ft: 30,
      species: entity.species || 'Human',
      archetype: entity.archetype || 'Operative',
      is_persona: !!entity.isPersona
    };

    useEngineStore.getState().loadStaticEntity(staticToken);
    // Deploy at default stage center
    useEngineStore.getState().updatePosition(newId, 350, 350);

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
            <span className="text-emerald-400 font-bold">1</span>
          </div>

          {character && character.name ? (
            <CatalogNodeItem
              id={character['character-doc-id'] || 'active-hero'}
              title={character.name}
              subtitle={`${character.species || 'Human'} &bull; ${character.archetype || 'Operator'} &bull; ${character['hit-points']?.max || 30} HP`}
              badge="HERO"
              icon={<Users size={14} />}
              iconColor="text-emerald-400"
              dragPayload={{
                type: 'hero',
                id: character['character-doc-id'] || 'active-hero',
                name: character.name,
                hp: character['hit-points']?.max || 30,
                dr: character['armor-dr']?.kinetic || 8,
                species: character.species,
                archetype: character.archetype,
                isPersona: true
              }}
              onSpawn={() => handleDeployToken({
                id: character['character-doc-id'] || 'hero',
                name: character.name,
                hp: character['hit-points']?.max || 30,
                dr: character['armor-dr']?.kinetic || 8,
                species: character.species,
                archetype: character.archetype,
                isPersona: true
              })}
              isVisibleToPlayers={true}
            />
          ) : (
            <div className="p-3 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
              No character loaded from Persona Folio (/folio).
            </div>
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
            subtitle="Adversary &bull; 25 HP &bull; Armor DR 6 &bull; TL 4"
            badge="NPC"
            icon={<Swords size={14} />}
            iconColor="text-red-400"
            dragPayload={{
              type: 'npc',
              id: 'drone-guard',
              name: 'Synthetix Guard Drone',
              hp: 25,
              dr: 6,
              species: 'Automaton',
              archetype: 'Security'
            }}
            onSpawn={() => handleDeployToken({
              id: 'drone-guard',
              name: 'Synthetix Guard Drone',
              hp: 25,
              dr: 6,
              species: 'Automaton',
              archetype: 'Security'
            })}
            isVisibleToPlayers={false}
          />

          <CatalogNodeItem
            id="enc-elite-vanguard"
            title="Centauri Vanguard Mech"
            subtitle="Heavy Chassis &bull; 80 HP &bull; Armor DR 16 &bull; TL 6"
            badge="BOSS"
            icon={<Shield size={14} />}
            iconColor="text-purple-400"
            dragPayload={{
              type: 'npc',
              id: 'centauri-mech',
              name: 'Centauri Vanguard Mech',
              hp: 80,
              dr: 16,
              species: 'Mecha',
              archetype: 'Assault'
            }}
            onSpawn={() => handleDeployToken({
              id: 'centauri-mech',
              name: 'Centauri Vanguard Mech',
              hp: 80,
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
            subtitle="Weapon &bull; 2 AP &bull; 2d10+4 Thermal &bull; Range: Med"
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
    </div>
  );
};

export default CatalogOutliner;
