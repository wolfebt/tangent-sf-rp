import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invocationsDir = path.resolve(__dirname, '../src/data/omnicortex/invocations');

/**
 * Detailed Canonical Profiles for all 137 Omnicortex Invocations.
 * Grounded in META.docx, rule-composite-invocations.md, metaphysics-triad.md, and individual ritual markdown bodies.
 */

// Specific overrides and exact classifications
export const INVOCATION_SUBGROUPS = {
  // --- ENTROPY (ORDER): Healing, Restoration, Abjuration ---
  'aid': {
    species: ['Celestine (Alterian)', 'Fey (Base)', 'Human (Base)', 'Prokos (Auluran Biform)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Colony', 'Agricultural'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Citizen'],
    keywords: 'aid, vitality boost, temporary fortitude, moral ward, metabolic surge, cellular resilience, protective aura',
    negative_keywords: 'necrotic rot, cellular decay, acid damage, curse infliction, brutal violence'
  },
  'blessing': {
    species: ['Celestine (Alterian)', 'Fey (Base)', 'Ila (Progenitor Archon)', 'Human (Base)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Interstellar Diplomats Faction Template'],
    origins: ['Enlightened', 'Colony', 'Leisure'],
    occupations: ['Adept', 'Scholar', 'Representative', 'Citizen'],
    keywords: 'blessing, fortune surge, aura enhancement, metaphysical favor, alignment bonus, harmonic resonance, morale grace',
    negative_keywords: 'hex, misfortune curse, dark omen, bio-toxin, ruthless slaughter'
  },
  'cure': {
    species: ['Celestine (Alterian)', 'Fey (Base)', 'Prokos (Auluran Biform)', 'Human (Base)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Interstellar Diplomats Faction Template', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Research', 'Agricultural', 'Colony'],
    occupations: ['Specialist', 'Adept', 'Scholar', 'Citizen'],
    keywords: 'cure, cellular knitting, biological mending, wound closure, vital restoration, metabolic healing, tissue repair, trauma recovery',
    negative_keywords: 'necrosis, acid corrosion, flesh rotting, biological weapon, mechanical overhaul'
  },
  'dispel magic': {
    species: ['Celestine (Alterian)', 'Whisper', 'Ila (Progenitor Archon)', 'Nocturne (Kovian)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Kovian Tribunal', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Research', 'Urban', 'Spacer'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Agent'],
    keywords: 'dispel magic, unbind enchantment, counter-arcana, metaphysical purge, anti-magic ward, spell unraveling, resonance severance',
    negative_keywords: 'dark curse, necromancy, chaotic corruption, brute force, crude mechanics'
  },
  'exorcism': {
    species: ['Celestine (Alterian)', 'Whisper', 'Nocturne (Kovian)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Kovian Tribunal', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Research', 'Hostile'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Scout'],
    keywords: 'exorcism, entity banishment, spiritual purge, metaphysical severance, ethereal cleansing, unbind possession, alien entity eviction',
    negative_keywords: 'demonic pact, void corruption, biological grafting, cybernetic override'
  },
  'life control': {
    species: ['Celestine (Alterian)', 'Fey (Base)', 'Prokos (Auluran Biform)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Research', 'Agricultural'],
    occupations: ['Adept', 'Specialist', 'Scholar'],
    keywords: 'life control, vitality stewardship, metabolic equilibrium, bio-harmonic regulation, essence governance, organic vital mastery',
    negative_keywords: 'violent slaughter, reckless destruction, necrotic rot, cybernetic replacement'
  },
  'protection (entropy)': {
    species: ['Celestine (Alterian)', 'Whisper', 'Nocturne (Kovian)', 'Tenen (Sha’nor Spectral)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Kovian Tribunal', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Hostile', 'Spacer'],
    occupations: ['Adept', 'Soldier', 'Specialist', 'Scout'],
    keywords: 'protection against entropy, decay resistance, anti-necrotic ward, corruption shield, void barrier, entropic insulation',
    negative_keywords: 'vulnerability, biological rot, infectious plague, acid vulnerability'
  },
  'regenerate': {
    species: ['Celestine (Alterian)', 'Prokos (Auluran Biform)', 'Fey (Base)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Supernatural Faction Template', 'Genetic Engineering Faction Template'],
    origins: ['Enlightened', 'Research', 'Agricultural'],
    occupations: ['Specialist', 'Adept', 'Scholar'],
    keywords: 'regenerate, rapid organ regrowth, limb restoration, sustained cellular knitting, continuous healing, bio-regrowth, cellular renaissance',
    negative_keywords: 'amputation, permanent necrosis, irreversible decay, cybernetic limb replacement'
  },
  'remove curse': {
    species: ['Celestine (Alterian)', 'Whisper', 'Ila (Progenitor Archon)', 'Nocturne (Kovian)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'The Ascendancy', 'Kovian Tribunal'],
    origins: ['Enlightened', 'Research', 'Urban'],
    occupations: ['Adept', 'Scholar', 'Specialist', 'Agent'],
    keywords: 'remove curse, hex breaking, jinx purge, malevolent bond severance, spiritual purification, counter-malediction, clean aura',
    negative_keywords: 'curse weaving, malevolent retribution, dark pact, necrotic infection'
  },
  'restoration': {
    species: ['Celestine (Alterian)', 'Prokos (Auluran Biform)', 'Fey (Base)', 'Human (Base)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Interstellar Diplomats Faction Template'],
    origins: ['Enlightened', 'Research', 'Colony'],
    occupations: ['Specialist', 'Adept', 'Scholar', 'Representative'],
    keywords: 'restoration, condition cleansing, attribute restoration, paralysis cure, blindness removal, full biological restoration, homeostasis',
    negative_keywords: 'toxic poisoning, nerve destruction, debilitating paralysis, permanent blind'
  },
  'revivify': {
    species: ['Celestine (Alterian)', 'Ila (Progenitor Archon)', 'Prokos (Auluran Biform)', 'Fey (Base)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Supernatural Faction Template'],
    origins: ['Enlightened', 'Research', 'Colony'],
    occupations: ['Specialist', 'Adept', 'Scholar'],
    keywords: 'revivify, cardiac defibrillation, soul recall, resuscitation, cellular revival, shock-revive, biological restart, spark of life',
    negative_keywords: 'irreversible death, rigor mortis, body disintegration, organ harvesting'
  },
  'stabilize': {
    species: ['Celestine (Alterian)', 'Prokos (Auluran Biform)', 'Human (Base)', 'Dar (Auluran Hunter)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Interstellar Diplomats Faction Template', 'Military Faction Template'],
    origins: ['Colony', 'Militaristic', 'Enlightened', 'Agricultural'],
    occupations: ['Specialist', 'Soldier', 'Adept', 'Citizen'],
    keywords: 'stabilize, trauma triage, hemorrhage halt, mortality halt, emergency stabilization, vital stasis, combat medic surge',
    negative_keywords: 'fatal bleed, blood loss, decapitation, fatal shock, lethal poison'
  },
  'vital sight': {
    species: ['Celestine (Alterian)', 'Whisper', 'Prokos (Auluran Biform)', 'Ila (Progenitor Archon)'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'The Ascendancy'],
    origins: ['Enlightened', 'Research', 'Spacer'],
    occupations: ['Specialist', 'Adept', 'Scholar', 'Scout'],
    keywords: 'vital sight, aura diagnostics, metabolic scanning, health detection, heartbeat aura, biological vision, cellular resonance scan',
    negative_keywords: 'blind scan, technological thermal optic, mechanical sonar, blind spot'
  },

  // --- ENTROPY (CHAOS): Decay, Necrosis, Curses ---
  'blight': {
    species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Eakren (Corrupted Aberration)', 'Rautha Human'],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Criminal Faction Template'],
    origins: ['Hostile', 'Industrial', 'Spacer'],
    occupations: ['Adept', 'Criminal', 'Drifter'],
    keywords: 'blight, ecological rot, flora desolation, harvest decay, bio-withering, virulent necrosis, soil corruption, ecological ruin',
    negative_keywords: 'agricultural bloom, hydroponic harvest, verdant forest, vital healing'
  },
  'chaotic blast': {
    species: ['Tenen (Sha’nor Spectral)', 'Eakren (Corrupted Aberration)', 'Rautha Human', "Sha'nor"],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Criminal Faction Template'],
    origins: ['Hostile', 'Spacer', 'Industrial'],
    occupations: ['Adept', 'Soldier', 'Criminal'],
    keywords: 'chaotic blast, entropic disruption, raw chaos, unpredictable resonance, reality tear, matter unmaking, volatile blast',
    negative_keywords: 'ordered shielding, precision calibration, sterile cleanroom, lawful restraint'
  },
  'corrosion': {
    species: ['Tenen (Sha’nor Spectral)', 'Eakren (Corrupted Aberration)', 'Rautha Human', 'Mekan (Assimilation Unit)'],
    factions: ['The Outworlds', 'Criminal Faction Template', 'Incorporated Planetary Syndication (The Syndicate)'],
    origins: ['Industrial', 'Hostile', 'Urban'],
    occupations: ['Adept', 'Specialist', 'Criminal'],
    keywords: 'corrosion, hyper-acid, molecular dissolution, armor eating, industrial sludge, caustic liquefaction, metal etching, acid spray',
    negative_keywords: 'acid proof, pristine chrome, non-reactive polymer, restorative mending'
  },
  'cull': {
    species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Rautha Human', 'Nocturne (Kovian)'],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Kovian Tribunal'],
    origins: ['Hostile', 'Militaristic', 'Spacer'],
    occupations: ['Adept', 'Criminal', 'Soldier'],
    keywords: 'cull, execution strike, weakling purge, necrotic harvest, executioner touch, vitality drain, final strike',
    negative_keywords: 'mercy, protective sanctuary, non-lethal surrender, universal medical aid'
  },
  'curse': {
    species: ['Whisper', 'Tenen (Sha’nor Spectral)', 'Nocturne (Kovian)', 'Rautha Human'],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Kovian Tribunal', 'Supernatural Faction Template'],
    origins: ['Hostile', 'Enlightened', 'Urban'],
    occupations: ['Adept', 'Criminal', 'Agent'],
    keywords: 'curse, malediction, hex, misfortune aura, doom mark, karmic unraveling, fatal hex, lingering blight',
    negative_keywords: 'divine blessing, fortune boost, clean aura, joyful celebration'
  },
  'fear': {
    species: ['Tenen (Sha’nor Spectral)', 'Whisper', "Sha'nor", 'Nocturne (Kovian)'],
    factions: ['The Outworlds', 'The Ascendancy', 'Incorporated Planetary Syndication (The Syndicate)', 'Kovian Tribunal'],
    origins: ['Hostile', 'Urban', 'Spacer'],
    occupations: ['Adept', 'Agent', 'Criminal'],
    keywords: 'fear, terror pulse, eldritch dread, nightmare panic, adrenaline paralysis, psychological horror, primal fear aura',
    negative_keywords: 'unshakable courage, morale boost, fearless inspiration, peaceful calm'
  },
  'nauseate': {
    species: ['Eakren (Corrupted Aberration)', 'Tenen (Sha’nor Spectral)', 'Rautha Human'],
    factions: ['The Outworlds', 'Criminal Faction Template', 'Mutant Faction Template'],
    origins: ['Hostile', 'Industrial', 'Urban'],
    occupations: ['Adept', 'Criminal', 'Drifter'],
    keywords: 'nauseate, bio-toxin, visceral revulsion, bile sickness, biological debuff, cellular disruption, debilitating vertigo',
    negative_keywords: 'athletic vigor, iron stomach, clean oxygen, vital health'
  },
  'nullify': {
    species: ['Tenen (Sha’nor Spectral)', 'Whisper', 'Varen (Gatekeeper)', 'Nocturne (Kovian)'],
    factions: ['The Outworlds', 'The Ascendancy', 'Kovian Tribunal'],
    origins: ['Hostile', 'Spacer', 'Research'],
    occupations: ['Adept', 'Specialist', 'Agent'],
    keywords: 'nullify, energy extinction, magic void, metaphysical dampening, active neutralization, entropy sink, dampening field',
    negative_keywords: 'energy amplification, spell surge, luminous flare, hyper-charge'
  },
  'suffocate': {
    species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Eakren (Corrupted Aberration)', 'Whisper'],
    factions: ['The Outworlds', 'Criminal Faction Template', 'Incorporated Planetary Syndication (The Syndicate)'],
    origins: ['Spacer', 'Hostile', 'Urban'],
    occupations: ['Adept', 'Criminal', 'Agent'],
    keywords: 'suffocate, oxygen deprivation, vacuum choke, respiratory crushing, asphyxiation, lung collapse, silent strangulation',
    negative_keywords: 'fresh air, hyperbaric oxygen, scuba life support, deep breathing'
  },
  'touch of death': {
    species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Eakren (Corrupted Aberration)', 'Rautha Human'],
    factions: ['The Outworlds', 'Religious Cult Faction Template', 'Criminal Faction Template'],
    origins: ['Hostile', 'Militaristic', 'Spacer'],
    occupations: ['Criminal', 'Adept', 'Agent'],
    keywords: 'touch of death, lethal necrosis, death touch, instant cellular collapse, necrotic execution, marrow death, black touch',
    negative_keywords: 'touch of life, healing warmth, vital spark, defibrillation'
  },
  'wound': {
    species: ['Tenen (Sha’nor Spectral)', 'Eakren (Corrupted Aberration)', 'Rautha Human', "Sha'nor"],
    factions: ['The Outworlds', 'Criminal Faction Template', 'Military Faction Template'],
    origins: ['Hostile', 'Militaristic', 'Industrial'],
    occupations: ['Adept', 'Soldier', 'Criminal'],
    keywords: 'wound, necrotic laceration, flesh tearing, bio-degradation, deep hemorrhage, blood rot, lingering trauma',
    negative_keywords: 'wound closure, surgical suture, first aid bandage, cellular regeneration'
  },

  // --- ENERGY (FORCE): Hard-Light, Vectors, Kinetic ---
  'analyze momentum': {
    species: ['Celestine (Alterian)', 'Whisper', 'Intellect Construct (Pure AI)', 'Eidolon (Aetherion Specialist)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Technological Faction Template'],
    origins: ['Research', 'Spacer', 'Enlightened'],
    occupations: ['Scholar', 'Specialist', 'Adept'],
    keywords: 'analyze momentum, inertial tracking, vector calculus, kinetic trajectory, projectile prediction, velocity scanning',
    negative_keywords: 'erratic blind fire, random chaos, uncalculated brawling'
  },
  'force armor': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Biomechanical Synthetic', 'Janissary (Gen-E)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Enlightened', 'Militaristic', 'Urban'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'force armor, hard-light carapace, kinetic deflection suit, energy armor, personal ward, barrier skin',
    negative_keywords: 'heavy steel plate, rusting iron, unarmored fragility, flesh exposure'
  },
  'force barrier': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Golem (Arcane Construct)', 'Biomechanical Synthetic'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Enlightened', 'Militaristic', 'Urban', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Builder'],
    keywords: 'force barrier, impassable energy wall, hard-light fortification, blast bulkhead, perimeter shield, kinetic wall',
    negative_keywords: 'porous wire fence, open terrain, unfortified gap, flimsy wood'
  },
  'force constructs': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Biomechanical Synthetic', 'Golem (Arcane Construct)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Technological Faction Template'],
    origins: ['Enlightened', 'Research', 'Industrial'],
    occupations: ['Builder', 'Adept', 'Specialist'],
    keywords: 'force constructs, hard-light architecture, shaped energy, temporary bridges, solid light fabrication, construct forging',
    negative_keywords: 'crude timber, brick and mortar, heavy masonry, fragile paper'
  },
  'force field': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Whisper', 'Janissary (Gen-E)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Enlightened', 'Spacer', 'Militaristic'],
    occupations: ['Adept', 'Specialist', 'Soldier'],
    keywords: 'force field, energy bubble, 360 shield, perimeter dome, kinetic sphere, hard-light dome, total containment',
    negative_keywords: 'flanking opening, unshielded flank, localized weak spot'
  },
  'force missile': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Whisper', 'Impyrium Psion (Gen-E)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Enlightened', 'Militaristic', 'Urban'],
    occupations: ['Adept', 'Soldier', 'Agent'],
    keywords: 'force missile, kinetic dart, homing projectile, unerring strike, force bolt, vector dart, kinetic tracking dart',
    negative_keywords: 'missed spray, inaccurate scatter, heavy ballistic artillery, physical arrow'
  },
  'force shield': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Janissary (Gen-E)', 'Whisper'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Enlightened', 'Militaristic', 'Urban'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'force shield, reaction parry, hard-light buckler, impact deflection, kinetic intercept, instantaneous shield',
    negative_keywords: 'slow parry, heavy tower shield, encumbered defense'
  },
  'force wave': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Risakin (Giant Folk)', 'Janissary (Gen-E)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template'],
    origins: ['Militaristic', 'Enlightened', 'Hostile'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'force wave, kinetic shockwave, telekinetic repulse, crowd clearing push, concussive wave, mass knockdown',
    negative_keywords: 'pinpoint needle, single target precision, gentle nudge'
  },
  'force weapon': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Janissary (Gen-E)', 'Draconian (Scaled Aeld)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Military Faction Template', 'Dracon Dynasty'],
    origins: ['Militaristic', 'Enlightened', 'Urban'],
    occupations: ['Soldier', 'Adept', 'Scout'],
    keywords: 'force weapon, hard-light blade, kinetic edge, psionic weapon, energy sword, vector spear, unyielding edge',
    negative_keywords: 'blunt club, rusted iron, dull machete, projectile slug'
  },
  'nudge': {
    species: ['Celestine (Alterian)', 'Whisper', 'Sigal', 'Human (Base)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Incorporated Planetary Syndication (The Syndicate)'],
    origins: ['Enlightened', 'Urban', 'Leisure'],
    occupations: ['Adept', 'Agent', 'Entertainer', 'Scout'],
    keywords: 'nudge, minor telekinesis, sleight of force, invisible push, small vector flick, subtle manipulation',
    negative_keywords: 'massive explosion, crushing hydraulic weight, earth shattering'
  },
  'telekinesis': {
    species: ['Celestine (Alterian)', 'Eidolon (Aetherion Specialist)', 'Whisper', 'Impyrium Psion (Gen-E)'],
    factions: ['The Alterian Enclave', 'The Ascendancy', 'Technological Faction Template'],
    origins: ['Enlightened', 'Research', 'Urban'],
    occupations: ['Adept', 'Specialist', 'Scholar', 'Soldier'],
    keywords: 'telekinesis, psychokinesis, mass levitation, remote manipulation, telekinetic flight, object hurling, kinetic grasp',
    negative_keywords: 'physical manual labor, rope and pulley, heavy lifting harness'
  },

  // --- ENERGY (ELEMENTAL): Plasma, Fire, Lightning, Radiant ---
  'analyze energy': {
    species: ['Draconian (Scaled Aeld)', 'Cyberform Human', 'Intellect Construct (Pure AI)', 'Celestine (Alterian)'],
    factions: ['The Alterian Enclave', 'Technological Faction Template', 'Dracon Dynasty'],
    origins: ['Research', 'Industrial', 'Enlightened'],
    occupations: ['Scholar', 'Specialist', 'Builder'],
    keywords: 'analyze energy, radiation spectrometer, thermal scan, plasma analysis, electromagnetic reading, energy signature',
    negative_keywords: 'blind guess, uncalibrated instrument, dark matter'
  },
  'barrier': {
    species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Golem (Arcane Construct)', 'Impyrium Regi (Gen-E)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Industrial', 'Hostile'],
    occupations: ['Soldier', 'Builder', 'Adept'],
    keywords: 'barrier, elemental wall, flaming wall, electrified fence, thermal curtain, area denial, hazard perimeter',
    negative_keywords: 'passable mist, gentle gentle gate, unheated stone'
  },
  'blast': {
    species: ['Draconian (Scaled Aeld)', 'Draconic Human', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Industrial', 'Hostile'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'blast, plasma shot, fire blast, lightning bolt, single target devastation, thermal incinerator, concentrated energy',
    negative_keywords: 'non-lethal stun, stealth dart, peaceful dialogue'
  },
  'bolt': {
    species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)', 'Cyberform Human'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Industrial', 'Hostile'],
    occupations: ['Soldier', 'Adept', 'Scout'],
    keywords: 'bolt, line strike, piercing lightning, linear plasma beam, laser bore, penetrating ray, coherent beam',
    negative_keywords: 'curved arc, wide cloud, gentle illumination'
  },
  'burst': {
    species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Risakin (Giant Folk)', 'Impyrium Regi (Gen-E)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Hostile', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'burst, explosive detonation, radial plasma nova, concussive fireburst, shockwave radius, wide blast, thermal eruption',
    negative_keywords: 'single point acupuncture, silent assassination, stealth probe'
  },
  'cloud': {
    species: ['Draconian (Scaled Aeld)', 'Eakren (Corrupted Aberration)', 'Rautha Human', 'Janissary (Gen-E)'],
    factions: ['Dracon Dynasty', 'The Outworlds', 'Military Faction Template'],
    origins: ['Hostile', 'Industrial', 'Colony'],
    occupations: ['Soldier', 'Specialist', 'Adept'],
    keywords: 'cloud, persistent thermal fog, burning plasma cloud, smoke obscuration, mobile hazard, choking heat, area ignition',
    negative_keywords: 'clear visibility, air purifier, vacuum cleanroom'
  },
  'cone': {
    species: ['Draconian (Scaled Aeld)', 'Draconic Human', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Hostile', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Scout'],
    keywords: 'cone, breath weapon, flamethrower arc, frontal sweep, arc lightning spray, widespread incineration, dragon breath',
    negative_keywords: 'pinpoint sniper, rear defense, non-violent suppression'
  },
  'lights': {
    species: ['Celestine (Alterian)', 'Fey (Base)', 'Ila (Progenitor Archon)', 'Whisper'],
    factions: ['The Alterian Enclave', 'Elven Providence', 'Interstellar Diplomats Faction Template'],
    origins: ['Enlightened', 'Leisure', 'Colony'],
    occupations: ['Adept', 'Entertainer', 'Scholar', 'Scout'],
    keywords: 'lights, dancing globes, luminous orbs, ambient illumination, radiant beacon, dark dispeller, festive glow',
    negative_keywords: 'pitch blackness, shadow veil, flashbang blinding'
  },
  'spark': {
    species: ['Cyberform Human', 'Draconian (Scaled Aeld)', 'Dwerg Human', 'Human (Base)'],
    factions: ['The Mekan Collective', 'Dracon Dynasty', 'Technological Faction Template'],
    origins: ['Industrial', 'Colony', 'Urban'],
    occupations: ['Builder', 'Specialist', 'Adept', 'Drifter'],
    keywords: 'spark, electrical discharge, fire starter, ignition arc, micro capacitor, campfire kindle, static zap',
    negative_keywords: 'megaton blast, flood, freezing blizzard'
  },
  'spray': {
    species: ['Draconian (Scaled Aeld)', 'Janissary (Gen-E)', 'Impyrium Regi (Gen-E)', 'Draconic Human'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Industrial', 'Hostile'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'spray, wide arc discharge, sweeping plasma spray, close quarters ignition, suppressing fire, multi-target burn',
    negative_keywords: 'distant sniper, single target focus, gentle warmth'
  },
  'storm': {
    species: ['Draconian (Scaled Aeld)', 'Impyrium Regi (Gen-E)', 'Janissary (Gen-E)', 'Risakin (Giant Folk)'],
    factions: ['Dracon Dynasty', 'Radiant Impyrium', 'Military Faction Template'],
    origins: ['Militaristic', 'Hostile', 'Colony'],
    occupations: ['Soldier', 'Adept', 'Specialist'],
    keywords: 'storm, lightning tempest, plasma storm, hurricane ionization, atmospheric catastrophe, sustained fury, scorched tempest',
    negative_keywords: 'mild breeze, clear sky, peaceful lullaby'
  },
  'sunburst': {
    species: ['Impyrium Regi (Gen-E)', 'Celestine (Alterian)', 'Draconian (Scaled Aeld)', 'Ila (Progenitor Archon)'],
    factions: ['Radiant Impyrium', 'The Alterian Enclave', 'Elven Providence'],
    origins: ['Enlightened', 'Militaristic', 'Research'],
    occupations: ['Adept', 'Soldier', 'Scholar'],
    keywords: 'sunburst, solar radiance, blinding daylight, undead bane, radiant flash, thermonuclear flare, blinding nova, solar strike',
    negative_keywords: 'pitch darkness, shadowy deceit, nocturnal stealth, void rot'
  }
};

