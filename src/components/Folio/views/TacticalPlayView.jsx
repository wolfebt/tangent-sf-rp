import React, { useState, useMemo, useCallback } from 'react';
import { useFolio } from '../../../context/FolioContext';
import { useDice } from '../../../context/DiceContext';
import { rollDice } from '../../../services/diceService';
import { AudioService } from '../../../services/audioService';
import { ALL_CANONICAL_SKILLS } from '../../../data/skillsData';
import { resolveSubAttrScore } from '../../../utils/attributeUtils';
import { scaleCarryingCapacity } from '../../../engines/tangentScalingEngine';
import { 
  resolveAllTacticalAttacks, 
  sanitizeDiceExpression, 
  createAttackFromWeapon, 
  buildWeaponNotes 
} from '../../../utils/combatUtils';
import { enrichItemWithModifiers } from '../../../engines/tangentModifierEngine';
import FolioTooltip from '../shared/FolioTooltip';
import { 
  Shield, 
  Heart, 
  Activity, 
  Dices, 
  Crosshair, 
  Sword, 
  Lock, 
  Unlock, 
  Moon, 
  Sun, 
  AlertTriangle, 
  Skull, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  Sparkles,
  Layers,
  Flame,
  User,
  Cpu,
  X,
  Eye,
  Info,
  ChevronRight,
  BookOpen,
  BatteryCharging,
  Wrench,
  Briefcase,
  Package,
  Boxes,
  Scale,
  Search
} from 'lucide-react';

