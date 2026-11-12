import React, { useState, useMemo, useEffect } from 'react';
import { generateSelectiveFields } from '../../services/bastionService';
import { useBastion } from '../../context/BastionContext';
import { useCampaign } from '../../context/CampaignContext';
import { ELEMENT_SCHEMAS } from '../../pages/Foundry/ElementForge/elementSchemas';

export const DEFAULT_COMPENDIUM_PRESETS = [
  { label: 'Alien Species', prompt: 'Biological alien species originating from an extreme gravity environment with specialized natural armor and environmental adaptations.' },
  { label: 'High-Tech Weapon', prompt: 'TL-4 directed energy plasma rifle with armor-piercing capabilities, overcharge mode, and modular rail attachment slots.' },
  { label: 'Shadow Syndicate', prompt: 'Covert faction operating in the outer rim specializing in cybernetics smuggling, black-market data trades, and info warfare.' },
  { label: 'Meta-Psi Invocation', prompt: 'ML-3 psionic invocation that projects kinetic force barriers and telekinetically deflects incoming projectile fire.' },
  { label: 'Subterranean Outpost', prompt: 'Fortified subterranean research facility guarded by automated defense turrets, sensor grids, and biometric security doors.' },
];

export const FOUNDRY_PRESETS = [
  { label: 'Derelict Ship Encounter', type: 'Encounter', prompt: 'Derelict starship floating in deep space with environmental hazards, automated defense turrets, and valuable salvaged data core.' },
  { label: 'Sci-Fi Persona Fixer', type: 'Persona', prompt: 'Cynical cyberpunk information broker with cybernetic ocular implants, clandestine faction ties, and a secret agenda.' },
  { label: 'Prototype Property Relic', type: 'Property', prompt: 'Phase-resonant monofilament carbine with TL-4 micro-capacitors and Precursor targeting telemetry.' },
  { label: 'Ancient Psi Artifact Clue', type: 'Clue', prompt: 'Strange crystalline monolith emitting psionic pulses, decipherable only by attuned individuals.' },
  { label: 'High-Tech Facility Setting', type: 'Setting', prompt: 'Heavily fortified subterranean research station guarded by tactical drones and biometric security doors.' },
  { label: 'Faction Shadow War', type: 'Story Arc', prompt: 'Escalating covert conflict between rival megacorporations competing for control of a newly discovered warp gate.' },
];

