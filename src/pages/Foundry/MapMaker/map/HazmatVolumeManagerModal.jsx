import React, { useState } from 'react';
import { HAZMAT_TYPES, evaluateHazmatTick } from '../../../../services/hazmatVolumeService';
import { AudioService } from '../../../../services/audioService';

const HazmatVolumeManagerModal = ({
  isOpen,
  onClose,
  hazardZones = [],
  onAddHazardZone,
  onUpdateHazardZone,
  onDeleteHazardZone,
  tokens = [],
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenStructure,
  onUpdateTokenConditions,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState('radiation_leak');
  const [zoneLabel, setZoneLabel] = useState('Radiation Hotspot');
  const [zoneRadius, setZoneRadius] = useState(120);
  const [saveDc, setSaveDc] = useState(14);
  const [tickDamage, setTickDamage] = useState(6);
  const [appliedCondition, setAppliedCondition] = useState('Irradiated');

  const handleTypeSelect = (typeKey) => {
    const haz = HAZMAT_TYPES[typeKey];
    if (!haz) return;
    setSelectedType(typeKey);
    setZoneLabel(haz.name);
    setSaveDc(haz.saveDc);
    setTickDamage(haz.tickDamage);
    setAppliedCondition(haz.condition);
  };

  const handleCreateZone = () => {
    AudioService.playTerminalBeep(650, 0.15);
    const newZone = {
      id: `haz_${Date.now()}`,
      type: selectedType,
      label: zoneLabel,
      shape: 'circle',
      x: 300 + Math.random() * 200,
      y: 300 + Math.random() * 200,
      radius: parseInt(zoneRadius, 10) || 120,
      saveDc: parseInt(saveDc, 10) || 14,
      tickDamage: parseInt(tickDamage, 10) || 6,
      condition: appliedCondition,
      color: selectedType === 'radiation_leak' ? '#eab308' : selectedType === 'toxic_gas' ? '#22c55e' : selectedType === 'vacuum_breach' ? '#a855f7' : selectedType === 'plasma_fire' ? '#f97316' : '#06b6d4'
    };

    onAddHazardZone?.(newZone);
  };

  const handleTriggerAllTicks = () => {
    AudioService.playCombatHit(true);
    let affectedCount = 0;

    tokens.forEach(tok => {
      const results = evaluateHazmatTick(tok, hazardZones);
      results.forEach(res => {
        affectedCount++;
        const effDmg = res.damage || 0;
        if (effDmg > 0) {
          if (tok.isSynthetic || tok.structure) {
            onUpdateTokenStructure?.(tok.id, Math.max(0, (tok.structure?.current || 30) - effDmg), true, effDmg);
          } else {
            onUpdateTokenHealth?.(tok.id, Math.max(0, (tok.health?.current || 30) - effDmg), true, effDmg);
          }
        }

        if (res.condition) {
          const curConds = tok.conditions || [];
          if (!curConds.includes(res.condition)) {
            onUpdateTokenConditions?.(tok.id, [...curConds, res.condition]);
          }
        }

        if (onTriggerFloatingText) {
          const screenX = (tok.x || 0) * scale + position.x;
          const screenY = (tok.y || 0) * scale + position.y;
          onTriggerFloatingText(screenX, screenY, `⚠️ HAZMAT -${effDmg} (${res.condition || 'TICK'})`, 'damage');
        }
      });
    });

    if (affectedCount === 0) {
      alert('No tokens currently positioned inside active hazard zones.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0f172a] border border-amber-500/60 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.25)] w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] overflow-hidden flex flex-col text-slate-200 font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">☢️</span>
            <div>
              <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider">
                Hazmat & Environmental Volume Manager
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Dynamic Radiation, Toxic Gas, Vacuum & Zero-G Environmental Sectors
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
          {/* Column 1: Add New Hazard Zone */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Deploy New Hazard Sector
            </span>

            {/* Template Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(HAZMAT_TYPES).map(([key, haz]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeSelect(key)}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedType === key
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{haz.icon}</span>
                  <span className="text-[10px] font-bold truncate">{haz.name}</span>
                </button>
              ))}
            </div>

            {/* Zone Config Inputs */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Zone Label</label>
                <input
                  type="text"
                  value={zoneLabel}
                  onChange={(e) => setZoneLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Radius (px)</label>
                  <input
                    type="number"
                    value={zoneRadius}
                    onChange={(e) => setZoneRadius(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Save DC</label>
                  <input
                    type="number"
                    value={saveDc}
                    onChange={(e) => setSaveDc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Tick Dmg</label>
                  <input
                    type="number"
                    value={tickDamage}
                    onChange={(e) => setTickDamage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateZone}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer mt-1 flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>➕</span> Add Zone to Canvas
            </button>
          </div>

          {/* Column 2: Active Hazard Zones List & Global Trigger */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Map Hazard Zones ({hazardZones.length})
              </span>
              <button
                type="button"
                onClick={handleTriggerAllTicks}
                disabled={hazardZones.length === 0}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-[10px] uppercase rounded transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>⚡</span> Trigger Turn Tick
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1">
              {hazardZones.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No active hazard zones defined on current battlemap.
                </div>
              ) : (
                hazardZones.map((zone) => {
                  const hazType = HAZMAT_TYPES[zone.type] || HAZMAT_TYPES.radiation_leak;
                  return (
                    <div
                      key={zone.id}
                      className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{hazType.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">
                            {zone.label || hazType.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            DC {zone.saveDc} • Dmg: {zone.tickDamage} • Radius: {zone.radius}px
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteHazardZone?.(zone.id)}
                        className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] transition-colors cursor-pointer shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazmatVolumeManagerModal;
