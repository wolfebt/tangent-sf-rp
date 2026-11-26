import React from 'react';

const HALO_SWATCHES = [
  { name: 'Cyan', color: '#22d3ee' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Gold', color: '#eab308' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'White', color: '#ffffff' }
];

const LIGHT_SWATCHES = ['#f59e0b', '#38bdf8', '#22c55e', '#ef4444', '#a855f7', '#ffffff'];

const WALL_TYPE_OPTIONS = [
  { value: 'solid', label: 'Solid Bulkhead' },
  { value: 'door', label: 'Standard Door' },
  { value: 'secret_door', label: 'Secret Door' },
  { value: 'window', label: 'Window / Viewport' },
  { value: 'airlock', label: 'Airlock' },
  { value: 'forcefield', label: 'Forcefield' },
  { value: 'glass', label: 'Reinforced Glass' },
  { value: 'ethereal', label: 'Ethereal Barrier' },
  { value: 'one_way', label: 'One-Way Barrier' }
];

const DOOR_STATE_OPTIONS = [
  { value: 'closed', label: 'Closed' },
  { value: 'open', label: 'Open' },
  { value: 'locked', label: 'Locked' },
  { value: 'sealed', label: 'Sealed' },
  { value: 'breached', label: 'Breached' }
];

const LIGHT_ANIMATIONS = [
  { value: 'none', label: 'Steady' },
  { value: 'flicker', label: 'Flicker' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'torch', label: 'Torch / Fire' },
  { value: 'strobe', label: 'Strobe' }
];

const REGION_TRIGGER_TYPES = [
  { value: 'roof_zone', label: 'Roof Canopy' },
  { value: 'hazard', label: 'Hazard Zone' },
  { value: 'teleport_deck', label: 'Teleport Pad' },
  { value: 'switch_map', label: 'Map Transition' },
  { value: 'story_flag', label: 'Story Flag Trigger' },
  { value: 'audio_cue', label: 'Audio Cue / Ambience' },
  { value: 'roof', label: 'Roof (Legacy)' },
  { value: 'teleport', label: 'Teleport (Legacy)' },
  { value: 'audio_zone', label: 'Ambience (Legacy)' }
];

export const SelectedElementInspectorBar = ({
  currentMap,
  selectedId,
  isStoryReadOnly = false,
  availableMaps = [],
  activeMapId,
  onUpdateToken,
  onUpdateObject,
  onUpdateWall,
  onUpdateLight,
  onUpdateText,
  onUpdateRegion,
  onToggleCurvedWall,
  onInspectOmnicortexItem,
  onInspectStoryElement,
  onRecordHistory,
  onDeleteSelected,
  onClose
}) => {
  if (!currentMap || !selectedId) return null;

  const tokens = currentMap.tokens || [];
  const objects = currentMap.objects || [];
  const walls = currentMap.walls || [];
  const lights = currentMap.lights || [];
  const texts = currentMap.texts || [];
  const regions = currentMap.regions || [];

  const selectedToken = tokens.find((t) => t.id === selectedId);
  const selectedObject = objects.find((o) => o.id === selectedId);
  const selectedWall = walls.find((w) => w.id === selectedId);
  const selectedLight = lights.find((l) => l.id === selectedId);
  const selectedText = texts.find((t) => t.id === selectedId);
  const selectedRegion = regions.find((r) => r.id === selectedId);

  const entityKind = selectedToken
    ? selectedToken.type === 'link'
      ? 'portal'
      : 'unit'
    : selectedObject
    ? 'object'
    : selectedWall
    ? 'wall'
    : selectedLight
    ? 'light'
    : selectedText
    ? 'text'
    : selectedRegion
    ? 'region'
    : null;

  if (!entityKind) return null;

  const item = selectedToken || selectedObject || selectedWall || selectedLight || selectedText || selectedRegion;

  const recordDiscrete = (label) => {
    if (isStoryReadOnly) return;
    onRecordHistory?.(label);
  };

  const recordCoalesced = (label) => {
    if (isStoryReadOnly) return;
    onRecordHistory?.(label, { coalesceKey: `inspector_${selectedId}` });
  };

  const badgeConfig = {
    portal: { text: '🌌 Portal', cls: 'bg-purple-950 text-purple-300 border-purple-700' },
    unit: { text: '⚔️ Unit', cls: 'bg-amber-950 text-amber-300 border-amber-700' },
    object: { text: selectedObject?.hazard ? '⚠️ Hazard' : '🏢 Object', cls: 'bg-cyan-950 text-cyan-300 border-[#0D5C63]' },
    wall: { text: String(selectedWall?.type || '').includes('door') || selectedWall?.type === 'airlock' ? '🚪 Door' : '🧱 Wall', cls: 'bg-slate-900 text-amber-300 border-amber-600/60' },
    light: { text: '💡 Light', cls: 'bg-amber-950/90 text-amber-200 border-amber-500/60' },
    text: { text: '🔤 Text Label', cls: 'bg-indigo-950 text-indigo-300 border-indigo-600/60' },
    region: { text: '🗺️ Region', cls: 'bg-purple-950 text-purple-200 border-purple-500/60' }
  }[entityKind];

  const isDoorLike =
    entityKind === 'wall' &&
    ['door', 'secret_door', 'airlock'].includes(String(selectedWall?.type || '').toLowerCase());

  const computeDefaultBezier = (w) => {
    if (!w?.p1 || !w?.p2) return { x: 0, y: 0 };
    const mx = (w.p1.x + w.p2.x) / 2;
    const my = (w.p1.y + w.p2.y) / 2;
    const dx = w.p2.x - w.p1.x;
    const dy = w.p2.y - w.p1.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    return {
      x: Math.round(mx - (dy / dist) * (dist * 0.25)),
      y: Math.round(my + (dx / dist) * (dist * 0.25))
    };
  };

  return (
    <div
      className="relative z-[80] bg-[#161b22]/95 p-2 border-b border-[#0D5C63]/60 flex items-center justify-between text-xs gap-3 flex-wrap text-slate-200 backdrop-blur-md"
      data-testid="selected-element-inspector"
    >
      <div className="flex items-center gap-2.5 flex-wrap w-full">
        <div className="flex items-center gap-1.5 font-bold">
          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${badgeConfig.cls}`}>
            {badgeConfig.text}
          </span>
          {isStoryReadOnly && (
            <span className="px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-950/60 text-amber-300 text-[10px] uppercase font-mono">
              Read-Only
            </span>
          )}
        </div>

        {/* TOKENS, PORTALS & OBJECTS */}
        {(entityKind === 'unit' || entityKind === 'portal' || entityKind === 'object') && (
          <>
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-label" className="text-[10px] font-bold text-cyan-400 uppercase">Label:</label>
              <input
                id="inspector-label"
                type="text"
                disabled={isStoryReadOnly}
                value={item.label || ''}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  const patch = { ...item, label: e.target.value };
                  if (entityKind === 'object') onUpdateObject?.(patch);
                  else onUpdateToken?.(patch);
                }}
                placeholder="Element name..."
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-36 font-semibold disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <span>😇</span> Halo:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isStoryReadOnly}
                  onClick={() => {
                    recordDiscrete('Edit Halo');
                    const patch = { ...item, haloColor: null };
                    if (entityKind === 'object') onUpdateObject?.(patch);
                    else onUpdateToken?.(patch);
                  }}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors disabled:opacity-50 ${
                    !item.haloColor
                      ? 'border-[#22d3ee] bg-cyan-950 text-[#22d3ee]'
                      : 'border-[#0D5C63]/40 bg-[#161b22] text-slate-400 hover:text-white'
                  }`}
                  title="Turn Off Halo"
                >
                  Off
                </button>
                {HALO_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    disabled={isStoryReadOnly}
                    onClick={() => {
                      recordDiscrete('Edit Halo');
                      const patch = { ...item, haloColor: swatch.color };
                      if (entityKind === 'object') onUpdateObject?.(patch);
                      else onUpdateToken?.(patch);
                    }}
                    className={`w-4 h-4 rounded-full border transition-all disabled:opacity-50 ${
                      item.haloColor === swatch.color
                        ? 'border-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                    title={`${swatch.name} Halo`}
                  />
                ))}
              </div>
            </div>

            {entityKind === 'object' && (
              <>
                <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                  <label htmlFor="inspector-obj-w" className="text-[10px] font-bold text-cyan-400 uppercase">W:</label>
                  <input
                    id="inspector-obj-w"
                    type="number"
                    min={10}
                    max={2000}
                    disabled={isStoryReadOnly}
                    value={Math.round(item.width || (item.radius ? item.radius * 2 : 50))}
                    onChange={(e) => {
                      recordCoalesced('Edit Element');
                      const w = Math.max(10, Number(e.target.value) || 10);
                      onUpdateObject?.({ ...item, width: w, radius: Math.max(w, item.height || w) / 2 });
                    }}
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
                  />
                  <label htmlFor="inspector-obj-h" className="text-[10px] font-bold text-cyan-400 uppercase">H:</label>
                  <input
                    id="inspector-obj-h"
                    type="number"
                    min={10}
                    max={2000}
                    disabled={isStoryReadOnly}
                    value={Math.round(item.height || (item.radius ? item.radius * 2 : 50))}
                    onChange={(e) => {
                      recordCoalesced('Edit Element');
                      const h = Math.max(10, Number(e.target.value) || 10);
                      onUpdateObject?.({ ...item, height: h, radius: Math.max(item.width || h, h) / 2 });
                    }}
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
                  />
                </div>

                {(item.isStoryElement || item.linkedStoryElement || item.storyElementType) && (
                  <button
                    type="button"
                    onClick={() => onInspectStoryElement?.(item.linkedStoryElement || item)}
                    className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-200 rounded text-xs font-mono font-bold uppercase tracking-wider"
                  >
                    📖 Story Sheet
                  </button>
                )}
              </>
            )}

            {entityKind === 'unit' && (
              <>
                <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                  <label htmlFor="inspector-faction" className="text-[10px] font-bold text-amber-400 uppercase">Faction:</label>
                  <select
                    id="inspector-faction"
                    disabled={isStoryReadOnly}
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-amber-400 disabled:opacity-50"
                    value={item.designation || 'Adversary'}
                    onChange={(e) => {
                      recordDiscrete('Edit Token Faction');
                      const des = e.target.value;
                      const fill = des === 'Ally' ? '#10b981' : des === 'Adversary' ? '#ef4444' : des === 'Player' ? '#0284c7' : '#a855f7';
                      onUpdateToken?.({ ...item, designation: des, fill });
                    }}
                  >
                    <option value="Player">Operator</option>
                    <option value="Ally">Ally</option>
                    <option value="Adversary">Adversary</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                  <label htmlFor="inspector-role" className="text-[10px] font-bold text-cyan-400 uppercase">Role:</label>
                  <input
                    id="inspector-role"
                    type="text"
                    disabled={isStoryReadOnly}
                    value={item.role || ''}
                    onChange={(e) => {
                      recordCoalesced('Edit Element');
                      onUpdateToken?.({ ...item, role: e.target.value });
                    }}
                    placeholder="Role (e.g. Tactical)..."
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-24 font-semibold disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                  <label htmlFor="inspector-size" className="text-[10px] font-bold text-slate-400 uppercase">Size:</label>
                  <select
                    id="inspector-size"
                    disabled={isStoryReadOnly}
                    className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-cyan-400 disabled:opacity-50"
                    value={item.radius || 35}
                    onChange={(e) => {
                      recordDiscrete('Resize Token');
                      onUpdateToken?.({ ...item, radius: parseInt(e.target.value, 10) });
                    }}
                  >
                    <option value="25">Small (25px)</option>
                    <option value="35">Medium (35px)</option>
                    <option value="50">Large (50px)</option>
                    <option value="70">Huge (70px)</option>
                  </select>
                </div>
              </>
            )}

            {(item.linkedOmnicortexItem || item.omnicortexId) && (
              <button
                type="button"
                onClick={() => onInspectOmnicortexItem?.(item.linkedOmnicortexItem || { id: item.omnicortexId, name: item.label, category: item.omnicortexCategory || 'compendium' })}
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                title="Open Omnicortex Compendium Item Sheet"
              >
                <span>🧠</span> Omnicortex Sheet
              </button>
            )}

            {entityKind === 'portal' && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-portal-target" className="text-[10px] font-bold text-purple-400 uppercase">Target Map:</label>
                <select
                  id="inspector-portal-target"
                  disabled={isStoryReadOnly}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-purple-400 relative z-10 disabled:opacity-50"
                  value={item.targetMapId || ''}
                  onChange={(e) => {
                    recordDiscrete('Link Portal Target');
                    const targetMap = availableMaps.find((m) => m.id === e.target.value);
                    onUpdateToken?.({
                      ...item,
                      targetMapId: e.target.value,
                      label: targetMap ? targetMap.title : item.label
                    });
                  }}
                >
                  <option value="" disabled>Select Target Map...</option>
                  {availableMaps.filter((m) => m.id !== activeMapId).map((m) => (
                    <option key={m.id} value={m.id}>{m.title} [{m.type}]</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* WALLS & DOORS */}
        {entityKind === 'wall' && (
          <>
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-wall-type" className="text-[10px] font-bold text-cyan-400 uppercase">Wall Type:</label>
              <select
                id="inspector-wall-type"
                disabled={isStoryReadOnly}
                value={selectedWall.type || 'solid'}
                onChange={(e) => {
                  recordDiscrete('Change Wall Type');
                  const nextType = e.target.value;
                  const doorLike = ['door', 'secret_door', 'airlock'].includes(nextType);
                  onUpdateWall?.(selectedWall.id, {
                    type: nextType,
                    doorState: doorLike ? (selectedWall.doorState || 'closed') : null,
                    isOpen: doorLike ? selectedWall.doorState === 'open' : false
                  });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                {WALL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {isDoorLike && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-door-state" className="text-[10px] font-bold text-amber-400 uppercase">Door State:</label>
                <select
                  id="inspector-door-state"
                  disabled={isStoryReadOnly}
                  value={selectedWall.doorState || 'closed'}
                  onChange={(e) => {
                    recordDiscrete('Change Door State');
                    const ds = e.target.value;
                    onUpdateWall?.(selectedWall.id, {
                      doorState: ds,
                      isOpen: ds === 'open' || ds === 'breached',
                      isLocked: ds === 'locked' || ds === 'sealed'
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none focus:border-amber-400 disabled:opacity-50"
                >
                  {DOOR_STATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-wall-hackdc" className="text-[10px] font-bold text-emerald-400 uppercase">Hack DC:</label>
              <input
                id="inspector-wall-hackdc"
                type="number"
                min={1}
                max={40}
                disabled={isStoryReadOnly}
                value={selectedWall.hackDc ?? 14}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateWall?.(selectedWall.id, { hackDc: Math.max(1, Number(e.target.value) || 14) });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-wall-hp" className="text-[10px] font-bold text-rose-400 uppercase">Breach HP:</label>
              <input
                id="inspector-wall-hp"
                type="number"
                min={0}
                max={1000}
                disabled={isStoryReadOnly}
                value={selectedWall.breachHp ?? 40}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateWall?.(selectedWall.id, { breachHp: Math.max(0, Number(e.target.value) || 0) });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              disabled={isStoryReadOnly}
              onClick={() => {
                recordDiscrete('Toggle Curved Wall');
                if (onToggleCurvedWall) {
                  onToggleCurvedWall(selectedWall.id);
                } else {
                  onUpdateWall?.(selectedWall.id, {
                    bezierControl: selectedWall.bezierControl ? null : computeDefaultBezier(selectedWall)
                  });
                }
              }}
              className={`px-2.5 py-1 rounded border text-xs font-mono font-bold transition-colors disabled:opacity-50 ${
                selectedWall.bezierControl
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-400'
              }`}
            >
              {selectedWall.bezierControl ? 'Straighten Wall' : 'Convert to Curved Arc'}
            </button>
          </>
        )}

        {/* DYNAMIC LIGHTS */}
        {entityKind === 'light' && (
          <>
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-light-color" className="text-[10px] font-bold text-amber-400 uppercase">Color:</label>
              <input
                id="inspector-light-color"
                type="color"
                disabled={isStoryReadOnly}
                value={selectedLight.color || '#f59e0b'}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateLight?.(selectedLight.id, { color: e.target.value });
                }}
                className="w-6 h-5 bg-transparent border-0 cursor-pointer disabled:opacity-50"
              />
              {LIGHT_SWATCHES.map((col) => (
                <button
                  key={col}
                  type="button"
                  disabled={isStoryReadOnly}
                  onClick={() => {
                    recordDiscrete('Change Light Color');
                    onUpdateLight?.(selectedLight.id, { color: col });
                  }}
                  className={`w-3.5 h-3.5 rounded-full border disabled:opacity-50 ${
                    selectedLight.color === col ? 'border-white scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: col }}
                  title={`Light Color ${col}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-light-radius" className="text-[10px] font-bold text-cyan-400 uppercase">Radius:</label>
              <input
                id="inspector-light-radius"
                type="range"
                min={40}
                max={600}
                step={10}
                disabled={isStoryReadOnly}
                value={selectedLight.radius || 180}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateLight?.(selectedLight.id, { radius: Number(e.target.value) });
                }}
                className="w-24 accent-amber-400 cursor-pointer disabled:opacity-50"
              />
              <span className="text-[10px] text-amber-300 font-mono w-10">{Math.round(selectedLight.radius || 180)}px</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-light-intensity" className="text-[10px] font-bold text-cyan-400 uppercase">Intensity:</label>
              <input
                id="inspector-light-intensity"
                type="number"
                min={0.1}
                max={2.0}
                step={0.1}
                disabled={isStoryReadOnly}
                value={selectedLight.brightness ?? selectedLight.intensity ?? 0.8}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  const val = Math.max(0.1, Math.min(2.0, Number(e.target.value) || 0.8));
                  onUpdateLight?.(selectedLight.id, { brightness: val, intensity: val });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-light-anim" className="text-[10px] font-bold text-cyan-400 uppercase">Animation:</label>
              <select
                id="inspector-light-anim"
                disabled={isStoryReadOnly}
                value={selectedLight.animation || 'flicker'}
                onChange={(e) => {
                  recordDiscrete('Change Light Animation');
                  onUpdateLight?.(selectedLight.id, { animation: e.target.value });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none disabled:opacity-50"
              >
                {LIGHT_ANIMATIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* TEXT LABELS */}
        {entityKind === 'text' && (
          <>
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-text-value" className="text-[10px] font-bold text-cyan-400 uppercase">Text:</label>
              <input
                id="inspector-text-value"
                type="text"
                disabled={isStoryReadOnly}
                value={selectedText.text || ''}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateText?.({ ...selectedText, text: e.target.value });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-44 font-semibold disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-text-color" className="text-[10px] font-bold text-amber-400 uppercase">Color:</label>
              <input
                id="inspector-text-color"
                type="color"
                disabled={isStoryReadOnly}
                value={selectedText.fill || '#ffffff'}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateText?.({ ...selectedText, fill: e.target.value });
                }}
                className="w-6 h-5 bg-transparent border-0 cursor-pointer disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-text-size" className="text-[10px] font-bold text-cyan-400 uppercase">Font Size:</label>
              <input
                id="inspector-text-size"
                type="number"
                min={10}
                max={72}
                disabled={isStoryReadOnly}
                value={selectedText.fontSize || 24}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateText?.({ ...selectedText, fontSize: Math.max(10, Math.min(72, Number(e.target.value) || 24)) });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
              />
            </div>
          </>
        )}

        {/* SCENE REGIONS */}
        {entityKind === 'region' && (
          <>
            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-region-name" className="text-[10px] font-bold text-cyan-400 uppercase">Name:</label>
              <input
                id="inspector-region-name"
                type="text"
                disabled={isStoryReadOnly}
                value={selectedRegion.name || ''}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateRegion?.(selectedRegion.id, { name: e.target.value });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none focus:border-[#22d3ee] w-36 font-semibold disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-region-type" className="text-[10px] font-bold text-purple-400 uppercase">Trigger:</label>
              <select
                id="inspector-region-type"
                disabled={isStoryReadOnly}
                value={selectedRegion.triggerType || 'roof_zone'}
                onChange={(e) => {
                  recordDiscrete('Change Region Trigger');
                  onUpdateRegion?.(selectedRegion.id, { triggerType: e.target.value });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs font-semibold outline-none disabled:opacity-50"
              >
                {REGION_TRIGGER_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
              <label htmlFor="inspector-region-w" className="text-[10px] font-bold text-cyan-400 uppercase">W:</label>
              <input
                id="inspector-region-w"
                type="number"
                min={20}
                max={3000}
                disabled={isStoryReadOnly}
                value={Math.round(selectedRegion.bounds?.width || 150)}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateRegion?.(selectedRegion.id, {
                    bounds: {
                      ...(selectedRegion.bounds || { x: 0, y: 0, width: 150, height: 150 }),
                      width: Math.max(20, Number(e.target.value) || 20)
                    }
                  });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
              />
              <label htmlFor="inspector-region-h" className="text-[10px] font-bold text-cyan-400 uppercase">H:</label>
              <input
                id="inspector-region-h"
                type="number"
                min={20}
                max={3000}
                disabled={isStoryReadOnly}
                value={Math.round(selectedRegion.bounds?.height || 150)}
                onChange={(e) => {
                  recordCoalesced('Edit Element');
                  onUpdateRegion?.(selectedRegion.id, {
                    bounds: {
                      ...(selectedRegion.bounds || { x: 0, y: 0, width: 150, height: 150 }),
                      height: Math.max(20, Number(e.target.value) || 20)
                    }
                  });
                }}
                className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
              />
            </div>

            {selectedRegion.triggerType === 'hazard' && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-region-dmg" className="text-[10px] font-bold text-orange-400 uppercase">Hazard Dmg:</label>
                <input
                  id="inspector-region-dmg"
                  type="number"
                  min={0}
                  max={200}
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.damage ?? 6}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: {
                        ...(selectedRegion.payload || {}),
                        damage: Math.max(0, Number(e.target.value) || 0)
                      }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
                />
              </div>
            )}

            {(selectedRegion.triggerType === 'roof_zone' || selectedRegion.triggerType === 'roof') && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-region-roof" className="text-[10px] font-bold text-purple-400 uppercase">Roof Radius:</label>
                <input
                  id="inspector-region-roof"
                  type="number"
                  min={20}
                  max={1000}
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.radiusPx ?? 110}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: {
                        ...(selectedRegion.payload || {}),
                        radiusPx: Math.max(20, Number(e.target.value) || 110)
                      }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
                />
              </div>
            )}

            {(selectedRegion.triggerType === 'teleport_deck' || selectedRegion.triggerType === 'teleport') && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Dest X/Y:</span>
                <input
                  type="number"
                  aria-label="Teleport Target X"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.targetX ?? 400}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), targetX: Number(e.target.value) || 0 }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
                />
                <input
                  type="number"
                  aria-label="Teleport Target Y"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.targetY ?? 300}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), targetY: Number(e.target.value) || 0 }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-14 outline-none disabled:opacity-50"
                />
              </div>
            )}

            {selectedRegion.triggerType === 'switch_map' && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-region-map" className="text-[10px] font-bold text-blue-400 uppercase">Target Map:</label>
                <select
                  id="inspector-region-map"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.targetMapId || ''}
                  onChange={(e) => {
                    recordDiscrete('Change Target Map');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), targetMapId: e.target.value }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-2 py-0.5 rounded text-xs outline-none disabled:opacity-50 max-w-[140px]"
                >
                  <option value="">-- Select Map --</option>
                  {(availableMaps || []).map((m) => (
                    <option key={m.id} value={m.id}>{m.title || m.name || m.id}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedRegion.triggerType === 'story_flag' && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Flag:</span>
                <input
                  type="text"
                  aria-label="Story Flag Key"
                  placeholder="KEY"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.flagKey || ''}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), flagKey: e.target.value }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-24 outline-none disabled:opacity-50"
                />
                <input
                  type="text"
                  aria-label="Story Flag Value"
                  placeholder="true"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.flagValue ?? 'true'}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), flagValue: e.target.value }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-16 outline-none disabled:opacity-50"
                />
              </div>
            )}

            {(selectedRegion.triggerType === 'audio_cue' || selectedRegion.triggerType === 'audio_zone') && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] px-2 py-1 rounded border border-[#0D5C63]/60">
                <label htmlFor="inspector-region-audio" className="text-[10px] font-bold text-pink-400 uppercase">Track:</label>
                <input
                  id="inspector-region-audio"
                  type="text"
                  placeholder="bridge_hum"
                  disabled={isStoryReadOnly}
                  value={selectedRegion.payload?.track || ''}
                  onChange={(e) => {
                    recordCoalesced('Edit Element');
                    onUpdateRegion?.(selectedRegion.id, {
                      payload: { ...(selectedRegion.payload || {}), track: e.target.value }
                    });
                  }}
                  className="bg-[#161b22] border border-[#0D5C63]/60 text-white px-1.5 py-0.5 rounded text-xs w-28 outline-none disabled:opacity-50"
                />
              </div>
            )}
          </>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {onDeleteSelected && (
            <button
              type="button"
              disabled={isStoryReadOnly}
              onClick={() => onDeleteSelected(selectedId)}
              className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-200 rounded text-[11px] font-mono font-bold uppercase disabled:opacity-50"
            >
              Delete
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-[11px] font-mono"
              title="Deselect Element"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedElementInspectorBar;