export const CATEGORY_PRESETS_MAP = {
  species: [
    { label: 'High-G Lithoid', prompt: 'Silicon-based heavy-worlder species with crystalline dermal plating, dense musculature, and radiation tolerance.' },
    { label: 'Void-Born Nomad', prompt: 'Zero-G adapted spacer lineage with prehensile limbs, vacuum resilience, and low-light ocular membranes.' },
    { label: 'Synthetic Choir Frame', prompt: 'Self-aware synthetic chassis lineage built around quantum-lattice neural cores and modular sensor arrays.' },
    { label: 'Amphibious Reef Kin', prompt: 'Bioluminescent aquatic species capable of deep-pressure diving, bio-sonar echolocation, and amphibious respiration.' },
  ],
  factions: [
    { label: 'Megacorp Trade Cartel', prompt: 'Interstellar corporate oligarchy controlling jump-gate tariffs, private naval fleets, and proprietary cyberware patents.' },
    { label: 'Outer-Rim Shadow Syndicate', prompt: 'Covert syndicate operating across lawless frontier ports specializing in black-market relics, data brokerage, and smuggling.' },
    { label: 'Metaphysical Monastic Order', prompt: 'Ascetic psionic order safeguarding ancient precursor vaults, training awakened adepts, and mediating sector disputes.' },
    { label: 'Frontier Defense Coalition', prompt: 'Mutual-defense alliance of independent colony worlds maintaining rapid-response ranger fleets and marshals.' },
  ],
  origins: [
    { label: 'Orbital Spindle Habitat', prompt: 'High-density rotating orbital station origin emphasizing zero-G athletics, systems engineering, and multicultural trade.' },
    { label: 'Harsh Frontier Colony', prompt: 'Untamed exoplanet settlement origin forged by extreme weather, survivalism, salvage mechanics, and perimeter defense.' },
    { label: 'Core-World Arcology', prompt: 'Hyper-developed metropolitan core world origin steeped in bureaucracy, high-tech networks, diplomacy, and intrigue.' },
    { label: 'Deep-Space Pilgrim Fleet', prompt: 'Generational nomad flotilla origin focused on astrogation, shipboard maintenance, void survival, and communal duty.' },
  ],
  occupations: [
    { label: 'Void Breacher Marine', prompt: 'Zero-G boarding and tactical security career trained in close-quarters ballistics, armor operation, and breaching charges.' },
    { label: 'Black-ICE Netrunner', prompt: 'Covert cyber-intrusion specialist skilled in quantum decryption, drone hijacking, electronic warfare, and stealth.' },
    { label: 'Xeno-Archaeologist', prompt: 'Field researcher excavating precursor ruins, deciphering dead languages, bypassing ancient traps, and appraising relics.' },
    { label: 'Combat Trauma Medic', prompt: 'Frontline emergency surgeon and bioware technician stabilizing casualties under fire and countering exotic toxins.' },
  ],
  archetypes: [
    { label: 'Sentinel Vanguard', prompt: '80 CP Sentinel sphere archetype built around frontline durability, tactical command, and heavy weapons mastery.' },
    { label: 'Covert Operative', prompt: '80 CP Operative sphere archetype specializing in infiltration, precision strikes, reconnaissance, and evasion.' },
    { label: 'Psionic Visionary', prompt: '80 CP Visionary sphere archetype channeling high-attunement metaphysical disciplines, foresight, and force projection.' },
    { label: 'Systems Savant', prompt: '80 CP Savant sphere archetype dominating battlefield electronics, field fabrication, medical science, and analysis.' },
  ],
  weaponry: [
    { label: 'TL-4 Plasma Rifle', prompt: 'TL-4 directed energy plasma rifle with armor-piercing thermal bolts, overcharge mode, and modular optic/rail sockets.' },
    { label: 'Gauss Anti-Materiel Lance', prompt: 'High-velocity electromagnetic sniper platform with extreme range, heavy kinetic penetration, and bipod stabilization.' },
    { label: 'Monomolecular Vibroblade', prompt: 'High-frequency resonant melee blade capable of shearing composite armor plates with balanced finesse handling.' },
    { label: 'Smart-Linked Flechette SMG', prompt: 'Compact close-quarters submachine gun firing shredder flechettes with neural targeting link integration.' },
  ],
  armoring: [
    { label: 'Powered Assault Carapace', prompt: 'Sealed servo-assisted heavy battle armor providing high kinetic/energy DR, life support, and integrated hardpoints.' },
    { label: 'Chameleon Recon Suit', prompt: 'Lightweight electro-reactive stealth suit granting optical thermoptic camouflage and unrestricted agility.' },
    { label: 'Hard-Vac Boarding Rig', prompt: 'Reinforced EVA void suit with magnetic boots, thruster micro-jets, and radiation/shrapnel shielding.' },
    { label: 'Kinetic Phase Shield', prompt: 'Forearm-mounted directional energy barrier generator projecting a shimmering deflection plane against incoming fire.' },
  ],
  augmentations: [
    { label: 'Synaptic Reflex Booster', prompt: 'Spinal neural accelerator implant heightening reaction speed, initiative, and split-second combat evasion.' },
    { label: 'Multi-Spectrum Cybereyes', prompt: 'Ocular prosthetic suite granting thermographic vision, rangefinding telemetry, and flash-suppression filtering.' },
    { label: 'Subdermal Ballistic Weave', prompt: 'Biocompatible carbon-nanotube dermal mesh providing discreet passive kinetic and slash damage reduction.' },
    { label: 'Bioware Adrenal Regulator', prompt: 'Cultured endocrine organ graft allowing controlled surges of stamina, pain suppression, and toxin filtration.' },
  ],
  gear: [
    { label: 'Quantum Intrusion Deck', prompt: 'Portable cyber-warfare terminal engineered for bypassing hardened security nodes and spoofing local grids.' },
    { label: 'Auto-Doc Trauma Kit', prompt: 'Smart-assisted field surgical kit deploying hemostatic nanogel, diagnostic biosensors, and rapid-stabilization injectors.' },
    { label: 'Gravitic Grappling Harness', prompt: 'Compact micro-repulsor rig enabling controlled freefall descent, high-angle ascents, and zero-G anchoring.' },
    { label: 'Multi-Band Sensor Probe', prompt: 'Handheld tactical scanner detecting life-signs, electromagnetic emissions, and atmospheric hazards through bulkheads.' },
  ],
  mecha: [
    { label: 'Orbital Drop Strike Frame', prompt: 'Bipedal tactical mecha engineered for atmospheric insertion, heavy autocannon fire support, and jump-jet mobility.' },
    { label: 'Fast-Attack Corvette', prompt: 'Sleek interstellar patrol vessel armed with point-defense lasers, torpedo tubes, and high-thrust fusion drives.' },
    { label: 'Heavy Siege Walker', prompt: 'Quadrupedal armored artillery platform mounting spinal railguns, ablative plating, and reinforced structure points.' },
    { label: 'Stealth Recon Skiff', prompt: 'Low-signature gravitic skimmer built for covert insertion, sensor jamming, and rapid extraction.' },
  ],
  architecture: [
    { label: 'Subterranean Research Bunker', prompt: 'Fortified underground laboratory guarded by biometric airlocks, automated defense turrets, and containment vaults.' },
    { label: 'Orbital Trade Spindle', prompt: 'High-capacity commercial starport ring featuring docking bays, customs scanners, cargo warehouses, and promenade decks.' },
    { label: 'Frontier Listening Post', prompt: 'Remote sensor array outpost monitoring deep-space jump signatures with concealed shield generators and garrison quarters.' },
    { label: 'Automated Nanoforge Foundry', prompt: 'Industrial fabrication complex housing high-TL assembly matrices, raw ore refineries, and drone logistics bays.' },
  ],
  invocations: [
    { label: 'Kinetic Force Barrier', prompt: 'ML-3 Kinesis invocation projecting a translucent telekinetic wall that absorbs projectile fire and concussive blasts.' },
    { label: 'Telepathic Neural Lance', prompt: 'ML-2 Telepathy offensive invocation overwhelming a target’s synapses with psychic feedback and disorientation.' },
    { label: 'Chrono-Slip Step', prompt: 'ML-3 Translocation invocation folding local spacetime to instantaneously blink across line-of-sight tactical positions.' },
    { label: 'Cellular Regeneration Surge', prompt: 'ML-2 Vitalism restorative invocation accelerating tissue knitting and purging metabolic shock.' },
  ],
  companions: [
    { label: 'Autonomous Recon Drone', prompt: 'Compact hovering tactical drone companion equipped with holo-mapping optics, silenced stunner, and encrypted neural link.' },
    { label: 'Bonded Xeno-Hound', prompt: 'Genetically loyal apex tracker beast companion with keen scent-tracking, pack-tactics flanking, and armored hide.' },
    { label: 'Combat Support Automaton', prompt: 'Bipedal utility/bodyguard frame programmed for suppressive fire, heavy cargo hauling, and shield-wall protection.' },
  ],
  modular_characters: [
    { label: 'Tier-3 Syndicate Enforcer', prompt: 'Veteran cyber-enhanced enforcer armed with smart-linked heavy weaponry, tactical armor, and ruthless street tactics.' },
    { label: 'Apex Xeno-Predator Boss', prompt: 'Colossal ambush predator threat with natural armor plating, multi-attack rending claws, and terrifying roar.' },
    { label: 'Awakened Rift Cultist', prompt: 'Zealous psionic adversary wielding destabilizing kinetic invocations, Mind-Shield wards, and fanatical resolve.' },
  ],
  planetary_design: [
    { label: 'Tidal-Locked Twilight World', prompt: 'Habitable ribbon-zone exoplanet split between scorching sunward deserts and frozen nightside glacier vaults.' },
    { label: 'High-Tech Trade Hub', prompt: 'Class-A Starport core world encircled by orbital shipyards, dense skyhook towers, and strict law enforcement.' },
    { label: 'Quarantined Relic Tomb-World', prompt: 'Irradiated dead world littered with dormant precursor monoliths, anomalous storms, and salvage blockades.' },
  ],
};

