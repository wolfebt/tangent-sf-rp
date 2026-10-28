import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OP_PARENT = '1.00 OPERATOR CORE RULES (SOURCE OF TRUTH)';
const ARCH_PARENT = '5.00 ARCHITECT & MODULAR MATRICES (SOURCE OF TRUTH)';

const PREFERRED_OP_MASTER_ORDER = [
  '1.00 INTRODUCTION.md',
  '1.01 CHARACTER CREATION.md',
  '1.02 ARCHETYPES.md',
  '1.03 SPECIES.md',
  '1.04 FACTIONS.md',
  '1.05 ORIGINS.md',
  '1.06 OCCUPATIONS.md',
  '1.07 SKILLS.md',
  '1.08 FEATURES.md',
  '1.09 HINDRANCES.md',
  '1.10 SCALING.md',
  '2.00 ECONOMATRIX.md',
  '3.00 COMBAT.md',
  '4.00 METAPHYSICS.md'
];

const PREFERRED_ARCH_MASTER_ORDER = [
  '02 ECONOMY AND WEALTH.md',
  '99. MODULAR CHARACTER MATRIX.md',
  '99. MODULAR SPECIES MATRIX.md',
  '99. MODULAR FACTION MATRIX.md',
  '99. MODULAR COMPANION MATRIX.md',
  '99. MODULAR PLANETARY MATRIX.md',
  '99. TECHNOLOGY.md',
  '99. METAPHYSICS.md'
];

const SUBFOLDER_TO_MASTER_ID = {
  // Operator subfolders
  'operator/character_creation': 'doc-operator-1-01-character-creation',
  'operator/archetypes': 'doc-operator-1-02-archetypes',
  'operator/species': 'doc-operator-1-03-species',
  'operator/factions': 'doc-operator-1-04-factions',
  'operator/origins': 'doc-operator-1-05-origins',
  'operator/occupations': 'doc-operator-1-06-occupations',
  'operator/skills': 'doc-operator-1-07-skills',
  'operator/features': 'doc-operator-1-08-features',
  'operator/economatrix': 'doc-operator-2-00-economatrix',
  'operator/combat': 'doc-operator-3-00-combat',
  'operator/metaphysics': 'doc-operator-4-00-metaphysics',
  // Architect subfolders
  'architect/economy': 'doc-architect-02-economy-and-wealth',
  'architect/characters': 'doc-architect-99-modular-character-matrix',
  'architect/species': 'doc-architect-99-modular-species-matrix',
  'architect/companions': 'doc-architect-99-modular-companion-matrix',
  'architect/planetary': 'doc-architect-99-modular-planetary-matrix',
  'architect/technology': 'doc-architect-99-technology',
  'architect/metaphysics': 'doc-architect-99-metaphysics'
};

