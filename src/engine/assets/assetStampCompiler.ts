/**
 * @file assetStampCompiler.ts
 * @description Deterministic compiler translating an AssetUnit + placement coordinates
 * into full-fidelity Tactical Map entries (objects, tokens, terrains, dynamic walls/doors,
 * custom collision hull walls, and linked dynamic light emitters).
 */

import type { AssetUnit } from '../../schemas/assetUnitSchema.ts';
import { resolveAssetStateTexture } from '../canvas/AssetCustomizerShader.ts';

export interface StampPlacementOptions {
  x: number;
  y: number;
  gridSize: number;
  mapScale?: string;
}

export interface CompiledAssetStamp {
  target: 'object' | 'token' | 'terrain' | 'wall';
  object?: Record<string, any>;
  token?: Record<string, any>;
  terrain?: Record<string, any>;
  walls: Record<string, any>[];
  lights: Record<string, any>[];
}

function makeUid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function resolveDimensionCells(unit: AssetUnit): [number, number] {
  if (Array.isArray(unit.dimensions)) {
    return [Math.max(1, Number(unit.dimensions[0]) || 1), Math.max(1, Number(unit.dimensions[1]) || 1)];
  }
  const dims = unit.dimensions as unknown as { width?: number; height?: number } | undefined;
  return [Math.max(1, Number(dims?.width) || 1), Math.max(1, Number(dims?.height) || 1)];
}

/**
 * Compiles a full AssetUnit (with VTT physics, triggers, scripts, lighting,
 * vehicle hulls, and custom collision polygons) into atomic map updates.
 */
