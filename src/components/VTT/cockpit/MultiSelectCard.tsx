/**
 * @file MultiSelectCard.tsx
 * @description GM Batch Inspector Card for Multi-Entity Selection.
 * Allows GM to execute simultaneous AoE damage/healing, group AP adjustment,
 * synchronized condition toggles, and mass deletion across selected tokens.
 */

import React, { useState } from 'react';
import { 
  Users, 
  Flame, 
  Heart, 
  Eye, 
  Trash2, 
  CheckSquare, 
  Square
} from 'lucide-react';
import type { FusedToken } from '../../../engine/index';
import { useEngineStore } from '../../../engine/index';
import { AudioService } from '../../../services/audioService';

export interface MultiSelectCardProps {
  tokens: FusedToken[];
  onDeselectAll: () => void;
}

const COMMON_CONDITIONS = ['Stunned', 'Cover', 'Aiming', 'Burning', 'Suppressed', 'Prone'];

export const MultiSelectCard: React.FC<MultiSelectCardProps> = ({
  tokens,
  onDeselectAll
}) => {
  const [batchAmount, setBatchAmount] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(tokens.map(t => t.id))
  );

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === tokens.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tokens.map(t => t.id)));
    }
  };

  // Mass Damage
  const handleApplyBatchDamage = () => {
    selectedIds.forEach(id => {
      useEngineStore.getState().applyDamage(id, batchAmount);
    });
    AudioService.playCriticalChime(true);
  };

  // Mass Heal
  const handleApplyBatchHeal = () => {
    selectedIds.forEach(id => {
      useEngineStore.getState().healHP(id, batchAmount);
    });
    AudioService.playTerminalBeep();
  };

  // Synchronized Condition Toggle
  const handleToggleCondition = (cond: string) => {
    selectedIds.forEach(id => {
      useEngineStore.getState().toggleCondition(id, cond);
    });
    AudioService.playTerminalBeep();
  };

  // Mass Visibility Toggle
  const handleToggleHidden = () => {
    selectedIds.forEach(id => {
      useEngineStore.getState().toggleHidden(id);
    });
    AudioService.playTerminalBeep();
  };

  // Mass Remove
  const handleBatchRemove = () => {
    selectedIds.forEach(id => {
      useEngineStore.getState().removeEntity(id);
    });
    onDeselectAll();
    AudioService.playTerminalBeep();
  };

  return (
    <div className="p-2.5 rounded-lg bg-[#0d121c] border border-cyan-500/50 space-y-2.5 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
          <Users size={14} />
          <span>MULTI-ENTITY BATCH ({selectedIds.size} / {tokens.length})</span>
        </div>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-[10px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {selectedIds.size === tokens.length ? <CheckSquare size={11} /> : <Square size={11} />}
          <span>{selectedIds.size === tokens.length ? 'Deselect All' : 'Select All'}</span>
        </button>
      </div>

      {/* Target Token List */}
      <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
        {tokens.map(t => {
          const isChecked = selectedIds.has(t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggleSelectId(t.id)}
              className={`px-2 py-1 rounded border flex items-center justify-between transition-colors cursor-pointer text-[11px] ${
                isChecked
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${t.is_persona ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="truncate font-bold">{t.name || t.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] shrink-0 text-slate-400">
                <span>{t.current_hp} / {t.base_hp} HP</span>
                <span>DR {t.armor_dr}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch AoE Damage & Healing Controls */}
      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10.5px] text-slate-400">
          <span>BATCH AMOUNT (HP / AOE):</span>
          <div className="flex items-center gap-1">
            {[5, 10, 15, 25].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBatchAmount(val)}
                className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
                  batchAmount === val
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleApplyBatchDamage}
            disabled={selectedIds.size === 0}
            className="py-1 px-2 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-red-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flame size={12} />
            <span>AoE Damage (-{batchAmount})</span>
          </button>

          <button
            type="button"
            onClick={handleApplyBatchHeal}
            disabled={selectedIds.size === 0}
            className="py-1 px-2 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Heart size={12} />
            <span>Mass Heal (+{batchAmount})</span>
          </button>
        </div>
      </div>

      {/* Synchronized Condition Toggles */}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
          Synchronized Conditions:
        </div>
        <div className="flex flex-wrap gap-1">
          {COMMON_CONDITIONS.map(cond => (
            <button
              key={cond}
              type="button"
              onClick={() => handleToggleCondition(cond)}
              disabled={selectedIds.size === 0}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +{cond}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Visibility & Delete Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10.5px]">
        <button
          type="button"
          onClick={handleToggleHidden}
          disabled={selectedIds.size === 0}
          className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <Eye size={12} />
          <span>Toggle Visibility</span>
        </button>

        <button
          type="button"
          onClick={handleBatchRemove}
          disabled={selectedIds.size === 0}
          className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <Trash2 size={12} />
          <span>Remove from Stage</span>
        </button>
      </div>
    </div>
  );
};

export default MultiSelectCard;
