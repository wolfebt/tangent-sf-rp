/**
 * @file WidgetRegistry.ts
 * @description Universal Glass Cockpit Widget Registry.
 * Wraps every dockable widget in a WidgetErrorBoundary and provides a unified catalog
 * spanning tactical widgets, operational decks, and all 19 Story Foundry modals.
 */

import React, { lazy, Suspense } from 'react';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { ContextActionBar } from './widgets/ContextActionBar';
import { CombatTrackerWidget } from './widgets/CombatTrackerWidget';
import { MechaFoundryWidget } from './widgets/MechaFoundryWidget';
import { 
  Crosshair, 
  Swords, 
  Cpu, 
  Clock, 
  Globe, 
  Rocket, 
  DollarSign, 
  HelpCircle, 
  Terminal,
  Activity
} from 'lucide-react';

export type WidgetCategory = 'tactical' | 'character' | 'story' | 'foundry' | 'tools';

export interface IWidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
  minSize: { minW: number; minH: number };
}

// Lazy load heavy Story Foundry modals for fast initial load
const LazyFactionClocks = lazy(() => import('../../components/StoryFoundry/FactionClocksModal.jsx'));
const LazyGalaxyStarmap = lazy(() => import('../../components/StoryFoundry/GalaxyStarmapModal.jsx'));
const LazyModularStarshipForge = lazy(() => import('../../components/StoryFoundry/ModularStarshipForgeModal.jsx'));
const LazyCyberDeck = lazy(() => import('../../components/StoryFoundry/CyberDeckModal.jsx'));
const LazyEconomatrixLoot = lazy(() => import('../../components/StoryFoundry/EconomatrixLootGeneratorModal.jsx'));
const LazyStoryFoundryGuide = lazy(() => import('../../components/StoryFoundry/StoryFoundryGuideModal.jsx'));
const LazyEncounterSim = lazy(() => import('../../components/StoryFoundry/EncounterSimModal.jsx'));

// Helper to wrap lazy components in Suspense + Error Boundary
function wrapLazyWidget(LazyComponent: React.ComponentType<any>, widgetId: string, widgetTitle: string) {
  return function WrappedWidget(props: any) {
    return (
      <WidgetErrorBoundary widgetId={widgetId} widgetTitle={widgetTitle}>
        <Suspense fallback={
          <div className="w-full h-full p-4 flex items-center justify-center font-mono text-xs text-cyan-400 bg-slate-950/80 animate-pulse">
            INITIALIZING SUBSYSTEM: {widgetTitle}...
          </div>
        }>
          <LazyComponent {...props} isOpen={true} />
        </Suspense>
      </WidgetErrorBoundary>
    );
  };
}

class UniversalWidgetRegistry {
  private registry = new Map<string, IWidgetDefinition>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // 1. Tactical Context Action Bar
    this.register({
      id: 'context_action_bar',
      title: 'Context Action Bar',
      description: '4-AP tactical weapon macros, called shots, and essence actions.',
      category: 'tactical',
      icon: Crosshair,
      component: (props) => (
        <WidgetErrorBoundary widgetId="context_action_bar" widgetTitle="Context Action Bar">
          <ContextActionBar {...props} />
        </WidgetErrorBoundary>
      ),
      defaultSize: { w: 6, h: 4 },
      minSize: { minW: 4, minH: 3 }
    });

    // 2. Combat Tracker
    this.register({
      id: 'combat_tracker',
      title: 'Tactical Initiative & Degradation',
      description: 'Turn order, 4-AP economy reset, sustained essence drain, and round-end degradation.',
      category: 'tactical',
      icon: Swords,
      component: (props) => (
        <WidgetErrorBoundary widgetId="combat_tracker" widgetTitle="Tactical Initiative">
          <CombatTrackerWidget {...props} />
        </WidgetErrorBoundary>
      ),
      defaultSize: { w: 4, h: 8 },
      minSize: { minW: 3, minH: 6 }
    });

    // 3. Mecha & Modular Sockets
    this.register({
      id: 'mecha_foundry',
      title: 'Mecha & Socket Matrix',
      description: 'Hardpoint slotting, heat dissipation vs buildup, shield capacitor rerouting.',
      category: 'character',
      icon: Cpu,
      component: (props) => (
        <WidgetErrorBoundary widgetId="mecha_foundry" widgetTitle="Mecha Sockets">
          <MechaFoundryWidget {...props} />
        </WidgetErrorBoundary>
      ),
      defaultSize: { w: 5, h: 8 },
      minSize: { minW: 4, minH: 6 }
    });

