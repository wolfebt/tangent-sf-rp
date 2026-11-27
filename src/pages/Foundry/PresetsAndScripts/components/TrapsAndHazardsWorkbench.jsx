/**
 * @file TrapsAndHazardsWorkbench.jsx
 * @description Pillar 3: Reactive Traps & Proximity Hazards Workbench.
 * Manages spatial reactive triggers (plasma mines, laser tripwires, neurotoxin vents),
 * hackable terminals, and bulkheads across the module's tactical maps with real-time persistence.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Radio, 
  Lock, 
  Unlock,
  MapPin,
  Cpu
} from 'lucide-react';
import { TRAP_TYPES } from '../../../../services/reactiveVttService';
import { AudioService } from '../../../../services/audioService';

export const TrapsAndHazardsWorkbench = ({
  selectedAsset = null,
  allMaps = [],
  selectedMapId = null,
  onSelectMapId,
  onUpdateMapObjects,
  onUpdateHazardElement,
  onDeleteHazardElement
}) => {
  const [deployKind, setDeployKind] = useState('proximity_plasma_mine');
  const [deployX, setDeployX] = useState(350);
  const [deployY, setDeployY] = useState(350);
  const isSelectedCatalogHazard =
    selectedAsset?.source === 'elementsCatalog' && selectedAsset?.catalogCategory === 'props_traps';

  // If selectedAsset is a map or a map object, resolve target map
  const activeMapId = selectedAsset?.catalogCategory === 'maps'
    ? selectedAsset.rawId
    : selectedAsset?.mapId || selectedMapId || allMaps[0]?.id || '';

  const activeMap = useMemo(() => {
    return allMaps.find(m => m.id === activeMapId) || allMaps[0] || null;
  }, [allMaps, activeMapId]);

  const mapObjects = useMemo(() => {
    return activeMap?.objects || [];
  }, [activeMap]);

  // Extract traps and interactive props
  const reactiveObjects = useMemo(() => {
    return mapObjects.filter(obj => 
      obj.isTrap || 
      obj.type === 'hazard' || 
      obj.category === 'hazard' || 
      obj.objectType === 'security_terminal' ||
      obj.objectType === 'blast_door' ||
      Boolean(TRAP_TYPES[obj.trapType || obj.type])
    );
  }, [mapObjects]);

  // Selected object state
  const [selectedObjectId, setSelectedObjectId] = useState(
    selectedAsset?.catalogCategory === 'props_traps' ? selectedAsset.rawId : reactiveObjects[0]?.id || ''
  );

  useEffect(() => {
    if (selectedAsset?.catalogCategory === 'props_traps' && selectedAsset?.rawId) {
      setSelectedObjectId(selectedAsset.rawId);
    }
  }, [selectedAsset?.catalogCategory, selectedAsset?.rawId]);

  const activeObject = useMemo(() => {
    if (isSelectedCatalogHazard && selectedAsset) {
      const f = selectedAsset.fields || selectedAsset.scriptData || {};
      return {
        id: selectedAsset.rawId,
        name: selectedAsset.title,
        label: selectedAsset.title,
        type: 'hazard',
        isTrap: true,
        isCatalogElement: true,
        ...f
      };
    }
    return reactiveObjects.find(o => o.id === selectedObjectId) || reactiveObjects[0] || null;
  }, [isSelectedCatalogHazard, selectedAsset, reactiveObjects, selectedObjectId]);

  // Handle atomic multi-field object patch (avoids stale-closure overwrites across sequential calls)
  const handlePatchObject = (objId, patch) => {
    if (!patch) return;
    if (isSelectedCatalogHazard && activeObject?.isCatalogElement && typeof onUpdateHazardElement === 'function') {
      onUpdateHazardElement(objId, patch);
      return;
    }
    if (!activeMap || !onUpdateMapObjects) return;
    const nextObjects = mapObjects.map(o => {
      if (o.id === objId) {
        return { ...o, ...patch };
      }
      return o;
    });
    onUpdateMapObjects(activeMap.id, nextObjects);
  };

  // Handle single object property update
  const handleUpdateObject = (objId, key, value) => {
    handlePatchObject(objId, { [key]: value });
  };

  // Add new Reactive Trap, Terminal, or Bulkhead to active map
  const handleAddTrap = (trapTypeKey = deployKind) => {
    if (!activeMap || !onUpdateMapObjects) return;
    AudioService.playTerminalBeep(1200, 0.05);

    const kindKey = typeof trapTypeKey === 'string' ? trapTypeKey : deployKind;
    const xPos = Number.isFinite(Number(deployX)) ? Number(deployX) : 350;
    const yPos = Number.isFinite(Number(deployY)) ? Number(deployY) : 350;

    let newObj;
    if (kindKey === 'security_terminal') {
      newObj = {
        id: `term-${Date.now()}`,
        name: 'Security Terminal',
        label: 'Security Terminal',
        type: 'security_terminal',
        objectType: 'security_terminal',
        category: 'terminal',
        x: xPos,
        y: yPos,
        width: 40,
        height: 40,
        hackDc: 13,
        clueText: '',
        isOpen: false,
        description: 'Encrypted sector terminal capable of releasing intel or overriding locks.'
      };
    } else if (kindKey === 'blast_door') {
      newObj = {
        id: `door-${Date.now()}`,
        name: 'Blast Bulkhead',
        label: 'Blast Bulkhead',
        type: 'blast_door',
        objectType: 'blast_door',
        category: 'door',
        x: xPos,
        y: yPos,
        width: 50,
        height: 50,
        strengthDc: 15,
        doorState: 'closed',
        isOpen: false,
        description: 'Reinforced motorized bulkhead door.'
      };
    } else {
      const baseConfig = TRAP_TYPES[kindKey] || TRAP_TYPES.proximity_plasma_mine;
      newObj = {
        id: `trap-${Date.now()}`,
        name: baseConfig.name,
        label: baseConfig.name,
        type: 'hazard',
        category: 'hazard',
        isTrap: true,
        trapType: kindKey,
        trapState: 'armed',
        x: xPos,
        y: yPos,
        width: 40,
        height: 40,
        triggerRadius: baseConfig.triggerRadiusPx,
        saveCr: baseConfig.saveCr,
        saveType: baseConfig.saveType,
        damageDice: baseConfig.damageDice,
        baseDamage: baseConfig.baseDamage,
        appliedCondition: baseConfig.appliedCondition,
        disarmDc: baseConfig.disarmDc,
        description: baseConfig.description
      };
    }

    const nextObjects = [...mapObjects, newObj];
    onUpdateMapObjects(activeMap.id, nextObjects);
    setSelectedObjectId(newObj.id);
  };

  // Remove object (or delete catalog hazard element)
  const handleRemoveObject = (objId) => {
    if (isSelectedCatalogHazard && activeObject?.isCatalogElement) {
      if (typeof onDeleteHazardElement === 'function') {
        AudioService.playTerminalBeep(550, 0.05);
        onDeleteHazardElement(objId);
      }
      return;
    }
    if (!activeMap || !onUpdateMapObjects) return;
    AudioService.playTerminalBeep(550, 0.05);
    const nextObjects = mapObjects.filter(o => o.id !== objId);
    onUpdateMapObjects(activeMap.id, nextObjects);
    if (selectedObjectId === objId) {
      setSelectedObjectId(nextObjects[0]?.id || '');
    }
  };

  if (!activeMap && !isSelectedCatalogHazard) {
    return (
      <div className="h-full rounded-2xl bg-[#0c121e] border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-3 font-sans">
        <ShieldAlert size={36} className="text-rose-400 opacity-60" />
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          No Tactical Map Found
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Create or import a tactical map in Map Architect to deploy reactive traps and smart props.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 font-sans select-none text-slate-100 overflow-hidden">
      {/* ── TOP MAP SELECTOR & ACTIONS ── */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Reactive Traps & Smart Props Matrix
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                {reactiveObjects.length} Nodes Armed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Proximity sensors, laser tripwires, hackable bulkheads and environmental vents for Sector: {activeMap?.title || activeMap?.name || 'Catalog Hazard'}.
            </p>
          </div>
        </div>

        {/* Map Switcher & Add Trap Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {allMaps.length > 1 && (
            <select
              value={activeMap?.id || ''}
              onChange={(e) => onSelectMapId?.(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              {allMaps.map(m => (
                <option key={m.id} value={m.id}>{m.title || m.name || 'Sector'}</option>
              ))}
            </select>
          )}

          <select
            aria-label="Deploy Node Kind"
            value={deployKind}
            onChange={(e) => setDeployKind(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-400"
          >
            {Object.entries(TRAP_TYPES).map(([k, t]) => (
              <option key={k} value={k}>{t.name}</option>
            ))}
            <option value="security_terminal">Security Terminal (ICE)</option>
            <option value="blast_door">Blast Bulkhead / Door</option>
          </select>

          <label className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span>X</span>
            <input
              type="number"
              aria-label="Deploy X Coordinate"
              value={deployX}
              onChange={(e) => setDeployX(parseInt(e.target.value, 10) || 0)}
              className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
            />
          </label>
          <label className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span>Y</span>
            <input
              type="number"
              aria-label="Deploy Y Coordinate"
              value={deployY}
              onChange={(e) => setDeployY(parseInt(e.target.value, 10) || 0)}
              className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
            />
          </label>

          <button
            type="button"
            disabled={!activeMap}
            onClick={() => handleAddTrap(deployKind)}
            title={activeMap ? 'Deploy node onto active map' : 'Select or create a tactical map first'}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-500/50 text-rose-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>Deploy Trap</span>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKBENCH: NODE ROSTER & DETAIL EDITOR ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left Column: Trap Nodes Roster */}
        <div className="lg:col-span-1 rounded-2xl bg-[#0c121e] border border-slate-800 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Armed Map Nodes ({reactiveObjects.length})
            </div>

            {reactiveObjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No reactive traps or smart props on this sector yet. Click &ldquo;Deploy Trap&rdquo; above.
              </div>
            ) : (
              reactiveObjects.map(obj => {
                const isSelected = obj.id === activeObject?.id;
                const isDisarmed = obj.trapState === 'disarmed';
                return (
                  <div
                    key={obj.id}
                    onClick={() => {
                      AudioService.playTerminalBeep(980, 0.02);
                      setSelectedObjectId(obj.id);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white line-clamp-1">
                        {obj.label || obj.name || 'Hazard Node'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {obj.trapType || obj.objectType || 'Hazard'} · DC {obj.saveCr || obj.hackDc || 14}
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      isDisarmed 
                        ? 'bg-slate-950 text-slate-500 border-slate-800' 
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}>
                      {isDisarmed ? 'Disarmed' : 'Armed'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 mt-2 text-[10px] font-mono text-slate-400">
            ⚡ Nodes dynamically evaluate Reflex/Tech saves during operator movement.
          </div>
        </div>

        {/* Right Column: Active Node Inspector & DC Configurator */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0c121e] border border-slate-800 p-5 shadow-lg overflow-y-auto">
          {activeObject ? (
            <div className="space-y-4">
              {/* Header with Title and Delete */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeObject.label || activeObject.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300">
                      {activeObject.trapType || activeObject.objectType || 'Hazard'}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <span>Position:</span>
                    <label className="flex items-center gap-1">
                      <span>X=</span>
                      <input
                        type="number"
                        aria-label="Node X Coordinate"
                        value={activeObject.x ?? 0}
                        disabled={Boolean(activeObject.isCatalogElement)}
                        onChange={(e) => handleUpdateObject(activeObject.id, 'x', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 disabled:opacity-50"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span>Y=</span>
                      <input
                        type="number"
                        aria-label="Node Y Coordinate"
                        value={activeObject.y ?? 0}
                        disabled={Boolean(activeObject.isCatalogElement)}
                        onChange={(e) => handleUpdateObject(activeObject.id, 'y', parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 disabled:opacity-50"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateObject(
                      activeObject.id, 
                      'trapState', 
                      activeObject.trapState === 'disarmed' ? 'armed' : 'disarmed'
                    )}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer border ${
                      activeObject.trapState === 'disarmed'
                        ? 'bg-slate-900 text-slate-400 border-slate-700'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {activeObject.trapState === 'disarmed' ? 'Arm Trap' : 'Disarm'}
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(activeObject.isCatalogElement && typeof onDeleteHazardElement !== 'function')}
                    onClick={() => handleRemoveObject(activeObject.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title={
                      activeObject.isCatalogElement && typeof onDeleteHazardElement !== 'function'
                        ? 'Delete catalog hazards in Element Forge'
                        : 'Remove from map'
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Trap Type Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Hazard Classification & Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(TRAP_TYPES).map(([k, t]) => {
                    const isCurrent = activeObject.trapType === k;
                    return (
                      <div
                        key={k}
                        onClick={() => {
                          AudioService.playTerminalBeep(1100, 0.02);
                          handlePatchObject(activeObject.id, {
                            name: t.name,
                            label: t.name,
                            trapType: k,
                            triggerRadius: t.triggerRadiusPx,
                            saveCr: t.saveCr,
                            saveType: t.saveType,
                            damageDice: t.damageDice,
                            baseDamage: t.baseDamage,
                            appliedCondition: t.appliedCondition,
                            disarmDc: t.disarmDc,
                            description: t.description
                          });
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{t.icon}</span>
                          <span className="truncate">{t.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {t.saveType} · DC {t.saveCr} · {t.damageDice}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal / Bulkhead Specific Controls */}
              {(activeObject.objectType === 'security_terminal' || activeObject.objectType === 'blast_door') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-cyan-500/30 rounded-xl font-mono">
                  {activeObject.objectType === 'security_terminal' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-cyan-300">
                          ICE Hack DC (Slicing)
                        </label>
                        <input
                          type="number"
                          value={activeObject.hackDc ?? 13}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10);
                            handleUpdateObject(activeObject.id, 'hackDc', Number.isNaN(parsed) ? 13 : parsed);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-cyan-300">
                          Unlocked Clue / Payload Text
                        </label>
                        <input
                          type="text"
                          value={activeObject.clueText ?? ''}
                          onChange={(e) => handleUpdateObject(activeObject.id, 'clueText', e.target.value)}
                          placeholder="Decrypted intel revealed on breach..."
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
                        />
                      </div>
                    </>
                  )}
                  {activeObject.objectType === 'blast_door' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-amber-300">
                          Forced Breach Strength DC
                        </label>
                        <input
                          type="number"
                          value={activeObject.strengthDc ?? 15}
                          onChange={(e) => {
                            const parsed = parseInt(e.target.value, 10);
                            handleUpdateObject(activeObject.id, 'strengthDc', Number.isNaN(parsed) ? 15 : parsed);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-amber-300">
                          Bulkhead Door State
                        </label>
                        <select
                          value={activeObject.doorState ?? 'closed'}
                          onChange={(e) => {
                            const nextState = e.target.value;
                            handlePatchObject(activeObject.id, {
                              doorState: nextState,
                              isOpen: nextState === 'open' || nextState === 'breached'
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-700 text-xs text-amber-200 p-2 rounded-lg outline-none focus:border-amber-400"
                        >
                          <option value="closed">Closed</option>
                          <option value="open">Open</option>
                          <option value="locked">Locked / Mag-Sealed</option>
                          <option value="breached">Breached</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sliders: Trigger Radius, Save CR, Base Damage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Trigger Radius</span>
                    <span className="text-cyan-300">{activeObject.triggerRadius ?? 60}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="10"
                    value={activeObject.triggerRadius ?? 60}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      handleUpdateObject(activeObject.id, 'triggerRadius', Number.isNaN(parsed) ? 60 : parsed);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Save DC</span>
                    <span className="text-amber-300">DC {activeObject.saveCr ?? 14}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    step="1"
                    value={activeObject.saveCr ?? 14}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      handleUpdateObject(activeObject.id, 'saveCr', Number.isNaN(parsed) ? 14 : parsed);
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Base Damage</span>
                    <span className="text-rose-400">{activeObject.baseDamage ?? 15} HP</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={activeObject.baseDamage ?? 15}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      handleUpdateObject(activeObject.id, 'baseDamage', Number.isNaN(parsed) ? 15 : parsed);
                    }}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Condition Applied */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Condition Applied on Failed Save
                  </label>
                  <select
                    value={activeObject.appliedCondition || 'None'}
                    onChange={(e) => handleUpdateObject(activeObject.id, 'appliedCondition', e.target.value === 'None' ? null : e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-rose-300 p-2 rounded-lg outline-none focus:border-rose-400"
                  >
                    <option value="None">None (Damage Only)</option>
                    <option value="Burning">Burning (1d6 heat damage / round)</option>
                    <option value="Stunned">Stunned (Lose 1 Action Point)</option>
                    <option value="Poisoned">Poisoned (-2 to all attack rolls)</option>
                    <option value="Slowed">Slowed (Speed reduced by 50%)</option>
                  </select>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Disarm / Slicing DC
                  </label>
                  <input
                    type="number"
                    value={activeObject.disarmDc ?? 13}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      handleUpdateObject(activeObject.id, 'disarmDc', Number.isNaN(parsed) ? 10 : parsed);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 p-2 rounded-lg outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs font-mono">
              Select an armed node from the left list to configure triggers and saving throws.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrapsAndHazardsWorkbench;
