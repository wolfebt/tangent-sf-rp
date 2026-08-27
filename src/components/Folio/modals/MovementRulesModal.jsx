import React, { useState } from 'react';
import { 
  Footprints, 
  Wind, 
  Activity, 
  X, 
  Search, 
  Clock, 
  Shield, 
  AlertTriangle,
  Compass,
  Zap
} from 'lucide-react';
import { 
  MOVEMENT_MODES_AND_PACES, 
  MOVEMENT_FATIGUE_SYSTEM, 
  FLYING_COMBAT_RULES 
} from '../../../engines/tangentConstants';

export const MovementRulesModal = ({
  isOpen,
  onClose,
  characterData = {},
  getAttrTotal = () => 0,
  derivedStats = {}
}) => {
  const [activeMovementMode, setActiveMovementMode] = useState('all'); // 'all' | 'ground' | 'flying' | 'swimming' | 'climbing' | 'burrowing'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const getNum = (id, defaultVal = 0) => parseInt(characterData[id] || defaultVal, 10);

  // Hero Speeds
  const staminaTotal = getAttrTotal('attr-stamina');
  const fortitudeTotal = getAttrTotal('attr-fortitude');
  const walkSpeed = getNum('move-walk', 30);
  const flySpeed = getNum('move-fly', 0);
  const swimSpeed = getNum('move-swim', 0);
  const climbSpeed = getNum('move-climb', 0);
  const burrowSpeed = getNum('move-burrow', 0);
  const teleportSpeed = getNum('move-teleport', 0);

  // Dynamic calculated bases for pace charts
  const flyBaseSpeed = flySpeed > 0 ? flySpeed : walkSpeed * 2;
  const swimBaseSpeed = swimSpeed > 0 ? swimSpeed : Math.max(5, Math.round(walkSpeed * 0.5));
  const climbBaseSpeed = climbSpeed > 0 ? climbSpeed : Math.max(5, Math.round(walkSpeed * 0.5));
  const burrowBaseSpeed = burrowSpeed > 0 ? burrowSpeed : Math.max(2.5, Math.round(walkSpeed * 0.25 * 10) / 10);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b111c] border border-amber-500/40 rounded-2xl max-w-4xl w-full p-4 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 space-y-6 my-4 sm:my-6">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-amber-950/80 rounded-lg border border-amber-500/40 text-amber-300">
                <Footprints size={22} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-cyan-200">
                  Movement Paces &amp; Mobility Codex
                </h2>
                <p className="text-xs text-slate-400">
                  Canonical Tangent Science Fantasy Roleplay Velocities, Aerial Tactics, Fatigue &amp; Terrains
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <X size={14} />
            <span>Close Codex</span>
          </button>
        </div>

        {/* Live Active Hero Speeds Telemetry */}
        <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Activity size={14} className="text-amber-400" />
              Operative Mobility Telemetry
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300 font-bold">
              1 Turn = 6 Seconds • Fortitude Save: {fortitudeTotal >= 0 ? `+${fortitudeTotal}` : fortitudeTotal}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <div className="text-[10px] uppercase font-bold text-amber-300">Ground (Walk)</div>
              <div className="text-lg font-black text-amber-200">{walkSpeed} ft</div>
              <div className="text-[9px] text-slate-400">{Math.round(walkSpeed * 0.3)} m/turn</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Fly</div>
              <div className="text-lg font-black text-cyan-300">{flySpeed > 0 ? `${flySpeed} ft` : `${walkSpeed * 2} ft (2x)`}</div>
              <div className="text-[9px] text-slate-500">{flySpeed > 0 ? `${Math.round(flySpeed * 0.3)} m/turn` : 'Standard Base'}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Swim</div>
              <div className="text-lg font-black text-blue-300">{swimSpeed > 0 ? `${swimSpeed} ft` : `${Math.round(walkSpeed * 0.5)} ft (1/2x)`}</div>
              <div className="text-[9px] text-slate-500">{swimSpeed > 0 ? `${Math.round(swimSpeed * 0.3)} m/turn` : 'Default 1/2'}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Climb</div>
              <div className="text-lg font-black text-orange-300">{climbSpeed > 0 ? `${climbSpeed} ft` : `${Math.round(walkSpeed * 0.5)} ft (1/2x)`}</div>
              <div className="text-[9px] text-slate-500">{climbSpeed > 0 ? `${Math.round(climbSpeed * 0.3)} m/turn` : 'Default 1/2'}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Burrow</div>
              <div className="text-lg font-black text-stone-300">{burrowSpeed > 0 ? `${burrowSpeed} ft` : `${Math.max(2.5, Math.round(walkSpeed * 0.25))} ft`}</div>
              <div className="text-[9px] text-slate-500">{burrowSpeed > 0 ? `${Math.round(burrowSpeed * 0.3)} m/turn` : 'Default 1/4'}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-purple-800/60">
              <div className="text-[10px] uppercase font-bold text-purple-300">Teleport</div>
              <div className="text-lg font-black text-purple-200">{teleportSpeed > 0 ? `${teleportSpeed} ft` : 'Instant'}</div>
              <div className="text-[9px] text-purple-400">Dimensional</div>
            </div>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Modes', icon: '📋' },
              { id: 'ground', label: 'Ground', icon: '🚶' },
              { id: 'flying', label: 'Flying', icon: '🪽' },
              { id: 'swimming', label: 'Swimming', icon: '🏊' },
              { id: 'climbing', label: 'Climbing', icon: '🧗' },
              { id: 'burrowing', label: 'Burrowing', icon: '⛏️' }
            ].map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMovementMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMovementMode === mode.id
                    ? 'bg-amber-950 text-amber-200 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Breath: <strong className="text-cyan-300">{Math.max(1, staminaTotal)} min</strong> without oxygen
          </div>
        </div>

        {/* 1. Ground Movement Paces */}
        {(activeMovementMode === 'all' || activeMovementMode === 'ground') && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span>🚶</span> Ground Movement Paces &amp; Tactical Modifiers
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Medium Canon: 30 ft/rd (6 kph) • Hero Base: <strong className="text-cyan-300">{walkSpeed} ft/rd</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                    <th className="py-2 px-3">Pace</th>
                    <th className="py-2 px-2 text-center">Multiplier</th>
                    <th className="py-2 px-2 text-center font-bold text-amber-300">Hero Speed</th>
                    <th className="py-2 px-2 text-center">Action Mod</th>
                    <th className="py-2 px-3">Check &amp; Fatigue Rules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-slate-200">Walk</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed} ft ({Math.round(walkSpeed * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Normal combat maneuvering; no checks required</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-amber-300">Jog</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{walkSpeed * 2} ft ({Math.round(walkSpeed * 2 * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Hurried pace; imposes -2 to fine motor/ranged actions</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-orange-400">Running</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">
                      {walkSpeed * 4} ft ({Math.round(walkSpeed * 4 * 0.3)}m)
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">Requires <strong>Athletics DC 10+</strong> every minute of sustained exertion</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-rose-400">Sprinting</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">6.0x</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">
                      {walkSpeed * 6} ft ({Math.round(walkSpeed * 6 * 0.3)}m)
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-8 Penalty</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">Maximum burst; <strong>Athletics DC 15+</strong>. Triggers Fatigue Save after 5 rounds!</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-slate-300">Crawl</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">0.5x (1/2x)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(walkSpeed * 0.5)} ft</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+2 Stealth</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Prone posture; granting cover against ranged attacks</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-slate-300">Slow Crawl</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">0.25x (1/4x)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{Math.round(walkSpeed * 0.25)} ft</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+4 Stealth</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Ultra-silent infiltration through ducts or grass</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Flying Movement Paces & Maneuvers */}
        {(activeMovementMode === 'all' || activeMovementMode === 'flying') && (
          <div className="bg-slate-950/70 border border-cyan-900/60 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🪽</span> Flying Movement Paces &amp; Tactical Aerial Maneuvers
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Medium Canon: 60 ft/rd (2x Walk) • Hero Flight Base: <strong className="text-cyan-300">{flyBaseSpeed} ft/rd</strong> {flySpeed > 0 ? '(Equipped)' : '(Standard 2x Walk)'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/60">
                    <th className="py-2 px-3">Maneuver</th>
                    <th className="py-2 px-2 text-center">Multiplier</th>
                    <th className="py-2 px-2 text-center font-bold text-cyan-300">Hero Speed</th>
                    <th className="py-2 px-2 text-center">Subtlety Mod</th>
                    <th className="py-2 px-3">Check &amp; Tactical Rules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-sans">
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-slate-200">Flight</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">1.0x Fly (2x Walk)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed} ft ({Math.round(flyBaseSpeed * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Standard cruising flight in 3D airspace; no checks required</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-amber-300">Sail</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Fly (4x Walk)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed * 2} ft ({Math.round(flyBaseSpeed * 2 * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-2 Penalty</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Hurried flight / wide wing-spread thermal cruising; -2 penalty to fine actions</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-orange-400">Surge / Soar</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">4.0x Fly (8x Walk)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed * 4} ft ({Math.round(flyBaseSpeed * 4 * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">Rapid pursuit &amp; intercept; <strong>Acrobatics DC 10+</strong> every min</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-rose-400">Diving</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">2.0x Current (Up to 8x)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">Up to {flyBaseSpeed * 8} ft ({Math.round(flyBaseSpeed * 8 * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-400">-4 Penalty</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">Steep high-speed power dive; requires <strong>Acrobatics DC 15+</strong></td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-emerald-300">Gliding</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">Maintains Speed</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">{flyBaseSpeed} ft ({Math.round(flyBaseSpeed * 0.3)}m)</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-400">+2 Bonus</td>
                    <td className="py-2 px-3 text-slate-300 text-[11px]">Controlled descent; drops 1 ft per 5 ft horizontal; <strong>Acrobatics DC 10+</strong></td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-bold text-slate-300">Hover</td>
                    <td className="py-2 px-2 text-center font-mono text-slate-400">Static / 0</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-cyan-300">0 ft</td>
                    <td className="py-2 px-2 text-center text-slate-400">Baseline (0)</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">Stationary altitude; <strong>Acrobatics DC 15+</strong> unless having native hover trait</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Aerial Tactical Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-700/50 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                  <span>🎯</span> High Ground Tactical Advantage
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Flyers maintaining altitude above ground targets gain <strong className="text-emerald-300">+2 to Strike</strong> and <strong className="text-emerald-300">+2 to Critical Range</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-700/50 space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5 text-[11px]">
                  <span>💥</span> Aerial Rams (Kinetic Collisions)
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Deliberate ramming deals <strong className="text-amber-300">+1d per Flight Stage + 1 Impact Damage per 10 ft of speed</strong> to both units.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Swimming, Aquatic & Suffocation */}
        {(activeMovementMode === 'all' || activeMovementMode === 'swimming') && (
          <div className="bg-slate-950/70 border border-blue-900/60 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
                <span>🏊</span> Swimming Movement Paces &amp; Aquatic Operations
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Hero Swim Base: <strong className="text-blue-300">{swimBaseSpeed} ft/rd</strong> ({Math.round(swimBaseSpeed * 0.3)}m)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300 flex items-center justify-between">
                  <span>Swim Pace</span>
                  <span className="font-mono text-cyan-300">{swimBaseSpeed} ft</span>
                </div>
                <p className="text-[11px] text-slate-400">Calm waters: <strong>Athletics DC 10</strong>. Rough sea: <strong>DC 15</strong>. Stormy tempest: <strong>DC 20+</strong>.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>Holding Breath</span>
                  <span className="font-mono text-amber-300">{Math.max(1, staminaTotal)} min</span>
                </div>
                <p className="text-[11px] text-slate-400">Operatives hold breath for 1 full minute per Stamina Ability Score (minimum 1 minute) during mild exertion.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span>Suffocation</span>
                  <span className="font-mono text-rose-400">Lethal</span>
                </div>
                <p className="text-[11px] text-slate-400">When breath expires, character must pass <strong>Fortitude DC 15 (+1/round)</strong> or drop to 0 Health Comatose.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Climbing, Burrowing & Falling */}
        {(activeMovementMode === 'all' || activeMovementMode === 'climbing' || activeMovementMode === 'burrowing') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-orange-900/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase text-orange-300 flex items-center gap-1.5">
                  <span>🧗</span> Climbing &amp; Falling Damage
                </span>
                <span className="font-mono text-[10px] text-orange-400">Base: {climbBaseSpeed} ft</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Standard climbing pace is 1/2 Ground speed. Ladder/Rope: <strong>DC 5</strong>. Rough rock: <strong>DC 12</strong>. Smooth sheer bulkhead: <strong>DC 20</strong>.
              </p>
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-[10.5px] text-rose-200">
                <strong>Fall Damage:</strong> Deals <strong>1d6 Concussive damage per 10 feet fallen</strong> (split 50/50 between Vitality and Health). Acrobatics check reduces effective height by 10 ft per 5 points above DC 15.
              </div>
            </div>

            <div className="bg-slate-950/70 border border-stone-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase text-stone-300 flex items-center gap-1.5">
                  <span>⛏️</span> Burrowing &amp; Subterranean Ops
                </span>
                <span className="font-mono text-[10px] text-stone-400">Base: {burrowBaseSpeed} ft</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Loose soil/sand: Full burrow speed. Hard compacted earth: 1/2 speed. Solid stone: Requires plasma cutter, diamond-drill rig, or Earth invocation.
              </p>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-slate-400">
                Subterranean burrowing grants total cover against surface optical and radar targeting, but can be tracked via seismic sensors (Technology DC 12).
              </div>
            </div>
          </div>
        )}

        {/* 5. Movement Fatigue System */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase text-amber-300">
            <Clock size={14} className="text-amber-400" />
            Movement Fatigue System &amp; Forced March
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Characters can walk or march for 8 hours per day safely. Each hour beyond 8 requires a <strong>Fortitude Saving Throw (DC 10 + 2 per additional hour)</strong>. On failure, the character takes 1d6 Non-Lethal damage and suffers the <em>Fatigued</em> condition (-2 to all physical attribute checks and movement speed reduced by 10 ft).
          </p>
        </div>

      </div>
    </div>
  );
};

export default React.memo(MovementRulesModal);