const CUSTOM_SUBARTICLE_ORDER = [
  // 1.01 Character Creation
  '1.01.Attributes.md',
  '1.01.Perception.md',
  '1.01.VitalityHealthStructure.md',
  '1.01.Karma.md',
  '1.01.Movement.md',
  '1.01.RestAndDying.md',
  '1.01.Experience.md',
  // 1.02 Archetypes
  '1.02.Sentinels.md',
  '1.02.Operatives.md',
  '1.02.Visionaries.md',
  '1.02.Savants.md',
  '1.02.SignatureFeatures.md',
  // 1.03 Species (Exact Master Table Order & Baseline Entries First)
  '1.03.Aeld.md',
  '1.03.Aeld.Alterian.md',
  '1.03.Aeld.Doppelganger.md',
  '1.03.Aeld.Draconian.md',
  '1.03.Aeld.Kovian.md',
  '1.03.Aeld.Vajar.md',
  '1.03.Asi.md',
  '1.03.Asi.Fey.md',
  '1.03.Asi.Ferren.md',
  '1.03.Asi.Frellin.md',
  '1.03.Asi.Koban.md',
  '1.03.Asi.Sigal.md',
  '1.03.Asi.Tozen.md',
  '1.03.Asi.Whisper.md',
  '1.03.Asi.Wildling.md',
  '1.03.Aulurans.md',
  '1.03.Aulurans.Dar.md',
  '1.03.Aulurans.Graa.md',
  '1.03.Aulurans.Koda.md',
  '1.03.Aulurans.Prokos.md',
  '1.03.AwakenedAnimal.md',
  '1.03.Caprian.md',
  '1.03.Humans.md',
  '1.03.Humans.Base.md',
  '1.03.Humans.Aquarian.md',
  '1.03.Humans.Argynt.md',
  '1.03.Humans.BDren.md',
  '1.03.Humans.Brae.md',
  '1.03.Humans.Changeling.md',
  '1.03.Humans.Cyberform.md',
  '1.03.Humans.Danai.md',
  '1.03.Humans.Draconic.md',
  '1.03.Humans.Dwerg.md',
  '1.03.Humans.GenE.md',
  '1.03.Humans.Aquatican.md',
  '1.03.Humans.Chimera.md',
  '1.03.Humans.Davae.md',
  '1.03.Humans.Digon.md',
  '1.03.Humans.ImpyriumPsion.md',
  '1.03.Humans.ImpyriumRegi.md',
  '1.03.Humans.Janissary.md',
  '1.03.Humans.Kheen.md',
  '1.03.Humans.Lin.md',
  '1.03.Humans.Nian.md',
  '1.03.Humans.Premian.md',
  '1.03.Humans.Rautha.md',
  '1.03.Humans.Risakin.md',
  '1.03.Humans.Varen.md',
  '1.03.Jorni.md',
  '1.03.Kitin.md',
  '1.03.Kitin.Murex.md',
  '1.03.Kitin.Maantene.md',
  '1.03.Kitin.Manelli.md',
  '1.03.Kitin.Rakne.md',
  '1.03.Kitin.Riezen.md',
  '1.03.Kitin.Syndess.md',
  '1.03.Kannid.md',
  '1.03.Kizin.md',
  '1.03.Kongi.md',
  '1.03.Mobula.md',
  '1.03.Mondi.md',
  '1.03.Orll.md',
  '1.03.Orll.Base.md',
  '1.03.Orll.GraOr.md',
  '1.03.Plasm.md',
  '1.03.Praeti.md',
  '1.03.Progenitors.md',
  '1.03.Progenitors.Ila.md',
  '1.03.Progenitors.UNonn.md',
  '1.03.Qeric.md',
  '1.03.Sefalin.md',
  '1.03.ShaNor.md',
  '1.03.ShaNor.Base.md',
  '1.03.ShaNor.Tenen.md',
  '1.03.ShaNor.Eakren.md',
  '1.03.Synthetics.md',
  '1.03.Synthetics.Android.md',
  '1.03.Synthetics.Scraps.md',
  '1.03.Synthetics.Skins.md',
  '1.03.Synthetics.Biomechanical.md',
  '1.03.Synthetics.Eidolon.md',
  '1.03.Synthetics.Aetherion.md',
  '1.03.Synthetics.Golem.md',
  '1.03.Synthetics.IntellectConstruct.md',
  '1.03.Synthetics.Mekan.md',
  '1.03.Synthetics.Protocol.md',
  '1.03.Synthetics.SentientMachine.md',
  '1.03.Synthetics.Shell.md',
  '1.03.Synthetics.Swarm.md',
  '1.03.Thorn.md',
  '1.03.Truldan.md',
  '1.03.Vassoth.md',
  '1.03.Weti.md',
  // 1.04 Factions (Exact Directory Index Order from 1.04 FACTIONS.md)
  '1.04.Major.DraconDynasty.md',
  '1.04.Major.Syndicate.md',
  '1.04.Major.EntariCombine.md',
  '1.04.Major.Coalition.md',
  '1.04.Major.Outworlds.md',
  '1.04.Major.Ascendancy.md',
  '1.04.Major.MekanCollective.md',
  '1.04.Major.AuluranClans.md',
  '1.04.Major.KitinCollective.md',
  '1.04.AeldProvidence.md',
  '1.04.AeldProvidence.AlterianEnclave.md',
  '1.04.AeldProvidence.SilvermoonVanguard.md',
  '1.04.AeldProvidence.DraconianOrder.md',
  '1.04.AeldProvidence.KovianTribunal.md',
  '1.04.AeldProvidence.VajarTribes.md',
  '1.04.Impyrium.Dominion.md',
  '1.04.Impyrium.Radiant.md',
  '1.04.Archetypal.Alien.md',
  '1.04.Archetypal.ArtificialLife.md',
  '1.04.Archetypal.Corporate.md',
  '1.04.Archetypal.Criminal.md',
  '1.04.Archetypal.CosmicJustice.md',
  '1.04.Archetypal.CosmicHorror.md',
  '1.04.Archetypal.Environmental.md',
  '1.04.Archetypal.GeneticEngineering.md',
  '1.04.Archetypal.HiveMind.md',
  '1.04.Archetypal.InterstellarDiplomats.md',
  '1.04.Archetypal.Mercenary.md',
  '1.04.Archetypal.Military.md',
  '1.04.Archetypal.Mutant.md',
  '1.04.Archetypal.Planetary.md',
  '1.04.Archetypal.Political.md',
  '1.04.Archetypal.PostApocalyptic.md',
  '1.04.Archetypal.Rebel.md',
  '1.04.Archetypal.ReligiousCult.md',
  '1.04.Archetypal.SentientIntelligence.md',
  '1.04.Archetypal.SpaceExploration.md',
  '1.04.Archetypal.SpacePirate.md',
  '1.04.Archetypal.SpaceReligion.md',
  '1.04.Archetypal.SpaceTourism.md',
  '1.04.Archetypal.Supernatural.md',
  '1.04.Archetypal.Technological.md',
  // 1.05 Origins
  '1.05.Agricultural.md',
  '1.05.Aquatic.md',
  '1.05.Colony.md',
  '1.05.Enlightened.md',
  '1.05.Hostile.md',
  '1.05.Industrial.md',
  '1.05.Leisure.md',
  '1.05.Militaristic.md',
  '1.05.Research.md',
  '1.05.Spacer.md',
  '1.05.Urban.md',
  // 1.06 Occupations
  '1.06.Adept.md',
  '1.06.Agent.md',
  '1.06.Builder.md',
  '1.06.Citizen.md',
  '1.06.Criminal.md',
  '1.06.Drifter.md',
  '1.06.Entertainer.md',
  '1.06.Merchant.md',
  '1.06.Representative.md',
  '1.06.Scholar.md',
  '1.06.Scout.md',
  '1.06.Soldier.md',
  '1.06.Specialist.md',
  // 1.07 Skills
  '1.07.Physical.md',
  '1.07.Mental.Core.md',
  '1.07.Mental.Knowledge.md',
  '1.07.Mental.Vocation.md',
  '1.07.Social.Expression.md',
  '1.07.Social.Manipulation.md',
  '1.07.Combat.md',
  '1.07.Metaphysics.md',
  '1.07.Mechanics.Learning.md',
  '1.07.Mechanics.SkillChecks.md',
  '1.07.Mechanics.SkillGroups.md',
  '1.07.Mechanics.SkillUse.md',
  '1.07.Mechanics.Specialization.md',
  '1.07.Mechanics.SynergyAndAdvantage.md',
  '1.07.Mechanics.TimeAndFocus.md',
  // 1.08 Features
  '1.08.AbilityFeatures.md',
  '1.08.SkillFeatures.md',
  '1.08.CombatFeatures.md',
  '1.08.DisciplineFeatures.md',
  '1.08.KarmaFeatures.md',
  '1.08.GeneralFeatures.md',
  '1.08.SpecialFeatures.md',
  // 2.00 Economatrix
  '2.00.Architecture.md',
  '2.00.Armor.md',
  '2.00.Augmentations.md',
  '2.00.Equipment.md',
  '2.00.Mecha.md',
  '2.00.WeaponModifications.md',
  // 3.00 Combat
  '3.00.Edge.md',
  '3.00.StatusEffects.md',
  '3.00.DamageAndLocations.md',
  '3.00.DamageTypes.md',
  '3.00.VehicularCombat.md',
  // 4.00 Metaphysics
  '4.00.Dimension.md',
  '4.00.Energy.md',
  '4.00.Entropy.md',
  '4.00.Illusion.md',
  '4.00.Matter.md',
  '4.00.Mental.md',
  // 02 Economy
  '02.Economy.UnifiedFieldTheory.md',
  '02.Economy.InterstellarTrade.md',
  // 99 Modular Character Matrix
  '99.Character.ModuleA.TierChassis.md',
  '99.Character.ModuleB.CompetencyRoles.md',
  '99.Character.ModuleC_E.BiologySoulLifepath.md',
  '99.Character.ModuleF_G.GenreAndVisuals.md',
  // 99 Modular Species Matrix
  '99.Species.ChassisAndMovement.md',
  '99.Species.TraitsAndDisadvantages.md',
  // 99 Modular Companion Matrix
  '99.Companion.FormPackages.md',
  '99.Companion.FunctionAndExamples.md',
  // 99 Modular Planetary Matrix
  '99.Planetary.AstrophysicsAndGeophysics.md',
  '99.Planetary.CivilizationAndEconomy.md',
  '99.Planetary.HazardsAndEncounters.md',
  // 99 Technology
  '99.Tech.Levels.md',
  '99.Tech.CivilizationDomains.md',
  '99.Tech.Weaponry.ForgeProtocol.md',
  '99.Tech.Weaponry.Catalog.md',
  '99.Tech.Armor.DesignAndCatalog.md',
  '99.Tech.Armor.EconomyAndExemplars.md',
  '99.Tech.Equipment.Framework.md',
  '99.Tech.Equipment.SystemsAndMastercrafting.md',
  '99.Tech.Augmentations.Cybernetic.md',
  '99.Tech.Augmentations.Biological.md',
  '99.Tech.Augmentations.Metaphysical.md',
  '99.Tech.Mecha.ForgeProtocol.md',
  '99.Tech.Mecha.ComponentsAndWeapons.md',
  '99.Tech.Mecha.AutomataAndGear.md',
  '99.Tech.Architecture.ForgeProtocol.md',
  '99.Tech.Architecture.ComponentCatalog.md',
  '99.Tech.Architecture.MobileAndVFT.md',
  '99.Tech.Architecture.ExamplesAndSkins.md',
  // 99 Metaphysics
  '99.Metaphysics.InvocationMatrix.md',
  '99.Metaphysics.MetaTechMatrix.md'
];