/**
 * Universal Sub-discipline / Category fallback mapping for remaining invocations
 */
export function getDetailedRecommendations(id, name, discipline, description, classification) {
  const normId = id.toLowerCase().replace(/^invocation-/, '');
  const normName = name.toLowerCase().trim();

  // 1. Direct specific dictionary hit
  if (INVOCATION_SUBGROUPS[normId] || INVOCATION_SUBGROUPS[normName]) {
    return INVOCATION_SUBGROUPS[normId] || INVOCATION_SUBGROUPS[normName];
  }

  // 2. Composite / Hybrid Invocations
  if (normId.includes('composite-temporal-stasis') || normName.includes('temporal stasis')) {
    return {
      species: ['Ila (Progenitor Archon)', 'Whisper', 'Celestine (Alterian)', 'Varen (Gatekeeper)'],
      factions: ['The Ascendancy', 'The Alterian Enclave', 'Kovian Tribunal'],
      origins: ['Research', 'Enlightened', 'Spacer'],
      occupations: ['Adept', 'Scholar', 'Specialist'],
      keywords: 'temporal stasis, time freeze, preservation bubble, chronological lock, entropic halt, dimensional suspension, absolute stasis',
      negative_keywords: 'rushed haste, rapid fire, kinetic burst, unstable chaos'
    };
  }
  if (normId.includes('composite-accelerated-decay') || normName.includes('accelerated decay')) {
    return {
      species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Eakren (Corrupted Aberration)', 'Whisper'],
      factions: ['The Outworlds', 'Religious Cult Faction Template', 'Criminal Faction Template'],
      origins: ['Hostile', 'Spacer', 'Industrial'],
      occupations: ['Adept', 'Criminal', 'Drifter'],
      keywords: 'chrono-entropy, hyper-decay, rapid aging, spatial corrosion, void acceleration, structural collapse, localized rot',
      negative_keywords: 'youthful restoration, permanent preservation, fresh creation'
    };
  }
  if (normId.includes('composite-construct-intelligence') || normName.includes('construct intelligence')) {
    return {
      species: ['Intellect Construct (Pure AI)', 'Biomechanical Synthetic', 'Mekan (Assimilation Unit)', 'Cyberform Human'],
      factions: ['The Mekan Collective', 'Technological Faction Template', 'Artificial Life Faction Template'],
      origins: ['Research', 'Industrial', 'Urban'],
      occupations: ['Builder', 'Specialist', 'Scholar'],
      keywords: 'technomancy, synthetic sapience, machine spirit, cyber cognition, matrix awakening, energy infusion, AI animism',
      negative_keywords: 'feral primal, biological purity, anti-tech, stone age'
    };
  }
  if (normId.includes('composite-machine-spirit') || normName.includes('machine spirit')) {
    return {
      species: ['Cyberform Human', 'Mekan (Assimilation Unit)', 'Intellect Construct (Pure AI)', 'Celestine (Alterian)'],
      factions: ['The Mekan Collective', 'Incorporated Planetary Syndication (The Syndicate)', 'Technological Faction Template'],
      origins: ['Industrial', 'Urban', 'Research'],
      occupations: ['Specialist', 'Builder', 'Agent'],
      keywords: 'neural jack, machine interface, cyber communion, datastream communion, electronic control, technopathic link, mainframe whisper',
      negative_keywords: 'low tech wasteland, illiterate nomad, organic exclusive'
    };
  }
  if (normId.includes('composite-living-spell') || normName.includes('living spell')) {
    return {
      species: ['Golem (Arcane Construct)', 'Celestine (Alterian)', 'Draconian (Scaled Aeld)', 'Biomechanical Synthetic'],
      factions: ['The Alterian Enclave', 'Dracon Dynasty', 'Radiant Impyrium'],
      origins: ['Enlightened', 'Research', 'Industrial'],
      occupations: ['Adept', 'Builder', 'Scholar'],
      keywords: 'living spell, arcane homunculus, matter energy fusion, autonomous construct, magical elemental, animated plasma, spell organism',
      negative_keywords: 'fragile mortal, organic infection, mundane metal'
    };
  }
  if (normId.includes('composite-plasma-forging') || normName.includes('plasma forging')) {
    return {
      species: ['Draconian (Scaled Aeld)', 'Dwerg Human', 'Cyberform Human', 'Janissary (Gen-E)'],
      factions: ['Dracon Dynasty', 'The Entari Combine', 'Military Faction Template'],
      origins: ['Industrial', 'Militaristic', 'Colony'],
      occupations: ['Builder', 'Soldier', 'Specialist'],
      keywords: 'plasma forge, thermic crafting, molten alloy, energized edge, superheated armor, forge magi, plasma smithing',
      negative_keywords: 'ice cryo, delicate silk, fragile pottery, organic tissue'
    };
  }
  if (normId.includes('composite-flesh-crafting') || normName.includes('flesh crafting')) {
    return {
      species: ['Eakren (Corrupted Aberration)', 'Biomechanical Synthetic', 'Janissary (Gen-E)', 'Doppelganger (Shifter)'],
      factions: ['Genetic Engineering Faction Template', 'The Outworlds', 'Supernatural Faction Template'],
      origins: ['Hostile', 'Research', 'Industrial'],
      occupations: ['Specialist', 'Adept', 'Criminal'],
      keywords: 'flesh sculpting, biomancy, biological graft, anatomical mutation, marrow forging, cellular carving, living graft',
      negative_keywords: 'pure synthetic, clean cleanroom, natural perfection, inorganic metal'
    };
  }
  if (normId.includes('composite-life-transfer') || normName.includes('life transfer')) {
    return {
      species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Celestine (Alterian)', 'Rautha Human'],
      factions: ['The Outworlds', 'The Alterian Enclave', 'Religious Cult Faction Template'],
      origins: ['Hostile', 'Enlightened', 'Colony'],
      occupations: ['Adept', 'Criminal', 'Specialist'],
      keywords: 'vitality drain, blood transfer, metabolic siphon, necrotic heal, life tether, sacrificial mending, siphon vitality',
      negative_keywords: 'mechanical repair, robotic reboot, battery recharge'
    };
  }
  if (normId.includes('composite-shadow-step-assault') || normName.includes('shadow step assault')) {
    return {
      species: ['Tenen (Sha’nor Spectral)', 'Whisper', 'Changeling (Doppelganger Hybrid)', 'Fey (Base)'],
      factions: ['Incorporated Planetary Syndication (The Syndicate)', 'The Outworlds', 'Criminal Faction Template'],
      origins: ['Urban', 'Hostile', 'Spacer'],
      occupations: ['Agent', 'Scout', 'Criminal'],
      keywords: 'shadow step, blink strike, umbral teleport, ambush strike, phantom phase, darkness transit, strike from shadows',
      negative_keywords: 'heavy frontline shield, loud trumpet, high noon parade'
    };
  }
  if (normId.includes('composite-labyrinth') || normName.includes('spatial labyrinth')) {
    return {
      species: ['Whisper', 'Varen (Gatekeeper)', 'Ila (Progenitor Archon)', 'Celestine (Alterian)'],
      factions: ['The Ascendancy', 'The Alterian Enclave', 'Elven Providence'],
      origins: ['Enlightened', 'Research', 'Spacer'],
      occupations: ['Adept', 'Scholar', 'Agent'],
      keywords: 'non-euclidean maze, spatial loop, mirror labyrinth, dimensional trap, endless hallway, reality puzzle, folded corridors',
      negative_keywords: 'straight corridor, open plain, simple direct charge'
    };
  }

  // 3. DIMENSION: Teleportation vs Summoning
  if (discipline === 'Dimension') {
    const isSummoning = (classification || '').toLowerCase().includes('summoning') || 
      ['banishment', 'conjure-sustenance', 'create-object', 'find-familiar', 'haste', 'spatial-control', 'summon-creature', 'web'].some(k => normId.includes(k));
    
    if (isSummoning) {
      return {
        species: ['Whisper', 'Fey (Base)', 'Ila (Progenitor Archon)', 'Sigal', 'Celestine (Alterian)'],
        factions: ['Elven Providence', 'Supernatural Faction Template', 'The Alterian Enclave', 'Alien Faction Template'],
        origins: ['Enlightened', 'Spacer', 'Hostile', 'Agricultural'],
        occupations: ['Adept', 'Scholar', 'Drifter', 'Citizen'],
        keywords: `${normName}, planar binding, minion summoning, temporal acceleration, dimensional tether, creature conjuration, banishment, extradimensional fabrication`,
        negative_keywords: 'pure mundane, assembly line manufacturing, heavy cybernetics, terrestrial isolation'
      };
    } else {
      // Teleportation / Spatial Transit
      return {
        species: ['Varen (Gatekeeper)', 'Whisper', 'Eidolon (Aetherion Specialist)', 'Celestine (Alterian)', 'Mobula'],
        factions: ['The Ascendancy', 'The Alterian Enclave', 'Space Exploration Faction Template', 'Coalition of Independent Worlds'],
        origins: ['Spacer', 'Research', 'Enlightened', 'Colony'],
        occupations: ['Scout', 'Adept', 'Agent', 'Drifter'],
        keywords: `${normName}, teleportation, spatial rift, wormhole transit, dimensional gate, pocket sanctuary, ethereal phase, coordinate jump, slipstream, fold space, blink transit`,
        negative_keywords: 'anchored bunker, heavy sedentary, slow trench warfare, crude ballistics, terrestrial confinement'
      };
    }
  }

  // 4. MENTAL: Sensory vs Projection
  if (discipline === 'Mental') {
    const isSensory = (classification || '').toLowerCase().includes('sense') ||
      ['acute-senses', 'all-around-sight', 'analyze-psyche', 'comprehension', 'contact', 'detect-thoughts', 'detection', 'mind-probe', 'scrying', 'super-sense', 'visions'].some(k => normId.includes(k));

    if (isSensory) {
      return {
        species: ['Celestine (Alterian)', 'Whisper', 'Sigal', 'Intellect Construct (Pure AI)', 'Doppelganger (Shifter)'],
        factions: ['The Alterian Enclave', 'The Ascendancy', 'Incorporated Planetary Syndication (The Syndicate)', 'Interstellar Diplomats Faction Template'],
        origins: ['Research', 'Enlightened', 'Urban', 'Spacer'],
        occupations: ['Agent', 'Scholar', 'Representative', 'Scout'],
        keywords: `${normName}, telepathy, mind probe, remote viewing, precognition, sensory expansion, empathy scan, universal translation, cognitive recon, aura detection`,
        negative_keywords: 'mindless brute, crude demolition, blind aggression, anti-intellectual, loud bludgeoning'
      };
    } else {
      // Projection / Psionics
      return {
        species: ['Celestine (Alterian)', 'Whisper', "Sha'nor", 'Tenen (Sha’nor Spectral)', 'Impyrium Psion (Gen-E)'],
        factions: ['The Ascendancy', 'The Alterian Enclave', 'Incorporated Planetary Syndication (The Syndicate)', 'Kovian Tribunal'],
        origins: ['Urban', 'Enlightened', 'Research', 'Militaristic'],
        occupations: ['Adept', 'Agent', 'Representative', 'Specialist'],
        keywords: `${normName}, psionic compulsion, synaptic overload, telepathic command, neural lock, psychic crush, mind barrier, emotional sway, possession, dream walk, psychic paralysis`,
        negative_keywords: 'physical brawler, crude mechanic, uneducated drifter, null magic field, brute force'
      };
    }
  }

  // 5. MATTER: Enhancement vs Transmutation
  if (discipline === 'Matter') {
    const isTransmutation = (classification || '').toLowerCase().includes('transmutation') ||
      ['analyze-structure', 'enlarge', 'grafting', 'morph', 'mutation', 'petrification', 'reduce', 'versatile-item'].some(k => normId.includes(k));

    if (isTransmutation) {
      return {
        species: ['Biomechanical Synthetic', 'Doppelganger (Shifter)', 'Eakren (Corrupted Aberration)', 'Janissary (Gen-E)', 'Dwerg Human'],
        factions: ['Genetic Engineering Faction Template', 'The Mekan Collective', 'Dracon Dynasty', 'Technological Faction Template'],
        origins: ['Research', 'Industrial', 'Hostile', 'Colony'],
        occupations: ['Builder', 'Specialist', 'Adept', 'Scholar'],
        keywords: `${normName}, transmutation, bio-grafting, shapeshifting, cellular mutation, size alteration, molecular restructuring, petrification, anatomical morph, material transmutation`,
        negative_keywords: 'static purist, pure energy, unalterable dogma, ethereal incorporeal'
      };
    } else {
      // Enhancement / Density / Armor
      return {
        species: ['Golem (Arcane Construct)', 'Dwerg Human', 'Risakin (Giant Folk)', 'Biomechanical Synthetic', 'Mekan (Assimilation Unit)'],
        factions: ['The Mekan Collective', 'Technological Faction Template', 'Coalition of Independent Worlds', 'Military Faction Template'],
        origins: ['Industrial', 'Hostile', 'Colony', 'Agricultural'],
        occupations: ['Soldier', 'Builder', 'Specialist', 'Adept'],
        keywords: `${normName}, molecular hardening, density control, stoneskin, physical reinforcement, gravimetric flight, kinetic anchor, attribute enhancement, material fortification, structural reinforcement`,
        negative_keywords: 'ethereal spirit, fragile illusion, mental only, pure light, non-physical'
      };
    }
  }

  // 6. ILLUSION: Phantasm vs Shadow
  if (discipline === 'Illusion') {
    const isShadow = (classification || '').toLowerCase().includes('shadow') ||
      ['darkness', 'light-manipulation', 'shadow-assault', 'shadow-conjuring', 'shadow-weapon'].some(k => normId.includes(k));

    if (isShadow) {
      return {
        species: ['Tenen (Sha’nor Spectral)', "Sha'nor", 'Whisper', 'Rautha Human', 'Nocturne (Kovian)'],
        factions: ['The Outworlds', 'Incorporated Planetary Syndication (The Syndicate)', 'Supernatural Faction Template', 'Criminal Faction Template'],
        origins: ['Hostile', 'Urban', 'Spacer', 'Enlightened'],
        occupations: ['Adept', 'Agent', 'Criminal', 'Scout'],
        keywords: `${normName}, umbral shadow, shadow weapon, absolute darkness, quasi-real matter, cold chill, shadow step, nether shroud, void strike, shadow conjuring`,
        negative_keywords: 'solar radiance, high noon flare, sterile laboratory, holy temple, open honesty'
      };
    } else {
      // Phantasm / Light Glamer
      return {
        species: ['Whisper', 'Changeling (Doppelganger Hybrid)', 'Sigal', 'Fey (Base)', 'Doppelganger (Shifter)'],
        factions: ['Elven Providence', 'Incorporated Planetary Syndication (The Syndicate)', 'The Alterian Enclave', 'Criminal Faction Template'],
        origins: ['Leisure', 'Urban', 'Enlightened', 'Colony'],
        occupations: ['Entertainer', 'Agent', 'Criminal', 'Representative'],
        keywords: `${normName}, light bending, invisibility, visual glamer, holographic decoy, sensory deception, mirage, optical distortion, social facade, photic blast`,
        negative_keywords: 'heavy bludgeoning, loud demolition, blunt honesty, stationary turret, brute assault'
      };
    }
  }

  // Fallback default
  return {
    species: ['Celestine (Alterian)', 'Whisper', 'Human (Base)'],
    factions: ['The Alterian Enclave', 'The Ascendancy'],
    origins: ['Enlightened', 'Research'],
    occupations: ['Adept', 'Scholar'],
    keywords: `${normName}, metaphysical resonance, arcana, focus`,
    negative_keywords: 'null magic, crude brute'
  };
}

