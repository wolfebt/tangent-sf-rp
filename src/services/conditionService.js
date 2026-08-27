/**
 * TANGENT SFF RP: Condition & Turn-State Machine Service
 * Canonical condition registry, per-turn affliction processor, and status lifecycle engine.
 */

export const CANONICAL_CONDITIONS = [
  {
    id: 'Bleeding',
    label: 'Bleeding',
    icon: '🩸',
    color: '#ef4444',
    severity: 'high',
    category: 'Trauma',
    tickTiming: 'turn_start',
    description: 'Active hemorrhage inflicts 1d6 (or fixed 3) lethal damage to Health at turn start until treated.',
    defaultDuration: 3,
    defaultDamage: 3,
    damageType: 'lethal',
    targetPool: 'health',
    cureDc: 12,
    cureSkill: 'Medicine',
    actionPenalty: null
  },
  {
    id: 'Burning',
    label: 'Burning / Plasma',
    icon: '🔥',
    color: '#f97316',
    severity: 'high',
    category: 'Thermal',
    tickTiming: 'turn_start',
    description: 'Engulfed in flames or superheated plasma. Inflicts 4 thermal lethal damage at turn start and reduces Armor DR by 1.',
    defaultDuration: 3,
    defaultDamage: 4,
    damageType: 'lethal',
    targetPool: 'health',
    cureDc: 10,
    cureSkill: 'Reflex/Acrobatics',
    actionPenalty: null
  },
  {
    id: 'Poisoned',
    label: 'Poisoned / Toxin',
    icon: '☠️',
    color: '#22c55e',
    severity: 'medium',
    category: 'Chemical',
    tickTiming: 'turn_start',
    description: 'Bio-toxin or neuro-agent ravages the system. Inflicts 3 non-lethal Vitality stress and imposes -1 to all physical checks.',
    defaultDuration: 4,
    defaultDamage: 3,
    damageType: 'vitality',
    targetPool: 'vitality',
    cureDc: 14,
    cureSkill: 'Medicine',
    actionPenalty: { physicalChecks: -1 }
  },
  {
    id: 'Stunned',
    label: 'Stunned',
    icon: '⚡',
    color: '#eab308',
    severity: 'medium',
    category: 'Impairment',
    tickTiming: 'turn_start',
    description: 'Severe sensory shock or neural jolt. Target forfeits their Standard Action and suffers -2 to Base Defense DC.',
    defaultDuration: 1,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'none',
    cureDc: 12,
    cureSkill: 'Fortitude Save',
    actionPenalty: { forfeitStandard: true, defenseDcMod: -2 }
  },
  {
    id: 'Concussed',
    label: 'Concussed',
    icon: '💫',
    color: '#8b5cf6',
    severity: 'medium',
    category: 'Neural',
    tickTiming: 'turn_start',
    description: 'Head trauma or sonic shockwave. Imposes -2 penalty to all Intellect, Perception, and Cyber-Hacking checks.',
    defaultDuration: 2,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'none',
    cureDc: 11,
    cureSkill: 'Willpower',
    actionPenalty: { mentalChecks: -2 }
  },
  {
    id: 'Prone',
    label: 'Prone',
    icon: '⬇️',
    color: '#94a3b8',
    severity: 'low',
    category: 'Positional',
    tickTiming: 'none',
    description: 'Knocked down. Must spend 1 Move Action to stand. Grants +2 Defense DC vs ranged >10m; adjacent melee attacks gain Advantage.',
    defaultDuration: null,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'none',
    actionPenalty: { requiresMoveToStand: true }
  },
  {
    id: 'SensorJammed',
    label: 'Sensor Jammed / Blind',
    icon: '👁️‍🗨️',
    color: '#06b6d4',
    severity: 'medium',
    category: 'Electronic',
    tickTiming: 'none',
    description: 'Optical sensors blinded or tactical HUD jammed. All ranged attacks and visual scans suffer Disadvantage.',
    defaultDuration: 2,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'none',
    actionPenalty: { rangedDisadvantage: true }
  },
  {
    id: 'RadioactiveSickness',
    label: 'Radioactive Sickness',
    icon: '☢️',
    color: '#84cc16',
    severity: 'high',
    category: 'Environmental',
    tickTiming: 'turn_start',
    description: 'Ionizing radiation contamination. Inflicts 3 lethal damage directly ignoring armor DR and reduces max Vitality.',
    defaultDuration: 5,
    defaultDamage: 3,
    damageType: 'lethal',
    targetPool: 'health',
    cureDc: 15,
    cureSkill: 'Decon Protocol',
    actionPenalty: { maxVitalityPenalty: 5 }
  },
  {
    id: 'PsionicShock',
    label: 'Psionic Shock',
    icon: '🔮',
    color: '#d946ef',
    severity: 'medium',
    category: 'Metaphysics',
    tickTiming: 'turn_start',
    description: 'Essence feedback overload. Operative cannot cast Tier 2+ Invocations and suffers -2 to Willpower saves.',
    defaultDuration: 2,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'none',
    cureDc: 13,
    cureSkill: 'Willpower/Meditate',
    actionPenalty: { lockInvocations: true }
  },
  {
    id: 'Shielded',
    label: 'Kinetic Shielded',
    icon: '🛡️',
    color: '#3b82f6',
    severity: 'buff',
    category: 'Defense',
    tickTiming: 'none',
    description: 'Active deflector field absorbs incoming kinetic and thermal trauma before Vitality/Health/Structure.',
    defaultDuration: 3,
    defaultDamage: 0,
    damageType: 'none',
    targetPool: 'shields'
  },
  {
    id: 'DeathsDoor',
    label: "Death's Door",
    icon: '💀',
    color: '#e11d48',
    severity: 'critical',
    category: 'Mortality',
    tickTiming: 'turn_start',
    description: 'Health & Vitality at 0. Operative is comatose. Death clock ticks down each round equal to Stamina score.',
    defaultDuration: null,
    defaultDamage: 0,
    damageType: 'death_clock',
    targetPool: 'death_clock'
  },
  {
    id: 'Stabilized',
    label: 'Stabilized',
    icon: '🩹',
    color: '#10b981',
    severity: 'buff',
    category: 'Mortality',
    tickTiming: 'none',
    description: 'Trauma halted by med-gel or resuscitation. Death clock is frozen; operative remains unconscious until healed.',
    defaultDuration: null
  },
  {
    id: 'Dead',
    label: 'Dead',
    icon: '⚰️',
    color: '#475569',
    severity: 'terminal',
    category: 'Mortality',
    tickTiming: 'none',
    description: 'Bio-signs flatlined or cyber-core breached. Requires resuscitation tech (-5 AP Revivification Debt).',
    defaultDuration: null
  }
];