const ARCHETYPAL_FACTION_LABELS = {
  'Alien': '01. Alien',
  'ArtificialLife': '02. Artificial Life',
  'Corporate': '03. Corporate',
  'Criminal': '04. Criminal',
  'CosmicJustice': '05. Cosmic Justice',
  'CosmicHorror': '06. Cosmic Horror',
  'Environmental': '07. Environmental',
  'GeneticEngineering': '08. Genetic Engineering',
  'HiveMind': '09. Hive Mind',
  'InterstellarDiplomats': '10. Interstellar Diplomats',
  'Mercenary': '11. Mercenary',
  'Military': '12. Military',
  'Mutant': '13. Mutant',
  'Planetary': '14. Planetary',
  'Political': '15. Political',
  'PostApocalyptic': '16. Post-Apocalyptic',
  'Rebel': '17. Rebel',
  'ReligiousCult': '18. Religious Cult',
  'SentientIntelligence': '19. Sentient Intelligence',
  'SpaceExploration': '20. Space Exploration',
  'SpacePirate': '21. Space Pirate',
  'SpaceReligion': '22. Space Religion',
  'SpaceTourism': '23. Space Tourism',
  'Supernatural': '24. Supernatural',
  'Technological': '25. Technological'
};

const SPECIAL_TOKEN_LABELS = {
  'VitalityHealthStructure': 'Vitality, Health & Structure',
  'RestAndDying': 'Rest & Dying',
  'SignatureFeatures': 'Signature Features',
  'AwakenedAnimal': 'Awakened Animal',
  'Fey': 'Fey (Base)',
  'BDren': "B'Dren",
  'GenE': 'Gen-E (Base Engineered)',
  'ImpyriumPsion': 'Impyrium Psion',
  'ImpyriumRegi': 'Impyrium Regi',
  'Varen': 'Varen (Gatekeepers)',
  'Murex': 'Murex (Foundation Expression)',
  'Maantene': 'Maantene (Recon Expression)',
  'Manelli': 'Manelli (Cerebral Expression)',
  'Rakne': 'Rakne (Infiltration Expression)',
  'Riezen': 'Riezen (Divergent Swarm)',
  'Syndess': 'Syndess (Pilot Expression)',
  'GraOr': "Gra'Or",
  'UNonn': "U'Nonn",
  'ShaNor': "Sha'Nor",
  'IntellectConstruct': 'Intellect Construct',
  'SentientMachine': 'Sentient Machine',
  'AeldProvidence': 'Aeld Providence (The Factional Schisms)',
  'AlterianEnclave': '1. Alterian Enclave (Celestine)',
  'SilvermoonVanguard': '2. Silvermoon Vanguard (Doppelgangers)',
  'DraconianOrder': '3. Draconian Order',
  'KovianTribunal': '4. Kovian Tribunal (Nocturne)',
  'VajarTribes': '5. Vajar Tribes (Wilder)',
  'DraconDynasty': 'The Dracon Dynasty',
  'Syndicate': 'Incorporated Planetary Syndication (Syndicate)',
  'EntariCombine': 'The Entari Combine',
  'Coalition': 'Coalition of Independent Worlds',
  'Outworlds': 'Outworlds',
  'Ascendancy': 'Ascendancy',
  'MekanCollective': 'The Mekan Collective',
  'AuluranClans': 'Auluran Clans',
  'KitinCollective': 'Kitin Collective (The Star Hive)',
  'Dominion': 'Impyrium Dominion (The Shadow of the Sun)',
  'Radiant': 'Radiant Impyrium (The Enlightened Age)',
  'SkillChecks': 'Skill Checks',
  'SkillGroups': 'Skill Groups & Titles',
  'SkillUse': 'Skill Use',
  'SynergyAndAdvantage': 'Synergy & Advantage',
  'TimeAndFocus': 'Time & Focus',
  'AbilityFeatures': 'Ability Features',
  'CombatFeatures': 'Combat Features',
  'DisciplineFeatures': 'Discipline Features',
  'GeneralFeatures': 'General Features',
  'KarmaFeatures': 'Karma Features',
  'SkillFeatures': 'Skill Features',
  'SpecialFeatures': 'Special Features',
  'WeaponModifications': 'Weapon Modifications',
  'DamageAndLocations': 'Damage & Hit Locations',
  'DamageTypes': 'Damage Types',
  'StatusEffects': 'Status Effects',
  'VehicularCombat': 'Vehicular Combat',
  'InterstellarTrade': 'Interstellar Trade & Commerce',
  'UnifiedFieldTheory': 'Economic Unified Field Theory',
  'A_D': 'A – D',
  'E_L': 'E – L',
  'M_R': 'M – R',
  'S_Z': 'S – Z',
  'ModuleA': 'Module A',
  'ModuleB': 'Module B',
  'ModuleC_E': 'Modules C–E',
  'ModuleF_G': 'Modules F–G',
  'TierChassis': 'The Tier Chassis',
  'CompetencyRoles': 'Competency Roles & Matrices',
  'BiologySoulLifepath': 'Biology, Soul & Lifepath',
  'GenreAndVisuals': 'Genre & Visual Semiotics',
  'FormPackages': 'Form Packages (The Chassis)',
  'FunctionAndExamples': 'Function Packages & Examples',
  'InvocationMatrix': 'Invocation Matrix',
  'MetaTechMatrix': 'Meta-Tech Matrix',
  'AstrophysicsAndGeophysics': 'Astrophysics, Geophysics & Biosphere',
  'CivilizationAndEconomy': 'Civilization, Economy & Infrastructure',
  'HazardsAndEncounters': 'Hazards, Hooks & Encounter Tables',
  'ChassisAndMovement': 'Chassis Types, Size & Movement',
  'TraitsAndDisadvantages': 'Traits Catalog & Disadvantages',
  'CivilizationDomains': 'Civilization Aspects & Domains',
  'Levels': 'Technology Levels (TL 0–X)',
  'ForgeProtocol': 'Forge Protocol',
  'ComponentCatalog': 'Component Engineering Catalog',
  'MobileAndVFT': 'Mobile Structures & VFT',
  'ExamplesAndSkins': 'Examples, Cultural Skins & Economics',
  'DesignAndCatalog': 'Armor Design & Catalog',
  'EconomyAndExemplars': 'Armor Economy & Exemplars',
  'SystemsAndMastercrafting': 'Systems, Biotech & Mastercrafting',
  'ComponentsAndWeapons': 'Components, VFT & Weapons',
  'AutomataAndGear': 'Automata, Specialized Gear & Economics'
};