const NON_GENERATIVE_FIELDS = [
  'order', 'parent', 'parententry', 'parentid', 'parentcategory',
  'id', '_id', 'uuid', 'created_at', 'updated_at', 'createdat', 'updatedat',
  'system', 'isparent', 'subitems', 'directory_columns',
];

export function getPresetsForCollection(currentKey, safeConfig = {}) {
  const k = String(currentKey || 'compendium').toLowerCase();
  if (k === 'compendium') return DEFAULT_COMPENDIUM_PRESETS;
  if (CATEGORY_PRESETS_MAP[k]) return CATEGORY_PRESETS_MAP[k];
  if (k.startsWith('species')) return CATEGORY_PRESETS_MAP.species;
  if (k.startsWith('society') || k === 'societies') return CATEGORY_PRESETS_MAP.factions;
  if (['weapons', 'weapon', 'attacks'].includes(k)) return CATEGORY_PRESETS_MAP.weaponry;
  if (['armor', 'shields'].includes(k)) return CATEGORY_PRESETS_MAP.armoring;
  if (['equipment', 'other'].includes(k)) return CATEGORY_PRESETS_MAP.gear;
  if (['vehicles', 'starships'].includes(k)) return CATEGORY_PRESETS_MAP.mecha;
  if (['facilities', 'property', 'stations'].includes(k)) return CATEGORY_PRESETS_MAP.architecture;
  if (['invocation', 'awakened', 'disciplines', 'special_abilities', 'meta-tech'].includes(k)) return CATEGORY_PRESETS_MAP.invocations;
  if (['modular-characters'].includes(k)) return CATEGORY_PRESETS_MAP.modular_characters;
  if (['planetary-design', 'world', 'universe', 'setting', 'philosophy', 'scene'].includes(k)) return CATEGORY_PRESETS_MAP.planetary_design;

  const label = safeConfig?.label || currentKey || 'Codex Entry';
  return [
    { label: `Standard ${label}`, prompt: `Canonical ${label} entry grounded in Tangent SFF RPG 2d10 Dual Resolution mechanics and lore.` },
    { label: `Frontier ${label}`, prompt: `Outer-rim frontier variant ${label} adapted for rugged survival, scarcity, and high-risk operations.` },
    { label: `High-Tech ${label}`, prompt: `Advanced TL-4 interstellar ${label} integrating cutting-edge science-fantasy engineering and tactical utility.` },
    { label: `Awakened ${label}`, prompt: `Metaphysically resonant ${label} shaped by psionic attunement or ancient precursor phenomena.` },
  ];
}

