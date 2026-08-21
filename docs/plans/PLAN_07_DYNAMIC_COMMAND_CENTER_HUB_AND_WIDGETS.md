# Plan 07: Dynamic Command Center Hub (`Home.jsx`) & Operational Widgets

**Module:** Game Hub / Home Dashboard  
**Target Codebase:** [`TANGENT SF RP react project`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/)  
**Primary File:** [`src/pages/Home.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Home.jsx)  
**New Components:**  
- `src/components/Hub/ActiveCampaignWidget.jsx`  
- `src/components/Hub/PartyStatusWidget.jsx`  
- `src/components/Hub/TransmissionFeed.jsx`  
- `src/components/Hub/ModuleLauncherCard.jsx`  
**Complexity:** High  
**Status:** Implementation Ready

---

## 1. Problem Statement & Modernization Goals

The current [`Home.jsx`](file:///d:/_ Data/Tangent SF RP/TANGENT SF RP react project/src/pages/Home.jsx) is a static launchpad with three generic buttons and no contextual roleplay data. 

### Modernization Goals:
1. **At-A-Glance Vitals:** Display active campaign mission objectives, tactical location, next session countdown, and party HP bars.
2. **Actionable Immersion:** Provide a 1-click "Resume Mission" button that jumps directly to the active scenario or tactical map.
3. **Live Activity Stream:** Stream recent dice rolls, AIME brainstormed idea cards, and compendium updates directly into a cyberpunk terminal transmission feed.

---

## 2. Visual Layout & Component Topology

```
+----------------------------------------------------------------------------------------------------+
|  [GLOBAL HUD: TANGENT SFF RP]              [🔍 Search Ctrl+K]               [🎲 Dice Alt+D] [@User] |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   ACTIVE MISSION OPS                                          PARTY VITALS (4 Active Heroes)       |
|   ┌──────────────────────────────────────────────┐            ┌──────────────────────────────────┐ |
|   │ 🎯 Mission: Infiltrate Sub-Level 4           │            │ 🛡️ Vance Kael   HP: [████████]   │ |
|   │ 📍 Sector: Vesper Orbital Station            │            │ ⚡ Lyra Nova    HP: [████░░░░]   │ |
|   │ ⏳ Next Session: Saturday @ 7:00 PM EST      │            │ 🤖 Unit-09      HP: [████████]   │ |
|   │ [ ▶ RESUME TACTICAL VTT ] [ 📝 STORY TREE ]  │            │ [ 📜 Open Folio Sheet ]          │ |
|   └──────────────────────────────────────────────┘            └──────────────────────────────────┘ |
|                                                                                                    |
|   CORE LAUNCHERS (Real-time Live Badges)                      TRANSMISSION & LOG FEED              |
|   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐       ┌──────────────────────────────────┐ |
|   │   OMNICORTEX  │ │ PERSONA FOLIO │ │ STORY FOUNDRY │       │ ⚔️ Lyra rolled 2d10+3 = 19 (Crit)│ |
|   │  Rules & DBM  │ │ Hero Builder  │ │ VTT & Maps    │       │ 🗺️ Map "Vesper Station" updated  │ |
|   │  1,420 Items  │ │ 8 Characters  │ │ 12 Scenarios  │       │ 💡 AIME generated 3 Scene Beats  │ |
|   └───────────────┘ └───────────────┘ └───────────────┘       └──────────────────────────────────┘ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Technical Specifications

### 3.1. Active Campaign Widget (`src/components/Hub/ActiveCampaignWidget.jsx`)

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MapPin, Play, Calendar, ShieldAlert } from 'lucide-react';
import { useStory } from '../../context/CampaignContext';

