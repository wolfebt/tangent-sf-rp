import React from 'react';
import { Crosshair, ChevronLeft, Minus, Users, Clock, Box, Dices, Bot } from 'lucide-react';
import { AudioService } from '../../../services/audioService';

export interface StageTacticalConsoleProps {
  isEmbeddedInTripartite: boolean;
  isDesignModeActive: boolean;
  isZenMode: boolean;
  isTacticalConsoleCollapsed: boolean;
  setIsTacticalConsoleCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeTab: 'combat' | 'spawner' | 'turns' | 'objects' | 'dice';
  setActiveTab: (tab: 'combat' | 'spawner' | 'turns' | 'objects' | 'dice') => void;
  selectedToken: any;
  targetToken: any;
  attackWeapon?: 'kinetic' | 'plasma' | 'laser' | 'emp';
  setAttackWeapon?: (w: 'kinetic' | 'plasma' | 'laser' | 'emp') => void;
  attackMapStep?: number;
  setAttackMapStep?: (s: number) => void;
  targetedLimb?: 'torso' | 'head' | 'arms' | 'legs' | 'optics';
  setTargetedLimb?: (limb: 'torso' | 'head' | 'arms' | 'legs' | 'optics') => void;
  handleExecuteCombatStrike: () => void;
  setIsHeroDrawerOpen: (val: boolean) => void;
  setIsOmnicortexDrawerOpen: (val: boolean) => void;
  roundNumber: number;
  handleRollAllInitiative: () => void;
  tokens: any[];
  setSelectedTokenId: (id: string | null) => void;
  currentTurnIndex: number;
  initiativeScores: Record<string, number>;
  handleNextTurn: () => void;
  localObjects: any[];
  handleObjectClick: (obj: any) => void;
  customDiceExpr: string;
  setCustomDiceExpr: (expr: string) => void;
  handleRollCustomDice: () => void;
  combatLog: string[];
}

