/**
 * Canonical Species Disadvantages Catalog for Tangent Science Fantasy Roleplaying Game (SFF RPG)
 * Auto-generated from src/data/omnicortex/disadvantages/
 * Total Species Disadvantages: 7
 */

export const SPECIES_DISADVANTAGES = [
  {
    "id": "disadvantage-species-armless",
    "code": "armless",
    "name": "Armless",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Physical",
    "type": "Physical",
    "refundBP": 4,
    "costBP": -4,
    "desc": "Without Arms.",
    "mechanics": "The species completely lacks arms, forelimbs, tentacles, or manual manipulation appendages. The character cannot wield weapons, hold items, carry two-handed gear, or perform fine mechanical manipulation without specialized prosthetic rigs, mouth grips, or cybernetics."
  },
  {
    "id": "disadvantage-species-elemental-vulnerability",
    "code": "elemental_vulnerability",
    "name": "Elemental Vulnerability",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Physical",
    "type": "Physical",
    "refundBP": 4,
    "costBP": -4,
    "desc": "Vulnerability (+2 dmg per die) to Acid, Cold, Electricity, or Fire.",
    "mechanics": "Select one elemental energy damage type (Acid/Corrosive, Cold/Cryo, Electricity/Voltic, or Fire/Pyro). The species suffers +2 additional damage per damage die rolled whenever taking damage of the chosen elemental type."
  },
  {
    "id": "disadvantage-species-light-blindness",
    "code": "light_blindness",
    "name": "Light Blindness",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Sensory",
    "type": "Sensory",
    "refundBP": 4,
    "costBP": -4,
    "prerequisite": "Darkvision / Dark Sight",
    "desc": "Abrupt exposure to bright light blinds for 1 round; then dazzled. Req: Darkvision.",
    "mechanics": "Requirements: Darkvision / Dark Sight. Abrupt exposure to bright sunlight, flashbangs, or intense illumination permanently tuned to subterranean darkness blinds the creature for 1 full combat round. In subsequent rounds of continuous exposure, the character remains Dazzled (–1 penalty on attack rolls and sight-based Perception checks)."
  },
  {
    "id": "disadvantage-species-light-sensitivity",
    "code": "light_sensitivity",
    "name": "Light Sensitivity",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Sensory",
    "type": "Sensory",
    "refundBP": 2,
    "costBP": -2,
    "prerequisite": "Darkvision / Dark Sight",
    "desc": "Dazzled in bright sunlight. Req: Darkvision.",
    "mechanics": "Requirements: Darkvision / Dark Sight. Optical photoreceptors are overly sensitive to solar radiation. While operating in direct, unshielded bright sunlight or equivalent daylight-level illumination, the character is permanently Dazzled (–1 penalty on attack rolls and sight-based Perception checks)."
  },
  {
    "id": "disadvantage-species-negative-energy-affinity",
    "code": "negative_energy_affinity",
    "name": "Negative Energy Affinity",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Meta",
    "type": "Meta",
    "refundBP": 4,
    "costBP": -4,
    "desc": "Alive, but harmed by positive/healed by negative energy (like undead).",
    "mechanics": "Though biologically alive, the creature's metaphysical matrix reacts inversely to life force energies: positive/radiant healing spells and standard medical nanites cause damage instead of healing, while negative/entropic/necrotic energy effects restore Health and Vitality."
  },
  {
    "id": "disadvantage-species-sunlight-powerlessness",
    "code": "sunlight_powerlessness",
    "name": "Sunlight Powerlessness",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Meta",
    "type": "Meta",
    "refundBP": 6,
    "costBP": -6,
    "prerequisite": "Undead / Half-Undead / Non-Living",
    "desc": "Staggered/Helpless in direct sunlight. Req: Undead/Half-Undead.",
    "mechanics": "Requirements: Undead / Half-Undead or Non-Living lineage. Exposure to direct solar radiation completely paralyzes internal energetic channels. While exposed to natural direct sunlight, the character is Staggered and Helpless, able to take only a single standard action per round with severe disadvantage."
  },
  {
    "id": "disadvantage-species-vulnerable-to-sunlight",
    "code": "vulnerable_to_sunlight",
    "name": "Vulnerable to Sunlight",
    "category": "disadvantages",
    "disadvantage_type": "Species Disadvantage",
    "classification": "Meta",
    "type": "Meta",
    "refundBP": 4,
    "costBP": -4,
    "prerequisite": "Native to Darklands / Shadow Realms",
    "desc": "Take 1 Con damage per hour in sunlight. Req: Native to Darklands/Shadow.",
    "mechanics": "Requirements: Native to Darklands / Shadow Realms. Cellular and metaphysical degradation occurs under direct solar ultraviolet bombardment. The character suffers 1 point of Constitution (Stamina) damage for every cumulative hour spent in direct sunlight without specialized protective full-body thermal cloaks."
  }
];

export default SPECIES_DISADVANTAGES;
