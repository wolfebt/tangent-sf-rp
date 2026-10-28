import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useDBM } from '../DBMContext';
import { useFolioIdentity, DEFAULT_CHARACTER } from './FolioIdentityContext';
import { ALL_CANONICAL_SKILLS } from '../../data/skillsData';
import { 
  enrichItemWithModifiers, 
  parseModifiersFromText,
  getSkillCheckBreakdown,
  isSkillTargetMatch,
  extractEquipmentSkillModifiers
} from '../../engines/tangentModifierEngine';
import { 
  resolveCatalogItem,
  calculateFullSpeciesCost,
  getSpeciesComponentDataset,
  formatGrantedCost,
  computeEconomyBreakdown
} from '../../engines/tangentEntityEngines';
import { getSpeciesRestProfile } from '../../engines/tangentRestEngine';
import { calculateCharacterWealth } from '../../engines/tangentEconEngine';
import { showToast } from '../ToastContext';

export const ATTR_NAME_TO_ID = {
  strength: 'attr-strength',
  might: 'attr-might',
  agility: 'attr-agility',
  reflex: 'attr-reflex',
  stamina: 'attr-stamina',
  constitution: 'attr-stamina',
  fortitude: 'attr-fortitude',
  intellect: 'attr-intellect',
  reason: 'attr-logic',
  logic: 'attr-logic',
  wisdom: 'attr-wisdom',
  willpower: 'attr-will',
  will: 'attr-will',
  charisma: 'attr-charisma',
  etiquette: 'attr-etiquette'
};

export const PRIMARY_TO_SUB_ATTR = {
  'attr-strength': 'attr-might',
  'attr-agility': 'attr-reflex',
  'attr-stamina': 'attr-fortitude',
  'attr-intellect': 'attr-logic',
  'attr-wisdom': 'attr-will',
  'attr-charisma': 'attr-etiquette'
};

export const SUB_TO_PRIMARY_ATTR = {
  'attr-might': 'attr-strength',
  'attr-reflex': 'attr-agility',
  'attr-fortitude': 'attr-stamina',
  'attr-logic': 'attr-intellect',
  'attr-reason': 'attr-intellect',
  'attr-will': 'attr-wisdom',
  'attr-willpower': 'attr-wisdom',
  'attr-etiquette': 'attr-charisma'
};

export const normalizeTraitName = (trait) => {
  if (!trait) return '';
  const raw = typeof trait === 'object' ? (trait.name || trait.title || trait.id || '') : String(trait);
  const cleaned = raw.replace(/^(trait|feature|hindrance|disadvantage)-/i, '').replace(/[-_]/g, ' ').trim();
  return cleaned.replace(/\b\w/g, c => c.toUpperCase());
};

export const DEFAULT_STATS_FALLBACK = {
  computeSpentCP: () => 0,
  economyBreakdown: {},
  derivedStats: {
    stamina: 0,
    toughness: 0,
    fortitude: 2,
    wisdom: 0,
    will: 2,
    charisma: 0,
    maxKarmaDebt: 1,
    baseHealth: 30,
    baseVitality: 30,
    baseStructure: 60,
    health: 30,
    vitality: 30,
    structure: 60,
    maxKarma: 3,
    maxAllowed: 120,
    armorRating: 0,
    energyShielding: 0,
    effectiveArmorRating: 0,
    effectiveEnergyShielding: 0,
    armorLocations: {},
    totalCredits: 1000,
    tradeGoods: 0,
    totalDebits: 0,
    netWorth: 1000,
    totalCashOnHand: 1000
  },
  computedModifiers: {
    attributeMods: {},
    combatMods: {},
    saveMods: {},
    skillMods: {},
    identityPools: {},
    activeFeatureModifiers: [],
    activeTraitModifiers: [],
    activeHindranceModifiers: [],
    activeEquipmentModifiers: [],
    activeSkillModifiers: []
  },
  saveMods: {},
  activeFeatureModifiers: [],
  activeTraitModifiers: [],
  activeHindranceModifiers: [],
  activeEquipmentModifiers: [],
  activeSkillModifiers: [],
  getSkillBreakdown: () => ({ total: 0 }),
  getAttrMod: () => 0,
  getAttrTotal: (attrId) => (SUB_TO_PRIMARY_ATTR[attrId] ? 2 : 0),
  getSubAttrBase: () => 2,
  enabledMovementModes: ['walk'],
  calculateFullSpeciesCost: () => 0,
  speciesComponentData: {},
  allocatePoolSkillRank: () => {},
  togglePoolTrait: () => {},
  removePoolTrait: () => {},
  togglePoolFeature: () => {},
  removePoolFeature: () => {},
  allocatePoolAttribute: () => {},
  handleAddSkill: () => {},
  handleDeleteSkill: () => {},
  handleAddSpecialization: () => {},
  handleUpdateSpecialization: () => {},
  handleDeleteSpecialization: () => {}
};

export const FolioStatsContext = globalThis.__TANGENT_FOLIO_STATS_CONTEXT__ || (globalThis.__TANGENT_FOLIO_STATS_CONTEXT__ = createContext(DEFAULT_STATS_FALLBACK));

export const useFolioStats = () => {
  const context = useContext(FolioStatsContext);
  if (!context) {
    console.warn('[useFolioStats] Hook called outside of FolioStatsSliceProvider. Returning fallback empty state.');
    return DEFAULT_STATS_FALLBACK;
  }
  return context;
};