export function applyDetailedInvocationRecommendations() {
  if (!fs.existsSync(invocationsDir)) {
    console.error(`Invocations directory not found at: ${invocationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(invocationsDir).filter(f => f.endsWith('.md')).sort();
  console.log(`Applying detailed canonical recommendations to ${files.length} invocation files in ${invocationsDir}...`);

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(invocationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    const data = parsed.data || {};
    const id = data.id || file.replace(/\.md$/, '');
    const name = data.name || id;
    const discipline = data.discipline || data.requisite_disciplines || 'Mental';
    const description = data.description || '';
    
    // Extract classification from markdown body if present
    const classMatch = parsed.content.match(/Classification:\s*(.*?)\r?\n/);
    const classification = classMatch ? classMatch[1].trim() : '';

    const recs = getDetailedRecommendations(id, name, discipline, description, classification);

    data.recommended_species = recs.species;
    data.recommended_factions = recs.factions;
    data.recommended_origins = recs.origins;
    data.recommended_occupations = recs.occupations;
    data.keywords = recs.keywords;
    data.negative_keywords = recs.negative_keywords;

    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    updatedCount++;
  }

  console.log(`\nSuccessfully populated ${updatedCount} invocation markdown files with detailed canonical recommendations!`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyDetailedInvocationRecommendations();
}
