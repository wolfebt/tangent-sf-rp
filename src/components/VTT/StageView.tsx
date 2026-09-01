/**
 * @file StageView.tsx
 * @description Next-Gen Tangent VTT Stage Viewport.
 * Renders the WebGPU canvas ('The Stage'), orchestrates 8-layer compositor,
 * multi-tier grid coordinate engine (5ft encounter base / 30ft movement),
 * and floats the Glass-Cockpit HUD overlay with full interactive tactical tools.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  RendererContext, 
  LayerCompositor, 
  ZLayer, 
  FrustumChunkManager, 
  CoordinateEngine, 
  GridType, 
  GridScaleTier, 
  GRID_SCALE_CONFIGS,
  useEngineStore,
  selectAllFusedTokens,
  InteractiveObjectManager,
  type SceneInteractiveObject,
  CombatArbitrator,
  SkillRank,
  SizeCategory,
  DamagePipeline,
  DiceASTParser
} from '../../engine/index.ts';
import { DashboardOverlay } from '../../engine/ui/DashboardOverlay.tsx';
import { Graphics, Container, Text, TextStyle } from 'pixi.js';
import { 
  Shield, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Dices, 
  Users, 
  Compass, 
  Terminal, 
  Lock, 
  Unlock, 
  Box, 
  Zap
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

export interface StageViewProps {
  campaignId?: string;
  sceneId?: string;
  onNavigateFolio?: () => void;
  onNavigateOmnicortex?: () => void;
  onNavigateFoundry?: () => void;
}

export const StageView: React.FC<StageViewProps> = ({
  campaignId = 'campaign_alpha',
  onNavigateFolio,
  onNavigateOmnicortex,
  onNavigateFoundry
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererContextRef = useRef<RendererContext | null>(null);
  const layerCompositorRef = useRef<LayerCompositor | null>(null);
  const chunkManagerRef = useRef<FrustumChunkManager | null>(null);
  const coordEngineRef = useRef<CoordinateEngine>(new CoordinateEngine(GridType.Square, 70, GridScaleTier.Encounter));
  const interactiveObjMgrRef = useRef<InteractiveObjectManager>(new InteractiveObjectManager());
  const combatArbRef = useRef<CombatArbitrator>(new CombatArbitrator());
  const damagePipeRef = useRef<DamagePipeline>(new DamagePipeline());
  const diceParserRef = useRef<DiceASTParser>(new DiceASTParser());

  // UI States
  const [scaleTier, setScaleTier] = useState<GridScaleTier>(GridScaleTier.Encounter);
  const [gridType, setGridType] = useState<GridType>(GridType.Square);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>('op-jax');
  const [targetTokenId, setTargetTokenId] = useState<string | null>('mech-vanguard');
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isVisionEnabled, setIsVisionEnabled] = useState(true);
  const [torchRadiusFt, setTorchRadiusFt] = useState(30);
  const [gridOverlayContainer, setGridOverlayContainer] = useState<Container | null>(null);

  // Active Tool Panel Tab
  const [activeTab, setActiveTab] = useState<'combat' | 'spawner' | 'objects' | 'dice' | 'layers'>('combat');
  const [combatLog, setCombatLog] = useState<string[]>([
    '[SYSTEM] Stage WebGPU Engine initialized at 5ft Encounter scale.',
    '[SYSTEM] Operatives and Mecha units synchronized with Folio & Omnicortex.'
  ]);
  const [attackWeapon, setAttackWeapon] = useState<'kinetic' | 'plasma' | 'laser' | 'emp'>('plasma');
  const [attackMapStep, setAttackMapStep] = useState<number>(0);
  const [customDiceExpr, setCustomDiceExpr] = useState<string>('2d20kh1 + @armor_dr');
  const [selectedObjectModal, setSelectedObjectModal] = useState<SceneInteractiveObject | null>(null);

  const tokens = useEngineStore(selectAllFusedTokens);
  const selectedToken = tokens.find(t => t.id === selectedTokenId) || null;
  const targetToken = tokens.find(t => t.id === targetTokenId) || null;

  // Initialize sample tokens and map objects into VolatileSharder on mount
  useEffect(() => {
    const store = useEngineStore.getState();
    if (Object.keys(store.staticData).length === 0) {
      store.loadStaticEntitiesBatch([
        {
          id: 'op-jax',
          name: 'Operative Jax',
          base_hp: 45,
          tech_level: 3,
          armor_dr: 15,
          size_modifier: 0,
          species: 'Alterian',
          archetype: 'Infiltrator',
          is_persona: true
        },
        {
          id: 'op-kaelen',
          name: 'Dr. Kaelen',
          base_hp: 35,
          tech_level: 4,
          armor_dr: 10,
          size_modifier: 0,
          species: 'Cyborg Human',
          archetype: 'Cyber-Medic',
          is_persona: true
        },
        {
          id: 'mech-vanguard',
          name: 'Vanguard Assault Mech',
          base_hp: 120,
          tech_level: 4,
          armor_dr: 35,
          size_modifier: 2,
          species: 'Mecha / Omnicortex Gear',
          archetype: 'Heavy Combat Chassis',
          is_persona: false
        },
        {
          id: 'drone-scout',
          name: 'Recon Drone',
          base_hp: 20,
          tech_level: 3,
          armor_dr: 5,
          size_modifier: -1,
          species: 'Automaton / Drone',
          archetype: 'Tactical Recon',
          is_persona: false
        }
      ]);

      store.updatePosition('op-jax', 140, 140);
      store.updatePosition('op-kaelen', 140, 210);
      store.updatePosition('mech-vanguard', 420, 280);
      store.updatePosition('drone-scout', 490, 140);
    }

    // Sample interactive objects on the Stage
    const sampleObjects: SceneInteractiveObject[] = [
      {
        id: 'bulkhead-alpha',
        name: 'Airlock Security Bulkhead',
        type: 'bulkhead',
        x: 280,
        y: 140,
        storyElementId: 'clue-airlock-breach'
      },
      {
        id: 'terminal-nexus',
        name: 'Mainframe Datapad',
        type: 'terminal',
        x: 350,
        y: 210,
        storyElementId: 'log-classified-data'
      },
      {
        id: 'crate-omega',
        name: 'Omnicortex Munitions Crate',
        type: 'loot_container',
        x: 210,
        y: 350,
        storyElementId: 'gear-plasma-grenades'
      }
    ];
    interactiveObjMgrRef.current.loadObjects(sampleObjects);
  }, []);

  // Initialize PixiJS WebGPU Canvas & Compositor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;
    const renderer = new RendererContext();
    rendererContextRef.current = renderer;

    const initRenderer = async () => {
      await renderer.initialize(canvas);
      if (isDestroyed) return;

      const app = renderer.getApp();
      const compositor = new LayerCompositor(app);
      layerCompositorRef.current = compositor;

      const chunkMgr = new FrustumChunkManager();
      chunkManagerRef.current = chunkMgr;

      // Create Grid Overlay Graphics
      const gridContainer = new Container();
      gridContainer.label = 'GridOverlay';
      compositor.addToLayer(gridContainer, ZLayer.BackgroundMap);
      setGridOverlayContainer(gridContainer);
    };

    initRenderer();

    return () => {
      isDestroyed = true;
      renderer.destroy();
    };
  }, []);

  // Draw Grid Overlay when Scale Tier / Grid Type / Visibility changes
  const redrawGrid = useCallback(() => {
    if (!gridOverlayContainer || !layerCompositorRef.current) return;

    gridOverlayContainer.removeChildren();
    if (!isGridVisible) return;

    const engine = coordEngineRef.current;
    const cellSize = engine.getCellSizePx();
    const graphics = new Graphics();

    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;

    graphics.stroke({ width: 1, color: 0x00ffff, alpha: 0.15 });

    if (gridType === GridType.Square) {
      for (let x = 0; x <= width; x += cellSize) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
      }
    }

    gridOverlayContainer.addChild(graphics);
  }, [gridOverlayContainer, isGridVisible, gridType]);

  useEffect(() => {
    redrawGrid();
  }, [redrawGrid, scaleTier, gridType]);

  // Render Interactive Objects on the Stage
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const objLayer = compositor.getLayer(ZLayer.InteractiveObjects);
    if (!objLayer) return;

    objLayer.removeChildren();

    const objects = interactiveObjMgrRef.current.getAllObjects();
    objects.forEach(obj => {
      const container = new Container();
      container.x = obj.x;
      container.y = obj.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      if (obj.type === 'bulkhead') {
        const state = interactiveObjMgrRef.current.getObject(obj.id);
        const isOpen = state?.isOpen || false;
        g.rect(-20, -10, 40, 20);
        g.fill({ color: isOpen ? 0x10b981 : 0xef4444, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xffffff });
      } else if (obj.type === 'terminal') {
        g.rect(-15, -15, 30, 30);
        g.fill({ color: 0x3b82f6, alpha: 0.8 });
        g.stroke({ width: 2, color: 0x60a5fa });
      } else {
        g.rect(-12, -12, 24, 24);
        g.fill({ color: 0xf59e0b, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xfbbf24 });
      }

      container.addChild(g);

      container.on('pointerdown', (e) => {
        e.stopPropagation();
        handleObjectClick(obj);
      });

      objLayer.addChild(container);
    });
  }, [tokens]);

  // Render Tokens on the Stage
  useEffect(() => {
    const compositor = layerCompositorRef.current;
    if (!compositor) return;

    const tokenLayer = compositor.getLayer(ZLayer.Tokens);
    if (!tokenLayer) return;

    tokenLayer.removeChildren();

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0xffffff,
      align: 'center'
    });

    tokens.forEach(token => {
      const container = new Container();
      container.x = token.x;
      container.y = token.y;
      container.eventMode = 'static';
      container.cursor = 'pointer';

      const g = new Graphics();
      const isSelected = token.id === selectedTokenId;
      const isTarget = token.id === targetTokenId;
      const fillColor = token.is_persona ? 0x06b6d4 : 0x8b5cf6; // Cyan for Persona, Purple for Mecha

      // Volumetric Size radius
      const radius = 22 + (token.size_modifier || 0) * 8;

      g.circle(0, 0, radius);
      g.fill({ color: fillColor, alpha: 0.85 });

      if (isSelected) {
        g.stroke({ width: 3.5, color: 0xfacc15 }); // Gold ring for selected
      } else if (isTarget) {
        g.stroke({ width: 3.5, color: 0xef4444 }); // Red ring for target
      } else {
        g.stroke({ width: 1.5, color: 0xffffff });
      }

      // Flashlight / Vision cone indicator if selected and vision is active
      if (isSelected && isVisionEnabled) {
        const torchPx = (torchRadiusFt / 5) * 70;
        const torchG = new Graphics();
        torchG.circle(0, 0, torchPx);
        torchG.stroke({ width: 1, color: 0xfacc15, alpha: 0.3 });
        torchG.fill({ color: 0xfef08a, alpha: 0.05 });
        container.addChild(torchG);
      }

      container.addChild(g);

      // Label & HP
      const label = new Text({ text: `${token.name} (${token.current_hp} HP)`, style });
      label.anchor.set(0.5, -1.8);
      container.addChild(label);

      container.on('pointerdown', (e) => {
        e.stopPropagation();
        if (e.buttons === 2 || e.shiftKey) {
          setTargetTokenId(token.id);
          AudioService.playTerminalBeep(950, 0.03);
        } else {
          setSelectedTokenId(token.id);
          AudioService.playTerminalBeep(1200, 0.03);
        }
      });

      tokenLayer.addChild(container);
    });
  }, [tokens, selectedTokenId, targetTokenId, isVisionEnabled, torchRadiusFt]);

  // Handle Stage Canvas Pointer Click (Snap & Move Token)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !selectedTokenId) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const engine = coordEngineRef.current;
    const snapped = engine.snapPixelToGrid({ x: clickX, y: clickY });

    useEngineStore.getState().updatePosition(selectedTokenId, snapped.x, snapped.y);
    AudioService.playTerminalBeep(1100, 0.02);
  };

  const handleObjectClick = (obj: SceneInteractiveObject) => {
    setSelectedObjectModal(obj);
    AudioService.playTerminalBeep(1300, 0.04);
  };

  const handleToggleBulkhead = (objId: string) => {
    if (!selectedTokenId) return;
    const res = interactiveObjMgrRef.current.interact(objId, selectedTokenId);
    if (res.success) {
      AudioService.playTerminalBeep(800, 0.06);
      setCombatLog(prev => [
        `[OBJECT] ${selectedToken?.name || 'Operative'} toggled ${objId} => ${res.data.isOpen ? 'OPEN' : 'SEALED'}`,
        ...prev.slice(0, 8)
      ]);
      setSelectedObjectModal(null);
    }
  };

  const handleExecuteCombatStrike = () => {
    if (!selectedToken || !targetToken) {
      alert('Select an Attacker and a Target on The Stage.');
      return;
    }

    AudioService.playTerminalBeep(1400, 0.05);

    // 1. Calculate to-hit with MAP & Volumetric sizing
    const toHit = combatArbRef.current.buildToHitPackage(
      14,
      SkillRank.Expert,
      attackMapStep,
      SizeCategory.Medium,
      targetToken.size_modifier > 0 ? SizeCategory.Large : SizeCategory.Medium,
      1.0
    );

    // 2. Roll Attack Dice (1d20 + modifiers)
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const isHit = attackRoll >= 8; // Tactical hit threshold

    if (!isHit) {
      setCombatLog(prev => [
        `[COMBAT MISS] ${selectedToken.name} fired ${attackWeapon.toUpperCase()} at ${targetToken.name}. Roll: ${attackRoll} (Target: ${toHit.finalTarget}) -> MISSED.`,
        ...prev.slice(0, 8)
      ]);
      return;
    }

    // 3. Resolve Damage Pipeline
    const baseDamage = attackWeapon === 'plasma' ? 32 : attackWeapon === 'emp' ? 24 : 18;
    const ap = attackWeapon === 'plasma' ? 6 : attackWeapon === 'laser' ? 4 : 2;

    const strikeResult = damagePipeRef.current.resolveStrike(
      {
        rawDamage: baseDamage,
        armorPenetration: ap,
        damageType: attackWeapon,
        isCalledShot: false
      },
      targetToken,
      [targetToken.armor_dr || 10]
    );

    // Apply Damage to Volatile Store
    useEngineStore.getState().applyDamage(targetToken.id, strikeResult.netDamage);

    setCombatLog(prev => [
      `[COMBAT HIT] ${selectedToken.name} struck ${targetToken.name} for ${strikeResult.netDamage} NET DMG (${strikeResult.effectiveDR} DR applied). ${strikeResult.appliedStatuses.join(', ')}`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleRollCustomDice = () => {
    try {
      const res = diceParserRef.current.evaluateExpression(customDiceExpr, selectedTokenId || undefined);
      AudioService.playTerminalBeep(1250, 0.04);
      setCombatLog(prev => [
        `[DICE ROLL] ${customDiceExpr} => TOTAL: ${res.total} (${res.breakdown})`,
        ...prev.slice(0, 8)
      ]);
    } catch (err: any) {
      alert(`Dice Syntax Error: ${err.message}`);
    }
  };

  const handleSpawnEntity = (type: 'persona' | 'mecha') => {
    const id = `${type}-${Date.now()}`;
    const name = type === 'persona' ? 'Operative Cadet' : 'Siege Walker';
    useEngineStore.getState().loadStaticEntity({
      id,
      name,
      base_hp: type === 'persona' ? 40 : 100,
      tech_level: 3,
      armor_dr: type === 'persona' ? 12 : 30,
      size_modifier: type === 'persona' ? 0 : 2,
      species: type === 'persona' ? 'Human' : 'Mecha / Omnicortex Gear',
      archetype: type === 'persona' ? 'Rookie Operative' : 'Assault Chassis',
      is_persona: type === 'persona'
    });
    useEngineStore.getState().updatePosition(id, 280, 280);
    setSelectedTokenId(id);
    AudioService.playTerminalBeep(1100, 0.03);
  };

  const handleScaleChange = (newTier: GridScaleTier) => {
    setScaleTier(newTier);
    coordEngineRef.current.setScaleTier(newTier);
    redrawGrid();
  };

  const handleGridTypeToggle = () => {
    const nextType = gridType === GridType.Square ? GridType.HexFlatTop : GridType.Square;
    setGridType(nextType);
    coordEngineRef.current.setGridType(nextType);
    redrawGrid();
  };

  const currentScaleConfig = GRID_SCALE_CONFIGS[scaleTier];

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* WebGPU / WebGL Stage Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Glass-Cockpit HUD React Portal */}
      <DashboardOverlay
        campaignName={`THE STAGE | ${campaignId.toUpperCase()} | ${currentScaleConfig.displayLabel}`}
        onOpenFolio={onNavigateFolio}
        onOpenOmnicortex={onNavigateOmnicortex}
        onOpenStoryFoundry={onNavigateFoundry}
        onToggleTacticalGrid={handleGridTypeToggle}
      />

      {/* ── TOP RIGHT: Multi-Tier Scale & Viewport Bar ── */}
      <div 
        className="absolute top-16 right-4 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl z-[110]"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Compass size={12} /> SCALE:
        </span>
        <select
          value={scaleTier}
          onChange={(e) => handleScaleChange(e.target.value as GridScaleTier)}
          className="bg-slate-800 text-amber-300 font-mono text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
        >
          <option value={GridScaleTier.Encounter}>Encounter (5 ft base)</option>
          <option value={GridScaleTier.Overland}>Overland (50 ft)</option>
          <option value={GridScaleTier.Planetary}>Planetary (10 km)</option>
          <option value={GridScaleTier.Interplanetary}>Interplanetary (10k km)</option>
          <option value={GridScaleTier.StarSystem}>Star System (1 AU)</option>
          <option value={GridScaleTier.Sector}>Sector (1 LY)</option>
        </select>

        <button
          onClick={handleGridTypeToggle}
          className="px-2 py-1 text-xs font-mono font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
        >
          {gridType === GridType.Square ? 'HEX' : 'SQUARE'}
        </button>

        <button
          onClick={() => setIsGridVisible(!isGridVisible)}
          className={`px-2 py-1 text-xs font-mono font-bold rounded border transition-colors ${
            isGridVisible 
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          GRID
        </button>

        <button
          onClick={() => setIsVisionEnabled(!isVisionEnabled)}
          className={`px-2 py-1 text-xs font-mono font-bold rounded border transition-colors flex items-center gap-1 ${
            isVisionEnabled 
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isVisionEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>VISION</span>
        </button>

        {isVisionEnabled && (
          <select
            value={torchRadiusFt}
            onChange={(e) => setTorchRadiusFt(parseInt(e.target.value, 10))}
            className="bg-slate-800 text-yellow-300 font-mono text-xs px-1.5 py-1 rounded border border-slate-700 focus:outline-none"
            title="Torch & Line-of-Sight Radius"
          >
            <option value={15}>15 ft Torch</option>
            <option value={30}>30 ft Torch</option>
            <option value={60}>60 ft Light</option>
            <option value={120}>120 ft Sensor</option>
          </select>
        )}
      </div>

      {/* ── RIGHT DOCKABLE TACTICAL COMMAND CONSOLE ── */}
      <aside 
        className="absolute top-28 right-4 w-84 max-w-[340px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200 z-[110] flex flex-col overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1 text-[11px] font-mono font-bold">
          <button
            onClick={() => setActiveTab('combat')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'combat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair size={13} /> COMBAT
          </button>
          <button
            onClick={() => setActiveTab('spawner')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'spawner' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={13} /> SPAWN
          </button>
          <button
            onClick={() => setActiveTab('objects')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'objects' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box size={13} /> OBJECTS
          </button>
          <button
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
              activeTab === 'dice' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices size={13} /> DICE
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3 space-y-3 font-mono text-xs max-h-[360px] overflow-y-auto">
          {/* 1. COMBAT TAB */}
          {activeTab === 'combat' && (
            <div className="space-y-2.5">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>ATTACKER (CLICK)</span>
                  <span className="text-cyan-400 font-bold">{selectedToken?.name || 'NONE'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>TARGET (SHIFT-CLICK)</span>
                  <span className="text-red-400 font-bold">{targetToken?.name || 'NONE'}</span>
                </div>
              </div>

              {/* Weapon & MAP Step */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">WEAPON TYPE</span>
                  <select
                    value={attackWeapon}
                    onChange={(e) => setAttackWeapon(e.target.value as any)}
                    className="w-full bg-slate-800 text-amber-300 p-1 rounded border border-slate-700"
                  >
                    <option value="kinetic">TL3 Kinetic Rifle</option>
                    <option value="plasma">TL4 Heavy Plasma</option>
                    <option value="laser">TL4 Laser Array</option>
                    <option value="emp">TL3 EMP Shockwave</option>
                  </select>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block mb-1">MAP LADDER</span>
                  <select
                    value={attackMapStep}
                    onChange={(e) => setAttackMapStep(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-800 text-amber-300 p-1 rounded border border-slate-700"
                  >
                    <option value={0}>1st Attack (+0 MAP)</option>
                    <option value={1}>2nd Attack (-5 MAP)</option>
                    <option value={2}>3rd Attack (-10 MAP)</option>
                  </select>
                </div>
              </div>

              {/* Execute Attack Button */}
              <button
                onClick={handleExecuteCombatStrike}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-black font-bold uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={14} />
                <span>RESOLVE STRIKE & WOUNDS</span>
              </button>
            </div>
          )}

          {/* 2. SPAWNER TAB */}
          {activeTab === 'spawner' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">QUICK ASSET SPAWNER</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSpawnEntity('persona')}
                  className="p-2 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 rounded-xl flex flex-col items-center gap-1 transition-colors"
                >
                  <Users size={16} />
                  <span className="font-bold text-[10px]">SPAWN OPERATIVE</span>
                  <span className="text-[8.5px] text-cyan-400 font-sans">Folio Persona</span>
                </button>
                <button
                  onClick={() => handleSpawnEntity('mecha')}
                  className="p-2 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 rounded-xl flex flex-col items-center gap-1 transition-colors"
                >
                  <Shield size={16} />
                  <span className="font-bold text-[10px]">SPAWN MECHA</span>
                  <span className="text-[8.5px] text-purple-400 font-sans">Omnicortex Gear</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. OBJECTS TAB */}
          {activeTab === 'objects' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">STORY FOUNDRY MAP ELEMENTS</span>
              <div className="space-y-1.5">
                {interactiveObjMgrRef.current.getAllObjects().map(obj => {
                  const state = interactiveObjMgrRef.current.getObject(obj.id);
                  return (
                    <div 
                      key={obj.id}
                      onClick={() => handleObjectClick(obj)}
                      className="p-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {obj.type === 'bulkhead' ? <Lock size={13} className="text-amber-400" /> : <Terminal size={13} className="text-cyan-400" />}
                        <span className="text-slate-200 text-[11px] font-bold">{obj.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {obj.type === 'bulkhead' ? (state?.isOpen ? 'OPEN' : 'LOCKED') : 'READY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DICE TAB */}
          {activeTab === 'dice' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">DICE AST & MACRO RUNNER</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customDiceExpr}
                  onChange={(e) => setCustomDiceExpr(e.target.value)}
                  className="flex-1 bg-slate-950 text-emerald-300 px-2 py-1 rounded border border-slate-700 text-xs focus:outline-none"
                  placeholder="e.g. 2d20kh1 + @armor_dr"
                />
                <button
                  onClick={handleRollCustomDice}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded text-xs"
                >
                  ROLL
                </button>
              </div>

              {/* Quick dice shortcuts */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {['1d20', '1d100', '1d10!', '2d6+4'].map(dice => (
                  <button
                    key={dice}
                    onClick={() => {
                      setCustomDiceExpr(dice);
                      diceParserRef.current.evaluateExpression(dice);
                    }}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                  >
                    {dice}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Stage Combat & Event Log */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-2.5 max-h-[110px] overflow-y-auto font-mono text-[10px] space-y-1 text-slate-400">
          {combatLog.map((log, index) => (
            <div key={index} className="leading-tight">
              {log}
            </div>
          ))}
        </div>
      </aside>

      {/* ── INTERACTIVE OBJECT DIALOG MODAL ── */}
      {selectedObjectModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedObjectModal(null)}
        >
          <div 
            className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-200 font-mono space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                {selectedObjectModal.type === 'bulkhead' ? <Lock className="text-amber-400" /> : <Terminal className="text-cyan-400" />}
                <h3 className="font-bold text-sm text-cyan-300">{selectedObjectModal.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedObjectModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {selectedObjectModal.type === 'bulkhead' 
                ? 'High-security blast bulkhead. Toggling this will update line-of-sight raycasting and acoustic occlusion on The Stage.' 
                : 'Encrypted mainframe terminal linked to Story Foundry narrative clues.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedObjectModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                DISMISS
              </button>
              {selectedObjectModal.type === 'bulkhead' ? (
                <button
                  onClick={() => handleToggleBulkhead(selectedObjectModal.id)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Unlock size={14} /> TOGGLE BULKHEAD
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCombatLog(prev => [`[TERMINAL] Sliced ${selectedObjectModal.name}: Unlocked clue [${selectedObjectModal.storyElementId}]`, ...prev.slice(0, 8)]);
                    setSelectedObjectModal(null);
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Terminal size={14} /> SLICE DATAPAD
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageView;