function humanizeToken(token) {
  if (!token) return '';
  if (SPECIAL_TOKEN_LABELS[token]) return SPECIAL_TOKEN_LABELS[token];
  return token
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, '–')
    .trim();
}

/**
 * Formats a clean, canonical human-readable title for any rule file.
 */
function formatArticleDisplayName(fileObj) {
  const cleanFileName = fileObj.fileName.replace(/\.md$/i, '').trim();
  const isRootMaster = fileObj.relBranch === 'operator' || fileObj.relBranch === 'architect';

  if (isRootMaster) {
    const formatted = cleanFileName
      .replace(/\s*\(\d+\)$/, '')
      .replace(/\s*\(work\)/i, '')
      .replace(/\.\s*\.+/, '. ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (fileObj.relBranch === 'architect') {
      return formatted.replace(/^(?:02|99\.?|\d+(?:\.\d+)*\.?)\s*[-—:]?\s*/i, '').trim();
    }
    return formatted;
  }

  // Subfolder file: e.g. "1.01.VitalityHealthStructure", "1.03.Aeld.Alterian", "99.Tech.Mecha.ForgeProtocol"
  const parts = cleanFileName.split('.');
  if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
    const numPrefix = `${parts[0]}.${parts[1]}`;
    if (numPrefix === '1.04' && parts[2] === 'Archetypal' && parts[3]) {
      const archLabel = ARCHETYPAL_FACTION_LABELS[parts[3]] || humanizeToken(parts[3]);
      return `1.04 Archetypal: ${archLabel}`;
    }
    const rest = parts.slice(2).map(humanizeToken);
    if (rest.length === 1) {
      if (fileObj.relBranch.startsWith('operator/species/')) {
        return `${numPrefix} ${rest[0]} (Lineage Overview)`;
      }
      return `${numPrefix} ${rest[0]}`;
    }
    if (rest.length === 2 && rest[1] === 'Base') {
      return `${numPrefix} ${rest[0]}: ${rest[0]} (Base)`;
    }
    return `${numPrefix} ${rest[0]}: ${rest.slice(1).join(' — ')}`;
  }

  if (parts.length >= 2 && (parts[0] === '02' || parts[0] === '99')) {
    const rest = parts.slice(1).map(humanizeToken);
    if (rest.length >= 3) {
      return `${rest[0]} (${rest[1]}): ${rest.slice(2).join(' — ')}`;
    }
    if (rest.length === 2) {
      return `${rest[0]}: ${rest[1]}`;
    }
    return rest.join(': ');
  }

  return cleanFileName;
}

