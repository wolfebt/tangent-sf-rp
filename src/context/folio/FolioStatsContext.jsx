import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useDBM } from '../DBMContext';
import { useFolioIdentity } from './FolioIdentityContext';
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

export const FolioStatsContext = createContext(null);

export const useFolioStats = () => {
  const context = useContext(FolioStatsContext);
  if (!context) {
    console.warn('[useFolioStats] Hook called outside of FolioStatsSliceProvider. Returning fallback empty state.');
    return {};
  }
  return context;
};

export const FolioStatsSliceProvider = ({ children }) => {
  const { characterData, setCharacterData, triggerSave } = useFolioIdentity();
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

    const activeFeatureModifiers = [];
    const activeTraitModifiers = [];
    const activeHindranceModifiers = [];
    const activeSkillModifiers = [];

    const skillMods = {};

    const resolveItem = (key, colName) => {
      const val = characterData[key];
      if (!val) return null;
      if (typeof val === 'object' && val !== null) return val;
      return resolveCatalogItem(colName, val, dbData);
    };

    const processIdentity = (identityItem, identityKey, identityTitle) => {
      const pools = [];
      const activeModifiers = [];
      if (!identityItem) return { title: identityTitle, name: 'Not Selected', pools, activeModifiers };

      const name = typeof identityItem === 'object' ? (identityItem.name || identityItem.title || 'Selected') : String(identityItem);

      if (typeof identityItem === 'object') {
        // 1. Inherent Attribute Modifiers (Set values per attribute or sub-attribute)
        const inherentAttrMods = identityItem.inherent_attribute_modifiers || identityItem.specific_attribute_bonuses;
        if (Array.isArray(inherentAttrMods) && inherentAttrMods.length > 0) {
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
        const applyModifier = (modRef, sourceLabel) => {
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

          if (modType === 'attribute' || target.startsWith('attr-') || ATTR_NAME_TO_ID[target]) {
            const mapped = ATTR_NAME_TO_ID[target] || (target.startsWith('attr-') ? target : `attr-${target}`);
            if (attributeMods[mapped] !== undefined) {
              attributeMods[mapped] += val;
            }
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: mapped.replace('attr-', '').toUpperCase(), value: val, type: 'Attribute' });
          } else if (modType === 'save') {
            const saveKey = mod.target || 'Fortitude';
            if (saveMods[saveKey] !== undefined) saveMods[saveKey] += val;
            else saveMods[saveKey] = val;
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: `${saveKey} Check`, value: val, type: 'Save' });
          } else if (modType === 'combat') {
            const cKey = mod.target || 'initiative-mod';
            if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
            else combatMods[cKey] = val;
            activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: cKey.toUpperCase(), value: val, type: 'Combat' });
          } else if (modType === 'skill') {
            const sKey = target;
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + val;
              activeModifiers.push({ name: `${sourceLabel} ${mName}`, target: mod.target, value: val, type: 'Skill' });
            }
          }
        };

        const rawMods = identityItem.modifiers || identityItem.modifier;
        const modList = Array.isArray(rawMods) ? rawMods : (rawMods ? [rawMods] : []);
        modList.forEach(m => applyModifier(m, `[${identityTitle}: ${name}]`));

        // 3. Inherent Traits & Features of Species / Archetype / Faction
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
                    attributeMods[mapped] += val;
                    activeModifiers.push({ name: `[${label}: ${tName}]`, target: mapped.replace('attr-', '').toUpperCase(), value: val, type: 'Attribute' });
                  }
                } else if (em.type === 'skill') {
                  const sKey = (em.target || '').toLowerCase().trim();
                  if (sKey) {
                    skillMods[sKey] = (skillMods[sKey] || 0) + val;
                    activeModifiers.push({ name: `[${label}: ${tName}]`, target: em.target, value: val, type: 'Skill' });
                  }
                } else if (em.type === 'save') {
                  const saveKey = em.target || 'Fortitude';
                  if (saveMods[saveKey] !== undefined) saveMods[saveKey] += val;
                  else saveMods[saveKey] = val;
                  activeModifiers.push({ name: `[${label}: ${tName}]`, target: `${saveKey} Check`, value: val, type: 'Save' });
                } else if (em.type === 'combat') {
                  const cKey = em.target || 'initiative-mod';
                  if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
                  else combatMods[cKey] = val;
                  activeModifiers.push({ name: `[${label}: ${tName}]`, target: cKey.toUpperCase(), value: val, type: 'Combat' });
                }
              });
            }
          });
        };

        resolveSubTraits(identityItem.inherent_traits, `${identityTitle} Trait`);
        resolveSubTraits(identityItem.inherent_features, `${identityTitle} Feature`);
        resolveSubTraits(identityItem.signature_features, `${identityTitle} Feature`);
        resolveSubTraits(identityItem.bonus_features, `${identityTitle} Feature`);
        resolveSubTraits(identityItem.benefits, `${identityTitle} Benefit`);

        // 4. Inherent Skill Bonuses & Point Pools
        const inherentSkills = identityItem.inherent_skill_bonuses || identityItem.skills || identityItem.granted_skills;
        if (Array.isArray(inherentSkills) && inherentSkills.length > 0) {
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
    // Ensure archetype signature features are evaluated
    if (archetypeObj && Array.isArray(archetypeObj.signature_features)) {
      archetypeObj.signature_features.forEach(sig => {
        const n = typeof sig === 'object' ? (sig.name || sig.title || sig.id) : String(sig);
        if (n && !addedFeatNames.has(n.toLowerCase())) {
          rawFeats.push(sig);
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
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
            else saveMods[targetSave] = val;
            activeFeatureModifiers.push({ source: fName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + val;
              activeFeatureModifiers.push({ source: fName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: fName, sourceType: 'feature', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              attributeMods[mapped] += val;
              activeFeatureModifiers.push({ source: fName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
            else combatMods[cKey] = val;
            activeFeatureModifiers.push({ source: fName, target: cKey, value: val, description: mod.description });
          }
        });
      }
    });

    // 2. Process Traits for active modifiers
    const rawTraits = Array.isArray(characterData.traits) ? [...characterData.traits] : [];
    const poolTraits = [
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
      if (seenTraitNames.has(n)) return false;
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
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
            else saveMods[targetSave] = val;
            activeTraitModifiers.push({ source: tName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + val;
              activeTraitModifiers.push({ source: tName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: tName, sourceType: 'trait', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              attributeMods[mapped] += val;
              activeTraitModifiers.push({ source: tName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
            else combatMods[cKey] = val;
            activeTraitModifiers.push({ source: tName, target: cKey, value: val, description: mod.description });
          }
        });
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
          if (mod.type === 'save') {
            const targetSave = mod.target;
            if (saveMods[targetSave] !== undefined) saveMods[targetSave] += val;
            else saveMods[targetSave] = val;
            activeHindranceModifiers.push({ source: hName, target: `${targetSave} Check`, value: val, description: mod.description });
          } else if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + val;
              activeHindranceModifiers.push({ source: hName, target: mod.target, value: val, description: mod.description });
              activeSkillModifiers.push({ source: hName, sourceType: 'hindrance', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'attribute') {
            const aKey = (mod.target || '').toLowerCase().trim();
            const mapped = ATTR_NAME_TO_ID[aKey] || (aKey.startsWith('attr-') ? aKey : `attr-${aKey}`);
            if (attributeMods[mapped] !== undefined) {
              attributeMods[mapped] += val;
              activeHindranceModifiers.push({ source: hName, target: mod.target, value: val, description: mod.description });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
            else combatMods[cKey] = val;
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
          if (mod.type === 'skill') {
            const sKey = (mod.target || '').toLowerCase().trim();
            if (sKey) {
              skillMods[sKey] = (skillMods[sKey] || 0) + val;
              activeSkillModifiers.push({ source: aName, sourceType: 'augmentation', target: mod.target, value: val, description: mod.description || `${val >= 0 ? '+' : ''}${val} to ${mod.target}` });
            }
          } else if (mod.type === 'combat') {
            const cKey = mod.target;
            if (combatMods[cKey] !== undefined) combatMods[cKey] += val;
            else combatMods[cKey] = val;
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
    characterData['char-archetype'],
    characterData['char-species'],
    characterData['char-occu'],
    characterData['char-origin'],
    characterData['char-faction'],
    characterData.features,
    characterData.traits,
    characterData.hindrances,
    characterData.disadvantages,
    characterData.augmentations,
    characterData.gear,
    characterData.equipment,
    characterData.weapons,
    characterData.weaponry,
    characterData.armor,
    characterData.armoring,
    characterData.other,
    characterData.misc,
    characterData.mecha,
    characterData.architecture,
    characterData.speciesAllocations,
    characterData.occuAllocations,
    characterData.originAllocations,
    characterData.factionAllocations,
    dbData
  ]);

  // Skill Check Breakdown Helper (Score, Attribute Used, Rank, Modifiers, Equipment)
  const getSkillBreakdown = useCallback((skill, extraOptions = {}) => {
    return getSkillCheckBreakdown(skill, characterData, dbData, extraOptions);
  }, [characterData, dbData]);

  // Attribute Mod & Total Calculation Helpers
  const getAttrMod = useCallback((attrId) => {
    const userMod = parseInt(characterData[`${attrId}-mod`] || 0, 10) || 0;
    const identityMod = computedModifiers.attributeMods[attrId] || 0;
    let saveMod = 0;
    if (attrId === 'attr-fortitude') saveMod = computedModifiers.saveMods?.Fortitude || 0;
    else if (attrId === 'attr-reflex') saveMod = computedModifiers.saveMods?.Reflex || 0;
    else if (attrId === 'attr-will' || attrId === 'attr-willpower') saveMod = computedModifiers.saveMods?.Will || 0;
    return userMod + identityMod + saveMod;
  }, [characterData, computedModifiers.attributeMods, computedModifiers.saveMods]);

  // Helper to get dynamic sub-attribute base: (Current Primary Attribute * 2) + 2
  const getSubAttrBase = useCallback((subKey, data = characterData) => {
    const primaryKey = SUB_TO_PRIMARY_ATTR[subKey];
    if (!primaryKey) return 2;
    const pVal = parseInt(data[primaryKey] || 0, 10);
    const pMod = data === characterData ? getAttrMod(primaryKey) : 0;
    return ((pVal + pMod) * 2) + 2;
  }, [characterData, getAttrMod]);

  const getAttrTotal = useCallback((attrId) => {
    let val;
    if (SUB_TO_PRIMARY_ATTR[attrId]) {
      const primaryKey = SUB_TO_PRIMARY_ATTR[attrId];
      const pVal = parseInt(characterData[primaryKey] || 0, 10);
      const pMod = getAttrMod(primaryKey);
      const effectivePrimary = pVal + pMod;
      const base = (effectivePrimary * 2) + 2;
      const explicitRaw = characterData[attrId] ?? (
        attrId === 'attr-logic' ? characterData['attr-reason'] :
        attrId === 'attr-reason' ? characterData['attr-logic'] :
        attrId === 'attr-will' ? characterData['attr-willpower'] :
        attrId === 'attr-willpower' ? characterData['attr-will'] :
        undefined
      );
      const parsedExplicit = parseInt(explicitRaw, 10);
      if (!isNaN(parsedExplicit) && parsedExplicit > base) {
        val = parsedExplicit;
      } else {
        val = base;
      }
    } else {
      val = parseInt(characterData[attrId] || 0, 10) || 0;
    }
    return val + getAttrMod(attrId);
  }, [characterData, getAttrMod]);

  // Derived Stats Auto-Calculation
  const derivedStats = useMemo(() => {
    const staminaBase = parseInt(characterData['attr-stamina'] || 0, 10);
    const staminaMod = getAttrMod('attr-stamina');
    const stamina = staminaBase + staminaMod;

    // In Tangent, Stamina directly determines base Toughness to reduce wound damage point-for-point
    const toughness = stamina;

    const rawFort = parseInt(characterData['attr-fortitude'], 10);
    const fortitudeBase = (!isNaN(rawFort) && rawFort > 0) ? rawFort : (staminaBase * 2 + 2);
    const fortitudeMod = getAttrMod('attr-fortitude');
    const fortitude = fortitudeBase + fortitudeMod;

    const wisdomBase = parseInt(characterData['attr-wisdom'] || 0, 10);
    const wisdomMod = getAttrMod('attr-wisdom');
    const wisdom = wisdomBase + wisdomMod;

    const rawWill = parseInt(characterData['attr-will'] ?? characterData['attr-willpower'], 10);
    const willBase = (!isNaN(rawWill) && rawWill > 0) ? rawWill : (wisdomBase * 2 + 2);
    const willMod = getAttrMod('attr-will');
    const will = willBase + willMod;

    const chaBase = parseInt(characterData['attr-charisma'] || 0, 10);
    const chaMod = getAttrMod('attr-charisma');
    const charisma = chaBase + chaMod;
    // Debt limit in Tangent RPG is Charisma score + 1
    const maxKarmaDebt = Math.max(1, charisma + 1);

    // Canonical Tangent starting base values: Base 30 for Health, Base 30 for Vitality, Base 60 for Structure
    const baseHealth = 30;
    const baseVitality = 30;
    const baseStructure = 60;
    const maxStatIncrease = Math.max(0, staminaBase * 5);
    
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
    const speciesStr = String(characterData['char-species'] || '').toLowerCase();
    const archetypeStr = String(characterData['char-archetype'] || '').toLowerCase();
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
    const lightRestsToday = parseInt(characterData.light_rests_today || 0, 10);

    // Tangent Economic Unified Field Theory (EUFT) & Wealth Score Determination
    const wealthData = calculateCharacterWealth(characterData);

    return {
      health: isSynthetic ? 0 : baseHealth,
      vitality: isSynthetic ? 0 : baseVitality,
      stamina: staminaBase,
      staminaDR: staminaBase,
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
    characterData['attr-stamina'],
    characterData['attr-fortitude'],
    characterData['attr-wisdom'],
    characterData['attr-will'],
    characterData['attr-charisma'],
    characterData['char-species'],
    characterData['char-archetype'],
    characterData['char-occu'],
    characterData['char-origin'],
    characterData['char-faction'],
    characterData['tech-level'],
    characterData['wealth-score-mod'],
    characterData['wealth-score-override'],
    characterData['credits'],
    characterData['wealth-credits'],
    characterData['trade-goods'],
    characterData['wealth-trade-goods'],
    characterData['debits'],
    characterData['wealth-debits'],
    characterData['health'],
    characterData['vitality'],
    characterData['structure'],
    characterData.features,
    characterData.disadvantages,
    characterData.skills,
    getAttrMod
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
    handleDeleteSpecialization
  };

  return (
    <FolioStatsContext.Provider value={value}>
      {children}
    </FolioStatsContext.Provider>
  );
};
