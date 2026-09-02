import React, { useState } from 'react';
import DraggablePanel from './DraggablePanel';
import { useFolio } from '../../../../context/FolioContext';
import { AudioService } from '../../../../services/audioService';
import KarmaCodexModal from '../../../../components/Folio/modals/KarmaCodexModal';
import ExperienceCodexModal from '../../../../components/Folio/modals/ExperienceCodexModal';
import CombatResolutionModal from './CombatResolutionModal';
import MapActionEconomyDrawer from './MapActionEconomyDrawer';
import StarshipBridgeModal from './StarshipBridgeModal';
import EncounterTensionWidget from '../../../../components/StoryFoundry/EncounterTensionWidget';
import SessionRecapModal from '../../../../components/StoryFoundry/SessionRecapModal';
import RulebookAssistantModal from '../../../../components/RulesAssistant/RulebookAssistantModal';
import PassivePerceptionRadarModal from '../../../../components/RulesAssistant/PassivePerceptionRadarModal';
import ProgressionKarmaLedgerModal from '../../../../components/RulesAssistant/ProgressionKarmaLedgerModal';
import UduFacilityGeneratorModal from '../../../../components/StoryFoundry/UduFacilityGeneratorModal';
import EconomatrixLootGeneratorModal from '../../../../components/StoryFoundry/EconomatrixLootGeneratorModal';
import FactionClocksModal from '../../../../components/StoryFoundry/FactionClocksModal';
import SocialDispositionModal from '../../../../components/StoryFoundry/SocialDispositionModal';
import BastionWhisperDrawer from '../../../../components/StoryFoundry/BastionWhisperDrawer';
import EncounterSimModal from '../../../../components/StoryFoundry/EncounterSimModal';
import SkillChallengeModal from '../../../../components/StoryFoundry/SkillChallengeModal';
import CyberDeckModal from '../../../../components/StoryFoundry/CyberDeckModal';
import RulesAdjudicatorPanel from '../../../../components/RulesAssistant/RulesAdjudicatorPanel';
import GalaxyStarmapModal from '../../../../components/StoryFoundry/GalaxyStarmapModal';
import FactionWebModal from '../../../../components/StoryFoundry/FactionWebModal';
import ModularStarshipForgeModal from '../../../../components/StoryFoundry/ModularStarshipForgeModal';
import ConditionManagerModal from './ConditionManagerModal';
import ReactionPromptModal from './ReactionPromptModal';
import AoEResolutionModal from './AoEResolutionModal';
import HazmatVolumeManagerModal from './HazmatVolumeManagerModal';
import InteractiveObjectModal from './InteractiveObjectModal';
import ScenarioObjectivesModal from './ScenarioObjectivesModal';
import { SENSOR_MODES } from '../../../../services/sensorVisionService';
import { evaluateTokenConditionsOnTurnStart } from '../../../../services/conditionService';
import { decideAutonomousAction, BEHAVIOR_PROFILES } from '../../../../services/unitBehaviorService';
import { resolveAutonomousAttack } from '../../../../services/autoCombatResolver';
import { evaluateHazmatTick } from '../../../../services/hazmatVolumeService';

