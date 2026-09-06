import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Dices, 
  Shield, 
  User, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  X,
  Heart,
  Activity,
  Lock
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useFolio } from '../../context/FolioContext';
import { useAuth } from '../../context/AuthContext';
import { AudioService } from '../../services/audioService';
import { rollDice } from '../../services/diceService';
import { PersonaLogService, ACTION_TYPES } from '../../services/personaLogService';

export const MessageInput = ({ isCompact = false }) => {
  const { 
    sendMessage, 
    sendDiceRoll,
    speakingMode, 
    setSpeakingMode, 
    selectedPersona, 
    setSelectedPersona,
    activeChannel
  } = useChat();
  const { personaRoster, roster, characterData } = useFolio();
  const { currentUser, userHandle } = useAuth();

  const [text, setText] = useState('');
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [diceExpr, setDiceExpr] = useState('2d10');
  const [rollAdvantage, setRollAdvantage] = useState('norm'); // 'norm' | 'adv' | 'dis'
  const [rollLabel, setRollLabel] = useState('');

  // Collect all available personas from Folio catalog / roster / active characterData
  const allPersonas = useMemo(() => {
    const list = Array.isArray(personaRoster) ? [...personaRoster] : Array.isArray(roster) ? [...roster] : [];
    if (characterData && (characterData['char-name'] || characterData.name)) {
      const activeId = characterData['character-doc-id'] || characterData.id || 'active_char';
      if (!list.some(p => (p['character-doc-id'] || p.id) === activeId)) {
        list.unshift(characterData);
      }
    }
    return list;
  }, [personaRoster, roster, characterData]);

  // Set default selectedPersona if not already set
  useEffect(() => {
    if (!selectedPersona && allPersonas.length > 0) {
      setSelectedPersona(allPersonas[0]);
    }
  }, [allPersonas, selectedPersona, setSelectedPersona]);

  const isReadOnlyChannel = activeChannel?.isReadOnly || activeChannel?.type === 'persona_log' || activeChannel?.id?.startsWith('persona_log_');

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isReadOnlyChannel) return;

    const msgToSend = text.trim();
    setText('');
    await sendMessage(msgToSend);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertBracketHelp = () => {
    AudioService.playTerminalBeep(1200, 0.02);
    setText(prev => `${prev}[Hyperdrive] `);
  };

  const handleQuickDiceRoll = async (e) => {
    if (e) e.preventDefault();
    if (!diceExpr.trim()) return;

    try {
      const isAdv = rollAdvantage === 'adv';
      const isDis = rollAdvantage === 'dis';
      const cName = speakingMode === 'IC' && selectedPersona
        ? (selectedPersona['char-name'] || selectedPersona.name || 'Operative')
        : (userHandle || 'Operator');

      const rollResult = rollDice(diceExpr.trim(), {
        advantage: isAdv,
        disadvantage: isDis,
        characterName: cName,
        label: rollLabel.trim() || 'Tactical Check'
      });

      if (rollLabel.trim()) {
        rollResult.label = rollLabel.trim();
      }

      await sendDiceRoll(rollResult);

      // Auto-log to Persona Telemetry Log if speaking as a persona
      if (speakingMode === 'IC' && selectedPersona) {
        const personaId = selectedPersona['character-doc-id'] || selectedPersona.id;
        const personaName = selectedPersona['char-name'] || selectedPersona.name || 'Operative';
        
        PersonaLogService.logAction({
          personaId,
          personaName,
          actionType: ACTION_TYPES.SKILL_CHECK,
          summary: `${rollResult.label || 'Action Check'}: ${rollResult.total} (${rollResult.expression})${rollResult.isCritSuccess ? ' [CRITICAL 30]' : rollResult.isCritFail ? ' [FUMBLE -10]' : ''}`,
          details: {
            expression: rollResult.expression,
            rolls: rollResult.rolls,
            total: rollResult.total,
            modifier: rollResult.modifier,
            isCritical: rollResult.isCritSuccess,
            isFumble: rollResult.isCritFail,
            isAdvantage: isAdv,
            isDisadvantage: isDis
          },
          actorId: currentUser?.uid || 'anon',
          actorHandle: userHandle || 'Operator'
        }).catch(() => {});
      }

      setIsDiceModalOpen(false);
      setRollLabel('');
    } catch (err) {
      console.error('Dice parse error:', err);
      alert('Invalid dice expression format. Examples: 2d10, 2d10+4, 1d20, 4d6k3');
    }
  };

  const activePersonaName = selectedPersona?.['char-name'] || selectedPersona?.name || 'Operative';
  const activePersonaSpecies = selectedPersona?.['char-species'] || selectedPersona?.species || 'Human';
  const activePersonaConcept = selectedPersona?.['char-concept'] || selectedPersona?.role || selectedPersona?.['char-occu'] || 'Specialist';
  const activePersonaHP = selectedPersona?.current_health ?? (selectedPersona?.current_hp ?? 30);
  const activePersonaMaxHP = selectedPersona?.health ?? (selectedPersona?.base_hp ?? 30);

  return (
    <div className="p-2 sm:p-3 bg-[#0b0f19] border-t border-slate-800/90 text-slate-200 select-none">
      {/* ── Read-Only Frequency Guard Banner ── */}
      {isReadOnlyChannel ? (
        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-amber-200">READ-ONLY OPERATIVE ACTION STREAM</span>
              <span className="text-[10px] text-slate-400">
                Transmissions are disabled on this frequency. Actions and telemetry are auto-logged by Folio and the Tangent Engine.
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-amber-500/20 px-2 py-1 rounded border border-amber-500/40 uppercase">
            AUDIT ONLY
          </span>
        </div>
      ) : (
        <>
          {/* ── Intelligent Speaking Identity HUD Bar ── */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* OOC / IC Toggle Button */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    setSpeakingMode('OOC');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    speakingMode === 'OOC'
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Speak as Player / Operator (Out of Character)"
                >
                  <User size={12} />
                  <span>OOC</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    AudioService.playTerminalBeep(1000, 0.02);
                    setSpeakingMode('IC');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    speakingMode === 'IC'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Speak as Operative Persona (In-Character)"
                >
                  <Shield size={12} />
                  <span>IC</span>
                </button>
              </div>

              {/* Persona Selector Dropdown (Catalog / Roster) */}
              {speakingMode === 'IC' && (
                <div className="flex items-center gap-1.5 bg-slate-950 border border-purple-500/40 rounded-lg px-2 py-0.8 shadow-sm">
                  <span className="text-[10px] text-purple-400 font-bold uppercase">AS:</span>
                  {allPersonas.length > 0 ? (
                    <select
                      value={selectedPersona?.['character-doc-id'] || selectedPersona?.id || ''}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const found = allPersonas.find(p => (p['character-doc-id'] || p.id) === targetId);
                        if (found) {
                          AudioService.playTerminalBeep(1150, 0.02);
                          setSelectedPersona(found);
                        }
                      }}
                      className="bg-transparent text-purple-200 text-xs font-mono font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
                    >
                      {allPersonas.map((p, idx) => {
                        const pId = p['character-doc-id'] || p.id || `p_${idx}`;
                        const pName = p['char-name'] || p.name || 'Unnamed Operative';
                        const pRole = p['char-concept'] || p.role || p['char-occu'] || 'Agent';
                        return (
                          <option key={pId} value={pId} className="bg-slate-900 text-slate-100">
                            {pName} ({pRole})
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <span className="text-purple-300 text-xs italic">Default Operative</span>
                  )}

                  {/* Active Persona Mini Vitals Pill */}
                  <div className="hidden sm:flex items-center gap-1 pl-1.5 border-l border-purple-500/30 text-[10px]">
                    <Heart size={10} className="text-emerald-400" />
                    <span className="text-emerald-300 font-bold">{activePersonaHP}/{activePersonaMaxHP} HP</span>
                  </div>
                </div>
              )}

              {/* Codex Lore Bracket Quick-insert */}
              <button
                type="button"
                onClick={insertBracketHelp}
                className="flex items-center gap-1 px-2 py-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Insert [Codex Link] brackets for auto-link tooltips"
              >
                <BookOpen size={11} />
                <span className="hidden sm:inline">[Codex Link]</span>
              </button>
            </div>

            {/* Quick Dice Roll Launcher */}
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1200, 0.02);
                setIsDiceModalOpen(prev => !prev);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] cursor-pointer"
              title="Launch Tactical Dice Roller"
            >
              <Dices size={13} />
              <span>DICE ENGINE</span>
            </button>
          </div>

          {/* Quick Dice Roll Inline Popover */}
          {isDiceModalOpen && (
            <form onSubmit={handleQuickDiceRoll} className="mb-2.5 p-3 rounded-xl bg-slate-950 border border-amber-500/50 shadow-xl space-y-2.5 animate-in fade-in duration-150 font-mono text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Dices size={14} />
                  <span>TANGENT 2D10 TACTICAL ENGINE</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDiceModalOpen(false)}
                  className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Presets:</span>
                {['2d10', '2d10+2', '2d10+4', '2d10+6', '1d20', '1d100'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDiceExpr(preset)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                      diceExpr === preset 
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/60' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">DICE FORMULA:</span>
                  <input
                    type="text"
                    value={diceExpr}
                    onChange={(e) => setDiceExpr(e.target.value)}
                    placeholder="e.g. 2d10+4, 1d20"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded text-xs text-amber-200 outline-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">REASON / SKILL LABEL (OPTIONAL):</span>
                  <input
                    type="text"
                    value={rollLabel}
                    onChange={(e) => setRollLabel(e.target.value)}
                    placeholder="e.g. Plasma Carbine, Stealth Check"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded text-xs text-cyan-200 outline-none"
                  />
                </div>
              </div>

              {/* Roll Mode: Normal, Advantage, Disadvantage */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setRollAdvantage('norm')}
                    className={`px-2 py-1 rounded font-bold border transition-colors cursor-pointer ${
                      rollAdvantage === 'norm'
                        ? 'bg-slate-800 text-slate-200 border-slate-600'
                        : 'bg-slate-950 text-slate-500 border-slate-900'
                    }`}
                  >
                    NORMAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setRollAdvantage('adv')}
                    className={`px-2 py-1 rounded font-bold border transition-colors cursor-pointer ${
                      rollAdvantage === 'adv'
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-sm'
                        : 'bg-slate-950 text-slate-500 border-slate-900'
                    }`}
                  >
                    ADVANTAGE ("I Got This")
                  </button>
                  <button
                    type="button"
                    onClick={() => setRollAdvantage('dis')}
                    className={`px-2 py-1 rounded font-bold border transition-colors cursor-pointer ${
                      rollAdvantage === 'dis'
                        ? 'bg-red-500/25 text-red-300 border-red-500/60 shadow-sm'
                        : 'bg-slate-950 text-slate-500 border-slate-900'
                    }`}
                  >
                    DISADVANTAGE ("Negative Karma")
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  EXECUTE ROLL
                </button>
              </div>
            </form>
          )}

          {/* ── Main Message Transmission Bar ── */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                speakingMode === 'IC'
                  ? `Transmit signal as ${activePersonaName} (${activePersonaConcept})...`
                  : `Transmit operator signal into ${activeChannel?.displayName || 'frequency'}...`
              }
              className={`w-full pl-3.5 pr-12 py-2.5 bg-slate-950 border rounded-xl text-xs sm:text-sm font-mono placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                speakingMode === 'IC'
                  ? 'border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 text-purple-100'
                  : 'border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 text-slate-100'
              }`}
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className={`absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                text.trim()
                  ? speakingMode === 'IC'
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
              title="Send Transmission (Enter)"
            >
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageInput;