    // 4. Faction Clocks (Story Foundry)
    this.register({
      id: 'faction_clocks',
      title: 'Faction Clocks & Progress',
      description: 'Track ticking conspiratorial countdowns, syndicate heists, and empire mobilization.',
      category: 'story',
      icon: Clock,
      component: wrapLazyWidget(LazyFactionClocks, 'faction_clocks', 'Faction Clocks'),
      defaultSize: { w: 6, h: 8 },
      minSize: { minW: 4, minH: 6 }
    });

    // 5. Galaxy Starmap
    this.register({
      id: 'galaxy_starmap',
      title: 'Galaxy Starmap & Hyperlanes',
      description: 'Sector navigation, planetary orbits, warp routes, and astronomical anomalies.',
      category: 'story',
      icon: Globe,
      component: wrapLazyWidget(LazyGalaxyStarmap, 'galaxy_starmap', 'Galaxy Starmap'),
      defaultSize: { w: 8, h: 10 },
      minSize: { minW: 5, minH: 8 }
    });

    // 6. Modular Starship Forge
    this.register({
      id: 'starship_forge',
      title: 'Modular Starship Forge',
      description: 'Naval vessel layout, deckplans, spinal mounts, sub-light drives, and reactor bays.',
      category: 'foundry',
      icon: Rocket,
      component: wrapLazyWidget(LazyModularStarshipForge, 'starship_forge', 'Modular Starship Forge'),
      defaultSize: { w: 7, h: 9 },
      minSize: { minW: 5, minH: 7 }
    });

    // 7. CyberDeck Terminal
    this.register({
      id: 'cyberdeck_terminal',
      title: 'CyberDeck ICE Terminal',
      description: 'Infiltration deck, firewall slicing, intrusive daemons, and system nodes.',
      category: 'tools',
      icon: Terminal,
      component: wrapLazyWidget(LazyCyberDeck, 'cyberdeck_terminal', 'CyberDeck ICE Terminal'),
      defaultSize: { w: 6, h: 8 },
      minSize: { minW: 4, minH: 6 }
    });

    // 8. Economatrix Loot Generator
    this.register({
      id: 'economatrix_loot',
      title: 'Economatrix Salvage & Loot',
      description: 'Algorithmic procedural salvage tables, Tech Level artifacts, and black-market pricing.',
      category: 'tools',
      icon: DollarSign,
      component: wrapLazyWidget(LazyEconomatrixLoot, 'economatrix_loot', 'Economatrix Loot'),
      defaultSize: { w: 5, h: 7 },
      minSize: { minW: 4, minH: 6 }
    });

    // 9. Encounter Simulator
    this.register({
      id: 'encounter_sim',
      title: 'Encounter Tension Simulator',
      description: 'Real-time difficulty curves, adversary lethality projections, and tactical pacing.',
      category: 'tactical',
      icon: Activity,
      component: wrapLazyWidget(LazyEncounterSim, 'encounter_sim', 'Encounter Simulator'),
      defaultSize: { w: 6, h: 8 },
      minSize: { minW: 4, minH: 6 }
    });

    // 10. ADE Studio Guide
    this.register({
      id: 'foundry_guide',
      title: 'ADE Studio System Guide',
      description: 'Interactive architectural manual, system mechanics, and quick reference.',
      category: 'story',
      icon: HelpCircle,
      component: wrapLazyWidget(LazyStoryFoundryGuide, 'foundry_guide', 'ADE Studio Guide'),
      defaultSize: { w: 6, h: 9 },
      minSize: { minW: 4, minH: 6 }
    });
  }

  public register(definition: IWidgetDefinition): void {
    this.registry.set(definition.id, definition);
  }

  public get(id: string): IWidgetDefinition | undefined {
    return this.registry.get(id);
  }

  public getAll(): IWidgetDefinition[] {
    return Array.from(this.registry.values());
  }

  public getByCategory(category: WidgetCategory): IWidgetDefinition[] {
    return this.getAll().filter(w => w.category === category);
  }
}

export const WidgetRegistry = new UniversalWidgetRegistry();
export default WidgetRegistry;