export const TacticalPlayView = ({ 
  onSwitchToBuilder, 
  characterOverride = null, 
  isModal = false, 
  isPreview = false, 
  onClose = null,
  onLockSheet = null 
}) => {
  const folio = useFolio();
  const characterData = characterOverride || folio.characterData || {};
  const derivedStats = folio.derivedStats || {};
  const getAttrTotal = folio.getAttrTotal;
  const applyCharacterDamage = folio.applyCharacterDamage;
  const updateCharacterHealth = folio.updateCharacterHealth;
  const updateCharacterVitality = folio.updateCharacterVitality;
  const updateCharacterStructure = folio.updateCharacterStructure;
  const takeCharacterRest = folio.takeCharacterRest;
  const stabilizeCharacter = folio.stabilizeCharacter;
  const advanceCharacterDeathTurn = folio.advanceCharacterDeathTurn;
  const revivifyCharacter = folio.revivifyCharacter;
  const unlockPersona = folio.unlockPersona;
  const lockPersona = folio.lockPersona;
  const isLocked = folio.isLocked;

  const { openDiceRoller } = useDice();

  // Section Side Tab State
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'vitals' | 'weapons' | 'skills' | 'features' | 'metaphysics' | 'augmentations'

  // Triage state
  const [damageInput, setDamageInput] = useState('5');
  const [damageType, setDamageType] = useState('kinetic'); // kinetic | lethal | crit | concussive
  const [triageFeedback, setTriageFeedback] = useState(null);
  const [latestDamageResult, setLatestDamageResult] = useState(null);
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState('all');
  const [attackCategoryFilter, setAttackCategoryFilter] = useState('all'); // all | weapon | natural | metaphysics
  const [latestTacticalRoll, setLatestTacticalRoll] = useState(null);

  // Synthetic vs Biological Vitals Rule:
  // A synthetic (mecha, construct) character has structure and does NOT have health or vitality.
  // Otherwise, character has health and vitality and does NOT have structure.
  const speciesStr = String(characterData['char-species'] || characterData.species || '').toLowerCase();
  const archetypeStr = String(characterData['char-archetype'] || characterData.archetype || '').toLowerCase();
  const isSynthetic = Boolean(
    characterData.isSynthetic ?? characterData.is_synthetic ?? derivedStats?.isSynthetic ?? (
      speciesStr.includes('synthetic') || speciesStr.includes('mekan') || 
      speciesStr.includes('construct') || speciesStr.includes('golem') || 
      speciesStr.includes('ooze') || speciesStr.includes('undead') ||
      speciesStr.includes('mecha') || speciesStr.includes('robot') || speciesStr.includes('drone') ||
      archetypeStr.includes('synthetic')
    )
  );

  // Vitals calculation
  const curHealth = isSynthetic ? null : parseInt(characterData.current_health ?? characterData.health ?? 30, 10);
  const maxHealth = isSynthetic ? null : parseInt(characterData.health || derivedStats?.health || 30, 10);
  const curVitality = isSynthetic ? null : parseInt(characterData.current_vitality ?? characterData.vitality ?? 30, 10);
  const maxVitality = isSynthetic ? null : parseInt(characterData.vitality || derivedStats?.vitality || 30, 10);

  const curStructure = isSynthetic 
    ? parseInt(characterData.current_structure ?? characterData.structure ?? derivedStats?.structure ?? 60, 10)
    : null;
  const maxStructure = isSynthetic 
    ? parseInt(characterData.structure || derivedStats?.structure || 60, 10)
    : null;

  const curKarma = parseInt(characterData.karma ?? derivedStats?.maxKarma ?? 3, 10);
  const maxKarma = parseInt(derivedStats?.maxKarma ?? 3, 10);
  const plotPoints = parseInt(characterData['plot-points'] || 0, 10);

  // Status checks
  const isDead = Boolean(characterData.is_dead);
  const atDeathsDoor = !isDead && (
    isSynthetic 
      ? Boolean(curStructure <= 0 || characterData.is_at_deaths_door)
      : Boolean(characterData.is_at_deaths_door || (curHealth <= 0 && curVitality <= 0))
  );
  const isIncapacitated = !isDead && !atDeathsDoor && (
    isSynthetic ? (curStructure <= 10 && curStructure > 0) : (curHealth <= 0)
  );

  // Attributes
  const attrStr = getAttrTotal ? getAttrTotal('attr-strength') : parseInt(characterData['attr-strength'] || 0, 10);
  const attrAgi = getAttrTotal ? getAttrTotal('attr-agility') : parseInt(characterData['attr-agility'] || 0, 10);
  const attrSta = getAttrTotal ? getAttrTotal('attr-stamina') : parseInt(characterData['attr-stamina'] || 0, 10);
  const attrInt = getAttrTotal ? getAttrTotal('attr-intellect') : parseInt(characterData['attr-intellect'] || 0, 10);
  const attrWis = getAttrTotal ? getAttrTotal('attr-wisdom') : parseInt(characterData['attr-wisdom'] || 0, 10);
  const attrCha = getAttrTotal ? getAttrTotal('attr-charisma') : parseInt(characterData['attr-charisma'] || 0, 10);

  // Canonical Primary Attributes & Paired Secondary Checks (Saves & Feats)
  const attributeCheckPairs = useMemo(() => [
    {
      primaryKey: 'attr-strength',
      subKey: 'attr-might',
      primaryName: 'Strength',
      primaryCode: 'STR',
      primaryScore: attrStr,
      subName: 'Might',
      subCode: 'MGT',
      subScore: getAttrTotal ? getAttrTotal('attr-might') : resolveSubAttrScore('attr-might', characterData, attrStr),
      role: 'Brute Force & Heavy Lifting',
      desc: 'Power, physical force, breaking bulkheads, melee impact'
    },
    {
      primaryKey: 'attr-agility',
      subKey: 'attr-reflex',
      primaryName: 'Agility',
      primaryCode: 'AGI',
      primaryScore: attrAgi,
      subName: 'Reflex',
      subCode: 'REF',
      subScore: getAttrTotal ? getAttrTotal('attr-reflex') : resolveSubAttrScore('attr-reflex', characterData, attrAgi),
      role: 'Reaction Save & Evasion',
      desc: 'Balance, coordination, dodging explosions/traps, initiative base'
    },
    {
      primaryKey: 'attr-stamina',
      subKey: 'attr-fortitude',
      primaryName: 'Stamina',
      primaryCode: 'STA',
      primaryScore: attrSta,
      subName: 'Fortitude',
      subCode: 'FOR',
      subScore: getAttrTotal ? getAttrTotal('attr-fortitude') : resolveSubAttrScore('attr-fortitude', characterData, attrSta),
      role: 'Endurance & Pathogen/Shock Save',
      desc: isSynthetic ? 'Structural shearing, power overload, kinetic shock' : 'Resisting toxins, radiation, biological trauma, exhaustion'
    },
    {
      primaryKey: 'attr-intellect',
      subKey: 'attr-logic',
      primaryName: 'Intellect',
      primaryCode: 'INT',
      primaryScore: attrInt,
      subName: 'Reason',
      subCode: 'LOG',
      subScore: getAttrTotal ? getAttrTotal('attr-logic') : resolveSubAttrScore('attr-logic', characterData, attrInt),
      role: 'Deduction & Tech Override',
      desc: 'Cracking ciphers, cybernetic decoding, tech system operation'
    },
    {
      primaryKey: 'attr-wisdom',
      subKey: 'attr-will',
      primaryName: 'Wisdom',
      primaryCode: 'WIS',
      primaryScore: attrWis,
      subName: 'Willpower',
      subCode: 'WIL',
      subScore: getAttrTotal ? getAttrTotal('attr-will') : resolveSubAttrScore('attr-will', characterData, attrWis),
      role: 'Mental & Psychic Screen',
      desc: isSynthetic ? 'Resisting cyber-intrusion, electronic warfare' : 'Resisting psychic coercion, fear, metaphysical breach'
    },
    {
      primaryKey: 'attr-charisma',
      subKey: 'attr-etiquette',
      primaryName: 'Charisma',
      primaryCode: 'CHA',
      primaryScore: attrCha,
      subName: 'Etiquette',
      subCode: 'ETI',
      subScore: getAttrTotal ? getAttrTotal('attr-etiquette') : resolveSubAttrScore('attr-etiquette', characterData, attrCha),
      role: 'Composure & Tactical Command',
      desc: 'Diplomacy, morale, leadership commands, social de-escalation'
    }
  ], [attrStr, attrAgi, attrSta, attrInt, attrWis, attrCha, characterData, getAttrTotal, isSynthetic]);

  // Evasion Value (EV = 10 + AGI + Acrobatics rank)
  const acroRank = parseInt(characterData['skill-physical-acrobatics-rank'] || characterData['skill-acrobatics-rank'] || 0, 10);
  const evasionValue = 10 + attrAgi + acroRank;

  // Physical Armor & Energy Shield
  const physicalArmor = parseInt(characterData.physical_armor || derivedStats?.toughness || characterData.armor || 0, 10);
  const energyShield = parseInt(characterData.energy_shield || characterData.shield || 0, 10);

  // Light Rests Tracking (max 4/day)
  const lightRestsToday = parseInt(characterData.light_rests_today || 0, 10);
  const maxLightRests = 4;

  // Death Clock rounds (Stamina score, minimum 1)
  const deathClockRounds = characterData.death_clock ?? Math.max(1, attrSta);

  // Reaction Saves (Saves are rolled using the sub-attributes Reflex, Fortitude, Willpower)
  const reflexSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-reflex')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-reflex') : resolveSubAttrScore('attr-reflex', characterData, attrAgi));
  const fortitudeSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-fortitude')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-fortitude') : resolveSubAttrScore('attr-fortitude', characterData, attrSta));
  const willpowerSaveBonus = attributeCheckPairs.find(p => p.subKey === 'attr-will')?.subScore ?? (getAttrTotal ? getAttrTotal('attr-will') : resolveSubAttrScore('attr-will', characterData, attrWis));

  const reactionSaves = useMemo(() => [
    { name: 'Reflex Save', code: 'REF', bonus: reflexSaveBonus, desc: 'Dodge explosions, area hazards, traps' },
    { name: 'Fortitude Save', code: 'FOR', bonus: fortitudeSaveBonus, desc: isSynthetic ? 'Resist structural shearing, overload, kinetic shock' : 'Resist toxins, radiation, biological shock' },
    { name: 'Willpower Save', code: 'WIL', bonus: willpowerSaveBonus, desc: isSynthetic ? 'Resist cyber-intrusion, electronic warfare, AI override' : 'Resist psychic coercion, fear, metaphysical breach' }
  ], [reflexSaveBonus, fortitudeSaveBonus, willpowerSaveBonus, isSynthetic]);

  // Tactical Attacks & Offensive Capabilities List (Weapons, Natural Attacks & Offensive Metaphysics)
  const weaponsList = useMemo(() => {
    return resolveAllTacticalAttacks(characterData, getAttrTotal, isSynthetic);
  }, [characterData, getAttrTotal, isSynthetic]);

  const attackCounts = useMemo(() => ({
    all: weaponsList.length,
    weapon: weaponsList.filter(item => item.category === 'weapon').length,
    natural: weaponsList.filter(item => item.category === 'natural').length,
    metaphysics: weaponsList.filter(item => item.category === 'metaphysics').length
  }), [weaponsList]);

  const filteredAttacks = useMemo(() => {
    if (attackCategoryFilter === 'all') return weaponsList;
    return weaponsList.filter(item => item.category === attackCategoryFilter);
  }, [weaponsList, attackCategoryFilter]);

  // Trained Skills Grouped by Category (EMPTY GROUPS ARE NOT DISPLAYED)
  const trainedSkillsByGroup = useMemo(() => {
    const groupLabels = {
      combat: '⚔️ Combat Skills',
      physical: '🏃 Physical Skills',
      mental: '🧠 Mental Skills',
      social: '💬 Social Skills',
      metafocus: '🔮 Metafocus Skills'
    };

    const canonicalMap = new Map();
    ALL_CANONICAL_SKILLS.forEach(s => {
      canonicalMap.set(s.id.toLowerCase(), s);
      const cleanId = s.id.replace(/^[a-z]+-/, '').toLowerCase();
      canonicalMap.set(cleanId, s);
    });

    const trainedSkills = new Map();

    Object.entries(characterData).forEach(([key, val]) => {
      if (key.startsWith('skill-') && key.endsWith('-rank')) {
        const rank = parseInt(val, 10);
        if (rank > 0) {
          const rawId = key.replace('skill-', '').replace('-rank', '').toLowerCase();
          const cleanId = rawId.replace(/^[a-z]+-/, '');
          const canon = canonicalMap.get(rawId) || canonicalMap.get(cleanId);
          const name = canon?.name || characterData[`skill-${rawId}-name`] || characterData[`skill-${cleanId}-name`] || cleanId.replace(/-/g, ' ');
          const group = canon?.group || 'combat';
          const baseAttr = canon?.baseAttr || 'attr-agility';
          const attrKey = baseAttr.replace('attr-', '');
          const attrScore = getAttrTotal ? getAttrTotal(baseAttr) : parseInt(characterData[baseAttr] || 0, 10);
          const total = attrScore + rank;

          if (!trainedSkills.has(cleanId) || rank > trainedSkills.get(cleanId).rank) {
            trainedSkills.set(cleanId, {
              id: cleanId,
              name,
              group,
              rank,
              baseAttr,
              attrKey: attrKey.toUpperCase().slice(0, 3),
              attrScore,
              total,
              description: canon?.description || ''
            });
          }
        }
      }
    });

    // Group the trained skills
    const groups = {};
    trainedSkills.forEach(skill => {
      const grp = skill.group || 'combat';
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(skill);
    });

    // Sort skills alphabetically within each group
    Object.values(groups).forEach(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
    });

    const order = ['combat', 'physical', 'mental', 'social', 'metafocus'];
    const result = [];
    order.forEach(gKey => {
      if (groups[gKey] && groups[gKey].length > 0) {
        result.push({
          key: gKey,
          label: groupLabels[gKey] || `${gKey.toUpperCase()} Skills`,
          skills: groups[gKey]
        });
      }
    });

    // Any non-canonical group if populated
    Object.keys(groups).forEach(gKey => {
      if (!order.includes(gKey) && groups[gKey].length > 0) {
        result.push({
          key: gKey,
          label: `${gKey.toUpperCase()} Skills`,
          skills: groups[gKey]
        });
      }
    });

    return result; // Empty groups are completely omitted!
  }, [characterData, getAttrTotal]);

  // Sorted List of Features Possessed
  const possessedFeatures = useMemo(() => {
    const list = [];
    const seen = new Set();

    const addFeature = (rawFeat, defaultSource = 'Purchased Feature') => {
      if (!rawFeat) return;
      const feat = enrichItemWithModifiers(rawFeat);
      const name = typeof feat === 'object' ? (feat.name || feat.title || '') : String(feat);
      if (!name || seen.has(name.toLowerCase().trim())) return;
      seen.add(name.toLowerCase().trim());

      const category = typeof feat === 'object' ? (feat.category || feat.type || 'General Feature') : 'General Feature';
      const desc = typeof feat === 'object' ? (feat.description || feat.desc || feat.summary || feat.effect || '') : '';
      const source = typeof feat === 'object' ? (feat.source || defaultSource) : defaultSource;
      const mechanic = typeof feat === 'object' ? (feat.mechanic || feat.mechanics || '') : '';
      const rules = typeof feat === 'object' ? (feat.rules || feat.special_rules || '') : '';
      const notes = typeof feat === 'object' ? (feat.notes || '') : '';
      const modifiers = Array.isArray(feat?.modifiers) ? feat.modifiers : [];

      list.push({
        name,
        category,
        source,
        description: desc,
        mechanic,
        rules,
        notes,
        modifiers
      });
    };

    if (Array.isArray(characterData.features)) {
      characterData.features.forEach(f => addFeature(f, 'Purchased Feature'));
    }
    if (Array.isArray(characterData.traits)) {
      characterData.traits.forEach(t => addFeature(t, 'Trait'));
    }
    ['speciesAllocations', 'occuAllocations', 'originAllocations', 'factionAllocations'].forEach(allocKey => {
      const alloc = characterData[allocKey];
      if (alloc?.features && Array.isArray(alloc.features)) {
        alloc.features.forEach(f => addFeature(f, `${allocKey.replace('Allocations', '')} Feature`));
      }
      if (alloc?.traits && Array.isArray(alloc.traits)) {
        alloc.traits.forEach(t => addFeature(t, `${allocKey.replace('Allocations', '')} Trait`));
      }
    });

    // Sort alphabetically by name
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [characterData]);

  // Metaphysics: Awakened Disciplines & Invocations
  const awakenedDisciplines = useMemo(() => {
    if (!Array.isArray(characterData.awakened)) return [];
    return characterData.awakened.filter(Boolean).map(awk => (
      typeof awk === 'object' ? awk : { name: String(awk) }
    ));
  }, [characterData.awakened]);

  const invocationsList = useMemo(() => {
    if (!Array.isArray(characterData.invocations)) return [];
    return characterData.invocations.filter(Boolean).map((inv, idx) => {
      const obj = typeof inv === 'object' ? inv : { name: String(inv) };
      const rank = parseInt(obj.rank || 1, 10);
      const mod = parseInt(obj.mod || 0, 10);
      const total = attrWis + rank + mod;
      return {
        id: obj.id || `inv_${idx}`,
        name: obj.name || obj.title || 'Invocation',
        discipline: obj.discipline || 'Metaphysics',
        baseDC: obj.baseDC || 15,
        total,
        rank
      };
    });
  }, [characterData.invocations, attrWis]);

  const hasMetaphysics = awakenedDisciplines.length > 0 || invocationsList.length > 0;

  // Augmentations & Cyberware
  const augmentationsList = useMemo(() => {
    const list = [];
    const seen = new Set();
    const addAug = (aug) => {
      if (!aug) return;
      const name = typeof aug === 'object' ? (aug.name || aug.title || '') : String(aug);
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      list.push(typeof aug === 'object' ? aug : { name, type: 'Cyberware' });
    };

    if (Array.isArray(characterData.augmentations)) {
      characterData.augmentations.forEach(addAug);
    }
    if (Array.isArray(characterData['property-augmentations'])) {
      characterData['property-augmentations'].forEach(addAug);
    }
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [characterData.augmentations, characterData['property-augmentations']]);

  const hasAugmentations = augmentationsList.length > 0;

  // Property & Equipment Catalog Aggregation
  const getArray = useCallback((key, altKey) => {
    let val = characterData[key];
    if (!val && altKey) val = characterData[altKey];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [characterData]);

  const propertyCatalog = useMemo(() => {
    const rawCategories = [
      {
        id: 'weaponry',
        name: 'Weaponry',
        icon: '⚔️',
        color: 'amber',
        items: [...getArray('weapons', 'weaponry'), ...getArray('property-weaponry')]
      },
      {
        id: 'armoring',
        name: 'Armoring',
        icon: '🛡️',
        color: 'emerald',
        items: [...getArray('armoring', 'armor'), ...getArray('property-armoring')]
      },
      {
        id: 'gear',
        name: 'Gear & Equipment',
        icon: '🎒',
        color: 'cyan',
        items: [...getArray('gear', 'equipment'), ...getArray('property-gear')]
      },
      {
        id: 'mecha',
        name: 'Vehicles, Mechs & Drones',
        icon: '🤖',
        color: 'purple',
        items: [...getArray('mecha', 'mech'), ...getArray('property-mech')]
      },
      {
        id: 'architecture',
        name: 'Architecture & Real Estate',
        icon: '🏛️',
        color: 'blue',
        items: [...getArray('architecture', 'structures'), ...getArray('property-architecture')]
      },
      {
        id: 'other',
        name: 'Valuables & Misc',
        icon: '📦',
        color: 'slate',
        items: [...getArray('other', 'misc'), ...getArray('property-other')]
      }
    ];

    const categories = rawCategories.map(cat => {
      const seen = new Set();
      const cleanItems = [];
      cat.items.forEach((raw, idx) => {
        if (!raw) return;
        const itemObj = typeof raw === 'object' ? raw : { name: String(raw) };
        const name = itemObj.name || itemObj.title || itemObj.label || `Item #${idx + 1}`;
        const key = `${name.toLowerCase()}_${itemObj.id || idx}`;
        if (!seen.has(key)) {
          seen.add(key);
          cleanItems.push({
            id: itemObj.id || `prop_${cat.id}_${idx}`,
            name,
            qty: parseInt(itemObj.qty ?? itemObj.quantity ?? 1, 10) || 1,
            weight: parseFloat(itemObj.weight ?? itemObj.wt ?? itemObj.mass ?? 0) || 0,
            tl: itemObj.tl || itemObj.techLevel || null,
            cost: itemObj.cost || itemObj.price || null,
            category: cat.name,
            categoryId: cat.id,
            damage: itemObj.damage || itemObj.damageExpr || null,
            attackMod: parseInt(itemObj.attackMod || itemObj.mod || 0, 10),
            armorDr: itemObj.armor || itemObj.dr || itemObj.defense || null,
            range: itemObj.range || null,
            desc: itemObj.description || itemObj.desc || itemObj.effect || itemObj.summary || '',
            properties: itemObj.properties || itemObj.tags || []
          });
        }
      });
      return {
        ...cat,
        items: cleanItems
      };
    });

    const allItems = categories.flatMap(c => c.items);
    return {
      categories,
      allItems
    };
  }, [getArray]);

  // Carried weight vs capacity
  const carriedWeight = useMemo(() => {
    const portableCats = ['weaponry', 'armoring', 'gear', 'other'];
    return Math.round(
      propertyCatalog.categories
        .filter(c => portableCats.includes(c.id))
        .flatMap(c => c.items)
        .reduce((sum, item) => sum + (item.weight * item.qty), 0) * 10
    ) / 10;
  }, [propertyCatalog]);

  const sizeKey = characterData['char-size'] || derivedStats?.size || 'Medium';
  const baseMaxCapacity = (Math.max(0, attrStr) + 2) * 50; // 100 lbs base at STR 0
  const maxCapacity = scaleCarryingCapacity(baseMaxCapacity, sizeKey);
  const lightCapacity = Math.round(maxCapacity * 0.5);
  const isOverburdened = carriedWeight > maxCapacity;
  const isEncumbered = carriedWeight > lightCapacity && !isOverburdened;

  // Side Navigation Tabs definition (conditional tabs included only if possessed)
  const sideTabs = useMemo(() => [
    { id: 'all', label: 'All Cockpit', icon: <Layers size={14} /> },
    { id: 'vitals', label: isSynthetic ? 'Structure & Saves' : 'Vitals & Saves', icon: isSynthetic ? <Cpu size={14} /> : <Heart size={14} /> },
    { id: 'weapons', label: 'Arsenal & Attacks', icon: <Sword size={14} />, badge: weaponsList.length },
    { id: 'skills', label: 'Skills', icon: <Crosshair size={14} />, badge: trainedSkillsByGroup.reduce((acc, g) => acc + g.skills.length, 0) },
    { id: 'features', label: 'Features', icon: <Sparkles size={14} />, badge: possessedFeatures.length },
    { id: 'property', label: 'Property', icon: <Briefcase size={14} />, badge: propertyCatalog.allItems.length },
    ...(hasMetaphysics ? [{ id: 'metaphysics', label: 'Metaphysics', icon: <Flame size={14} />, badge: invocationsList.length || awakenedDisciplines.length }] : []),
    ...(hasAugmentations ? [{ id: 'augmentations', label: 'Augs', icon: <Zap size={14} />, badge: augmentationsList.length }] : [])
  ], [isSynthetic, trainedSkillsByGroup, possessedFeatures.length, propertyCatalog.allItems.length, hasMetaphysics, invocationsList.length, awakenedDisciplines.length, hasAugmentations, augmentationsList.length]);

  // Handlers
  const handleApplyDamageSubmit = async () => {
    const amt = parseInt(damageInput, 10);
    if (!amt || amt <= 0) return;

    const charId = characterData['character-doc-id'] || characterData.id;
    const res = await applyCharacterDamage(charId, {
      incomingDamage: amt,
      isNonLethal: damageType === 'kinetic',
      isCritical: damageType === 'crit',
      isConcussive: damageType === 'concussive',
      attemptedReduction: true
    });

    AudioService.playCombatHit(damageType === 'crit');
    if (res) {
      if (isSynthetic) {
        setTriageFeedback(`Chassis suffered ${amt} ${damageType} damage: -${res.structureDamage || amt} SP. (Structure: ${res.newStructure}/${maxStructure}).`);
      } else {
        setTriageFeedback(`Suffered ${amt} ${damageType} damage: -${res.vitalityDamage} VIT, -${res.healthDamage} HP. (Absorbed ${res.damageAbsorbed}).`);
      }
    }
  };

  const handleQuickHeal = (amount, target = 'vitality') => {
    const pts = parseInt(amount, 10);
    if (!pts || pts <= 0) return;
    const charId = characterData['character-doc-id'] || characterData.id;

    if (isSynthetic) {
      const next = Math.min(maxStructure, (curStructure || 0) + pts);
      if (updateCharacterStructure) updateCharacterStructure(charId, next);
      setTriageFeedback(`Repaired +${pts} Structure (${next}/${maxStructure} SP)`);
    } else {
      if (target === 'vitality') {
        const next = Math.min(maxVitality, (curVitality || 0) + pts);
        if (updateCharacterVitality) updateCharacterVitality(charId, next);
        setTriageFeedback(`Healed +${pts} Vitality (${next}/${maxVitality})`);
      } else {
        const next = Math.min(maxHealth, (curHealth || 0) + pts);
        if (updateCharacterHealth) updateCharacterHealth(charId, next);
        setTriageFeedback(`Healed +${pts} Health (${next}/${maxHealth})`);
      }
    }
    AudioService.playPointSpendSound();
  };

  const handleExecuteRest = async (type = 'light') => {
    const charId = characterData['character-doc-id'] || characterData.id;
    if (type === 'light' && lightRestsToday >= maxLightRests) {
      alert("Exceeded maximum Light Rests (4/day). Operative requires a Full Rest to recharge.");
      return;
    }

    const res = await takeCharacterRest(charId, { restType: type });
    if (res?.success) {
      AudioService.playCriticalChime(true);
      setTriageFeedback(type === 'light' 
        ? `${isSynthetic ? 'Quick diagnostic cycle' : 'Light Rest'} completed (+${res.vitalityRecovered || 2} recovery). Used ${res.newLightRestsToday}/${maxLightRests} daily cycles.` 
        : `${isSynthetic ? 'Overhaul cycle' : 'Full Rest'} completed. Vitals restored to maximum.`);
    }
  };

  // Unified Interactive Dice Rolling Pipeline tied into VTT Session
  const handleExecuteTacticalRoll = useCallback((label, modifier, customExpression = null) => {
    const charName = characterData['char-name'] || characterData.name || 'Operative';
    const modNum = parseInt(modifier, 10) || 0;
    const expr = customExpression || `2d10${modNum !== 0 ? (modNum > 0 ? `+${modNum}` : `${modNum}`) : ''}`;

    // 1. Calculate roll locally for instant cockpit feedback
    const result = rollDice(expr, { characterName: charName, label: label });

    AudioService.playDiceRollSound();
    if (result.isCritSuccess) AudioService.playCriticalChime(true);
    if (result.isCritFail) AudioService.playCriticalChime(false);

    setLatestTacticalRoll({
      label,
      total: result.total,
      expression: expr,
      rolls: result.rolls,
      modifier: modNum,
      isCrit: result.isCritSuccess,
      isFumble: result.isCritFail,
      timestamp: Date.now()
    });

    if (label.includes('Damage')) {
      setLatestDamageResult({
        weaponName: label.replace(' Damage', ''),
        expression: expr,
        total: result.total,
        rolls: result.rolls
      });
    }

    // 2. Open universal DiceRollerDock (which broadcasts to active chat/session)
    if (openDiceRoller) {
      openDiceRoller({
        label,
        baseModifier: modNum,
        expression: expr,
        rollMode: 'normal',
        characterName: charName,
        personaId: characterData['character-doc-id'] || characterData.id,
        autoRoll: true
      });
    }

    // 3. Broadcast to VTT canvas for floating combat text
    window.dispatchEvent(new CustomEvent('vtt-trigger-floating-text', {
      detail: {
        text: `${charName}: ${label} [${result.total}]`,
        type: result.isCritSuccess ? 'karma' : result.isCritFail ? 'crit_fail' : 'damage'
      }
    }));

    // 4. Broadcast event for VTT session listeners
    window.dispatchEvent(new CustomEvent('vtt-tactical-roll', {
      detail: {
        characterName: charName,
        label,
        total: result.total,
        expression: expr,
        rolls: result.rolls,
        isCrit: result.isCritSuccess,
        isFumble: result.isCritFail
      }
    }));
  }, [characterData, openDiceRoller]);

  const handleRollCheck = (label, modifier) => {
    handleExecuteTacticalRoll(label, modifier);
  };

  const handleRollWeaponDamage = (weapon) => {
    const rawExpr = weapon.damage || '1d10';
    const expr = sanitizeDiceExpression(rawExpr);
    handleExecuteTacticalRoll(`${weapon.name} Damage`, 0, expr);
  };

  return (
    <div className={`space-y-4 font-sans select-none ${isModal ? 'p-1' : 'pb-20'}`}>
      {/* 1. Tactical Cockpit Header Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/50 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-300 shadow-md shrink-0">
            {isSynthetic ? <Cpu size={22} className="text-amber-400 animate-pulse" /> : <Crosshair size={22} className="text-cyan-400 animate-pulse" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold font-mono uppercase text-white tracking-wide truncate">
                {characterData['char-name'] || 'UNNAMED OPERATIVE'}
              </h2>
              {isSynthetic ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1">
                  <Cpu size={10} /> SYNTHETIC CHASSIS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                  <Heart size={10} /> BIOLOGICAL
                </span>
              )}
              {isDead ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950 border border-red-500 text-red-300 flex items-center gap-1 animate-pulse">
                  <Skull size={11} /> {isSynthetic ? 'DESTROYED' : 'DECEASED'}
                </span>
              ) : atDeathsDoor ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={11} /> {isSynthetic ? 'CHASSIS FAILING' : `DEATH'S DOOR (${deathClockRounds} ROUNDS)`}
                </span>
              ) : isIncapacitated ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950 border border-rose-500 text-rose-300 flex items-center gap-1">
                  <AlertTriangle size={11} /> INCAPACITATED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-500/80 text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 size={11} /> COMBAT ACTIVE
                </span>
              )}
              {isPreview && (
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1 shadow-sm"
                  title="Sheet is currently in Development Phase. You can test rolls and triage safely."
                >
                  <Eye size={10} className="text-amber-400" /> TACTICAL PREVIEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-xs text-slate-400 font-mono truncate">
                {characterData['char-species'] || 'Human'} • {characterData['char-archetype'] || 'Operative'} • {characterData['char-occu'] || 'Freelancer'}
              </p>
              {isPreview && (
                <span className="hidden sm:inline text-[10.5px] font-mono text-amber-400/80">
                  &bull; Development Phase (Testing Mode)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Builder Switcher / Close / Lock Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {isPreview && (
            <button
              type="button"
              onClick={() => {
                if (onLockSheet) onLockSheet();
                else if (lockPersona) lockPersona();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-500/60 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md hover:shadow-cyan-500/30 active:scale-95"
              title="Lock & Set this Persona for VTT Play"
            >
              <Lock size={12} className="text-cyan-400" />
              <span>Lock for VTT</span>
            </button>
          )}

          {onSwitchToBuilder && (
            <button
              type="button"
              onClick={onSwitchToBuilder}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Switch to Builder Mode"
            >
              <span>🛠️ Builder</span>
            </button>
          )}

          {!isPreview && isLocked && unlockPersona && (
            <button
              type="button"
              onClick={() => {
                AudioService.playTerminalBeep(1100, 0.03);
                if (unlockPersona) unlockPersona();
                if (onSwitchToBuilder) onSwitchToBuilder();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Unlock persona back to development phase"
            >
              <Unlock size={12} className="text-amber-400" />
              <span>Unlock</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Tactical Play Cockpit (ESC)"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2.5. Live Tactical Roll HUD Result Banner */}
      {latestTacticalRoll && (
        <div className={`p-2.5 px-4 rounded-xl border flex items-center justify-between gap-2 backdrop-blur-md shadow-lg transition-all animate-in fade-in duration-200 ${
          latestTacticalRoll.isCrit 
            ? 'bg-amber-950/80 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
            : latestTacticalRoll.isFumble 
            ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
            : 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-mono min-w-0">
            <Dices size={16} className={latestTacticalRoll.isCrit ? 'text-amber-400 animate-spin shrink-0' : 'text-cyan-400 shrink-0'} />
            <div className="truncate">
              <span className="font-bold text-slate-100">{latestTacticalRoll.label}:</span>{' '}
              <span className="text-white font-bold text-sm bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 ml-1">
                {latestTacticalRoll.total}
              </span>{' '}
              <span className="text-slate-400 text-[11px] ml-1">
                ({latestTacticalRoll.expression} &bull; Rolls: [{latestTacticalRoll.rolls?.map(r => r.value ?? r).join(', ')}])
              </span>
            </div>
            {latestTacticalRoll.isCrit && (
              <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[9.5px] font-bold uppercase tracking-wider shrink-0 shadow">
                CRITICAL SUCCESS!
              </span>
            )}
            {latestTacticalRoll.isFumble && (
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9.5px] font-bold uppercase tracking-wider shrink-0 shadow">
                FUMBLE!
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLatestTacticalRoll(null)}
            className="text-slate-400 hover:text-white text-xs font-bold leading-none p-1 shrink-0 cursor-pointer"
            title="Dismiss Roll Banner"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. Emergency Triage Banner (When at Death's Door or Dead) */}
      {(atDeathsDoor || isDead) && (
        <div className="bg-red-950/90 border-2 border-red-500 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-red-200 animate-pulse">
          <div className="flex items-center gap-3">
            <Skull size={28} className="text-red-400 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-red-300">
                CRITICAL LIFE STATUS: {isDead ? (isSynthetic ? 'CHASSIS DESTROYED' : 'OPERATIVE PERISHED') : (isSynthetic ? 'CATASTROPHIC STRUCTURAL FAILURE' : `DEATH CLOCK RUNNING (${deathClockRounds} ROUNDS)`)}
              </div>
              <p className="text-xs text-red-300/80">
                {isDead 
                  ? (isSynthetic ? 'Chassis suffered total mechanical failure. Requires shipyard reconstruction.' : 'Operative has succumbed to trauma. Requires high-tier medical resuscitation.')
                  : (isSynthetic ? 'Structural Integrity at 0. Unit requires immediate emergency repairs.' : 'Health and Vitality are both at 0. Operative must be stabilized before death clock expires.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isDead ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const charId = characterData['character-doc-id'] || characterData.id;
                    if (stabilizeCharacter) stabilizeCharacter(charId);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow"
                >
                  {isSynthetic ? '🔧 Emergency Stabilize' : '🩹 Stabilize Operative'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const charId = characterData['character-doc-id'] || characterData.id;
                    if (advanceCharacterDeathTurn) advanceCharacterDeathTurn(charId);
                  }}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow"
                >
                  ⏳ Advance Turn (-1)
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const charId = characterData['character-doc-id'] || characterData.id;
                  if (revivifyCharacter) revivifyCharacter(charId);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded uppercase cursor-pointer transition-colors shadow"
              >
                ⚡ {isSynthetic ? 'Reconstruct Unit' : 'Revivify Operative'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Body: Left Vertical Navigation Rail with Labels + Main Content Column */}
      <div className="flex flex-col md:flex-row gap-3 w-full items-start">
        {/* Left Vertical Nav Rail with Compact Labels */}
        <nav
          className="w-full md:w-36 lg:w-44 shrink-0 bg-[#090e16]/95 border border-slate-800 rounded-2xl p-1.5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto scrollbar-none shadow-xl sticky top-0 z-10"
          aria-label="Folio Navigation Rail"
        >
          {sideTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  AudioService.playTerminalBeep(900, 0.02);
                }}
                className={`px-2.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase transition-all flex items-center justify-between gap-2 shrink-0 md:shrink md:w-full cursor-pointer text-left border ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : 'bg-slate-950/40 md:bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border-slate-800 md:border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono shrink-0 ${
                    isActive ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 5. Main Content Area according to activeTab */}
        <div className="flex-1 min-w-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols) - Vitals, Triage & Recovery */}
        {(activeTab === 'all' || activeTab === 'vitals') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
            
            {/* Vitals Gauges Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  {isSynthetic ? <Cpu size={14} className="text-amber-400" /> : <Heart size={14} className="text-rose-400" />}
                  {isSynthetic ? 'Structural Integrity' : 'Dual-Track Vitals'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {isSynthetic ? 'Synthetic Chassis System' : 'Tangent Trauma System'}
                </span>
              </h3>

              {/* SYNTHETIC: ONLY STRUCTURE BAR (NO HEALTH OR VITALITY) */}
              {isSynthetic ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Cpu size={12} />
                      <span>CHASSIS STRUCTURE (SP):</span>
                    </span>
                    <span className="font-bold text-amber-300">
                      {curStructure} / {maxStructure} SP
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-amber-900/60 p-0.5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, ((curStructure || 0) / (maxStructure || 1)) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    🤖 Synthetic entities absorb all damage directly into Chassis Structure. No flesh or biological fatigue.
                  </p>
                </div>
              ) : (
                /* BIOLOGICAL: HEALTH & VITALITY (NO STRUCTURE) */
                <>
                  {/* Health Bar (Rose for all Reds) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Heart size={11} />
                        <span>HEALTH (Meat / Physical Trauma):</span>
                      </span>
                      <span className="font-bold text-slate-200">
                        {curHealth} / {maxHealth} HP
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-900/60 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-800 via-rose-600 to-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, ((curHealth || 0) / (maxHealth || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Vitality Bar (Teal for Dark Green) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-teal-400 font-bold flex items-center gap-1">
                        <Activity size={11} />
                        <span>VITALITY (Combat Stamina / Energy):</span>
                      </span>
                      <span className="font-bold text-slate-200">
                        {curVitality} / {maxVitality} VIT
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-teal-900/70 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0d5c63] via-teal-700 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, ((curVitality || 0) / (maxVitality || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Quick Recovery Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 flex-wrap text-xs">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  {isSynthetic ? 'Repair Chassis:' : 'Quick Heals:'}
                </span>
                <div className="flex items-center gap-1">
                  {isSynthetic ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickHeal(5, 'structure')}
                        className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded font-mono font-bold text-[10px] cursor-pointer"
                      >
                        +5 SP
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickHeal(10, 'structure')}
                        className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded font-mono font-bold text-[10px] cursor-pointer"
                      >
                        +10 SP
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickHeal(5, 'vitality')}
                        className="px-2 py-0.5 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/50 text-teal-300 rounded font-mono font-bold text-[10px] cursor-pointer"
                      >
                        +5 VIT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickHeal(10, 'vitality')}
                        className="px-2 py-0.5 bg-teal-950/80 hover:bg-teal-900 border border-teal-700/50 text-teal-300 rounded font-mono font-bold text-[10px] cursor-pointer"
                      >
                        +10 VIT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickHeal(5, 'health')}
                        className="px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded font-mono font-bold text-[10px] cursor-pointer"
                      >
                        +5 HP
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Core Attributes & Secondary Checks Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Dices size={15} className="text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                    Core Attributes &amp; Secondary Checks
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Saves &amp; Checks: 2d10 + Score
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attributeCheckPairs.map(pair => (
                  <div
                    key={pair.primaryKey}
                    className="p-2.5 rounded-lg bg-[#0d1117]/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-2 shadow-sm group"
                  >
                    {/* Top: Primary Attribute row (Non-rollable score display) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {pair.primaryCode}
                        </span>
                        <span className="font-bold text-xs text-white truncate">
                          {pair.primaryName}
                        </span>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono font-bold shrink-0 shadow-inner"
                        title={`Primary Attribute Score: ${pair.primaryName} (${pair.primaryScore >= 0 ? `+${pair.primaryScore}` : pair.primaryScore})`}
                      >
                        {pair.primaryScore >= 0 ? `+${pair.primaryScore}` : pair.primaryScore}
                      </span>
                    </div>

                    {/* Bottom: Secondary Check / Save row (Rollable Dice Component) */}
                    <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            {pair.subCode}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-300 truncate">
                            {pair.subName}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-sans block truncate mt-0.5" title={pair.desc}>
                          {pair.role}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteTacticalRoll(`${pair.subName} (${pair.subCode}) Save/Check`, pair.subScore)}
                        className="px-2.5 py-1 rounded bg-amber-950/90 hover:bg-amber-800 border border-amber-500/70 hover:border-amber-400 text-amber-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md hover:shadow-amber-500/20 active:scale-95"
                        title={`Roll Secondary Check: 2d10 + ${pair.subScore}`}
                      >
                        <Dices size={12} className="text-amber-400" />
                        <span>+{pair.subScore}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1-Click Damage Triage Terminal */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  Combat Damage Triage
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Incoming Hits</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    Damage Points:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={damageInput}
                    onChange={(e) => setDamageInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    Damage Type:
                  </label>
                  <select
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white font-mono text-xs px-2 py-1.5 rounded-lg outline-none"
                  >
                    <option value="kinetic">Kinetic (Vitality / Structure)</option>
                    <option value="lethal">Lethal (Direct to Health / Structure)</option>
                    <option value="crit">Critical Strike (Double Trauma)</option>
                    <option value="concussive">Concussive (Fatigue Shock)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[3, 5, 8, 12, 15, 20].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDamageInput(String(val))}
                    className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleApplyDamageSubmit}
                  className="flex-1 py-1.5 bg-red-950 hover:bg-red-800 border border-red-500/60 hover:border-red-400 text-red-200 rounded-lg text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer text-center"
                >
                  💥 Apply Hit
                </button>
              </div>

              {triageFeedback && (
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs font-mono animate-in fade-in duration-200">
                  {triageFeedback}
                </div>
              )}
            </div>

            {/* Rest & Recovery Tracking */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  {isSynthetic ? <BatteryCharging size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                  {isSynthetic ? 'Maintenance & Diagnostic Cycles' : 'Rest Cycle Economy'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {isSynthetic ? 'Chassis Overhauls' : 'Max 4 Light Rests/Day'}
                </span>
              </h3>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-slate-200 font-bold">
                    {isSynthetic ? 'Quick Diagnostic Cycle' : 'Light Rest (10 min)'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {isSynthetic ? 'Calibrate servos & recover +2 SP' : 'Recovers +2 Vitality stamina'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    {lightRestsToday} / {maxLightRests} used
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExecuteRest('light')}
                    disabled={lightRestsToday >= maxLightRests}
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-800 disabled:opacity-40 border border-cyan-600/60 text-cyan-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isSynthetic ? '⚡ Cycle (+2)' : '☕ Rest (+2)'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div>
                  <div className="text-xs font-mono text-slate-200 font-bold">
                    {isSynthetic ? 'Full Shipyard Overhaul (8 Hours)' : 'Full Rest (8 Hours)'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {isSynthetic ? 'Resets daily maintenance & restores full Structure' : 'Resets daily light rests & fully restores Vitality'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleExecuteRest('full')}
                  className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-800 border border-indigo-600/60 text-indigo-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors"
                >
                  💤 Full Rest
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Right Column (7 Cols) - Weapons, Skills, Features, Defenses */}
        <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          
          {/* Reaction Saves & Defenses Card */}
          {(activeTab === 'all' || activeTab === 'defenses') && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-cyan-400" />
                  Reaction Saves & Tactical Defenses
                </span>
                <span className="text-[10px] text-slate-500 font-normal">2d10 + Attribute Rolls</span>
              </h3>

              {/* Passive Defenses Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Evasion Value</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">{evasionValue} EV</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-yellow-500/30 text-center">
                  <span className="text-[9px] font-mono font-bold text-yellow-500/80 uppercase block">Physical Armor (DR)</span>
                  <span className="text-sm font-mono font-bold text-yellow-400">{physicalArmor} DR</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 text-center">
                  <span className="text-[9px] font-mono font-bold text-purple-400 uppercase block">Energy Shield</span>
                  <span className="text-sm font-mono font-bold text-purple-300">{energyShield} SHD</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Karma Points</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">{curKarma} / {maxKarma}</span>
                </div>
              </div>

              {/* Reaction Saves 1-Click Roll Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {reactionSaves.map(save => (
                  <button
                    key={save.name}
                    type="button"
                    onClick={() => handleRollCheck(save.name, save.bonus)}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 transition-all flex flex-col justify-between text-left cursor-pointer group shadow-sm"
                    title={save.desc}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                        {save.name}
                      </span>
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                        {save.bonus >= 0 ? `+${save.bonus}` : save.bonus}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 line-clamp-1">
                      {save.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tactical Arsenal: Weapons, Natural Attacks & Offensive Metaphysics */}
          {(activeTab === 'all' || activeTab === 'weapons') && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Sword size={14} className="text-rose-400" />
                  <span>Tactical Arsenal &amp; Combat Capabilities</span>
                  <span className="text-[10px] text-slate-500 font-normal">({weaponsList.length})</span>
                </h3>

                {/* Sub-Category Quick Filter Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAttackCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      attackCategoryFilter === 'all'
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({attackCounts.all})
                  </button>
                  {attackCounts.weapon > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttackCategoryFilter('weapon')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                        attackCategoryFilter === 'weapon'
                          ? 'bg-amber-950 border border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>⚔️ Weapons</span>
                      <span>({attackCounts.weapon})</span>
                    </button>
                  )}
                  {attackCounts.natural > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttackCategoryFilter('natural')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                        attackCategoryFilter === 'natural'
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🐾 Natural</span>
                      <span>({attackCounts.natural})</span>
                    </button>
                  )}
                  {attackCounts.metaphysics > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttackCategoryFilter('metaphysics')}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                        attackCategoryFilter === 'metaphysics'
                          ? 'bg-purple-950 border border-purple-500 text-purple-300'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🔮 Metaphysics</span>
                      <span>({attackCounts.metaphysics})</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {filteredAttacks.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                    No offensive capabilities in the selected category.
                  </div>
                ) : (
                  filteredAttacks.map(weapon => {
                    const isMeta = weapon.category === 'metaphysics';
                    const isNat = weapon.category === 'natural';

                    return (
                      <div
                        key={weapon.uid}
                        className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-colors ${
                          isMeta
                            ? 'bg-purple-950/20 border-purple-900/60 hover:border-purple-500/50'
                            : isNat
                            ? 'bg-emerald-950/20 border-emerald-900/60 hover:border-emerald-500/50'
                            : 'bg-slate-950/90 border-slate-800/90 hover:border-cyan-800/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {weapon.name}
                            </span>

                            {/* Category Badge */}
                            {isMeta ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-700/60 text-purple-300 uppercase flex items-center gap-1">
                                <Zap size={10} className="text-purple-400" />
                                <span>METAPHYSICS{weapon.discipline ? ` • ${weapon.discipline}` : ''}</span>
                              </span>
                            ) : isNat ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 uppercase flex items-center gap-1">
                                <span>🐾 NATURAL</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                                {weapon.type || 'WEAPON'}
                              </span>
                            )}

                            {/* Range Tag */}
                            {weapon.range && (
                              <span className="text-[9px] font-mono text-cyan-400">
                                {weapon.range}
                              </span>
                            )}

                            {/* Save/Resistance Tag for Invocations */}
                            {weapon.baseDC && (
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1 rounded border border-amber-800/50">
                                Target DC {weapon.baseDC}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>Base Damage: <strong className={isMeta ? 'text-purple-300' : isNat ? 'text-emerald-300' : 'text-amber-300'}>{weapon.damage}</strong></span>
                            {weapon.notes && (
                              <span className="text-slate-500 font-sans text-[10px] truncate max-w-xs sm:max-w-md" title={weapon.notes}>
                                • {weapon.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tactical Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {isMeta ? (
                            <button
                              type="button"
                              onClick={() => handleRollCheck(`${weapon.name} Invocation Check`, weapon.attackMod)}
                              className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                              title={`Roll 2d10 + Meta Check (${weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod}) vs CR ${weapon.baseDC || 14}`}
                            >
                              <Zap size={12} className="text-purple-400" />
                              <span>Cast ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                            </button>
                          ) : isNat ? (
                            <button
                              type="button"
                              onClick={() => handleRollCheck(`${weapon.name} Strike`, weapon.attackMod)}
                              className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                              title="Roll 2d10 + Natural Strike Modifier"
                            >
                              <Dices size={12} className="text-emerald-400" />
                              <span>Strike ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRollCheck(`${weapon.name} Attack`, weapon.attackMod)}
                              className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-800 border border-cyan-600/60 text-cyan-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                              title="Roll 2d10 + Attack Modifier"
                            >
                              <Dices size={12} />
                              <span>Hit ({weapon.attackMod >= 0 ? `+${weapon.attackMod}` : weapon.attackMod})</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRollWeaponDamage(weapon)}
                            className="px-2.5 py-1 bg-rose-950 hover:bg-rose-800 border border-rose-600/60 text-rose-200 rounded font-mono font-bold text-xs cursor-pointer transition-colors shadow flex items-center gap-1"
                            title={`Roll damage expression (${weapon.damage})`}
                          >
                            <span>💥 Damage</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {latestDamageResult && (
                  <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs font-mono flex items-center justify-between animate-in fade-in">
                    <span>
                      <strong>{latestDamageResult.weaponName}</strong> rolled: <span className="text-white font-bold">{latestDamageResult.expression}</span> = <strong className="text-amber-300 text-sm">{latestDamageResult.total} Damage</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Rolls: {JSON.stringify(latestDamageResult.rolls)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trained Skills (Grouped by Category, Empty Groups Hidden) */}
          {(activeTab === 'all' || activeTab === 'skills') && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Crosshair size={14} className="text-emerald-400" />
                  Trained Operative Skills
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Rank &gt; 0 Only</span>
              </h3>

              {trainedSkillsByGroup.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                  No trained skill ranks allocated on this operative sheet.
                </div>
              ) : (
                <div className="space-y-3">
                  {trainedSkillsByGroup.map(group => (
                    <div key={group.key} className="space-y-1.5">
                      <div className="text-[10.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800/60 pb-1">
                        <span>{group.label}</span>
                        <span className="text-[9px] text-slate-500 font-normal">({group.skills.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.skills.map(skill => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleRollCheck(`${skill.name} Check`, skill.total)}
                            className="p-2 rounded-lg bg-slate-950/80 hover:bg-cyan-950/50 border border-slate-800/80 hover:border-cyan-500/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm text-left"
                            title={`${skill.name}: Rank ${skill.rank} + ${skill.attrKey} (${skill.attrScore}) = Total ${skill.total}\n${skill.description}`}
                          >
                            <div className="truncate pr-1">
                              <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                                {skill.name}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                Rank {skill.rank} • {skill.attrKey} {skill.attrScore >= 0 ? `+${skill.attrScore}` : skill.attrScore}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs shrink-0">
                              +{skill.total}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sorted Features Possessed */}
          {(activeTab === 'all' || activeTab === 'features') && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Features &amp; Perks Possessed ({possessedFeatures.length})
                </h3>
                <input
                  type="text"
                  placeholder="Filter features..."
                  value={featureSearchQuery}
                  onChange={(e) => setFeatureSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs px-2 py-1 rounded text-slate-200 outline-none focus:border-cyan-500 w-full sm:w-40 font-mono"
                />
              </div>

              {possessedFeatures.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                  No features currently recorded on this persona.
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {possessedFeatures
                    .filter(f => !featureSearchQuery || f.name.toLowerCase().includes(featureSearchQuery.toLowerCase()) || f.description.toLowerCase().includes(featureSearchQuery.toLowerCase()))
                    .map((feat, idx) => (
                      <div
                        key={`${feat.name}_${idx}`}
                        className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between gap-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FolioTooltip
                            title={feat.name}
                            badge={`${feat.category} • ${feat.source}`}
                            badgeColor={feat.source.toLowerCase().includes('trait') ? 'emerald' : 'amber'}
                            description={feat.description || 'No description recorded.'}
                            modifiers={feat.modifiers}
                            rules={feat.rules}
                            notes={feat.notes || feat.mechanic}
                            showInfoIcon={true}
                          >
                            <span className="text-xs font-mono font-bold text-amber-200 hover:text-amber-100 transition-colors truncate">
                              {feat.name}
                            </span>
                          </FolioTooltip>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase hidden sm:inline-block">
                            {feat.category}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                            {feat.source}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Easy-Reference Property & Equipment Catalog Card */}
          {(activeTab === 'all' || activeTab === 'property') && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Briefcase size={15} className="text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
                    Property &amp; Equipment Catalog
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {propertyCatalog.allItems.length} Items
                  </span>
                </div>

                {/* Encumbrance Metric */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Scale size={13} className={isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-400' : 'text-emerald-400'} />
                  <span className="text-[11px] text-slate-400">Carried Load:</span>
                  <span className={`font-bold ${isOverburdened ? 'text-red-400' : isEncumbered ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {carriedWeight} / {maxCapacity} lbs
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                    isOverburdened 
                      ? 'bg-red-950 text-red-300 border border-red-800' 
                      : isEncumbered 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {isOverburdened ? 'Overburdened (-2)' : isEncumbered ? 'Encumbered' : 'Unencumbered'}
                  </span>
                </div>
              </div>

              {/* Encumbrance Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isOverburdened ? 'bg-red-500' : isEncumbered ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (carriedWeight / Math.max(1, maxCapacity)) * 100))}%` }}
                />
              </div>

              {/* Filter Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setPropertyCategoryFilter('all')}
                    className={`px-2 py-1 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                      propertyCategoryFilter === 'all'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    All ({propertyCatalog.allItems.length})
                  </button>
                  {propertyCatalog.categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPropertyCategoryFilter(cat.id)}
                      className={`px-2 py-1 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        propertyCategoryFilter === cat.id
                          ? 'bg-cyan-600 text-white shadow'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name.split(' ')[0]}</span>
                      <span className="text-[9px] opacity-75">({cat.items.length})</span>
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative shrink-0 sm:w-48">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter property..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs pl-7 pr-6 py-1 rounded text-slate-200 outline-none focus:border-cyan-500 font-mono"
                  />
                  {propertySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPropertySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Items Catalog List / Grid */}
              {(() => {
                const activeItems = (propertyCategoryFilter === 'all' 
                  ? propertyCatalog.allItems 
                  : (propertyCatalog.categories.find(c => c.id === propertyCategoryFilter)?.items || []))
                  .filter(item => {
                    if (!propertySearchQuery) return true;
                    const q = propertySearchQuery.toLowerCase();
                    return (
                      item.name.toLowerCase().includes(q) ||
                      item.desc.toLowerCase().includes(q) ||
                      item.category.toLowerCase().includes(q) ||
                      (Array.isArray(item.properties) && item.properties.some(p => String(p).toLowerCase().includes(q)))
                    );
                  });

                if (activeItems.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/50">
                      {propertySearchQuery 
                        ? `No property matching "${propertySearchQuery}" in this category.` 
                        : 'No items recorded in this property category.'}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1">
                    {activeItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-1.5 shadow-sm"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-mono font-bold text-slate-200 truncate" title={item.name}>
                                {item.name}
                              </span>
                              {item.qty > 1 && (
                                <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                                  ×{item.qty}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                {item.category.split(' ')[0]}
                              </span>
                              {item.tl && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                                  TL {item.tl}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1 flex-wrap">
                            {item.weight > 0 && (
                              <span>Weight: <strong className="text-slate-300">{item.weight * item.qty} lbs</strong> {item.qty > 1 ? `(${item.weight} ea)` : ''}</span>
                            )}
                            {item.cost && (
                              <span>Val: <strong className="text-emerald-400">{item.cost}</strong></span>
                            )}
                            {item.armorDr && (
                              <span className="text-amber-300 font-bold">DR {item.armorDr}</span>
                            )}
                            {item.damage && (
                              <span className="text-rose-300 font-bold">Dmg: {item.damage}</span>
                            )}
                            {item.range && (
                              <span className="text-cyan-300">Rng: {item.range}</span>
                            )}
                          </div>

                          {item.desc && (
                            <p className="text-[10.5px] font-sans text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          )}
                        </div>

                        {/* Action Roll Trigger if item has combat stats */}
                        {(item.damage || item.attackMod !== 0) && (
                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-900 mt-1">
                            <button
                              type="button"
                              onClick={() => handleRollCheck(`${item.name} Attack`, item.attackMod)}
                              className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                              title={`Roll 2d10 + ${item.attackMod}`}
                            >
                              <Dices size={10} />
                              <span>Hit ({item.attackMod >= 0 ? `+${item.attackMod}` : item.attackMod})</span>
                            </button>
                            {item.damage && (
                              <button
                                type="button"
                                onClick={() => handleRollWeaponDamage(item)}
                                className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                                title={`Roll Damage: ${item.damage}`}
                              >
                                <span>💥 {item.damage}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Conditional Metaphysics Tab (Only if possessed) */}
          {(activeTab === 'all' || activeTab === 'metaphysics') && hasMetaphysics && (
            <div className="bg-slate-900/70 border border-purple-900/50 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-purple-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Flame size={14} className="text-purple-400" />
                  Metaphysics &amp; Awakened Invocations
                </span>
                <span className="text-[10px] text-purple-400/80 font-normal">Supernatural Disciplines</span>
              </h3>

              {/* Awakened Disciplines Badges */}
              {awakenedDisciplines.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                    Awakened Domains:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {awakenedDisciplines.map((awk, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/60 text-purple-200 text-xs font-mono font-bold"
                      >
                        ⚡ {awk.name || 'Discipline'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learned Invocations List */}
              {invocationsList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                    Learned Invocations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {invocationsList.map(inv => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => handleRollCheck(`${inv.name} (DC ${inv.baseDC})`, inv.total)}
                        className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/60 hover:border-purple-500/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm text-left"
                      >
                        <div className="truncate pr-1">
                          <span className="text-xs font-mono font-bold text-purple-200 group-hover:text-purple-100 block truncate">
                            ⚡ {inv.name}
                          </span>
                          <span className="text-[9px] font-mono text-purple-400">
                            {inv.discipline} • Target DC {inv.baseDC}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600 text-purple-200 font-mono font-bold text-xs shrink-0">
                          +{inv.total}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conditional Augmentations Tab (Only if possessed) */}
          {(activeTab === 'all' || activeTab === 'augmentations') && hasAugmentations && (
            <div className="bg-slate-900/70 border border-cyan-900/50 rounded-xl p-3 sm:p-4 space-y-3 backdrop-blur-sm shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase text-cyan-300 tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-cyan-400" />
                  Cyberware &amp; Installed Augmentations
                </span>
                <span className="text-[10px] text-cyan-400/80 font-normal">Chassis Cybernetics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {augmentationsList.map((aug, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-950 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-200">{aug.name || 'Augmentation'}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                        {aug.type || 'Chassis Mod'}
                      </span>
                    </div>
                    {aug.description && (
                      <p className="text-[10.5px] font-sans text-slate-400 mt-1 line-clamp-2">
                        {aug.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      </div>
    </div>
  );
};

export default React.memo(TacticalPlayView);