export const getConditionDefinition = (conditionId) => {
  if (!conditionId) return null;
  const target = String(conditionId).toLowerCase().replace(/[^a-z0-9]/g, '');
  return CANONICAL_CONDITIONS.find(c => {
    const cid = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clabel = c.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cid === target || clabel === target;
  }) || null;
};

/**
 * Evaluates active conditions on a token at the START of their turn.
 * Automatically computes damage ticks, decrements duration counters, and returns updated token state.
 */
export const evaluateTokenConditionsOnTurnStart = (token, options = {}) => {
  if (!token) return { updatedToken: token, triggeredEffects: [], expiredConditions: [] };

  const currentConditions = Array.isArray(token.conditions) ? [...token.conditions] : [];
  const conditionDetails = token.conditionDetails ? { ...token.conditionDetails } : {};
  const triggeredEffects = [];
  const expiredConditions = [];

  let health = token.health ? { ...token.health } : { current: 30, max: 30 };
  let vitality = token.vitality ? { ...token.vitality } : { current: 30, max: 30 };
  let structure = token.structure ? { ...token.structure } : null;
  const isSynthetic = Boolean(token.isSynthetic || structure);

  const nextConditions = [];

  currentConditions.forEach((condName) => {
    const def = getConditionDefinition(condName);
    const detail = conditionDetails[condName] || { duration: def?.defaultDuration || 3 };

    if (!def) {
      // Custom condition with no special tick logic
      nextConditions.push(condName);
      return;
    }

    // Process Start-of-Turn Ticks
    if (def.tickTiming === 'turn_start' && def.defaultDamage > 0) {
      const dmg = detail.damage !== undefined ? detail.damage : def.defaultDamage;

      if (isSynthetic) {
        // Synthetics take thermal/plasma/radiation/bleed to structure; immune to vitality toxins
        if (def.id === 'Poisoned') {
          triggeredEffects.push({
            type: 'immune',
            condition: def.label,
            icon: '🤖',
            message: `Synthetic unit immune to ${def.label}`,
            sfx: 'miss'
          });
        } else {
          const curStruct = structure?.current ?? 60;
          const newStruct = Math.max(0, curStruct - dmg);
          if (structure) structure.current = newStruct;

          triggeredEffects.push({
            type: 'damage',
            pool: 'structure',
            amount: dmg,
            condition: def.label,
            icon: def.icon,
            message: `${def.icon} -${dmg} STRUCT (${def.label.toUpperCase()})`,
            sfx: 'hit'
          });
        }
      } else {
        // Biological Operative
        if (def.targetPool === 'vitality') {
          const curVit = vitality?.current ?? 30;
          const newVit = Math.max(0, curVit - dmg);
          vitality.current = newVit;

          triggeredEffects.push({
            type: 'damage',
            pool: 'vitality',
            amount: dmg,
            condition: def.label,
            icon: def.icon,
            message: `${def.icon} -${dmg} VIT (${def.label.toUpperCase()})`,
            sfx: 'hit'
          });
        } else {
          // Lethal to Health
          const curH = health?.current ?? 30;
          const newH = Math.max(0, curH - dmg);
          health.current = newH;

          triggeredEffects.push({
            type: 'damage',
            pool: 'health',
            amount: dmg,
            condition: def.label,
            icon: def.icon,
            message: `${def.icon} -${dmg} HP (${def.label.toUpperCase()})`,
            sfx: 'hit'
          });
        }
      }
    }

    // Duration decrement
    if (detail.duration !== null && detail.duration !== undefined && typeof detail.duration === 'number') {
      const nextDur = detail.duration - 1;
      if (nextDur <= 0) {
        expiredConditions.push(def.label);
        delete conditionDetails[condName];
        triggeredEffects.push({
          type: 'expired',
          condition: def.label,
          icon: '✨',
          message: `✨ ${def.label} Expired / Recovered`,
          sfx: 'heal'
        });
      } else {
        conditionDetails[condName] = { ...detail, duration: nextDur };
        nextConditions.push(condName);
      }
    } else {
      nextConditions.push(condName);
    }
  });

  const updatedToken = {
    ...token,
    conditions: nextConditions,
    conditionDetails,
    health,
    vitality,
    ...(structure ? { structure } : {})
  };

  return {
    updatedToken,
    triggeredEffects,
    expiredConditions
  };
};

