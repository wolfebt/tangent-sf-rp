import React, { useState } from 'react';
import { AudioService } from '../../../../services/audioService';
import { 
  X, Volume2, Share2, Search, Gem, Swords, 
  Settings, ExternalLink, CheckCircle, AlertTriangle, 
  Eye, FileText, MapPin, User, Flame, Shield, Cpu
} from 'lucide-react';
import { getTypePillStyle } from '../../ElementForge/elementSchemas';
import { TRAP_TYPES } from '../../../../services/reactiveVttService';

export const StoryElementModal = ({
  isOpen,
  onClose,
  element,
  mapObjectNode,
  onUpdateMapObject,
  onTriggerFloatingText,
  onBroadcastHandout,
  onAwardRewards,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  if (!isOpen || !element) return null;

  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'actions' | 'reactive_config'
  const [skillBonus, setSkillBonus] = useState(3);
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [isRevealedToPlayers, setIsRevealedToPlayers] = useState(false);

  // Trap / Reactive settings state
  const isTrapOrHazard = element.type === 'Hazard' || element.type === 'Trap' || mapObjectNode?.isTrap || !!mapObjectNode?.hazard;
  const [trapDc, setTrapDc] = useState(mapObjectNode?.saveDc || element.dc || 14);
  const [trapDamage, setTrapDamage] = useState(mapObjectNode?.damageDice || element.damage || '2d10');
  const [trapState, setTrapState] = useState(mapObjectNode?.trapState || 'armed'); // 'armed' | 'disarmed' | 'triggered'

  const elementType = element.type || mapObjectNode?.storyElementType || 'Scene';
  const pillStyle = getTypePillStyle(elementType);

  const handleReadAloud = () => {
    AudioService.playTerminalBeep(650, 0.2);
    const readAloudText = element.atmosphere || element.sensoryDialogue || element.summary || element.description || element.content || 'The party approaches the sector...';
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 120, `📢 READ-ALOUD: ${String(readAloudText).replace(/<[^>]*>?/gm, '').substring(0, 80)}...`, 'karma');
    }
  };

  const handleBroadcastToPlayers = () => {
    AudioService.playTerminalBeep(1100, 0.25);
    setIsRevealedToPlayers(true);
    if (onBroadcastHandout) {
      onBroadcastHandout(element);
    }
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 120, `📺 BROADCASTED: ${element.name || element.title} pushed to Spectator View`, 'heal');
    }
  };

  const handleSkillCheck = (skillName, targetDc = 14) => {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const total = d1 + d2 + parseInt(skillBonus, 10);
    const isSuccess = total >= targetDc;

    if (isSuccess) {
      AudioService.playTerminalBeep(980, 0.2);
    } else {
      AudioService.playCombatHit(false);
    }

    setLastCheckResult({
      skillName,
      d1,
      d2,
      bonus: skillBonus,
      total,
      dc: targetDc,
      isSuccess,
      message: isSuccess
        ? `✅ Success! Rolled ${d1}+${d2}+${skillBonus} = ${total} vs DC ${targetDc}. Concealed intelligence revealed.`
        : `❌ Failed! Rolled ${d1}+${d2}+${skillBonus} = ${total} vs DC ${targetDc}. Critical data remains locked.`
    });
  };

  const handleSaveTrapConfig = () => {
    AudioService.playTerminalBeep(880, 0.1);
    if (mapObjectNode && onUpdateMapObject) {
      onUpdateMapObject(mapObjectNode.id, {
        saveDc: parseInt(trapDc, 10),
        damageDice: trapDamage,
        trapState: trapState
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0b0f19] border border-cyan-500/60 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {elementType === 'Scene' && '🏛️'}
              {elementType === 'Persona' && '👤'}
              {elementType === 'Encounter' && '⚔️'}
              {elementType === 'Item' && '💎'}
              {elementType === 'Clue' && '🔍'}
              {elementType === 'Handout' && '📄'}
              {elementType === 'Hazard' && '⚠️'}
              {elementType === 'Faction' && '🛡️'}
              {elementType === 'Technology' && '⚙️'}
              {!['Scene', 'Persona', 'Encounter', 'Item', 'Clue', 'Handout', 'Hazard', 'Faction', 'Technology'].includes(elementType) && '📖'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-cyan-300 font-mono uppercase tracking-wider">
                  {element.name || element.title || 'ADE Story Element'}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-wider ${pillStyle}`}>
                  {elementType}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Interactive Narrative Element • Linked to Story Foundry & Tactical Grid
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-sm transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dossier'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} className="text-cyan-400" />
            <span>Narrative Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 size={13} className="text-amber-400" />
            <span>Tactical & Player Actions</span>
          </button>

          {isTrapOrHazard && (
            <button
              type="button"
              onClick={() => setActiveTab('reactive_config')}
              className={`px-3 py-1 rounded-lg font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reactive_config'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame size={13} className="text-orange-400" />
              <span>Reactive Trap Settings</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs scrollbar-thin">
          {/* TAB 1: DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-4">
              {/* Summary / Premise */}
              {(element.summary || element.description || element.concept || element.hook) && (
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Overview & Narrative Premise
                  </h4>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {element.summary || element.description || element.concept || element.hook}
                  </p>
                </div>
              )}

              {/* Sensory Atmosphere & Read-Aloud Text */}
              {(element.atmosphere || element.sensoryDialogue || element.soundsSmells || element.keySights) && (
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                      <Volume2 size={13} />
                      <span>Atmospheric Sensory & Read-Aloud</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleReadAloud}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      📢 Read to Party
                    </button>
                  </div>
                  <p className="text-slate-300 italic text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    "{element.atmosphere || element.sensoryDialogue || element.soundsSmells || element.keySights}"
                  </p>
                </div>
              )}

              {/* Mechanical / Tactical Rules */}
              {(element.mechanic || element.properties || element.information || element.conclusion) && (
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                    Mechanics, Investigation Clues & Rules
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                    {element.mechanic || element.properties || element.information || element.conclusion}
                  </p>
                </div>
              )}

              {/* Tags & Metadata Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Tags: <span className="text-slate-300">{element.tags || 'None'}</span></span>
                <span>ID: <code className="text-cyan-400">{element.id}</code></span>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              {/* Action 1: Read Aloud Sensory Broadcast */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Volume2 size={14} className="text-cyan-400" />
                    <span>Read-Aloud Sensory Description</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Display atmospheric description banner on all player screens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  📢 Read Aloud
                </button>
              </div>

              {/* Action 2: Broadcast Handout / Clue to Spectator */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Share2 size={14} className="text-emerald-400" />
                    <span>Broadcast Handout to Players</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Push document, blueprint, or evidence card directly to the live spectator display.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBroadcastToPlayers}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isRevealedToPlayers
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isRevealedToPlayers ? '✓ Broadcasted' : '📺 Reveal to Players'}
                </button>
              </div>

              {/* Action 3: Interactive Investigation / Skill Check */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Search size={14} className="text-amber-400" />
                    <span>Investigation & Skill Check (2d10 vs DC)</span>
                  </h4>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-400">Skill Mod:</span>
                    <input
                      type="number"
                      value={skillBonus}
                      onChange={(e) => setSkillBonus(e.target.value)}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-amber-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSkillCheck('Perception (Notice Clue)', 13)}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] font-mono text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-amber-300">👁️ Perception</div>
                    <div className="text-[10px] text-slate-400">Target DC 13</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkillCheck('Tech / Slicing (Data Extraction)', 14)}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] font-mono text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-cyan-300">💻 Slicing</div>
                    <div className="text-[10px] text-slate-400">Target DC 14</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkillCheck('Forensics / Medicine (Autopsy)', 15)}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] font-mono text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-purple-300">🔬 Forensics</div>
                    <div className="text-[10px] text-slate-400">Target DC 15</div>
                  </button>
                </div>

                {lastCheckResult && (
                  <div className={`p-2.5 rounded-lg text-xs font-mono border ${lastCheckResult.isSuccess ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-200'}`}>
                    {lastCheckResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REACTIVE TRAP SETTINGS */}
          {activeTab === 'reactive_config' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-400" />
                  <span>Trap Trigger & Saving Throw Configuration</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">State</label>
                    <select
                      value={trapState}
                      onChange={(e) => setTrapState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="armed">🔴 Armed & Active</option>
                      <option value="disarmed">🟢 Disarmed (Inert)</option>
                      <option value="triggered">🟡 Already Triggered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Save DC</label>
                    <input
                      type="number"
                      value={trapDc}
                      onChange={(e) => setTrapDc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Damage Dice</label>
                    <input
                      type="text"
                      value={trapDamage}
                      onChange={(e) => setTrapDamage(e.target.value)}
                      placeholder="2d10+4"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTrapConfig}
                  className="w-full py-2 bg-orange-950 hover:bg-orange-900 border border-orange-500/50 text-orange-200 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Save Reactive Trap Parameters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">ADE Virtual Tabletop Bridge</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryElementModal;
