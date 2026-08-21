# Phase 3 Implementation Plan: Cross-Module Synergy & Interactive VTT
**Project:** Tangent Science Fantasy Roleplaying Game (SFF RP)  
**Target Codebase:** [`TANGENT SF RP react project`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/)  
**Status:** Ready for Review & Implementation

---

## 1. Executive Summary

Phase 3 achieves the ultimate vision of the Tangent SFF RP platform: **seamless interoperability across all roleplaying tools** and a **live, interactive Virtual Tabletop (VTT)**. 

Instead of isolating character building, map tactical combat, and lore writing into separate silos, Phase 3 establishes real-time bridges between all systems:
1. **Folio-to-Map Token Summoning:** Characters built in Persona Folio can be dragged directly onto Map Maker grids as interactive combat tokens with live synchronized HP, AP, Defense, and Initiative.
2. **DBM 1-Click Gear Importer:** Weapons, armor, cybernetics, and psionic powers from the rules compendium can be dragged or imported directly into character sheets and scenario reward chests.
3. **`AIME-main` Consolidation:** Integrating the 10 Scenario Guide templates and the Artist Hub image synthesis engine into the core Story Foundry.
4. **Live Player Spectator Screen & Fog of War:** A dedicated player view URL for table casting or remote players with dynamic fog of war revealing and animated damage counters.

```mermaid
graph LR
    subgraph DBM ["Omnicortex (DBM)"]
        ITEM["⚔️ Weapons / Armor"]
        PSI["🔮 Psionic Powers"]
        CYBER["🦾 Cybernetics"]
    end

    subgraph FOLIO ["Persona Folio"]
        CHAR["🧙 Vance Kael (Hero)"]
        INVENTORY["🎒 Inventory & CP"]
    end

    subgraph FOUNDRY ["Story Foundry & VTT"]
        MAP["🗺️ Map Maker Canvas"]
        TOKEN["♟️ Vance Token<br/>(HP: 32/32, AP: 4)"]
        TRACKER["⚔️ Combat Tracker"]
        PLAYER["📺 Player Spectator View<br/>(Fog of War)"]
    end

    ITEM -. "1-Click Equip" .-> INVENTORY
    PSI -. "1-Click Learn" .-> INVENTORY
    CHAR ==> "Drag to Canvas" ==> TOKEN
    TOKEN <== "Two-Way HP Sync" ==> TRACKER
    MAP --> "Broadcast Visibility" --> PLAYER
```

---

## 2. Targeted Components & Files

| Feature Area | File Path | Scope of Work |
| :--- | :--- | :--- |
| **Folio-to-Map Token Summoning** | [`MapMaker.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/MapMaker/MapMaker.jsx) & [`MapToolsPanel.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/MapMaker/map/MapToolsPanel.jsx) | Add "Folio Heroes" drawer to Map Maker; dragging a hero drops a unit token with synchronized character sheet stats. |
| **Live Combat & Stats Sync** | [`MapCombatTracker.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/MapMaker/map/MapCombatTracker.jsx) | Two-way sync: changing HP or status conditions on map tokens writes back to Folio active character session state. |
| **Floating Damage & Healing FX** | `src/pages/Foundry/MapMaker/map/FloatingCombatText.jsx` *(NEW)* | Render animated damage (`-14 HP`) and healing (`+8 HP`) text floats directly above Konva canvas tokens. |
| **DBM 1-Click Item Importer** | [`DBMItemModal.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/components/DBM/DBMItemModal.jsx) & [`AddItemModal.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/components/Folio/modals/AddItemModal.jsx) | Add "Equip to Hero" and "Add to Scenario Loot" action buttons on DBM item cards with CP recalculation. |
| **10 Scenario Guide Templates** | [`elementSchemas.js`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/ElementForge/elementSchemas.js) & [`ElementForge.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/ElementForge/ElementForge.jsx) | Port the 10 adventure/encounter/NPC/dungeon templates from `AIME-main` into Element Forge. |
| **Artist Hub Visual Generator** | `src/components/StoryFoundry/ArtistHubModal.jsx` *(NEW)* | Port image generation prompt engine and style presets from `AIME-main` into Story Foundry for token and map art. |
| **Player Spectator View** | `src/pages/Foundry/MapMaker/PlayerSpectatorView.jsx` *(NEW)* & [`App.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/App.jsx) | Dedicated route `/foundry/view/:mapId` showing only player-visible tokens, lighting, and dynamic Fog of War. |
| **Dynamic Fog of War Layer** | `src/pages/Foundry/MapMaker/map/FogOfWarLayer.jsx` *(NEW)* | Konva dark overlay with eraser brush and polygon reveal tools for GM exploration management. |

---

## 3. Detailed Implementation Specifications

### 3.1. Persona Folio to Map Maker Token Summoning & Two-Way Sync

#### Implementation
1. **Hero Token Drawer in Map Maker:** Add a "Roster Heroes" tab inside [`MapToolsPanel.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/MapMaker/map/MapToolsPanel.jsx) reading directly from `FolioContext` roster.
2. **Drag-and-Drop Drop Handler:** When a hero card is dropped onto the Konva `<Stage>`:
```javascript
// Inside MapMaker.jsx
const handleDropHeroToken = (hero, stageX, stageY) => {
  const derivedHp = hero.derived_max_hp || 30;
  const derivedDefense = hero.derived_defense || 12;
  const derivedInitiative = hero.attr_agility ? Math.floor((hero.attr_agility - 10) / 2) : 0;

  const newToken = {
    id: `token_hero_${hero.id}_${Date.now()}`,
    type: 'hero',
    heroRefId: hero.id,
    name: hero.name,
    avatarUrl: hero.avatarUrl || '/assets/images/default-avatar.png',
    x: stageX,
    y: stageY,
    width: 64,
    height: 64,
    layerId: activeLayerId || 'layer_tokens',
    initiative: derivedInitiative,
    hp: {
      current: hero.current_hp !== undefined ? hero.current_hp : derivedHp,
      max: derivedHp
    },
    defense: derivedDefense,
    statusGems: hero.activeConditions || []
  };

  setTokens(prev => [...prev, newToken]);
  AudioService.playTerminalBeep(880, 0.08);
};
```
3. **Two-Way Combat Sync:** Modifying a hero token's HP in [`MapCombatTracker.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/MapMaker/map/MapCombatTracker.jsx) updates the character's active session state in `FolioContext`, preventing desynchronization between map combat and the player's sheet.