/**
 * Builds canonical article ID from branch and filename.
 */
function makeArticleId(subfolderKey, fileName) {
  const cleanFileName = fileName.replace(/\.md$/i, '').trim();
  const rawSlug = cleanFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const normalizedSlug = rawSlug.replace(/-1$/, '');
  return `doc-${subfolderKey}-${normalizedSlug}`;
}

/**
 * Recursively scans directory and all subdirectories for markdown (.md) rule files.
 */
function scanRuleFiles(rulesDir) {
  const discovered = [];

  function traverse(currentDir, relBranch = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const subRel = relBranch ? `${relBranch}/${entry.name}` : entry.name;
        if (subRel.replace(/\\/g, '/').toLowerCase() === 'architect/archetypes') {
          continue;
        }
        traverse(fullPath, subRel);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith('.md') &&
        !entry.name.toLowerCase().endsWith('.bak') &&
        !entry.name.startsWith('.')
      ) {
        const normalizedRelBranch = relBranch.replace(/\\/g, '/');
        if (
          normalizedRelBranch.toLowerCase() === 'architect' &&
          entry.name.toLowerCase().includes('archetypes')
        ) {
          continue;
        }
        discovered.push({
          fullPath,
          fileName: entry.name,
          relBranch: normalizedRelBranch.toLowerCase(),
          relPath: `${normalizedRelBranch}/${entry.name}`
        });
      }
    }
  }

  traverse(rulesDir);
  return discovered;
}

/**
 * Determines hierarchical parent, masterDocId, category, perspective, and entry_type.
 */