/**
 * Adds or updates a condition on a token.
 */
export const applyConditionToToken = (token, conditionId, duration = null, customData = {}) => {
  if (!token) return token;
  const def = getConditionDefinition(conditionId);
  const label = def ? def.label : conditionId;
  const condList = Array.isArray(token.conditions) ? [...token.conditions] : [];

  if (!condList.includes(label)) {
    condList.push(label);
  }

  const conditionDetails = token.conditionDetails ? { ...token.conditionDetails } : {};
  const resolvedDuration = duration !== null ? duration : (def?.defaultDuration ?? null);

  conditionDetails[label] = {
    duration: resolvedDuration,
    appliedAtRound: customData.round || 1,
    damage: customData.damage !== undefined ? customData.damage : (def?.defaultDamage ?? 0),
    ...customData
  };

  return {
    ...token,
    conditions: condList,
    conditionDetails
  };
};

/**
 * Removes a condition from a token.
 */
export const removeConditionFromToken = (token, conditionId) => {
  if (!token) return token;
  const def = getConditionDefinition(conditionId);
  const targetLabel = def ? def.label : conditionId;

  const nextConds = (token.conditions || []).filter(c => c !== targetLabel && c !== conditionId);
  const nextDetails = token.conditionDetails ? { ...token.conditionDetails } : {};
  delete nextDetails[targetLabel];
  delete nextDetails[conditionId];

  return {
    ...token,
    conditions: nextConds,
    conditionDetails: nextDetails
  };
};