export const StageTacticalConsole: React.FC<StageTacticalConsoleProps> = ({
  isEmbeddedInTripartite,
  isDesignModeActive,
  isZenMode,
  isTacticalConsoleCollapsed,
  setIsTacticalConsoleCollapsed,
  activeTab,
  setActiveTab,
  selectedToken,
  targetToken,
  attackWeapon = 'kinetic',
  setAttackWeapon,
  attackMapStep = 0,
  setAttackMapStep,
  targetedLimb = 'torso',
  setTargetedLimb,
  handleExecuteCombatStrike,
  setIsHeroDrawerOpen,
  setIsOmnicortexDrawerOpen,
  roundNumber,
  handleRollAllInitiative,
  tokens,
  setSelectedTokenId,
  currentTurnIndex,
  initiativeScores,
  handleNextTurn,
  localObjects,
  handleObjectClick,
  customDiceExpr,
  setCustomDiceExpr,
  handleRollCustomDice,
  combatLog
}) => {
  if (isEmbeddedInTripartite || isDesignModeActive || isZenMode) {
    return null;
  }

  if (isTacticalConsoleCollapsed) {
    return (
      <button
        onClick={() => {
          AudioService.playTerminalBeep(1100, 0.02);
          setIsTacticalConsoleCollapsed(false);
        }}
        className="absolute top-4 right-4 z-[110] px-3 py-1.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl font-mono text-xs text-cyan-300 font-bold flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer select-none animate-in fade-in duration-150"
        title="Expand Tactical Command Console"
      >
        <Crosshair size={13} className="text-amber-400" />
        <span>CONSOLE</span>
        <ChevronLeft size={13} className="text-slate-400" />
      </button>
    );
  }

  return (
    <aside 
      className="absolute top-4 right-4 w-88 max-w-[360px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200 z-[110] flex flex-col overflow-hidden animate-in fade-in duration-150"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Tab Headers */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/70 p-1 text-[10.5px] font-mono font-bold">
        <button
          onClick={() => setActiveTab('combat')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'combat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair size={12} /> COMBAT
        </button>
        <button
          onClick={() => setActiveTab('spawner')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'spawner' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={12} /> UNITS
        </button>
        <button
          onClick={() => setActiveTab('turns')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'turns' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={12} /> TURNS
        </button>
        <button
          onClick={() => setActiveTab('objects')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'objects' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box size={12} /> PROPS
        </button>
        <button
          onClick={() => setActiveTab('dice')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'dice' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices size={12} /> DICE
        </button>
        <button
          onClick={() => {
            AudioService.playTerminalBeep(900, 0.02);
            setIsTacticalConsoleCollapsed(true);
          }}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors ml-0.5 cursor-pointer"
          title="Minimize Console"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3 space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto">
        {/* 1. COMBAT TAB */}
        {activeTab === 'combat' && (
          <div className="space-y-2.5">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>ATTACKER</span>
                <span className="text-cyan-400 font-bold">{selectedToken?.name || 'NONE'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>TARGET</span>
                <span className="text-red-400 font-bold">{targetToken?.name || 'NONE'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 block mb-1">WEAPON</span>
                <select
                  value={attackWeapon}
                  onChange={(e) => setAttackWeapon?.(e.target.value as any)}
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
                  onChange={(e) => setAttackMapStep?.(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800 text-amber-300 p-1 rounded border border-slate-700"
                >
                  <option value={0}>1st Attack (+0 MAP)</option>
                  <option value={1}>2nd Attack (-5 MAP)</option>
                  <option value={2}>3rd Attack (-10 MAP)</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block mb-1">CALLED SHOT</span>
              <div className="grid grid-cols-5 gap-1 text-[9.5px]">
                {[
                  { id: 'torso', label: 'Torso' },
                  { id: 'head', label: 'Head' },
                  { id: 'arms', label: 'Arms' },
                  { id: 'legs', label: 'Legs' },
                  { id: 'optics', label: 'Optics' }
                ].map(limb => (
                  <button
                    key={limb.id}
                    onClick={() => setTargetedLimb?.(limb.id as any)}
                    className={`p-1 rounded border text-center transition-colors cursor-pointer ${
                      targetedLimb === limb.id 
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400 font-bold' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {limb.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteCombatStrike}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crosshair size={14} /> EXECUTE ATTACK
            </button>
          </div>
        )}

        {/* 2. SPAWNER TAB */}
        {activeTab === 'spawner' && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quick Spawners:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setIsHeroDrawerOpen(true)}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                  <Users size={12} /> Folio Heroes
                </div>
                <p className="text-[10px] text-slate-400">Roster Operatives</p>
              </button>
              <button
                onClick={() => setIsOmnicortexDrawerOpen(true)}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-purple-500/40 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="text-purple-400 font-bold text-xs flex items-center gap-1">
                  <Bot size={12} /> Bestiary
                </div>
                <p className="text-[10px] text-slate-400">Codex Units</p>
              </button>
            </div>
          </div>
        )}

        {/* 3. TURNS TAB */}
        {activeTab === 'turns' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-purple-400 font-bold">ROUND {roundNumber}</span>
              <button
                onClick={handleRollAllInitiative}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-purple-700 text-[10px]"
              >
                Roll All
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {tokens.map((t, idx) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTokenId(t.id)}
                  className={`p-1.5 rounded border flex items-center justify-between text-[11px] cursor-pointer ${
                    idx === currentTurnIndex 
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <span className="font-bold">{initiativeScores[t.id] ?? '-'}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleNextTurn}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              NEXT COMBATANT
            </button>
          </div>
        )}

        {/* 4. OBJECTS TAB */}
        {activeTab === 'objects' && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Interactive Map Objects:</span>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {localObjects.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => handleObjectClick(obj)}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate text-[11px] text-cyan-300">{obj.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                    {obj.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DICE TAB */}
        {activeTab === 'dice' && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">AST Dice Evaluator:</span>
            <input
              type="text"
              value={customDiceExpr}
              onChange={(e) => setCustomDiceExpr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-emerald-300"
            />
            <button
              onClick={handleRollCustomDice}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              ROLL FORMULA
            </button>
          </div>
        )}
      </div>

      {/* Tactical Combat Log */}
      <div className="bg-slate-950/80 p-2 border-t border-slate-800 text-[9.5px] font-mono text-slate-400 space-y-1 max-h-28 overflow-y-auto">
        {combatLog.map((log, i) => (
          <div key={i} className="leading-tight">{log}</div>
        ))}
      </div>
    </aside>
  );
};