function resolveHierarchyMetadata(fileObj, articleId) {
  const relBranch = (fileObj.relBranch || '').toLowerCase();
  const fileName = fileObj.fileName;
  const cleanFileName = fileName.replace(/\.md$/i, '').trim();
  const parts = cleanFileName.split('.');

  const isOp = relBranch === 'operator' || relBranch.startsWith('operator/');
  const isArch = relBranch === 'architect' || relBranch.startsWith('architect/');
  const subfolderKey = isOp ? 'operator' : isArch ? 'architect' : 'core';
  const rootParent = isOp ? OP_PARENT : isArch ? ARCH_PARENT : 'CORE RULES (SOURCE OF TRUTH)';
  const category = isOp ? 'operator_rule' : isArch ? 'architect_matrix' : 'core_rule';
  const perspective = isOp ? 'operator' : isArch ? 'architect' : 'both';

  // 1. Root Master Document
  if (relBranch === 'operator' || relBranch === 'architect') {
    return {
      parent: rootParent,
      masterDocId: articleId,
      isMasterDoc: true,
      category,
      perspective,
      entry_type: isOp ? 'Core Rulebook' : 'Architect Matrix',
      subfolderKey,
      domainTag: cleanFileName.toLowerCase()
    };
  }

  // Identify top-level subfolder under operator/ or architect/
  const branchSegments = relBranch.split('/');
  const topSubfolderKey = `${branchSegments[0]}/${branchSegments[1]}`;
  const masterDocId = SUBFOLDER_TO_MASTER_ID[topSubfolderKey] || rootParent;

  // 2. Special 2-level nesting in operator/species/<lineage>
  if (relBranch.startsWith('operator/species/')) {
    const isLineageOverview = parts.length === 3;

    if (isLineageOverview) {
      return {
        parent: masterDocId,
        masterDocId,
        isMasterDoc: false,
        category,
        perspective,
        entry_type: 'Species Lineage',
        subfolderKey,
        domainTag: 'species'
      };
    }

    // Subspecies / Baseline species inside a lineage folder: link to its lineage overview article ID
    const lineageToken = parts[2];
    const lineageFileName = `1.03.${lineageToken}.md`;
    const lineageParentId = makeArticleId('operator', lineageFileName);

    return {
      parent: lineageParentId,
      masterDocId,
      isMasterDoc: false,
      category,
      perspective,
      entry_type: parts[3]?.toLowerCase() === 'base' ? 'Baseline Species' : 'Species Variant',
      subfolderKey,
      domainTag: 'species'
    };
  }

  // 3. Special 2-level nesting in operator/factions for AeldProvidence Enclaves
  if (relBranch === 'operator/factions') {
    if (cleanFileName.startsWith('1.04.AeldProvidence.') && parts.length === 4) {
      const aeldParentId = makeArticleId('operator', '1.04.AeldProvidence.md');
      return {
        parent: aeldParentId,
        masterDocId,
        isMasterDoc: false,
        category,
        perspective,
        entry_type: 'Primary Faction Enclave',
        subfolderKey,
        domainTag: 'factions'
      };
    }

    const isMajorOrImpyriumOrAeld =
      cleanFileName.startsWith('1.04.Major.') ||
      cleanFileName.startsWith('1.04.Impyrium.') ||
      cleanFileName === '1.04.AeldProvidence';
    return {
      parent: masterDocId,
      masterDocId,
      isMasterDoc: false,
      category,
      perspective,
      entry_type: isMajorOrImpyriumOrAeld ? 'Primary Faction' : 'Generic Faction Template',
      subfolderKey,
      domainTag: 'factions'
    };
  }

  // 4. All other subfolder modular documents
  const domainName = branchSegments[1] || 'core';
  const entryTypeMap = {
    character_creation: 'Character Creation Rule',
    archetypes: isOp ? 'Operator Archetype' : 'Architect Archetype Catalog',
    species: isOp ? 'Standalone Species' : 'Species Design Matrix',
    origins: 'Origin Profile',
    occupations: 'Occupation Profile',
    skills: cleanFileName.includes('.Mechanics.') ? 'Skill Mechanics' : 'Skill Category',
    features: 'Feature Catalog',
    economatrix: 'Economatrix Catalog',
    combat: 'Combat Module',
    metaphysics: isOp ? 'Metaphysics Discipline' : 'Metaphysics Matrix',
    economy: 'Economic Matrix',
    characters: 'Character Matrix Module',
    companions: 'Companion Matrix Module',
    planetary: 'Planetary Matrix Module',
    technology: `Tech Matrix (${humanizeToken(branchSegments[2] || 'Core')})`
  };

  return {
    parent: masterDocId,
    masterDocId,
    isMasterDoc: false,
    category,
    perspective,
    entry_type: entryTypeMap[domainName] || (isOp ? 'Core Rule' : 'Architect Matrix'),
    subfolderKey,
    domainTag: domainName
  };
}

/**
 * Sorts sibling files cleanly according to canonical Tangent rulebook order.
 */
