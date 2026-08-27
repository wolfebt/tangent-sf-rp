import React, { useState, useMemo } from 'react';
import {
  Rocket,
  Shield,
  Zap,
  Crosshair,
  Wrench,
  Radio,
  Cpu,
  Flame,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Activity,
  Sliders,
  ChevronRight,
  Send,
  X,
  Gauge,
  Power
} from 'lucide-react';
import { rollDice } from '../../../../services/diceService';
import { AudioService } from '../../../../services/audioService';

export const STARSHIP_ARCHETYPES = [
  {
    id: 'corvette',
    name: 'Aegis-Class Scout Corvette',
    type: 'Corvette / Light Escort',
    scale: 'Scale 3 (Vehicle/Starfighter)',
    structure: { current: 120, max: 120 },
    shields: { current: 40, max: 40 },
    hullDr: 4,
    powerCore: { current: 10, max: 10 },
    pace: '30m / Hexes',
    weapons: 'Twin Plasma Pontoons (2d10+4 AP 3), Light Flak Turret (1d10+2)'
  },
  {
    id: 'destroyer',
    name: 'Vanguard Strike Destroyer',
    type: 'Destroyer / Heavy Skirmisher',
    scale: 'Scale 4 (Capital Vessel)',
    structure: { current: 300, max: 300 },
    shields: { current: 100, max: 100 },
    hullDr: 8,
    powerCore: { current: 20, max: 20 },
    pace: '20m / Hexes',
    weapons: 'Spinal Heavy Mag-Rail (4d10+12 AP 8), Broadside Torpedo Tubes (3d10+6)'
  },
  {
    id: 'combat_mecha',
    name: 'Apex-IV Heavy Combat Walker',
    type: 'Heavy Mecha Chassis',
    scale: 'Scale 2 (Mecha / Walker)',
    structure: { current: 80, max: 80 },
    shields: { current: 25, max: 25 },
    hullDr: 5,
    powerCore: { current: 8, max: 8 },
    pace: '15m / Hexes',
    weapons: 'Arm-Mounted Rotary Cannon (3d8+4 AP 2), Shoulder Rocket Pod (2d10+4)'
  }
];

export const INITIAL_SUBSYSTEMS = [
  { id: 'bridge', label: 'Bridge / Command Node', status: 'operational', penalty: 'None', desc: 'Crew coordination & targeting algorithms' },
  { id: 'thrusters', label: 'Sub-Light Thrusters', status: 'operational', penalty: 'None', desc: 'Locomotion, evasion vectors & combat pace' },
  { id: 'shields', label: 'Deflector Shield Emitters', status: 'operational', penalty: 'None', desc: 'Active energy barrier matrix & kinetic absorption' },
  { id: 'weapons', label: 'Primary Weapon Arrays', status: 'operational', penalty: 'None', desc: 'Spinal accelerators & tactical turrets' },
  { id: 'reactor', label: 'Antimatter / Fusion Reactor', status: 'operational', penalty: 'None', desc: 'Power output for all shipboard systems' },
  { id: 'life_support', label: 'Life Support & Hull Seals', status: 'operational', penalty: 'None', desc: 'Atmospheric pressure & radiation shielding' }
];

