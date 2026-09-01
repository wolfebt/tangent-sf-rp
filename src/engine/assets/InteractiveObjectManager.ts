/**
 * @file InteractiveObjectManager.ts
 * @description Stage 4.1b: Interactive Stage elements linked directly to Story Foundry & Omnicortex.
 * Manages tactical map objects (doors, terminals, hazard emitters, loot crates, sensor beacons).
 * Synchronizes with BVHBuilder for dynamic line-of-sight and spatial audio occlusion.
 */

import type { SceneInteractiveObject } from './FoundryIngestion.ts';
import type { BVHBuilder } from '../vision/BVHBuilder.ts';

export interface InteractiveObjectState extends SceneInteractiveObject {
  isOpen?: boolean;
  isLocked?: boolean;
  isHacked?: boolean;
  isDestroyed?: boolean;
  bvhWallId?: string; // Links to BVH wall segment for dynamic LoS toggling
}

export class InteractiveObjectManager {
  private objects: Map<string, InteractiveObjectState> = new Map();
  private bvhBuilder: BVHBuilder | null = null;

  constructor(bvh?: BVHBuilder) {
    this.bvhBuilder = bvh || null;
  }

  public setBVHBuilder(bvh: BVHBuilder) {
    this.bvhBuilder = bvh;
  }

  /**
   * Registers a list of interactive objects from Story Foundry scene manifest
   */
  public loadObjects(objects: SceneInteractiveObject[]) {
    this.objects.clear();
    for (const obj of objects) {
      this.objects.set(obj.id, {
        ...obj,
        isOpen: false,
        isLocked: false,
        isHacked: false,
        isDestroyed: false,
        bvhWallId: obj.type === 'bulkhead' ? obj.id : undefined
      });
    }
    console.log(`[Interactive Objects] Loaded ${objects.length} Story Foundry map elements on the Stage.`);
  }

  /**
   * Interacts with an object (e.g. operative clicks a terminal or breaches a door)
   */
  public interact(id: string, operativeId: string): { success: boolean; eventType: string; data?: any } {
    const obj = this.objects.get(id);
    if (!obj) return { success: false, eventType: 'NOT_FOUND' };

    switch (obj.type) {
      case 'bulkhead': {
        const nextState = !obj.isOpen;
        obj.isOpen = nextState;
        
        // Update BVH line-of-sight occlusion
        if (this.bvhBuilder && obj.bvhWallId) {
          this.bvhBuilder.setDoorState(obj.bvhWallId, nextState);
        }

        this.emitStoryEvent('stage-bulkhead-toggled', {
          objectId: id,
          isOpen: nextState,
          operativeId,
          storyElementId: obj.storyElementId
        });

        return { success: true, eventType: 'BULKHEAD_TOGGLED', data: { isOpen: nextState } };
      }

      case 'terminal': {
        obj.isHacked = true;
        this.emitStoryEvent('story-foundry-node-triggered', {
          objectId: id,
          storyElementId: obj.storyElementId,
          operativeId,
          action: 'TERMINAL_ACCESSED'
        });

        return { success: true, eventType: 'TERMINAL_ACCESSED', data: { storyElementId: obj.storyElementId } };
      }

      case 'loot_container': {
        this.emitStoryEvent('omnicortex-loot-dispensed', {
          objectId: id,
          omnicortexGearId: obj.omnicortexGearId,
          operativeId
        });

        return { success: true, eventType: 'LOOT_RETRIEVED', data: { gearId: obj.omnicortexGearId } };
      }

      case 'hazard_emitter': {
        obj.isOpen = !obj.isOpen;
        this.emitStoryEvent('stage-hazard-toggled', {
          objectId: id,
          isActive: obj.isOpen,
          storyElementId: obj.storyElementId
        });

        return { success: true, eventType: 'HAZARD_TOGGLED', data: { isActive: obj.isOpen } };
      }

      case 'sensor_beacon': {
        this.emitStoryEvent('story-foundry-milestone-reached', {
          objectId: id,
          storyElementId: obj.storyElementId,
          operativeId
        });

        return { success: true, eventType: 'BEACON_PINGED', data: { storyElementId: obj.storyElementId } };
      }

      default:
        return { success: false, eventType: 'UNKNOWN_TYPE' };
    }
  }

  private emitStoryEvent(name: string, detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
    console.log(`[Interactive Objects] Event: ${name}`, detail);
  }

  public getObject(id: string): InteractiveObjectState | undefined {
    return this.objects.get(id);
  }

  public getAllObjects(): InteractiveObjectState[] {
    return Array.from(this.objects.values());
  }
}
