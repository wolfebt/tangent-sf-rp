import { 
  Bot, 
  Sparkles, 
  Dices, 
  Shield, 
  Swords, 
  Heart, 
  User, 
  Zap, 
  Award, 
  Package, 
  RefreshCw, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Edit3, 
  Plus, 
  FileText,
  Activity,
  Cpu
} from 'lucide-react';

/**
 * Resolves context menu options for the FOLIO module (Operative Sheet & Dossier)
 * with deep BASTION tactical rules integration.
 */
export function resolveFolioMenu(context, appState, handlers) {
  const { subcategory = 'identity', category, entityId, entityType, entityData, selectedText } = context;
  const { activeOperative, executeBastionPrompt, openBastionDrawer } = handlers;

  const items = [];
  const operativeName = entityData?.name || activeOperative?.name || 'Operative';

  // 1. Text Selection Specific Actions (if text is selected inside Folio)
  if (selectedText && selectedText.length > 0) {
    return [
      {
        type: 'section-header',
        label: 'Selected Text'
      },
      {
        id: 'copy-text',
        label: 'Copy Text',
        icon: Copy,
        shortcut: 'Ctrl+C',
        onClick: () => navigator.clipboard.writeText(selectedText)
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Tactical Copilot'
      },
      {
        id: 'bastion-ask-selection',
        label: `Ask BASTION about "${selectedText.slice(0, 20)}..."`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Rules Adjudication: "${selectedText.slice(0, 30)}"`,
          prompt: `Analyze the following Tangent SFF RPG term or rule text and explain its tactical mechanics, canonical precedent, and applications: "${selectedText}"`,
          context: `Folio: ${operativeName} [${subcategory}]`
        })
      },
      {
        id: 'bastion-open-chat',
        label: 'Open Full BASTION Chat',
        icon: Bot,
        aiType: 'BASTION',
        onClick: () => openBastionDrawer(`Regarding "${selectedText}": `)
      }
    ];
  }

  // 2. Subcategory Specific Resolvers

  // SUB: IDENTITY / PERSONA
  if (subcategory === 'identity' || subcategory === 'persona') {
    items.push(
      {
        type: 'section-header',
        label: 'Identity Operations'
      },
      {
        id: 'copy-dossier-summary',
        label: 'Copy Dossier Summary',
        icon: Copy,
        onClick: () => {
          const text = `${operativeName} | ${activeOperative?.species || 'Unknown Species'} ${activeOperative?.archetype || 'Archetype'}\nFaction: ${activeOperative?.faction || 'None'} | Origin: ${activeOperative?.origin || 'None'} | Occupation: ${activeOperative?.occupation || 'None'}`;
          navigator.clipboard.writeText(text);
        }
      },
      {
        id: 'switch-operative',
        label: 'Open Roster Catalog',
        icon: User,
        shortcut: 'Roster',
        onClick: () => window.dispatchEvent(new CustomEvent('open-folio-roster'))
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Canonical AI'
      },
      {
        id: 'bastion-backstory',
        label: 'BASTION: Synthesize Backstory',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Synthesize Backstory for ${operativeName}`,
          prompt: `Synthesize a canonical, evocative background dossier for ${operativeName}. Strictly ground their history in the Tangent SFF RPG 5 Pillars: Species: ${activeOperative?.species || 'Human'}, Archetype: ${activeOperative?.archetype || 'Sentinel'}, Faction: ${activeOperative?.faction || 'Syndicate'}, Origin: ${activeOperative?.origin || 'Spacer'}, Occupation: ${activeOperative?.occupation || 'Operative'}. Incorporate cultural nuance, military/civilian history, and a defining complication.`,
          context: `Operative: ${operativeName}`,
          applyTarget: 'bio'
        })
      },
      {
        id: 'bastion-audit-pillars',
        label: 'BASTION: Audit 5 Pillars Compliance',
        icon: CheckCircle2,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `5 Pillars Audit: ${operativeName}`,
          prompt: `Perform an analytical rules audit for ${operativeName}. Verify that their Character Chassis complies with the Tangent SFF RPG canonical protocol: 150 BP base chassis, three 20 SP background pools (Faction, Origin, Occupation), +1 increment advancement rules, and Karma Debt limit (Charisma + 1). Identify any rules discrepancies or unspent pools.`,
          context: `Operative: ${operativeName}`
        })
      },
      {
        id: 'bastion-karma-actions',
        label: 'BASTION: Spend Karma Point (1 KP)',
        icon: Zap,
        children: [
          {
            id: 'karma-got-this',
            label: '"I Got This" (Advantage on next check)',
            onClick: () => handlers.rollDice?.({ type: 'karma', name: 'I Got This', desc: 'Advantage on roll declared before check' })
          },
          {
            id: 'karma-not-meant',
            label: '"Not What I Meant" (Reroll non-combat check)',
            onClick: () => handlers.rollDice?.({ type: 'karma', name: 'Not What I Meant', desc: 'Reroll non-combat check declared after roll' })
          },
          {
            id: 'karma-second-wind',
            label: '"Second Wind" (Instant Light Rest focus)',
            onClick: () => handlers.applyRest?.('light')
          },
          {
            id: 'karma-shake-off',
            label: '"Shake it Off" (Reduce condition by 1 stage)',
            onClick: () => handlers.reduceCondition?.()
          }
        ]
      }
    );
  }

  // SUB: CORE STATS & VITALS
  else if (subcategory === 'stats' || subcategory === 'corestats' || subcategory === 'vitals') {
    items.push(
      {
        type: 'section-header',
        label: 'Stats & Vitals'
      },
      {
        id: 'inspect-subattributes',
        label: 'Calculate Canonical Sub-Attributes',
        icon: Activity,
        onClick: () => executeBastionPrompt({
          title: 'Sub-Attribute Derivation Calculation',
          prompt: `Calculate the canonical sub-attributes for ${operativeName} using the SFF RPG formula (Base = 2 + Primary Attribute * 2). Check Strength, Agility, Stamina, Intellect, Wisdom, and Charisma ratings and compute their respective sub-attributes and active defense ratings.`,
          context: `Operative: ${operativeName}`
        })
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Combat Calculations'
      },
      {
        id: 'bastion-trauma-threshold',
        label: 'BASTION: 33.3% Major Trauma Analysis',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Trauma Thresholds: ${operativeName}`,
          prompt: `Calculate the exact Major Wound Trauma threshold (>= 33.3% Max HP in a single strike) for ${operativeName}. Explain the tactical trauma consequences when crossing this threshold: anatomical trauma table rolls, shock condition stages, and stamina DR mitigation.`,
          context: `Operative: ${operativeName}`
        })
      },
      {
        id: 'bastion-stamina-dr-audit',
        label: 'BASTION: Audit Stamina Damage Reduction (DR)',
        icon: Shield,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: 'Stamina DR Mechanics Audit',
          prompt: `Detail the exact Damage Reduction (DR / Toughness) provided by ${operativeName}'s Stamina attribute. Remind the Architect why Stamina provides natural DR rather than flat HP/VP in the Tangent SFF RPG system.`,
          context: `Operative: ${operativeName}`
        })
      }
    );
  }

  // SUB: SKILLS & SPECIALIZATIONS
  else if (subcategory === 'skills' || category === 'skills' || entityType === 'skill' || entityType === 'specialization') {
    const skillName = entityData?.name || 'Selected Skill';
    items.push(
      {
        type: 'section-header',
        label: `Skill: ${skillName}`
      },
      {
        id: 'roll-skill-check',
        label: `Roll Check: 2d10 + ${skillName}`,
        icon: Dices,
        shortcut: '2d10',
        onClick: () => {
          handlers.rollDice?.({ 
            label: `${skillName} Check`, 
            skill: skillName, 
            formula: '2d10 + Mod' 
          });
        }
      },
      {
        id: 'increment-skill-rank',
        label: 'Advance Skill Rank (+1)',
        icon: Plus,
        onClick: () => handlers.advanceSkill?.(entityId || skillName)
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'Admin / Asset Operations'
      },
      {
        id: 'view-edit-skill-dataset',
        label: `View / Edit Skill Dataset (${skillName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openSkillDataset) {
            handlers.openSkillDataset(entityData || { id: entityId, name: skillName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'skills',
                title: `${skillName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: skillName }
              }
            }));
          }
        }
      },
      {
        id: 'open-skill-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('skills', skillName);
          } else {
            window.location.href = `/dbm?cat=skills&item=${encodeURIComponent(entityId || skillName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Skill Advisory'
      },
      {
        id: 'bastion-action-economy',
        label: 'BASTION: Adjudicate Action Economy',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Action Economy Tier for ${skillName}`,
          prompt: `Explain the Skill Tier Action Economy for ${skillName} in Tangent SFF RPG: Rank 0 (Untrained: Full Round), Rank 1-5 (Novice: 1 action, +2 Focus), Rank 6-10 (Trained: 2nd action at -5, +3 Focus), Rank 11-15 (Expert: 3rd action at -10, +4 Focus), Rank 16-20 (Master: 4th action at -15, +5 Focus). Note how this governs attacks and defense reactions with zero Action Points (AP).`,
          context: `Skill: ${skillName}`
        })
      },
      {
        id: 'bastion-synergistic-feats',
        label: `BASTION: Recommend Synergies for ${skillName}`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Synergies for ${skillName}`,
          prompt: `Analyze ${skillName} and recommend top synergistic canonical Features, Feats, Traits, and Equipment from the Tangent Omnicortex database that optimize an operative specializing in this skill.`,
          context: `Skill: ${skillName}`
        })
      }
    );
  }

  // SUB: FEATURES & TALENTS
  else if (subcategory === 'features' || category === 'features' || entityType === 'feature' || entityType === 'features') {
    const featureName = entityData?.name || entityData?.title || 'Selected Feature';
    const featureCat = entityData?.category || entityData?.type || 'General';
    const cp = entityData?.cp !== undefined ? `${entityData.cp} CP` : '3 CP';

    items.push(
      {
        type: 'section-header',
        label: `Feature: ${featureName}`
      },
      {
        id: 'view-edit-feature-dataset',
        label: `View / Edit Feature Dataset (${featureName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openFeatureDataset) {
            handlers.openFeatureDataset(entityData || { id: entityId, name: featureName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'features',
                title: `${featureName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: featureName }
              }
            }));
          }
        }
      },
      {
        id: 'open-feature-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('features', featureName);
          } else {
            window.location.href = `/dbm?cat=features&item=${encodeURIComponent(entityId || featureName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Feature Advisory'
      },
      {
        id: 'bastion-adjudicate-feature',
        label: `BASTION: Adjudicate Mechanics for ${featureName}`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Mechanics Adjudication: ${featureName}`,
          prompt: `Analyze the feature "${featureName}" (${featureCat}, ${cp}) in the Tangent SFF RPG system. Explain how its mechanical benefits, prerequisites, and stacking interactions apply during tactical play and character advancement. Ground response in canonical rules.`,
          context: `Feature: ${featureName} [${featureCat}]`
        })
      },
      {
        id: 'bastion-feature-synergies',
        label: `BASTION: Recommend Synergies for ${featureName}`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Synergies for ${featureName}`,
          prompt: `Analyze the feature "${featureName}" and recommend complementary canonical skills, attributes, cybernetics, and tactical loadouts from the Tangent Omnicortex database that maximize this feature's potential.`,
          context: `Feature: ${featureName}`
        })
      }
    );
  }

  // SUB: TRAITS & BIOLOGICAL ADAPTATIONS
  else if (subcategory === 'traits' || category === 'traits' || entityType === 'trait' || entityType === 'traits') {
    const traitName = entityData?.name || entityData?.title || 'Selected Trait';
    const traitType = entityData?.trait_type || entityData?.type || entityData?.columnSource || 'Species Trait';
    const traitTier = entityData?.trait_tier || 'Basic';
    const cp = entityData?.cp !== undefined ? `${entityData.cp} CP` : '1 CP';

    items.push(
      {
        type: 'section-header',
        label: `Trait: ${traitName}`
      },
      {
        id: 'view-edit-trait-dataset',
        label: `View / Edit Trait Dataset (${traitName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openTraitDataset) {
            handlers.openTraitDataset(entityData || { id: entityId, name: traitName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'traits',
                title: `${traitName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: traitName }
              }
            }));
          }
        }
      },
      {
        id: 'open-trait-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('traits', traitName);
          } else {
            window.location.href = `/dbm?cat=traits&item=${encodeURIComponent(entityId || traitName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Trait Advisory'
      },
      {
        id: 'bastion-adjudicate-trait',
        label: `BASTION: Adjudicate Mechanics for ${traitName}`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Mechanics Adjudication: ${traitName}`,
          prompt: `Analyze the trait "${traitName}" (${traitTier} ${traitType}, ${cp}) in the Tangent SFF RPG system. Explain how its mechanical benefits, rules, and physiological adaptations function in play, including synergy with species lineage or occupation. Ground response in canonical rules.`,
          context: `Trait: ${traitName} [${traitType}]`
        })
      },
      {
        id: 'bastion-trait-synergies',
        label: `BASTION: Recommend Synergies for ${traitName}`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Synergies for ${traitName}`,
          prompt: `Analyze the trait "${traitName}" and recommend complementary canonical features, skills, cybernetics, and lineage adaptations from the Tangent Omnicortex database that optimize this character build.`,
          context: `Trait: ${traitName}`
        })
      }
    );
  }

  // SUB: INVOCATIONS & METAPHYSICAL POWERS
  else if (subcategory === 'invocations' || category === 'invocations' || subcategory === 'metaphysics' || category === 'metaphysics' || entityType === 'invocation' || entityType === 'invocations') {
    const invName = entityData?.name || entityData?.title || 'Selected Invocation';
    const discName = entityData?.discipline || 'Metaphysics';
    const invLevel = entityData?.level !== undefined ? `Level ${entityData.level}` : (entityData?.rank !== undefined ? `Rank ${entityData.rank}` : 'Invocation');
    const dcDisplay = entityData?.manifestation_dc || entityData?.baseDC ? `DC ${entityData.manifestation_dc || entityData.baseDC}` : 'DC 15';

    items.push(
      {
        type: 'section-header',
        label: `Invocation: ${invName}`
      },
      {
        id: 'view-edit-invocation-dataset',
        label: `View / Edit Invocation Dataset (${invName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openInvocationDataset) {
            handlers.openInvocationDataset(entityData || { id: entityId, name: invName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'invocations',
                title: `${invName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: invName }
              }
            }));
          }
        }
      },
      {
        id: 'open-invocation-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('invocations', invName);
          } else {
            window.location.href = `/dbm?cat=invocations&item=${encodeURIComponent(entityId || invName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Psionic Advisory'
      },
      {
        id: 'bastion-adjudicate-invocation',
        label: `BASTION: Adjudicate Mechanics for ${invName}`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Psionic Adjudication: ${invName}`,
          prompt: `Analyze the invocation "${invName}" (${discName}, ${invLevel}, ${dcDisplay}) in the Tangent SFF RPG system. Detail its reality-manipulation mechanics, Focus and Strain expenditures, manifestation check formulas, range, duration, and tactical application. Ground response in canonical rules.`,
          context: `Invocation: ${invName} [${discName}]`
        })
      },
      {
        id: 'bastion-invocation-synergies',
        label: `BASTION: Recommend Synergies for ${invName}`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Synergies for ${invName}`,
          prompt: `Analyze the invocation "${invName}" and recommend complementary Awakened disciplines, meta-skills, focus-amplifying cybernetics, and synergistic feats from the Tangent Omnicortex database that optimize this psionic power.`,
          context: `Invocation: ${invName}`
        })
      }
    );
  }

  // SUB: AUGMENTATIONS & CYBERWARE
  else if (subcategory === 'augmentations' || category === 'augmentations' || subcategory === 'cyberware' || category === 'cyberware' || entityType === 'augmentation' || entityType === 'augmentations') {
    const augName = entityData?.name || entityData?.title || 'Selected Augmentation';
    const stage = entityData?.stage || 'Standard';
    const location = entityData?.body_location || entityData?.location || 'General';
    const nodes = entityData?.costs?.nodes ?? entityData?.nodes ?? 0;
    const tl = entityData?.tech_level ?? entityData?.tl ?? 3;

    items.push(
      {
        type: 'section-header',
        label: `Augmentation: ${augName}`
      },
      {
        id: 'view-edit-augmentation-dataset',
        label: `View / Edit Augmentation Dataset (${augName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openAugmentationDataset) {
            handlers.openAugmentationDataset(entityData || { id: entityId, name: augName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'augmentations',
                title: `${augName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: augName }
              }
            }));
          }
        }
      },
      {
        id: 'open-augmentation-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('augmentations', augName);
          } else {
            window.location.href = `/dbm?cat=augmentations&item=${encodeURIComponent(entityId || augName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Cybernetic Advisory'
      },
      {
        id: 'bastion-adjudicate-augmentation',
        label: `BASTION: Evaluate Cyberware Compatibility`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Cybernetic Evaluation: ${augName}`,
          prompt: `Analyze the augmentation "${augName}" (Stage: ${stage}, Slot: ${location}, ${nodes} Nodes, TL ${tl}) for operative "${operativeName}". Evaluate biological compatibility, surgical strain, anatomical capacity limits, and operational synergy with the operative's chassis. Ground your advice in canonical Tangent SFF RPG augmentations rules.`,
          context: `Augmentation: ${augName} [Stage: ${stage}, Slot: ${location}]`
        })
      },
      {
        id: 'bastion-augmentation-optimizations',
        label: `BASTION: Suggest Upgrades & Synergies`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Cyberware Optimization: ${augName}`,
          prompt: `Recommend optimal cybernetic node configurations, tactical hardware integrations, and synergistic features for "${augName}" in operative "${operativeName}'s loadout.`,
          context: `Augmentation: ${augName}`
        })
      }
    );
  }

  // SUB: HINDRANCES & DISADVANTAGES
  else if (subcategory === 'hindrances' || category === 'hindrances' || subcategory === 'disadvantages' || category === 'disadvantages' || subcategory === 'species_disadvantages' || category === 'species_disadvantages' || entityType === 'hindrance' || entityType === 'disadvantage' || entityType === 'hindrances' || entityType === 'disadvantages') {
    const hindName = entityData?.name || entityData?.title || 'Selected Hindrance';
    const classification = entityData?.classification || entityData?.type || 'General';
    const refundCP = (entityData?.refundCP ?? entityData?.refund_cp ?? Math.abs(Number(entityData?.cp) || 0)) || 3;
    const prereq = entityData?.prerequisite && entityData?.prerequisite !== 'None' ? ` • Req: ${entityData.prerequisite}` : '';

    items.push(
      {
        type: 'section-header',
        label: `Hindrance: ${hindName}`
      },
      {
        id: 'view-edit-hindrance-dataset',
        label: `View / Edit Hindrance Dataset (${hindName})`,
        icon: Edit3,
        highlight: true,
        badge: 'ADMIN',
        onClick: () => {
          if (handlers.openHindranceDataset) {
            handlers.openHindranceDataset(entityData || { id: entityId, name: hindName });
          } else {
            window.dispatchEvent(new CustomEvent('open-folio-asset', {
              detail: {
                key: 'disadvantages',
                title: `${hindName} Matrix`,
                mode: 'edit',
                initialData: entityData || { id: entityId, name: hindName }
              }
            }));
          }
        }
      },
      {
        id: 'open-hindrance-dbm',
        label: 'Inspect in Omnicortex DBM',
        icon: BookOpen,
        onClick: () => {
          if (handlers.openInDbm) {
            handlers.openInDbm('disadvantages', hindName);
          } else {
            window.location.href = `/dbm?cat=disadvantages&item=${encodeURIComponent(entityId || hindName)}`;
          }
        }
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Hindrance Advisory'
      },
      {
        id: 'bastion-adjudicate-hindrance',
        label: `BASTION: Adjudicate Flaw & Severity`,
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => executeBastionPrompt({
          title: `Hindrance Adjudication: ${hindName}`,
          prompt: `Analyze the hindrance/disadvantage "${hindName}" (${classification}, refund: ${refundCP} CP${prereq}) in the Tangent SFF RPG system. Explain how its penalties, narrative triggers, severity tiers, and mechanical handicaps function in active play. Detail roleplay complications and GM award conditions. Ground response in canonical rules.`,
          context: `Hindrance: ${hindName} [${classification}, ${refundCP} CP]`
        })
      },
      {
        id: 'bastion-hindrance-overcoming',
        label: `BASTION: Overcoming & Narrative Arcs`,
        icon: Sparkles,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Overcoming Hindrance: ${hindName}`,
          prompt: `Propose dramatic narrative arcs, cybernetic or medical mitigations, and character advancement options for operative "${operativeName}" to overcome, buy off, or strategically mitigate the hindrance "${hindName}".`,
          context: `Operative: ${operativeName}, Hindrance: ${hindName}`
        })
      }
    );
  }

  // SUB: COMBAT & ARMORY
  else if (subcategory === 'combat' || subcategory === 'armory' || subcategory === 'gear') {
    const itemName = entityData?.name || 'Weapon';
    items.push(
      {
        type: 'section-header',
        label: `Armory: ${itemName}`
      },
      {
        id: 'roll-attack',
        label: `Attack Roll with ${itemName}`,
        icon: Swords,
        shortcut: '2d10',
        onClick: () => handlers.rollDice?.({ label: `Attack: ${itemName}`, formula: '2d10 + Combat Skill' })
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Tactical Combat'
      },
      {
        id: 'bastion-called-shots',
        label: 'BASTION: Called Shot Modifiers',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        children: [
          {
            id: 'called-shot-head',
            label: 'Head / Central CPU (-2 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Head]: ${itemName}`, penalty: -2 })
          },
          {
            id: 'called-shot-arms',
            label: 'Arms / Manipulators (-2 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Arms]: ${itemName}`, penalty: -2 })
          },
          {
            id: 'called-shot-legs',
            label: 'Legs / Locomotion (-1 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Legs]: ${itemName}`, penalty: -1 })
          },
          {
            id: 'called-shot-optics',
            label: 'Optics / Sensor Array (-3 penalty)',
            onClick: () => handlers.rollDice?.({ label: `Called Shot [Optics]: ${itemName}`, penalty: -3 })
          }
        ]
      },
      {
        id: 'bastion-economatrix',
        label: 'BASTION: Economatrix Valuation',
        icon: Cpu,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: `Economatrix Valuation: ${itemName}`,
          prompt: `Calculate the canonical Economatrix market value for ${itemName} using the Tangent formula: Cost = Base * (2^TL) * (1.5^ML). Specify base credit value, Tech Level pricing multiplier, and availability across Core vs Rim worlds.`,
          context: `Item: ${itemName}`
        })
      }
    );
  }

  // DEFAULT / GENERAL FOLIO FALLBACK
  else {
    items.push(
      {
        type: 'section-header',
        label: 'Operative Actions'
      },
      {
        id: 'open-folio-catalog',
        label: 'Open Folio Catalog View',
        icon: FileText,
        onClick: () => window.dispatchEvent(new CustomEvent('open-folio-catalog'))
      },
      {
        id: 'open-folio-economy',
        label: 'Open Credits & Inventory',
        icon: Package,
        onClick: () => window.dispatchEvent(new CustomEvent('open-folio-economy'))
      },
      { type: 'divider' },
      {
        type: 'section-header',
        label: 'BASTION Tactical Copilot'
      },
      {
        id: 'bastion-open-general',
        label: 'Open BASTION Rules Arbiter',
        icon: Bot,
        aiType: 'BASTION',
        highlight: true,
        onClick: () => openBastionDrawer()
      },
      {
        id: 'bastion-quick-rules',
        label: 'BASTION: Consult Rules Ledger',
        icon: BookOpen,
        aiType: 'BASTION',
        onClick: () => executeBastionPrompt({
          title: 'BASTION Rules Ledger Check',
          prompt: `Provide a quick tactical rules summary for the active operative ${operativeName}: summarize active defense reaction limits, called shot penalties, and karma spend options.`,
          context: `Operative: ${operativeName}`
        })
      }
    );
  }

  return items;
}

export default resolveFolioMenu;