export default function StarshipBridgeModal({
  isOpen,
  onClose,
  tokens = [],
  activeTokenId = null,
  onUpdateToken,
  onTriggerFloatingText,
  onBroadcastResult,
  scale = 1,
  position = { x: 0, y: 0 }
}) {
  if (!isOpen) return null;

  // Active Ship Selection
  const [selectedArchetypeId, setSelectedArchetypeId] = useState(STARSHIP_ARCHETYPES[0].id);
  const activeShip = useMemo(() => {
    const arch = STARSHIP_ARCHETYPES.find(a => a.id === selectedArchetypeId) || STARSHIP_ARCHETYPES[0];
    return arch;
  }, [selectedArchetypeId]);

  // Vitals & Subsystems
  const [structure, setStructure] = useState(activeShip.structure);
  const [shields, setShields] = useState(activeShip.shields);
  const [powerDistribution, setPowerDistribution] = useState({ shields: 3, weapons: 4, engines: 3 });
  const [subsystems, setSubsystems] = useState(INITIAL_SUBSYSTEMS);

  // Active Station Tab
  const [activeStation, setActiveStation] = useState('helm'); // 'helm' | 'tactical' | 'engineering' | 'ewar'

  // Bridge Station Actions Handlers
  const handleHelmAction = (actionName, paceBoost = false) => {
    AudioService.playTerminalBeep(740, 0.08);
    const summary = `🚀 [HELM STATION] Executed ${actionName}${paceBoost ? ' (Vector Boost: Double Pace)' : ''}. +2 Evasion DC active!`;
    
    if (onTriggerFloatingText && activeTokenId) {
      const tok = tokens.find(t => t.id === activeTokenId);
      if (tok) {
        const screenX = (tok.x || 0) * scale + position.x;
        const screenY = (tok.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🚀 HELM: ${actionName.toUpperCase()}`, 'heal');
      }
    }

    if (onBroadcastResult) onBroadcastResult(summary);
  };

  const handleTacticalVolley = (weaponName, damageExpr, ap = 4) => {
    AudioService.playDiceRollSound();
    const rollResult = rollDice(damageExpr);
    AudioService.playCombatHit(true);

    const summary = `💥 [TACTICAL STATION] Fired ${weaponName} for ${rollResult.total} Structure Damage (AP ${ap})!`;
    
    if (onTriggerFloatingText && activeTokenId) {
      const tok = tokens.find(t => t.id === activeTokenId);
      if (tok) {
        const screenX = (tok.x || 0) * scale + position.x;
        const screenY = (tok.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `💥 FIRED ${weaponName.toUpperCase()} (${rollResult.total} DMG)`, 'damage');
      }
    }

    if (onBroadcastResult) onBroadcastResult(summary);
  };

  const handleEngineeringPowerShift = (targetSystem) => {
    AudioService.playTerminalBeep(880, 0.08);
    let nextDist = { shields: 2, weapons: 2, engines: 2 };
    if (targetSystem === 'shields') {
      nextDist = { shields: 6, weapons: 2, engines: 2 };
      setShields(prev => ({ ...prev, current: Math.min(prev.max, prev.current + 15) }));
    } else if (targetSystem === 'weapons') {
      nextDist = { shields: 2, weapons: 6, engines: 2 };
    } else {
      nextDist = { shields: 2, weapons: 2, engines: 6 };
    }
    setPowerDistribution(nextDist);

    if (onTriggerFloatingText && activeTokenId) {
      const tok = tokens.find(t => t.id === activeTokenId);
      if (tok) {
        const screenX = (tok.x || 0) * scale + position.x;
        const screenY = (tok.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `⚡ POWER ROUTED TO ${targetSystem.toUpperCase()}`, 'heal');
      }
    }
  };

  const handleEwarJammer = () => {
    AudioService.playTerminalBeep(440, 0.15);
    const summary = `📡 [SCIENCE / EWAR] Sensor ECM active! All incoming hostile targeting locks suffer a -2 Check Penalty.`;

    if (onTriggerFloatingText && activeTokenId) {
      const tok = tokens.find(t => t.id === activeTokenId);
      if (tok) {
        const screenX = (tok.x || 0) * scale + position.x;
        const screenY = (tok.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `📡 ECM SHROUD ACTIVE (-2 LOCKS)`, 'karma');
      }
    }

    if (onBroadcastResult) onBroadcastResult(summary);
  };

  // Subsystem Damage Toggles
  const handleToggleSubsystemStatus = (subsystemId) => {
    setSubsystems(prev => prev.map(sub => {
      if (sub.id !== subsystemId) return sub;
      let nextStatus = 'damaged';
      let nextPenalty = '-2 Checks / 50% Capacity';
      if (sub.status === 'operational') {
        nextStatus = 'damaged';
        nextPenalty = '-2 Penalty / 50% Efficiency';
      } else if (sub.status === 'damaged') {
        nextStatus = 'destroyed';
        nextPenalty = 'DISABLED / OFFLINE';
      } else {
        nextStatus = 'operational';
        nextPenalty = 'None';
      }
      return { ...sub, status: nextStatus, penalty: nextPenalty };
    }));
    AudioService.playTerminalBeep(550, 0.05);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c1017] border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-b border-cyan-500/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase text-cyan-300 flex items-center gap-2">
                Starship &amp; Vehicle Subsystem Bridge
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TACTICAL CREW SIMULATION
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-Station Crew Management (Helm, Tactical, Engineering, EWAR) &amp; Subsystem Targeted Damage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            title="Close Bridge Command"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column (5 Cols): Vessel Telemetry, Hull & Subsystems */}
          <div className="md:col-span-5 flex flex-col gap-4">
            
            {/* Vessel Selector & Vitals */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Rocket className="w-4 h-4" /> Vessel Specifications
              </span>

              {/* Archetype Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chassis Archetype</label>
                <select
                  value={selectedArchetypeId}
                  onChange={(e) => {
                    setSelectedArchetypeId(e.target.value);
                    const arch = STARSHIP_ARCHETYPES.find(a => a.id === e.target.value);
                    if (arch) {
                      setStructure(arch.structure);
                      setShields(arch.shields);
                    }
                  }}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-200 focus:border-cyan-400 outline-none font-medium"
                >
                  {STARSHIP_ARCHETYPES.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              {/* Hull Structure & Shields Gauges */}
              <div className="flex flex-col gap-2 pt-1 font-mono text-xs">
                {/* Shields */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Deflector Shields:
                    </span>
                    <span className="text-cyan-300 font-bold">{shields.current}/{shields.max} SP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (shields.current / shields.max) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Structure */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Hull Structure:
                    </span>
                    <span className="text-amber-300 font-bold">{structure.current}/{structure.max} SP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (structure.current / structure.max) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tactical Stats Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Hull DR</span>
                  <span className="text-emerald-400 font-bold">{activeShip.hullDr} DR</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Pace</span>
                  <span className="text-cyan-400 font-bold">{activeShip.pace}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Reactor</span>
                  <span className="text-purple-400 font-bold">{activeShip.powerCore.max} PU</span>
                </div>
              </div>
            </div>

            {/* Subsystem Targeted Status Matrix */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Targeted Subsystem Nodes
                </span>
                <span className="text-[9px] font-mono text-slate-500">Click to cycle status</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {subsystems.map(sub => {
                  const isOp = sub.status === 'operational';
                  const isDamaged = sub.status === 'damaged';
                  const isDestroyed = sub.status === 'destroyed';

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubsystemStatus(sub.id)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                        isOp
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                          : isDamaged
                          ? 'bg-yellow-950/40 border-yellow-500/80 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                          : 'bg-red-950/40 border-red-500/80 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-1.5">
                          {isOp && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {isDamaged && <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
                          {isDestroyed && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          {sub.label}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans">{sub.desc}</span>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-sans ${
                          isOp ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          isDamaged ? 'bg-yellow-950 text-yellow-300 border border-yellow-700' :
                          'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): 4 Crew Stations */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Station Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {[
                { id: 'helm', label: 'Helm', icon: Rocket, color: 'cyan' },
                { id: 'tactical', label: 'Tactical', icon: Crosshair, color: 'rose' },
                { id: 'engineering', label: 'Engineering', icon: Wrench, color: 'amber' },
                { id: 'ewar', label: 'EWAR / Science', icon: Radio, color: 'purple' }
              ].map(st => {
                const Icon = st.icon;
                const isActive = activeStation === st.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStation(st.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-slate-950 border border-cyan-500/80 text-cyan-200 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Station Action Deck */}
            <div className="flex-1 p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
              
              {/* HELM STATION */}
              {activeStation === 'helm' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Rocket className="w-4 h-4" /> Helm &amp; Maneuvering Deck
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Pace: {activeShip.pace}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    The Pilot governs tactical vectoring, evasive thruster burns, and collision alignment.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleHelmAction('Evasive Thruster Burn')}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-cyan-300">⚡ Evasive Burn</span>
                      <span className="text-[10px] text-slate-400">Gain +2 Defense DC against incoming enemy fire for 1 round.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleHelmAction('Vector Overcharge', true)}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-cyan-300">🚀 Vector Boost</span>
                      <span className="text-[10px] text-slate-400">Double tactical movement pace (burns 2 Move Actions).</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleHelmAction('Ramming / Intercept Vector')}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500 text-left transition-all cursor-pointer flex flex-col gap-1 col-span-2"
                    >
                      <span className="font-bold text-xs text-rose-300">💥 Intercept / Boarding Vector</span>
                      <span className="text-[10px] text-slate-400">Align prow with enemy hull for direct kinetic ramming or boarding umbilical clamp.</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TACTICAL STATION */}
              {activeStation === 'tactical' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4" /> Weapons &amp; Gunnery Deck
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{activeShip.weapons}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    The Gunner allocates heavy weapons fire, launches torpedo salvos, and targets vulnerable enemy subsystems.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTacticalVolley('Primary Spinal Battery', '4d10+12', 8)}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-rose-300">🔥 Spinal Battery Volley</span>
                      <span className="text-[10px] font-mono text-slate-400">4d10+12 Dmg · AP 8</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTacticalVolley('Flak Intercept Grid', '2d10+4', 2)}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-rose-300">🛡️ Point-Defense Flak</span>
                      <span className="text-[10px] font-mono text-slate-400">2d10+4 Dmg · Intercept incoming torpedoes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ENGINEERING STATION */}
              {activeStation === 'engineering' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4" /> Reactor &amp; Power Routing Deck
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Output: {activeShip.powerCore.max} PU</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    The Engineer routes Power Units (PU) across Shields, Weapons, and Drives to amplify performance.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleEngineeringPowerShift('shields')}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col gap-1 ${
                        powerDistribution.shields === 6
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">Shield Matrix</span>
                      <span className="text-[10px] text-cyan-400">Boost Shields (+15 SP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEngineeringPowerShift('weapons')}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col gap-1 ${
                        powerDistribution.weapons === 6
                          ? 'bg-rose-950 border-rose-500 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">Weapons Grid</span>
                      <span className="text-[10px] text-rose-400">Overcharge (+4 Dmg)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEngineeringPowerShift('engines')}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col gap-1 ${
                        powerDistribution.engines === 6
                          ? 'bg-amber-950 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">Thruster Drive</span>
                      <span className="text-[10px] text-amber-400">Max Acceleration</span>
                    </button>
                  </div>
                </div>
              )}

              {/* EWAR / SCIENCE STATION */}
              {activeStation === 'ewar' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4" /> Science, Sensors &amp; EWAR
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ECM Level 4</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    The Science Officer operates deep sensor arrays, deploys electronic jamming, and infiltrates enemy ship firewalls.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleEwarJammer}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-purple-950/80 border border-slate-800 hover:border-purple-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-purple-300">📡 Active Jammer / ECM Shroud</span>
                      <span className="text-[10px] text-slate-400">Impose a -2 Check Penalty on all incoming hostile lock-on rolls.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        AudioService.playTerminalBeep(990, 0.1);
                        if (onBroadcastResult) onBroadcastResult(`💻 [EWAR INFILTRATION] Cyber-breach successful! Hostile Point-Defense offline for 1 round.`);
                      }}
                      className="p-3 rounded-lg bg-slate-950 hover:bg-purple-950/80 border border-slate-800 hover:border-purple-500 text-left transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <span className="font-bold text-xs text-purple-300">💻 Cyber-Breach Hack</span>
                      <span className="text-[10px] text-slate-400">Infiltrate enemy fire-control network to disable point defense.</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