---

### 3.2. Omnicortex (DBM) 1-Click Item & Power Importer

#### Implementation
Add a quick-action drawer to [`DBMItemModal.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/components/DBM/DBMItemModal.jsx):

```javascript
// DBMItemModal.jsx addition
<div className="flex items-center gap-3 pt-4 border-t border-slate-800">
  <button
    onClick={() => handleEquipToActiveHero(activeEntry)}
    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
  >
    <span>🎒</span> Equip to Active Hero ({activeHeroName})
  </button>
  
  <button
    onClick={() => handleAddToScenarioLoot(activeEntry)}
    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
  >
    <span>💎</span> Add as Scenario Reward
  </button>
</div>
```

When equipped, the item's CP cost is checked against the character's CP budget, and the item's attack damage/range or armor value is automatically populated into [`CombatGearTab.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/components/Folio/tabs/CombatGearTab.jsx).

---

### 3.3. Consolidating `AIME-main` into Story Foundry

#### 1. Porting the 10 Scenario Guide Templates
Port the 10 modular generators from `AIME-main/src/views/ScenarioGuideView.jsx`:
- **Adventure Module, Combat Encounter, NPC Profile, Dungeon & Location, Loot & Relic, Mystery & Clue, Campaign Story Arc, Player Handout, Faction Matrix, Tactical Map Spec.**

Integrate these directly into [`elementSchemas.js`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/ElementForge/elementSchemas.js) and [`ElementForge.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Foundry/ElementForge/ElementForge.jsx) so architects can generate complete formatted modules with 1 click using Gemini Flash.

#### 2. Porting the Artist Hub Concept Art Generator
Create `src/components/StoryFoundry/ArtistHubModal.jsx` using the style preset engine from `AIME-main/src/views/ArtistHubView.jsx`:
- **Presets:** *Cinematic Dark & Moody, Cyberpunk Neon Noir, High Fantasy Oil Painting, Anime Concept Art, Photorealistic Unreal Engine 5, Gritty Comic Graphic Novel.*
- **Output:** Generated images can be directly assigned as token avatars, map background textures, or element lore illustrations.

---

### 3.4. Live Player Spectator View & Dynamic Fog of War

#### Implementation
1. **New Route in `App.jsx`:** `<Route path="/foundry/view/:mapId" element={<PlayerSpectatorView />} />`
2. **Player Screen Capabilities:**
   - Hides GM-only layers (secret traps, DM notes, hidden enemy tokens).
   - Renders **Fog of War Mask** (black Konva canvas layer covering unrevealed areas).
   - Supports **Real-Time Token Position Updates** via Firestore listener on `story_maps/{mapId}`.
   - Shows **Floating Animated Combat Text** (`-12 HP`, `CRITICAL HIT!`, `STUNNED`) when attacks occur.

```javascript
// src/pages/Foundry/MapMaker/PlayerSpectatorView.jsx
export default function PlayerSpectatorView() {
  const { mapId } = useParams();
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'story_maps', mapId), (snapshot) => {
      if (snapshot.exists()) {
        setMapData(snapshot.data());
      }
    });
    return () => unsub();
  }, [mapId]);

  if (!mapData) return <PageLoader />;

  // Filter out GM-hidden tokens
  const visibleTokens = (mapData.tokens || []).filter(t => !t.isHidden);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer id="terrain">
          {/* Render base terrain */}
        </Layer>
        <Layer id="tokens">
          {visibleTokens.map(token => (
            <TokenNode key={token.id} token={token} isPlayerView={true} />
          ))}
        </Layer>
        <Layer id="fog_of_war">
          {/* Dynamic Fog of War polygon mask */}
        </Layer>
      </Stage>
    </div>
  );
}
```

---

## 4. Verification & Testing Plan

| Verification Item | Method | Expected Outcome |
| :--- | :--- | :--- |
| **Hero Token Drag & Drop** | Drag "Vance Kael" from Folio drawer onto Map canvas at (300, 400). | Token appears with Vance's portrait, max HP (32), defense (14), and proper layer. |
| **Two-Way Combat HP Sync** | In MapCombatTracker, deal 10 damage to Vance token. Open Folio sheet. | Vance's current HP is updated from 32 to 22; damage float `-10 HP` animates on canvas. |
| **DBM 1-Click Equip** | Open "Heavy Plasma Rifle" in DBM modal; click "Equip to Vance". | Item appears in Vance's inventory; CP budget updates; attack dice populated. |
| **Scenario Guide Generation** | In Element Forge, select "Combat & Trap Encounter"; click Generate. | AIME streams structured markdown encounter with read-aloud text, DC checks, and tactics. |
| **Player Spectator View Sync** | Open GM Map Maker in Window A and `/foundry/view/:mapId` in Window B. Move token in Window A. | Token moves smoothly in Window B in real-time; hidden tokens remain invisible. |