export const FolioStatsSliceProvider = ({ children }) => {
  const { characterData: rawCharacterData, setCharacterData, triggerSave } = useFolioIdentity();
  const characterData = (rawCharacterData && typeof rawCharacterData === 'object') ? rawCharacterData : DEFAULT_CHARACTER;
  const dbContext = useDBM() || {};
  const dbData = dbContext.dbData || {};

  // Comprehensive Identity & Modifier Calculation Engine
  const computedModifiers = useMemo(() => {
    const attributeMods = {
      'attr-strength': 0,
      'attr-might': 0,
      'attr-agility': 0,
      'attr-reflex': 0,
      'attr-stamina': 0,
      'attr-fortitude': 0,
      'attr-intellect': 0,
      'attr-logic': 0,
      'attr-wisdom': 0,
      'attr-will': 0,
      'attr-charisma': 0,
      'attr-etiquette': 0
    };

    const combatMods = {
      'initiative-mod': 0,
      'defense-mod': 0,
      'attack-mod': 0,
      'move-walk': 0,
      'move-swim': 0,
      'move-climb': 0,
      'move-fly': 0
    };

    const saveMods = {
      Fortitude: 0,
      Reflex: 0,
      Will: 0,
      Concentration: 0
    };

    const attributeModSources = {
      'attr-strength': [],
      'attr-might': [],
      'attr-agility': [],
      'attr-reflex': [],
      'attr-stamina': [],
      'attr-fortitude': [],
      'attr-intellect': [],
      'attr-logic': [],
      'attr-wisdom': [],
      'attr-will': [],
      'attr-charisma': [],
      'attr-etiquette': []
    };

    const mapSaveToAttrId = (saveTarget) => {
      const s = String(saveTarget || '').toLowerCase().trim();
      if (s.includes('fortitude') || s === 'fort') return 'attr-fortitude';
      if (s.includes('reflex') || s === 'ref') return 'attr-reflex';
      if (s.includes('will')) return 'attr-will';
      return null;
    };

    const addAttrModSource = (attrKey, entry) => {
      if (!attrKey || !entry || !entry.val) return;
      const canonicalKey = attrKey === 'attr-reason' ? 'attr-logic' : attrKey === 'attr-willpower' ? 'attr-will' : attrKey;
      if (attributeModSources[canonicalKey]) {
        attributeModSources[canonicalKey].push(entry);
      }
    };

    const activeFeatureModifiers = [];
    const activeTraitModifiers = [];
    const activeHindranceModifiers = [];
    const activeSkillModifiers = [];

    const skillMods = {};

    const resolveItem = (key, colName) => {
      const val = characterData?.[key];
      if (!val) return null;
      if (typeof val === 'object' && val !== null) return val;
      return resolveCatalogItem(colName, val, dbData);
    };

    const isSituationalMod = (m) => Boolean(m?.isSituational || m?.mode === 'situational' || m?.mode === 'conditional' || m?.condition);

    const processIdentity = (identityItem, identityKey, identityTitle) => {
      const pools = [];
      const activeModifiers = [];
      if (!identityItem) return { title: identityTitle, name: 'Not Selected', pools, activeModifiers };

      const name = typeof identityItem === 'object' ? (identityItem.name || identityItem.title || 'Selected') : String(identityItem);

      if (typeof identityItem === 'object') {
        // 1. Inherent Attribute Modifiers (Set values per attribute or sub-attribute)
        const inherentAttrMods = (Array.isArray(identityItem.attribute_modifiers) && identityItem.attribute_modifiers.length > 0)
          ? identityItem.attribute_modifiers
          : (identityItem.inherent_attribute_modifiers || identityItem.specific_attribute_bonuses);
        const hasInherentAttrMods = Array.isArray(inherentAttrMods) && inherentAttrMods.length > 0;
        const inherentSkills = identityItem.inherent_skill_bonuses || identityItem.specific_skill_bonuses || identityItem.granted_skills;
        const hasInherentSkillMods = Array.isArray(inherentSkills) && inherentSkills.length > 0;

        if (hasInherentAttrMods) {
          inherentAttrMods.forEach(b => {
            const aName = typeof b === 'object' ? (b.attribute || b.name || '') : String(b).split(/[:+(]/)[0].trim();
            const aVal = typeof b === 'object' ? (b.bonus ?? b.value ?? 1) : (parseInt(String(b).replace(/[^0-9-]/g, ''), 10) || 1);
            if (aName) {
              const cleanName = aName.toLowerCase().trim();
              const attrKeyMap = {
                'strength': 'attr-strength',
                'might': 'attr-might',
                'agility': 'attr-agility',
                'reflex': 'attr-reflex',
                'stamina': 'attr-stamina',
                'fortitude': 'attr-fortitude',
                'constitution': 'attr-fortitude',
                'intellect': 'attr-intellect',
                'logic': 'attr-logic',
                'wisdom': 'attr-wisdom',
                'will': 'attr-will',
                'charisma': 'attr-charisma',
                'etiquette': 'attr-etiquette'
              };
              const targetKey = attrKeyMap[cleanName] || (cleanName.startsWith('attr-') ? cleanName : `attr-${cleanName}`);
              if (attributeMods[targetKey] !== undefined) {
                attributeMods[targetKey] = (attributeMods[targetKey] || 0) + aVal;
                addAttrModSource(targetKey, {
                  val: aVal,
                  source: `${identityTitle}: ${name}`,
                  name: `${identityTitle}: ${name}`,
                  isSituational: false
                });
              }
              activeModifiers.push({ name: `[${identityTitle}: ${name}] ${aName} ${aVal >= 0 ? '+' : ''}${aVal}`, target: aName.toUpperCase(), value: aVal, type: 'Attribute' });
              pools.push({ name: `Inherent Attr: ${aName} (${aVal >= 0 ? '+' : ''}${aVal})`, awarded: aVal, type: 'Inherent Attr' });
            }
          });
        }

        // Direct Bonus Attribute Point Pools
        const bonusAttrPts = parseInt(identityItem.bonus_attribute_points, 10);
        if (!isNaN(bonusAttrPts) && bonusAttrPts !== 0) {
          pools.push({ name: 'Bonus Attribute Points (ANY)', awarded: bonusAttrPts, type: 'Attr Points' });
        }
        const bonusAttrPhys = parseInt(identityItem.bonus_attribute_points_physical, 10);
        if (!isNaN(bonusAttrPhys) && bonusAttrPhys !== 0) {
          pools.push({ name: 'Bonus PHYSICAL Attribute Points (STR, AGI, STA)', awarded: bonusAttrPhys, type: 'Physical Attr' });
        }
        const bonusAttrMent = parseInt(identityItem.bonus_attribute_points_mental, 10);
        if (!isNaN(bonusAttrMent) && bonusAttrMent !== 0) {
          pools.push({ name: 'Bonus MENTAL Attribute Points (INT, WIS, CHA)', awarded: bonusAttrMent, type: 'Mental Attr' });
        }
        const bonusAttrPrim = parseInt(identityItem.bonus_attribute_points_primary, 10);
        if (!isNaN(bonusAttrPrim) && bonusAttrPrim !== 0) {
          pools.push({ name: 'Bonus Primary Attribute Points', awarded: bonusAttrPrim, type: 'Primary Attr' });
        }
        const bonusAttrSub = parseInt(identityItem.bonus_attribute_points_sub, 10);
        if (!isNaN(bonusAttrSub) && bonusAttrSub !== 0) {
          pools.push({ name: 'Bonus Sub-Attribute Points', awarded: bonusAttrSub, type: 'Sub-Attr Points' });
        }

        // 2. Modifiers Array Resolution
        const applyModifier = (modRef, sourceLabel, skipDuplicateInherent = false) => {
          let mod = null;
          if (typeof modRef === 'object' && modRef !== null) {
            mod = modRef;
          } else if (typeof modRef === 'string') {
            const allMods = dbData.modifiers || [];
            mod = allMods.find(m => 
              (m.name && m.name.toLowerCase() === modRef.toLowerCase()) || 
              m.id === modRef
            ) || { name: modRef };
          }
          if (!mod) return;

          const mName = mod.name || mod.id || 'Modifier';
          const val = parseInt(mod.value, 10) || 0;
          const target = (mod.target || '').toLowerCase().trim();
          const modType = (mod.type || '').toLowerCase().trim();
          const isSit = isSituationalMod(mod);

          if (modType === 'attribute' || target.startsWith('attr-') || ATTR_NAME_TO_ID[target]) {
            if (mod.mode === 'bonus_pool' || mod.mode === 'choice_pool') return;
            if (skipDuplicateInherent && hasInherentAttrMods && mod.mode !== 'size_modifier') return;
            if (mod.mode === 'size_modifier' && identityKey === 'species') {
              const rawSpSize = Array.isArray(identityItem.size) ? identityItem.size[0] : (identityItem.size || identityItem.species_size || 'Medium');
              if (String(rawSpSize || 'Medium').toLowerCase().includes('medium')) return;
            }
            const mapped = ATTR_NAME_TO_ID[target] || (target.startsWith('attr-') ? target : `attr-${target}`);
            const cleanSrc = sourceLabel.replace(/^\[|\]$/g, '').trim();
            if (attributeMods[mapped] !== undefined) {
              if (!isSit) {
                attributeMods[mapped] += val;
              }
              addAttrModSource(mapped, {
                val,
                source: cleanSrc,
                name: cleanSrc,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: mapped.replace('attr-', '').toUpperCase(), value: val, type: 'Attribute' });
          } else if (modType === 'save') {
            const saveKey = mod.target || 'Fortitude';
            const cleanSrc = sourceLabel.replace(/^\[|\]$/g, '').trim();
            if (!isSit) {
              if (saveMods[saveKey] !== undefined) saveMods[saveKey] += val;
              else saveMods[saveKey] = val;
            }
            const saveAttrId = mapSaveToAttrId(saveKey);
            if (saveAttrId) {
              addAttrModSource(saveAttrId, {
                val,
                source: cleanSrc,
                name: cleanSrc,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: `${saveKey} Check`, value: val, type: 'Save' });
          } else if (modType === 'combat') {
            const cKey = mod.target || 'initiative-mod';
            if (!isSit) {
              if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
              else combatMods[cKey] = val;
            }
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: cKey.toUpperCase(), value: val, type: 'Combat' });
          } else if (modType === 'skill') {
            if (skipDuplicateInherent && hasInherentSkillMods && mod.mode === 'inherent') return;
            const sKey = target;
            if (sKey) {
              if (!isSit) {
                skillMods[sKey] = (skillMods[sKey] || 0) + val;
              }
              activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: mod.target, value: val, type: 'Skill' });
            }
          }
        };

        const rawMods = identityItem.modifiers || identityItem.modifier;
        const modList = Array.isArray(rawMods) ? rawMods : (rawMods ? [rawMods] : []);
        modList.forEach(m => applyModifier(m, `[${identityTitle}: ${name}]`, true));

        // 3. Inherent Traits & Features of Species / Archetype / Faction (Display only in identityPools; actual stat application happens once in uniqueFeatures / uniqueTraits)
        const resolveSubTraits = (traitList, label) => {
          if (!Array.isArray(traitList)) return;
          traitList.forEach(tRef => {
            let tObj = null;
            if (typeof tRef === 'object' && tRef !== null) {
              tObj = tRef;
            } else if (typeof tRef === 'string') {
              const allTraits = dbData.traits || [];
              tObj = allTraits.find(t => 
                (t.name && t.name.toLowerCase() === tRef.toLowerCase()) || 
                t.id === tRef
              ) || { name: tRef };
            }
            if (!tObj) return;

            const tName = tObj.name || tObj.id || label;
            const enriched = enrichItemWithModifiers(tObj);
            if (enriched && Array.isArray(enriched.modifiers)) {
              enriched.modifiers.forEach(em => {
                const val = parseInt(em.value, 10) || 0;
                if (em.type === 'attribute') {
                  const aKey = (em.target || '').toLowerCase().trim();
                  const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
                  if (attributeMods[mapped] !== undefined) {
                    activeModifiers.push({ name: `[${label}: ${tName}]`, target: mapped.replace('attr-', '').toUpperCase(), value: val, type: 'Attribute' });
                  }
                } else if (em.type === 'skill') {
                  const sKey = (em.target || '').toLowerCase().trim();
                  if (sKey) {
                    activeModifiers.push({ name: `[${label}: ${tName}]`, target: em.target, value: val, type: 'Skill' });
                  }
                } else if (em.type === 'save') {
                  const saveKey = em.target || 'Fortitude';
                  activeModifiers.push({ name: `[${label}: ${tName}]`, target: `${saveKey} Check`, value: val, type: 'Save' });
                } else if (em.type === 'combat') {
                  const cKey = em.target || 'initiative-mod';
                  activeModifiers.push({ name: `[${label}: ${tName}]`, target: cKey.toUpperCase(), value: val, type: 'Combat' });
                }
              });
            }
          });
        };

        resolveSubTraits(identityItem.inherent_traits, `${identityTitle} Trait`);
        resolveSubTraits(identityItem.inherent_features, `${identityTitle} Feature`);
        resolveSubTraits(identityItem.signature_traits || identityItem.signature_features, `${identityTitle} Signature Trait`);
        resolveSubTraits(identityItem.bonus_features, `${identityTitle} Feature`);
        resolveSubTraits(identityItem.benefits, `${identityTitle} Benefit`);

        // 4. Inherent Skill Bonuses & Point Pools
        if (hasInherentSkillMods) {
          inherentSkills.forEach(s => {
            const sName = typeof s === 'object' ? (s.skill || s.name || '') : String(s).split(/[:+(]/)[0].trim();
            const sVal = typeof s === 'object' ? (s.rank ?? s.value ?? s.bonus ?? 1) : (parseInt(String(s).replace(/[^0-9-]/g, ''), 10) || 1);
            if (sName) {
              const cleanSkillName = sName.toLowerCase().trim();
              skillMods[cleanSkillName] = (skillMods[cleanSkillName] || 0) + sVal;
              activeModifiers.push({ name: `[${identityTitle}: ${name}] ${sName} +${sVal}`, target: sName, value: sVal, type: 'Skill' });
              pools.push({ name: `Granted Skill: ${sName} (+${sVal})`, awarded: sVal, type: 'Skill' });
            }
          });
        }

        const bonusSkillPts = parseInt(identityItem.bonus_skill_points, 10);
        if (!isNaN(bonusSkillPts) && bonusSkillPts !== 0) {
          pools.push({ name: 'Bonus Skill Points', awarded: bonusSkillPts, type: 'Skill Points' });
        }

        // 5. Inherent Trait & Feature Point Pools
        const bonusTraitPts = parseInt(identityItem.bonus_trait_points, 10);
        if (!isNaN(bonusTraitPts) && bonusTraitPts !== 0) {
          pools.push({ name: 'Bonus Trait Points', awarded: bonusTraitPts, type: 'Trait Points' });
        }
        const bonusFeaturePts = parseInt(identityItem.bonus_feature_points, 10);
        if (!isNaN(bonusFeaturePts) && bonusFeaturePts !== 0) {
          pools.push({ name: 'Bonus Feature Points', awarded: bonusFeaturePts, type: 'Feature Points' });
        }

        // Dynamic Trait Bonus Pools
        const traitsBonusList = Array.isArray(identityItem.traits) ? identityItem.traits : [];
        traitsBonusList.forEach(tRef => {
          let tObj = typeof tRef === 'object' && tRef !== null ? tRef : (dbData.traits || []).find(t => (t.name && t.name.toLowerCase() === String(tRef).toLowerCase()) || t.id === tRef);
          if (!tObj) return;
          const tName = tObj.name || tObj.id || 'Trait';
          const tSkillPts = parseInt(tObj.bonus_skill_points, 10);
          if (!isNaN(tSkillPts) && tSkillPts !== 0) {
            pools.push({ name: `[Trait: ${tName}] Bonus Skill Points`, awarded: tSkillPts, type: 'Skill Points' });
          }
          const tFeatPts = parseInt(tObj.bonus_feature_points, 10);
          if (!isNaN(tFeatPts) && tFeatPts !== 0) {
            pools.push({ name: `[Trait: ${tName}] Bonus Feature Points`, awarded: tFeatPts, type: 'Feature Points' });
          }
        });

        // 6. Resolve attached species subcategories (types, sizes, movements)
        const resolveSubComponent = (fieldKey, colKey, labelPrefix) => {
          const rawItems = identityItem[fieldKey] || [];
          const items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);
          const allCol = dbData[colKey] || [];

          items.forEach(ref => {
            let itemObj = null;
            if (typeof ref === 'object' && ref !== null) {
              itemObj = ref;
            } else if (typeof ref === 'string') {
              itemObj = allCol.find(c => 
                (c.name && c.name.toLowerCase() === ref.toLowerCase()) || 
                c.id === ref
              ) || { name: ref };
            }
            if (!itemObj) return;

            const iName = itemObj.name || itemObj.id || labelPrefix;
            const iModRefs = Array.isArray(itemObj.modifier) ? itemObj.modifier : (itemObj.modifier ? [itemObj.modifier] : []);
            iModRefs.forEach(modRef => applyModifier(modRef, `[${labelPrefix}: ${iName}]`));
          });
        };

        resolveSubComponent('type', 'species_type', 'Type');
        resolveSubComponent('size', 'species_size', 'Size');
        resolveSubComponent('movement', 'species_movement', 'Movement');
      }

      // Check for custom pools attached to characterData
      const customPoolKey = `char-${identityKey}-pools`;
      if (Array.isArray(characterData[customPoolKey])) {
        characterData[customPoolKey].forEach(p => pools.push(p));
      }

      return {
        title: identityTitle,
        name,
        pools,
        activeModifiers
      };
    };

    const speciesObj = resolveItem('char-species', 'species');
    const occuObj = resolveItem('char-occu', 'occupations');
    const originObj = resolveItem('char-origin', 'origins');
    const factionObj = resolveItem('char-faction', 'factions');
    const archetypeObj = resolveItem('char-archetype', 'archetypes');

    const identityPools = {
      species: processIdentity(speciesObj, 'species', 'Species'),
      occupation: processIdentity(occuObj, 'occu', 'Occupation'),
      origin: processIdentity(originObj, 'origin', 'Origin'),
      faction: processIdentity(factionObj, 'faction', 'Faction'),
      archetype: processIdentity(archetypeObj, 'archetype', 'Archetype')
    };

    // Include allocated bonus attribute points from identity pools (Species, Occupation, Origin, Faction) under Modifiers
    const poolAttrSources = [
      { alloc: characterData.speciesAllocations?.attributes, label: `Species Bonus (${identityPools.species?.name || 'Species'})` },
      { alloc: characterData.occuAllocations?.attributes, label: `Occupation Bonus (${identityPools.occupation?.name || 'Occupation'})` },
      { alloc: characterData.originAllocations?.attributes, label: `Origin Bonus (${identityPools.origin?.name || 'Origin'})` },
      { alloc: characterData.factionAllocations?.attributes, label: `Faction Bonus (${identityPools.faction?.name || 'Faction'})` }
    ];
    poolAttrSources.forEach(({ alloc, label }) => {
      if (!alloc || typeof alloc !== 'object') return;
      Object.entries(alloc).forEach(([attrKey, pts]) => {
        const val = parseInt(pts, 10) || 0;
        if (val !== 0 && attributeMods[attrKey] !== undefined) {
          attributeMods[attrKey] += val;
          addAttrModSource(attrKey, {
            val,
            source: label,
            name: label,
            isSituational: false
          });
        }
      });
    });

    // 1. Process Features for all active modifiers (including inherent species/archetype/faction features)
    const rawFeats = Array.isArray(characterData.features) ? [...characterData.features] : [];
    const addedFeatNames = new Set(rawFeats.map(f => (typeof f === 'object' ? (f.name || f.title || f.id) : String(f)).toLowerCase()));

    // Ensure inherent species features are evaluated even if not yet explicitly in array
    if (speciesObj && Array.isArray(speciesObj.inherent_features)) {
      speciesObj.inherent_features.forEach(inf => {
        const n = typeof inf === 'object' ? (inf.name || inf.title || inf.id) : String(inf);
        if (n && !addedFeatNames.has(n.toLowerCase())) {
          rawFeats.push(inf);
          addedFeatNames.add(n.toLowerCase());
        }
      });
    }
    // Ensure faction benefits are evaluated
    if (factionObj) {
      const rawBonus = factionObj.bonus_features || factionObj.bonusFeatures || factionObj.benefits;
      if (Array.isArray(rawBonus)) {
        rawBonus.forEach(b => {
          const n = typeof b === 'object' ? (b.name || b.title || b.id) : String(b);
          if (n && !addedFeatNames.has(n.toLowerCase())) {
            rawFeats.push(b);
            addedFeatNames.add(n.toLowerCase());
          }
        });
      }
    }
    // Ensure identity allocation pools are evaluated
    const poolFeats = [
      ...(characterData.speciesAllocations?.features || []),
      ...(characterData.occuAllocations?.features || []),
      ...(characterData.originAllocations?.features || []),
      ...(characterData.factionAllocations?.features || [])
    ];
    poolFeats.forEach(pf => {
      const n = typeof pf === 'object' ? (pf.name || pf.title || pf.id) : String(pf);
      if (n && !addedFeatNames.has(n.toLowerCase())) {
        rawFeats.push(pf);
        addedFeatNames.add(n.toLowerCase());
      }
    });

    const seenFeatNames = new Set();
    const uniqueFeatures = rawFeats.filter(f => {
      if (!f) return false;
      const n = (typeof f === 'object' ? (f.name || f.title || f.id) : String(f)).toLowerCase();
      if (seenFeatNames.has(n)) return false;
      seenFeatNames.add(n);
      return true;
    });

    uniqueFeatures.forEach(feat => {
      if (!feat) return;
      const enriched = enrichItemWithModifiers(feat);
      const fName = enriched?.name || (typeof feat === 'object' ? (feat.name || feat.title || feat.id) : String(feat));
      if (enriched && Array.isArray(enriched.modifiers)) {
        enriched.modifiers.forEach(mod => {
          if (!mod || typeof mod !== 'object') return;
          const val = parseInt(mod.value, 10) || 0;
          const isSit = isSituationalMod(mod);
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (!isSit) {
              if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
              else saveMods[targetSave] = val;
            }
            const saveAttrId = mapSaveToAttrId(targetSave);
            if (saveAttrId) {
              addAttrModSource(saveAttrId, {
                val,
                source: `Feature: ${fName}`,
                name: `Feature: ${fName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
            activeFeatureModifiers.push({ source: fName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill' && mod.mode !== 'group_choice') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              if (!isSit) {
                skillMods[sKey] = (skillMods[sKey] || 0) + val;
              }
              activeFeatureModifiers.push({ source: fName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: fName, sourceType: 'feature', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              if (!isSit) {
                attributeMods[mapped] += val;
              }
              addAttrModSource(mapped, {
                val,
                source: `Feature: ${fName}`,
                name: `Feature: ${fName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
              activeFeatureModifiers.push({ source: fName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (!isSit) {
              if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
              else combatMods[cKey] = val;
            }
            activeFeatureModifiers.push({ source: fName, target: cKey, value: val, description: mod.description });
          }
        });
      }

      // Check choice-based modifier_options (group_pool or single/pair options) or group_choice modifiers
      const rawOptions = (typeof feat === 'object' && feat.modifier_options) ? feat.modifier_options : enriched?.modifier_options;
      const groupChoiceMod = Array.isArray(enriched?.modifiers) ? enriched.modifiers.find(m => m.type === 'skill' && m.mode === 'group_choice') : null;
      const featRank = Math.max(1, parseInt((typeof feat === 'object' ? feat.rank : undefined) ?? enriched?.rank ?? 1, 10) || 1);
      const isRankedFeat = Boolean((typeof feat === 'object' && feat.is_ranked) || enriched?.is_ranked);
      const rankMult = isRankedFeat ? featRank : 1;

      const cleanFeatId = String((typeof feat === 'object' ? feat.id : '') || enriched?.id || '').trim().toLowerCase();
      const cleanFeatName = normalizeTraitName(fName || '').toLowerCase();
      const featSelMap = characterData?.featureSkillSelections || {};
      const featMapEntry = (cleanFeatId && featSelMap[cleanFeatId]) || (cleanFeatName && featSelMap[cleanFeatName]) || null;

      if ((rawOptions && rawOptions.enabled && rawOptions.mode === 'group_pool') || groupChoiceMod) {
        const baseOptValue = parseInt(rawOptions?.value ?? groupChoiceMod?.value ?? 2, 10) || 2;
        const optValue = baseOptValue * rankMult;
        const rawSel = (typeof feat === 'object' && Array.isArray(feat.selected_skills) && feat.selected_skills.length > 0)
          ? feat.selected_skills
          : ((typeof feat === 'object' && feat.selected_skill) ? [feat.selected_skill] : null);
        const mapSel = Array.isArray(featMapEntry?.selected_skills)
          ? featMapEntry.selected_skills
          : (Array.isArray(featMapEntry) ? featMapEntry : (featMapEntry?.selected_skill ? [featMapEntry.selected_skill] : null));
        const selectedSkills = rawSel || mapSel || (Array.isArray(enriched?.selected_skills) ? enriched.selected_skills : []);
        const groupLabel = rawOptions?.group_label || groupChoiceMod?.group_label || groupChoiceMod?.target || 'Skill Group Choice';

        selectedSkills.forEach(skillTarget => {
          const sKey = (skillTarget || '').toLowerCase().trim();
          if (sKey) {
            skillMods[sKey] = (skillMods[sKey] || 0) + optValue;
            activeFeatureModifiers.push({
              source: `${fName} [${skillTarget}]`,
              target: skillTarget,
              value: optValue,
              description: `${fName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${groupLabel})`
            });
            activeSkillModifiers.push({
              source: `${fName} [${skillTarget}]`,
              sourceType: 'feature',
              target: skillTarget,
              value: optValue,
              description: `${fName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${groupLabel})`
            });
          }
        });
      } else if (rawOptions && rawOptions.enabled && Array.isArray(rawOptions.options) && rawOptions.options.length > 0) {
        const selectedId = (typeof feat === 'object' && feat.selected_option_id)
          ? feat.selected_option_id
          : (featMapEntry?.selected_option_id || (typeof featMapEntry === 'string' ? featMapEntry : enriched?.selected_option_id));
        const activeOption = rawOptions.options.find(opt => typeof opt === 'object' && opt.id === selectedId)
          || (rawOptions.options.length === 1 && typeof rawOptions.options[0] === 'object' ? rawOptions.options[0] : null);

        if (activeOption) {
          const baseOptValue = parseInt(activeOption.value !== undefined ? activeOption.value : (rawOptions.value || 2), 10) || 2;
          const optValue = baseOptValue * rankMult;
          const targetSkills = Array.isArray(activeOption.skills) 
            ? activeOption.skills 
            : (activeOption.skill ? [activeOption.skill] : []);

          targetSkills.forEach(skillTarget => {
            const sKey = (skillTarget || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + optValue;
              activeFeatureModifiers.push({
                source: `${fName} [${activeOption.label || activeOption.id || 'Selected Option'}]`,
                target: skillTarget,
                value: optValue,
                description: `${fName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${activeOption.label || activeOption.id})`
              });
              activeSkillModifiers.push({
                source: `${fName} [${activeOption.label || activeOption.id || 'Selected Option'}]`,
                sourceType: 'feature',
                target: skillTarget,
                value: optValue,
                description: `${fName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${activeOption.label || activeOption.id})`
              });
            }
          });
        }
      }
    });

    // 2. Process Traits for active modifiers (including archetype signature traits)
    const rawTraits = Array.isArray(characterData.traits) ? [...characterData.traits] : [];
    const speciesInherentTraits = speciesObj ? (speciesObj.inherent_traits || speciesObj.species_traits || speciesObj.traits || []) : [];
    const archetypeSigTraits = archetypeObj ? (archetypeObj.signature_traits || archetypeObj.traits || archetypeObj.signature_features || []) : [];
    const poolTraits = [
      ...(Array.isArray(speciesInherentTraits) ? speciesInherentTraits : []),
      ...(Array.isArray(archetypeSigTraits) ? archetypeSigTraits : []),
      ...(characterData.archetypeAllocations?.traits || []),
      ...(characterData.speciesAllocations?.traits || []),
      ...(characterData.occuAllocations?.traits || []),
      ...(characterData.originAllocations?.traits || []),
      ...(characterData.factionAllocations?.traits || [])
    ];
    poolTraits.forEach(pt => {
      const n = typeof pt === 'object' ? (pt.name || pt.title || pt.id) : String(pt);
      if (n && !rawTraits.some(rt => (typeof rt === 'object' ? (rt.name || rt.title || rt.id) : String(rt)).toLowerCase() === n.toLowerCase())) {
        rawTraits.push(pt);
      }
    });

    const seenTraitNames = new Set();
    const uniqueTraits = rawTraits.filter(t => {
      if (!t) return false;
      const n = (typeof t === 'object' ? (t.name || t.title || t.id) : String(t)).toLowerCase();
      if (seenTraitNames.has(n) || seenFeatNames.has(n)) return false;
      seenTraitNames.add(n);
      return true;
    });

    uniqueTraits.forEach(trait => {
      if (!trait) return;
      const enriched = enrichItemWithModifiers(trait);
      const tName = enriched?.name || (typeof trait === 'object' ? (trait.name || trait.title || trait.id) : String(trait));
      if (enriched && Array.isArray(enriched.modifiers)) {
        enriched.modifiers.forEach(mod => {
          if (!mod || typeof mod !== 'object') return;
          const val = parseInt(mod.value, 10) || 0;
          const isSit = isSituationalMod(mod);
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (!isSit) {
              if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
              else saveMods[targetSave] = val;
            }
            const saveAttrId = mapSaveToAttrId(targetSave);
            if (saveAttrId) {
              addAttrModSource(saveAttrId, {
                val,
                source: `Trait: ${tName}`,
                name: `Trait: ${tName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
            activeTraitModifiers.push({ source: tName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              if (!isSit) {
                skillMods[sKey] = (skillMods[sKey] || 0) + val;
              }
              activeTraitModifiers.push({ source: tName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: tName, sourceType: 'trait', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              if (!isSit) {
                attributeMods[mapped] += val;
              }
              addAttrModSource(mapped, {
                val,
                source: `Trait: ${tName}`,
                name: `Trait: ${tName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
              activeTraitModifiers.push({ source: tName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (!isSit) {
              if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
              else combatMods[cKey] = val;
            }
            activeTraitModifiers.push({ source: tName, target: cKey, value: val, description: mod.description });
          }
        });
      }

      // Check choice-based modifier_options (group_pool or single/pair options) on Traits
      const rawTraitOptions = (typeof trait === 'object' && trait.modifier_options) ? trait.modifier_options : enriched?.modifier_options;
      const traitGroupChoiceMod = Array.isArray(enriched?.modifiers) ? enriched.modifiers.find(m => m.type === 'skill' && m.mode === 'group_choice') : null;
      const traitRank = Math.max(1, parseInt((typeof trait === 'object' ? trait.rank : undefined) ?? enriched?.rank ?? 1, 10) || 1);
      const isRankedTrait = Boolean((typeof trait === 'object' && trait.is_ranked) || enriched?.is_ranked);
      const traitRankMult = isRankedTrait ? traitRank : 1;

      const cleanTraitId = String((typeof trait === 'object' ? trait.id : '') || enriched?.id || '').trim().toLowerCase();
      const cleanTraitName = normalizeTraitName(tName || '').toLowerCase();
      const traitSelMap = characterData?.traitSkillSelections || {};
      const traitMapEntry = (cleanTraitId && traitSelMap[cleanTraitId]) || (cleanTraitName && traitSelMap[cleanTraitName]) || null;

      if ((rawTraitOptions && rawTraitOptions.enabled && rawTraitOptions.mode === 'group_pool') || traitGroupChoiceMod) {
        const baseOptValue = parseInt(rawTraitOptions?.value ?? traitGroupChoiceMod?.value ?? 2, 10) || 2;
        const optValue = baseOptValue * traitRankMult;
        const rawSel = (typeof trait === 'object' && Array.isArray(trait.selected_skills) && trait.selected_skills.length > 0)
          ? trait.selected_skills
          : ((typeof trait === 'object' && trait.selected_skill) ? [trait.selected_skill] : null);
        const mapSel = Array.isArray(traitMapEntry?.selected_skills)
          ? traitMapEntry.selected_skills
          : (Array.isArray(traitMapEntry) ? traitMapEntry : (traitMapEntry?.selected_skill ? [traitMapEntry.selected_skill] : null));
        const selectedSkills = rawSel || mapSel || (Array.isArray(enriched?.selected_skills) ? enriched.selected_skills : []);
        const groupLabel = rawTraitOptions?.group_label || traitGroupChoiceMod?.group_label || traitGroupChoiceMod?.target || 'Skill Group Choice';

        selectedSkills.forEach(skillTarget => {
          const sKey = (skillTarget || '').toLowerCase().trim();
          if (sKey) {
            skillMods[sKey] = (skillMods[sKey] || 0) + optValue;
            activeTraitModifiers.push({
              source: `${tName} [${skillTarget}]`,
              target: skillTarget,
              value: optValue,
              description: `${tName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${groupLabel})`
            });
            activeSkillModifiers.push({
              source: `${tName} [${skillTarget}]`,
              sourceType: 'trait',
              target: skillTarget,
              value: optValue,
              description: `${tName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${groupLabel})`
            });
          }
        });
      } else if (rawTraitOptions && rawTraitOptions.enabled && Array.isArray(rawTraitOptions.options) && rawTraitOptions.options.length > 0) {
        const selectedId = (typeof trait === 'object' && trait.selected_option_id)
          ? trait.selected_option_id
          : (traitMapEntry?.selected_option_id || (typeof traitMapEntry === 'string' ? traitMapEntry : enriched?.selected_option_id));
        const activeOption = rawTraitOptions.options.find(opt => typeof opt === 'object' && opt.id === selectedId)
          || (rawTraitOptions.options.length === 1 && typeof rawTraitOptions.options[0] === 'object' ? rawTraitOptions.options[0] : null);

        if (activeOption) {
          const baseOptValue = parseInt(activeOption.value !== undefined ? activeOption.value : (rawTraitOptions.value || 2), 10) || 2;
          const optValue = baseOptValue * traitRankMult;
          const targetSkills = Array.isArray(activeOption.skills)
            ? activeOption.skills
            : (activeOption.skill ? [activeOption.skill] : []);

          targetSkills.forEach(skillTarget => {
            const sKey = (skillTarget || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + optValue;
              activeTraitModifiers.push({
                source: `${tName} [${activeOption.label || activeOption.id || 'Selected Option'}]`,
                target: skillTarget,
                value: optValue,
                description: `${tName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${activeOption.label || activeOption.id})`
              });
              activeSkillModifiers.push({
                source: `${tName} [${activeOption.label || activeOption.id || 'Selected Option'}]`,
                sourceType: 'trait',
                target: skillTarget,
                value: optValue,
                description: `${tName}: ${optValue >= 0 ? '+' : ''}${optValue} to ${skillTarget} (${activeOption.label || activeOption.id})`
              });
            }
          });
        }
      }
    });

    // 3. Process Hindrances & Disadvantages for active modifiers & penalties
    const rawHindrances = [
      ...(Array.isArray(characterData.hindrances) ? characterData.hindrances : []),
      ...(Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [])
    ];
    const seenHindNames = new Set();
    const uniqueHindrances = rawHindrances.filter(h => {
      if (!h) return false;
      const n = (typeof h === 'object' ? (h.name || h.title || h.id) : String(h)).toLowerCase();
      if (seenHindNames.has(n)) return false;
      seenHindNames.add(n);
      return true;
    });

    uniqueHindrances.forEach(hindrance => {
      if (!hindrance) return;
      const enriched = enrichItemWithModifiers(hindrance);
      const hName = enriched?.name || (typeof hindrance === 'object' ? (hindrance.name || hindrance.title || hindrance.id) : String(hindrance));
      if (enriched && Array.isArray(enriched.modifiers)) {
        enriched.modifiers.forEach(mod => {
          if (!mod || typeof mod !== 'object') return;
          const val = parseInt(mod.value, 10) || 0;
          const isSit = isSituationalMod(mod);
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (!isSit) {
              if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
              else saveMods[targetSave] = val;
            }
            const saveAttrId = mapSaveToAttrId(targetSave);
            if (saveAttrId) {
              addAttrModSource(saveAttrId, {
                val,
                source: `Hindrance: ${hName}`,
                name: `Hindrance: ${hName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
            activeHindranceModifiers.push({ source: hName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              if (!isSit) {
                skillMods[sKey] = (skillMods[sKey] || 0) + val;
              }
              activeHindranceModifiers.push({ source: hName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: hName, sourceType: 'hindrance', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              if (!isSit) {
                attributeMods[mapped] += val;
              }
              addAttrModSource(mapped, {
                val,
                source: `Hindrance: ${hName}`,
                name: `Hindrance: ${hName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
              activeHindranceModifiers.push({ source: hName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (!isSit) {
              if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
              else combatMods[cKey] = val;
            }
            activeHindranceModifiers.push({ source: hName, target: cKey, value: val, description: mod.description });
          } else if (mod.type === 'condition' || mod.type === 'disadvantage') {
            activeHindranceModifiers.push({ source: hName, target: mod.target, value: val, description: mod.description });
          }
        });
      }
    });

    // 4. Process Augmentations
    const rawAugs = Array.isArray(characterData.augmentations) ? characterData.augmentations : [];
    rawAugs.forEach(aug => {
      if (!aug) return;
      const enriched = enrichItemWithModifiers(aug);
      const aName = enriched?.name || (typeof aug === 'object' ? (aug.name || aug.title || aug.id) : String(aug));
      if (enriched && Array.isArray(enriched.modifiers)) {
        enriched.modifiers.forEach(mod => {
          if (!mod || typeof mod !== 'object') return;
          const val = parseInt(mod.value, 10) || 0;
          const isSit = isSituationalMod(mod);
          if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              if (!isSit) {
                skillMods[sKey] = (skillMods[sKey] || 0) + val;
              }
              activeSkillModifiers.push({ source: aName, sourceType: 'augmentation', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              if (!isSit) {
                attributeMods[mapped] += val;
              }
              addAttrModSource(mapped, {
                val,
                source: `Augmentation: ${aName}`,
                name: `Augmentation: ${aName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
          } else if (mod.type === 'save') {
            const targetSave = mod.target;
            if (!isSit && targetSave) {
              if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
              else saveMods[targetSave] = val;
            }
            const saveAttrId = mapSaveToAttrId(targetSave);
            if (saveAttrId) {
              addAttrModSource(saveAttrId, {
                val,
                source: `Augmentation: ${aName}`,
                name: `Augmentation: ${aName}`,
                isSituational: isSit,
                condition: mod.condition || null
              });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (!isSit) {
              if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
              else combatMods[cKey] = val;
            }
          }
        });
      }
    });

    // 5. Process Possessed Equipment Across All Property Lists
    const activeEquipmentModifiers = [];
    const propertyLists = [
      characterData.gear,
      characterData.equipment,
      characterData.weapons,
      characterData.weaponry,
      characterData.armor,
      characterData.armoring,
      characterData.other,
      characterData.misc,
      characterData.mecha,
      characterData.architecture
    ];

    const seenEqItemKeys = new Set();
    propertyLists.forEach(propList => {
      if (!Array.isArray(propList)) return;
      propList.forEach(eqItem => {
        if (!eqItem) return;
        const itemKey = typeof eqItem === 'object' ? (eqItem.id || eqItem.name) : String(eqItem);
        if (itemKey && seenEqItemKeys.has(itemKey)) return;
        if (itemKey) seenEqItemKeys.add(itemKey);

        const parsedEq = typeof eqItem === 'object' ? eqItem : { name: String(eqItem) };
        const enrichedEq = enrichItemWithModifiers(parsedEq);
        const eqTitle = enrichedEq?.name || parsedEq.name || 'Equipment';
        if (enrichedEq && Array.isArray(enrichedEq.modifiers)) {
          enrichedEq.modifiers.forEach(mod => {
            if (!mod || typeof mod !== 'object') return;
            const val = parseInt(mod.value, 10) || 0;
            if (!val) return;
            const isSit = isSituationalMod(mod);
            if (mod.type === 'attribute') {
              const aKey = (mod.target || '').toLowerCase().trim();
              const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
              if (attributeMods[mapped] !== undefined) {
                if (!isSit) attributeMods[mapped] += val;
                addAttrModSource(mapped, {
                  val,
                  source: `Equipment: ${eqTitle}`,
                  name: `Equipment: ${eqTitle}`,
                  isSituational: isSit,
                  condition: mod.condition || null
                });
              }
            } else if (mod.type === 'save') {
              const targetSave = mod.target;
              if (!isSit && targetSave) {
                if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
                else saveMods[targetSave] = val;
              }
              const saveAttrId = mapSaveToAttrId(targetSave);
              if (saveAttrId) {
                addAttrModSource(saveAttrId, {
                  val,
                  source: `Equipment: ${eqTitle}`,
                  name: `Equipment: ${eqTitle}`,
                  isSituational: isSit,
                  condition: mod.condition || null
                });
              }
            }
          });
        }
        const eqMods = extractEquipmentSkillModifiers(parsedEq);
        eqMods.forEach(em => {
          const sKey = (em.target || '').toLowerCase().trim();
          if (sKey) {
            skillMods[sKey] = (skillMods[sKey] || 0) + em.value;
            activeEquipmentModifiers.push(em);
            activeSkillModifiers.push(em);
          }
        });
      });
    });

    return {
      attributeMods,
      attrMods: attributeMods,
      attributeModSources,
      combatMods,
      skillMods,
      saveMods,
      identityPools,
      activeFeatureModifiers,
      activeTraitModifiers,
      activeHindranceModifiers,
      activeEquipmentModifiers,
      activeSkillModifiers
    };
  }, [
    characterData?.['char-archetype'],
    characterData?.['char-species'],
    characterData?.['char-occu'],
    characterData?.['char-origin'],
    characterData?.['char-faction'],
    characterData?.features,
    characterData?.traits,
    characterData?.hindrances,
    characterData?.disadvantages,
    characterData?.augmentations,
    characterData?.gear,
    characterData?.equipment,
    characterData?.weapons,
    characterData?.weaponry,
    characterData?.armor,
    characterData?.armoring,
    characterData?.other,
    characterData?.misc,
    characterData?.mecha,
    characterData?.architecture,
    characterData?.speciesAllocations,
    characterData?.occuAllocations,
    characterData?.originAllocations,
    characterData?.factionAllocations,
    dbData
  ]);

  // Helper to get allocated identity pool attribute points (stored in characterData[attrId] alongside CP/AP purchases)
  const getGrantedPoolAttrPts = useCallback((attrId, data = characterData) => {
    if (!data || !attrId) return 0;
    return (
      (parseInt(data.speciesAllocations?.attributes?.[attrId] || 0, 10) || 0) +
      (parseInt(data.occuAllocations?.attributes?.[attrId] || 0, 10) || 0) +
      (parseInt(data.originAllocations?.attributes?.[attrId] || 0, 10) || 0) +
      (parseInt(data.factionAllocations?.attributes?.[attrId] || 0, 10) || 0)
    );
  }, [characterData]);

  // Helper to get strictly CP/AP purchased primary attribute base (excluding species/identity pool bonuses)
  const getPrimaryPurchasedBase = useCallback((attrId, data = characterData) => {
    if (!data || !attrId) return 0;
    const rawVal = parseInt(data[attrId] || 0, 10) || 0;
    return Math.max(0, rawVal - getGrantedPoolAttrPts(attrId, data));
  }, [characterData, getGrantedPoolAttrPts]);

  // Attribute Mod & Total Calculation Helpers
  const getAttrMod = useCallback((attrId) => {
    const userMod = parseInt(characterData[`${attrId}-mod`] || 0, 10) || 0;
    const identityMod = computedModifiers.attributeMods[attrId] || 0;
    let saveMod = 0;
    if (attrId === 'attr-fortitude') saveMod = computedModifiers.saveMods?.Fortitude || 0;
    else if (attrId === 'attr-reflex') saveMod = computedModifiers.saveMods?.Reflex || 0;
    else if (attrId === 'attr-will' || attrId === 'attr-willpower') saveMod = computedModifiers.saveMods?.Will || 0;
    let primaryModEffect = 0;
    if (SUB_TO_PRIMARY_ATTR[attrId]) {
      const primaryKey = SUB_TO_PRIMARY_ATTR[attrId];
      const pUserMod = parseInt(characterData[`${primaryKey}-mod`] || 0, 10) || 0;
      const pIdentityMod = computedModifiers.attributeMods[primaryKey] || 0;
      primaryModEffect = (pUserMod + pIdentityMod) * 2;
    }
    return primaryModEffect + userMod + identityMod + saveMod;
  }, [characterData, computedModifiers.attributeMods, computedModifiers.saveMods]);

  // Helper to get dynamic sub-attribute base strictly from CP/AP purchased Primary Attribute: (Purchased Primary * 2) + 2
  const getSubAttrBase = useCallback((subKey, data = characterData) => {
    const primaryKey = SUB_TO_PRIMARY_ATTR[subKey];
    if (!primaryKey) return 2;
    const pVal = getPrimaryPurchasedBase(primaryKey, data);
    return (pVal * 2) + 2;
  }, [characterData, getPrimaryPurchasedBase]);

  const getAttrTotal = useCallback((attrId) => {
    let val;
    if (SUB_TO_PRIMARY_ATTR[attrId]) {
      const primaryKey = SUB_TO_PRIMARY_ATTR[attrId];
      const pVal = getPrimaryPurchasedBase(primaryKey, characterData);
      const base = (pVal * 2) + 2;
      const rawPVal = parseInt(characterData[primaryKey] || 0, 10) || 0;
      const rawUnmodifiedBase = (rawPVal * 2) + 2;
      const explicitRaw = characterData[attrId] ?? (
        attrId === 'attr-logic' ? characterData['attr-reason'] :
        attrId === 'attr-reason' ? characterData['attr-logic'] :
        attrId === 'attr-will' ? characterData['attr-willpower'] :
        attrId === 'attr-willpower' ? characterData['attr-will'] :
        undefined
      );
      const parsedExplicit = parseInt(explicitRaw, 10);
      const purchasedBonus = (!isNaN(parsedExplicit) && parsedExplicit > 0)
        ? Math.max(0, parsedExplicit - rawUnmodifiedBase)
        : 0;
      val = base + purchasedBonus;
    } else {
      val = getPrimaryPurchasedBase(attrId, characterData);
    }
    return val + getAttrMod(attrId);
  }, [characterData, getAttrMod, getPrimaryPurchasedBase]);

  // Skill Check Breakdown Helper (Score, Attribute Used, Rank, Modifiers, Equipment)
  const getSkillBreakdown = useCallback((skill, extraOptions = {}) => {
    return getSkillCheckBreakdown(skill, characterData, dbData, {
      attributeMods: computedModifiers.attributeMods,
      getAttrTotal,
      ...extraOptions
    });
  }, [characterData, dbData, computedModifiers.attributeMods, getAttrTotal]);

  // Derived Stats Auto-Calculation
  const derivedStats = useMemo(() => {
    const stamina = getAttrTotal('attr-stamina');

    // In Tangent, Stamina directly determines base Toughness to reduce wound damage point-for-point
    const toughness = stamina;

    const fortitude = getAttrTotal('attr-fortitude');

    const wisdom = getAttrTotal('attr-wisdom');

    const will = getAttrTotal('attr-will');

    const charisma = getAttrTotal('attr-charisma');
    // Debt limit in Tangent RPG is Charisma score + 1
    const maxKarmaDebt = Math.max(1, charisma + 1);

    // Canonical Tangent starting base values: Base 30 for Health, Base 30 for Vitality, Base 60 for Structure
    const baseHealth = 30;
    const baseVitality = 30;
    const baseStructure = 60;
    const maxStatIncrease = Math.max(0, stamina * 5);
    
    // Canonical Tangent starting Karma: 3 points by default
    const baseKarma = 3;

    // Karmic Blessing feature increases maximum Karma Pool by +1 point per rank
    let karmicBlessingBonus = 0;
    const featuresList = Array.isArray(characterData.features) ? characterData.features : [];
    featuresList.forEach(f => {
      const name = (typeof f === 'string' ? f : (f?.name || f?.id || '')).toLowerCase();
      if (name.includes('karmic blessing')) {
        const ranks = typeof f === 'object' && f?.rank ? Math.max(1, parseInt(f.rank, 10) || 1) : 1;
        karmicBlessingBonus += ranks;
      } else if (name.includes('independence') || name.includes('optimistic') || name.includes('persistence') || name.includes('risk-taking')) {
        karmicBlessingBonus += 1;
      }
    });

    // Hindrances such as Unlucky reduce maximum Karma pool
    let hindranceKarmaPenalty = 0;
    const disadvantagesList = Array.isArray(characterData.disadvantages) ? characterData.disadvantages : [];
    disadvantagesList.forEach(d => {
      const name = (typeof d === 'string' ? d : (d?.name || d?.id || '')).toLowerCase();
      if (name.includes('unlucky')) {
        const bp = typeof d === 'object' && d?.bp ? parseInt(d.bp, 10) : 3;
        if (bp >= 9) hindranceKarmaPenalty += 6;
        else if (bp >= 6) hindranceKarmaPenalty += 4;
        else hindranceKarmaPenalty += 2;
      }
    });

    const maxKarma = Math.max(0, baseKarma + karmicBlessingBonus - hindranceKarmaPenalty);
    const maxAllowed = 120;
    
    const currentHealth = parseInt(characterData['health'], 10);
    const currentVitality = parseInt(characterData['vitality'], 10);
    const currentStructure = parseInt(characterData['structure'], 10);

    let purchasedHealth = 0;
    if (!isNaN(currentHealth) && currentHealth > baseHealth) {
      purchasedHealth = Math.min(currentHealth - baseHealth, maxStatIncrease);
    }

    let purchasedVitality = 0;
    if (!isNaN(currentVitality) && currentVitality > baseVitality) {
      purchasedVitality = Math.min(currentVitality - baseVitality, maxStatIncrease);
    }

    let purchasedStructure = 0;
    if (!isNaN(currentStructure) && currentStructure > baseStructure) {
      purchasedStructure = currentStructure - baseStructure;
    }

    // Structure is calculated by combining Vitality and Health for non-typical anatomies
    const speciesStr = String(characterData?.['char-species'] || '').toLowerCase();
    const archetypeStr = String(characterData?.['char-archetype'] || '').toLowerCase();
    const isSynthetic = speciesStr.includes('synthetic') ||
      speciesStr.includes('mekan') ||
      speciesStr.includes('construct') ||
      speciesStr.includes('golem') ||
      speciesStr.includes('ooze') ||
      speciesStr.includes('undead') ||
      speciesStr.includes('mecha') ||
      speciesStr.includes('elemental') ||
      archetypeStr.includes('synthetic');

    const effectiveHealth = isSynthetic ? 0 : (baseHealth + purchasedHealth);
    const effectiveVitality = isSynthetic ? 0 : (baseVitality + purchasedVitality);
    const totalStructure = isSynthetic
      ? (baseStructure + purchasedStructure + purchasedHealth + purchasedVitality)
      : (purchasedStructure > 0 ? (baseStructure + purchasedStructure) : 60);

    const speciesRestProfile = getSpeciesRestProfile(characterData);
    const lightRestsToday = parseInt(characterData?.light_rests_today || 0, 10);

    // Tangent Economic Unified Field Theory (EUFT) & Wealth Score Determination
    const wealthData = calculateCharacterWealth(characterData);

    return {
      health: isSynthetic ? 0 : baseHealth,
      vitality: isSynthetic ? 0 : baseVitality,
      stamina: Math.max(0, stamina),
      staminaDR: Math.max(0, stamina),
      maxStatIncrease,
      fortitude,
      will,
      saveMods: computedModifiers.saveMods,
      maxHealth: effectiveHealth,
      maxVitality: effectiveVitality,
      karma: maxKarma,
      maxKarma,
      maxKarmaDebt,
      toughness,
      structure: totalStructure,
      maxStructure: totalStructure,
      isSynthetic,
      maxAllowed,
      purchasedHealth: isSynthetic ? 0 : purchasedHealth,
      purchasedVitality: isSynthetic ? 0 : purchasedVitality,
      purchasedStructure,
      speciesRestProfile,
      lightRestsToday,
      maxLightRests: 4,
      // Wealth & Financial Status
      wealthScore: wealthData.computedWS,
      wealthStatus: wealthData.status,
      wealthStatusName: wealthData.statusName,
      wealthAutoBuyCr: wealthData.autoBuyCr,
      wealthCreditValue: wealthData.creditValue,
      wealthBreakdown: wealthData.breakdown,
      wealthLiquidCredits: wealthData.liquidCredits,
      wealthTradeGoods: wealthData.tradeGoods,
      wealthTotalTradeGoodsCr: wealthData.totalTradeGoodsCr,
      wealthTotalLiquidCr: wealthData.totalLiquidCr,
      wealthDebits: wealthData.debits,
      wealthTotalDebtCr: wealthData.totalDebtCr,
      wealthNetLiquidPosition: wealthData.netLiquidPosition
    };
  }, [
    characterData?.['attr-stamina'],
    characterData?.['attr-fortitude'],
    characterData?.['attr-wisdom'],
    characterData?.['attr-will'],
    characterData?.['attr-charisma'],
    characterData?.['char-species'],
    characterData?.['char-archetype'],
    characterData?.['char-occu'],
    characterData?.['char-origin'],
    characterData?.['char-faction'],
    characterData?.['tech-level'],
    characterData?.['wealth-score-mod'],
    characterData?.['wealth-score-override'],
    characterData?.['credits'],
    characterData?.['wealth-credits'],
    characterData?.['trade-goods'],
    characterData?.['wealth-trade-goods'],
    characterData?.['debits'],
    characterData?.['wealth-debits'],
    characterData?.['health'],
    characterData?.['vitality'],
    characterData?.['structure'],
    characterData?.features,
    characterData?.traits,
    characterData?.hindrances,
    characterData?.disadvantages,
    characterData?.['pool-faction-features'],
    characterData?.['pool-occu-traits'],
    characterData?.['pool-origin-traits'],
    characterData?.['pool-species-traits'],
    characterData?.skills,
    getAttrMod,
    getAttrTotal
  ]);

  // Automatically keep health/vitality/structure/karma synchronized if unmodified (or below base)
  useEffect(() => {
    setCharacterData(prev => {
      let needsUpdate = false;
      const updates = {};
      
      const currentHealth = parseInt(prev.health, 10);
      if (isNaN(currentHealth) || currentHealth < derivedStats.health) {
        updates.health = derivedStats.health;
        needsUpdate = true;
      }
      
      const currentVitality = parseInt(prev.vitality, 10);
      if (isNaN(currentVitality) || currentVitality < derivedStats.vitality) {
        updates.vitality = derivedStats.vitality;
        needsUpdate = true;
      }

      const currentStructure = parseInt(prev.structure, 10);
      if (isNaN(currentStructure) || currentStructure !== derivedStats.structure) {
        updates.structure = derivedStats.structure;
        needsUpdate = true;
      }
      
      const currentKarma = parseInt(prev.karma, 10);
      if (isNaN(currentKarma)) {
        updates.karma = derivedStats.maxKarma;
        needsUpdate = true;
      }

      const currentPlotPoints = parseInt(prev['plot-points'], 10);
      if (isNaN(currentPlotPoints)) {
        updates['plot-points'] = 0;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [derivedStats.health, derivedStats.vitality, derivedStats.structure, derivedStats.maxKarma, setCharacterData]);

  // Comprehensive Character Point & Pool Economy Calculation
  const economyBreakdown = useMemo(() => {
    return computeEconomyBreakdown(characterData, {
      derivedStats,
      dbData,
      identityPools: computedModifiers.identityPools
    });
  }, [characterData, derivedStats, computedModifiers.identityPools, dbData]);

  // Top level computed spent CP
  const computeSpentCP = useCallback(() => {
    return economyBreakdown.spentCP;
  }, [economyBreakdown]);

  // Dynamically compute which movement modes are currently enabled for the character
  const enabledMovementModes = useMemo(() => {
    const modes = new Set(['walk']); // Ground walk is always enabled as base

    ['swim', 'climb', 'fly', 'burrow', 'flicker'].forEach(mode => {
      const val = parseInt(characterData[`move-${mode}`] || 0, 10);
      if (val > 0) modes.add(mode);
    });

    const speciesVal = characterData['char-species'];
    const speciesObj = typeof speciesVal === 'object' ? speciesVal : (dbData.species || []).find(s => (s.name || s.id || '').toLowerCase() === String(speciesVal || '').toLowerCase());
    if (speciesObj) {
      const moveArray = Array.isArray(speciesObj.movement) ? speciesObj.movement : [];
      const moveStr = JSON.stringify(speciesObj).toLowerCase();
      if (moveArray.some(m => String(m).includes('swim')) || moveStr.includes('swim') || moveStr.includes('aquatic') || moveStr.includes('amphibious')) modes.add('swim');
      if (moveArray.some(m => String(m).includes('climb')) || moveStr.includes('climb') || moveStr.includes('arboreal')) modes.add('climb');
      if (moveArray.some(m => String(m).includes('fly') || String(m).includes('wing')) || moveStr.includes('flight') || moveStr.includes('winged') || moveStr.includes('aerial')) modes.add('fly');
      if (moveArray.some(m => String(m).includes('burrow')) || moveStr.includes('burrow')) modes.add('burrow');
      if (moveArray.some(m => String(m).includes('flicker') || String(m).includes('phase')) || moveStr.includes('flicker') || moveStr.includes('teleport')) modes.add('flicker');
    }

    const allFeats = [
      ...(Array.isArray(characterData.features) ? characterData.features : []),
      ...(Array.isArray(characterData.augmentations) ? characterData.augmentations : []),
      ...(Array.isArray(characterData.awakened) ? characterData.awakened : [])
    ];

    allFeats.forEach(f => {
      const name = (typeof f === 'object' ? (f.name || f.title || f.id || '') : String(f)).toLowerCase();
      const desc = (typeof f === 'object' ? (f.description || f.mechanic || '') : '').toLowerCase();
      const combined = `${name} ${desc}`;

      if (combined.includes('swim') || combined.includes('amphibious') || combined.includes('aquatic')) modes.add('swim');
      if (combined.includes('climb') || combined.includes('climber') || combined.includes('arboreal')) modes.add('climb');
      if (combined.includes('fly') || combined.includes('flight') || combined.includes('wings') || combined.includes('winged') || combined.includes('jetpack') || combined.includes('aerial')) modes.add('fly');
      if (combined.includes('burrow') || combined.includes('tunneler') || combined.includes('burrowing')) modes.add('burrow');
      if (combined.includes('flicker') || combined.includes('phase shift') || combined.includes('dimension') || combined.includes('teleport') || combined.includes('blink')) modes.add('flicker');
    });

    return Array.from(modes);
  }, [characterData, dbData.species]);

  // Identity Pool Allocation Helpers (Skills, Features, Attributes)
  const allocatePoolSkillRank = useCallback((poolKey, skillName, newRank, delta, maxSP = 20) => {
    if (!skillName || !poolKey) return;
    const sNameLower = skillName.trim().toLowerCase();

    const CATEGORY_NAMES = new Set([
      'knowledge', 'knowledges', 'vocation', 'vocations', 'discipline', 'disciplines', 'metafocus',
      'skill', 'skills', 'general', 'physical', 'mental', 'social', 'combat', 'meta'
    ]);
    if (CATEGORY_NAMES.has(sNameLower)) {
      return;
    }

    let innerName = skillName;
    const parenMatch = skillName.match(/^([^(]+)\(([^)]+)\)$/);
    if (parenMatch) {
      innerName = parenMatch[2].trim();
    } else {
      innerName = skillName.replace(/^(knowledge|vocation|discipline|metafocus)\s*[-:]?\s*/i, '').trim();
    }
    const cleanId = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const innerCleanId = innerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const innerNameLower = innerName.toLowerCase();
    
    const canonSkill = ALL_CANONICAL_SKILLS.find(s => {
      const n = (s.name || '').toLowerCase();
      const idWithoutPrefix = (s.id || '').replace(/^[a-z]+-/, '');
      return n === sNameLower || s.id === cleanId || idWithoutPrefix === cleanId ||
             n === innerNameLower || s.id === innerCleanId || idWithoutPrefix === innerCleanId;
    });

    const canonicalId = canonSkill?.id || innerCleanId || cleanId;
    const canonRankKey = `skill-${canonicalId}-rank`;
    const canonBaseKey = `skill-${canonicalId}-base`;
    const canonGroupKey = `skill-${canonicalId}-group`;
    const canonSubKey = `skill-${canonicalId}-subcategory`;
    const canonNameKey = `skill-${canonicalId}-name`;

    const legacyRankKey = `skill-${cleanId}-rank`;
    const legacyNameKey = `skill-${cleanId}-name`;

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, features: [] };
      const currentSkills = { ...(pool.skills || {}) };
      const currentRankInPool = parseInt(currentSkills[skillName] || 0, 10);
      const targetRankInPool = Math.max(0, parseInt(newRank, 10) || 0);
      const actualDelta = targetRankInPool - currentRankInPool;

      if (targetRankInPool > 0) {
        currentSkills[skillName] = targetRankInPool;
      } else {
        delete currentSkills[skillName];
      }

      const currentGlobalRank = parseInt(prev[canonRankKey] ?? prev[legacyRankKey] ?? 0, 10);
      const newGlobalRank = Math.min(20, Math.max(0, currentGlobalRank + actualDelta));

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          skills: currentSkills
        }
      };

      if (newGlobalRank > 0) {
        updates[canonRankKey] = newGlobalRank;
        updates[canonNameKey] = canonSkill?.name || prev[canonNameKey] || innerName || skillName;
        updates[legacyRankKey] = newGlobalRank;
        updates[legacyNameKey] = canonSkill?.name || prev[legacyNameKey] || innerName || skillName;

        if (canonSkill?.baseAttr && !prev[canonBaseKey]) {
          updates[canonBaseKey] = canonSkill.baseAttr;
        }
        if (canonSkill?.group && !prev[canonGroupKey]) {
          updates[canonGroupKey] = canonSkill.group;
        }
        if (canonSkill?.subcategory && !prev[canonSubKey]) {
          updates[canonSubKey] = canonSkill.subcategory;
        }
      } else {
        const idCandidates = new Set([
          canonicalId,
          cleanId,
          canonicalId.replace(/^[a-z]+-/, ''),
          cleanId.replace(/^[a-z]+-/, ''),
          innerCleanId
        ].filter(Boolean));

        idCandidates.forEach(cid => {
          delete updates[`skill-${cid}-rank`];
          delete updates[`skill-${cid}-base`];
          delete updates[`skill-${cid}-mod`];
          delete updates[`skill-${cid}-name`];
          delete updates[`skill-${cid}-group`];
          delete updates[`skill-${cid}-subcategory`];
        });
      }

      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const togglePoolTrait = useCallback((poolKey, traitName, traitDetail = {}, maxTraits = 2) => {
    if (!traitName || !poolKey) return;
    const cleanTitle = normalizeTraitName(traitName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = [...(pool.traits || [])];
      const isAlreadySelected = currentTraits.some(t => normalizeTraitName(t).toLowerCase() === cleanTitle.toLowerCase() || String(t).toLowerCase() === traitName.toLowerCase());

      let updatedPoolTraits;
      let updatedGlobalTraits = Array.isArray(prev.traits) ? [...prev.traits] : [];
      let updatedGlobalFeatures = Array.isArray(prev.features) ? [...prev.features] : [];

      if (isAlreadySelected) {
        updatedPoolTraits = currentTraits.filter(t => normalizeTraitName(t).toLowerCase() !== cleanTitle.toLowerCase() && String(t).toLowerCase() !== traitName.toLowerCase());
        updatedGlobalTraits = updatedGlobalTraits.filter(t => {
          const tName = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
          return normalizeTraitName(tName).toLowerCase() !== cleanTitle.toLowerCase() && tName.toLowerCase() !== traitName.toLowerCase();
        });
        updatedGlobalFeatures = updatedGlobalFeatures.filter(f => {
          const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
          return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== traitName.toLowerCase();
        });
      } else {
        if (currentTraits.length >= maxTraits && poolKey !== 'originAllocations') {
          showToast({ type: 'warning', text: `Maximum of ${maxTraits} traits already selected in this pool.` });
          return prev;
        }
        const isGrantedPool = ['speciesAllocations', 'occuAllocations', 'originAllocations', 'factionAllocations'].includes(poolKey);
        updatedPoolTraits = [...currentTraits, cleanTitle];
        const isOrigin = poolKey === 'originAllocations';
        const isFreeOriginTrait = isOrigin && currentTraits.length < 2;
        const isGrantedTrait = isOrigin ? isFreeOriginTrait : isGrantedPool;

        const rawTraitObj = {
          id: traitDetail.id || `trait_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: traitDetail.category || traitDetail.trait_type || (poolKey === 'originAllocations' ? 'Origin Trait' : poolKey === 'occuAllocations' ? 'Occupation Trait' : poolKey === 'factionAllocations' ? 'Faction Trait' : 'Species Trait'),
          trait_type: traitDetail.trait_type || (poolKey === 'originAllocations' ? 'Origin Trait' : poolKey === 'occuAllocations' ? 'Occupational Trait' : poolKey === 'factionAllocations' ? 'Faction Trait' : 'Species Trait'),
          trait_tier: traitDetail.trait_tier || traitDetail.tier || 'Basic',
          classification: traitDetail.classification || 'Physical',
          source: poolKey === 'occuAllocations' ? 'occupation' : poolKey === 'originAllocations' ? 'origin' : poolKey === 'factionAllocations' ? 'faction' : poolKey === 'speciesAllocations' ? 'species' : poolKey.replace('Allocations', ''),
          description: traitDetail.description || traitDetail.desc || traitDetail.mechanics || '',
          mechanic: traitDetail.mechanic || traitDetail.mechanics || '',
          mechanics: traitDetail.mechanics || traitDetail.mechanic || '',
          rules: traitDetail.rules || traitDetail.special_rules || '',
          special_rules: traitDetail.special_rules || traitDetail.rules || '',
          notes: traitDetail.notes || '',
          modifiers: Array.isArray(traitDetail.modifiers) ? traitDetail.modifiers : [],
          bp: isGrantedTrait ? 0 : (traitDetail.bp !== undefined ? traitDetail.bp : 1),
          standaloneBp: traitDetail.bp !== undefined ? traitDetail.bp : 1,
          cp: isGrantedTrait ? 0 : (traitDetail.cp !== undefined ? traitDetail.cp : 1),
          standaloneCp: traitDetail.cp !== undefined ? traitDetail.cp : (traitDetail.bp !== undefined ? traitDetail.bp : 1),
          isGranted: isGrantedTrait,
          isPaidOriginTrait: isOrigin ? !isFreeOriginTrait : false
        };
        const newTraitObj = enrichItemWithModifiers(rawTraitObj, traitDetail);
        updatedGlobalTraits.push(newTraitObj);
        updatedGlobalFeatures.push(newTraitObj);
      }

      if (poolKey === 'originAllocations') {
        const reconcileOriginTraits = (list) => list.map(item => {
          const itemTitle = normalizeTraitName(typeof item === 'object' ? (item.name || item.title || item.id) : String(item)).toLowerCase();
          const pIdx = updatedPoolTraits.findIndex(pt => normalizeTraitName(typeof pt === 'object' ? (pt.name || pt.id) : pt).toLowerCase() === itemTitle);
          if (pIdx !== -1) {
            const isFree = pIdx < 2;
            return {
              ...item,
              isGranted: isFree,
              isPaidOriginTrait: !isFree,
              cp: isFree ? 0 : 1,
              bp: isFree ? 0 : 1
            };
          }
          return item;
        });
        updatedGlobalTraits = reconcileOriginTraits(updatedGlobalTraits);
        updatedGlobalFeatures = reconcileOriginTraits(updatedGlobalFeatures);
      }

      const extraFields = {};
      if (poolKey === 'occuAllocations') {
        extraFields['char-occu-traits'] = updatedPoolTraits;
        extraFields.occu_traits = updatedPoolTraits;
      } else if (poolKey === 'originAllocations') {
        extraFields['char-origin-traits'] = updatedPoolTraits;
        extraFields.origin_traits = updatedPoolTraits;
      }

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: updatedPoolTraits
        },
        traits: updatedGlobalTraits,
        features: updatedGlobalFeatures,
        ...extraFields
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const removePoolTrait = useCallback((poolKey, traitName) => {
    if (!traitName || !poolKey) return;
    const cleanTitle = normalizeTraitName(traitName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentTraits = Array.isArray(pool.traits) ? pool.traits : [];
      const updatedPoolTraits = currentTraits.filter(t => normalizeTraitName(t).toLowerCase() !== cleanTitle.toLowerCase() && String(t).toLowerCase() !== traitName.toLowerCase());
      
      let currentGlobalTraits = Array.isArray(prev.traits) ? prev.traits : [];
      let updatedGlobalTraits = currentGlobalTraits.filter(t => {
        const tName = typeof t === 'object' ? (t.name || t.title || t.id) : String(t);
        return normalizeTraitName(tName).toLowerCase() !== cleanTitle.toLowerCase() && tName.toLowerCase() !== traitName.toLowerCase();
      });

      let currentGlobalFeatures = Array.isArray(prev.features) ? prev.features : [];
      let updatedGlobalFeatures = currentGlobalFeatures.filter(f => {
        const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
        return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== traitName.toLowerCase();
      });

      if (poolKey === 'originAllocations') {
        const reconcileOriginTraits = (list) => list.map(item => {
          const itemTitle = normalizeTraitName(typeof item === 'object' ? (item.name || item.title || item.id) : String(item)).toLowerCase();
          const pIdx = updatedPoolTraits.findIndex(pt => normalizeTraitName(typeof pt === 'object' ? (pt.name || pt.id) : pt).toLowerCase() === itemTitle);
          if (pIdx !== -1) {
            const isFree = pIdx < 2;
            return {
              ...item,
              isGranted: isFree,
              isPaidOriginTrait: !isFree,
              cp: isFree ? 0 : 1,
              bp: isFree ? 0 : 1
            };
          }
          return item;
        });
        updatedGlobalTraits = reconcileOriginTraits(updatedGlobalTraits);
        updatedGlobalFeatures = reconcileOriginTraits(updatedGlobalFeatures);
      }

      const extraFields = {};
      if (poolKey === 'occuAllocations') {
        extraFields['char-occu-traits'] = updatedPoolTraits;
        extraFields.occu_traits = updatedPoolTraits;
      } else if (poolKey === 'originAllocations') {
        extraFields['char-origin-traits'] = updatedPoolTraits;
        extraFields.origin_traits = updatedPoolTraits;
      }

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          traits: updatedPoolTraits
        },
        traits: updatedGlobalTraits,
        features: updatedGlobalFeatures,
        ...extraFields
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const togglePoolFeature = useCallback((poolKey, featureName, featureDetail = {}, maxFeatures = 2) => {
    if (!featureName || !poolKey) return;
    const cleanTitle = normalizeTraitName(featureName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = [...(pool.features || [])];
      const isAlreadySelected = currentFeats.some(f => normalizeTraitName(f).toLowerCase() === cleanTitle.toLowerCase() || String(f).toLowerCase() === featureName.toLowerCase());

      let updatedPoolFeats;
      let updatedGlobalFeats = Array.isArray(prev.features) ? [...prev.features] : [];

      if (isAlreadySelected) {
        updatedPoolFeats = currentFeats.filter(f => normalizeTraitName(f).toLowerCase() !== cleanTitle.toLowerCase() && String(f).toLowerCase() !== featureName.toLowerCase());
        updatedGlobalFeats = updatedGlobalFeats.filter(f => {
          const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
          return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== featureName.toLowerCase();
        });
      } else {
        if (currentFeats.length >= maxFeatures) {
          showToast({ type: 'warning', text: `Maximum of ${maxFeatures} features already selected in this pool.` });
          return prev;
        }
        updatedPoolFeats = [...currentFeats, cleanTitle];
        const isGrantedPool = ['speciesAllocations', 'occuAllocations', 'originAllocations', 'factionAllocations'].includes(poolKey);
        const rawFeatObj = {
          id: featureDetail.id || `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: cleanTitle,
          category: featureDetail.category || (poolKey === 'factionAllocations' ? 'Faction Feature' : poolKey === 'speciesAllocations' ? 'Species Feature' : poolKey === 'occuAllocations' ? 'Occupation Feature' : poolKey === 'originAllocations' ? 'Origin Feature' : 'General Feature'),
          source: poolKey === 'occuAllocations' ? 'occupation' : poolKey === 'originAllocations' ? 'origin' : poolKey === 'factionAllocations' ? 'faction' : poolKey === 'speciesAllocations' ? 'species' : poolKey.replace('Allocations', ''),
          description: featureDetail.description || featureDetail.mechanic || '',
          mechanic: featureDetail.mechanic || featureDetail.mechanics || '',
          mechanics: featureDetail.mechanics || featureDetail.mechanic || '',
          rules: featureDetail.rules || featureDetail.special_rules || '',
          special_rules: featureDetail.special_rules || featureDetail.rules || '',
          notes: featureDetail.notes || '',
          modifiers: Array.isArray(featureDetail.modifiers) ? featureDetail.modifiers : [],
          cp: isGrantedPool ? 0 : (featureDetail.cp !== undefined ? featureDetail.cp : 3),
          standaloneCp: featureDetail.cp !== undefined ? featureDetail.cp : 3,
          isGranted: isGrantedPool
        };
        const newFeatObj = enrichItemWithModifiers(rawFeatObj, featureDetail);
        updatedGlobalFeats.push(newFeatObj);
      }

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          features: updatedPoolFeats
        },
        features: updatedGlobalFeats
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const removePoolFeature = useCallback((poolKey, featureName) => {
    if (!featureName || !poolKey) return;
    const cleanTitle = normalizeTraitName(featureName);

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, traits: [], features: [] };
      const currentFeats = Array.isArray(pool.features) ? pool.features : [];
      const updatedPoolFeats = currentFeats.filter(f => normalizeTraitName(f).toLowerCase() !== cleanTitle.toLowerCase() && String(f).toLowerCase() !== featureName.toLowerCase());
      
      const currentGlobalFeats = Array.isArray(prev.features) ? prev.features : [];
      const updatedGlobalFeats = currentGlobalFeats.filter(f => {
        const fName = typeof f === 'object' ? (f.name || f.title || f.id) : String(f);
        return normalizeTraitName(fName).toLowerCase() !== cleanTitle.toLowerCase() && fName.toLowerCase() !== featureName.toLowerCase();
      });

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          features: updatedPoolFeats
        },
        features: updatedGlobalFeats
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const allocatePoolAttribute = useCallback((poolKey, attrId, delta, maxPoints = 1) => {
    if (!attrId || !poolKey) return;
    const cleanAttrKey = attrId.startsWith('attr-') ? attrId : `attr-${attrId.toLowerCase()}`;

    setCharacterData(prev => {
      const pool = prev[poolKey] || { skills: {}, features: [], attributes: {} };
      const currentAttrs = { ...(pool.attributes || {}) };
      const currentValInPool = parseInt(currentAttrs[cleanAttrKey] || 0, 10);
      const totalSpent = Object.values(currentAttrs).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);

      if (delta > 0 && totalSpent >= maxPoints) {
        showToast({ type: 'warning', text: `All ${maxPoints} bonus attribute points in this pool have already been assigned.` });
        return prev;
      }
      if (delta < 0 && currentValInPool <= 0) {
        return prev;
      }

      const newValInPool = currentValInPool + delta;
      if (newValInPool > 0) {
        currentAttrs[cleanAttrKey] = newValInPool;
      } else {
        delete currentAttrs[cleanAttrKey];
      }

      const currentGlobalVal = parseInt(prev[cleanAttrKey] || 0, 10);
      const newGlobalVal = Math.max(0, currentGlobalVal + delta);

      let subUpdates = {};
      if (PRIMARY_TO_SUB_ATTR[cleanAttrKey]) {
        const subKey = PRIMARY_TO_SUB_ATTR[cleanAttrKey];
        const oldBase = (currentGlobalVal * 2) + 2;
        const newBase = (newGlobalVal * 2) + 2;
        const rawSub = prev[subKey] !== undefined && prev[subKey] !== null && prev[subKey] !== '' ? parseInt(prev[subKey], 10) : null;
        const hasExplicitSub = rawSub !== null && !isNaN(rawSub) && rawSub > 0;
        const currentSubVal = hasExplicitSub ? rawSub : oldBase;
        const subDelta = currentSubVal - oldBase;
        const newSubVal = newBase + subDelta;
        subUpdates[subKey] = newSubVal;
        if (subKey === 'attr-logic') subUpdates['attr-reason'] = newSubVal;
        if (subKey === 'attr-will') subUpdates['attr-willpower'] = newSubVal;
      }

      const updates = {
        ...prev,
        [poolKey]: {
          ...pool,
          attributes: currentAttrs
        },
        [cleanAttrKey]: newGlobalVal,
        ...subUpdates
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  // Add Custom Skill Handler (max level 20)
  const handleAddSkill = useCallback((skill) => {
    const rankVal = Math.min(20, Math.max(0, parseInt(skill.rank ?? 1, 10)));
    setCharacterData((prev) => ({
      ...prev,
      [`skill-${skill.id}-name`]: skill.name,
      [`skill-${skill.id}-rank`]: rankVal,
      [`skill-${skill.id}-base`]: skill.baseAttr,
      [`skill-${skill.id}-group`]: skill.group,
      [`skill-${skill.id}-subcategory`]: skill.subcategory || 'General'
    }));
    triggerSave();
  }, [setCharacterData, triggerSave]);

  // Delete Custom Skill Handler
  const handleDeleteSkill = useCallback((skillId) => {
    setCharacterData((prev) => {
      const next = { ...prev };
      delete next[`skill-${skillId}-rank`];
      delete next[`skill-${skillId}-base`];
      delete next[`skill-${skillId}-mod`];
      delete next[`skill-${skillId}-name`];
      delete next[`skill-${skillId}-group`];
      delete next[`skill-${skillId}-subcategory`];
      if (Array.isArray(next.specializations)) {
        next.specializations = next.specializations.filter(s => s.baseSkillId !== skillId);
      }
      return next;
    });
    triggerSave();
  }, [setCharacterData, triggerSave]);

  // Specialization Handlers (max level 10)
  const handleAddSpecialization = useCallback((spec) => {
    const rankVal = Math.min(10, Math.max(0, parseInt(spec.rank ?? 1, 10)));
    const newSpec = {
      id: spec.id || `spec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: spec.name || 'New Specialization',
      baseSkillId: spec.baseSkillId || '',
      rank: rankVal,
      mod: parseInt(spec.mod || 0, 10),
      category: spec.category || ''
    };
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: [...current, newSpec]
      };
    });
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const handleUpdateSpecialization = useCallback((specId, field, value) => {
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: current.map((s) => {
          if (s.id === specId) {
            let updatedVal = value;
            if (field === 'rank') {
              updatedVal = Math.min(10, Math.max(0, parseInt(value, 10) || 0));
            } else if (field === 'mod') {
              updatedVal = parseInt(value, 10) || 0;
            }
            return { ...s, [field]: updatedVal };
          }
          return s;
        })
      };
    });
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const handleDeleteSpecialization = useCallback((specId) => {
    setCharacterData((prev) => {
      const current = Array.isArray(prev.specializations) ? prev.specializations : [];
      return {
        ...prev,
        specializations: current.filter((s) => s.id !== specId)
      };
    });
    triggerSave();
  }, [setCharacterData, triggerSave]);

  const updateTraitSkillSelection = useCallback((traitOrName, selectionPayload = {}) => {
    if (!traitOrName) return;
    const rawId = typeof traitOrName === 'object' ? String(traitOrName.id || '').trim().toLowerCase() : '';
    const rawName = typeof traitOrName === 'object' ? (traitOrName.name || traitOrName.title || traitOrName.id || '') : String(traitOrName);
    const cleanName = normalizeTraitName(rawName).toLowerCase();

    setCharacterData(prev => {
      const nextTraitSelections = { ...(prev.traitSkillSelections || {}) };
      if (rawId) {
        nextTraitSelections[rawId] = { ...(nextTraitSelections[rawId] || {}), ...selectionPayload };
      }
      if (cleanName) {
        nextTraitSelections[cleanName] = { ...(nextTraitSelections[cleanName] || {}), ...selectionPayload };
      }

      const matchesTrait = (t) => {
        if (!t) return false;
        const tId = typeof t === 'object' ? String(t.id || '').trim().toLowerCase() : '';
        const tName = normalizeTraitName(typeof t === 'object' ? (t.name || t.title || t.id) : String(t)).toLowerCase();
        return (rawId && tId === rawId) || (cleanName && tName === cleanName);
      };

      const nextTraits = Array.isArray(prev.traits)
        ? prev.traits.map(t => {
            if (!matchesTrait(t)) return t;
            const baseObj = typeof t === 'object' ? t : { name: String(t) };
            return { ...baseObj, ...selectionPayload };
          })
        : prev.traits;

      const nextFeatures = Array.isArray(prev.features)
        ? prev.features.map(f => {
            if (!matchesTrait(f)) return f;
            const baseObj = typeof f === 'object' ? f : { name: String(f) };
            return { ...baseObj, ...selectionPayload };
          })
        : prev.features;

      const updates = {
        ...prev,
        traitSkillSelections: nextTraitSelections,
        traits: nextTraits,
        features: nextFeatures
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const updateFeatureSkillSelection = useCallback((featureOrName, selectionPayload = {}) => {
    if (!featureOrName) return;
    const rawId = typeof featureOrName === 'object' ? String(featureOrName.id || '').trim().toLowerCase() : '';
    const rawName = typeof featureOrName === 'object' ? (featureOrName.name || featureOrName.title || featureOrName.id || '') : String(featureOrName);
    const cleanName = normalizeTraitName(rawName).toLowerCase();

    setCharacterData(prev => {
      const nextFeatSelections = { ...(prev.featureSkillSelections || {}) };
      if (rawId) {
        nextFeatSelections[rawId] = { ...(nextFeatSelections[rawId] || {}), ...selectionPayload };
      }
      if (cleanName) {
        nextFeatSelections[cleanName] = { ...(nextFeatSelections[cleanName] || {}), ...selectionPayload };
      }

      const matchesFeat = (f) => {
        if (!f) return false;
        const fId = typeof f === 'object' ? String(f.id || '').trim().toLowerCase() : '';
        const fName = normalizeTraitName(typeof f === 'object' ? (f.name || f.title || f.id) : String(f)).toLowerCase();
        return (rawId && fId === rawId) || (cleanName && fName === cleanName);
      };

      const nextFeatures = Array.isArray(prev.features)
        ? prev.features.map(f => {
            if (!matchesFeat(f)) return f;
            const baseObj = typeof f === 'object' ? f : { name: String(f) };
            return { ...baseObj, ...selectionPayload };
          })
        : prev.features;

      const updates = {
        ...prev,
        featureSkillSelections: nextFeatSelections,
        features: nextFeatures
      };
      triggerSave?.(updates);
      return updates;
    });
  }, [setCharacterData, triggerSave]);

  const value = {
    computedModifiers,
    saveMods: computedModifiers.saveMods,
    activeFeatureModifiers: computedModifiers.activeFeatureModifiers,
    activeTraitModifiers: computedModifiers.activeTraitModifiers,
    activeHindranceModifiers: computedModifiers.activeHindranceModifiers,
    activeEquipmentModifiers: computedModifiers.activeEquipmentModifiers,
    activeSkillModifiers: computedModifiers.activeSkillModifiers,
    getSkillBreakdown,
    getAttrMod,
    getAttrTotal,
    getSubAttrBase,
    derivedStats,
    economyBreakdown,
    computeSpentCP,
    enabledMovementModes,
    calculateFullSpeciesCost,
    speciesComponentData: getSpeciesComponentDataset(),
    allocatePoolSkillRank,
    togglePoolTrait,
    removePoolTrait,
    togglePoolFeature,
    removePoolFeature,
    allocatePoolAttribute,
    handleAddSkill,
    handleDeleteSkill,
    handleAddSpecialization,
    handleUpdateSpecialization,
    handleDeleteSpecialization,
    updateTraitSkillSelection,
    updateFeatureSkillSelection
  };

  return (
    <FolioStatsContext.Provider value={value}>
      {children}
    </FolioStatsContext.Provider>
  );
};
