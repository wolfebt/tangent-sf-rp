/**
 * @file ActiveModifiersPillBar.jsx
 * @description Dynamic Situational Modifiers & Status Conditions Bar for ADE Interactive Play.
 * Completely driven by database content (DBM Supporting Catalogs, Story Gallery Modifiers, Folio Conditions).
 * Live-syncs with FolioContext (applyVTTStatusConditions, recordTrackedModification)
 * and VttEventBus so tokens on the Tactical Stage and characters in Folio stay in lockstep.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ShieldAlert, Sparkles, Shield, Zap, AlertTriangle } from 'lucide-react';
import { AudioService } from '../../../../services/audioService';
import { VttEventBus } from '../../../../utils/vttEventBus';

export const ActiveModifiersPillBar = ({
  activeModifiers = [],
  onAddModifier,
  onRemoveModifier,
  availableDatabaseModifiers = [],
  folioCharacter = null
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customValue, setCustomValue] = useState(1);
  const [customTarget, setCustomTarget] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const addMenuRef = useRef(null);

  useEffect(() => {
    if (!isAddMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setIsAddMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick, true);
    return () => window.removeEventListener('pointerdown', handleOutsideClick, true);
  }, [isAddMenuOpen]);

  const filteredDbModifiers = availableDatabaseModifiers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (m.name || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q);
  });

  const handleAddFromDatabase = (mod) => {
    AudioService.playTerminalBeep(1200, 0.02);
    const newMod = {
      ...mod,
      instanceId: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appliedAt: new Date().toLocaleTimeString()
    };
    if (onAddModifier) onAddModifier(newMod);

    // Sync to VTT Event Bus
    VttEventBus.emit('vtt-status-condition-applied', {
      condition: mod.name,
      value: mod.value,
      targetId: folioCharacter?.['character-doc-id'] || folioCharacter?.id || 'active_operative'
    });

    setIsAddMenuOpen(false);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    AudioService.playTerminalBeep(1100, 0.02);
    const newMod = {
      id: `custom_${Date.now()}`,
      instanceId: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: customName.trim(),
      type: customValue >= 0 ? 'bonus' : 'penalty',
      value: Number(customValue) || 1,
      target: customTarget,
      description: `Situational ${customValue >= 0 ? '+' : ''}${customValue} to ${customTarget}`,
      appliedAt: new Date().toLocaleTimeString()
    };
    if (onAddModifier) onAddModifier(newMod);
    setCustomName('');
    setCustomValue(1);
    setIsAddMenuOpen(false);
  };

  const handleRemove = (instanceId, modName) => {
    AudioService.playTerminalBeep(900, 0.02);
    if (onRemoveModifier) onRemoveModifier(instanceId);

    // Sync removal to VTT Event Bus
    VttEventBus.emit('vtt-status-condition-removed', {
      condition: modName,
      targetId: folioCharacter?.['character-doc-id'] || folioCharacter?.id || 'active_operative'
    });
  };

  return (
    <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs flex-wrap font-mono">
      {/* Left: Active Conditions Pills */}
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
          <ShieldAlert size={12} className="text-amber-400" />
          <span>Active Modifiers ({activeModifiers.length}):</span>
        </span>

        {activeModifiers.length === 0 ? (
          <span className="text-[10px] text-slate-500 italic">No active tactical modifiers or conditions</span>
        ) : (
          activeModifiers.map((mod) => {
            const isBonus = mod.value > 0;
            return (
              <span
                key={mod.instanceId || mod.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                  isBonus
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                }`}
                title={mod.description || `${mod.name} (${isBonus ? `+${mod.value}` : mod.value})`}
              >
                <span>{mod.name}</span>
                <span className="opacity-90 font-mono">
                  {isBonus ? `+${mod.value}` : mod.value}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(mod.instanceId || mod.id, mod.name)}
                  className="hover:text-white ml-0.5 p-0.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove modifier"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })
        )}
      </div>

      {/* Right: Add Modifier Popover Button */}
      <div className="relative shrink-0" ref={addMenuRef}>
        <button
          type="button"
          onClick={() => setIsAddMenuOpen(prev => !prev)}
          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={11} />
          <span>Add Modifier</span>
        </button>

        {isAddMenuOpen && (
          <div className="absolute right-0 top-7 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Database Modifiers & Conditions</span>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Filter Search */}
            <input
              type="text"
              placeholder="Search database modifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-cyan-400"
            />

            {/* Database Modifiers List */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">
                Catalog Modifiers ({filteredDbModifiers.length}):
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {filteredDbModifiers.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic p-1">No matching database modifiers found</span>
                ) : (
                  filteredDbModifiers.map((cond) => {
                    const isBonus = cond.value > 0;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleAddFromDatabase(cond)}
                        className="p-1.5 rounded text-left bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-600 text-[10px] flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-slate-200 font-bold group-hover:text-cyan-300 block truncate">{cond.name}</span>
                          <span className="text-[9px] text-slate-400 block truncate">{cond.description}</span>
                        </div>
                        <span className={`text-[9px] font-bold shrink-0 px-1 py-0.2 rounded ${
                          isBonus ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {isBonus ? `+${cond.value}` : cond.value}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Custom Modifier Row */}
            <form onSubmit={handleAddCustom} className="border-t border-slate-800 pt-2 space-y-1.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Inject Custom Situational Modifier:</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Modifier Name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-200 outline-none focus:border-cyan-400"
                />
                <input
                  type="number"
                  placeholder="±Val"
                  value={customValue}
                  onChange={(e) => setCustomValue(parseInt(e.target.value, 10) || 0)}
                  className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-center text-slate-200 outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[9px] outline-none"
                >
                  <option value="all">Universal (All Checks)</option>
                  <option value="attr-might">Might (Strength)</option>
                  <option value="attr-reflex">Reflex (Agility)</option>
                  <option value="attr-fortitude">Fortitude (Stamina)</option>
                  <option value="attr-logic">Reason (Intellect)</option>
                  <option value="attr-will">Willpower (Wisdom)</option>
                  <option value="attr-etiquette">Etiquette (Charisma)</option>
                </select>

                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="px-2.5 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveModifiersPillBar;
