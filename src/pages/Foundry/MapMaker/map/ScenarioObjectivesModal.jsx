import React, { useState } from 'react';
import { OBJECTIVE_TEMPLATES, evaluateScenarioProgress, triggerWaveIncursion } from '../../../../services/scenarioEngineService';
import { AudioService } from '../../../../services/audioService';

const ScenarioObjectivesModal = ({
  isOpen,
  onClose,
  objectives = [],
  onAddObjective,
  onUpdateObjective,
  onDeleteObjective,
  tokens = [],
  onSpawnWaveTokens,
  currentRound = 1,
  onAwardMissionRewards,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  if (!isOpen) return null;

  const [selectedTemplate, setSelectedTemplate] = useState('extraction');
  const [customTitle, setCustomTitle] = useState('Extraction & Tactical Evac');
  const [targetTokenId, setTargetTokenId] = useState(tokens.find(t => !t.linkedHeroId)?.id || '');
  const [roundsRequired, setRoundsRequired] = useState(5);
  const [rewardAP, setRewardAP] = useState(2);
  const [rewardKarma, setRewardKarma] = useState(1);

  const evaluation = evaluateScenarioProgress(objectives, tokens, currentRound);

  const handleTemplateSelect = (templateId) => {
    const tmpl = OBJECTIVE_TEMPLATES.find(t => t.id === templateId) || OBJECTIVE_TEMPLATES[0];
    setSelectedTemplate(templateId);
    setCustomTitle(tmpl.title);
    setRewardAP(tmpl.rewardAP);
    setRewardKarma(tmpl.rewardKarma);
    if (tmpl.roundsRequired) setRoundsRequired(tmpl.roundsRequired);
  };

  const handleCreateObjective = () => {
    AudioService.playTerminalBeep(780, 0.15);
    const tmpl = OBJECTIVE_TEMPLATES.find(t => t.id === selectedTemplate) || OBJECTIVE_TEMPLATES[0];
    const newObj = {
      id: `obj_${Date.now()}`,
      type: tmpl.type,
      title: customTitle,
      icon: tmpl.icon,
      targetTokenId: tmpl.type === 'assassination' ? targetTokenId : null,
      roundsRequired: tmpl.type === 'holdout' ? parseInt(roundsRequired, 10) : null,
      rewardAP: parseInt(rewardAP, 10) || 1,
      rewardKarma: parseInt(rewardKarma, 10) || 1,
      isComplete: false
    };

    onAddObjective?.(newObj);
  };

  const handleSpawnWave = (waveTier = 'skirmish') => {
    AudioService.playCombatHit(true);
    const waveTokens = triggerWaveIncursion(waveTier, {
      spawnX: 400 + Math.random() * 200,
      spawnY: 400 + Math.random() * 200
    });

    onSpawnWaveTokens?.(waveTokens);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 100, `🚨 REINFORCEMENTS INBOUND (${waveTokens.length} UNITS)`, 'damage');
    }
  };

  const handleDisburseRewards = () => {
    AudioService.playTerminalBeep(1400, 0.3);
    onAwardMissionRewards?.(evaluation.totalApReward, evaluation.totalKarmaReward);
    if (onTriggerFloatingText) {
      onTriggerFloatingText(window.innerWidth / 2, 100, `🏆 MISSION REWARDS: +${evaluation.totalApReward} AP / +${evaluation.totalKarmaReward} KARMA`, 'karma');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-8 sm:pt-12 md:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0f172a] border border-cyan-500/60 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] overflow-hidden flex flex-col text-slate-200 font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h3 className="font-bold text-sm text-cyan-300 uppercase tracking-wider">
                Scenario Objectives & Wave Incursion Director
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Round {currentRound} • Live Mission Telemetry & Automated AP / Karma Rewards
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
          {/* Column 1: Add Objective & Wave Trigger */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Add Mission Objective
            </span>

            {/* Template Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {OBJECTIVE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedTemplate === tmpl.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{tmpl.icon}</span>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold truncate">{tmpl.title}</h5>
                    <p className="text-[8px] text-slate-400 font-mono">+{tmpl.rewardAP} AP / +{tmpl.rewardKarma} Karma</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold">Objective Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                />
              </div>

              {selectedTemplate === 'commander_assassination' && (
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Target Enemy Unit</label>
                  <select
                    value={targetTokenId}
                    onChange={(e) => setTargetTokenId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  >
                    {tokens.filter(t => !t.linkedHeroId).map(t => (
                      <option key={t.id} value={t.id}>{t.label || 'Adversary'}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTemplate === 'holdout_defense' && (
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Required Holdout Rounds</label>
                  <input
                    type="number"
                    value={roundsRequired}
                    onChange={(e) => setRoundsRequired(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Reward AP</label>
                  <input
                    type="number"
                    value={rewardAP}
                    onChange={(e) => setRewardAP(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Reward Karma</label>
                  <input
                    type="number"
                    value={rewardKarma}
                    onChange={(e) => setRewardKarma(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateObjective}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>➕</span> Add Objective
            </button>

            {/* Reinforcement Spawner */}
            <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 rounded-lg flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                Trigger Reinforcement Incursion
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSpawnWave('skirmish')}
                  className="py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer border border-rose-700"
                >
                  🚀 Skirmishers (2)
                </button>
                <button
                  type="button"
                  onClick={() => handleSpawnWave('heavy')}
                  className="py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer border border-purple-700"
                >
                  🛸 Heavy Drop (3)
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Active Objectives & Status */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Objectives ({objectives.length})
            </span>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1">
              {objectives.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No active objectives defined for this scenario.
                </div>
              ) : (
                evaluation.evaluations.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                      obj.isComplete
                        ? 'bg-emerald-950/50 border-emerald-500/70'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{obj.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">
                          {obj.title}
                        </h4>
                        <p className={`text-[10px] font-mono ${obj.isComplete ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {obj.progressText} • +{obj.rewardAP} AP / +{obj.rewardKarma} Karma
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateObjective?.(obj.id, { isComplete: !obj.isComplete })}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                          obj.isComplete
                            ? 'bg-emerald-800 text-white border-emerald-600'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {obj.isComplete ? '✓ Done' : '○ Pending'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteObjective?.(obj.id)}
                        className="px-1.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Victory Summary & Disburse */}
            {objectives.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 mt-auto">
                <span className="text-[10px] font-mono text-slate-300">
                  {evaluation.summaryText}
                </span>
                <button
                  type="button"
                  onClick={handleDisburseRewards}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>🏆</span> Disburse Mission Rewards
                </button>
              </div>
            )}
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

export default ScenarioObjectivesModal;
