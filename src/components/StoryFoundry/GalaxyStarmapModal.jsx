import React, { useState, useMemo } from 'react';
import {
  CANONICAL_SECTORS,
  generateSectorStarmap,
  calculateHyperspaceJumpRoute
} from '../../services/galaxySectorService';
import AudioService from '../../services/audioService';

const GalaxyStarmapModal = ({
  isOpen,
  onClose,
  onBroadcastMessage
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState('hyperion_core');
  const [starmapData, setStarmapData] = useState(() => generateSectorStarmap('hyperion_core'));
  const [selectedSystemId, setSelectedSystemId] = useState('sys_1');
  const [originSystemId, setOriginSystemId] = useState('sys_1');
  const [jumpDriveRating, setJumpDriveRating] = useState(2);

  const selectedSystem = useMemo(() => {
    return starmapData.systems.find(s => s.id === selectedSystemId) || starmapData.systems[0];
  }, [starmapData, selectedSystemId]);

  const originSystem = useMemo(() => {
    return starmapData.systems.find(s => s.id === originSystemId) || starmapData.systems[0];
  }, [starmapData, originSystemId]);

  const jumpRoute = useMemo(() => {
    return calculateHyperspaceJumpRoute(originSystem, selectedSystem, jumpDriveRating);
  }, [originSystem, selectedSystem, jumpDriveRating]);

  if (!isOpen) return null;

  const handleSelectSector = (sectorId) => {
    AudioService.playTerminalBeep(920, 0.1);
    setSelectedSectorId(sectorId);
    const data = generateSectorStarmap(sectorId);
    setStarmapData(data);
    setSelectedSystemId(data.systems[0]?.id || 'sys_1');
    setOriginSystemId(data.systems[0]?.id || 'sys_1');
  };

  const handlePlotCourse = () => {
    if (!jumpRoute) return;
    AudioService.playTerminalBeep(1200, 0.2);

    if (onBroadcastMessage) {
      onBroadcastMessage(`[HYPER-NAV PLOT]: Vector plotted from ${jumpRoute.originName} to ${jumpRoute.destName} — Distance: ${jumpRoute.distanceParsecs} Parsecs | Travel: ${jumpRoute.travelDays} Days | Astrogation DC: ${jumpRoute.navigationDc}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#0b101b] border border-cyan-500/70 rounded-xl p-5 w-full max-w-4xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🌌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wider text-cyan-300">
                  Interactive Galaxy Sector &amp; Planetary Starmap
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-200">
                  ASTROGATION v6.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {starmapData.sector.name} — {starmapData.sector.securityLevel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-400 text-2xl font-bold leading-none px-2 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Sector Switcher Bar */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sector Region:</span>
          <div className="flex gap-1.5 flex-1">
            {CANONICAL_SECTORS.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectSector(sec.id)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  selectedSectorId === sec.id
                    ? 'bg-cyan-600 text-black font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout: Starmap Canvas (Left) + System Dossier (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          {/* Starmap Interactive 2D Parsec Grid Canvas */}
          <div className="md:col-span-2 bg-[#050811] rounded-xl border border-cyan-900/80 p-3 relative h-[360px] overflow-hidden flex flex-col justify-between shadow-inner">
            {/* Background Grid Lines & Nebulae */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* SVG Jump Lanes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {starmapData.jumpLanes.map(lane => {
                const sysA = starmapData.systems.find(s => s.id === lane.fromId);
                const sysB = starmapData.systems.find(s => s.id === lane.toId);
                if (!sysA || !sysB) return null;

                const x1 = `${(sysA.gridX / 9) * 100}%`;
                const y1 = `${(sysA.gridY / 7) * 100}%`;
                const x2 = `${(sysB.gridX / 9) * 100}%`;
                const y2 = `${(sysB.gridY / 7) * 100}%`;

                const isConnectedToSelected = sysA.id === selectedSystemId || sysB.id === selectedSystemId;

                return (
                  <line
                    key={lane.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isConnectedToSelected ? '#06b6d4' : '#334155'}
                    strokeWidth={isConnectedToSelected ? '2' : '1'}
                    strokeDasharray={isConnectedToSelected ? 'none' : '3 3'}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Star System Interactive Nodes */}
            <div className="absolute inset-0">
              {starmapData.systems.map(sys => {
                const left = `${(sys.gridX / 9) * 100}%`;
                const top = `${(sys.gridY / 7) * 100}%`;
                const isSelected = sys.id === selectedSystemId;
                const isOrigin = sys.id === originSystemId;

                return (
                  <div
                    key={sys.id}
                    onClick={() => {
                      AudioService.playTerminalBeep(700, 0.08);
                      setSelectedSystemId(sys.id);
                    }}
                    style={{ left, top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
                  >
                    {/* Star Disc */}
                    <div
                      className={`w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? 'scale-125 ring-4 ring-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
                          : isOrigin
                          ? 'ring-2 ring-amber-400'
                          : 'group-hover:scale-110 shadow-sm'
                      }`}
                      style={{ backgroundColor: sys.starColor }}
                    />

                    {/* Star Label */}
                    <span className={`text-[10px] font-mono whitespace-nowrap mt-1 px-1.5 py-0.5 rounded transition-all ${
                      isSelected
                        ? 'bg-cyan-950/90 text-cyan-200 font-bold border border-cyan-500'
                        : 'bg-black/70 text-slate-300 group-hover:text-white'
                    }`}>
                      {sys.name} {isOrigin ? '(Base)' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Canvas Legend Overlay */}
            <div className="absolute bottom-2 left-2 z-10 text-[9px] font-mono text-slate-500 bg-black/80 px-2 py-1 rounded border border-slate-800 flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Selected</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Origin/Ship</span>
              <span className="text-slate-400">Jump Lanes: Solid Cyan = Direct Corridors</span>
            </div>
          </div>

          {/* Right Column: Planetary Telemetry & Astrogation Plotter */}
          <div className="flex flex-col gap-3">
            {/* System Dossier Card */}
            {selectedSystem && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div>
                    <h4 className="font-bold text-sm text-cyan-300">{selectedSystem.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedSystem.starType}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                    TL {selectedSystem.techLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">UWP Profile:</span>
                    <span className="text-amber-300 font-bold">{selectedSystem.uwp}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Starport:</span>
                    <span className="text-emerald-400 font-bold">Class {selectedSystem.starport}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800 col-span-2">
                    <span className="text-slate-500 block">Faction Authority:</span>
                    <span className="text-purple-300 font-bold">{selectedSystem.faction}</span>
                  </div>
                </div>

                {/* Point of Interest */}
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-amber-400">Point of Interest:</span>
                  <p className="text-[11px] text-slate-200">{selectedSystem.poi}</p>
                </div>
              </div>
            )}

            {/* Hyperspace Astrogation Plotter */}
            {jumpRoute && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/50 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 flex items-center gap-1">
                    <span>🧭</span> Hyperspace Course Plot
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    jumpRoute.isReachable ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}>
                    {jumpRoute.isReachable ? '✓ IN JUMP RANGE' : '⚠️ OUT OF RANGE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Distance:</span>
                    <span className="text-cyan-300 font-bold">{jumpRoute.distanceParsecs} Parsecs</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Transit Time:</span>
                    <span className="text-amber-300 font-bold">{jumpRoute.travelDays} Days</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Fuel Cells:</span>
                    <span className="text-emerald-400 font-bold">{jumpRoute.fuelTonsRequired} Tons</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Astrogation DC:</span>
                    <span className="text-purple-300 font-bold">DC {jumpRoute.navigationDc}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlotCourse}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-sm active:scale-95 cursor-pointer mt-1"
                >
                  📡 Broadcast Nav-Vector
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            Close Galaxy Starmap
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalaxyStarmapModal;
