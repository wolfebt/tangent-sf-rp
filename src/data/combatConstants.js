/**
 * @file combatConstants.js
 * @description Canonical Tangent v6 tactical hit location table and called-shot modifiers.
 */

export const HIT_LOCATIONS = [
  {
    id: 'head',
    label: 'Head',
    range: [1, 1],
    d10: [1],
    d6: [1],
    multiplier: 1.0,
    penalty: -2,
    saveType: 'Reason',
    savingThrow: 'Reason Save vs Damage (fail by 10+ Unconscious)',
    traumaEffect: 'KO / Stunned: Reason save or Stunned 1 round/pt under CR; fail by 10+ = Unconscious',
    desc: 'Cranium & Face (-2 Called Shot; Specific Sensory Organs/Optics -5)'
  },
  {
    id: 'torso',
    label: 'Torso',
    range: [2, 4],
    d10: [2, 3, 4],
    d6: [2, 3, 4],
    multiplier: 1.0,
    penalty: -1,
    saveType: 'Fortitude',
    savingThrow: 'Fortitude Save vs Damage (fail by 10+ Incapacitated)',
    traumaEffect: 'Winded: Fortitude save or -2 actions for 1 round/pt under CR; fail by 10+ = Gasping / Incapacitated',
    desc: 'Center of Mass & Vital Organs (-1 Called Shot)'
  },
  {
    id: 'right_arm',
    label: 'Right Arm',
    range: [5, 5],
    d10: [5],
    d6: [5],
    multiplier: 1.0,
    penalty: -2,
    saveType: 'Reflex',
    savingThrow: 'Reflex Save vs Damage (fail by 10+ Crippled)',
    traumaEffect: 'Disarmed: Reflex save or drop held item; fail by 10+ = Arm Crippled',
    desc: 'Primary Weapon Arm (-2 Called Shot)'
  },
  {
    id: 'left_arm',
    label: 'Left Arm',
    range: [6, 6],
    d10: [6],
    d6: [6],
    multiplier: 1.0,
    penalty: -2,
    saveType: 'Reflex',
    savingThrow: 'Reflex Save vs Damage (fail by 10+ Crippled)',
    traumaEffect: 'Disarmed: Reflex save or drop held item; fail by 10+ = Arm Crippled',
    desc: 'Secondary Weapon / Shield Arm (-2 Called Shot)'
  },
  {
    id: 'right_leg',
    label: 'Right Leg',
    range: [7, 8],
    d10: [7, 8],
    d6: [],
    multiplier: 1.0,
    penalty: -2,
    saveType: 'Might',
    savingThrow: 'Might Save vs Damage (fail by 10+ Crippled)',
    traumaEffect: 'Hobbled: Might save or half speed for 1 round/pt under CR; fail by 10+ = Leg Crippled',
    desc: 'Locomotion / Stance Anchor (-2 Called Shot)'
  },
  {
    id: 'left_leg',
    label: 'Left Leg',
    range: [9, 10],
    d10: [9, 10],
    d6: [],
    multiplier: 1.0,
    penalty: -2,
    saveType: 'Might',
    savingThrow: 'Might Save vs Damage (fail by 10+ Crippled)',
    traumaEffect: 'Hobbled: Might save or half speed for 1 round/pt under CR; fail by 10+ = Leg Crippled',
    desc: 'Locomotion / Stance Anchor (-2 Called Shot)'
  }
];