const MapCombatTracker = ({
  tokens = [],
  activeTurnTokenId = null,
  setActiveTurnTokenId,
  onNextTurn,
  showTracker,
  setShowTracker,
  onSelectToken,
  onUpdateTokenHealth,
  onUpdateTokenVitality,
  onUpdateTokenStructure,
  onUpdateTokenHp,
  onUpdateToken,
  onUpdateTokenConditions,
  onTriggerFloatingText,
  scale = 1,
  position = { x: 0, y: 0 }
}) => {
  const {
    updateCharacterHealth,
    updateCharacterVitality,
    updateCharacterStructure,
    updateCharacterHp,
    stabilizeCharacter,
    awardCharacterKarma,
    updateCharacterKarma,
    resetCharacterKarma,
    awardExperience,
    awardPartyKarma,
    awardPartyExperience,
    personaRoster,
    characterData
  } = useFolio();

  const [showPartyAwardsModal, setShowPartyAwardsModal] = useState(false);
  const [selectedHeroForAp, setSelectedHeroForAp] = useState(null);
  const [activeKarmaActionTokenId, setActiveKarmaActionTokenId] = useState(null);
  const [showKarmaRulesModal, setShowKarmaRulesModal] = useState(false);
  const [showExperienceRulesModal, setShowExperienceRulesModal] = useState(false);
  const [showCombatResolver, setShowCombatResolver] = useState(false);
  const [resolverAttackerId, setResolverAttackerId] = useState(null);
  const [showStarshipBridge, setShowStarshipBridge] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showRulebookModal, setShowRulebookModal] = useState(false);
  const [showPerceptionRadar, setShowPerceptionRadar] = useState(false);
  const [showProgressionLedger, setShowProgressionLedger] = useState(false);
  const [showFacilityGen, setShowFacilityGen] = useState(false);
  const [showLootGen, setShowLootGen] = useState(false);
  const [showFactionClocks, setShowFactionClocks] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [selectedTokenForConditions, setSelectedTokenForConditions] = useState(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionReactorToken, setReactionReactorToken] = useState(null);
  const [reactionTargetToken, setReactionTargetToken] = useState(null);
  const [reactionEventDesc, setReactionEventDesc] = useState('');
  const [showAoEModal, setShowAoEModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedNpcForSocial, setSelectedNpcForSocial] = useState(null);
  const [showWhisperDrawer, setShowWhisperDrawer] = useState(false);
  const [showEncounterSimModal, setShowEncounterSimModal] = useState(false);
  const [showSkillChallengeModal, setShowSkillChallengeModal] = useState(false);
  const [showCyberDeckModal, setShowCyberDeckModal] = useState(false);
  const [showRulesAdjudicator, setShowRulesAdjudicator] = useState(false);
  const [showGalaxyStarmapModal, setShowGalaxyStarmapModal] = useState(false);
  const [showFactionWebModal, setShowFactionWebModal] = useState(false);
  const [showModularStarshipForge, setShowModularStarshipForge] = useState(false);
  const [showHazmatModal, setShowHazmatModal] = useState(false);
  const [showInteractiveObjModal, setShowInteractiveObjModal] = useState(false);
  const [selectedInteractiveObj, setSelectedInteractiveObj] = useState(null);
  const [localHazardZones, setLocalHazardZones] = useState([]);
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);
  const [activeSensorMode, setActiveSensorMode] = useState('standard_optical');
  const [localObjectives, setLocalObjectives] = useState([]);

  if (!showTracker) return null;

  // Filter tokens that are units (exclude portal links) and sort by initiative descending
  const sortedTokens = [...tokens]
    .filter(t => t.type !== 'link')
    .sort((a, b) => {
      const initA = a.initiative !== undefined && a.initiative !== null ? a.initiative : -99;
      const initB = b.initiative !== undefined && b.initiative !== null ? b.initiative : -99;
      return initB - initA;
    });

  const handleApplyHealthChange = (token, amount, isDamage = true) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);

    // Synthetic rule: Synthetics route all lethal damage to Structure
    if (token.isSynthetic || Boolean(token.structure)) {
      handleApplyStructureChange(token, numAmount, isDamage);
      return;
    }

    const health = token.health || token.hp || { current: 30, max: 30 };
    const currentHealth = health.current !== undefined ? health.current : 30;
    const maxHealth = health.max || 30;
    const vitality = token.vitality || { current: 30, max: 30 };
    const currentVitality = vitality.current !== undefined ? vitality.current : 30;
    const sta = Math.max(1, parseInt(token.stamina || token.toughness || 1, 10));

    const isAtDeathsDoor = (currentHealth <= 0 && currentVitality <= 0) || (token.conditions || []).includes("Death's Door");

    // Rule 2 Massive Damage: Single hit >= STA score while at Death's Door causes instant permanent death
    if (isDamage && isAtDeathsDoor && numAmount >= sta) {
      AudioService.playCombatHit(true);
      const currentConds = (token.conditions || []).filter(c => c !== "Death's Door" && c !== "Comatose");
      const nextConds = currentConds.includes('Dead') ? currentConds : [...currentConds, 'Dead'];
      
      onUpdateToken?.(token.id, {
        conditions: nextConds,
        isDead: true,
        isAtDeathsDoor: false,
        deathClock: 0
      });

      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `💀 INSTANT DEATH (MASSIVE DAMAGE >= ${sta})`, 'damage');
      }
      return;
    }

    if (isDamage) {
      // Lethal Damage Rule: Damages Health directly.
      // When reduced to 0 Health: falls unconscious, drops items, falls prone.
      // Any excess damage is applied to Vitality (if any remains).
      let newHealth = currentHealth - numAmount;
      let excessDamage = 0;
      let newVitality = currentVitality;

      if (newHealth < 0) {
        excessDamage = Math.abs(newHealth);
        newHealth = 0;
        if (currentVitality > 0) {
          newVitality = Math.max(0, currentVitality - excessDamage);
          if (onUpdateTokenVitality) {
            onUpdateTokenVitality(token.id, newVitality, true, excessDamage);
          } else if (token.linkedHeroId && updateCharacterVitality) {
            updateCharacterVitality(token.linkedHeroId, newVitality);
          }
        }
      }

      if (onUpdateTokenHealth) {
        onUpdateTokenHealth(token.id, newHealth, true, numAmount);
      } else if (onUpdateTokenHp) {
        onUpdateTokenHp(token.id, newHealth, true, numAmount);
      } else if (token.linkedHeroId && updateCharacterHealth) {
        updateCharacterHealth(token.linkedHeroId, newHealth);
      }

      // Update conditions according to canonical Threshold of Death rules
      let nextConds = [...(token.conditions || [])];
      if (newHealth <= 0) {
        ['Incapacitated', 'Unconscious', 'Prone'].forEach(cond => {
          if (!nextConds.includes(cond)) nextConds.push(cond);
        });

        // Death's Door: Health is 0 AND Vitality is 0
        if (newVitality <= 0) {
          if (!nextConds.includes("Death's Door")) nextConds.push("Death's Door");
          if (!nextConds.includes("Comatose")) nextConds.push("Comatose");
          nextConds = nextConds.filter(c => c !== 'Stabilized');

          onUpdateToken?.(token.id, {
            conditions: nextConds,
            isAtDeathsDoor: true,
            isComatose: true,
            isStabilized: false,
            deathClock: token.deathClock || sta
          });
        } else {
          onUpdateToken?.(token.id, {
            conditions: nextConds
          });
        }
      }

      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        if (newHealth <= 0 && newVitality <= 0) {
          onTriggerFloatingText(screenX, screenY, `💀 ENTERED DEATH'S DOOR (${sta} RNDS)`, 'damage');
        } else if (newHealth <= 0) {
          onTriggerFloatingText(screenX, screenY, `🛌 INCAPACITATED (-${excessDamage} TO VIT)`, 'damage');
        } else {
          onTriggerFloatingText(screenX, screenY, `-${numAmount} HEALTH`, 'damage');
        }
      }
    } else {
      // Healing Health
      const newHealth = Math.min(maxHealth, currentHealth + numAmount);

      if (onUpdateTokenHealth) {
        onUpdateTokenHealth(token.id, newHealth, false, numAmount);
      } else if (onUpdateTokenHp) {
        onUpdateTokenHp(token.id, newHealth, false, numAmount);
      } else if (token.linkedHeroId && updateCharacterHealth) {
        updateCharacterHealth(token.linkedHeroId, newHealth);
      }

      if (newHealth > 0) {
        const nextConds = (token.conditions || []).filter(c => c !== "Death's Door" && c !== "Comatose" && c !== "Dead");
        if (!nextConds.includes("Stabilized")) nextConds.push("Stabilized");
        onUpdateToken?.(token.id, {
          conditions: nextConds,
          isAtDeathsDoor: false,
          isComatose: false,
          isDead: false,
          isStabilized: true,
          deathClock: null
        });
      }

      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `+${numAmount} HEALTH`, 'heal');
      }
    }
  };

  const handleStabilizeToken = (token) => {
    AudioService.playTerminalBeep(660, 0.1);
    const nextConds = (token.conditions || []).filter(c => c !== "Death's Door" && c !== "Comatose");
    if (!nextConds.includes("Stabilized")) nextConds.push("Stabilized");

    onUpdateToken?.(token.id, {
      conditions: nextConds,
      isAtDeathsDoor: false,
      isComatose: false,
      isStabilized: true,
      deathClock: null
    });

    if (token.linkedHeroId && stabilizeCharacter) {
      stabilizeCharacter(token.linkedHeroId, { hasHealingEffect: true });
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `🩹 STABILIZED (CLOCK STOPPED)`, 'heal');
    }
  };

  const handleApplyVitalityChange = (token, amount, isDamage = true) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);

    // Synthetic rule: Synthetics are IMMUNE to non-lethal fatigue, environmental stress & subdual damage!
    if (isDamage && (token.isSynthetic || Boolean(token.structure))) {
      AudioService.playTerminalBeep(440, 0.08);
      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🤖 SYNTHETIC IMMUNE (NON-LETHAL)`, 'miss');
      }
      return;
    }

    const vitality = token.vitality || { current: 30, max: 30 };
    const currentVitality = vitality.current !== undefined ? vitality.current : 30;
    const maxVitality = vitality.max || 30;

    // Non-lethal damage rule: Only when Vitality is completely depleted does damage spill into Health!
    if (isDamage && numAmount > currentVitality) {
      const spillover = numAmount - currentVitality;
      const newVitality = 0;

      if (onUpdateTokenVitality) {
        onUpdateTokenVitality(token.id, newVitality, isDamage, currentVitality);
      } else if (token.linkedHeroId && updateCharacterVitality) {
        updateCharacterVitality(token.linkedHeroId, newVitality);
      }

      if (onTriggerFloatingText) {
        const screenX = (token.x || 0) * scale + position.x;
        const screenY = (token.y || 0) * scale + position.y;
        onTriggerFloatingText(
          screenX,
          screenY,
          `-${currentVitality} VIT (SPILLOVER -${spillover} HEALTH)`,
          'vitality_damage'
        );
      }

      // Remaining non-lethal damage spills into lethal Health
      handleApplyHealthChange(token, spillover, true);
      return;
    }

    const delta = isDamage ? -numAmount : numAmount;
    const newVitality = Math.max(0, Math.min(maxVitality, currentVitality + delta));

    if (onUpdateTokenVitality) {
      onUpdateTokenVitality(token.id, newVitality, isDamage, numAmount);
    } else {
      AudioService.playCombatHit(false);
      if (token.linkedHeroId && updateCharacterVitality) {
        updateCharacterVitality(token.linkedHeroId, newVitality);
      }
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        isDamage ? `-${numAmount} VIT` : `+${numAmount} VIT`,
        isDamage ? 'vitality_damage' : 'vitality_heal'
      );
    }
  };

  const handleApplyStructureChange = (token, amount, isDamage = true) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 1);
    const struct = token.structure || { current: 60, max: 60 };
    const currentStructure = struct.current !== undefined ? struct.current : 60;
    const maxStructure = struct.max || 60;
    const delta = isDamage ? -numAmount : numAmount;
    const newStructure = Math.max(0, Math.min(maxStructure, currentStructure + delta));

    if (onUpdateTokenStructure) {
      onUpdateTokenStructure(token.id, newStructure, isDamage, numAmount);
    } else {
      AudioService.playCombatHit(numAmount >= 15);
      if (token.linkedHeroId && updateCharacterStructure) {
        updateCharacterStructure(token.linkedHeroId, newStructure);
      }
    }

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        isDamage ? `-${numAmount} STRUCT` : `+${numAmount} STRUCT`,
        isDamage ? 'structure_damage' : 'structure_heal'
      );
    }
  };

  const handleApplyConcussiveDamage = (token, amount = 10) => {
    const numAmount = Math.max(1, parseInt(amount, 10) || 10);
    if (token.structure || token.isSynthetic) {
      handleApplyStructureChange(token, numAmount, true);
      return;
    }

    // Concussive Damage rule: Split 50/50 between Vitality and Health on attempted reduction
    const vitDmg = Math.ceil(numAmount / 2);
    const heaDmg = Math.floor(numAmount / 2);

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(
        screenX,
        screenY,
        `-${numAmount} CONCUSSIVE (50/50 SPLIT)`,
        'concussive_damage'
      );
    }

    handleApplyVitalityChange(token, vitDmg, true);
    handleApplyHealthChange(token, heaDmg, true);
  };

  const handleAdvanceTurn = () => {
    // If active turn token is at Death's Door and not stabilized, advance death clock
    if (activeTurnTokenId) {
      const activeTok = tokens.find(t => t.id === activeTurnTokenId);
      if (activeTok) {
        const curH = activeTok.health?.current ?? 30;
        const curV = activeTok.vitality?.current ?? 30;
        const isDead = activeTok.isDead || (activeTok.conditions || []).includes('Dead');
        const atDeathsDoor = !isDead && ((curH <= 0 && curV <= 0) || (activeTok.conditions || []).includes("Death's Door"));
        const isStabilized = activeTok.isStabilized || (activeTok.conditions || []).includes('Stabilized');

        if (atDeathsDoor && !isStabilized) {
          const sta = Math.max(1, parseInt(activeTok.stamina || activeTok.toughness || 1, 10));
          const currentClock = activeTok.deathClock !== undefined && activeTok.deathClock !== null ? activeTok.deathClock : sta;
          const nextClock = Math.max(0, currentClock - 1);

          if (nextClock <= 0) {
            AudioService.playCombatHit(true);
            const currentConds = (activeTok.conditions || []).filter(c => c !== "Death's Door" && c !== "Comatose");
            const nextConds = currentConds.includes('Dead') ? currentConds : [...currentConds, 'Dead'];
            onUpdateToken?.(activeTok.id, {
              conditions: nextConds,
              deathClock: 0,
              isDead: true,
              isAtDeathsDoor: false
            });
            if (onTriggerFloatingText) {
              const screenX = (activeTok.x || 0) * scale + position.x;
              const screenY = (activeTok.y || 0) * scale + position.y;
              onTriggerFloatingText(screenX, screenY, `💀 DIED (DEATH CLOCK EXPIRED)`, 'damage');
            }
          } else {
            onUpdateToken?.(activeTok.id, {
              deathClock: nextClock
            });
            if (onTriggerFloatingText) {
              const screenX = (activeTok.x || 0) * scale + position.x;
              const screenY = (activeTok.y || 0) * scale + position.y;
              onTriggerFloatingText(screenX, screenY, `💀 CLOCK: ${nextClock} RNDS LEFT`, 'vitality_damage');
            }
          }
        }
      }
    }

    // Evaluate start-of-turn conditions for the incoming unit
    if (sortedTokens.length > 0) {
      const curIdx = sortedTokens.findIndex(t => t.id === activeTurnTokenId);
      const nextIdx = curIdx >= 0 ? (curIdx + 1) % sortedTokens.length : 0;
      const nextToken = sortedTokens[nextIdx];

      if (nextToken) {
        const { updatedToken, triggeredEffects } = evaluateTokenConditionsOnTurnStart(nextToken);
        if (triggeredEffects.length > 0) {
          onUpdateToken?.(nextToken.id, updatedToken);
          triggeredEffects.forEach((eff, idx) => {
            setTimeout(() => {
              const screenX = (nextToken.x || 0) * scale + position.x;
              const screenY = (nextToken.y || 0) * scale + position.y;
              onTriggerFloatingText?.(screenX, screenY, eff.message, eff.sfx === 'heal' ? 'heal' : 'damage');
            }, (idx + 1) * 200);
          });
        }
      }
    }

    onNextTurn?.();
  };

  const handleAwardHeroKarma = async (token, amount = 1, reason = 'Heroic Action') => {
    if (!token.linkedHeroId) return;
    AudioService.playTerminalBeep(960, 0.15);
    const heroId = token.linkedHeroId;
    if (awardCharacterKarma) {
      await awardCharacterKarma(heroId, amount, reason);
    }
    const curK = token.karma !== undefined ? token.karma : 3;
    onUpdateToken?.(token.id, { karma: curK + amount });

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `✨ +${amount} KARMA (${reason.toUpperCase()})`, 'karma');
    }
  };

  const handleAwardHeroAP = async (token, amount = 1, reason = 'Encounter Cleared') => {
    if (!token.linkedHeroId) return;
    AudioService.playTerminalBeep(1100, 0.18);
    const heroId = token.linkedHeroId;
    if (awardExperience) {
      await awardExperience(heroId, {
        amount,
        category: 'combat',
        reason,
        autoPayDebt: true
      });
    }
    const curAP = token.earned_ap || 0;
    onUpdateToken?.(token.id, { earned_ap: curAP + amount });

    if (onTriggerFloatingText) {
      const screenX = (token.x || 0) * scale + position.x;
      const screenY = (token.y || 0) * scale + position.y;
      onTriggerFloatingText(screenX, screenY, `🌟 +${amount} AP (${reason.toUpperCase()})`, 'experience');
    }
    setSelectedHeroForAp(null);
  };

  const handleExecuteKarmaAction = async (token, actionType) => {
    if (!token.linkedHeroId) return;
    const heroId = token.linkedHeroId;
    const curK = token.karma !== undefined ? token.karma : 3;
    const minDebt = -(Math.max(1, parseInt(token.charisma || 10, 10) + 1));
    if (curK <= minDebt) {
      alert(`Cannot spend Karma: ${token.label} has reached maximum Karmic Debt (${minDebt}).`);
      return;
    }

    AudioService.playTerminalBeep(750, 0.12);
    if (updateCharacterKarma) {
      await updateCharacterKarma(heroId, curK - 1);
    }
    onUpdateToken?.(token.id, { karma: curK - 1 });

    const screenX = (token.x || 0) * scale + position.x;
    const screenY = (token.y || 0) * scale + position.y;

    if (actionType === 'shake_off') {
      const conds = [...(token.conditions || [])];
      if (conds.length > 0) {
        const removed = conds.pop();
        onUpdateToken?.(token.id, { conditions: conds, karma: curK - 1 });
        if (onTriggerFloatingText) {
          onTriggerFloatingText(screenX, screenY, `🛡️ SHAKE IT OFF (-${removed.toUpperCase()})`, 'karma');
        }
      } else {
        if (onTriggerFloatingText) {
          onTriggerFloatingText(screenX, screenY, `🛡️ SHAKE IT OFF (NO CONDITIONS)`, 'karma');
        }
      }
    } else if (actionType === 'advantage') {
      if (onTriggerFloatingText) {
        onTriggerFloatingText(screenX, screenY, `🎲 ADVANTAGE ("I GOT THIS")`, 'karma');
      }
    } else if (actionType === 'reroll') {
      if (onTriggerFloatingText) {
        onTriggerFloatingText(screenX, screenY, `↺ REROLL ("NOT WHAT I MEANT")`, 'karma');
      }
    } else if (actionType === 'second_wind') {
      if (onTriggerFloatingText) {
        onTriggerFloatingText(screenX, screenY, `💨 SECOND WIND (POWERS REFRESHED)`, 'karma');
      }
    }
    setActiveKarmaActionTokenId(null);
  };

  const handleAwardPartyKarma = async (amount = 1, reason = 'Party Triumph') => {
    const heroTokens = sortedTokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead);
    if (heroTokens.length === 0) {
      alert('No active linked hero tokens on the map to award.');
      return;
    }
    AudioService.playTerminalBeep(960, 0.2);
    const heroIds = heroTokens.map(t => t.linkedHeroId);
    if (awardPartyKarma) {
      await awardPartyKarma(heroIds, amount, reason);
    }
    heroTokens.forEach((tok, idx) => {
      const curK = tok.karma !== undefined ? tok.karma : 3;
      onUpdateToken?.(tok.id, { karma: curK + amount });
      if (onTriggerFloatingText) {
        setTimeout(() => {
          const screenX = (tok.x || 0) * scale + position.x;
          const screenY = (tok.y || 0) * scale + position.y;
          onTriggerFloatingText(screenX, screenY, `✨ +${amount} KARMA (${reason.toUpperCase()})`, 'karma');
        }, idx * 100);
      }
    });
    setShowPartyAwardsModal(false);
  };

  const handleAwardPartyAP = async (amount = 1, reason = 'Encounter Victory') => {
    const heroTokens = sortedTokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead);
    if (heroTokens.length === 0) {
      alert('No active linked hero tokens on the map to award.');
      return;
    }
    AudioService.playTerminalBeep(1200, 0.25);
    const heroIds = heroTokens.map(t => t.linkedHeroId);
    if (awardPartyExperience) {
      await awardPartyExperience(heroIds, {
        amount,
        category: 'combat',
        reason,
        autoPayDebt: true
      });
    }
    heroTokens.forEach((tok, idx) => {
      const curAP = tok.earned_ap || 0;
      onUpdateToken?.(tok.id, { earned_ap: curAP + amount });
      if (onTriggerFloatingText) {
        setTimeout(() => {
          const screenX = (tok.x || 0) * scale + position.x;
          const screenY = (tok.y || 0) * scale + position.y;
          onTriggerFloatingText(screenX, screenY, `🌟 +${amount} AP (${reason.toUpperCase()})`, 'experience');
        }, idx * 120);
      }
    });
    setShowPartyAwardsModal(false);
  };

  const handleResetPartyKarma = async () => {
    const heroTokens = sortedTokens.filter(t => Boolean(t.linkedHeroId));
    if (heroTokens.length === 0) return;
    AudioService.playTerminalBeep(880, 0.15);
    for (const tok of heroTokens) {
      if (resetCharacterKarma) {
        await resetCharacterKarma(tok.linkedHeroId);
      }
      const maxK = tok.maxKarma || 3;
      onUpdateToken?.(tok.id, { karma: maxK });
      if (onTriggerFloatingText) {
        const screenX = (tok.x || 0) * scale + position.x;
        const screenY = (tok.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `↻ KARMA RESTORED (${maxK})`, 'karma');
      }
    }
    setShowPartyAwardsModal(false);
  };

  const handleApplyDamageFromResolver = (targetTokenId, payload = {}) => {
    const target = sortedTokens.find(t => t.id === targetTokenId);
    if (!target) return;

    if (payload.structureDamage > 0) {
      handleApplyStructureChange(target, payload.structureDamage, true);
    } else {
      if (payload.vitalityDamage > 0) {
        handleApplyVitalityChange(target, payload.vitalityDamage, true);
      }
      if (payload.healthDamage > 0) {
        handleApplyHealthChange(target, payload.healthDamage, true);
      }
    }
  };

  const handleAutoExecuteNpcTurn = (attackerToken) => {
    const unitToAct = attackerToken || activeTurnToken || sortedTokens.find(t => !t.linkedHeroId && !t.isDead);
    if (!unitToAct) return;

    const heroCandidates = sortedTokens.filter(t => Boolean(t.linkedHeroId) && !t.isDead);
    if (heroCandidates.length === 0) {
      alert('No active player hero tokens detected on the battlemap to target.');
      return;
    }

    const actionPlan = decideAutonomousAction(unitToAct, heroCandidates, { allies: sortedTokens.filter(t => !t.linkedHeroId) });

    if (actionPlan.status === 'morale_broken') {
      AudioService.playTerminalBeep(550, 0.1);
      if (onTriggerFloatingText) {
        const screenX = (unitToAct.x || 0) * scale + position.x;
        const screenY = (unitToAct.y || 0) * scale + position.y;
        onTriggerFloatingText(screenX, screenY, `🏳️ MORALE BROKEN (RETREATING)`, 'miss');
      }
      return;
    }

    const target = heroCandidates.find(h => h.id === actionPlan.targetId) || heroCandidates[0];
    const outcome = resolveAutonomousAttack(unitToAct, target, actionPlan);

    // Show floating combat text over attacker
    if (onTriggerFloatingText) {
      const atkX = (unitToAct.x || 0) * scale + position.x;
      const atkY = (unitToAct.y || 0) * scale + position.y;
      onTriggerFloatingText(atkX, atkY, `🤖 AUTO: ${actionPlan.actionType.toUpperCase().replace(/_/g, ' ')}`, 'combat');

      // Show floating text over target
      const tgtX = (target.x || 0) * scale + position.x;
      const tgtY = (target.y || 0) * scale + position.y;
      setTimeout(() => {
        onTriggerFloatingText(tgtX, tgtY, outcome.isHit ? `💥 -${outcome.effectiveDamage} HP (${outcome.location.toUpperCase()})` : `💨 MISSED (${outcome.totalAttack} vs DC ${outcome.defenseDc})`, outcome.isHit ? 'damage' : 'miss');
      }, 300);
    }

    // Apply damage to target
    if (outcome.isHit && outcome.effectiveDamage > 0) {
      handleApplyHealthChange(target, outcome.effectiveDamage, true);
    }
  };

  return (
    <DraggablePanel
      id="combat_tracker"
      className="absolute bottom-4 left-4 z-30 w-84 bg-[#161b22]/95 backdrop-blur-md border border-amber-500/60 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] p-3 flex flex-col gap-2 font-sans select-none"
    >
      {/* Header */}
      <div className="drag-handle cursor-grab active:cursor-grabbing flex justify-between items-center pb-1.5 border-b border-amber-500/40">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⚔️</span>
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300">
            Tactical Combat Tracker
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setResolverAttackerId(activeTurnTokenId || (sortedTokens[0]?.id ?? null));
              setShowCombatResolver(true);
            }}
            disabled={sortedTokens.length === 0}
            className="px-2 py-0.5 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/60 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Open Strike & Tactical Combat Resolution Pipeline"
          >
            <span>⚔️</span> Strike
          </button>
          <button
            type="button"
            onClick={() => setShowAoEModal(true)}
            disabled={sortedTokens.length === 0}
            className="px-2 py-0.5 bg-orange-950/90 hover:bg-orange-900 text-orange-300 border border-orange-500/60 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Open Multi-Target AoE & Environmental Hazard Engine"
          >
            <span>💥</span> AoE
          </button>
          <button
            type="button"
            onClick={() => setShowStarshipBridge(true)}
            className="px-2 py-0.5 bg-purple-950/90 hover:bg-purple-900 text-purple-300 border border-purple-500/50 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer"
            title="Open Starship & Vehicle Subsystem Bridge"
          >
            <span>🚀</span> Bridge
          </button>
          <button
            type="button"
            onClick={() => setShowModularStarshipForge(true)}
            className="px-2 py-0.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer"
            title="Open Modular Starship & Mecha Hardpoint Forge"
          >
            <span>🛠️</span> Forge
          </button>
          <button
            type="button"
            onClick={() => setShowPartyAwardsModal(true)}
            className="px-2 py-0.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer"
            title="Open GM Party Awards (Karma & Experience)"
          >
            <span>🎁</span> Awards
          </button>
          <button
            type="button"
            onClick={() => setShowRecapModal(true)}
            className="px-2 py-0.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 font-bold text-[10px] rounded uppercase transition-colors flex items-center gap-1 cursor-pointer"
            title="Open Mission Debrief & Episodic Recap Synthesizer"
          >
            <span>📜</span> Recap
          </button>
          <button
            type="button"
            onClick={() => handleAutoExecuteNpcTurn()}
            disabled={sortedTokens.length === 0}
            className="px-2 py-0.5 bg-cyan-900/90 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/60 font-bold text-[10px] rounded uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer flex items-center gap-1"
            title="Execute Autonomous AI Turn for Active NPC / Adversary"
          >
            <span>🤖</span> Auto-Act
          </button>
          <button
            onClick={handleAdvanceTurn}
            disabled={sortedTokens.length === 0}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded uppercase transition-colors disabled:opacity-50 cursor-pointer"
            title="Advance to Next Unit Turn"
          >
            Next ⏭️
          </button>
          <button
            onClick={() => setShowTracker(false)}
            className="text-slate-400 hover:text-red-400 text-sm font-bold leading-none px-1"
            title="Close Combat Tracker"
          >
            ×
          </button>
        </div>
      </div>

      {/* 4-Pillar Rules, Co-GM & Content Forge Quick Ribbon */}
      <div className="flex items-center justify-between gap-1 pt-0.5 pb-1 border-b border-slate-800/80 text-[8.5px] font-mono">
        <button
          type="button"
          onClick={() => setShowRulebookModal(true)}
          className="flex-1 py-0.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Semantic Rulebook Assistant (/askrule across 44 books)"
        >
          <span>📖</span> /askrule
        </button>
        <button
          type="button"
          onClick={() => setShowPerceptionRadar(true)}
          className="flex-1 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Passive Perception & Secret GM Radar"
        >
          <span>👁️</span> Radar
        </button>
        <button
          type="button"
          onClick={() => setShowProgressionLedger(true)}
          className="flex-1 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Party AP Progression & Karma Master Ledger"
        >
          <span>🌟</span> AP
        </button>
        <button
          type="button"
          onClick={() => setShowFacilityGen(true)}
          className="flex-1 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open 1-Click UDU Facility & Dungeon Generator"
        >
          <span>🏗️</span> UDU
        </button>
        <button
          type="button"
          onClick={() => setShowLootGen(true)}
          className="flex-1 py-0.5 bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Economatrix TSC Loot & Salvage Generator"
        >
          <span>💰</span> Loot
        </button>
        <button
          type="button"
          onClick={() => {
            const tok = sortedTokens.find(t => t.id === activeTurnTokenId) || sortedTokens[0];
            if (tok) setSelectedTokenForConditions(tok);
            setShowConditionModal(true);
          }}
          className="flex-1 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Condition & Affliction State Machine"
        >
          <span>✨</span> Conds
        </button>
        <button
          type="button"
          onClick={() => {
            const tok = sortedTokens.find(t => t.id === activeTurnTokenId) || sortedTokens[0];
            if (tok) {
              setReactionReactorToken(tok);
              setReactionEventDesc('Manual GM / Player Reactive Interrupt Action declaration.');
              setShowReactionModal(true);
            }
          }}
          className="flex-1 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Declare / Adjudicate Combat Reaction Interrupt"
        >
          <span>⚡</span> React
        </button>
        <button
          type="button"
          onClick={() => setShowAoEModal(true)}
          className="flex-1 py-0.5 bg-orange-950/80 hover:bg-orange-900 text-orange-300 border border-orange-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Multi-Target AoE & Environmental Hazard Engine"
        >
          <span>💥</span> AoE
        </button>
        <button
          type="button"
          onClick={() => setShowHazmatModal(true)}
          className="flex-1 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Dynamic Hazmat & Environmental Volume Manager"
        >
          <span>☢️</span> Hazmat
        </button>
        <button
          type="button"
          onClick={() => {
            const npc = sortedTokens.find(t => t.isEnemy || t.type === 'adversary' || t.type === 'enemy' || !t.linkedHeroId) || sortedTokens[0];
            if (npc) setSelectedNpcForSocial(npc);
            setShowSocialModal(true);
          }}
          className="flex-1 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Scene Director & Social Disposition Matrix"
        >
          <span>🎭</span> Social
        </button>
        <button
          type="button"
          onClick={() => setShowObjectivesModal(true)}
          className="flex-1 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Scenario Objectives & Mission Waves Console"
        >
          <span>🎯</span> Goals
        </button>
        <button
          type="button"
          onClick={() => setShowWhisperDrawer(true)}
          className="flex-1 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open BASTION Proactive Pacing & Tactical Whisper AI"
        >
          <span>🧠</span> Whisper
        </button>
        <button
          type="button"
          onClick={() => setShowEncounterSimModal(true)}
          className="flex-1 py-0.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Predictive Monte Carlo Encounter Balancer"
        >
          <span>🎲</span> Sim
        </button>
        <button
          type="button"
          onClick={() => setShowSkillChallengeModal(true)}
          className="flex-1 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Complex Skill Challenge & Heist Progress Clock Console"
        >
          <span>⏱️</span> Heist
        </button>
        <button
          type="button"
          onClick={() => setShowCyberDeckModal(true)}
          className="flex-1 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Cyber-Deck Intrusion & Encrypted Data-Slate Terminal"
        >
          <span>💻</span> Cyber
        </button>
        <button
          type="button"
          onClick={() => setShowRulesAdjudicator(true)}
          className="flex-1 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Tactical Trait, Range & Cover Modifiers Adjudicator"
        >
          <span>⚖️</span> Rules
        </button>
        <button
          type="button"
          onClick={() => setShowGalaxyStarmapModal(true)}
          className="flex-1 py-0.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Interactive Galaxy Sector & Planetary Starmap"
        >
          <span>🌌</span> Map
        </button>
        <button
          type="button"
          onClick={() => setShowFactionWebModal(true)}
          className="flex-1 py-0.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 rounded flex items-center justify-center gap-0.5 font-bold cursor-pointer transition-colors"
          title="Open Faction Relational Web & Party Heat Console"
        >
          <span>🌐</span> Factions
        </button>
      </div>

      {/* Pair GM: Real-Time Encounter Tension & Complication Director */}
      <EncounterTensionWidget
        tokens={sortedTokens}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Token / Combatant List */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
        {sortedTokens.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-slate-500 font-mono">
            No units placed on map. Drop tokens onto canvas to track initiative and damage.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const isActive = token.id === activeTurnTokenId;
            const health = token.health || token.hp;
            const vitality = token.vitality;
            const structure = token.structure;
            const isSynthetic = token.isSynthetic || Boolean(structure);

            const healthRatio = health && health.max > 0 ? Math.max(0, Math.min(1, health.current / health.max)) : 1;
            const vitalityRatio = vitality && vitality.max > 0 ? Math.max(0, Math.min(1, vitality.current / vitality.max)) : 1;
            const structureRatio = structure && structure.max > 0 ? Math.max(0, Math.min(1, structure.current / structure.max)) : 1;

            const healthColor = healthRatio > 0.5 ? 'bg-emerald-500' : healthRatio > 0.2 ? 'bg-yellow-500' : 'bg-red-500';
            const vitalityColor = vitalityRatio > 0.5 ? 'bg-cyan-500' : vitalityRatio > 0.2 ? 'bg-indigo-500' : 'bg-purple-600';
            const structureColor = structureRatio > 0.5 ? 'bg-amber-500' : structureRatio > 0.2 ? 'bg-orange-500' : 'bg-red-600';

            const isDead = token.isDead || (token.conditions || []).includes('Dead');
            const atDeathsDoor = !isDead && (((health?.current ?? 30) <= 0 && (vitality?.current ?? 30) <= 0) || (token.conditions || []).includes("Death's Door"));
            const isIncapacitatedOnly = !isDead && !atDeathsDoor && (health?.current ?? 30) <= 0;
            const isStabilized = token.isStabilized || (token.conditions || []).includes('Stabilized');

            const linkedHero = Boolean(token.linkedHeroId)
              ? ((personaRoster || []).find(c => (c['character-doc-id'] || c.id) === token.linkedHeroId) ||
                ((characterData['character-doc-id'] || characterData.id) === token.linkedHeroId ? characterData : null))
              : null;
            const heroKarma = linkedHero?.karma !== undefined ? parseInt(linkedHero.karma, 10) : (token.karma !== undefined ? parseInt(token.karma, 10) : 3);
            const heroMaxKarma = linkedHero?.maxKarma !== undefined ? parseInt(linkedHero.maxKarma, 10) : (token.maxKarma !== undefined ? parseInt(token.maxKarma, 10) : 3);
            const heroAP = linkedHero?.earned_ap !== undefined ? parseInt(linkedHero.earned_ap, 10) : (token.earned_ap !== undefined ? parseInt(token.earned_ap, 10) : 0);
            const isKarmaDebt = heroKarma < 0;

            return (
              <div
                key={token.id}
                onClick={() => {
                  setActiveTurnTokenId(token.id);
                  if (onSelectToken) onSelectToken(token.id);
                }}
                className={`p-2 rounded-lg border flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1c2433] border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : isDead
                    ? 'bg-slate-950/80 border-red-950/60 opacity-60'
                    : atDeathsDoor
                    ? 'bg-rose-950/40 border-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Row 1: Initiative, Name, Conditions */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-6 text-center font-mono text-[10px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-bold shrink-0 border border-amber-500/30">
                      {token.initiative !== undefined && token.initiative !== null ? `#${token.initiative}` : '--'}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {token.avatarUrl ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400 shrink-0">
                          <img src={token.avatarUrl} alt={token.label} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: token.color || '#eab308' }}
                        />
                      )}
                      <span className="text-xs truncate font-bold text-slate-200">
                        {token.label || 'Unit'}
                      </span>
                    </div>
                  </div>

                  {/* Conditions & Defense Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isDead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResolverAttackerId(token.id);
                          setShowCombatResolver(true);
                        }}
                        className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-800 text-amber-300 border border-amber-500/60 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-0.5"
                        title={`Initiate Strike / Attack with ${token.label}`}
                      >
                        <span>⚔️</span> Atk
                      </button>
                    )}
                    {!isDead && !token.linkedHeroId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAutoExecuteNpcTurn(token);
                        }}
                        className="px-1.5 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-500/60 rounded text-[8px] font-bold uppercase transition-all shadow-sm cursor-pointer flex items-center gap-0.5"
                        title={`Execute Autonomous AI Behavior for ${token.label}`}
                      >
                        <span>🤖</span> Act
                      </button>
                    )}
                    {token.toughness !== undefined && (
                      <span className="text-[9px] font-mono px-1 bg-emerald-950/80 border border-emerald-700/60 rounded text-emerald-300 font-bold" title="Toughness: Point-for-point wound reduction">
                        🛡️+{token.toughness}
                      </span>
                    )}
                    {token.defense && (
                      <span className="text-[9px] font-mono px-1 bg-slate-900 border border-slate-700 rounded text-slate-400" title="Armor Defense">
                        DEF:{token.defense}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTokenForConditions(token);
                        setShowConditionModal(true);
                      }}
                      className="px-1.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[8px] font-bold font-mono transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Inspect / Manage Conditions & Afflictions"
                    >
                      <span>✨</span> {(token.conditions || []).length > 0 ? `${token.conditions.length}` : 'Cond'}
                    </button>
                    {!isDead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReactionReactorToken(token);
                          setReactionEventDesc(`Manual Reaction declaration for ${token.label || 'Unit'}.`);
                          setShowReactionModal(true);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-colors flex items-center gap-0.5 cursor-pointer border ${
                          token.actions?.reaction === false
                            ? 'bg-rose-950/50 border-rose-900/60 text-rose-400 opacity-60'
                            : 'bg-amber-950/80 hover:bg-amber-800 text-amber-300 border-amber-700/60'
                        }`}
                        title={token.actions?.reaction === false ? 'Reaction already spent this round' : 'Declare / Execute Reaction (Shield, Opportunity Strike, Parry)'}
                      >
                        <span>⚡</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Fate & XP Bar for Linked Heroes */}
                {Boolean(token.linkedHeroId) && !isDead && (
                  <div className="flex flex-col gap-1 pt-1 pb-0.5 border-t border-slate-800/80">
                    <div className="flex items-center justify-between gap-1 text-[9px] font-mono">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-bold flex items-center gap-0.5 ${isKarmaDebt ? 'text-rose-400' : 'text-cyan-300'}`}
                          title={isKarmaDebt ? "In Karmic Debt!" : "Karma Pool"}
                        >
                          <span>💠</span> {heroKarma}/{heroMaxKarma}
                          {isKarmaDebt && <span className="text-[7.5px] px-1 bg-rose-950 text-rose-300 rounded font-sans uppercase">Debt</span>}
                        </span>
                        <span className="text-emerald-400 font-bold" title="Earned Award Points">
                          🎖️ +{heroAP} AP
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAwardHeroKarma(token, 1, 'Heroic Action');
                          }}
                          className="px-1.5 py-0.5 bg-amber-950/90 hover:bg-amber-800 text-amber-300 border border-amber-600/60 rounded text-[7.5px] font-bold font-mono transition-colors cursor-pointer"
                          title="GM Award: +1 Karma (Heroic Action)"
                        >
                          ✨ +1 Karma
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHeroForAp(token);
                          }}
                          className="px-1.5 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/60 rounded text-[7.5px] font-bold font-mono transition-colors cursor-pointer"
                          title="GM Award: Award Experience / AP"
                        >
                          🌟 Award AP
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveKarmaActionTokenId(activeKarmaActionTokenId === token.id ? null : token.id);
                          }}
                          className="px-1.5 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-600/60 rounded text-[7.5px] font-bold font-mono transition-colors cursor-pointer"
                          title="Spend 1 Karma on a tactical action (Advantage, Shake it Off, Second Wind)"
                        >
                          ⚡ Action
                        </button>
                      </div>
                    </div>

                    {/* Expanded Karma Action Selector */}
                    {activeKarmaActionTokenId === token.id && (
                      <div className="bg-slate-950 border border-cyan-700/60 rounded p-1.5 space-y-1 text-[8px] font-sans animate-fadeIn">
                        <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[7px]">
                          <span>Spend 1 Karma: Tactical Action</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveKarmaActionTokenId(null); }}
                            className="text-slate-500 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteKarmaAction(token, 'advantage');
                            }}
                            className="p-1 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-200 border border-slate-800 text-left font-bold transition-colors cursor-pointer"
                            title="Gain Advantage on next roll"
                          >
                            🎲 "I Got This" (Advantage)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteKarmaAction(token, 'reroll');
                            }}
                            className="p-1 rounded bg-slate-900 hover:bg-amber-950 text-amber-200 border border-slate-800 text-left font-bold transition-colors cursor-pointer"
                            title="Reroll check (take 2nd result)"
                          >
                            ↺ "Not What I Meant" (Reroll)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteKarmaAction(token, 'shake_off');
                            }}
                            className="p-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-200 border border-slate-800 text-left font-bold transition-colors cursor-pointer"
                            title="Reduce active condition severity by 1 stage"
                          >
                            🛡️ "Shake it Off" (-1 Cond)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteKarmaAction(token, 'second_wind');
                            }}
                            className="p-1 rounded bg-slate-900 hover:bg-blue-950 text-blue-200 border border-slate-800 text-left font-bold transition-colors cursor-pointer"
                            title="Bypass Light Rest, restore spent powers"
                          >
                            💨 "Second Wind" (Powers)
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowKarmaRulesModal(true);
                            }}
                            className="col-span-2 py-0.5 text-[8px] font-mono text-cyan-400 hover:text-cyan-200 underline text-center cursor-pointer"
                          >
                            📖 View All 6 Karma Actions, Timing &amp; Rules
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Gauges and controls if not dead */}
                {!isDead && (
                  <>
                    {/* Structure Gauge & Controls for Synthetics / Objects */}
                    {isSynthetic && structure && structure.max > 0 ? (
                      <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-800/80">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <span className="text-[8px] font-mono font-bold text-amber-400 uppercase w-7">SP:</span>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                            <div className={`h-full ${structureColor} transition-all duration-300`} style={{ width: `${structureRatio * 100}%` }} />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-amber-300 shrink-0">
                            {structure.current}/{structure.max}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyStructureChange(token, 5, true);
                            }}
                            className="px-1 py-0.5 bg-amber-950/90 hover:bg-amber-800 text-amber-300 border border-amber-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                            title="Deal 5 Structure Damage"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyStructureChange(token, 1, true);
                            }}
                            className="px-1 py-0.5 bg-amber-950/90 hover:bg-amber-800 text-amber-300 border border-amber-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                            title="Deal 1 Structure Damage"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyStructureChange(token, 1, false);
                            }}
                            className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                            title="Repair 1 Structure"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyStructureChange(token, 5, false);
                            }}
                            className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                            title="Repair 5 Structure"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Health Gauge & Controls (Lethal Life Force) */}
                        {health && health.max > 0 && (
                          <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-slate-800/80">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase w-7">HLTH:</span>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                <div className={`h-full ${healthColor} transition-all duration-300`} style={{ width: `${healthRatio * 100}%` }} />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">
                                {health.current}/{health.max}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyHealthChange(token, 5, true);
                                }}
                                className="px-1 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Deal 5 Lethal Health Damage"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyHealthChange(token, 1, true);
                                }}
                                className="px-1 py-0.5 bg-red-950/90 hover:bg-red-800 text-red-300 border border-red-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Deal 1 Lethal Health Damage"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyHealthChange(token, 1, false);
                                }}
                                className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Heal 1 Health"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyHealthChange(token, 5, false);
                                }}
                                className="px-1 py-0.5 bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Heal 5 Health"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Vitality Gauge & Controls (Non-Lethal Buffer) */}
                        {vitality && vitality.max > 0 && (
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase w-7">VIT:</span>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                <div className={`h-full ${vitalityColor} transition-all duration-300`} style={{ width: `${vitalityRatio * 100}%` }} />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-cyan-300 shrink-0">
                                {vitality.current}/{vitality.max}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyVitalityChange(token, 5, true);
                                }}
                                className="px-1 py-0.5 bg-purple-950/90 hover:bg-purple-800 text-purple-300 border border-purple-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Drain 5 Vitality (Excess spills into Health)"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyVitalityChange(token, 1, true);
                                }}
                                className="px-1 py-0.5 bg-purple-950/90 hover:bg-purple-800 text-purple-300 border border-purple-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Drain 1 Vitality (Excess spills into Health)"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyVitalityChange(token, 1, false);
                                }}
                                className="px-1 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Restore 1 Vitality"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyVitalityChange(token, 5, false);
                                }}
                                className="px-1 py-0.5 bg-cyan-950/90 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[8px] font-bold font-mono transition-colors"
                                title="Restore 5 Vitality"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Concussive Damage Quick Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-[8px] font-mono text-slate-400">Concussive (50/50):</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyConcussiveDamage(token, 4);
                              }}
                              className="px-1.5 py-0.5 bg-orange-950/90 hover:bg-orange-900 text-orange-300 border border-orange-700/50 rounded text-[7.5px] font-mono font-bold transition-colors"
                              title="4 Concussive Damage (splits 2 Vitality / 2 Health)"
                            >
                              💥 -4
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyConcussiveDamage(token, 10);
                              }}
                              className="px-1.5 py-0.5 bg-orange-950/90 hover:bg-orange-900 text-orange-300 border border-orange-700/50 rounded text-[7.5px] font-mono font-bold transition-colors"
                              title="10 Concussive Damage (splits 5 Vitality / 5 Health)"
                            >
                              💥 -10
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Death & Dying / Mortality State Indicator */}
                    {isDead && (
                      <div className="flex items-center justify-between p-1 rounded bg-slate-950/90 border border-red-900/60 text-[8px] font-mono text-slate-300">
                        <span className="flex items-center gap-1 font-bold text-red-400">
                          <span>⚰️</span> DEAD (Permanently Deceased)
                        </span>
                      </div>
                    )}

                    {atDeathsDoor && (
                      <div className="flex items-center justify-between p-1 rounded bg-rose-950/90 border border-rose-600/80 text-[8px] font-mono text-rose-200">
                        <div className="flex items-center gap-1 font-bold">
                          <span className="animate-pulse">💀</span>
                          <span>DEATH'S DOOR:</span>
                          {isStabilized ? (
                            <span className="text-emerald-300 font-black">STABILIZED</span>
                          ) : (
                            <span className="text-amber-300 font-black">
                              {token.deathClock !== undefined && token.deathClock !== null ? token.deathClock : Math.max(1, parseInt(token.stamina || token.toughness || 1, 10))} Rnds Left
                            </span>
                          )}
                        </div>

                        {!isStabilized && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStabilizeToken(token);
                            }}
                            className="px-1.5 py-0.5 bg-emerald-900 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/80 rounded text-[7.5px] font-bold uppercase transition-colors"
                            title="Stabilize with Medicine (DC 15) or Healing Magic/Tech"
                          >
                            🩹 Stabilize
                          </button>
                        )}
                      </div>
                    )}

                    {isIncapacitatedOnly && (
                      <div className="flex items-center justify-between p-1 rounded bg-amber-950/70 border border-amber-600/60 text-[8px] font-mono text-amber-200">
                        <span className="flex items-center gap-1 font-bold">
                          <span>🛌</span> INCAPACITATED (Unconscious / Prone)
                        </span>
                      </div>
                    )}

                    {/* Active Turn Unit: Action Economy, Ammo & Essence Deck */}
                    {isActive && (
                      <div className="pt-1 border-t border-slate-800/80">
                        <MapActionEconomyDrawer
                          token={token}
                          onUpdateToken={onUpdateToken}
                          onTriggerFloatingText={onTriggerFloatingText}
                          scale={scale}
                          position={position}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Individual AP Award Popover Modal */}
      {selectedHeroForAp && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-16 pb-12 overflow-y-auto select-none font-sans">
          <div className="bg-[#121824] border border-emerald-500/80 rounded-xl max-w-sm w-full p-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-slate-100 space-y-3 font-sans">
            <div className="flex justify-between items-center border-b border-emerald-900/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>🌟</span> Award Experience / AP: {selectedHeroForAp.label}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedHeroForAp(null)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Select Award Preset:</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAwardHeroAP(selectedHeroForAp, 1, 'Encounter Cleared')}
                  className="p-2 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-200 border border-slate-800 hover:border-emerald-500/60 text-left text-xs font-bold flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>⚔️ Combat Encounter Cleared</span>
                  <span className="font-mono text-emerald-400">+1 AP</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardHeroAP(selectedHeroForAp, 2, 'Tactical Objective Completed')}
                  className="p-2 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-200 border border-slate-800 hover:border-emerald-500/60 text-left text-xs font-bold flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>🎯 Tactical Objective Completed</span>
                  <span className="font-mono text-emerald-400">+2 AP</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAwardHeroAP(selectedHeroForAp, 3, 'Arc Boss Defeated')}
                  className="p-2 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-200 border border-slate-800 hover:border-emerald-500/60 text-left text-xs font-bold flex justify-between items-center transition-colors cursor-pointer"
                >
                  <span>👑 Arc Boss Defeated / Milestone</span>
                  <span className="font-mono text-emerald-400">+3 AP</span>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowExperienceRulesModal(true)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span>📖</span> View Increment Rule &amp; AP Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GM Party Awards Modal */}
      {showPartyAwardsModal && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 pt-16 pb-12 overflow-y-auto select-none font-sans">
          <div className="bg-[#121824] border border-cyan-500/80 rounded-xl max-w-md w-full p-4 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-slate-100 space-y-3 font-sans">
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span>🎁</span> GM Party Awards (All Active Map Heroes)
              </h4>
              <button
                type="button"
                onClick={() => setShowPartyAwardsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <span>✨</span> Party Karma Awards
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Affects all linked heroes</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAwardPartyKarma(1, 'Party Triumph')}
                    className="flex-1 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/60 font-bold text-xs transition-colors cursor-pointer"
                  >
                    +1 Karma to All
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPartyKarma}
                    className="flex-1 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-600/60 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ↻ Session Reset All
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <span>🌟</span> Party Experience Awards
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">1 AP = 1 Character Point</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAwardPartyAP(1, 'Combat Victory')}
                    className="py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 font-bold text-xs transition-colors text-center cursor-pointer"
                  >
                    +1 AP (Combat)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAwardPartyAP(2, 'Mission Objective')}
                    className="py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 font-bold text-xs transition-colors text-center cursor-pointer"
                  >
                    +2 AP (Objective)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAwardPartyAP(3, 'Campaign Milestone')}
                    className="py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 font-bold text-xs transition-colors text-center cursor-pointer"
                  >
                    +3 AP (Milestone)
                  </button>
                </div>
              </div>

              {/* Canonical Rules Codex Triggers */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowKarmaRulesModal(true)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-500/60 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>📖</span> Karma Rules Guide
                </button>
                <button
                  type="button"
                  onClick={() => setShowExperienceRulesModal(true)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-300 border border-slate-700 hover:border-emerald-500/60 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>📖</span> XP &amp; AP Rules Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VTT Canonical Karma Rules Modal */}
      <KarmaCodexModal
        isOpen={showKarmaRulesModal}
        onClose={() => setShowKarmaRulesModal(false)}
        charismaScore={10}
        currentKarma={3}
        maxKarma={3}
        plotPoints={0}
      />

      {/* VTT Canonical Experience & Progression Rules Modal */}
      <ExperienceCodexModal
        isOpen={showExperienceRulesModal}
        onClose={() => setShowExperienceRulesModal(false)}
        earnedAP={0}
        availableAP={0}
        experienceDebt={0}
      />

      {/* VTT Pure Combat Resolution Pipeline Modal */}
      <CombatResolutionModal
        isOpen={showCombatResolver}
        onClose={() => setShowCombatResolver(false)}
        tokens={sortedTokens}
        activeTokenId={resolverAttackerId || activeTurnTokenId}
        personaRoster={personaRoster}
        characterData={characterData}
        onApplyDamage={handleApplyDamageFromResolver}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Starship & Vehicle Subsystem Bridge Modal */}
      <StarshipBridgeModal
        isOpen={showStarshipBridge}
        onClose={() => setShowStarshipBridge(false)}
        tokens={sortedTokens}
        activeTokenId={activeTurnTokenId}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Session Event Recap & Debrief Modal */}
      <SessionRecapModal
        isOpen={showRecapModal}
        onClose={() => setShowRecapModal(false)}
        campaignName="Active Operation"
      />

      {/* Semantic Rulebook Assistant (/askrule) Modal */}
      <RulebookAssistantModal
        isOpen={showRulebookModal}
        onClose={() => setShowRulebookModal(false)}
      />

      {/* Passive Perception & Secret GM Radar Modal */}
      <PassivePerceptionRadarModal
        isOpen={showPerceptionRadar}
        onClose={() => setShowPerceptionRadar(false)}
        tokens={sortedTokens}
        onTriggerFloatingText={onTriggerFloatingText}
      />

      {/* Party Progression & Karma Master Ledger Modal */}
      <ProgressionKarmaLedgerModal
        isOpen={showProgressionLedger}
        onClose={() => setShowProgressionLedger(false)}
      />

      {/* 1-Click UDU Facility & Floorplan Generator Modal */}
      <UduFacilityGeneratorModal
        isOpen={showFacilityGen}
        onClose={() => setShowFacilityGen(false)}
      />

      {/* Economatrix TSC Loot & Salvage Generator Modal */}
      <EconomatrixLootGeneratorModal
        isOpen={showLootGen}
        onClose={() => setShowLootGen(false)}
      />

      {/* Living World Faction Clocks & Agendas Modal */}
      <FactionClocksModal
        isOpen={showFactionClocks}
        onClose={() => setShowFactionClocks(false)}
      />

      {/* Condition & Affliction State Machine Modal */}
      <ConditionManagerModal
        isOpen={showConditionModal}
        onClose={() => {
          setShowConditionModal(false);
          setSelectedTokenForConditions(null);
        }}
        selectedToken={selectedTokenForConditions || sortedTokens.find(t => t.id === activeTurnTokenId) || sortedTokens[0]}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
      />

      {/* Reaction & Interrupt Adjudicator Modal */}
      <ReactionPromptModal
        isOpen={showReactionModal}
        onClose={() => {
          setShowReactionModal(false);
          setReactionReactorToken(null);
          setReactionTargetToken(null);
          setReactionEventDesc('');
        }}
        reactorToken={reactionReactorToken}
        targetToken={reactionTargetToken}
        eventDescription={reactionEventDesc}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
        onInitiateCombatStrike={(attackerId, targetId) => {
          setResolverAttackerId(attackerId);
          setShowCombatResolver(true);
        }}
      />

      {/* Multi-Target AoE & Environmental Hazard Engine Modal */}
      <AoEResolutionModal
        isOpen={showAoEModal}
        onClose={() => setShowAoEModal(false)}
        tokens={sortedTokens}
        activeTokenId={activeTurnTokenId}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Dynamic Scene Director & Social Disposition Modal */}
      <SocialDispositionModal
        isOpen={showSocialModal}
        onClose={() => {
          setShowSocialModal(false);
          setSelectedNpcForSocial(null);
        }}
        npcTokens={sortedTokens.filter(t => t.isEnemy || t.type === 'adversary' || t.type === 'enemy' || !t.linkedHeroId)}
        heroTokens={sortedTokens.filter(t => Boolean(t.linkedHeroId))}
        selectedNpcToken={selectedNpcForSocial || sortedTokens.find(t => t.isEnemy || t.type === 'adversary') || sortedTokens[0]}
        onUpdateToken={onUpdateToken}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* BASTION Proactive Pacing & Tactical Whisper AI Drawer */}
      <BastionWhisperDrawer
        isOpen={showWhisperDrawer}
        onClose={() => setShowWhisperDrawer(false)}
        tokens={sortedTokens}
        roundNumber={1}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Predictive Monte Carlo Encounter Balancer Modal */}
      <EncounterSimModal
        isOpen={showEncounterSimModal}
        onClose={() => setShowEncounterSimModal(false)}
        tokens={sortedTokens}
      />

      {/* Complex Skill Challenge & Heist Progress Clock Modal */}
      <SkillChallengeModal
        isOpen={showSkillChallengeModal}
        onClose={() => setShowSkillChallengeModal(false)}
        heroTokens={sortedTokens.filter(t => Boolean(t.linkedHeroId))}
        onTriggerFloatingText={onTriggerFloatingText}
      />

      {/* Cyber-Deck Intrusion & Encrypted Data-Slate Modal */}
      <CyberDeckModal
        isOpen={showCyberDeckModal}
        onClose={() => setShowCyberDeckModal(false)}
        heroTokens={sortedTokens.filter(t => Boolean(t.linkedHeroId))}
        onTriggerFloatingText={onTriggerFloatingText}
      />

      {/* Real-Time Tactical Trait & Modifiers Adjudicator Modal */}
      <RulesAdjudicatorPanel
        isOpen={showRulesAdjudicator}
        onClose={() => setShowRulesAdjudicator(false)}
        tokens={sortedTokens}
        activeAttackerId={activeTurnTokenId}
        onApplyToCombatResolver={(attackerId, targetId, netAtk, targetDef) => {
          setResolverAttackerId(attackerId);
          setShowCombatResolver(true);
        }}
      />

      {/* Interactive Galaxy Sector & Planetary Starmap Modal */}
      <GalaxyStarmapModal
        isOpen={showGalaxyStarmapModal}
        onClose={() => setShowGalaxyStarmapModal(false)}
      />

      {/* Faction Relational Web & Party Heat Modal */}
      <FactionWebModal
        isOpen={showFactionWebModal}
        onClose={() => setShowFactionWebModal(false)}
      />

      {/* Modular Starship & Mecha Hardpoint Forge Modal */}
      <ModularStarshipForgeModal
        isOpen={showModularStarshipForge}
        onClose={() => setShowModularStarshipForge(false)}
      />

      {/* Dynamic Hazmat & Environmental Volume Manager Modal */}
      <HazmatVolumeManagerModal
        isOpen={showHazmatModal}
        onClose={() => setShowHazmatModal(false)}
        hazardZones={localHazardZones}
        onAddHazardZone={(newZone) => setLocalHazardZones(prev => [...prev, newZone])}
        onDeleteHazardZone={(id) => setLocalHazardZones(prev => prev.filter(z => z.id !== id))}
        tokens={sortedTokens}
        onUpdateTokenHealth={handleApplyHealthChange}
        onUpdateTokenVitality={handleApplyVitalityChange}
        onUpdateTokenStructure={handleApplyStructureChange}
        onUpdateTokenConditions={onUpdateTokenConditions}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Interactive Map Destructibles & Slicing Modal */}
      <InteractiveObjectModal
        isOpen={showInteractiveObjModal}
        onClose={() => {
          setShowInteractiveObjModal(false);
          setSelectedInteractiveObj(null);
        }}
        objectNode={selectedInteractiveObj}
        onUpdateObject={(id, updated) => {
          onUpdateToken?.(id, updated);
        }}
        onDeleteObject={(id) => {
          onUpdateToken?.(id, { isDeleted: true });
        }}
        tokens={sortedTokens}
        onUpdateTokenHealth={handleApplyHealthChange}
        onUpdateTokenVitality={handleApplyVitalityChange}
        onUpdateTokenStructure={handleApplyStructureChange}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />

      {/* Scenario Objectives & Mission Waves Modal */}
      <ScenarioObjectivesModal
        isOpen={showObjectivesModal}
        onClose={() => setShowObjectivesModal(false)}
        objectives={localObjectives}
        onAddObjective={(newObj) => setLocalObjectives(prev => [...prev, newObj])}
        onUpdateObjective={(id, updated) => {
          setLocalObjectives(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
        }}
        onDeleteObjective={(id) => setLocalObjectives(prev => prev.filter(o => o.id !== id))}
        tokens={sortedTokens}
        onSpawnWaveTokens={(waveTokens) => {
          waveTokens.forEach(t => onUpdateToken?.(t.id, t));
        }}
        currentRound={1}
        onAwardMissionRewards={(ap, karma) => {
          handleAwardPartyAP(ap, 'Mission Objectives Accomplished');
          handleAwardPartyKarma(karma, 'Mission Objectives Accomplished');
        }}
        onTriggerFloatingText={onTriggerFloatingText}
        scale={scale}
        position={position}
      />
    </DraggablePanel>
  );
};

export default MapCombatTracker;