function compareSiblingFiles(a, b) {
  // 1. Check custom sub-article order
  const customIdxA = CUSTOM_SUBARTICLE_ORDER.indexOf(a.fileName);
  const customIdxB = CUSTOM_SUBARTICLE_ORDER.indexOf(b.fileName);
  if (customIdxA !== -1 && customIdxB !== -1) return customIdxA - customIdxB;
  if (customIdxA !== -1) return -1;
  if (customIdxB !== -1) return 1;

  // 2. In 1.03 SPECIES: sort Major Lineages before Standalone Species
  if (a.relBranch.startsWith('operator/species') && b.relBranch.startsWith('operator/species')) {
    const aIsLineageFolder = a.relBranch !== 'operator/species';
    const bIsLineageFolder = b.relBranch !== 'operator/species';
    if (aIsLineageFolder !== bIsLineageFolder) {
      return aIsLineageFolder ? -1 : 1;
    }
  }

  // 3. In 1.04 FACTIONS: sort Major -> AeldProvidence -> Impyrium -> Archetypal
  if (a.relBranch === 'operator/factions' && b.relBranch === 'operator/factions') {
    const getFactionTier = (fn) => {
      if (fn.startsWith('1.04.Major.')) return 1;
      if (fn.startsWith('1.04.AeldProvidence')) return 2;
      if (fn.startsWith('1.04.Impyrium.')) return 3;
      if (fn.startsWith('1.04.Archetypal.')) return 4;
      return 5;
    };
    const tierA = getFactionTier(a.fileName);
    const tierB = getFactionTier(b.fileName);
    if (tierA !== tierB) return tierA - tierB;
  }

  return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Synchronizes all markdown files from `docs/game rules` and all subfolders into
 * `src/data/compendiumSeed.json` and `src/data/omnicortex/compendium/*.md`.
 */
export function syncCanonicalCompendium({ silent = false } = {}) {
  let rulesDir = path.join(projectRoot, 'docs', 'game rules');
  if (!fs.existsSync(rulesDir)) {
    rulesDir = path.join(projectRoot, '..', 'docs', 'game rules');
  }

  if (!fs.existsSync(rulesDir)) {
    throw new Error(`Rules directory not found: ${rulesDir}`);
  }

  const SEED_PATH = path.join(projectRoot, 'src', 'data', 'compendiumSeed.json');
  const MD_OUTPUT_DIR = path.join(projectRoot, 'src', 'data', 'omnicortex', 'compendium');

  if (!fs.existsSync(MD_OUTPUT_DIR)) {
    fs.mkdirSync(MD_OUTPUT_DIR, { recursive: true });
  }

  if (!silent) {
    console.log(`=== SYNCING CANONICAL COMPENDIUM FROM RULES DIRECTORY ===`);
    console.log(`Source: ${rulesDir}`);
  }

  const rawFiles = scanRuleFiles(rulesDir);
  if (!silent) {
    console.log(`Discovered ${rawFiles.length} markdown rule file(s) across all subfolders.`);
  }

  // Build candidate article records first
  const candidateNodes = rawFiles.map(fileObj => {
    const isOp = fileObj.relBranch === 'operator' || fileObj.relBranch.startsWith('operator/');
    const isArch = fileObj.relBranch === 'architect' || fileObj.relBranch.startsWith('architect/');
    const subfolderKey = isOp ? 'operator' : isArch ? 'architect' : 'core';
    const articleId = makeArticleId(subfolderKey, fileObj.fileName);
    const hierarchy = resolveHierarchyMetadata(fileObj, articleId);
    return {
      fileObj,
      articleId,
      hierarchy
    };
  });

  // Group children by parent ID to emit in clean depth-first canonical reading order
  const childrenByParent = new Map();
  for (const node of candidateNodes) {
    const p = node.hierarchy.parent;
    if (!childrenByParent.has(p)) {
      childrenByParent.set(p, []);
    }
    childrenByParent.get(p).push(node);
  }

  // Sort each parent's children list
  for (const [parentKey, list] of childrenByParent.entries()) {
    if (parentKey === OP_PARENT) {
      list.sort((a, b) => {
        const idxA = PREFERRED_OP_MASTER_ORDER.indexOf(a.fileObj.fileName);
        const idxB = PREFERRED_OP_MASTER_ORDER.indexOf(b.fileObj.fileName);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return compareSiblingFiles(a.fileObj, b.fileObj);
      });
    } else if (parentKey === ARCH_PARENT) {
      list.sort((a, b) => {
        const idxA = PREFERRED_ARCH_MASTER_ORDER.indexOf(a.fileObj.fileName);
        const idxB = PREFERRED_ARCH_MASTER_ORDER.indexOf(b.fileObj.fileName);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return compareSiblingFiles(a.fileObj, b.fileObj);
      });
    } else {
      list.sort((a, b) => compareSiblingFiles(a.fileObj, b.fileObj));
    }
  }

  // Depth-first traversal per perspective so sequential Next/Prev walks chapters -> sub-articles naturally
  const orderedNodes = [];
  const visited = new Set();

  function walkTree(parentKey) {
    const children = childrenByParent.get(parentKey) || [];
    for (const child of children) {
      if (visited.has(child.articleId)) continue;
      visited.add(child.articleId);
      orderedNodes.push(child);
      walkTree(child.articleId);
    }
  }

  walkTree(OP_PARENT);
  walkTree(ARCH_PARENT);

  // Include any remaining unvisited nodes as fallback
  for (const node of candidateNodes) {
    if (!visited.has(node.articleId)) {
      visited.add(node.articleId);
      orderedNodes.push(node);
    }
  }

  const finalArticles = [];
  const branchOrderCounters = { operator: 0, architect: 0, core: 0 };

  for (const { fileObj, articleId, hierarchy } of orderedNodes) {
    const content = fs.readFileSync(fileObj.fullPath, 'utf8');
    const stats = fs.statSync(fileObj.fullPath);
    const cleanFileName = fileObj.fileName.replace(/\.md$/i, '').trim();
    const docName = formatArticleDisplayName(fileObj);

    branchOrderCounters[hierarchy.subfolderKey] = (branchOrderCounters[hierarchy.subfolderKey] || 0) + 1;
    const orderNum = branchOrderCounters[hierarchy.subfolderKey];

    const docArticle = {
      id: articleId,
      name: docName,
      fileName: fileObj.fileName,
      relPath: fileObj.relPath,
      subfolder: fileObj.relBranch,
      isMasterDoc: hierarchy.isMasterDoc,
      masterDocId: hierarchy.masterDocId,
      category: hierarchy.category,
      parent: hierarchy.parent,
      order: orderNum,
      perspective: hierarchy.perspective,
      entry_type: hierarchy.entry_type,
      tl: 3,
      ml: 0,
      cost: 0,
      tags: Array.from(new Set([
        hierarchy.subfolderKey,
        'core-rules',
        hierarchy.isMasterDoc ? 'source-of-truth' : 'modular-rule',
        hierarchy.domainTag,
        cleanFileName.toLowerCase(),
        hierarchy.subfolderKey === 'architect' ? 'matrix' : 'mechanics'
      ])).filter(Boolean),
      description: content,
      mechanic: '',
      guide: '',
      note: '',
      updatedAt: stats.mtime.toISOString()
    };

    finalArticles.push(docArticle);
  }

  // Validation checks on core combat source of truth
  const combatArt = finalArticles.find(a => a.id === 'doc-operator-3-00-combat');
  if (combatArt) {
    assert(combatArt.description.includes('2d10'), 'Combat doc must state 2d10 resolution');
    assert(combatArt.description.includes('DEFENDER WINS ALL TIES'), 'Combat doc must state DEFENDER WINS ALL TIES');
  }

  // Clean stale/orphaned .md files in MD_OUTPUT_DIR that are no longer in finalArticles
  const activeFileNames = new Set(finalArticles.map(a => `${a.id}.md`));
  const existingFiles = fs.readdirSync(MD_OUTPUT_DIR).filter(f => f.endsWith('.md'));
  let purgedCount = 0;
  for (const file of existingFiles) {
    if (!activeFileNames.has(file)) {
      fs.unlinkSync(path.join(MD_OUTPUT_DIR, file));
      purgedCount++;
    }
  }

  // Write out all individual markdown files in MD_OUTPUT_DIR
  for (const art of finalArticles) {
    const filePath = path.join(MD_OUTPUT_DIR, `${art.id}.md`);
    const content = `---
id: "${art.id}"
name: "${(art.name || '').replace(/"/g, '\\"')}"
fileName: "${(art.fileName || '').replace(/"/g, '\\"')}"
relPath: "${(art.relPath || '').replace(/"/g, '\\"')}"
isMasterDoc: ${Boolean(art.isMasterDoc)}
masterDocId: "${(art.masterDocId || '').replace(/"/g, '\\"')}"
category: "${art.category || 'compendium'}"
parent: "${(art.parent || '').replace(/"/g, '\\"')}"
order: ${art.order || 0}
perspective: "${art.perspective || 'both'}"
entry_type: "${art.entry_type || 'Core Rule'}"
tl: ${art.tl ?? 3}
ml: ${art.ml ?? 0}
cost: ${art.cost ?? 0}
tags: ${JSON.stringify(art.tags || ['compendium'])}
updatedAt: "${art.updatedAt || new Date().toISOString()}"
costs:
  bp: 0
  credits: 0
  nodes: 0
  sockets: 0
  strain: 0
  focus: 0
  ap: 0
modifiers: []
modifications: []
critical_details:
  score: ''
  effect: []
  success_effect: []
  failure_effect: []
sockets:
  max: 0
  used: 0
  tier: Socket
  allocated: []
---

${art.description || ''}${art.mechanic ? `\n\n## Game Mechanics Rules\n\`\`\`\n${art.mechanic}\n\`\`\`` : ''}${art.guide ? `\n\n## Gameplay Instructions\n${art.guide}` : ''}${art.note ? `\n\n## Designer Notes\n${art.note}` : ''}
`;
    fs.writeFileSync(filePath, content, 'utf8');
  }

  // Write out consolidated compendiumSeed.json
  fs.writeFileSync(SEED_PATH, JSON.stringify(finalArticles, null, 2), 'utf8');

  if (!silent) {
    if (purgedCount > 0) {
      console.log(`Purged ${purgedCount} stale markdown files from ${MD_OUTPUT_DIR}`);
    }
    console.log(`Saved master compendium seed to ${SEED_PATH} (${(fs.statSync(SEED_PATH).size / 1024).toFixed(1)} KB)`);
    console.log(`Wrote ${finalArticles.length} canonical markdown articles to ${MD_OUTPUT_DIR}`);
    console.log('=== SYNC COMPLETE ===\n');
  }

  return {
    totalArticles: finalArticles.length,
    purgedCount,
    articles: finalArticles
  };
}

// Direct CLI invocation
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  syncCanonicalCompendium();
}