export function compileAssetUnitStamp(
  unit: AssetUnit,
  opts: StampPlacementOptions
): CompiledAssetStamp {
  const gridSize = Math.max(10, Number(opts.gridSize) || 50);
  const [dimW, dimH] = resolveDimensionCells(unit);
  const width = dimW * gridSize;
  const height = dimH * gridSize;
  const x = Number(opts.x) || 0;
  const y = Number(opts.y) || 0;
  const imageUrl = resolveAssetStateTexture(unit);
  const vp = unit.vtt_properties || ({} as AssetUnit['vtt_properties']);
  const customization = unit.visuals?.customization;
  const stateTextures = unit.visuals?.stateTextures;

  const walls: Record<string, any>[] = [];
  const lights: Record<string, any>[] = [];

  const sourceId = makeUid(
    unit.category === 'token' || unit.category === 'creature'
      ? 'tok'
      : unit.category === 'terrain_brush'
      ? 'ter'
      : unit.category === 'wall_portal'
      ? 'portal'
      : 'obj'
  );

  // Linked dynamic light emitter (if configured)
  if (vp.dynamicLighting?.emits) {
    const [ox, oy] = vp.dynamicLighting.offsetCoords || [0.5, 0.5];
    const lightX = Math.round(x - width / 2 + ox * width);
    const lightY = Math.round(y - height / 2 + oy * height);
    const brightFt = Number(vp.dynamicLighting.radiusBrightFt ?? 10);
    const dimFt = Number(vp.dynamicLighting.radiusDimFt ?? 20);
    lights.push({
      id: makeUid('light'),
      sourceObjectId: sourceId,
      label: `${unit.name} Light`,
      x: lightX,
      y: lightY,
      color: vp.dynamicLighting.color || '#38bdf8',
      intensity: vp.dynamicLighting.intensity ?? 1.0,
      radius: Math.max(gridSize, (dimFt / 5) * gridSize),
      brightRadius: (brightFt / 5) * gridSize,
      dimRadius: (dimFt / 5) * gridSize,
      radiusBrightFt: brightFt,
      radiusDimFt: dimFt,
      castsShadows: vp.dynamicLighting.castsShadows ?? true,
      animation: vp.dynamicLighting.animation || 'solid'
    });
  }

  // Linked LoS collision hull walls (for vision-blocking assets with polygon vertices)
  if (
    vp.blocks_vision &&
    Array.isArray(vp.customCollisionPolygon) &&
    vp.customCollisionPolygon.length >= 3 &&
    unit.category !== 'wall_portal'
  ) {
    const pts = vp.customCollisionPolygon;
    const left = x - width / 2;
    const top = y - height / 2;
    for (let i = 0; i < pts.length; i++) {
      const [px1, py1] = pts[i];
      const [px2, py2] = pts[(i + 1) % pts.length];
      walls.push({
        id: makeUid('hull'),
        sourceObjectId: sourceId,
        isCollisionHull: true,
        type: 'solid',
        p1: { x: Math.round(left + px1 * width), y: Math.round(top + py1 * height) },
        p2: { x: Math.round(left + px2 * width), y: Math.round(top + py2 * height) },
        blocksLight: true,
        blocksMovement: Boolean(vp.blocks_movement)
      });
    }
  }

  // Category 1: Terrain Brush
  if (unit.category === 'terrain_brush') {
    return {
      target: 'terrain',
      terrain: {
        id: sourceId,
        unit_id: unit.unit_id,
        label: unit.name,
        name: unit.name,
        scale: opts.mapScale || 'Encounter',
        renderType: 'canvasImage',
        x: Math.round(x - width / 2),
        y: Math.round(y - height / 2),
        width,
        height,
        imageUrl,
        textureUrl: imageUrl,
        visualCustomization: customization,
        stateTextures,
        auto_tile: unit.visuals?.auto_tile || 'none',
        material: vp.terrain?.material || 'metal_deck',
        movementCost: vp.terrain?.movementCost ?? 1,
        slipperyFriction: vp.terrain?.slipperyFriction ?? 1,
        footstepSfxCategory: vp.terrain?.footstepSfxCategory || 'footstep_metal',
        elevationOffsetFt: vp.terrain?.elevationOffsetFt,
        blocksMovement: Boolean(vp.blocks_movement),
        blocksVision: Boolean(vp.blocks_vision),
        assetUnit: unit
      },
      walls,
      lights
    };
  }

  // Category 2: Token / Creature
  if (unit.category === 'token' || unit.category === 'creature') {
    const te = vp.tokenEntity;
    return {
      target: 'token',
      token: {
        id: sourceId,
        assetUnitId: unit.unit_id,
        name: unit.name,
        label: unit.name,
        type: te?.disposition === 'friendly' ? 'hero' : 'npc',
        x,
        y,
        width,
        height,
        radius: Math.max(20, Math.min(width, height) / 2),
        imageUrl,
        avatarUrl: imageUrl,
        visualCustomization: customization,
        stateTextures,
        sizeCategory: te?.sizeCategory || 'Medium',
        visionRange: te?.visionCone?.rangeFt ?? 60,
        visionType: te?.visionCone?.type || 'standard',
        visionArcDegrees: te?.visionCone?.arcDegrees ?? 360,
        disposition: te?.disposition || (unit.category === 'creature' ? 'hostile' : 'neutral'),
        standeeElevationHeight3d: te?.standeeElevationHeight3d,
        blocksMovement: Boolean(vp.blocks_movement),
        blocksVision: Boolean(vp.blocks_vision),
        vtt_properties: vp,
        assetUnit: unit
      },
      walls,
      lights
    };
  }

  // Category 3: Wall / Portal
  if (unit.category === 'wall_portal') {
    const wp = vp.wallPortal;
    const isDoor = Boolean(wp?.isDoor);
    const doorState = wp?.doorState || 'closed';
    walls.push({
      id: makeUid('wall'),
      sourceObjectId: sourceId,
      unit_id: unit.unit_id,
      label: unit.name,
      p1: { x: Math.round(x - width / 2), y },
      p2: { x: Math.round(x + width / 2), y },
      wallType: wp?.wallType || 'solid_titanium',
      type: isDoor ? 'door' : (wp?.blocksLight === false ? 'window' : 'solid'),
      isDoor,
      isDynamic: isDoor,
      doorType: wp?.doorType || (isDoor ? 'sliding' : undefined),
      doorState: isDoor ? doorState : undefined,
      isOpen: isDoor ? doorState === 'open' : false,
      blocksLight: wp?.blocksLight ?? vp.blocks_vision ?? true,
      blocksSensors: wp?.blocksSensors ?? true,
      blocksMovement: wp?.blocksMovement ?? vp.blocks_movement ?? true,
      soundMuffleFactor: wp?.soundMuffleFactor ?? 0.8
    });

    return {
      target: 'wall',
      object: imageUrl
        ? {
            id: sourceId,
            unit_id: unit.unit_id,
            name: unit.name,
            label: unit.name,
            category: unit.category,
            type: 'wall_portal',
            x,
            y,
            width,
            height,
            imageUrl,
            visualCustomization: customization,
            stateTextures,
            blocks_movement: wp?.blocksMovement ?? vp.blocks_movement ?? true,
            blocks_vision: wp?.blocksLight ?? vp.blocks_vision ?? true,
            z_index_layer: vp.z_index_layer || 'interactive_objects',
            wallPortal: wp,
            trigger: vp.trigger?.enabled ? vp.trigger : undefined,
            script: vp.script?.enabled ? vp.script : undefined,
            assetUnit: unit
          }
        : undefined,
      walls,
      lights
    };
  }

  // Category 4: Doodad, Hazard, Vehicle
  const triggerEnabled = Boolean(vp.trigger?.enabled);
  const isHazard = unit.category === 'hazard' || Boolean(vp.hazard);
  const isVehicle = unit.category === 'vehicle' || Boolean(vp.vehicleHull);

  const compiledObj: Record<string, any> = {
    id: sourceId,
    unit_id: unit.unit_id,
    name: unit.name,
    label: unit.name,
    category: unit.category,
    type: isVehicle ? 'vehicle' : (isHazard ? 'hazard' : 'doodad'),
    x,
    y,
    width,
    height,
    imageUrl,
    visualCustomization: customization,
    stateTextures,
    blocks_movement: Boolean(vp.blocks_movement),
    blocks_vision: Boolean(vp.blocks_vision),
    z_index_layer: vp.z_index_layer || 'interactive_objects',
    customCollisionPolygon: vp.customCollisionPolygon,
    vtt_properties: vp,
    assetUnit: unit
  };

  if (vp.doodad) {
    compiledObj.cover = vp.doodad.cover;
    compiledObj.coverRating = vp.doodad.cover;
    compiledObj.isDestructible = vp.doodad.isDestructible;
    if (vp.doodad.structureHp !== undefined) {
      compiledObj.structureHp = vp.doodad.structureHp;
      compiledObj.maxStructureHp = vp.doodad.structureHp;
    }
    if (vp.doodad.armorDr) compiledObj.armorDr = vp.doodad.armorDr;
    if (vp.doodad.breakDc !== undefined) compiledObj.breakDc = vp.doodad.breakDc;
    compiledObj.isContainer = vp.doodad.isContainer;
    if (vp.doodad.containerDetails) compiledObj.containerDetails = vp.doodad.containerDetails;
    if (vp.doodad.interactionTrigger) compiledObj.interactionTrigger = vp.doodad.interactionTrigger;
  }

  if (isHazard) {
    compiledObj.isHazard = true;
    compiledObj.hazard = vp.hazard?.damageFormula || '2d10+4 plasma';
    compiledObj.hazardType = vp.hazard?.hazardType || 'plasma_leak';
    compiledObj.damageFormula = vp.hazard?.damageFormula || '2d10+4 plasma';
    compiledObj.triggerTiming = vp.hazard?.triggerTiming || 'on_enter';
    if (vp.hazard?.saveDc) compiledObj.saveDc = vp.hazard.saveDc;
  }

  if (isVehicle && vp.vehicleHull) {
    compiledObj.isVehicle = true;
    compiledObj.vehicleHull = vp.vehicleHull;
    compiledObj.passengerNodes = vp.vehicleHull.passengerNodes || [];
    compiledObj.hardpointSockets = vp.vehicleHull.hardpointSockets || [];
    compiledObj.structureMaxHp = vp.vehicleHull.structureMaxHp;
  }

  if (triggerEnabled && vp.trigger) {
    compiledObj.isTrap = true;
    compiledObj.trigger = { ...vp.trigger };
    compiledObj.disarmDc = vp.trigger.disarmDc;
    compiledObj.detectionDc = vp.trigger.detectionDc;
  }

  if (vp.script?.enabled && vp.script) {
    compiledObj.script = { ...vp.script };
  }

  return {
    target: 'object',
    object: compiledObj,
    walls,
    lights
  };
}
