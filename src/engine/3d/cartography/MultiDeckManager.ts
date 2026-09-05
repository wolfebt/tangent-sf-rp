/**
 * @file MultiDeckManager.ts
 * @description Stage 3D: Multi-Deck & Multi-Story Architectural Slice Coordinator.
 * Manages vertical deck levels for starships, arcologies, and complexes, providing automated
 * roof cutaways, floor slicing, and elevation-aware token isolation.
 */

import * as THREE from 'three';

export interface DeckLevel {
  id: string;
  name: string;
  elevationFt: number;       // Base elevation in feet (e.g. 0, 15, 30)
  ceilingHeightFt: number;   // Story height in feet (e.g. 12)
  isRoof?: boolean;
}

export class MultiDeckManager {
  private decks: DeckLevel[] = [
    { id: 'deck_0', name: 'Deck 1: Surface / Main Deck', elevationFt: 0, ceilingHeightFt: 12 },
    { id: 'deck_1', name: 'Deck 2: Upper / Catwalks', elevationFt: 15, ceilingHeightFt: 12 },
    { id: 'deck_roof', name: 'Roof / Sky Canopy', elevationFt: 30, ceilingHeightFt: 15, isRoof: true }
  ];

  private activeDeckId: string = 'deck_0';
  private isSliceActive: boolean = true;

  constructor(customDecks?: DeckLevel[]) {
    if (customDecks && customDecks.length > 0) {
      this.decks = customDecks;
      this.activeDeckId = this.decks[0].id;
    }
  }

  public getDecks(): DeckLevel[] {
    return this.decks;
  }

  public getActiveDeck(): DeckLevel {
    return this.decks.find(d => d.id === this.activeDeckId) || this.decks[0];
  }

  public setActiveDeck(deckId: string) {
    const found = this.decks.find(d => d.id === deckId);
    if (found) {
      this.activeDeckId = deckId;
    }
  }

  public setSliceActive(active: boolean) {
    this.isSliceActive = active;
  }

  public getIsSliceActive(): boolean {
    return this.isSliceActive;
  }

  /**
   * Applies deck slice visibility to 3D scene objects based on their vertical elevation.
   * If an object's elevation is higher than the active deck ceiling, it is clipped/hidden.
   */
  public applySliceToScene(scene: THREE.Scene) {
    if (!this.isSliceActive) {
      // Show everything
      scene.traverse(obj => {
        if (obj.userData?.deckSliceable) {
          obj.visible = true;
        }
      });
      return;
    }

    const activeDeck = this.getActiveDeck();
    // 1 cell = 70 units = 5 ft -> 14 units per ft
    const unitsPerFt = 14;
    const maxVisibleAltitudeUnits = (activeDeck.elevationFt + activeDeck.ceilingHeightFt + 2) * unitsPerFt;

    scene.traverse(obj => {
      // Check if this object or its parent is sliceable
      if (obj.userData?.elevationWorld !== undefined) {
        obj.visible = obj.userData.elevationWorld <= maxVisibleAltitudeUnits;
      }
    });
  }

  /**
   * Finds which deck a given token elevation belongs to.
   */
  public getDeckForElevation(elevationFt: number): DeckLevel {
    for (let i = this.decks.length - 1; i >= 0; i--) {
      if (elevationFt >= this.decks[i].elevationFt - 1) {
        return this.decks[i];
      }
    }
    return this.decks[0];
  }
}