function findScenarioNode(nodes, targetId) {
  if (!Array.isArray(nodes) || !targetId) return null;
  for (const n of nodes) {
    if (n.id === targetId) return n;
    if (Array.isArray(n.children)) {
      const found = findScenarioNode(n.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Merged Context-Adaptive Selective Field Generator + Diff Preview
 * Consolidates DBM/Compendium (`BastionChatModal`) and StoryFoundry (`StoryFoundry/BastionDrawer`)
 * into the single unified BASTION drawer.
 */
export const BastionWorkspaceFieldGenerator = ({ mode = 'dbm', explicitSurface = null }) => {
  const { activeSurface, sessionState } = useBastion();
  const campaignContext = useCampaign() || {};
  const surface = explicitSurface || activeSurface || {};

  const isFoundryMode = mode === 'foundry' || surface.surfaceType === 'foundry';

  // Resolve StoryFoundry target node when in Foundry mode
  const universeState = campaignContext?.universeState || {};
  const activeScenarioId = surface.activeScenarioId || campaignContext?.activeScenarioId;
  const updateScenario = surface.updateScenario || campaignContext?.updateScenario || campaignContext?.updateStory;
  const activeNode = useMemo(() => {
    if (!isFoundryMode) return null;
    if (surface.activeNode) return surface.activeNode;
    return findScenarioNode(universeState?.scenarios, activeScenarioId);
  }, [isFoundryMode, surface.activeNode, universeState?.scenarios, activeScenarioId]);

  // Resolve DBM / Compendium schema when in DBM/Compendium mode
  const currentKey = surface.currentKey || surface.activeCategory || 'compendium';
  const safeConfig = surface.currentConfig || {};
  const safeFormData = surface.editFormData || {};

  const availableFields = useMemo(() => {
    if (isFoundryMode) {
      const base = [
        { key: 'title', label: 'Element Title' },
        { key: 'content', label: 'Narrative Content / Read-Aloud' },
      ];
      const schemaItems = activeNode?.type ? ELEMENT_SCHEMAS[activeNode.type] || [] : [];
      schemaItems.forEach((f) => {
        if (f?.key && !base.some((b) => b.key === f.key)) {
          base.push({ key: f.key, label: f.label || f.key });
        }
      });
      return base;
    }

    const schemaFields = safeConfig.fields
      ? Object.keys(safeConfig.fields).filter((fKey) => {
          const fieldDef = safeConfig.fields[fKey];
          if (!fieldDef) return false;
          if (fieldDef.manageable === false) return false;
          if (fieldDef.type === 'readonlytext') return false;
          if (fieldDef.aiEnabled === false) return false;
          if (NON_GENERATIVE_FIELDS.includes(fKey.toLowerCase())) return false;
          if (sessionState?.effectiveRole === 'operator' && fKey === 'note') return false;
          return true;
        })
      : [];

    const uniqueKeys = Array.from(new Set(['name', 'description', ...schemaFields])).filter(
      (fKey) => !NON_GENERATIVE_FIELDS.includes(fKey.toLowerCase())
    );
    return uniqueKeys.map((k) => ({
      key: k,
      label: safeConfig.fields?.[k]?.label || k,
    }));
  }, [isFoundryMode, activeNode?.type, safeConfig, sessionState?.effectiveRole]);

  const [selectedFields, setSelectedFields] = useState({});
  const [genPrompt, setGenPrompt] = useState('');
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [autoApplyMode, setAutoApplyMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState(null);
  const [pendingDiff, setPendingDiff] = useState(null);

  useEffect(() => {
    if (isFoundryMode) {
      setSelectedFields({ title: true, content: true });
    } else {
      setSelectedFields({ name: true, description: true });
    }
    setPendingDiff(null);
    setGenStatus(null);
  }, [isFoundryMode, currentKey, activeNode?.id]);

  const hasFieldContent = (key) => {
    if (isFoundryMode) {
      if (!activeNode) return false;
      if (key === 'title') return Boolean(activeNode.title && activeNode.title.trim());
      if (key === 'content') return Boolean(activeNode.content && activeNode.content.trim());
      return Boolean(activeNode.fields?.[key] && String(activeNode.fields[key]).trim());
    }
    const val = safeFormData[key];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return Boolean(val.trim());
    if (typeof val === 'number') return true;
    if (Array.isArray(val)) return val.length > 0;
    return Boolean(val);
  };

  const getCurrentFieldValue = (key) => {
    if (isFoundryMode) {
      if (!activeNode) return '';
      if (key === 'title') return activeNode.title || '';
      if (key === 'content') return activeNode.content || '';
      return activeNode.fields?.[key] ?? '';
    }
    return safeFormData[key] ?? '';
  };

  const toggleField = (key) => {
    setSelectedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    const next = {};
    availableFields.forEach((f) => {
      next[f.key] = true;
    });
    setSelectedFields(next);
  };

  const selectBlankOnly = () => {
    const next = {};
    availableFields.forEach((f) => {
      next[f.key] = !hasFieldContent(f.key);
    });
    setSelectedFields(next);
  };

  const clearAll = () => setSelectedFields({});

  const applyGeneratedPayload = (generatedMap) => {
    if (!generatedMap || Object.keys(generatedMap).length === 0) return;

    if (isFoundryMode) {
      if (!activeScenarioId || !activeNode || !updateScenario) {
        setGenStatus({ error: 'Select an active Story Foundry element in the scenario tree before applying.' });
        return;
      }
      const topLevelUpdates = {};
      const fieldsUpdates = {};
      Object.keys(generatedMap).forEach((key) => {
        if (['title', 'type', 'content'].includes(key)) {
          topLevelUpdates[key] = generatedMap[key];
        } else {
          fieldsUpdates[key] = generatedMap[key];
        }
      });
      const finalUpdates = { ...topLevelUpdates };
      if (Object.keys(fieldsUpdates).length > 0) {
        finalUpdates.fields = {
          ...(activeNode.fields || {}),
          ...fieldsUpdates,
        };
      }
      updateScenario(activeScenarioId, finalUpdates);
      setPendingDiff(null);
      setGenStatus({
        success: `Applied ${Object.keys(generatedMap).length} generated field(s) to "${activeNode.title || 'Story Element'}": [${Object.keys(generatedMap).join(', ')}].`,
      });
      return;
    }

    if (!surface.isEntryModalOpen && typeof surface.handleCreateNew === 'function') {
      surface.handleCreateNew();
    }
    if (typeof surface.setEditFormData === 'function') {
      surface.setEditFormData((prev) => ({
        ...(prev || {}),
        ...generatedMap,
      }));
      setPendingDiff(null);
      setGenStatus({
        success: `Applied ${Object.keys(generatedMap).length} generated field(s) to [${safeConfig.label || currentKey}]: [${Object.keys(generatedMap).join(', ')}].`,
      });
    } else {
      setGenStatus({
        error: 'Open an entry in Edit/Studio mode first so BASTION can populate its fields.',
      });
    }
  };

  const handleGenerate = async () => {
    let fieldsToGen = Object.keys(selectedFields).filter((k) => selectedFields[k]);
    if (fieldsToGen.length === 0) {
      setGenStatus({ error: 'Select at least one field to synthesize.' });
      return;
    }
    if (!genPrompt.trim()) {
      setGenStatus({ error: 'Enter a synthesis brief or click a preset chip first.' });
      return;
    }
    if (isFoundryMode && (!activeScenarioId || !activeNode)) {
      setGenStatus({ error: 'Select or create an element in Story Foundry Contents first.' });
      return;
    }

    if (!overwriteMode) {
      const emptyOnly = fieldsToGen.filter((k) => !hasFieldContent(k));
      if (emptyOnly.length === 0) {
        setGenStatus({
          error: 'All selected fields already contain content. Enable "Allow Overwrite" or click "+ Blank" to target empty fields.',
        });
        return;
      }
      fieldsToGen = emptyOnly;
    }

    setIsGenerating(true);
    setGenStatus(null);
    setPendingDiff(null);

    const currentValues = {};
    availableFields.forEach((f) => {
      currentValues[f.key] = getCurrentFieldValue(f.key);
    });

    const elementType = isFoundryMode
      ? activeNode?.type || 'Story Element'
      : safeConfig.label || currentKey || 'Database Entry';

    const result = await generateSelectiveFields({
      selectedFields: fieldsToGen,
      currentValues,
      userPrompt: genPrompt,
      elementType,
      campaignContext: {
        projectName: universeState?.projectName || 'Tangent Universe',
        activeNodeTitle: activeNode?.title || safeFormData?.name || '',
        techLevel: activeNode?.fields?.tl || safeFormData?.tl || 3,
        metaLevel: activeNode?.fields?.ml || safeFormData?.ml || 3,
      },
    });

    setIsGenerating(false);

    if (!result.success) {
      setGenStatus({ error: result.error || 'Selective field generation failed.' });
      return;
    }

    if (autoApplyMode) {
      applyGeneratedPayload(result.generated);
    } else {
      setPendingDiff(result.generated);
      setGenStatus({
        success: `Synthesized draft for [${Object.keys(result.generated).join(', ')}]. Review the non-destructive diff preview below and click Apply!`,
      });
    }
  };

  const presets = isFoundryMode
    ? FOUNDRY_PRESETS
    : getPresetsForCollection(currentKey, safeConfig);

  const targetTitle = isFoundryMode
    ? activeNode?.title || 'No Active Foundry Element Selected'
    : safeFormData?.name || surface.selectedItem?.name || `New ${safeConfig.label || currentKey} Entry`;

  const targetBadge = isFoundryMode
    ? activeNode?.type || 'Story Foundry'
    : safeConfig.label || currentKey;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#0d1117]/80">
      {/* Active Target Banner */}
      <div className="bg-slate-900/90 border border-cyan-900/50 rounded-lg p-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block">
            {isFoundryMode ? 'Story Foundry Element Target' : 'Omnicortex / DBM Studio Target'}
          </span>
          <span className="font-bold text-amber-300 text-xs truncate block">
            {targetTitle}
          </span>
        </div>
        <span className="text-[10px] bg-slate-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded font-mono shrink-0 uppercase">
          {targetBadge}
        </span>
      </div>

      {/* Non-Destructive Guardrails Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-200 font-bold uppercase block">Overwrite Guard</span>
            <span className="text-[9px] text-slate-400">
              {overwriteMode ? 'Replaces populated fields' : 'Fills blank fields only'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOverwriteMode((v) => !v)}
            className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase border cursor-pointer shrink-0 ${
              overwriteMode
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
            }`}
          >
            {overwriteMode ? '⚡ Overwrite' : '🛡️ Blank Only'}
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-200 font-bold uppercase block">Commit Mode</span>
            <span className="text-[9px] text-slate-400">
              {autoApplyMode ? 'Writes directly to form' : 'Diff preview before commit'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoApplyMode((v) => !v)}
            className={`px-2 py-1 rounded text-[9px] font-mono font-bold uppercase border cursor-pointer shrink-0 ${
              autoApplyMode
                ? 'bg-purple-950/90 text-purple-300 border-purple-500/60'
                : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60'
            }`}
          >
            {autoApplyMode ? '⚡ Direct Write' : '🔍 Diff Preview'}
          </button>
        </div>
      </div>

      {/* Field Checkboxes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800">
          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
            Target Schema Fields ({availableFields.length}):
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
            <button type="button" onClick={selectAll} className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer">
              + All
            </button>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={selectBlankOnly} className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
              + Blank
            </button>
            <span className="text-slate-600">|</span>
            <button type="button" onClick={clearAll} className="text-slate-400 hover:text-slate-200 underline cursor-pointer">
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
          {availableFields.map((f) => {
            const populated = hasFieldContent(f.key);
            return (
              <label
                key={f.key}
                className="flex items-center justify-between gap-1.5 p-1.5 rounded bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedFields[f.key])}
                    onChange={() => toggleField(f.key)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 shrink-0"
                  />
                  <span className="text-[11px] font-semibold text-slate-200 truncate">
                    {f.label}
                  </span>
                </div>
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    populated
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {populated ? 'Populated' : 'Blank'}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Category-Aware Presets */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
          Quick Synthesis Presets:
        </span>
        <div className="flex flex-wrap gap-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setGenPrompt(p.prompt)}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[10px] transition-colors cursor-pointer"
              title={p.prompt}
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-1">
        <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
          Synthesis Brief:
        </label>
        <textarea
          rows={3}
          value={genPrompt}
          onChange={(e) => setGenPrompt(e.target.value)}
          placeholder={
            sessionState?.isArchitect
              ? 'Describe the canonical entry, encounter parameters, TL/ML tier, or narrative hooks we are building...'
              : 'Describe your entry concept, gear specifications, or background details...'
          }
          className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 p-2.5 rounded text-xs outline-none font-sans"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold uppercase text-xs rounded tracking-widest transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Synthesizing Selected Fields...</span>
          </>
        ) : (
          <span>⚡ Synthesize Selected Workspace Fields</span>
        )}
      </button>

      {/* Non-Destructive Field Diff Preview Card */}
      {pendingDiff && Object.keys(pendingDiff).length > 0 && (
        <div className="bg-slate-950 border border-emerald-500/50 rounded-lg p-3 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-300">
              🔍 Non-Destructive Field Diff Preview ({Object.keys(pendingDiff).length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPendingDiff(null)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono uppercase cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => applyGeneratedPayload(pendingDiff)}
                className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] uppercase cursor-pointer shadow-sm"
              >
                ✅ Apply All
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {Object.entries(pendingDiff).map(([fieldKey, nextVal]) => {
              const prevVal = getCurrentFieldValue(fieldKey);
              return (
                <div key={fieldKey} className="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
                      {fieldKey}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        applyGeneratedPayload({ [fieldKey]: nextVal });
                        setPendingDiff((prev) => {
                          if (!prev) return null;
                          const copy = { ...prev };
                          delete copy[fieldKey];
                          return Object.keys(copy).length > 0 ? copy : null;
                        });
                      }}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 cursor-pointer"
                    >
                      Apply Field
                    </button>
                  </div>
                  {Boolean(prevVal && String(prevVal).trim()) && (
                    <div className="text-[10px] text-rose-300/80 bg-rose-950/30 border border-rose-900/40 rounded px-2 py-1 line-clamp-2 font-sans">
                      <span className="font-mono font-bold mr-1">- Current:</span>
                      {typeof prevVal === 'object' ? JSON.stringify(prevVal) : String(prevVal)}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-200 bg-emerald-950/25 border border-emerald-900/40 rounded px-2 py-1 whitespace-pre-wrap font-sans">
                    <span className="font-mono font-bold text-emerald-400 mr-1">+ Proposed:</span>
                    {typeof nextVal === 'object' ? JSON.stringify(nextVal, null, 2) : String(nextVal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {genStatus && (
        <div
          className={`p-2.5 rounded border text-xs leading-relaxed ${
            genStatus.error
              ? 'bg-red-950/60 border-red-800 text-red-300'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          }`}
        >
          {genStatus.error || genStatus.success}
        </div>
      )}
    </div>
  );
};

export default BastionWorkspaceFieldGenerator;
