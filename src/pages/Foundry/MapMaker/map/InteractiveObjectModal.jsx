import React, { useState } from 'react';
import { OBJECT_TYPES, applyDamageToObject, interactWithObject } from '../../../../services/interactiveObjectService';
import { AudioService } from '../../../../services/audioService';

const InteractiveObjectModal = ({
  objectNode,
  isOpen,
  onClose,
  onUpdateObject,
  onDeleteObject,
  tokens = [],
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenStructure,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  if (!isOpen || !objectNode) return null;

  const objType = OBJECT_TYPES[objectNode.objectType || objectNode.type] || OBJECT_TYPES.explosive_canister;
  const currentStructure = objectNode.structure !== undefined ? objectNode.structure : (objType.maxStructure || 20);
  const maxStructure = objType.maxStructure || 20;
  const isDestroyed = currentStructure <= 0;

  const [damageInput, setDamageInput] = useState(10);
  const [hackSkillMod, setHackSkillMod] = useState(3);
  const [strMod, setStrMod] = useState(2);
  const [actionLog, setActionLog] = useState([]);

  const addLog = (msg) => {
    setActionLog(prev => [msg, ...prev.slice(0, 8)]);
  };

  const handleApplyDamage = () => {
    const dmg = Math.max(1, parseInt(damageInput, 10) || 1);
    const { updatedObject, affectedTokens, logMessage } = applyDamageToObject(
      { ...objectNode, structure: currentStructure },
      dmg,
      tokens
    );

    onUpdateObject?.(objectNode.id, updatedObject);
    addLog(logMessage);

    // Apply blast damage to nearby tokens if exploded
    affectedTokens.forEach(aff => {
      if (aff.damage > 0) {
        if (aff.token.isSynthetic || aff.token.structure) {
          onUpdateTokenStructure?.(aff.token.id, Math.max(0, (aff.token.structure?.current || 30) - aff.damage), true, aff.damage);
        } else {
          onUpdateTokenHealth?.(aff.token.id, Math.max(0, (aff.token.health?.current || 30) - aff.damage), true, aff.damage);
        }
      }
      if (onTriggerFloatingText) {
        const screenX = (aff.token.x || 0) * scale + position.x;
        const screenY = (aff.token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `💥 -${aff.damage} BLAST (${aff.condition || 'EXPLOSION'})`, 'damage');
      }
    });

    if (onTriggerFloatingText) {
      const objX = (objectNode.x || 0) * scale + position.x;
      const objY = (objectNode.y || 0) * scale + position.y;
      onTriggerFloatingText(objX, objY, `-${dmg} STRUCT`, 'damage');
    }
  };

  const handleToggleDoorState = (newState) => {
    AudioService.playTerminalBeep(450, 0.15);
    onUpdateObject?.(objectNode.id, {
      ...objectNode,
      doorState: newState
    });
    addLog(`Door status updated to: ${newState.toUpperCase()}`);
  };

  const handleHackCheck = () => {
    const roll = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + parseInt(hackSkillMod, 10);
    const targetDc = objType.hackDc || 13;
    const isSuccess = roll >= targetDc;

    if (isSuccess) {
      AudioService.playTerminalBeep(980, 0.2);
      onUpdateObject?.(objectNode.id, {
        ...objectNode,
        isHacked: true,
        doorState: 'open'
      });
      addLog(`✅ Slicing Success: Rolled ${roll} vs DC ${targetDc}! Mainframe breached.`);
    } else {
      AudioService.playCombatHit(false);
      addLog(`❌ Slicing Failed: Rolled ${roll} vs DC ${targetDc}. Firewall locked.`);
    }
  };

  const handleForceCheck = () => {
    const roll = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1 + parseInt(strMod, 10);
    const targetDc = objType.strengthDc || 18;
    const isSuccess = roll >= targetDc;

    if (isSuccess) {
      AudioService.playCombatHit(true);
      onUpdateObject?.(objectNode.id, {
        ...objectNode,
        structure: 0,
        doorState: 'breached'
      });
      addLog(`💥 Breach Success: Rolled ${roll} vs DC ${targetDc}! Bulkhead forced open.`);
    } else {
      AudioService.playCombatHit(false);
      addLog(`🛡️ Breach Resisted: Rolled ${roll} vs DC ${targetDc}. Structure intact.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0f172a] border border-cyan-500/60 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] overflow-hidden flex flex-col text-slate-200 font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{objType.icon}</span>
            <div>
              <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                {objectNode.label || objType.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Category: {objType.category.toUpperCase()} • ID: {objectNode.id}
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
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* Description */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
            {objType.description}
          </div>

          {/* Structure Health Bar */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Structure Integrity</span>
              <span className={`font-bold ${isDestroyed ? 'text-rose-400' : 'text-cyan-300'}`}>
                {currentStructure} / {maxStructure} SP {isDestroyed && '(DESTROYED)'}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isDestroyed ? 'bg-rose-600' : currentStructure < maxStructure * 0.4 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (currentStructure / maxStructure) * 100))}%` }}
              />
            </div>
          </div>

          {/* Door Controls */}
          {objType.id === 'blast_door' && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Bulkhead State Control
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {['open', 'closed', 'locked', 'sealed'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleToggleDoorState(st)}
                    className={`py-1 text-[11px] font-mono font-bold rounded uppercase transition-colors border cursor-pointer ${
                      objectNode.doorState === st
                        ? 'bg-cyan-600 text-white border-cyan-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skill Interactions */}
          <div className="grid grid-cols-2 gap-3">
            {objType.hackDc && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">💻 Slice Terminal</span>
                  <span className="font-mono text-[10px] text-cyan-400">DC {objType.hackDc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Mod:</span>
                  <input
                    type="number"
                    value={hackSkillMod}
                    onChange={(e) => setHackSkillMod(e.target.value)}
                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-center font-mono text-cyan-300"
                  />
                  <button
                    type="button"
                    onClick={handleHackCheck}
                    className="flex-1 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    Roll 2d10
                  </button>
                </div>
              </div>
            )}

            {objType.strengthDc && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300">💥 Breach Door</span>
                  <span className="font-mono text-[10px] text-amber-400">DC {objType.strengthDc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">STR:</span>
                  <input
                    type="number"
                    value={strMod}
                    onChange={(e) => setStrMod(e.target.value)}
                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-center font-mono text-amber-300"
                  />
                  <button
                    type="button"
                    onClick={handleForceCheck}
                    className="flex-1 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    Roll 2d10
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Deal Damage / Attack Object */}
          <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg flex flex-col gap-2">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              Apply Weapon / Explosive Damage
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={damageInput}
                onChange={(e) => setDamageInput(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-rose-300"
                placeholder="Dmg"
              />
              <button
                type="button"
                onClick={handleApplyDamage}
                className="flex-1 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                ⚔️ Strike Object
              </button>
            </div>
          </div>

          {/* Action Log */}
          {actionLog.length > 0 && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-1 text-[10px] font-mono text-slate-400 max-h-28 overflow-y-auto">
              <span className="text-[9px] uppercase font-bold text-slate-500">Operation Log</span>
              {actionLog.map((log, i) => (
                <div key={i} className="text-slate-300">
                  › {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this interactive object from the battlemap?')) {
                onDeleteObject?.(objectNode.id);
                onClose();
              }
            }}
            className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs transition-colors cursor-pointer"
          >
            🗑️ Delete Node
          </button>
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

export default InteractiveObjectModal;