export const ActiveCampaignWidget = () => {
  const navigate = useNavigate();
  const { universeState, mapsCatalog } = useStory();

  const activeStoryTitle = universeState?.title || 'No Active Campaign';
  const activeScenarios = universeState?.scenarios || [];
  const currentScenario = activeScenarios[0] || null;
  const activeMap = (mapsCatalog || [])[0] || null;

  return (
    <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors"></div>

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="text-cyan-400" size={18} />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold">
              ACTIVE CAMPAIGN OPS
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
            ACTIVE SESSION
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-bold text-white tracking-wide truncate">
            {activeStoryTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin size={14} className="text-amber-400" />
            <span>Target Node: {currentScenario ? currentScenario.title : 'Sector Recon Alpha'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={14} className="text-slate-500" />
            <span>Next Briefing: Scheduled by Architect</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => navigate(activeMap ? `/foundry/map-maker?mapId=${activeMap.id}` : '/foundry/map-maker')}
          className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        >
          <Play size={14} fill="currentColor" /> Resume Tactical VTT
        </button>
        <button
          onClick={() => navigate('/foundry/story')}
          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
        >
          Story Tree
        </button>
      </div>
    </div>
  );
};
```

---

### 3.2. Party Status Widget (`src/components/Hub/PartyStatusWidget.jsx`)

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Zap, Shield, ChevronRight } from 'lucide-react';
import { useFolio } from '../../context/FolioContext';

export const PartyStatusWidget = () => {
  const navigate = useNavigate();
  const { roster } = useFolio();

  const activeHeroes = (roster || []).slice(0, 4);

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="text-amber-400" size={18} />
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
              PARTY AT A GLANCE ({activeHeroes.length} HEROES)
            </span>
          </div>
          <button
            onClick={() => navigate('/folio')}
            className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Folio <ChevronRight size={12} />
          </button>
        </div>

        {/* Hero Cards List */}
        <div className="mt-3 space-y-2.5">
          {activeHeroes.length === 0 ? (
            <div className="text-xs text-slate-500 italic text-center py-6">
              No hero personas registered.<br />Create a character in Persona Folio.
            </div>
          ) : (
            activeHeroes.map((hero) => {
              const maxHp = hero.derived_max_hp || 30;
              const curHp = hero.current_hp !== undefined ? hero.current_hp : maxHp;
              const hpPercent = Math.max(0, Math.min(100, Math.round((curHp / maxHp) * 100)));
              const hpColor = hpPercent <= 25 ? 'bg-red-500' : (hpPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500');

              return (
                <div 
                  key={hero.id}
                  onClick={() => navigate(`/folio?charId=${hero.id}`)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-300">
                      {hero.name ? hero.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                        {hero.name || 'Unnamed Hero'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {hero.species || 'Human'} • Lv.{hero.level || 1}
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="w-28 flex flex-col items-end gap-1">
                    <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400">
                      <span>HP</span>
                      <span className="text-slate-200 font-bold">{curHp}/{maxHp}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${hpColor} transition-all duration-300`} style={{ width: `${hpPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### 3.3. Transmission & Activity Feed (`src/components/Hub/TransmissionFeed.jsx`)

```jsx
import React from 'react';
import { Activity, Dices, Sparkles, BookOpen, Clock } from 'lucide-react';

export const TransmissionFeed = ({ recentActivities = [] }) => {
  const defaultFeed = [
    { id: '1', type: 'roll', text: 'Lyra Nova rolled 2d10+4 = 19 (Critical Success)', time: '10m ago' },
    { id: '2', type: 'story', text: 'Scenario "Sub-level Infiltration" updated by Architect', time: '1h ago' },
    { id: '3', type: 'aime', text: 'AIME generated 3 new Scene Beats for Act II', time: '3h ago' },
    { id: '4', type: 'system', text: 'Omnicortex rules database synced to version 2.4', time: '1d ago' }
  ];

  const feedItems = recentActivities.length > 0 ? recentActivities : defaultFeed;

  const getIcon = (type) => {
    switch (type) {
      case 'roll': return <Dices size={14} className="text-amber-400" />;
      case 'aime': return <Sparkles size={14} className="text-purple-400" />;
      case 'story': return <BookOpen size={14} className="text-cyan-400" />;
      default: return <Activity size={14} className="text-emerald-400" />;
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 h-full flex flex-col">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Activity className="text-emerald-400" size={18} />
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
          TRANSMISSION & EVENT STREAM
        </span>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1">
        {feedItems.map((item) => (
          <div key={item.id} className="p-2 rounded bg-slate-900/40 border border-slate-800/50 flex items-start gap-2.5 text-xs">
            <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
            <div className="flex-1">
              <p className="text-slate-300 leading-tight">{item.text}</p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 4. Verification & Testing Protocol

| Test Case | Method | Expected Result |
| :--- | :--- | :--- |
| **Active Campaign 1-Click Launch** | Click "Resume Tactical VTT" on Home widget. | Navigates directly to `/foundry/map-maker` with active map loaded. |
| **Hero Health Reflection** | Modify hero HP in Folio sheet; return to Home. | `PartyStatusWidget` reflects updated numeric and percentage health bar. |
| **Transmission Feed Auto-Append** | Roll dice using the Dice Roller dock. | New roll transmission entry prepends to the top of the event stream. |
| **Responsive Grid Wrap** | Test on 1024px tablet and 375px mobile screens. | 4-column dashboard smoothly restructures into 2-column then 1-column stack. |
