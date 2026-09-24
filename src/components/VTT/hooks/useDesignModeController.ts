/**
 * @file useDesignModeController.ts
 * @description Hook managing In-Situ Architect Design Mode, tool states, and synchronization with uiLayoutStore.
 */

import { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import { useUILayoutStore } from '../store/uiLayoutStore';
import type { ArchitectDesignTool, PaletteItem } from '../ArchitectDesignPalette';
import type { LightAnimationType } from '../../../engine/vision/LightSourceManager';

export interface UseDesignModeControllerReturn {
  isDesignModeActive: boolean;
  setIsDesignModeActive: React.Dispatch<React.SetStateAction<boolean>>;
  activeDesignTool: ArchitectDesignTool;
  setActiveDesignTool: React.Dispatch<React.SetStateAction<ArchitectDesignTool>>;
  selectedStamp: PaletteItem | null;
  setSelectedStamp: React.Dispatch<React.SetStateAction<PaletteItem | null>>;

  // Multi-Asset Selection & Transform Gizmo States
  selectedAssetIds: string[];
  setSelectedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  isMarqueeActive: boolean;
  setIsMarqueeActive: React.Dispatch<React.SetStateAction<boolean>>;
  marqueeStart: { x: number; y: number } | null;
  setMarqueeStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  marqueeCurrent: { x: number; y: number } | null;
  setMarqueeCurrent: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;

  // Geometric Wall Construction Modes ('single' | 'chain' | 'room')
  wallConstructionMode: 'single' | 'chain' | 'room';
  setWallConstructionMode: React.Dispatch<React.SetStateAction<'single' | 'chain' | 'room'>>;
  wallChainPoints: { x: number; y: number }[];
  setWallChainPoints: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;

  // Design Tool Sub-options
  selectedWallType: string;
  setSelectedWallType: React.Dispatch<React.SetStateAction<string>>;
  doorLockDc: number;
  setDoorLockDc: React.Dispatch<React.SetStateAction<number>>;
  selectedTerrainId: string;
  setSelectedTerrainId: React.Dispatch<React.SetStateAction<string>>;
  terrainBrushWidth: number;
  setTerrainBrushWidth: React.Dispatch<React.SetStateAction<number>>;
  terrainRenderMode: 'organic' | 'hex';
  setTerrainRenderMode: React.Dispatch<React.SetStateAction<'organic' | 'hex'>>;
  pencilColor: string;
  setPencilColor: React.Dispatch<React.SetStateAction<string>>;
  pencilWidth: number;
  setPencilWidth: React.Dispatch<React.SetStateAction<number>>;
  textLabelInput: string;
  setTextLabelInput: React.Dispatch<React.SetStateAction<string>>;
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  textSize: number;
  setTextSize: React.Dispatch<React.SetStateAction<number>>;
  rulerAvailableAp: number;
  setRulerAvailableAp: React.Dispatch<React.SetStateAction<number>>;

  // Lighting
  selectedLightColor: string;
  setSelectedLightColor: React.Dispatch<React.SetStateAction<string>>;
  selectedLightRadius: number;
  setSelectedLightRadius: React.Dispatch<React.SetStateAction<number>>;
  selectedLightAnimation: LightAnimationType;
  setSelectedLightAnimation: React.Dispatch<React.SetStateAction<LightAnimationType>>;

  // Randomization Jitter States
  randomizeRotation: boolean;
  setRandomizeRotation: React.Dispatch<React.SetStateAction<boolean>>;
  randomizeScale: boolean;
  setRandomizeScale: React.Dispatch<React.SetStateAction<boolean>>;

  // Interactive Canvas Drawing States
  isDrawingToolActive: boolean;
  setIsDrawingToolActive: React.Dispatch<React.SetStateAction<boolean>>;
  wallDrawStart: { x: number; y: number } | null;
  setWallDrawStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  wallDrawCurrent: { x: number; y: number } | null;
  setWallDrawCurrent: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  currentStrokePoints: number[];
  setCurrentStrokePoints: React.Dispatch<React.SetStateAction<number[]>>;
}

export function useDesignModeController(): UseDesignModeControllerReturn {
  // Store values
  const activeArchitectTool = useUILayoutStore(s => s.activeArchitectTool);
  const userRole = useUILayoutStore(s => s.userRole);
  const storeWallType = useUILayoutStore(s => s.selectedWallType);
  const storeDoorLockDc = useUILayoutStore(s => s.doorLockDc);
  const storeTerrain = useUILayoutStore(s => s.selectedTerrain);
  const storeTerrainBrushWidth = useUILayoutStore(s => s.terrainBrushWidth);
  const storeObjectType = useUILayoutStore(s => s.selectedObjectType);
  const storeLightColor = useUILayoutStore(s => s.selectedLightColor);
  const storeLightRadius = useUILayoutStore(s => s.selectedLightRadius);
  const storeLightAnimation = useUILayoutStore(s => s.selectedLightAnimation);
  const storePencilColor = useUILayoutStore(s => s.pencilColor);
  const storePencilWidth = useUILayoutStore(s => s.pencilWidth);
  const storeRulerAp = useUILayoutStore(s => s.rulerAvailableAp);

  // In-Situ Architect Design Mode & Tool States
  const [isDesignModeActive, setIsDesignModeActive] = useState<boolean>(false);
  const [activeDesignTool, setActiveDesignTool] = useState<ArchitectDesignTool>('select');
  const [selectedStamp, setSelectedStamp] = useState<PaletteItem | null>(null);

  // Multi-Asset Selection & Transform Gizmo States
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isMarqueeActive, setIsMarqueeActive] = useState<boolean>(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);

  // Geometric Wall Construction Modes ('single' | 'chain' | 'room')
  const [wallConstructionMode, setWallConstructionMode] = useState<'single' | 'chain' | 'room'>('single');
  const [wallChainPoints, setWallChainPoints] = useState<{ x: number; y: number }[]>([]);

  // Design Tool Sub-options
  const [selectedWallType, setSelectedWallType] = useState<string>('solid');
  const [doorLockDc, setDoorLockDc] = useState<number>(14);
  const [selectedTerrainId, setSelectedTerrainId] = useState<string>('grassland');
  const [terrainBrushWidth, setTerrainBrushWidth] = useState<number>(30);
  const [terrainRenderMode, setTerrainRenderMode] = useState<'organic' | 'hex'>('organic');
  const [pencilColor, setPencilColor] = useState<string>('#22d3ee');
  const [pencilWidth, setPencilWidth] = useState<number>(4);
  const [textLabelInput, setTextLabelInput] = useState<string>('Sector Alpha');
  const [textColor, setTextColor] = useState<string>('#22d3ee');
  const [textSize, setTextSize] = useState<number>(20);
  const [rulerAvailableAp, setRulerAvailableAp] = useState<number>(4);

  // Lighting
  const [selectedLightColor, setSelectedLightColor] = useState<string>('#f59e0b');
  const [selectedLightRadius, setSelectedLightRadius] = useState<number>(180);
  const [selectedLightAnimation, setSelectedLightAnimation] = useState<LightAnimationType>('flicker');

  // Randomization Jitter States
  const [randomizeRotation, setRandomizeRotation] = useState<boolean>(false);
  const [randomizeScale, setRandomizeScale] = useState<boolean>(false);

  // Interactive Canvas Drawing States
  const [isDrawingToolActive, setIsDrawingToolActive] = useState<boolean>(false);
  const [wallDrawStart, setWallDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [wallDrawCurrent, setWallDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<number[]>([]);

  // Synchronize active architect tool from Right Rail with WebGPU canvas
  useEffect(() => {
    if (activeArchitectTool) {
      setActiveDesignTool(activeArchitectTool as ArchitectDesignTool);
      if (activeArchitectTool !== 'select' || userRole === 'architect') {
        setIsDesignModeActive(true);
      }
    }
  }, [activeArchitectTool, userRole]);

  useEffect(() => {
    if (storeWallType) setSelectedWallType(storeWallType);
  }, [storeWallType]);

  useEffect(() => {
    if (storeDoorLockDc !== undefined) setDoorLockDc(storeDoorLockDc);
  }, [storeDoorLockDc]);

  useEffect(() => {
    if (storeTerrain) setSelectedTerrainId(storeTerrain);
  }, [storeTerrain]);

  useEffect(() => {
    if (storeTerrainBrushWidth !== undefined) setTerrainBrushWidth(storeTerrainBrushWidth);
  }, [storeTerrainBrushWidth]);

  useEffect(() => {
    if (storeLightColor) setSelectedLightColor(storeLightColor);
  }, [storeLightColor]);

  useEffect(() => {
    if (storeLightRadius !== undefined) setSelectedLightRadius(storeLightRadius);
  }, [storeLightRadius]);

  useEffect(() => {
    if (storeLightAnimation) setSelectedLightAnimation(storeLightAnimation as LightAnimationType);
  }, [storeLightAnimation]);

  useEffect(() => {
    if (storePencilColor) setPencilColor(storePencilColor);
  }, [storePencilColor]);

  useEffect(() => {
    if (storePencilWidth !== undefined) setPencilWidth(storePencilWidth);
  }, [storePencilWidth]);

  useEffect(() => {
    if (storeObjectType && typeof storeObjectType === 'object') {
      const propObj = storeObjectType as any;
      const stampItem: PaletteItem = {
        id: propObj.id || `obj-${Date.now()}`,
        category: propObj.category || 'Objects',
        label: propObj.label || propObj.name || 'Prop',
        desc: propObj.desc || 'Tactical Sector Asset',
        type: propObj.category === 'Hazards' ? 'hazard' : 'object',
        subType: propObj.category || 'terminal',
        icon: Box,
        color: propObj.color || '#22d3ee',
        defaultProps: {
          name: propObj.label || propObj.name || 'Prop',
          color: propObj.color,
          radius: propObj.radius,
          width: propObj.width,
          height: propObj.height,
          shape: propObj.shape,
          imageUrl: propObj.imageUrl
        }
      };
      setSelectedStamp(stampItem);
      setIsDesignModeActive(true);
    }
  }, [storeObjectType]);

  useEffect(() => {
    if (storeRulerAp !== undefined) setRulerAvailableAp(storeRulerAp);
  }, [storeRulerAp]);

  return {
    isDesignModeActive,
    setIsDesignModeActive,
    activeDesignTool,
    setActiveDesignTool,
    selectedStamp,
    setSelectedStamp,
    selectedAssetIds,
    setSelectedAssetIds,
    isMarqueeActive,
    setIsMarqueeActive,
    marqueeStart,
    setMarqueeStart,
    marqueeCurrent,
    setMarqueeCurrent,
    wallConstructionMode,
    setWallConstructionMode,
    wallChainPoints,
    setWallChainPoints,
    selectedWallType,
    setSelectedWallType,
    doorLockDc,
    setDoorLockDc,
    selectedTerrainId,
    setSelectedTerrainId,
    terrainBrushWidth,
    setTerrainBrushWidth,
    terrainRenderMode,
    setTerrainRenderMode,
    pencilColor,
    setPencilColor,
    pencilWidth,
    setPencilWidth,
    textLabelInput,
    setTextLabelInput,
    textColor,
    setTextColor,
    textSize,
    setTextSize,
    rulerAvailableAp,
    setRulerAvailableAp,
    selectedLightColor,
    setSelectedLightColor,
    selectedLightRadius,
    setSelectedLightRadius,
    selectedLightAnimation,
    setSelectedLightAnimation,
    randomizeRotation,
    setRandomizeRotation,
    randomizeScale,
    setRandomizeScale,
    isDrawingToolActive,
    setIsDrawingToolActive,
    wallDrawStart,
    setWallDrawStart,
    wallDrawCurrent,
    setWallDrawCurrent,
    currentStrokePoints,
    setCurrentStrokePoints
  };
}
