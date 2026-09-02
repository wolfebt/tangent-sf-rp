import React, { useState } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { REST_SYSTEM_RULES } from '../../../engines/tangentConstants';
import { calculateRestDegradation, getSpeciesRestProfile } from '../../../engines/tangentRestEngine';

const RestRecoveryModal = ({ isOpen, onClose }) => {
  const { 
    characterData, 
    derivedStats, 
    takeCharacterRest, 
    resetDailyCharacterRests 
  } = useFolio();

  const [activeTab, setActiveTab] = useState('execute'); // 'execute' | 'codex'
  const [restType, setRestType] = useState('light'); // 'light' | 'full'
  const [activityTier, setActivityTier] = useState('nap'); // 'nap' | 'lounging' | 'light_duty'
  const [interruptions, setInterruptions] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const speciesProfile = derivedStats?.speciesRestProfile || getSpeciesRestProfile(characterData);
  const currentVit = characterData.current_vitality !== undefined ? parseInt(characterData.current_vitality, 10) : parseInt(characterData.vitality || 30, 10);
  const maxVit = derivedStats?.maxVitality || Math.max(30, parseInt(characterData.vitality || 30, 10));
  const currentHealth = characterData.current_health !== undefined ? parseInt(characterData.current_health, 10) : parseInt(characterData.health || 30, 10);
  const maxHealth = derivedStats?.maxHealth || Math.max(30, parseInt(characterData.health || 30, 10));
  const lightRestsToday = characterData.light_rests_today !== undefined ? parseInt(characterData.light_rests_today, 10) : (derivedStats?.lightRestsToday || 0);
  const maxLightRests = 4;
  const isAtLightRestLimit = lightRestsToday >= maxLightRests;

  const degradation = calculateRestDegradation(activityTier, interruptions);

  const handleExecuteRest = async () => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const heroId = characterData['character-doc-id'] || characterData.id || 'active';
      const result = await takeCharacterRest(heroId, {
        restType,
        activityTier,
        interruptions
      });

      if (!result.success) {
        setFeedbackMessage({ type: 'error', text: result.error });
      } else {
        setFeedbackMessage({ type: 'success', text: result.logMessage });
        setInterruptions(0);
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Rest execution failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDaily = async () => {
    const heroId = characterData['character-doc-id'] || characterData.id || 'active';
    await resetDailyCharacterRests(heroId);
    setFeedbackMessage({ type: 'success', text: 'Daily rest counter reset to 0/4 for the new day.' });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 pt-10 sm:pt-14 pb-12 overflow-y-auto select-none font-sans">
      <div className="bg-[#0e1422] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-slate-100 space-y-6">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-900/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-cyan-300">
                Rest &amp; Recovery Management
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Canonical biological rest cycles, species physiological adaptations, and fatigue triage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('execute')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'execute' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Execute Rest
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('codex')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'codex' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📖 Rules Codex
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {activeTab === 'execute' ? (
          <div className="space-y-6">
            
            {/* Character Vitals & Species Physiology Profile Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              
              {/* Hero & Species */}
              <div className="space-y-1 md:border-r border-slate-800/80 pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Hero</div>
                <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>👤</span> {characterData['char-name'] || 'Active Hero'}
                </div>
                <div className="text-xs text-slate-400">
                  {characterData['char-species'] || 'Unknown Species'} {characterData['char-archetype'] ? `• ${characterData['char-archetype']}` : ''}
                </div>
                <div className="pt-1.5">
                  <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                    speciesProfile.category === 'minimal_rest'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : speciesProfile.category === 'meditative'
                      ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                      : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  }`}>
                    <span>{speciesProfile.category === 'minimal_rest' ? '⚙️' : speciesProfile.category === 'meditative' ? '🧘' : '🧬'}</span>
                    {speciesProfile.badgeLabel}
                  </span>
                </div>
              </div>

              {/* Vitals Summary */}
              <div className="space-y-2 md:border-r border-slate-800/80 pr-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Vitality Buffer</div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-cyan-300 font-bold">Vitality (Non-Lethal)</span>
                    <span className="text-slate-300 font-bold">{currentVit} / {maxVit}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${currentVit <= 10 ? 'bg-rose-500' : currentVit < maxVit ? 'bg-amber-400' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(100, Math.round((currentVit / maxVit) * 100))}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                  <span>Health: <strong className="text-slate-200">{currentHealth}/{maxHealth}</strong></span>
                  {derivedStats?.isSynthetic && <span>Structure: <strong className="text-amber-300">{derivedStats.structure} SP</strong></span>}
                </div>
              </div>

              {/* Daily Light Rest Tracker */}
              <div className="space-y-1.5 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Light Rests Today</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{lightRestsToday} / {maxLightRests} Used</span>
                </div>

                {/* Visual Tracker Pips */}
                <div className="flex items-center gap-2 py-1">
                  {[0, 1, 2, 3].map((idx) => {
                    const isUsed = idx < lightRestsToday;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 h-3 rounded-md border flex items-center justify-center text-[9px] font-bold transition-all ${
                          isUsed 
                            ? 'bg-amber-500/30 border-amber-500/60 text-amber-300' 
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                        title={isUsed ? `Rest ${idx + 1} used today` : `Rest slot ${idx + 1} available`}
                      >
                        {isUsed ? '●' : '○'}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-500">Max 4 Rests / Adventuring Day</span>
                  <button
                    type="button"
                    onClick={handleResetDaily}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    title="Reset light rest counter for a new 24h day"
                  >
                    ↻ New Day Reset
                  </button>
                </div>
              </div>

            </div>

            {/* Species Rule Callout Alert */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              speciesProfile.category === 'minimal_rest'
                ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
                : speciesProfile.category === 'meditative'
                ? 'bg-purple-950/30 border-purple-600/40 text-purple-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <span>{speciesProfile.category === 'minimal_rest' ? '⚙️' : speciesProfile.category === 'meditative' ? '🧘' : 'ℹ️'}</span>
                <span>Species Physiology: {speciesProfile.summary}</span>
              </div>
              <p className="text-[11px] opacity-90">{speciesProfile.description}</p>
            </div>

            {/* Rest Type Selector: Full Rest vs Light Rest */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Select Rest Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Full Rest Option */}
                <div
                  onClick={() => setRestType('full')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    restType === 'full'
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                      <span>🌙</span> Full Rest (6 to 8 Hours)
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                      Standard Sleep Cycle
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Restores 100% of maximum Vitality, resets daily limited-use traits, clears the Exhausted condition, and resets your 4 daily Light Rests.
                  </p>
                  <div className="text-[10.5px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>✓</span> Full recovery for standard sentients.
                  </div>
                </div>

                {/* Light Rest Option */}
                <div
                  onClick={() => setRestType('light')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    restType === 'light'
                      ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                      <span>☕</span> Light Rest (1 to 3 Hours)
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isAtLightRestLimit ? 'bg-rose-900/60 text-rose-300 border-rose-700' : 'bg-cyan-900/60 text-cyan-200 border-cyan-700/50'}`}>
                      {lightRestsToday} / 4 Used Today
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Short downtime to recharge stamina, reset traits, and remove Exhaustion. Performed up to 4 times per day.
                  </p>
                  <div className="text-[10.5px] font-mono text-cyan-400 flex items-center gap-1">
                    <span>✓</span> {speciesProfile.lightRestCountsAsFull ? 'Counts as Full Rest for your species!' : 'Tier determines time needed.'}
                  </div>
                </div>

              </div>
            </div>

            {/* Light Rest Specific Configuration: Activity Tier & Strenuous Degradation */}
            {restType === 'light' && (
              <div className="space-y-4 bg-slate-950/50 border border-cyan-900/40 rounded-xl p-4">
                
                {/* 1. Activity Tier Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      1. Choose Activity Level
                    </label>
                    <span className="text-[10px] text-slate-400">Duration depends on physical exertion</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {Object.values(REST_SYSTEM_RULES.LIGHT_REST.tiers).map((tier) => {
                      const isSelected = activityTier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setActivityTier(tier.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-500 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-slate-200">{tier.name}</span>
                              <span className="text-[10px] font-mono font-bold text-amber-300">{tier.durationHours}h</span>
                            </div>
                            <div className="text-[9.5px] text-cyan-400 font-medium mb-1.5">{tier.quality}</div>
                            <p className="text-[10.5px] text-slate-400 leading-snug">{tier.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Strenuous Interruption Simulator & Degradation Stepper */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <span>⚠️</span> Strenuous Interruption Stepper
                      </div>
                      <p className="text-[10.5px] text-slate-400">
                        Physical labor, intense exercise, or mental exertion degrades rest tier by 1 stage per event.
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setInterruptions(prev => Math.max(0, prev - 1))}
                        disabled={interruptions === 0}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-mono font-bold cursor-pointer"
                        title="Remove 1 interruption"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-amber-400 px-1">
                        {interruptions} {interruptions === 1 ? 'Interruption' : 'Interruptions'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInterruptions(prev => Math.min(3, prev + 1))}
                        disabled={interruptions >= 3}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-mono font-bold cursor-pointer"
                        title="Add 1 strenuous activity interruption"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Degradation Track Visualizer */}
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] pt-1">
                    {[
                      { id: 'nap', label: 'Nap (1h)' },
                      { id: 'lounging', label: 'Lounging (2h)' },
                      { id: 'light_duty', label: 'Light Duty (3h)' },
                      { id: 'not_rested', label: 'Not Rested (Ruined)' }
                    ].map((step, idx) => {
                      const isActive = degradation.effectiveTier === step.id;
                      const isInitial = activityTier === step.id;
                      return (
                        <div
                          key={step.id}
                          className={`p-1.5 rounded border transition-all ${
                            isActive
                              ? step.id === 'not_rested'
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                                : 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : isInitial
                              ? 'bg-slate-900 border-slate-700 text-slate-300'
                              : 'bg-slate-950/40 border-slate-850 text-slate-600'
                          }`}
                        >
                          <div>{step.label}</div>
                          {isActive && <div className="text-[8px] uppercase tracking-wider text-cyan-300 mt-0.5">Active Result</div>}
                        </div>
                      );
                    })}
                  </div>

                  {degradation.isCancelled ? (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
                      <span>⛔</span>
                      <span><strong>Rest Ruined:</strong> Too many strenuous activities occurred. The character gains NO rest benefits and remains fatigued.</span>
                    </div>
                  ) : degradation.degradedSteps > 0 ? (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                      <span>⚠️</span>
                      <span><strong>Rest Degraded by {degradation.degradedSteps} Stage(s):</strong> Required downtime increased to <strong>{degradation.durationHours} hours</strong>.</span>
                    </div>
                  ) : null}

                </div>

              </div>
            )}

            {/* Feedback / Status Alert */}
            {feedbackMessage && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                feedbackMessage.type === 'success' 
                  ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-600/60 text-rose-200'
              }`}>
                <span>{feedbackMessage.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400">
                {restType === 'full' ? (
                  <span>Restoring 100% Vitality and resetting daily trait uses.</span>
                ) : (
                  <span>Required downtime: <strong className="text-amber-300">{degradation.durationHours} Hours</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRest}
                  disabled={isProcessing || (restType === 'light' && (isAtLightRestLimit || degradation.isCancelled))}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  {isProcessing ? 'Resting...' : restType === 'full' ? 'Complete Full Rest (6–8h)' : 'Complete Light Rest'}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* CODEX TAB: Complete canonical rules text */
          <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2 text-xs leading-relaxed text-slate-300">
            
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🛡️</span> Strategic Role &amp; Gameplay Impact
              </h3>
              <p>
                In-game features or abilities that require rest add a layer of strategy and resource management to gameplay. Players must balance using these abilities with resting to ensure they are available when needed. This can be particularly challenging in fast-paced games or during intense battles, where players may be tempted to overuse their abilities without considering the consequences.
              </p>
              <p>
                The need for rest can have a significant impact on gameplay. For example, players may have to choose between using a powerful ability in the heat of battle or saving it for later, knowing that they will need to rest before they can use it again. This can lead to difficult decisions and strategic trade-offs. Players must carefully consider the risks and rewards of using their abilities, as well as the impact it will have on their character's overall health and stamina.
              </p>
              <p>
                Rest mechanics also encourage roleplaying opportunities. Players may need to find safe places to rest, such as inns or campsites, and take time to relax and recover. This can provide opportunities for character development and interaction, as players can talk to NPCs, learn new information, or simply take a break from the action. Rest mechanics can help to create a more immersive and believable game world, as players must take into account their character's physical and mental needs.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <span>🌙</span> Full Rest Rules &amp; Species Exceptions
              </h3>
              <p>
                The typical sleep cycle for most sentient species ranges from <strong>6 to 8 hours</strong>. This allows their bodies and minds to rest and recharge, preparing them for the following day's activities. However, there are exceptions to this general rule:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-600/40 text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-300">
                    <span>⚙️</span> Synthetics, Fae, and Insect Species
                  </div>
                  <p className="text-[11px]">
                    Synthetics, Fae, and Insect species possess unique physiological attributes that enable them to function without traditional sleep. These species have evolved to require minimal rest, and a brief period of <strong>Light Rest is sufficient for them to fully refresh and maintain their energy levels</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-600/40 text-purple-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-purple-300">
                    <span>🧘</span> Alterians and Mondi (Meditations)
                  </div>
                  <p className="text-[11px]">
                    In contrast, Alterians and Mondi, while technically not sleeping, engage in meditations throughout the day. This is considered <strong>Light Rest</strong>, where they enter a state of deep contemplation and reflection. During this relaxing state, their minds and bodies find solace, allowing them to recharge and maintain their mental and physical well-being.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                The ability of these species to function without extended periods of sleep demonstrates how life can flourish in various forms, each with its own unique set of requirements and characteristics.
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>☕</span> Light Rest Tiers &amp; Degradation Rules
              </h3>
              <p>
                A nap or rest period is a short period of little or no activity that can effectively reset traits or features. It can be performed <strong>up to four times a day</strong>. Time needed to count as a Light Rest depends on the activity level of the character:
              </p>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-300">1. Nap or Meditation (1 Hour):</strong> This is the most restful period and is ideal for resetting traits or features. During this time, it's important to do nothing else but rest and relax.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-amber-300">2. Lounging (2 Hours):</strong> This type of rest period is less restful than a nap or meditation but still beneficial. Casual observation, light recreation, and non-laborious activities are allowed during this time.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-orange-300">3. Light Duty (3 Hours):</strong> This type of rest period is the least restful but still counts as a rest period. Light recreation, casual work, and minimal labor activities are allowed during this time.
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="font-bold text-rose-300 text-xs">Strenuous Activity Penalty</div>
                <p className="text-[11px]">
                  Any activities more strenuous than those listed above will count against rest. This includes physical labor, intense exercise, and mentally demanding tasks. Each time a strenuous activity is performed, it will worsen the rest category (e.g., <strong>Nap to Lounging to Light Duty to Not Rested</strong>).
                </p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
                <span>✨</span> Second Wind (Karma Integration)
              </h3>
              <p className="text-[11px]">
                A character may spend <strong>1 Karma Point</strong> to take a <strong>"Second Wind"</strong> (1 full minute of internal focus), which bypasses downtime and <strong>replaces a Light Rest</strong>, instantly refreshing daily limited-use abilities and recovering Vitality without taking hours of downtime.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RestRecoveryModal;
