/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CODEX SUBJECT-RELATIVE SYNTHESIZER PROFILES
 * Dynamic, category-aware synthesis configurations, concept archetypes,
 * domain parameters, and directive presets for CodexAiSynthesizerModal & BASTION.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const CODEX_SYNTHESIZER_PROFILES = {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SPECIES MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  species: {
    id: 'species',
    synthesizerSubtitle: 'Synthesize lineage biology, chassis & CP package',
    conceptSectionLabel: '1. Lineage & Evolutionary Concept Style',
    nameField: {
      label: 'Species / Lineage Designation',
      placeholder: 'E.g., Vesperian Void-Stalkers, Dar, Gen-E Vanguard...'
    },
    parametersSectionLabel: '2. Biological & Genetic Chassis Parameters',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      {
        key: 'species_type',
        label: 'Chassis Type',
        type: 'select',
        defaultValue: 'Humanoid',
        options: ['Humanoid', 'Synthetic', 'Beast', 'Fey', 'Aberration', 'Dragon', 'Elemental', 'Entity', 'Planar', 'Verdant', 'Mythical', 'Ooze', 'Undead']
      },
      {
        key: 'size',
        label: 'Size Category',
        type: 'select',
        defaultValue: 'Medium',
        options: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']
      },
      {
        key: 'parent_species',
        label: 'Parent Lineage / Taxon',
        type: 'select',
        defaultValue: 'Independent Xenotypes',
        options: [
          'Independent Xenotypes',
          'Humans (Core & Variants)',
          'Engineered Humans (Gen-E)',
          'Aeld',
          'Asi (Fey Lineages)',
          'Aulurans',
          'Kitin',
          'Synthetics',
          "Sha'nor & Void Lineages",
          'Progenitors'
        ]
      },
      {
        key: 'stigma',
        label: 'Social Stigma',
        type: 'select',
        defaultValue: 'None',
        options: ['None', 'Minor (-1)', 'Xeno (-2)', 'Synthetic (-2)', 'Mutant (-2)', 'Severe Outcast (-4)']
      }
    ],
    concepts: [
      {
        id: 'apex_xeno',
        label: 'Apex Xeno Predator',
        badge: 'Humanoid • Agile/Lethal',
        suggestedName: 'Kaelen Shadow-Stalker',
        prompt: 'Evolved arboreal or nocturnal hunter lineage with heightened thermal/low-light senses, natural weapons, prehensile agility, and predatory instincts.',
        presetParams: { species_type: 'Humanoid', size: 'Medium', parent_species: 'Aulurans', stigma: 'Xeno (-2)', tl: 3, ml: 1 },
        presetModules: ['morph_apex_predator', 'gen_darwinian_wild', 'role_ambush_stalker'],
        suggestedTraits: ['trait-low-light-vision', 'trait-natural-weapons', 'trait-silent-hunter', 'trait-quick', 'trait-digitigrade-ungulated', 'trait-scent']
      },
      {
        id: 'gen_e_variant',
        label: 'Gen-E Heavy-G Vanguard',
        badge: 'Gen-E • Transhuman',
        suggestedName: 'Gen-E Heavy Gravity Laborer',
        prompt: 'Purpose-bred genetic human subspecies engineered for extreme planetary biomes, high-G mining, void adaptation, or tactical reflexes.',
        presetParams: { species_type: 'Humanoid', size: 'Medium', parent_species: 'Humans (Gen-E)', stigma: 'Mutant (-2)', tl: 4, ml: 0 },
        presetModules: ['morph_apex_predator', 'gen_bio_engineered', 'gen_high_g_deathworld', 'role_siege_juggernaut'],
        suggestedTraits: ['trait-enhanced-strength', 'trait-dual-skeletal-structure', 'trait-hardy', 'trait-fatigue-resistance', 'trait-physical-fitness', 'trait-stable-footed']
      },
      {
        id: 'synthetic_chassis',
        label: 'Sentient Synthetic Frame',
        badge: 'Synthetic • 60 SP Chassis',
        suggestedName: 'Mekan Autonomous Sovereign',
        prompt: 'Self-aware cybernetic or android construct operating on Structure Points (SP) with vacuum immunity, modular hardpoints, and neural logic cores.',
        presetParams: { species_type: 'Synthetic', size: 'Medium', parent_species: 'Synthetics (Artificial Lifeforms)', stigma: 'Synthetic (-2)', tl: 4, ml: 0 },
        presetModules: ['morph_synthetic_frame', 'gen_foundry_assembled', 'role_cyber_artificer'],
        suggestedTraits: ['trait-synthetic-base-traits', 'trait-non-living', 'trait-synthetic-armor-options', 'trait-synthetic-weapon-options', 'trait-synthetic-aux-core', 'trait-sleepless']
      },
      {
        id: 'psionic_lineage',
        label: 'Psionic / Aeld Void-Seer',
        badge: 'Awakened • High ML',
        suggestedName: 'Alterian Void-Seer',
        prompt: 'Ancient psychic or fey-touched bloodline attuned to dimensional leylines, innate telepathy, and high Meta Level resonance.',
        presetParams: { species_type: 'Humanoid', size: 'Medium', parent_species: 'Aeld (Elven Bloodlines)', stigma: 'None', tl: 4, ml: 3 },
        presetModules: ['gen_ancient_precursor', 'gen_leyline_awakened', 'role_telepathic_seer'],
        suggestedTraits: ['trait-aeld-lineage-traits', 'trait-awakened-psychic', 'trait-mind-speech', 'trait-psionic-gating', 'trait-sense-psychic', 'trait-longevity']
      },
      {
        id: 'chitinous_hive',
        label: 'Chitinous Exoskeletal Caste',
        badge: 'Kitin • Natural Armor',
        suggestedName: 'Kitin Carapace Warden',
        prompt: 'Insectoid or arthropoid species possessing natural chitinous Damage Reduction, compound optics, pheromone communication, and extra limbs.',
        presetParams: { species_type: 'Humanoid', size: 'Medium', parent_species: 'Kitin (Genomatrix Collective)', stigma: 'Xeno (-2)', tl: 3, ml: 0 },
        presetModules: ['morph_chitinous', 'gen_subterranean_abyssal', 'role_hive_collective'],
        suggestedTraits: ['trait-kitin-base-traits', 'trait-exoskeleton-light', 'trait-chitinous-shell-armor', 'trait-additional-limbs', 'trait-hive-link', 'trait-dark-sight']
      },
      {
        id: 'exotic_entity',
        label: 'Silicon / Energy Entity',
        badge: 'Entity • Exotic Biology',
        suggestedName: 'Lux-Crystalline Resonator',
        prompt: 'Non-carbon crystalline, plasma, or void-born sentient lifeform that metabolizes ambient energy and communicates via harmonic light pulses.',
        presetParams: { species_type: 'Entity', size: 'Medium', parent_species: 'Independent Xenotypes', stigma: 'Xeno (-2)', tl: 4, ml: 2 },
        presetModules: ['morph_crystalline_lithic', 'morph_void_entity', 'gen_zero_g_void'],
        suggestedTraits: ['trait-ether-sight', 'trait-semi-corporeal', 'trait-energy-absorption', 'trait-energy-resist', 'trait-non-living', 'trait-autotroph']
      },
      {
        id: 'pelagic_abyssal',
        label: 'Pelagic Abyssal Stalker',
        badge: 'Aquatic • Deep-Trench',
        suggestedName: 'Vortex Trench Leviathan-Kin',
        prompt: 'Amphibious deep-ocean lineage adapted to crushing pelagic pressure, bioluminescent signaling, electro-receptive blindsense, and hydrodynamic ambush.',
        presetParams: { species_type: 'Humanoid', size: 'Medium', parent_species: 'Independent Xenotypes', stigma: 'Minor (-1)', tl: 3, ml: 0 },
        presetModules: ['morph_aquatic_pelagic', 'gen_subterranean_abyssal', 'role_ambush_stalker'],
        suggestedTraits: ['trait-amphibious', 'trait-aquatic', 'trait-aquatic-strength', 'trait-water-sense', 'trait-blind-sense-em-vibration', 'trait-dark-sight']
      },
      {
        id: 'fey_shifter',
        label: 'Asi Fey Wildling / Shifter',
        badge: 'Fey • Metamorphic',
        suggestedName: 'Whisper Canopy-Shifter',
        prompt: 'Capricious fey-blooded shapeshifter with mutable cellular anatomy, arboreal grace, natural glamour, and dimensional nature attunement.',
        presetParams: { species_type: 'Fey', size: 'Medium', parent_species: 'Asi (Fey Lineages)', stigma: 'Minor (-1)', tl: 3, ml: 2 },
        presetModules: ['morph_fey_metamorphic', 'morph_avian_arboreal', 'gen_leyline_awakened', 'role_diplomatic_envoy'],
        suggestedTraits: ['trait-asi-base-traits', 'trait-alter-form-adv', 'trait-alternate-form', 'trait-awakened-nature', 'trait-climber', 'trait-chameleon']
      },
      {
        id: 'draconic_wyrm',
        label: 'Draconic Star-Wyrm',
        badge: 'Dragon • Scaled/Breath',
        suggestedName: 'Sovereign Draconis Scion',
        prompt: 'Regal draconic lineage bearing hardened dermal scales, thermal vision, winged propulsion, and an elemental breath weapon.',
        presetParams: { species_type: 'Dragon', size: 'Large', parent_species: 'Aeld (Elven Bloodlines)', stigma: 'Minor (-1)', tl: 3, ml: 2 },
        presetModules: ['morph_draconic_scaled', 'gen_ancient_precursor', 'role_siege_juggernaut'],
        suggestedTraits: ['trait-draconic', 'trait-dragonkin-traits', 'trait-dragon-breath', 'trait-dragon-wings', 'trait-natural-armor', 'trait-thermal-sight']
      },
      {
        id: 'verdant_symbiote',
        label: 'Verdant Mycelial Symbiote',
        badge: 'Verdant • Regenerative',
        suggestedName: 'Myco-Flora Collective Host',
        prompt: 'Photosynthetic botanical or fungal-mycelial lineage capable of cellular regeneration, biochemical spore synthesis, and ecological communion.',
        presetParams: { species_type: 'Verdant', size: 'Medium', parent_species: 'Independent Xenotypes', stigma: 'Xeno (-2)', tl: 3, ml: 1 },
        presetModules: ['morph_verdant_mycelial', 'gen_darwinian_wild', 'role_venom_predator'],
        suggestedTraits: ['trait-chloroplast', 'trait-autotroph', 'trait-fast-heal', 'trait-regeneration', 'trait-treespeech', 'trait-pheromonal-synthesis']
      }
    ],
    conceptAxes: [
      {
        id: 'morphology',
        label: 'A. Morphology & Structural Form',
        shortLabel: 'Morphology',
        description: 'Select one or more anatomical and biological form factors to blend into your species chassis.',
        modules: [
          {
            id: 'morph_apex_predator',
            label: 'Apex Predatory Bipedal',
            badge: 'Predatory • Claws/Senses',
            suggestedName: 'Kaelen Shadow-Stalker',
            prompt: 'Evolved digitigrade hunter morphology with retractable claws/fangs, fast-twitch muscle fibers, and heightened nocturnal/thermal optics.',
            presetParams: { species_type: 'Humanoid', parent_species: 'Aulurans', stigma: 'Xeno (-2)' },
            suggestedTraits: ['trait-low-light-vision', 'trait-natural-weapons', 'trait-digitigrade-ungulated', 'trait-silent-hunter', 'trait-quick', 'trait-scent', 'trait-stalker', 'trait-frenzy']
          },
          {
            id: 'morph_chitinous',
            label: 'Chitinous / Arthropoid',
            badge: 'Kitin • Exoskeleton',
            suggestedName: 'Kitin Carapace Warden',
            prompt: 'Insectoid or arthropoid anatomy featuring segmented chitinous plating, compound optics, pheromone receptors, and multi-limbed dexterity.',
            presetParams: { species_type: 'Humanoid', parent_species: 'Kitin', stigma: 'Xeno (-2)' },
            suggestedTraits: ['trait-exoskeleton-light', 'trait-chitinous-shell-armor', 'trait-additional-limbs', 'trait-pheromonal-synthesis', 'trait-dark-sight', 'trait-climber', 'trait-kitin-base-traits', 'trait-exoskeleton-heavy']
          },
          {
            id: 'morph_avian_arboreal',
            label: 'Avian / Winged / Arboreal',
            badge: 'Flight • Canopy',
            suggestedName: 'Vesperian Sky-Raptor',
            prompt: 'Avian or canopy-brachiating physiology with hollow pneumatic bones, patagia membranes or wings, prehensile tail/talons, and keen aerial sight.',
            presetParams: { species_type: 'Humanoid', parent_species: 'Independent Xenotypes' },
            suggestedTraits: ['trait-flight', 'trait-limited-flight', 'trait-patagia', 'trait-prehensile-tail', 'trait-climber', 'trait-acute-senses', 'trait-leaper', 'trait-low-light-vision']
          },
          {
            id: 'morph_aquatic_pelagic',
            label: 'Aquatic / Amphibious',
            badge: 'Pelagic • Hydrodynamic',
            suggestedName: 'Nereid Abyssal Diver',
            prompt: 'Amphibious or pelagic biology with dual-respiration gills, webbed propulsion, deep-trench pressure adaptation, and electro-receptive water-sense.',
            presetParams: { species_type: 'Humanoid', parent_species: 'Independent Xenotypes' },
            suggestedTraits: ['trait-amphibious', 'trait-aquatic', 'trait-aquatic-strength', 'trait-water-sense', 'trait-blind-sense-em-vibration', 'trait-adapted', 'trait-dark-sight']
          },
          {
            id: 'morph_draconic_scaled',
            label: 'Draconic / Reptilian',
            badge: 'Scaled • Thermal/Breath',
            suggestedName: 'Draconian Wyrm-Blood',
            prompt: 'Scaled reptilian or draconic anatomy with dense osteoderm plating, thermal pit organs, draconic might, and elemental breath or venom glands.',
            presetParams: { species_type: 'Dragon', parent_species: 'Aeld', stigma: 'Minor (-1)' },
            suggestedTraits: ['trait-draconic', 'trait-dragonkin-traits', 'trait-natural-armor', 'trait-dragon-eyes', 'trait-dragon-breath', 'trait-thermal-sight', 'trait-dragon-wings', 'trait-dragon-might']
          },
          {
            id: 'morph_fey_metamorphic',
            label: 'Fey / Shapeshifter',
            badge: 'Metamorphic • Asi',
            suggestedName: 'Whisper Morph-Stalker',
            prompt: 'Mutable cellular or fey-touched morphology capable of dermal camouflage, form-shifting mimicry, glamour resonance, and ageless vitality.',
            presetParams: { species_type: 'Fey', parent_species: 'Asi (Fey Lineages)', stigma: 'Minor (-1)' },
            suggestedTraits: ['trait-asi-base-traits', 'trait-alter-form-basic', 'trait-alter-form-adv', 'trait-alternate-form', 'trait-chameleon', 'trait-mimetic-form', 'trait-bodyform-adaptation', 'trait-ageless']
          },
          {
            id: 'morph_synthetic_frame',
            label: 'Synthetic / Android Frame',
            badge: 'Synthetic • 60 SP Chassis',
            suggestedName: 'Mekan Autonomous Sovereign',
            prompt: 'Self-aware mechanical or bio-synthetic construct operating on 60 Structure Points (SP) with vacuum immunity, integrated weapon/armor mounts, and auxiliary logic cores.',
            presetParams: { species_type: 'Synthetic', parent_species: 'Synthetics', stigma: 'Synthetic (-2)', tl: 4 },
            suggestedTraits: ['trait-synthetic-base-traits', 'trait-non-living', 'trait-synthetic-armor-options', 'trait-synthetic-weapon-options', 'trait-synthetic-aux-core', 'trait-synthetic-tech-assim', 'trait-sleepless', 'trait-synaptic-integration']
          },
          {
            id: 'morph_crystalline_lithic',
            label: 'Crystalline / Silicon Matrix',
            badge: 'Lithic • High DR',
            suggestedName: 'Lith-Crag Resonator',
            prompt: 'Non-carbon silicon or mineral-lattice anatomy that refracts directed energy, shrugs off biological toxins, and provides high inherent Damage Reduction.',
            presetParams: { species_type: 'Elemental', parent_species: 'Independent Xenotypes', stigma: 'Xeno (-2)' },
            suggestedTraits: ['trait-natural-armor', 'trait-dual-skeletal-structure', 'trait-energy-resist', 'trait-autotroph', 'trait-poison-immunity', 'trait-hardy', 'trait-stable-footed', 'trait-energy-absorption']
          },
          {
            id: 'morph_void_entity',
            label: 'Plasmoid / Energy Entity',
            badge: 'Entity • Phase/Aether',
            suggestedName: 'Lux-Aether Anomaly',
            prompt: 'Semi-corporeal plasma, quantum-phased, or void-born entity that metabolizes ambient energy and communicates via harmonic electromagnetic pulses.',
            presetParams: { species_type: 'Entity', parent_species: "Sha'nor & Void Lineages", stigma: 'Xeno (-2)', tl: 4, ml: 2 },
            suggestedTraits: ['trait-ether-sight', 'trait-semi-corporeal', 'trait-energy-absorption', 'trait-non-living', 'trait-awakened-void', 'trait-reduced-sustenance', 'trait-energy-immunity', 'trait-blind-sight']
          },
          {
            id: 'morph_verdant_mycelial',
            label: 'Verdant / Mycelial Symbiote',
            badge: 'Verdant • Botanical',
            suggestedName: 'Sylvan Spore-Weaver',
            prompt: 'Photosynthetic botanical or fungal-mycelial colony organism with rapid cellular regeneration, biochemical spore synthesis, and flora communion.',
            presetParams: { species_type: 'Verdant', parent_species: 'Independent Xenotypes', stigma: 'Xeno (-2)' },
            suggestedTraits: ['trait-chloroplast', 'trait-autotroph', 'trait-fast-heal', 'trait-regeneration', 'trait-treespeech', 'trait-poison-immunity', 'trait-pheromonal-synthesis', 'trait-venom']
          }
        ]
      },
      {
        id: 'genesis',
        label: 'B. Evolutionary Genesis & Biome Pressure',
        shortLabel: 'Genesis & Biome',
        description: 'Select the evolutionary crucible, planetary environment, or artificial origin that shaped this lineage.',
        modules: [
          {
            id: 'gen_darwinian_wild',
            label: 'Darwinian Wild Biosphere',
            badge: 'Natural Selection',
            prompt: 'Forged through fierce natural predator-prey competition in an untamed planetary ecosystem.',
            presetParams: { tl: 3 },
            suggestedTraits: ['trait-adapted', 'trait-bonded-terrain', 'trait-hardy', 'trait-scent', 'trait-runner', 'trait-natural-armor']
          },
          {
            id: 'gen_bio_engineered',
            label: 'Gen-E Bio-Engineered',
            badge: 'Gen-E • Transhuman',
            suggestedName: 'Gen-E Vanguard Strain',
            prompt: 'Purpose-bred genetic subspecies engineered in corporate or imperial gene-foundries for specialized environments, labor, or tactical reflexes.',
            presetParams: { parent_species: 'Engineered Humans (Gen-E)', stigma: 'Mutant (-2)', tl: 4 },
            suggestedTraits: ['trait-physical-fitness', 'trait-combat-training', 'trait-fatigue-resistance', 'trait-enhanced-biotechnology', 'trait-focused-study', 'trait-quick-reactions']
          },
          {
            id: 'gen_ancient_precursor',
            label: 'Ancient Aeld / Precursor',
            badge: 'Elder Bloodline',
            suggestedName: 'Alterian High-Born',
            prompt: 'Descended from ancient star-faring Progenitors or Aeld houses carrying ancestral genetic memory and multi-century longevity.',
            presetParams: { parent_species: 'Aeld', tl: 4, ml: 2 },
            suggestedTraits: ['trait-aeld-lineage-traits', 'trait-progenitor-heritage-base', 'trait-longevity', 'trait-genetic-memory', 'trait-shards-of-the-past', 'trait-ageless']
          },
          {
            id: 'gen_leyline_awakened',
            label: 'Leyline / Rift Awakened',
            badge: 'Awakened • High ML',
            suggestedName: 'Vajar Rift-Channeler',
            prompt: 'Evolved or mutated near dimensional leylines and aetheric rifts, granting innate metaphysical attunement and high Meta Level resonance.',
            presetParams: { ml: 3 },
            suggestedTraits: ['trait-awakened-psychic', 'trait-awakened-arcane', 'trait-awakened-cosmic', 'trait-sense-psychic', 'trait-ether-sight', 'trait-psionic-gating']
          },
          {
            id: 'gen_high_g_deathworld',
            label: 'High-G / Death-World',
            badge: 'Heavy-G • Hardy',
            suggestedName: 'Krag-Basin Juggernaut',
            prompt: 'Hardened by crushing planetary gravity, toxic storms, and radiation belts—yielding dense dual-skeletal structure and unmatched fortitude.',
            presetParams: { size: 'Medium' },
            suggestedTraits: ['trait-enhanced-strength', 'trait-dual-skeletal-structure', 'trait-radiation-advantage', 'trait-hardy', 'trait-stable-footed', 'trait-poison-immunity', 'trait-healthy']
          },
          {
            id: 'gen_zero_g_void',
            label: 'Zero-G / Deep-Void Born',
            badge: 'Microgravity • Void',
            suggestedName: 'Void-Born Belter Strain',
            prompt: 'Adapted over generations to microgravity stations, asteroid tunnels, and deep-space arks with G-force immunity and four-handed dexterity.',
            presetParams: { tl: 4 },
            suggestedTraits: ['trait-g-force-immunity', 'trait-prehensile-limbs', 'trait-reduced-sustenance', 'trait-radiation-advantage', 'trait-torpor-universal', 'trait-nimble-appendages']
          },
          {
            id: 'gen_subterranean_abyssal',
            label: 'Subterranean / Lightless Abyss',
            badge: 'Cave / Trench',
            suggestedName: 'Under-Trench Delver',
            prompt: 'Evolved in sunless subterranean caverns, hollow moons, or abyssal ocean trenches using echolocation, tremorsense, and dark-sight.',
            presetParams: {},
            suggestedTraits: ['trait-cave-dweller', 'trait-dark-sight', 'trait-blind-sense', 'trait-uncanny-senses-vibration', 'trait-shadow-affinity', 'trait-blind-sight']
          },
          {
            id: 'gen_foundry_assembled',
            label: 'Orbital Foundry / Vat-Cloned',
            badge: 'Manufactured',
            suggestedName: 'Prime-Vat Legionnaire',
            prompt: 'Assembled in automated orbital shipyards, cloning vats, or cybernetic matrices with standardized neural uplinks and zero biological senescence.',
            presetParams: { tl: 4 },
            suggestedTraits: ['trait-biological-continuity', 'trait-synaptic-integration', 'trait-sleepless', 'trait-integrated', 'trait-combat-training']
          }
        ]
      },
      {
        id: 'role',
        label: 'C. Ecological, Cultural & Tactical Niche',
        shortLabel: 'Tactical & Social Role',
        description: 'Select the behavioral adaptations, societal ethos, and combat/utility specializations of this species.',
        modules: [
          {
            id: 'role_ambush_stalker',
            label: 'Nocturnal Ambush Stalker',
            badge: 'Stealth • Recon',
            prompt: 'Apex ambush specialist utilizing active optical camouflage, shadow blending, silent movement, and lethal alpha strikes.',
            suggestedTraits: ['trait-camouflage', 'trait-active-camouflage', 'trait-shadow-blending', 'trait-silent-hunter', 'trait-stalker', 'trait-sneaky', 'trait-obfuscate']
          },
          {
            id: 'role_siege_juggernaut',
            label: 'Frontline Siege Juggernaut',
            badge: 'Vanguard • Tank',
            prompt: 'Heavy shock-trooper built to absorb punishment with thick natural armor, powerful charges, extended reach, and relentless durability.',
            suggestedTraits: ['trait-natural-armor', 'trait-exoskeleton-heavy', 'trait-powerful-charge', 'trait-relentless', 'trait-brutal', 'trait-mighty-surge', 'trait-reach']
          },
          {
            id: 'role_telepathic_seer',
            label: 'Telepathic Seer & Mystic',
            badge: 'Psionic • Mind-Link',
            prompt: 'Cognitive and psionic specialist who communicates via mind-speech, detects psychic signatures, and fortifies the mind against intrusion.',
            suggestedTraits: ['trait-mind-speech', 'trait-telepathic', 'trait-awakened-psychic', 'trait-psionic-gating', 'trait-dragon-mind', 'trait-sense-psychic', 'trait-awakened-mental']
          },
          {
            id: 'role_hive_collective',
            label: 'Eusocial Hive Collective',
            badge: 'Swarm • Hive-Link',
            prompt: 'Interconnected eusocial caste sharing telepathic hive-links, swarm positioning, collective memory, and structural resin synthesis.',
            suggestedTraits: ['trait-hive-link', 'trait-hive-connection', 'trait-hive-link-minor', 'trait-adaptive-aspects', 'trait-swarming', 'trait-resin-secretion', 'trait-honey-paper-manufacture']
          },
          {
            id: 'role_frontier_pathfinder',
            label: 'Frontier Scout & Outrider',
            badge: 'Mobility • Survival',
            prompt: 'High-speed outrider and wilderness survivor with rapid reflexes, bounding leaps, and multi-biome adaptability.',
            suggestedTraits: ['trait-quick', 'trait-quick-reactions', 'trait-runner', 'trait-leaper', 'trait-quadruped', 'trait-adapted', 'trait-defensive-training']
          },
          {
            id: 'role_diplomatic_envoy',
            label: 'Diplomatic & Empathic Envoy',
            badge: 'Social • Influence',
            prompt: 'Culturally agile negotiator, trader, or pheromonal empath skilled in diplomacy, linguistics, and high-society intrigue.',
            suggestedTraits: ['trait-charismatic', 'trait-silver-tongued', 'trait-emissary', 'trait-gifted-linguist', 'trait-negotiation', 'trait-sociable', 'trait-networking']
          },
          {
            id: 'role_cyber_artificer',
            label: 'Techno-Savant & Artificer',
            badge: 'Technical • Interface',
            prompt: 'Natural engineer and cyber-integrator who interfaces directly with machinery, biotech, and multi-limbed fabrication rigs.',
            suggestedTraits: ['trait-master-tinker', 'trait-craftsman', 'trait-synaptic-integration', 'trait-multidextrous-4-arms', 'trait-enhanced-biotechnology', 'trait-focused-study', 'trait-synthetic-tech-assim']
          },
          {
            id: 'role_venom_predator',
            label: 'Bio-Hazard & Venom Hunter',
            badge: 'Toxin • Grapple',
            prompt: 'Biochemical hunter employing neurotoxic bites, ranged venom spit, toxic blood defenses, or crushing constriction.',
            suggestedTraits: ['trait-venom', 'trait-venom-spit', 'trait-venomous-saliva', 'trait-toxic-blood', 'trait-constriction', 'trait-poison-immunity', 'trait-weaver']
          }
        ]
      }
    ],
    directivesLabel: '3. Biological, Cultural & Cortex Trait Directives (Optional)',
    directivesPlaceholder: 'E.g., Emphasize high-gravity bone density (+1 Stamina), select canonical Cortex Species Traits above, target 20-25 CP package balance, and include 5-Pillar recommendations...',
    directiveCategories: [
      {
        id: 'cp_math',
        label: 'CP & Package Math',
        directives: [
          'Balanced 20-25 CP Standard Lineage',
          'Lean 10-15 CP Frontier Lineage',
          'Apex 25-30 CP High-Powered Lineage',
          'Offset CP Cost with Stigma & Flaws',
          'Full 5-Pillar Recommendations'
        ]
      },
      {
        id: 'attributes_skills',
        label: 'Attributes & Skills',
        directives: [
          '+1 AGI / +1 WIS Predator Split',
          '+2 STR / +1 STA Heavy-G Frame',
          '+2 INT / +1 WIS Cognitive Savant',
          '+2 CHA / +1 WIS Diplomatic Envoy',
          '+5 SP Bonus Skill Pool (1 Bundle)',
          'Inherent Stealth & Perception (+2)'
        ]
      },
      {
        id: 'physiology_lore',
        label: 'Physiology, Movement & Lore',
        directives: [
          'Multi-Mode Locomotion (Climb/Swim/Fly)',
          '60 SP Synthetic Construct Rules',
          'Zero-G & Vacuum Acclimated',
          'Bioluminescent / Pheromone Signaling',
          'Ectothermic / Specialized Metabolism',
          'Caste / Hive Social Hierarchy',
          'Relic Precursor DNA & Longevity'
        ]
      }
    ],
    quickDirectives: [
      'Balanced 20-25 CP Standard Lineage',
      '+1 AGI / +1 WIS Predator Split',
      '+2 STR / +1 STA Heavy-G Frame',
      '+2 INT / +1 WIS Cognitive Savant',
      '+5 SP Bonus Skill Pool (1 Bundle)',
      'Multi-Mode Locomotion (Climb/Swim/Fly)',
      '60 SP Synthetic Construct Rules',
      'Zero-G & Vacuum Acclimated',
      'Offset CP Cost with Stigma & Flaws',
      'Full 5-Pillar Recommendations'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FACTIONS MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  factions: {
    id: 'factions',
    synthesizerSubtitle: 'Synthesize polity lore, 20-pt skills & HIFI CHROMA',
    conceptSectionLabel: '1. Sociopolitical & Faction Paradigm',
    nameField: {
      label: 'Faction / Polity Designation',
      placeholder: 'E.g., Coalition of Independent Worlds, Obsidian Syndicate...'
    },
    parametersSectionLabel: '2. Geopolitical, Economic & Governance Parameters',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      {
        key: 'faction_type',
        label: 'Faction Classification',
        type: 'select',
        defaultValue: 'Major Polity',
        options: [
          'Major Galactic Power',
          'Major Polity',
          'Minor Polity',
          'Corporate Syndicate',
          'Sovereign Clan / Kingdom',
          'Independent / Frontier',
          'Religious / Cult Splinter',
          'Criminal Syndicate / Cartel',
          'Planetary Government'
        ]
      },
      {
        key: 'government_type',
        label: 'Governance Model',
        type: 'select',
        defaultValue: 'Corporate Oligarchy',
        options: [
          'Corporate Oligarchy',
          'Kleptocratic Republic',
          'Feudal Technocracy / Monarchy',
          'Theocratic Hegemony',
          'Nomadic Clan Federation',
          'Military Directorate / Junta',
          'Synthetic Collective',
          'Shadow Syndicate Cartel',
          'Democratic Colonial Alliance'
        ]
      },
      {
        key: 'wealth_modifier',
        label: 'Economic Wealth Modifier',
        type: 'select',
        defaultValue: '0 (Standard Baseline)',
        options: [
          '-2 (Embargoed / Resource Starved)',
          '-1 (Developing Frontier Economy)',
          '0 (Standard Baseline)',
          '+1 (Prosperous Trade Hub)',
          '+2 (Old Money / Megacorp)',
          '+3 (Post-Scarcity Core Power)'
        ]
      }
    ],
    concepts: [
      {
        id: 'frontier_industrial',
        label: 'Frontier Industrialists',
        badge: 'Independent • Used Future',
        suggestedName: 'Outer Rim Mining Confederacy',
        prompt: 'Hardened border systems tamed by heavy industrial rigs, siege-haulers, and stubborn colonists; gritty dieselpunk aesthetic with corporate robber-barons.',
        presetParams: { faction_type: 'Independent / Frontier', government_type: 'Kleptocratic Republic', wealth_modifier: '0 (Standard Baseline)', tl: 3, ml: 0 },
        suggestedTraits: ['trait-independent-grit', 'trait-federal-authority-marshal', 'trait-industrial-connections', 'trait-penal-recruit-ranger', 'trait-rugged-survival', 'trait-scavenger-instinct']
      },
      {
        id: 'cyberocracy_megacorp',
        label: 'High-Tech Cyberocracy',
        badge: 'Corporate Syndicate • TL 4',
        suggestedName: 'Aegis-Veritas Consortium',
        prompt: 'Hyper-connected corporate syndicate governing through AR data meshes, algorithmic law, transhumanist bioware, and covert black-ops strike teams.',
        presetParams: { faction_type: 'Corporate Syndicate', government_type: 'Corporate Oligarchy', wealth_modifier: '+2 (Old Money / Megacorp)', tl: 4, ml: 1 },
        suggestedTraits: ['trait-industrial-connections', 'trait-machine-logic', 'trait-reinforced-chassis', 'trait-shadowmeld', 'trait-zero-g-veteran']
      },
      {
        id: 'feudal_dynasty',
        label: 'Feudal Space Monarchy',
        badge: 'Sovereign Kingdom • Chivalric',
        suggestedName: 'House Valerius Star-Dynasty',
        prompt: 'Aristocratic star-nobility governed by knightly orders, honor duels, mastercrafted vibro-armaments, and flying citadel dreadnoughts.',
        presetParams: { faction_type: 'Sovereign Clan / Kingdom', government_type: 'Feudal Technocracy / Monarchy', wealth_modifier: '+2 (Old Money / Megacorp)', tl: 4, ml: 1 },
        suggestedTraits: ['trait-high-imperial-status', 'trait-imperial-discipline', 'trait-incorruptible-will', 'trait-solar-aura']
      },
      {
        id: 'theocratic_hegemony',
        label: 'Theocratic Solar Hegemony',
        badge: 'Major Power • Zealous',
        suggestedName: 'Order of the Radiant Corona',
        prompt: 'Zealous interstellar theocracy enforcing doctrinal purity through inquisitorial arbiters, plasma cathedral ships, and sacred solar relics.',
        presetParams: { faction_type: 'Major Galactic Power', government_type: 'Theocratic Hegemony', wealth_modifier: '+1 (Prosperous Trade Hub)', tl: 3, ml: 2 },
        suggestedTraits: ['trait-solar-aura', 'trait-incorruptible-will', 'trait-imperial-discipline', 'trait-awakened-mind', 'trait-deep-attunement']
      },
      {
        id: 'nomadic_fleet',
        label: 'Nomadic Void-Ark Clans',
        badge: 'Clan Fleet • Void-Born',
        suggestedName: 'Seventh Horizon Migrant Flotilla',
        prompt: 'Self-sustaining generation-ship armada bound by clan honor, deep-space salvage mastery, and unmatched astrogation across uncharted sectors.',
        presetParams: { faction_type: 'Sovereign Clan / Kingdom', government_type: 'Nomadic Clan Federation', wealth_modifier: '-1 (Developing Frontier Economy)', tl: 3, ml: 1 },
        suggestedTraits: ['trait-zero-g-veteran', 'trait-rugged-survival', 'trait-primal-resilience', 'trait-beast-hunter', 'trait-scavenger-instinct']
      },
      {
        id: 'shadow_cartel',
        label: 'Underworld Syndicate Cartel',
        badge: 'Criminal Cartel • Covert',
        suggestedName: 'Crimson Eclipse Syndicate',
        prompt: 'Sprawling black-market smuggling network, information brokers, and unlicensed cyber-clinics operating in the shadow of core arcologies.',
        presetParams: { faction_type: 'Criminal Syndicate / Cartel', government_type: 'Shadow Syndicate Cartel', wealth_modifier: '+1 (Prosperous Trade Hub)', tl: 3, ml: 1 },
        suggestedTraits: ['trait-shadowmeld', 'trait-scavenger-instinct', 'trait-independent-grit', 'trait-bio-crafting-intuition']
      }
    ],
    directivesLabel: '3. Sociological, Military & HIFI CHROMA Directives (Optional)',
    directivesPlaceholder: 'E.g., Include a complete 20-point Faction Skill Package, 1 CP discount recommended features, naval fleet doctrine, and HIFI CHROMA visual synthesis prompts...',
    quickDirectives: [
      '20-Pt Faction Skill Package',
      'HIFI CHROMA Visual Prompts',
      'Naval Armada & Key Units',
      '1 CP Discount Feature List',
      'Internal Political Friction'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ARCHETYPES MATRIX (80 CP CHASSIS)
  // ─────────────────────────────────────────────────────────────────────────────
  archetypes: {
    id: 'archetypes',
    synthesizerSubtitle: 'Synthesize 80 CP persona chassis & signature traits',
    conceptSectionLabel: '1. Persona Sphere & Archetype Fantasy',
    nameField: {
      label: 'Archetype Designation',
      placeholder: 'E.g., The Bureaucrat, The Void Ranger, The Chrono-Savant...'
    },
    parametersSectionLabel: '2. 80 CP Chassis & Attribute Allocation',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      {
        key: 'sphere',
        label: 'Thematic Sphere',
        type: 'select',
        defaultValue: 'Operatives (The Artisans)',
        options: [
          'Sentinels (The Stabilizers)',
          'Operatives (The Artisans)',
          'Visionaries (The Idealists)',
          'Savants (The Rationals)'
        ]
      },
      {
        key: 'primary_attribute',
        label: 'Primary Attribute (+3 / 15 CP)',
        type: 'select',
        defaultValue: 'Agility',
        options: ['Intellect', 'Wisdom', 'Charisma', 'Strength', 'Agility', 'Stamina']
      },
      {
        key: 'secondary_attribute',
        label: 'Secondary Attribute (+2 / 10 CP)',
        type: 'select',
        defaultValue: 'Intellect',
        options: ['Intellect', 'Wisdom', 'Charisma', 'Strength', 'Agility', 'Stamina']
      }
    ],
    concepts: [
      {
        id: 'sentinel_bulwark',
        label: 'Frontline Sentinel / Bulwark',
        badge: 'Sentinels • STA / STR',
        suggestedName: 'The Aegis Vanguard',
        prompt: 'Unshakable tactical protector who anchors breaches, absorbs heavy fire, and safeguards the squad through heavy armor and iron resolve.',
        presetParams: { sphere: 'Sentinels (The Stabilizers)', primary_attribute: 'Stamina', secondary_attribute: 'Strength' },
        suggestedTraits: ['trait-defensive-stance', 'trait-protective-stance', 'trait-guardian', 'trait-unflinching', 'trait-heavy-weapon-mastery']
      },
      {
        id: 'operative_infiltrator',
        label: 'Covert Operative / Specialist',
        badge: 'Operatives • AGI / INT',
        suggestedName: 'The Ghost Infiltrator',
        prompt: 'High-precision stealth specialist, marksman, and infiltration artisan who neutralizes high-value targets before alarms sound.',
        presetParams: { sphere: 'Operatives (The Artisans)', primary_attribute: 'Agility', secondary_attribute: 'Intellect' },
        suggestedTraits: ['trait-infiltrator', 'trait-silent-killer', 'trait-adaptive-camouflage', 'trait-quick-reflexes', 'trait-undercover-operations']
      },
      {
        id: 'visionary_envoy',
        label: 'Charismatic Visionary / Commander',
        badge: 'Visionaries • CHA / WIS',
        suggestedName: 'The Sovereign Envoy',
        prompt: 'Inspirational diplomat, tactical face, or awakened mystic who bends negotiations and rallies allies under extreme pressure.',
        presetParams: { sphere: 'Visionaries (The Idealists)', primary_attribute: 'Charisma', secondary_attribute: 'Wisdom' },
        suggestedTraits: ['trait-commanding-presence', 'trait-inspiring-leader', 'trait-master-negotiator', 'trait-diplomatic-immunity', 'trait-silver-tongue']
      },
      {
        id: 'savant_architect',
        label: 'Tech Savant / Systems Engineer',
        badge: 'Savants • INT / WIS',
        suggestedName: 'The Quantum Artificer',
        prompt: 'Master engineer, cyber-hacker, and analytical tactician who weaponizes drones, electronics, and battlefield fabrication.',
        presetParams: { sphere: 'Savants (The Rationals)', primary_attribute: 'Intellect', secondary_attribute: 'Wisdom' },
        suggestedTraits: ['trait-adaptive-engineering', 'trait-cyber-intrusion', 'trait-technical-expertise', 'trait-robotic-affinity', 'trait-analytical-mind']
      },
      {
        id: 'sentinel_logistics',
        label: 'Logistics & Support Broker',
        badge: 'Sentinels • INT / CHA',
        suggestedName: 'The Quartermaster Broker',
        prompt: 'Resourceful fixer and administrative strategist who weaponizes wealth, supply chains, and legal authority to keep the team operational.',
        presetParams: { sphere: 'Sentinels (The Stabilizers)', primary_attribute: 'Intellect', secondary_attribute: 'Charisma' },
        suggestedTraits: ['trait-master-of-logistics', 'trait-bureaucratic-efficiency', 'trait-corporate-backing', 'trait-market-savvy', 'trait-black-market-connections']
      },
      {
        id: 'visionary_psion',
        label: 'Awakened Discipline Mystic',
        badge: 'Visionaries • WIS / INT',
        suggestedName: 'The Void Channeler',
        prompt: 'Metaphysical adept who commands psionic disciplines, spatial anomalies, and heightened consciousness in combat and exploration.',
        presetParams: { sphere: 'Visionaries (The Idealists)', primary_attribute: 'Wisdom', secondary_attribute: 'Intellect' },
        suggestedTraits: ['trait-arcane-mastery', 'trait-embrace-the-void', 'trait-spiritual-attunement', 'trait-enlightened-mind', 'trait-iron-will']
      }
    ],
    directivesLabel: '3. 80 CP Skill Package, Signature Traits & Role Directives (Optional)',
    directivesPlaceholder: 'E.g., Include 10 Essential Skills (4 Trained Rank 6 + 6 Novice Rank 3 = 44 CP), 2 Signature Traits (1 CP each), and recommended Factions/Origins/Occupations...',
    quickDirectives: [
      'Strict 80 CP Chassis Math',
      '4 Trained + 6 Novice Skills',
      '2 Signature 1-CP Traits',
      'Tactical Squad Synergy',
      '5-Pillar Recommendations'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ORIGINS MATRIX (20 SP SOCIETY POOL)
  // ─────────────────────────────────────────────────────────────────────────────
  origins: {
    id: 'origins',
    synthesizerSubtitle: 'Synthesize homeworld habitat & 20 SP society pool',
    conceptSectionLabel: '1. Homeworld Biome & Habitat Concept',
    nameField: {
      label: 'Origin / Habitat Name',
      placeholder: 'E.g., Subterranean Forge-Hive, Deep Void Flotilla...'
    },
    parametersSectionLabel: '2. Environmental Classification & Wealth Modifier (Fixed 20 SP Pool)',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'habitat',
        label: 'Habitat Classification',
        type: 'select',
        defaultValue: 'Planetary Biome',
        options: [
          'Planetary Biome',
          'Aquatic & Oceanic',
          'Frontier Outpost',
          'Sanctuary & Arcane',
          'Death World & Extreme',
          'Industrial Heavy',
          'Resort & Paradise',
          'Military Stronghold',
          'Science & Laboratory',
          'Deep Void & Station',
          'Sprawl & Arcology'
        ]
      },
      {
        key: 'ws_modifier',
        label: 'Wealth Score Mod (WS +0 to +3)',
        type: 'select',
        defaultValue: '1',
        options: ['0', '1', '2', '3']
      }
    ],
    concepts: [
      {
        id: 'sprawl_arcology',
        label: 'Mega-Sprawl Arcology',
        badge: 'Urban • High Density',
        suggestedName: 'Neon Tiered Mega-Arcology',
        prompt: 'Towering vertical city-state of neon sub-levels, corporate sky-bridges, dense data networks, and relentless street hustling.',
        presetParams: { habitat: 'Sprawl & Arcology', ws_modifier: '2', tl: 4, ml: 0 },
        suggestedTraits: ['trait-urban-survival', 'trait-streetwise', 'trait-contacts', 'trait-tech-savvy', 'trait-smooth-talking']
      },
      {
        id: 'deep_void_station',
        label: 'Deep Void / Generation Ship',
        badge: 'Zero-G • Orbital/Fleet',
        suggestedName: 'Deep-Rim Orbital Tether',
        prompt: 'Born and raised in microgravity habitats, asteroid hollows, or nomadic starship hulls where airlock discipline is life.',
        presetParams: { habitat: 'Deep Void & Station', ws_modifier: '1', tl: 3, ml: 0 },
        suggestedTraits: ['trait-zero-g-acclimation', 'trait-pilot-skills', 'trait-mechanical-aptitude', 'trait-resource-management', 'trait-teamwork']
      },
      {
        id: 'death_world',
        label: 'Hostile Death World',
        badge: 'Extreme Hazard • Survival',
        suggestedName: 'Lethal Biosphere Frontier',
        prompt: 'Unforgiving planet of apex megafauna, corrosive storms, or crushing gravity that breeds unmatched survivalists.',
        presetParams: { habitat: 'Death World & Extreme', ws_modifier: '0', tl: 2, ml: 1 },
        suggestedTraits: ['trait-survival-skills', 'trait-toughness', 'trait-physical-endurance', 'trait-environmental-awareness', 'trait-persistence']
      },
      {
        id: 'industrial_foundry',
        label: 'Heavy Industrial Foundry',
        badge: 'Refinery • Smog & Steel',
        suggestedName: 'Tectonic Slag-Refinery Basin',
        prompt: 'Planet-scale manufacturing complexes, orbital shipyards, and strip-mining basins run on heavy machinery and grit.',
        presetParams: { habitat: 'Industrial Heavy', ws_modifier: '1', tl: 3, ml: 0 },
        suggestedTraits: ['trait-mechanical-skills', 'trait-technical-skills', 'trait-physical-strength', 'trait-practicality', 'trait-tough']
      },
      {
        id: 'arcane_sanctuary',
        label: 'Leyline / Psionic Sanctuary',
        badge: 'Arcane • High ML',
        suggestedName: 'Aetheric Monastic Enclave',
        prompt: 'Secluded world or cloaked habitat saturated with dimensional resonance, monastic academies, and awakened traditions.',
        presetParams: { habitat: 'Sanctuary & Arcane', ws_modifier: '1', tl: 3, ml: 3 },
        suggestedTraits: ['trait-spiritual-awareness', 'trait-shared-wisdom', 'trait-disciplined', 'trait-intuition', 'trait-studious']
      },
      {
        id: 'aquatic_pelagic',
        label: 'Pelagic Ocean Domes',
        badge: 'Aquatic • Sub-Surface',
        suggestedName: 'Abyssal Trench Hydro-Colony',
        prompt: 'Submerged pressure-domes, floating kelp-harvester cities, and deep-trench thermal vents teeming with marine life.',
        presetParams: { habitat: 'Aquatic & Oceanic', ws_modifier: '1', tl: 3, ml: 0 },
        suggestedTraits: ['trait-aquatic-construction', 'trait-sea-piloting', 'trait-adaptability', 'trait-sustainable-practices', 'trait-environmental-awareness']
      }
    ],
    directivesLabel: '3. Environmental Lore, 20 SP Society Skills & Origin Traits (Optional)',
    directivesPlaceholder: 'E.g., Curate 8-10 Society Skills for the 20 SP pool, 4 selectable Origin Traits (2 free at creation), and 1 CP discounted features...',
    quickDirectives: [
      '20 SP Society Skills List',
      'Selectable Homeworld Traits',
      '-1 CP Discounted Features',
      'Environmental Hazard Lore',
      'Recommended Species & Factions'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. OCCUPATIONS MATRIX (20 SP PROFESSIONAL POOL)
  // ─────────────────────────────────────────────────────────────────────────────
  occupations: {
    id: 'occupations',
    synthesizerSubtitle: 'Synthesize vocational career & 20 SP skill pool',
    conceptSectionLabel: '1. Vocational & Guild Career Path',
    nameField: {
      label: 'Occupation / Career Designation',
      placeholder: 'E.g., Void Pathfinder, Cyber-Medicus, Syndicate Fixer...'
    },
    parametersSectionLabel: '2. Career Field & Base Wealth Score (Fixed 20 SP Pool)',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'field',
        label: 'Career Category / Field',
        type: 'select',
        defaultValue: 'Military & Security',
        options: [
          'Military & Security',
          'Underworld & Covert',
          'Technical & Crafting',
          'Arcane & Psionic',
          'Corporate & Commerce',
          'Academic & Science',
          'Frontier & Exploration',
          'Civilian & Labor',
          'General / Other'
        ]
      },
      {
        key: 'base_ws',
        label: 'Base Wealth Score (WS 1–6)',
        type: 'select',
        defaultValue: '3',
        options: ['1', '2', '3', '4', '5', '6']
      }
    ],
    concepts: [
      {
        id: 'tactical_security',
        label: 'Military & Tactical Operator',
        badge: 'Military • Combat/Command',
        suggestedName: 'Shock-Drop Marine',
        prompt: 'Formal armed forces, mercenary company, or marshal service trained in coordinated fireteams, ordnance, and battlefield survival.',
        presetParams: { field: 'Military & Security', base_ws: '3', tl: 3, ml: 0 },
        suggestedTraits: ['trait-combat-training', 'trait-rapid-response', 'trait-strategic-thinking', 'trait-well-equipped', 'trait-team-oriented']
      },
      {
        id: 'covert_intelligence',
        label: 'Covert Intelligence / Shadow Op',
        badge: 'Covert • Espionage',
        suggestedName: 'Black-Vault Intelligence Operative',
        prompt: 'Clandestine espionage agent, corporate saboteur, or bounty hunter skilled in tradecraft, slicing, and silent elimination.',
        presetParams: { field: 'Underworld & Covert', base_ws: '3', tl: 3, ml: 0 },
        suggestedTraits: ['trait-stealth', 'trait-guile', 'trait-deception', 'trait-investigation', 'trait-street-smarts']
      },
      {
        id: 'technical_artificer',
        label: 'Cyber-Tech & Field Engineer',
        badge: 'Technical • Fabrication',
        suggestedName: 'Mecha & Warp-Core Artificer',
        prompt: 'Licensed guild engineer, cyber-surgeon, or starship mechanic who builds, repairs, and overclocks complex hardware under fire.',
        presetParams: { field: 'Technical & Crafting', base_ws: '4', tl: 4, ml: 0 },
        suggestedTraits: ['trait-trade-tools', 'trait-technical-knowledge', 'trait-machine-affinity', 'trait-hacking', 'trait-mecha-physics']
      },
      {
        id: 'frontier_pathfinder',
        label: 'Void Pathfinder & Free Trader',
        badge: 'Exploration • Astrogation',
        suggestedName: 'Uncharted Rim Survey Scout',
        prompt: 'Deep-space prospector, xeno-tracker, and blockade runner charting hazardous jump routes and ancient precursor ruins.',
        presetParams: { field: 'Frontier & Exploration', base_ws: '2', tl: 3, ml: 0 },
        suggestedTraits: ['trait-navigation', 'trait-pilot', 'trait-survival', 'trait-terrain-expert', 'trait-scavenging']
      },
      {
        id: 'corporate_executive',
        label: 'Corporate Broker & Arbiter',
        badge: 'Commerce • High Wealth',
        suggestedName: 'Syndicate Acquisitions Arbiter',
        prompt: 'High-stakes negotiator, legal advocate, or trade consortium executive leveraging contracts, credit lines, and influence.',
        presetParams: { field: 'Corporate & Commerce', base_ws: '5', tl: 3, ml: 0 },
        suggestedTraits: ['trait-high-pay', 'trait-business-acumen', 'trait-negotiation', 'trait-networking', 'trait-high-social-standing']
      },
      {
        id: 'arcane_adept',
        label: 'Psionic Adept & Meta-Scholar',
        badge: 'Arcane • Awakened',
        suggestedName: 'Resonance Crucible Adept',
        prompt: 'Initiated practitioner of psionic disciplines, dimensional anomalies, and meta-tech attunement.',
        presetParams: { field: 'Arcane & Psionic', base_ws: '3', tl: 3, ml: 2 },
        suggestedTraits: ['trait-mastery-of-a-discipline', 'trait-metacognition', 'trait-mystical-or-spiritual-connection', 'trait-mental-resilience']
      }
    ],
    directivesLabel: '3. Career Dossier, 20 SP Skills & Occupational Traits (Optional)',
    directivesPlaceholder: 'E.g., Include 8-10 Professional Skills (20 SP pool), selectable Occupational Traits (including Trade Tools / High Pay), and -1 CP discounted features...',
    quickDirectives: [
      '20 SP Professional Skills',
      'Occupational Traits (2 Free)',
      '-1 CP Discounted Features',
      'Guild Standing & Perks',
      'Starting Gear Synergies'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. SKILLS MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  skills: {
    id: 'skills',
    synthesizerSubtitle: 'Synthesize 2d10 proficiency, governing attr & DCs',
    conceptSectionLabel: '1. Competency & Proficiency Domain',
    nameField: {
      label: 'Skill / Proficiency Name',
      placeholder: 'E.g., Astrogation, Zero-G Maneuvering, Xenobiology...'
    },
    parametersSectionLabel: '2. Skill Taxonomy & Classification',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'type',
        label: 'Skill Domain',
        type: 'select',
        defaultValue: 'mental',
        options: ['mental', 'physical', 'social', 'combat', 'meta']
      },
      {
        key: 'subtype',
        label: 'Discipline Subtype',
        type: 'select',
        defaultValue: 'vocation',
        options: ['knowledge', 'vocation', 'manipulation', 'expression', 'archaic', 'modern', 'advanced']
      }
    ],
    concepts: [
      {
        id: 'technical_vocation',
        label: 'Technical / Starship Vocation',
        badge: 'Mental • Vocation',
        suggestedName: 'Subspace Telemetry',
        prompt: 'Applied technical or operational proficiency used to diagnose, pilot, compute, or maintain advanced interstellar systems.',
        presetParams: { type: 'mental', subtype: 'vocation', tl: 3, ml: 0 }
      },
      {
        id: 'scientific_knowledge',
        label: 'Academic & Xeno-Knowledge',
        badge: 'Mental • Knowledge',
        suggestedName: 'Precursor Xenolinguistics',
        prompt: 'Scholarly, forensic, or scientific discipline governing analysis, research CR benchmarks, and lore identification.',
        presetParams: { type: 'mental', subtype: 'knowledge', tl: 3, ml: 0 }
      },
      {
        id: 'physical_kinetic',
        label: 'Physical & Kinetic Mastery',
        badge: 'Physical • Mobility',
        suggestedName: 'Zero-G EVA Kinetics',
        prompt: 'Athletic, acrobatic, or stealth coordination under hazardous gravity, vacuum, or high-speed traversal.',
        presetParams: { type: 'physical', subtype: 'modern', tl: 2, ml: 0 }
      },
      {
        id: 'social_influence',
        label: 'Social & Diplomatic Leverage',
        badge: 'Social • Expression',
        suggestedName: 'Syndicate Protocol',
        prompt: 'Interpersonal manipulation, command presence, underworld streetwise negotiation, or cultural etiquette.',
        presetParams: { type: 'social', subtype: 'expression', tl: 1, ml: 0 }
      },
      {
        id: 'combat_proficiency',
        label: 'Tactical Combat Proficiency',
        badge: 'Combat • 6-Stage Scaling',
        suggestedName: 'Point-Defense Gunnery',
        prompt: 'Direct weapon or defensive martial skill scaling across the 6-Stage Action Economy (Novice to Pinnacle).',
        presetParams: { type: 'combat', subtype: 'modern', tl: 3, ml: 0 }
      },
      {
        id: 'meta_attunement',
        label: 'Metaphysical / Psi Attunement',
        badge: 'Meta • Awakened',
        suggestedName: 'Leyline Harmonics',
        prompt: 'Awakened mental proficiency governing psionic focus, dimensional sensing, and manifestation stability.',
        presetParams: { type: 'meta', subtype: 'advanced', tl: 0, ml: 2 }
      }
    ],
    directivesLabel: '3. Governing Attribute, CR Benchmarks & Specialization Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify Governing Attribute, routine/challenging/heroic CR benchmarks (CR 10 / 15 / 20 / 25), opposed check rules, and sub-skill specializations (Rank 1–10, max 1 viable)...',
    quickDirectives: [
      'CR 10/15/20/25 Benchmarks',
      'Opposed 2d10 Check Rules',
      'Sub-Skill Specializations (1–10)',
      'Tool & Kit Requirements',
      'Failure / Fumble Consequences'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. FEATURES MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  features: {
    id: 'features',
    synthesizerSubtitle: 'Synthesize character talent, CP cost & triggers',
    conceptSectionLabel: '1. Talent & Perk Mechanical Archetype',
    nameField: {
      label: 'Feature / Talent Name',
      placeholder: 'E.g., Deadeye Focus, Void Acclimation, Rapid Reload...'
    },
    parametersSectionLabel: '2. Feature Classification, Scaling & CP Cost',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      {
        key: 'type',
        label: 'Feature Category',
        type: 'select',
        defaultValue: 'combat',
        options: ['combat', 'ability', 'discipline', 'general', 'karma', 'skill', 'special']
      },
      {
        key: 'acquisition_type',
        label: 'Acquisition Scaling',
        type: 'select',
        defaultValue: 'Basic',
        options: ['Basic', 'Multiple', 'Staged', 'Multi/Staged']
      },
      {
        key: 'cp',
        label: 'CP Cost (1-10 CP)',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 15
      }
    ],
    concepts: [
      {
        id: 'combat_maneuver',
        label: 'Tactical Combat Talent',
        badge: 'Combat • 3 CP',
        suggestedName: 'Suppressive Fire Mastery',
        prompt: 'Enhances weapon handling, action economy, precision strikes, cover exploitation, or defensive reactions in combat.',
        presetParams: { type: 'combat', acquisition_type: 'Basic', cp: 3, tl: 2, ml: 0 }
      },
      {
        id: 'staged_mastery',
        label: 'Staged Progression Perk',
        badge: 'Staged • Rank I-III',
        suggestedName: ' Overclocked Reflexes',
        prompt: 'Multi-rank progressive talent where each purchased stage increases numeric bonuses or unlocks higher tactical tiers.',
        presetParams: { type: 'ability', acquisition_type: 'Staged', cp: 3, tl: 3, ml: 0 }
      },
      {
        id: 'skill_specialist',
        label: 'Skill Mastery & Reroll Feat',
        badge: 'Skill • Advantage',
        suggestedName: 'Master Diagnostics',
        prompt: 'Grants situational Advantage (+1d10 keep highest 2) or unlocks specialized technical actions under pressure.',
        presetParams: { type: 'skill', acquisition_type: 'Basic', cp: 2, tl: 2, ml: 0 }
      },
      {
        id: 'karma_fate',
        label: 'Karma & Fate Manipulation',
        badge: 'Karma • Luck/Boons',
        suggestedName: 'Defy the Odds',
        prompt: 'Expands Karma Point (KP) utility, doubles Axis-2 narrative boons, or turns critical fumbles into grazing escapes.',
        presetParams: { type: 'karma', acquisition_type: 'Basic', cp: 3, tl: 0, ml: 0 }
      },
      {
        id: 'discipline_focus',
        label: 'Psionic / Discipline Technique',
        badge: 'Discipline • Focus/Meta',
        suggestedName: 'Resonant Overchannel',
        prompt: 'Metaphysical feat that reduces Focus expenditure, mitigates overchannel burn, or shapes invocation areas.',
        presetParams: { type: 'discipline', acquisition_type: 'Basic', cp: 3, tl: 0, ml: 2 }
      },
      {
        id: 'general_benefit',
        label: 'Social Status & Authority Perk',
        badge: 'General • Authority/Wealth',
        suggestedName: 'Diplomatic Immunity Clearance',
        prompt: 'Grants institutional clearance, black-market contacts, wealth stipends, or command jurisdiction.',
        presetParams: { type: 'general', acquisition_type: 'Multiple', cp: 2, tl: 2, ml: 0 }
      }
    ],
    directivesLabel: '3. Prerequisites, Trigger Conditions & Mechanical Rules (Optional)',
    directivesPlaceholder: 'E.g., Specify Attribute/Skill prerequisites, exact passive modifier or active trigger, Focus cost (if any), and stacking restrictions...',
    quickDirectives: [
      'Include Skill Prerequisites',
      'Structured Stat Modifiers',
      'Active Focus Trigger',
      'Staged Rank I / II / III',
      '2d10 Advantage Synergy'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. SPECIES TRAITS MATRIX (trait)
  // ─────────────────────────────────────────────────────────────────────────────
  trait: {
    id: 'trait',
    synthesizerSubtitle: 'Synthesize 1/2/4 CP biological species adaptation',
    conceptSectionLabel: '1. Evolutionary & Physiological Adaptation',
    nameField: {
      label: 'Species Trait Designation',
      placeholder: 'E.g., Active Camouflage, Chitinous Carapace, Electro-Reception...'
    },
    parametersSectionLabel: '2. Biological Trait Tier & Classification',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      {
        key: 'trait_tier',
        label: 'Trait Tier & CP Valuation',
        type: 'select',
        defaultValue: 'Basic (1 CP)',
        options: ['Basic (1 CP)', 'Advanced (2 CP)', 'Elite (4 CP)']
      },
      {
        key: 'classification',
        label: 'Physiological Domain',
        type: 'select',
        defaultValue: 'Physical',
        options: ['Physical', 'Sensory', 'Combat', 'Mental', 'Metaphysical']
      },
      {
        key: 'cp',
        label: 'CP Cost (1 / 2 / 4)',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 6
      }
    ],
    concepts: [
      {
        id: 'sensory_organ',
        label: 'Specialized Sensory Organ',
        badge: 'Sensory • 1-2 CP',
        suggestedName: 'Thermal Pit Organs',
        prompt: 'Evolutionary sensory adaptation such as infrared pit organs, echolocation, tremorsense, or ultraviolet spectrum vision.',
        presetParams: { trait_tier: 'Basic (1 CP)', classification: 'Sensory', cp: 1 },
        presetModules: ['trait_sys_sensory', 'trait_trig_passive', 'trait_mech_skill_adv']
      },
      {
        id: 'natural_armament',
        label: 'Natural Weapons & Venom',
        badge: 'Combat • 2 CP',
        suggestedName: 'Retractable Bone Talons',
        prompt: 'Inherent biological weaponry such as retractable claws, neurotoxic fangs, acid spit, or barbed tail strikes.',
        presetParams: { trait_tier: 'Advanced (2 CP)', classification: 'Combat', cp: 2 },
        presetModules: ['trait_sys_combat_weapon', 'trait_trig_attack', 'trait_mech_damage_venom']
      },
      {
        id: 'dermal_defense',
        label: 'Dermal Plating & Carapace',
        badge: 'Physical • 2-4 CP',
        suggestedName: 'Ablative Chitinous Carapace',
        prompt: 'Thick scales, osteoderms, or subdermal plating granting innate Damage Reduction (DR) or environmental insulation.',
        presetParams: { trait_tier: 'Advanced (2 CP)', classification: 'Physical', cp: 2 },
        presetModules: ['trait_sys_dermal_armor', 'trait_trig_passive', 'trait_mech_dr_immunity']
      },
      {
        id: 'elite_adaptation',
        label: 'Elite Xenobiological Mutation',
        badge: 'Elite • 4 CP',
        suggestedName: 'Cellular Regeneration Matrix',
        prompt: 'High-impact evolutionary pinnacle such as rapid tissue regeneration, extra functional limbs, or vacuum hibernation.',
        presetParams: { trait_tier: 'Elite (4 CP)', classification: 'Physical', cp: 4 },
        presetModules: ['trait_sys_metabolic', 'trait_trig_passive', 'trait_mech_elite_form']
      },
      {
        id: 'neural_adaptation',
        label: 'Neural / Hive Mind Synapse',
        badge: 'Mental • 2 CP',
        suggestedName: 'Dual-Hemisphere Consciousness',
        prompt: 'Redundant neural architecture granting resistance to psychic intrusion, stun effects, or sleep deprivation.',
        presetParams: { trait_tier: 'Advanced (2 CP)', classification: 'Mental', cp: 2 },
        presetModules: ['trait_sys_neural', 'trait_trig_reactive', 'trait_mech_dr_immunity']
      },
      {
        id: 'meta_organ',
        label: 'Bio-Aetheric Resonance Organ',
        badge: 'Metaphysical • 2-4 CP',
        suggestedName: 'Void-Bile Resonance Sac',
        prompt: 'Biological organ that naturally stores Focus Points, senses dimensional rifts, or dampens nearby psionics.',
        presetParams: { trait_tier: 'Advanced (2 CP)', classification: 'Metaphysical', cp: 2 },
        presetModules: ['trait_sys_meta_organ', 'trait_trig_active_rest', 'trait_mech_psi_focus']
      }
    ],
    conceptAxes: [
      {
        id: 'trait_system',
        label: 'A. Physiological System & Organ',
        shortLabel: 'Physiology',
        description: 'Select the biological system or anatomical structure that produces this adaptation.',
        modules: [
          {
            id: 'trait_sys_sensory',
            label: 'Ocular / Auditory / Vibrational Organ',
            badge: 'Sensory • Spectrum',
            suggestedName: 'Infrared Pit Receptors',
            prompt: 'Specialized sensory receptor detecting thermal, electromagnetic, acoustic, or chemical signatures.',
            presetParams: { classification: 'Sensory' }
          },
          {
            id: 'trait_sys_dermal_armor',
            label: 'Dermal Carapace / Osteoderm Plating',
            badge: 'Physical • Armor/DR',
            suggestedName: 'Segmented Chitin Plating',
            prompt: 'Subdermal bone density, chitinous shell, or chromatophore skin providing protection or active camouflage.',
            presetParams: { classification: 'Physical' }
          },
          {
            id: 'trait_sys_combat_weapon',
            label: 'Natural Armament / Venom Gland',
            badge: 'Combat • Claws/Toxin',
            suggestedName: 'Neurotoxic Fang Glands',
            prompt: 'Retractable talons, fangs, spines, constriction musculature, or pressurized bio-chemical glands.',
            presetParams: { classification: 'Combat', trait_tier: 'Advanced (2 CP)', cp: 2 }
          },
          {
            id: 'trait_sys_locomotion',
            label: 'Musculoskeletal & Appendage',
            badge: 'Physical • Mobility/Limbs',
            suggestedName: 'Prehensile Canopy Tail',
            prompt: 'Extra prehensile limbs, patagia wing membranes, digitigrade tendons, or amphibious propulsion organs.',
            presetParams: { classification: 'Physical' }
          },
          {
            id: 'trait_sys_metabolic',
            label: 'Metabolic / Cellular Regeneration',
            badge: 'Physical • Sustain/Heal',
            suggestedName: 'Autotrophic Chloroplast Dermis',
            prompt: 'Rapid cellular mitosis, photosynthetic sustenance, radiation/toxin filtration, or cryptobiotic torpor.',
            presetParams: { classification: 'Physical' }
          },
          {
            id: 'trait_sys_neural',
            label: 'Neural / Pheromonal / Hive-Link',
            badge: 'Mental • Synapse',
            suggestedName: 'Pheromonal Telemetry Sac',
            prompt: 'Distributed ganglia, hive-link telepathy, sleepless dual-hemisphere brain, or ancestral genetic memory.',
            presetParams: { classification: 'Mental' }
          },
          {
            id: 'trait_sys_meta_organ',
            label: 'Aetheric / Awakened Resonance',
            badge: 'Metaphysical • Psi/Void',
            suggestedName: 'Leyline Attunement Gland',
            prompt: 'Metaphysical organ granting innate Discipline access, ether-sight, or psionic interference.',
            presetParams: { classification: 'Metaphysical', trait_tier: 'Advanced (2 CP)', cp: 2 }
          }
        ]
      },
      {
        id: 'trait_trigger',
        label: 'B. Activation & Action Economy',
        shortLabel: 'Trigger Mode',
        description: 'Define how and when this biological adaptation activates in play.',
        modules: [
          {
            id: 'trait_trig_passive',
            label: 'Constant / Inherent Passive',
            badge: 'Always Active',
            prompt: 'Permanently active physiological trait requiring no action or resource expenditure.'
          },
          {
            id: 'trait_trig_situational',
            label: 'Environmental / Terrain Conditional',
            badge: 'Situational Trigger',
            prompt: 'Triggers automatically when in a specific biome, light level, gravity field, or submerged habitat.'
          },
          {
            id: 'trait_trig_attack',
            label: 'Natural Attack / Grapple Rider',
            badge: 'Combat Action',
            prompt: 'Applies on unarmed/natural weapon strikes, charges, or grapple checks.'
          },
          {
            id: 'trait_trig_reactive',
            label: 'Defensive / Saving Throw Reaction',
            badge: 'Reaction / Save',
            prompt: 'Triggers when targeted by hazards, toxins, mental intrusion, or incoming attacks.'
          },
          {
            id: 'trait_trig_active_rest',
            label: '1/Rest or Focus-Activated Surge',
            badge: '1/Rest • Surge',
            prompt: 'Biological burst usable once per Light/Long Rest or by expending Stamina/Focus.'
          }
        ]
      },
      {
        id: 'trait_effect',
        label: 'C. Mechanical Benefit & Tier Scope',
        shortLabel: 'Mechanical Output',
        description: 'Select the mechanical resolution output calibrated to 1, 2, or 4 CP.',
        modules: [
          {
            id: 'trait_mech_skill_adv',
            label: '+2 to +4 Skill / Save Bonus (1 CP)',
            badge: 'Basic • 1 CP',
            prompt: 'Grants a +2 inherent or +4 situational bonus to specific Skills or Saving Throws.',
            presetParams: { trait_tier: 'Basic (1 CP)', cp: 1 }
          },
          {
            id: 'trait_mech_dr_immunity',
            label: 'Damage Reduction / Hazard Immunity (2 CP)',
            badge: 'Advanced • 2 CP',
            prompt: 'Grants scaled Damage Reduction (DR 5-10) or full immunity to poison, radiation, or G-forces.',
            presetParams: { trait_tier: 'Advanced (2 CP)', cp: 2 }
          },
          {
            id: 'trait_mech_damage_venom',
            label: 'Natural Die + Fortitude Save DC (2 CP)',
            badge: 'Advanced • 2 CP',
            prompt: 'Inflicts natural weapon damage or toxin requiring a DC 11 + 2xSTA Fortitude save.',
            presetParams: { trait_tier: 'Advanced (2 CP)', cp: 2 }
          },
          {
            id: 'trait_mech_psi_focus',
            label: 'Awakened Attune / Telepathy (2 CP)',
            badge: 'Advanced • 2 CP',
            prompt: 'Unlocks the Attune skill, 30-60 ft blindsense/mind-speech, or Mental DR.',
            presetParams: { trait_tier: 'Advanced (2 CP)', cp: 2 }
          },
          {
            id: 'trait_mech_elite_form',
            label: 'Flight / Regeneration / 4-Arms (4 CP)',
            badge: 'Elite • 4 CP',
            prompt: 'Transformative 4 CP pinnacle capability such as full Flight, limb Regeneration, or Multidextrous 4-Arms.',
            presetParams: { trait_tier: 'Elite (4 CP)', cp: 4 }
          }
        ]
      }
    ],
    directivesLabel: '3. Physiological Mechanism, Cortex Trait Reference & CP Directives (Optional)',
    directivesPlaceholder: 'E.g., Calibrate strictly to 1 CP (+2 situational bonus / minor sense), 2 CP (constant DR / natural weapon), or 4 CP (regeneration / extra limb action)...',
    directiveCategories: [
      {
        id: 'tier_calibration',
        label: 'Tier & CP Calibration',
        directives: [
          '1 CP Basic Scope (+2 Skill / Minor Sense)',
          '2 CP Advanced Scope (DR / Natural Weapon / Telepathy)',
          '4 CP Elite Scope (Flight / Regen / Extra Limbs)',
          'Include Structured Stat/Skill Modifiers'
        ]
      },
      {
        id: 'resolution_mechanics',
        label: '2d10 Resolution & Saves',
        directives: [
          'Fortitude Save DC = 11 + (2 x STA)',
          'Grant 2d10 Advantage (+1d10 Keep 2)',
          'Specify Action Economy & Range (30/60 ft)',
          'Scale DR by (STR + 2) Multiplier'
        ]
      }
    ],
    quickDirectives: [
      '1 CP Basic Scope (+2 Skill / Minor Sense)',
      '2 CP Advanced Scope (DR / Natural Weapon / Telepathy)',
      '4 CP Elite Scope (Flight / Regen / Extra Limbs)',
      'Include Structured Stat/Skill Modifiers',
      'Fortitude Save DC = 11 + (2 x STA)',
      'Grant 2d10 Advantage (+1d10 Keep 2)',
      'Specify Action Economy & Range (30/60 ft)'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. PILLAR TRAITS MATRIX (traits)
  // ─────────────────────────────────────────────────────────────────────────────
  traits: {
    id: 'traits',
    synthesizerSubtitle: 'Synthesize 1 CP origin, career, or faction trait',
    conceptSectionLabel: '1. Cultural, Career & Pillar Conditioning',
    nameField: {
      label: 'Pillar Trait Name',
      placeholder: 'E.g., Spacer Zero-G Instincts, Syndicate Insider, Penal Grit...'
    },
    parametersSectionLabel: '2. Pillar Source & Trait Classification',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      {
        key: 'trait_type',
        label: 'Trait Pillar / Source',
        type: 'select',
        defaultValue: 'Origin Trait',
        options: ['Origin Trait', 'Occupational Trait', 'Archetype Trait', 'Faction Trait']
      },
      {
        key: 'classification',
        label: 'Functional Domain',
        type: 'select',
        defaultValue: 'General',
        options: ['General', 'Social', 'Mental', 'Physical', 'Combat', 'Technical', 'Metaphysical']
      },
      {
        key: 'cp',
        label: 'CP Cost (Standard: 1 CP)',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 4
      }
    ],
    concepts: [
      {
        id: 'origin_conditioning',
        label: 'Homeworld Environmental Conditioning',
        badge: 'Origin Trait • 1 CP',
        suggestedName: 'High-Gravity Stride',
        prompt: 'Formative planetary or habitat adaptation granting +2 to specific survival, athletics, or environmental checks.',
        presetParams: { trait_type: 'Origin Trait', classification: 'Physical', cp: 1 }
      },
      {
        id: 'career_guild_perk',
        label: 'Vocational Guild Training',
        badge: 'Occupational Trait • 1 CP',
        suggestedName: 'Field Triage Protocol',
        prompt: 'Hard-earned professional habit, trade tool mastery, or hazard certification from years in a career field.',
        presetParams: { trait_type: 'Occupational Trait', classification: 'Technical', cp: 1 }
      },
      {
        id: 'archetype_signature',
        label: 'Archetype Signature Instinct',
        badge: 'Archetype Trait • 1 CP',
        suggestedName: 'Calculated Contingency',
        prompt: 'Core persona reflex that defines an Archetype’s role in crisis moments, social standoffs, or tactical breaches.',
        presetParams: { trait_type: 'Archetype Trait', classification: 'Mental', cp: 1 }
      },
      {
        id: 'faction_indoctrination',
        label: 'Faction Creed & Jurisdiction',
        badge: 'Faction Trait • 1 CP',
        suggestedName: 'Code of the Silver Star',
        prompt: 'Cultural conditioning, military doctrine, or legal authority bestowed upon operatives of a major polity or syndicate.',
        presetParams: { trait_type: 'Faction Trait', classification: 'Social', cp: 1 }
      },
      {
        id: 'underworld_edge',
        label: 'Streetwise / Black-Market Edge',
        badge: 'Origin/Career • 1 CP',
        suggestedName: 'Contraband Cache Network',
        prompt: 'Knows how to Fence goods at +10% margin, bypass customs scanners, or locate underground clinics in any port.',
        presetParams: { trait_type: 'Occupational Trait', classification: 'Social', cp: 1 }
      },
      {
        id: 'combat_drill',
        label: 'Regimental Combat Drill',
        badge: 'Faction/Career • 1 CP',
        suggestedName: 'Breach & Clear Discipline',
        prompt: 'Instinctive fireteam coordination granting +2 Initiative or bonus cover defense when fighting alongside allies.',
        presetParams: { trait_type: 'Faction Trait', classification: 'Combat', cp: 1 }
      }
    ],
    directivesLabel: '3. Pillar Context & 1-CP Mechanical Scope (Optional)',
    directivesPlaceholder: 'E.g., Keep strictly balanced to 1 CP scope (+2 situational skill bonus, minor social clearance, or once-per-scene tactical perk)...',
    quickDirectives: [
      'Balanced 1 CP Scope',
      '+2 Situational Skill Bonus',
      'Once-Per-Scene Perk',
      'Social / Legal Clearance',
      'Equipment / Tool Synergy'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. DISADVANTAGES MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  disadvantages: {
    id: 'disadvantages',
    synthesizerSubtitle: 'Synthesize flaw severity tier & CP rebate rules',
    conceptSectionLabel: '1. Hindrance, Vulnerability & Stigma Profile',
    nameField: {
      label: 'Disadvantage / Hindrance Name',
      placeholder: 'E.g., Cybernetic Rejection, Void Phobia, Debt to the Syndicate...'
    },
    parametersSectionLabel: '2. Flaw Category & CP Rebate Tier',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      {
        key: 'disadvantage_type',
        label: 'Disadvantage Classification',
        type: 'select',
        defaultValue: 'General Disadvantage',
        options: ['Species Disadvantage', 'General Disadvantage', 'Psychological', 'Physical', 'Social']
      },
      {
        key: 'refundCP',
        label: 'Base CP Rebate',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10
      },
      {
        key: 'cp_granted',
        label: 'Severity Rebate Ladder',
        type: 'select',
        defaultValue: '3 / 6 / 9',
        options: ['2 (Species Flaw)', '3 (Minor)', '3 / 6', '3 / 6 / 9', '6 (Moderate)', '9 (Severe)']
      }
    ],
    concepts: [
      {
        id: 'species_flaw',
        label: 'Inherent Species Vulnerability',
        badge: 'Species Flaw • -2 CP',
        suggestedName: 'Photophobic Optics',
        prompt: 'Biological or evolutionary species drawback such as light sensitivity, cold-blooded torpor, or specialized atmosphere dependency.',
        presetParams: { disadvantage_type: 'Species Disadvantage', refundCP: 2, cp_granted: '2 (Species Flaw)' }
      },
      {
        id: 'physical_impairment',
        label: 'Physical / Bio-Tech Limitation',
        badge: 'Physical • 3/6/9 CP',
        suggestedName: 'Neural Implant Rejection',
        prompt: 'Physiological condition, chronic injury, or immune rejection of cybernetics imposing concrete Fortitude or stat penalties.',
        presetParams: { disadvantage_type: 'Physical', refundCP: 3, cp_granted: '3 / 6 / 9' }
      },
      {
        id: 'psychological_compulsion',
        label: 'Psychological Compulsion / Phobia',
        badge: 'Psychological • Will Save',
        suggestedName: 'Hyper-Vigilant Paranoia',
        prompt: 'Deep-seated trauma, phobia, addiction, or rigid code of honor requiring Willpower saves (CR 15) under stress.',
        presetParams: { disadvantage_type: 'Psychological', refundCP: 3, cp_granted: '3 / 6 / 9' }
      },
      {
        id: 'social_hunted',
        label: 'Wanted / Syndicate Debt / Rival',
        badge: 'Social • Narrative Hook',
        suggestedName: 'Marked by the Tribunal',
        prompt: 'Active bounty, corporate debt, dark secret, or powerful nemesis that periodically complicates missions.',
        presetParams: { disadvantage_type: 'Social', refundCP: 3, cp_granted: '3 / 6 / 9' }
      },
      {
        id: 'meta_instability',
        label: 'Psionic Bleed / Resonance Susceptibility',
        badge: 'Meta Flaw • Strain Risk',
        suggestedName: 'Unshielded Psychic Empathy',
        prompt: 'Vulnerability to ambient psionic noise, dimensional anomalies, or increased overchannel burn.',
        presetParams: { disadvantage_type: 'Psychological', refundCP: 6, cp_granted: '3 / 6 / 9' }
      },
      {
        id: 'synthetic_glitch',
        label: 'Synthetic Directive Lock / Glitch',
        badge: 'Synthetic • Logic Constraint',
        suggestedName: 'Asimovian Hard-Code Restraint',
        prompt: 'Hardwired programming restriction, EMP vulnerability, or memory fragmentation affecting synthetic or cyborg operators.',
        presetParams: { disadvantage_type: 'Species Disadvantage', refundCP: 2, cp_granted: '2 (Species Flaw)' }
      }
    ],
    directivesLabel: '3. Penalty Mechanics, Save CRs & Buy-Off Conditions (Optional)',
    directivesPlaceholder: 'E.g., Detail Minor (3 CP), Moderate (6 CP), and Severe (9 CP) penalty scaling, Willpower/Fortitude save CRs, and how an Architect can trigger it...',
    quickDirectives: [
      'Minor / Mod / Severe Tiers',
      '-2 CP Species Flaw Balance',
      'Willpower Save CR 15 Trigger',
      'Negative Stat Modifiers',
      'Narrative Buy-Off Path'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. MODULAR CHARACTERS / NPC MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  'modular-characters': {
    id: 'modular-characters',
    synthesizerSubtitle: 'Synthesize NPC adversary statblock & combat AI',
    conceptSectionLabel: '1. Encounter Threat & Combat Role Template',
    nameField: {
      label: 'Operator / Adversary Designation',
      placeholder: 'E.g., Syndicate Ghost Infiltrator, Impyrium Purge-Captain...'
    },
    parametersSectionLabel: '2. Threat Tier, Combat Role & Chassis Multiplier',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      {
        key: 'competencyRole',
        label: 'Competency Role',
        type: 'select',
        defaultValue: 'Striker',
        options: ['Tank', 'Bruiser', 'Striker', 'Assassin', 'Sniper', 'Gunslinger', 'Blaster', 'Controller', 'Buffer', 'Healer', 'Commander', 'Summoner']
      },
      {
        key: 'bossType',
        label: 'Encounter Rank / Multiplier',
        type: 'select',
        defaultValue: 'Standard',
        options: ['Minion', 'Standard', 'Boss', 'Mastermind']
      },
      {
        key: 'threatTier',
        label: 'Threat Tier (1-20)',
        type: 'number',
        defaultValue: 4,
        min: 0,
        max: 20
      }
    ],
    concepts: [
      {
        id: 'frontline_enforcer',
        label: 'Armored Enforcer / Heavy Bruiser',
        badge: 'Tank/Bruiser • High DR',
        suggestedName: 'Coalition Shock-Breaker',
        prompt: 'Heavily armored frontline juggernaut wielding suppression weaponry, dermal plating, and high Stamina Toughness.',
        presetParams: { competencyRole: 'Tank', bossType: 'Standard', threatTier: 4, tl: 3, ml: 0 }
      },
      {
        id: 'covert_assassin',
        label: 'Black-Ops Assassin / Sniper',
        badge: 'Assassin • Crit Threat',
        suggestedName: 'Syndicate Zero-Pulse Operative',
        prompt: 'Stealth-cloaked killer utilizing monomolecular blades or silenced rail rifles to strike Vitality/Health directly.',
        presetParams: { competencyRole: 'Assassin', bossType: 'Standard', threatTier: 5, tl: 4, ml: 0 }
      },
      {
        id: 'squad_commander',
        label: 'Tactical Officer / Boss Commander',
        badge: 'Commander • Boss Rank',
        suggestedName: 'Impyrium Arch-Centurion',
        prompt: 'Battlefield leader who grants bonus actions and accuracy buffs to subordinate minions while calling orbital/drone support.',
        presetParams: { competencyRole: 'Commander', bossType: 'Boss', threatTier: 7, tl: 4, ml: 1 }
      },
      {
        id: 'psionic_controller',
        label: 'Awakened Psi-Warmaster',
        badge: 'Controller • High ML',
        suggestedName: 'Alterian Mind-Weaver',
        prompt: 'High-Meta adversary who dominates sightlines with telekinetic barriers, neural stun waves, and gravity anomalies.',
        presetParams: { competencyRole: 'Controller', bossType: 'Boss', threatTier: 8, tl: 3, ml: 3 }
      },
      {
        id: 'security_minion_squad',
        label: 'Patrol Drone / Security Minion',
        badge: 'Minion • Swarm Tactics',
        suggestedName: 'Automata Perimeter Sentry',
        prompt: 'Expendable synthetic sentry or corporate security trooper designed to operate in coordinated fireteams.',
        presetParams: { competencyRole: 'Gunslinger', bossType: 'Minion', threatTier: 2, tl: 3, ml: 0 }
      },
      {
        id: 'apex_xenomorph',
        label: 'Apex Xeno Beast / Monstrosity',
        badge: 'Bruiser • Bio-Horror',
        suggestedName: 'Abyssal Rift Stalker',
        prompt: 'Terrifying alien predator with acid blood, multi-limb rending attacks, and high structure/health pools.',
        presetParams: { competencyRole: 'Bruiser', bossType: 'Boss', threatTier: 6, tl: 0, ml: 1 }
      }
    ],
    directivesLabel: '3. Combat AI Routine, Signature Loadout & Loot Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify Round 1-3 tactical AI behaviors, primary weapon attack bonus & damage, Armor DR, passive save CRs, and salvageable loot...',
    quickDirectives: [
      'Round-by-Round Combat AI',
      'Include Weapon & Armor Loadout',
      'Boss Multi-Action Phase',
      'Synthetic SP / Immunity Rules',
      'Salvage & Bounty Drop Table'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. PLANETARY DESIGN MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  'planetary-design': {
    id: 'planetary-design',
    synthesizerSubtitle: 'Synthesize world profile, starport & hazard DCs',
    conceptSectionLabel: '1. Celestial & Planetary Biome Classification',
    nameField: {
      label: 'Planet / Celestial Body Name',
      placeholder: 'E.g., Valerius-9, Copia Prime, Acheron Rift Station...'
    },
    parametersSectionLabel: '2. Astrographical & Civilization Parameters',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      {
        key: 'planet_type',
        label: 'Celestial Classification',
        type: 'select',
        defaultValue: 'Terrestrial Bio-World',
        options: [
          'Terrestrial Bio-World',
          'Ecumenopolis (City Planet)',
          'Barren Wasteland',
          'Volcanic Forge World',
          'Ocean World / Aquatic Depths',
          'Ice Giant Sub-Surface',
          'Asteroid Mining Cluster',
          'Orbital Habitat Mega-Ring'
        ]
      },
      {
        key: 'starport',
        label: 'Starport Class',
        type: 'select',
        defaultValue: 'B',
        options: ['A', 'B', 'C', 'D', 'E', 'X']
      },
      {
        key: 'survey_dc',
        label: 'Survey / Hazard CR',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'ecumenopolis_core',
        label: 'Cyberpunk Ecumenopolis',
        badge: 'Class A Port • City World',
        suggestedName: 'Veridia Spire-Prime',
        prompt: 'Planet-spanning metropolis of multi-tiered arcologies, orbital elevators, neon smog canyons, and corporate syndicates.',
        presetParams: { planet_type: 'Ecumenopolis (City Planet)', starport: 'A', survey_dc: 15, tl: 4, ml: 1 }
      },
      {
        id: 'frontier_bioworld',
        label: 'Untamed Frontier Bio-World',
        badge: 'Class C Port • BioZone',
        suggestedName: 'Kaelis Verdant Reach',
        prompt: 'Lush, newly colonized biosphere of megafauna jungles, colonial timber/mineral towns, and ancient xeno ruins.',
        presetParams: { planet_type: 'Terrestrial Bio-World', starport: 'C', survey_dc: 20, tl: 3, ml: 1 }
      },
      {
        id: 'volcanic_forge',
        label: 'Tectonic / Volcanic Forge World',
        badge: 'Hazard CR 25 • Heavy Industry',
        suggestedName: 'Ignis-7 Magma Foundry',
        prompt: 'Tidally locked volcanic furnace world harvested by shielded magma-rigs for hyper-dense heavy metals.',
        presetParams: { planet_type: 'Volcanic Forge World', starport: 'B', survey_dc: 25, tl: 3, ml: 0 }
      },
      {
        id: 'sub_ice_ocean',
        label: 'Frozen Moon / Abyssal Ocean',
        badge: 'Class C Port • Cryo/Pelagic',
        suggestedName: 'Cryo-Vespera IV',
        prompt: 'Glacial crust hiding a warm geothermal subsurface ocean of bioluminescent leviathans and submerged research labs.',
        presetParams: { planet_type: 'Ice Giant Sub-Surface', starport: 'C', survey_dc: 22, tl: 3, ml: 1 }
      },
      {
        id: 'asteroid_belt_hub',
        label: 'Hollowed Asteroid Free-Port',
        badge: 'Class B Port • Low-G Hub',
        suggestedName: 'Ceres-Omega Drift',
        prompt: 'Sprawling cluster of spin-gravity mining asteroids, smuggler docks, and zero-G shipbreakers.',
        presetParams: { planet_type: 'Asteroid Mining Cluster', starport: 'B', survey_dc: 18, tl: 3, ml: 0 }
      },
      {
        id: 'quarantined_relic',
        label: 'Quarantined Precursor Anomaly',
        badge: 'Class X • High ML Hazard',
        suggestedName: 'Subject-Zero Singularity World',
        prompt: 'Interdicted dead world scarred by ancient singularity weapons, gravity storms, and dormant progenitor vaults.',
        presetParams: { planet_type: 'Barren Wasteland', starport: 'X', survey_dc: 32, tl: 5, ml: 4 }
      }
    ],
    directivesLabel: '3. Atmospheric Hazards, Settlements & Adventure Hooks (Optional)',
    directivesPlaceholder: 'E.g., Detail gravity/atmosphere requirements, major starports and settlements, controlling faction, environmental Fortitude save CRs, and plot hooks...',
    quickDirectives: [
      'Atmospheric Seal Requirements',
      '3 Major Settlements / Ports',
      'Indigenous Megafauna Hazard',
      'Precursor Ruin Hook',
      'Trade Export & Law Level'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. INVOCATION & PSIONICS MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  invocation: {
    id: 'invocation',
    synthesizerSubtitle: 'Synthesize psionic manifestation, focus & save CR',
    conceptSectionLabel: '1. Psionic Discipline & Manifestation Form',
    nameField: {
      label: 'Invocation / Power Name',
      placeholder: 'E.g., Quantum Warp Lance, Neural Synaptic Jammer...'
    },
    parametersSectionLabel: '2. Discipline, Envelope & Focus Expenditure',
    showTechLevel: false,
    showMetaLevel: true,
    defaultTl: 0,
    defaultMl: 2,
    parameters: [
      {
        key: 'discipline',
        label: 'Psionic Discipline',
        type: 'select',
        defaultValue: 'telekinesis',
        options: [
          'telekinesis',
          'telepathy',
          'pyrokinesis',
          'chronos',
          'biometabolism',
          'void_attunement',
          'cryo',
          'voltic',
          'spatial_distortion',
          'clairvoyance'
        ]
      },
      {
        key: 'range',
        label: 'Manifestation Range',
        type: 'select',
        defaultValue: 'Medium',
        options: ['Touch', 'Short', 'Medium', 'Long', 'Extreme']
      },
      {
        key: 'area',
        label: 'Spatial Area / Target',
        type: 'select',
        defaultValue: 'SingleTarget',
        options: ['SingleTarget', 'RadialBurst', 'Cone', 'Line', 'Aura']
      },
      {
        key: 'focus_cost',
        label: 'Focus Cost (FP)',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 15
      }
    ],
    concepts: [
      {
        id: 'kinetic_strike',
        label: 'Telekinetic Force / Crush',
        badge: 'Telekinesis • Force/Impact',
        suggestedName: 'Graviton Shear Lance',
        prompt: 'Focused vector of telekinetic force that hurls targets, shatters cover, or crushes armor plating.',
        presetParams: { discipline: 'telekinesis', range: 'Medium', area: 'SingleTarget', focus_cost: 2, ml: 2 }
      },
      {
        id: 'telepathic_assault',
        label: 'Telepathic Domination / Jamming',
        badge: 'Telepathy • Will Save',
        suggestedName: 'Synaptic Whiteout',
        prompt: 'Direct psychic intrusion that bypasses physical Armor DR to stun, read, or command organic minds.',
        presetParams: { discipline: 'telepathy', range: 'Medium', area: 'SingleTarget', focus_cost: 3, ml: 2 }
      },
      {
        id: 'thermal_plasma',
        label: 'Pyrokinetic / Voltic Surge',
        badge: 'Pyro/Voltic • Area Burst',
        suggestedName: 'Corona Arc Detonation',
        prompt: 'Excites atmospheric molecules into superheated plasma or electromagnetic lightning arcs across a blast radius.',
        presetParams: { discipline: 'pyrokinesis', range: 'Medium', area: 'RadialBurst', focus_cost: 3, ml: 3 }
      },
      {
        id: 'chrono_spatial',
        label: 'Chronos / Spatial Distortion',
        badge: 'Spatial/Chronos • Warp',
        suggestedName: 'Phase-Step Blink',
        prompt: 'Folds local spacetime to teleport the caster, dilate initiative reaction speed, or trap targets in stasis.',
        presetParams: { discipline: 'spatial_distortion', range: 'Short', area: 'SingleTarget', focus_cost: 4, ml: 3 }
      },
      {
        id: 'bio_mending',
        label: 'Biometabolic Cellular Surge',
        badge: 'Biometabolism • Heal/Buff',
        suggestedName: 'Adrenal Cellular Knit',
        prompt: 'Accelerates organic mitosis to suture lethal wounds, purge toxins, or boost physical attributes.',
        presetParams: { discipline: 'biometabolism', range: 'Touch', area: 'SingleTarget', focus_cost: 2, ml: 2 }
      },
      {
        id: 'void_entropy',
        label: 'Void Attunement / Singularity',
        badge: 'Void • High ML',
        suggestedName: 'Event Horizon Tether',
        prompt: 'Channels raw entropic void energy that drains thermal heat and warps light and matter.',
        presetParams: { discipline: 'void_attunement', range: 'Long', area: 'RadialBurst', focus_cost: 5, ml: 4 }
      }
    ],
    directivesLabel: '3. Manifestation Check, Save CR & Overchannel Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify 2d10 + Discipline Check CR, target Willpower/Fortitude/Reflex save, damage dice, Resonant Nat-20 surge, and Overchannel Burn...',
    quickDirectives: [
      'Include Save CR & Damage Dice',
      'Nat 20 Resonant Surge Effect',
      'Nat 2 Psychic Backlash',
      'Overchannel Burn (+2 HP/pt)',
      'Bypasses Physical Armor DR'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. META-TECH MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  'meta-tech': {
    id: 'meta-tech',
    synthesizerSubtitle: 'Synthesize psi-resonant artifact & socket imbuement',
    conceptSectionLabel: '1. Anomalous Artifact & Imbuement Paradigm',
    nameField: {
      label: 'Meta-Tech Device / Artifact Name',
      placeholder: 'E.g., Chrono-Harmonic Resonance Engine, Aether-Core Glaive...'
    },
    parametersSectionLabel: '2. Enhancement Architecture, Scale & Attunement DC',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 4,
    defaultMl: 2,
    parameters: [
      {
        key: 'enhancement_type',
        label: 'Enhancement Architecture',
        type: 'select',
        defaultValue: 'Active',
        options: ['Active', 'Passive', 'Consumable', 'Amplifier']
      },
      {
        key: 'scale_tier',
        label: 'Scale Tier',
        type: 'select',
        defaultValue: 'Personal',
        options: ['Personal', 'Vehicular', 'Structural']
      },
      {
        key: 'sockets_used',
        label: 'Sockets Consumed (1-3+)',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 10
      },
      {
        key: 'craft_dc',
        label: 'Attunement / Craft DC',
        type: 'number',
        defaultValue: 25,
        min: 10,
        max: 70
      }
    ],
    concepts: [
      {
        id: 'psi_amplifier',
        label: 'Crystalline Psi-Amplifier',
        badge: 'Amplifier • Focus Boost',
        suggestedName: 'Aetherite Neural Crown',
        prompt: 'Harmonic resonance focus that reduces Focus Point costs and amplifies manifestation range and potency.',
        presetParams: { enhancement_type: 'Amplifier', scale_tier: 'Personal', sockets_used: 1, craft_dc: 24, tl: 4, ml: 2 }
      },
      {
        id: 'phase_shifter',
        label: 'Dimensional Phase Shifter',
        badge: 'Active • Blink/Cloak',
        suggestedName: 'Void-Fold Displacement Belt',
        prompt: 'Wearable singularity capacitor that briefly shifts the operator out of standard spacetime to evade strikes.',
        presetParams: { enhancement_type: 'Active', scale_tier: 'Personal', sockets_used: 2, craft_dc: 28, tl: 4, ml: 3 }
      },
      {
        id: 'imbued_weapon_core',
        label: 'Resonant Weapon Imbuement',
        badge: 'Socket Mod • Psi-Blade',
        suggestedName: 'Entropic Edge Harmonic Core',
        prompt: 'Socketed meta-tech core that imbues melee or ranged strikes with psionic resonance or dimensional shear.',
        presetParams: { enhancement_type: 'Passive', scale_tier: 'Personal', sockets_used: 1, craft_dc: 22, tl: 3, ml: 2 }
      },
      {
        id: 'precursor_relic',
        label: 'Ancient Progenitor Relic',
        badge: 'Artifact • TL 5 / ML 4',
        suggestedName: 'Progenitor Chronos Monolith',
        prompt: 'Recovered non-human artifact operating on incomprehensible quantum-aetheric laws with immense power and instability.',
        presetParams: { enhancement_type: 'Active', scale_tier: 'Personal', sockets_used: 3, craft_dc: 40, tl: 5, ml: 4 }
      },
      {
        id: 'void_battery',
        label: 'Aetheric Capacitor / Consumable',
        badge: 'Consumable • Essence Cell',
        suggestedName: 'Stabilized Leyline Vial',
        prompt: 'Single-use or rechargeable containment cell holding distilled metaphysical energy to restore Focus in combat.',
        presetParams: { enhancement_type: 'Consumable', scale_tier: 'Personal', sockets_used: 1, craft_dc: 18, tl: 3, ml: 2 }
      },
      {
        id: 'ship_meta_drive',
        label: 'Vehicular / Structural Warp Core',
        badge: 'Structural • Module Scale',
        suggestedName: 'Null-Space Siphon Array',
        prompt: 'Massive meta-tech field generator designed for starships, mecha, or planetary sanctums.',
        presetParams: { enhancement_type: 'Active', scale_tier: 'Structural', sockets_used: 4, craft_dc: 36, tl: 4, ml: 3 }
      }
    ],
    directivesLabel: '3. Imbuement Rank Cap, Activation & Backlash Directives (Optional)',
    directivesPlaceholder: 'E.g., Follow UDU Socket Rank caps (1 Socket = Rank 10, 2 Sockets = Rank 20, 3+ = Rank 30), daily charges, and harmonic backlash rules...',
    quickDirectives: [
      'Socket Rank Cap Compliance',
      'Daily Charges / Focus Cost',
      'Harmonic Backlash on Nat 2',
      'TSC Market Valuation',
      'Precursor Lore Provenance'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 15. ARCHITECTURE MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  architecture: {
    id: 'architecture',
    synthesizerSubtitle: 'Synthesize real property structure & module grid',
    conceptSectionLabel: '1. Structural & Facility Blueprint Style',
    nameField: {
      label: 'Structure / Blueprint Name',
      placeholder: 'E.g., Aegis Spire Orbital Station, Frontier Mudskipper Outpost...'
    },
    parametersSectionLabel: '2. Footprint, Frame Configuration & Cultural Skin',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'footprint',
        label: 'Scale & Footprint',
        type: 'select',
        defaultValue: 'Large',
        options: ['Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic']
      },
      {
        key: 'frame_type',
        label: 'Frame Configuration',
        type: 'select',
        defaultValue: 'Standard',
        options: ['Standard', 'Industrial', 'Elevated', 'Tower', 'Subterranean', 'Biomimetic', 'Dynamic', 'Palatial']
      },
      {
        key: 'faction_skin',
        label: 'Cultural Skin / Paradigm',
        type: 'select',
        defaultValue: 'Coalition',
        options: ['Coalition', 'Syndicate', 'Impyrium', 'Dracon', 'Ascendancy', 'Alterian', 'Auluran', 'Mekan', 'Entari']
      },
      {
        key: 'craft_dc',
        label: 'Architecture CR / DC',
        type: 'number',
        defaultValue: 22,
        min: 10,
        max: 80
      }
    ],
    concepts: [
      {
        id: 'frontier_outpost',
        label: 'Frontier Drop-Outpost',
        badge: 'Medium • Prefab Bunker',
        suggestedName: 'Mudskipper Colonial Redoubt',
        prompt: 'Air-droppable plasteel hab-module with airlock, comms array, and emergency life support for hostile worlds.',
        presetParams: { footprint: 'Medium', frame_type: 'Industrial', faction_skin: 'Coalition', craft_dc: 16, tl: 3, ml: 0 }
      },
      {
        id: 'tactical_fortress',
        label: 'Forward Command Citadel',
        badge: 'Gargantuan • Military Bastion',
        suggestedName: 'Bastion-IX Orbital Drop Fortress',
        prompt: 'Heavily reinforced military command bunker with deflector screens, point-defense turrets, barracks, and fusion core.',
        presetParams: { footprint: 'Gargantuan', frame_type: 'Standard', faction_skin: 'Impyrium', craft_dc: 32, tl: 3, ml: 0 }
      },
      {
        id: 'syndicate_penthouse',
        label: 'Syndicate Sky-Spire / Safe House',
        badge: 'Huge • High Security',
        suggestedName: 'Apex Nanocarbon Penthouse Vault',
        prompt: 'Floating luxury executive suite or covert black-site with quantum-encrypted vaults, holodecks, and drone bays.',
        presetParams: { footprint: 'Huge', frame_type: 'Palatial', faction_skin: 'Syndicate', craft_dc: 30, tl: 4, ml: 0 }
      },
      {
        id: 'mobile_crawler_base',
        label: 'Mobile Crawler Base',
        badge: 'Large • Tracked/Hover',
        suggestedName: 'Sand-Skimmer Nomad Refinery',
        prompt: 'Self-propelled mobile industrial base that crawls across wasteland sectors following mineral veins.',
        presetParams: { footprint: 'Large', frame_type: 'Industrial', faction_skin: 'Coalition', craft_dc: 24, tl: 3, ml: 0 }
      },
      {
        id: 'subterranean_lab',
        label: 'Subterranean Black-Site Lab',
        badge: 'Huge • Quarantine Tier',
        suggestedName: 'Deep-Core Xenobiology Vault',
        prompt: 'Buried research facility shielded by bedrock with bio-containment wings, server farms, and geothermal power.',
        presetParams: { footprint: 'Huge', frame_type: 'Subterranean', faction_skin: 'Ascendancy', craft_dc: 28, tl: 4, ml: 1 }
      },
      {
        id: 'orbital_arcology',
        label: 'Orbital Station / Arcology Hub',
        badge: 'Colossal • Zero-G Port',
        suggestedName: 'Aegis Ring Docking Spindle',
        prompt: 'Sprawling orbital habitat with hangar bays, hydroponic rings, antimatter reactor grid, and customs bulkheads.',
        presetParams: { footprint: 'Colossal', frame_type: 'Tower', faction_skin: 'Syndicate', craft_dc: 45, tl: 4, ml: 1 }
      }
    ],
    directivesLabel: '3. Modules, Power Grid, Defenses & Construction Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify installed UDU Modules (Command Center, Hangar, Med-Bay), Structural Durability (SP), wall DR, security clearance, and TSC cost...',
    quickDirectives: [
      'Include Module Loadout',
      'Wall DR & Structure Points',
      'Power Grid & Security Tier',
      'Point-Defense Turrets',
      'TSC Construction Valuation'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 16. ARMOR MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  armor: {
    id: 'armor',
    synthesizerSubtitle: 'Synthesize defensive rig, DR coverage & seals',
    conceptSectionLabel: '1. Defensive Suit & Protection Doctrine',
    nameField: {
      label: 'Armor / Suit Designation',
      placeholder: 'E.g., Apex Heavy Carapace Exosuit, Spectre Stealth Mesh...'
    },
    parametersSectionLabel: '2. Weight Class, Coverage & Crafting Parameters',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'size',
        label: 'Armor Weight Class',
        type: 'select',
        defaultValue: 'Mediumweight',
        options: ['Lightweight', 'Mediumweight', 'Heavyweight', 'Superheavy']
      },
      {
        key: 'coverage',
        label: 'Coverage Envelope',
        type: 'select',
        defaultValue: 'Standard',
        options: ['Light / Vest', 'Standard', 'Full Environmental Seal', 'Powered Exoskeleton']
      },
      {
        key: 'quality',
        label: 'Crafting Quality',
        type: 'select',
        defaultValue: 'Standard',
        options: ['Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted']
      },
      {
        key: 'craft_dc',
        label: 'Armor Craft CR / DC',
        type: 'number',
        defaultValue: 18,
        min: 5,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'stealth_infiltration_suit',
        label: 'Stealth Infiltration Bodysuit',
        badge: 'Lightweight • Chameleon',
        suggestedName: 'Spectre-IV Photo-Reactive Bodysuit',
        prompt: 'Form-fitting ballistic weave with thermal baffling, active optical camouflage, and zero mobility penalty.',
        presetParams: { size: 'Lightweight', coverage: 'Standard', quality: 'Good', craft_dc: 18, tl: 4, ml: 0 }
      },
      {
        id: 'tactical_combat_rig',
        label: 'Frontline Combat Carapace',
        badge: 'Mediumweight • Balanced DR',
        suggestedName: 'Vanguard Mk-III Plasteel Rig',
        prompt: 'Standardized military torso and limb plating with trauma-gel underlayer, HUD helmet, and modular webbing.',
        presetParams: { size: 'Mediumweight', coverage: 'Standard', quality: 'Standard', craft_dc: 16, tl: 3, ml: 0 }
      },
      {
        id: 'powered_juggernaut',
        label: 'Heavy Powered Exosuit',
        badge: 'Heavyweight • Servo-Assist',
        suggestedName: 'Titan-Frame Assault Exosuit',
        prompt: 'Hydraulic or myomer-actuated heavy plate armor granting high Damage Reduction (DR), magnetic boots, and strength assist.',
        presetParams: { size: 'Heavyweight', coverage: 'Powered Exoskeleton', quality: 'Good', craft_dc: 25, tl: 4, ml: 0 }
      },
      {
        id: 'eva_hazard_rig',
        label: 'Void / Hazard Survival Suit',
        badge: 'Class III Seal • Vacuum/Rad',
        suggestedName: 'Deep-Void EVA Hardsuit',
        prompt: 'Hermetically sealed survival armor with 12-hour rebreather, radiation shielding, and micro-thruster pack.',
        presetParams: { size: 'Mediumweight', coverage: 'Full Environmental Seal', quality: 'Standard', craft_dc: 18, tl: 3, ml: 0 }
      },
      {
        id: 'undercover_weave',
        label: 'Executive Synth-Silk Attire',
        badge: 'Concealed • High Society',
        suggestedName: 'Syndicate Diplomatic Tailored Weave',
        prompt: 'Bespoke high-fashion corporate attire lined with shear-thickening nanocarbon fibers for discreet protection.',
        presetParams: { size: 'Lightweight', coverage: 'Light / Vest', quality: 'Exceptional', craft_dc: 20, tl: 4, ml: 0 }
      },
      {
        id: 'psionic_shroud',
        label: 'Meta-Attuned Aegis Regalia',
        badge: 'Psi-Ward • High ML',
        suggestedName: 'Alterian Null-Weave Mantle',
        prompt: 'Ceremonial armor woven with aetherite filaments that dampens telepathic intrusion and projects a kinetic ward.',
        presetParams: { size: 'Mediumweight', coverage: 'Standard', quality: 'Exceptional', craft_dc: 24, tl: 4, ml: 2 }
      }
    ],
    directivesLabel: '3. Damage Reduction (DR), Hit Locations & Socket Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify base DR rating, Structure Points (SP), covered hit locations (Head/Torso/Arms/Legs), environmental seal class, and installed socket mods...',
    quickDirectives: [
      'Specify DR & SP Ratings',
      'Class III Vacuum / Rad Seal',
      'Zero Agility Penalty',
      'Integrated HUD & Bio-Monitor',
      'Deflector Shield Socket Mod'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 17. AUGMENTATIONS MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  augmentations: {
    id: 'augmentations',
    synthesizerSubtitle: 'Synthesize cyberware node implant & surgical DC',
    conceptSectionLabel: '1. Cybernetic & Bioware Implant Paradigm',
    nameField: {
      label: 'Augmentation / Implant Name',
      placeholder: 'E.g., Reflex Velocity Coprocessor, Subdermal Plasteel Mesh...'
    },
    parametersSectionLabel: '2. Implant Category, Anatomical Slot & Node Load',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'category',
        label: 'Augmentation Category',
        type: 'select',
        defaultValue: 'body_mod',
        options: [
          'brain',
          'sensory',
          'body_mod',
          'synth_limb',
          'limb_upgrade',
          'hand_foot',
          'exotic_limb',
          'tl4_bioware',
          'tl5_nanotech',
          'fbc',
          'meta_aug',
          'fashionware'
        ]
      },
      {
        key: 'location',
        label: 'Anatomical Slot',
        type: 'select',
        defaultValue: 'Torso',
        options: ['Head', 'Torso', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg', 'Systemic']
      },
      {
        key: 'nodes_consumed',
        label: 'UDU Nodes (200 Body Max)',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 200
      },
      {
        key: 'craft_dc',
        label: 'Surgical / Design DC',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'neural_coprocessor',
        label: 'Neural Reflex / Smartlink Core',
        badge: 'Brain • Initiative/Aim',
        suggestedName: 'Synapse-IX Reflex Accelerant',
        prompt: 'Cranial coprocessor that bridges weapon smartlinks, accelerates reaction speed, and indexes tactical telemetry.',
        presetParams: { category: 'brain', location: 'Head', nodes_consumed: 10, craft_dc: 22, tl: 4, ml: 0 }
      },
      {
        id: 'ocular_sensory',
        label: 'Multi-Spectral Cybereyes / Audio',
        badge: 'Sensory • Thermal/Zoom',
        suggestedName: 'Hawkeye Multi-Band Ocular Suite',
        prompt: 'Synthetic optics granting thermal imaging, target rangefinding, flash compensation, and microscopic zoom.',
        presetParams: { category: 'sensory', location: 'Head', nodes_consumed: 5, craft_dc: 18, tl: 3, ml: 0 }
      },
      {
        id: 'cyber_limb',
        label: 'Myomer Prosthetic Cyberlimb',
        badge: 'Synth Limb • Hardpoints',
        suggestedName: 'Goliath Hydraulic Arm Replacement',
        prompt: 'High-durability synthetic limb with reinforced myomer strength, concealed weapon bay, and tool sockets.',
        presetParams: { category: 'synth_limb', location: 'RightArm', nodes_consumed: 20, craft_dc: 20, tl: 3, ml: 0 }
      },
      {
        id: 'bioware_organ',
        label: 'Cultured Bioware Enhancement',
        badge: 'TL 4 Bioware • Low Node',
        suggestedName: 'Supra-Adrenal Symbiote Gland',
        prompt: 'Cloned organic enhancement that boosts stamina, filters blood toxins, or surges adrenaline without metallic signatures.',
        presetParams: { category: 'tl4_bioware', location: 'Torso', nodes_consumed: 8, craft_dc: 25, tl: 4, ml: 0 }
      },
      {
        id: 'nanite_hive',
        label: 'Subdermal Nanite Repair Hive',
        badge: 'TL 5 Nanotech • Systemic',
        suggestedName: 'Lazarus Medical Nanite Colony',
        prompt: 'Programmable bloodstream nanites that automatically suture internal bleeding and purge radiation.',
        presetParams: { category: 'tl5_nanotech', location: 'Systemic', nodes_consumed: 15, craft_dc: 32, tl: 5, ml: 0 }
      },
      {
        id: 'full_body_conversion',
        label: 'Full-Body Cyborg Chassis (FBC)',
        badge: 'FBC • >50% Severe Tier',
        suggestedName: 'Aegis Dragoon Full-Conversion Frame',
        prompt: 'Total brain-case transplantation into an armored military or industrial synthetic body operating on Structure Points.',
        presetParams: { category: 'fbc', location: 'Systemic', nodes_consumed: 120, craft_dc: 35, tl: 4, ml: 0 }
      }
    ],
    directivesLabel: '3. Node Displacement, Bio-Tolerance & Combat Mechanics (Optional)',
    directivesPlaceholder: 'E.g., Specify UDU Node displacement (out of 200 humanoid nodes), CP bio-tolerance cost, surgical installation CR, and active/passive stat modifiers...',
    quickDirectives: [
      'UDU 10:1 Node Math',
      'Include Attribute/Skill Bonus',
      'Concealed Weapon Socket',
      'Zero EMP Vulnerability Mod',
      'Surgical Installation CR'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 18. EQUIPMENT & GEAR MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  equipment: {
    id: 'equipment',
    synthesizerSubtitle: 'Synthesize tactical gear, utility & TSC value',
    conceptSectionLabel: '1. Field Utility & Hardware Classification',
    nameField: {
      label: 'Equipment / Gear Designation',
      placeholder: 'E.g., Omnidirectional Spectral Scanner, Trauma Med-Injector...'
    },
    parametersSectionLabel: '2. Gear Category, Portability & Crafting CR',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'category',
        label: 'Gear Category',
        type: 'select',
        defaultValue: 'Electronics',
        options: [
          'Electronics',
          'Medical & Pharma',
          'Surveillance & Recon',
          'Survival & Environmental',
          'Tactical Utility',
          'Data & Infiltration',
          'Maintenance & Tools'
        ]
      },
      {
        key: 'workspace_scale',
        label: 'Portability / Scale',
        type: 'select',
        defaultValue: 'Belt',
        options: ['Pocket', 'Belt', 'Handheld', 'Backpack / Rig', 'Field Station']
      },
      {
        key: 'availability',
        label: 'Market Availability',
        type: 'select',
        defaultValue: 'Common',
        options: ['Everywhere', 'Common', 'Uncommon', 'Rare', 'Restricted / Military', 'Black Market Only']
      },
      {
        key: 'craft_dc',
        label: 'Crafting CR / DC',
        type: 'number',
        defaultValue: 15,
        min: 5,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'cyberdeck_slicer',
        label: 'Cyberdeck & EW Intrusion Rig',
        badge: 'Data/Infiltration • PR 1-5',
        suggestedName: 'Onyx-IV Quantum Slicer Deck',
        prompt: 'Hardened portable computing deck with ICE-breaker firmware, signal spoofing, and neural jack interface.',
        presetParams: { category: 'Data & Infiltration', workspace_scale: 'Handheld', availability: 'Restricted / Military', craft_dc: 22, tl: 4, ml: 0 }
      },
      {
        id: 'field_medkit',
        label: 'Trauma Med-Injector & Bio-Foam',
        badge: 'Medical • HP/VP Restore',
        suggestedName: 'Valkyrie Auto-Suture Trauma Kit',
        prompt: 'Pressurized battlefield medical kit that stabilizes bleeding operators and accelerates Vitality/Health recovery.',
        presetParams: { category: 'Medical & Pharma', workspace_scale: 'Belt', availability: 'Common', craft_dc: 15, tl: 3, ml: 0 }
      },
      {
        id: 'recon_sensor',
        label: 'Multi-Spectral Scanner / Drone',
        badge: 'Surveillance • +Alertness',
        suggestedName: 'Argus Micro-Reconnaissance Orb',
        prompt: 'Hovering micro-sensor or handheld auspex that maps life signs, radiation leaks, and hidden energy signatures.',
        presetParams: { category: 'Surveillance & Recon', workspace_scale: 'Handheld', availability: 'Uncommon', craft_dc: 18, tl: 3, ml: 0 }
      },
      {
        id: 'tactical_mobility',
        label: 'Grapple / Repulsor Utility Gear',
        badge: 'Tactical Utility • Traversal',
        suggestedName: 'Mag-Tether Repulsor Winch',
        prompt: 'Wrist or belt-mounted traversal device for scaling sheer arcology walls, zero-G anchoring, or controlled descents.',
        presetParams: { category: 'Tactical Utility', workspace_scale: 'Belt', availability: 'Common', craft_dc: 14, tl: 3, ml: 0 }
      },
      {
        id: 'engineering_rig',
        label: 'Fabrication & Salvage Toolset',
        badge: 'Maintenance • Crafting Multiplier',
        suggestedName: 'Omni-Torch Field Fabrication Rig',
        prompt: 'Plasma micro-welder, diagnostic multimeter, and molecular printer for field repairs and salvaging scrap.',
        presetParams: { category: 'Maintenance & Tools', workspace_scale: 'Backpack / Rig', availability: 'Common', craft_dc: 16, tl: 3, ml: 0 }
      },
      {
        id: 'survival_shelter',
        label: 'Frontier Survival & Hab Kit',
        badge: 'Survival • Hazard Defense',
        suggestedName: 'Atmo-Scrubber Emergency Hab-Dome',
        prompt: 'Deployable pressurized shelter, water purifier, and ration synthesizer for hostile planetary expeditions.',
        presetParams: { category: 'Survival & Environmental', workspace_scale: 'Backpack / Rig', availability: 'Common', craft_dc: 15, tl: 3, ml: 0 }
      }
    ],
    directivesLabel: '3. Skill Bonuses, Battery/Supply Die & Socket Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify skill check bonus (+1 to +4), Computer Processing Rating (PR 1-5), battery duration or Supply Die, and UDU Socket capacity...',
    quickDirectives: [
      '+2 Skill Check Modifier',
      'Include Computer PR Rating',
      'Supply Die / Charge Rules',
      'TSC Market Value Alignment',
      'Modular Socket Upgrades'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 19. MECHA & VEHICLES MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  mecha: {
    id: 'mecha',
    synthesizerSubtitle: 'Synthesize vehicular/walker frame & hardpoints',
    conceptSectionLabel: '1. Vehicular & Combat Walker Chassis Concept',
    nameField: {
      label: 'Mecha / Vehicle Designation',
      placeholder: 'E.g., Vanguard Mk-VI Stryker Frame, Rust-Devil Gunship...'
    },
    parametersSectionLabel: '2. Operational Domain, Scale & Frame Configuration',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'domain',
        label: 'Operational Domain',
        type: 'select',
        defaultValue: 'Power Armor & Walkers',
        options: [
          'Power Armor & Walkers',
          'Military Ground',
          'Aircraft & Atmospheric',
          'Spacecraft & Interstellar',
          'Personal Mobility',
          'Utility & Industrial',
          'Watercraft & Submersible'
        ]
      },
      {
        key: 'size',
        label: 'Chassis Size Category',
        type: 'select',
        defaultValue: 'Large',
        options: ['Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic']
      },
      {
        key: 'frame',
        label: 'Body Frame Configuration',
        type: 'select',
        defaultValue: 'Humanoid',
        options: ['Humanoid', 'Walker', 'Industrial', 'Winged', 'Platform', 'Creature', 'Racing', 'Personal']
      },
      {
        key: 'craft_dc',
        label: 'Fabrication CR / DC',
        type: 'number',
        defaultValue: 30,
        min: 10,
        max: 80
      }
    ],
    concepts: [
      {
        id: 'bipedal_striker_mech',
        label: 'Agile Bipedal Strike Mecha',
        badge: 'Large/Huge • Humanoid Walker',
        suggestedName: 'Valkyrie-VII Jump-Stryker',
        prompt: 'High-mobility myomer bipedal combat walker equipped with jump thrusters, neural pilot couch, and modular weapon mounts.',
        presetParams: { domain: 'Power Armor & Walkers', size: 'Huge', frame: 'Humanoid', craft_dc: 32, tl: 4, ml: 0 }
      },
      {
        id: 'heavy_siege_titan',
        label: 'Quad-Legged Siege Titan',
        badge: 'Gargantuan • Heavy Artillery',
        suggestedName: 'Behemoth Rail-Siege Walker',
        prompt: 'Heavily armored multi-legged artillery platform with anchoring stabilizers, deflector screens, and spinal mass driver.',
        presetParams: { domain: 'Military Ground', size: 'Gargantuan', frame: 'Walker', craft_dc: 38, tl: 3, ml: 0 }
      },
      {
        id: 'orbital_dropship',
        label: 'VTOL Gunship / Orbital Dropship',
        badge: 'Huge • Atmospheric/Void',
        suggestedName: 'Talon-IX Armored Dropship',
        prompt: 'Trans-atmospheric assault transport capable of hot-dropping a full operator squad with nose-mounted rotary cannons.',
        presetParams: { domain: 'Aircraft & Atmospheric', size: 'Huge', frame: 'Winged', craft_dc: 30, tl: 3, ml: 0 }
      },
      {
        id: 'interstellar_corvette',
        label: 'Fast Interstellar Corvette / Freighter',
        badge: 'Colossal • Starship',
        suggestedName: 'Outrider-Class Blockade Runner',
        prompt: 'Long-range void vessel with hyperdrive core, point-defense turrets, smuggling holds, and crew quarters.',
        presetParams: { domain: 'Spacecraft & Interstellar', size: 'Colossal', frame: 'Platform', craft_dc: 45, tl: 4, ml: 0 }
      },
      {
        id: 'grav_interceptor_bike',
        label: 'Grav-Bike / Outrider Skimmer',
        badge: 'Medium/Large • High Speed',
        suggestedName: 'Viper Twin-Turbine Grav-Cycle',
        prompt: 'Ultra-fast personal repulsor bike used by frontier marshals and syndicate couriers for high-speed pursuits.',
        presetParams: { domain: 'Personal Mobility', size: 'Large', frame: 'Racing', craft_dc: 20, tl: 3, ml: 0 }
      },
      {
        id: 'industrial_exo_loader',
        label: 'Heavy Industrial Exo-Loader',
        badge: 'Large • Salvage/Mining',
        suggestedName: 'Goliath Plasma-Cutter Rig',
        prompt: 'Rugged industrial walker retrofitted with hydraulic claws, ore drills, and improvised armor plating.',
        presetParams: { domain: 'Utility & Industrial', size: 'Large', frame: 'Industrial', craft_dc: 24, tl: 3, ml: 0 }
      }
    ],
    directivesLabel: '3. Hull Structure Points (SP), Propulsion & Hardpoint Mounts (Optional)',
    directivesPlaceholder: 'E.g., Specify pre-calculated Hull SP (200-3,200), Armor DR, Tactical Speed (ft/rnd), UDU Mount slots, and mounted weapon systems...',
    quickDirectives: [
      'Pre-Calculated Hull SP & DR',
      'Hardpoint Mount Loadout',
      'Pilot Neural Uplink Bonus',
      'VFT / Jump Jet Thrusters',
      'Automata AI Co-Pilot PR'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 20. WEAPONRY MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  weaponry: {
    id: 'weaponry',
    synthesizerSubtitle: 'Synthesize armament damage, penetration & sockets',
    conceptSectionLabel: '1. Tactical Armament & Firing Concept',
    nameField: {
      label: 'Weapon / Model Designation',
      placeholder: 'E.g., ARC-9 Plasma Burst Carbine, Mk-IV Mag-Rail Pistol...'
    },
    parametersSectionLabel: '2. Combat Skill, Wielding & Damage Classification',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      {
        key: 'skill',
        label: 'Associated Combat Skill',
        type: 'select',
        defaultValue: 'Small Arms',
        options: ['Small Arms', 'Heavy Weapons', 'Energy Weapons', 'Melee Weapons', 'Exotic Weapons', 'Gunnery']
      },
      {
        key: 'wielding',
        label: 'Wielding Configuration',
        type: 'select',
        defaultValue: 'Two-Handed',
        options: ['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted / Heavy Tripod']
      },
      {
        key: 'type',
        label: 'Damage / Energy Type',
        type: 'select',
        defaultValue: 'Kinetic',
        options: ['Kinetic', 'Plasma', 'Laser / Energy', 'Voltic / Ion', 'Sonic', 'Cryo', 'Monofilament Melee']
      },
      {
        key: 'craft_dc',
        label: 'Crafting CR / DC',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'military_ballistic',
        label: 'Military Mag-Rail / Ballistic',
        badge: 'Kinetic • High Penetration',
        suggestedName: 'M42 Coalition Mag-Rifle',
        prompt: 'Durable electromagnetic or caseless frontline firearm with high Armor Penetration and reliable burst fire.',
        presetParams: { skill: 'Small Arms', wielding: 'Two-Handed', type: 'Kinetic', craft_dc: 18, tl: 3, ml: 0 }
      },
      {
        id: 'covert_suppressed',
        label: 'Covert Infiltration Sidearm',
        badge: 'One-Handed • Stealth/Crit',
        suggestedName: 'Whisper-9 Subsonic Needle Pistol',
        prompt: 'Lightweight, whisper-quiet assassin weapon with expanded critical threat range (19-20) and low signature.',
        presetParams: { skill: 'Small Arms', wielding: 'One-Handed', type: 'Kinetic', craft_dc: 20, tl: 3, ml: 0 }
      },
      {
        id: 'plasma_thermal',
        label: 'Superheated Plasma / Melta',
        badge: 'Energy • Lingering Burn',
        suggestedName: 'Helios-V Plasma Arc Carbine',
        prompt: 'High-energy weapon firing ionized plasma bolts that melt composite armor and inflict lingering thermal damage.',
        presetParams: { skill: 'Energy Weapons', wielding: 'Two-Handed', type: 'Plasma', craft_dc: 22, tl: 4, ml: 0 }
      },
      {
        id: 'monofilament_melee',
        label: 'Vibro / Monofilament Blade',
        badge: 'Melee • Armor Shearing',
        suggestedName: 'Dracon High-Frequency Vibro-Glaive',
        prompt: 'Ultrasonic oscillating or plasma-edged melee weapon that slices through heavy carapace plating.',
        presetParams: { skill: 'Melee Weapons', wielding: 'Versatile', type: 'Monofilament Melee', craft_dc: 20, tl: 3, ml: 0 }
      },
      {
        id: 'heavy_ordnance',
        label: 'Squad Support Heavy Cannon',
        badge: 'Heavy Weapons • Suppression',
        suggestedName: 'Vulcan-X Rotary Gauss Autocannon',
        prompt: 'Gyrostabilized heavy ordnance delivering devastating area suppression and anti-mecha Armor Penetration.',
        presetParams: { skill: 'Heavy Weapons', wielding: 'Mounted / Heavy Tripod', type: 'Kinetic', craft_dc: 26, tl: 3, ml: 0 }
      },
      {
        id: 'singularity_exotic',
        label: 'Singularity / Psi-Resonant Prototype',
        badge: 'Exotic • Bypass DR',
        suggestedName: 'Null-Wave Harmonic Disruptor',
        prompt: 'Experimental prototype discharging sonic, gravimetric, or psionic waves that bypass standard physical Armor DR.',
        presetParams: { skill: 'Exotic Weapons', wielding: 'Two-Handed', type: 'Sonic', craft_dc: 30, tl: 5, ml: 2 }
      }
    ],
    directivesLabel: '3. Damage Dice, Penetration, Range & Socket Directives (Optional)',
    directivesPlaceholder: 'E.g., Prioritize high Armor Penetration (Penetration 4), 19-20 Critical Threat range, Burst/Auto firing modes, and 4 UDU attachment sockets...',
    quickDirectives: [
      'High Armor Penetration',
      'Expanded 19-20 Crit Range',
      'Burst & Full-Auto Modes',
      'Smartlink Optic Included',
      'Sonic/Psionic DR Bypass'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 21. OTHER PROPERTY & COMMODITIES MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  other: {
    id: 'other',
    synthesizerSubtitle: 'Synthesize commodity, trade good & UDU volume',
    conceptSectionLabel: '1. Commodity, Relic & Trade Good Classification',
    nameField: {
      label: 'Property / Commodity Name',
      placeholder: 'E.g., Refined Aetherite Ingot, Emergency Scrubbing Canister...'
    },
    parametersSectionLabel: '2. Property Classification, Availability & Valuation DC',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 2,
    defaultMl: 0,
    parameters: [
      {
        key: 'category',
        label: 'Property Classification',
        type: 'select',
        defaultValue: 'Commodities',
        options: ['Commodities', 'Trade Goods', 'Consumables', 'Field Sundries', 'Raw Materials', 'Valuables & Relics', 'Miscellaneous']
      },
      {
        key: 'availability',
        label: 'Market Availability',
        type: 'select',
        defaultValue: 'Common',
        options: ['Everywhere', 'Common', 'Uncommon', 'Rare', 'Restricted / Military', 'Black Market Only']
      },
      {
        key: 'craft_dc',
        label: 'Valuation / Craft DC',
        type: 'number',
        defaultValue: 12,
        min: 0,
        max: 60
      }
    ],
    concepts: [
      {
        id: 'exotic_mineral',
        label: 'Strategic Raw Material / Ore',
        badge: 'Raw Material • Crafting Feed',
        suggestedName: 'Refined Duranium-Aetherite Alloy',
        prompt: 'High-density industrial ore, metamaterial ingot, or psionic crystal used as pristine crafting feedstock.',
        presetParams: { category: 'Raw Materials', availability: 'Uncommon', craft_dc: 18, tl: 3, ml: 1 }
      },
      {
        id: 'combat_consumable',
        label: 'Combat Stim / Field Consumable',
        badge: 'Consumable • Single-Use',
        suggestedName: 'Hyper-Clot Combat Stim-Chems',
        prompt: 'Expendable chemical inhaler, ration pack, battery cell, or atmospheric scrubber canister.',
        presetParams: { category: 'Consumables', availability: 'Common', craft_dc: 12, tl: 3, ml: 0 }
      },
      {
        id: 'bulk_trade_cargo',
        label: 'Interstellar Trade Cargo',
        badge: 'Trade Goods • Economatrix',
        suggestedName: 'Copian Hydroponic Grain Crate',
        prompt: 'Standardized commercial cargo container traded across starports for merchant profit margins.',
        presetParams: { category: 'Trade Goods', availability: 'Everywhere', craft_dc: 15, tl: 2, ml: 0 }
      },
      {
        id: 'xeno_curiosity',
        label: 'Xeno Relic / Collector Antiquity',
        badge: 'Valuables & Relics • Rare',
        suggestedName: 'Progenitor Star-Chart Tablet',
        prompt: 'High-value archaeological curiosity, noble artwork, or encrypted data-crystal sought by collectors.',
        presetParams: { category: 'Valuables & Relics', availability: 'Rare', craft_dc: 25, tl: 4, ml: 2 }
      },
      {
        id: 'contraband_commodity',
        label: 'Black-Market Contraband',
        badge: 'Black Market • High Margin',
        suggestedName: 'Unregistered Neural Wetware Spool',
        prompt: 'Restricted syndicate narcotic, forged identity cipher, or prohibited AI core traded in shadow ports.',
        presetParams: { category: 'Commodities', availability: 'Black Market Only', craft_dc: 22, tl: 4, ml: 0 }
      },
      {
        id: 'field_sundry',
        label: 'Expedition Camp Sundry',
        badge: 'Field Sundries • Utility',
        suggestedName: 'Self-Heating Thermal Bivouac',
        prompt: 'Everyday explorer gear, glow-rods, ration heaters, and camp essentials for frontier survival.',
        presetParams: { category: 'Field Sundries', availability: 'Everywhere', craft_dc: 8, tl: 2, ml: 0 }
      }
    ],
    directivesLabel: '3. Consumption Effects, Trade Value & Cargo Notes (Optional)',
    directivesPlaceholder: 'E.g., Specify consumption or crafting utility, UDU cargo weight, fence/salvage value, and which factions export or ban it...',
    quickDirectives: [
      'TSC Market & Fence Value',
      'Single-Use Consumable Rule',
      'Crafting Material Bonus',
      'Contraband Legal Risk',
      'UDU Encumbrance Weight'
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 22. SUPPORTING BIOLOGICAL & SYSTEM MATRICES
  // ─────────────────────────────────────────────────────────────────────────────
  species_type: {
    id: 'species_type',
    synthesizerSubtitle: 'Synthesize fundamental biological or synthetic chassis',
    conceptSectionLabel: '1. Fundamental Chassis Taxonomy',
    nameField: {
      label: 'Chassis Type Name',
      placeholder: 'E.g., Humanoid, Synthetic, Aberration, Elemental...'
    },
    parametersSectionLabel: '2. Chassis CP Valuation & Physiological Profile',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      { key: 'bp', label: 'Chassis CP Cost', type: 'number', defaultValue: 0, min: -10, max: 30 },
      { key: 'senses', label: 'Baseline Senses', type: 'select', defaultValue: 'Standard Visual & Auditory', options: ['Standard Visual & Auditory', 'Low-Light Vision', 'Darkvision (60 ft)', 'Thermal / Infrared Spectrum', '360-Degree / Radar Senses'] }
    ],
    concepts: [
      { id: 'bio_humanoid', label: 'Standard Organic Bipedal', badge: '0 CP Baseline', suggestedName: 'Humanoid', prompt: 'Breathes, eats, sleeps; operates on 30 Vitality / 30 Health baseline.', presetParams: { bp: 0, senses: 'Standard Visual & Auditory' } },
      { id: 'synth_construct', label: 'Synthetic / Mechanical Construct', badge: '60 SP • Vacuum Immune', suggestedName: 'Synthetic Construct', prompt: 'Inorganic machine chassis operating on Structure Points (SP) with immunity to biological hazards and fatigue.', presetParams: { bp: 10, senses: 'Thermal / Infrared Spectrum' } },
      { id: 'void_aberration', label: 'Exotic / Eldritch Aberration', badge: 'Alien Anatomy', suggestedName: 'Void Aberration', prompt: 'Non-Euclidean or amorphous anatomy resistant to critical hits and mental intrusion.', presetParams: { bp: 6, senses: 'Darkvision (60 ft)' } }
    ],
    directivesLabel: '3. Respiration, Sustenance & Immunity Rules (Optional)',
    directivesPlaceholder: 'E.g., Define whether this chassis uses Vitality/Health or Structure Points (SP), breathing/eating needs, and inherent immunities...',
    quickDirectives: ['Vitality vs Structure Points', 'Vacuum & Poison Immunity', 'Critical Hit Fortification']
  },

  species_size: {
    id: 'species_size',
    synthesizerSubtitle: 'Synthesize 14-tier volumetric size & combat scaling',
    conceptSectionLabel: '1. Volumetric Scale Tier',
    nameField: {
      label: 'Size Tier Designation',
      placeholder: 'E.g., Small, Medium, Large, Gargantuan...'
    },
    parametersSectionLabel: '2. Scaling Multiplier & Combat Modifiers',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      { key: 'scaling', label: 'Scaling Multiplier', type: 'number', defaultValue: 1.0, min: 0.1, max: 320 },
      { key: 'strength_mod', label: 'Strength Modifier', type: 'number', defaultValue: 0, min: -10, max: 256 },
      { key: 'combat_mod', label: 'Defense / Hit Modifier', type: 'number', defaultValue: 0, min: -256, max: 16 }
    ],
    concepts: [
      { id: 'compact_scale', label: 'Diminutive / Small Scale', badge: '+Defense / +Stealth', suggestedName: 'Small', prompt: 'Compact physical profile granting bonus Defense and Stealth at the cost of reduced Strength and reach.', presetParams: { scaling: 0.5, strength_mod: -2, combat_mod: 2 } },
      { id: 'standard_scale', label: 'Medium Humanoid Baseline', badge: '1.0x Base Scale', suggestedName: 'Medium', prompt: 'Standard 5-foot reach, 1.0x vitality/structure multiplier, and neutral +0 combat/stealth modifiers.', presetParams: { scaling: 1.0, strength_mod: 0, combat_mod: 0 } },
      { id: 'titan_scale', label: 'Large / Huge / Gargantuan', badge: '+Strength / +Reach', suggestedName: 'Large', prompt: 'Towering physical mass multiplying carrying capacity, melee reach, and structure points.', presetParams: { scaling: 2.0, strength_mod: 4, combat_mod: -2 } }
    ],
    directivesLabel: '3. Reach, Footprint & Die Ladder Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify height/weight ranges, melee reach in feet, and volumetric weapon die scaling...',
    quickDirectives: ['14-Tier Canonical Math', 'Reach & Footprint Specs', 'Stealth & Defense Scaling']
  },

  species_movement: {
    id: 'species_movement',
    synthesizerSubtitle: 'Synthesize locomotion mode, speed & tactical paces',
    conceptSectionLabel: '1. Locomotion Mode & Mobility Type',
    nameField: {
      label: 'Movement Mode Designation',
      placeholder: 'E.g., Bipedal Locomotion, Winged Flight, Arboreal Brachiation...'
    },
    parametersSectionLabel: '2. Target Mode, Base Speed & CP Cost',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 0,
    defaultMl: 0,
    parameters: [
      { key: 'target_mode', label: 'Locomotion Mode', type: 'select', defaultValue: 'Ground', options: ['Ground', 'Flying', 'Swimming', 'Climbing', 'Burrowing', 'Flicker', 'Mechanical'] },
      { key: 'speed', label: 'Base Speed (ft / rnd)', type: 'number', defaultValue: 30, min: 5, max: 120 },
      { key: 'cp', label: 'CP Cost', type: 'number', defaultValue: 1, min: 0, max: 10 }
    ],
    concepts: [
      { id: 'ground_sprint', label: 'Quadruped / Fleet Ground', badge: 'Ground • 40 ft', suggestedName: 'Digitigrade Sprint', prompt: 'High-speed terrestrial locomotion with enhanced sprint multipliers.', presetParams: { target_mode: 'Ground', speed: 40, cp: 1 } },
      { id: 'aerial_flight', label: 'Winged / Gravimetric Flight', badge: 'Flying • 3D Mobility', suggestedName: 'Membranous Wing Flight', prompt: 'Three-dimensional aerial locomotion with hover or glide capabilities.', presetParams: { target_mode: 'Flying', speed: 30, cp: 3 } },
      { id: 'aquatic_climb', label: 'Amphibious Swim / Arboreal Climb', badge: 'Swim/Climb • 30 ft', suggestedName: 'Arboreal Canopy Climb', prompt: 'Full-speed vertical climbing or aquatic propulsion without Athletics checks.', presetParams: { target_mode: 'Climbing', speed: 30, cp: 1 } }
    ],
    directivesLabel: '3. Pace Multipliers & Maneuverability Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify Walk, Jog, and Sprint paces, zero-G interaction, and encumbrance limits...',
    quickDirectives: ['Walk / Jog / Sprint Paces', 'Zero-G Adaptation', 'No Athletics Check Required']
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 22. SPECIES LINEAGE MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  species_lineage: {
    id: 'species_lineage',
    synthesizerSubtitle: 'Synthesize ancestral bloodline, heritage CP & subspecies castes',
    conceptSectionLabel: '1. Ancestral Taxonomic Family & Lineage Concept',
    nameField: {
      label: 'Lineage / Bloodline Name',
      placeholder: 'E.g., Aeld, Draconic Bloodline, Vesperian Clade...'
    },
    parametersSectionLabel: '2. Base Chassis, Heritage Cost & Stigma',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      { key: 'base_chassis', label: 'Base Chassis Type', type: 'select', defaultValue: 'Humanoid (0 CP)', options: ['Humanoid (0 CP)', 'Beast (2 CP)', 'Dragon (6 CP)', 'Elemental (5 CP)', 'Synthetic (10 CP)', 'Aberration (4 CP)', 'Verdant (3 CP)'] },
      { key: 'cp', label: 'Base Heritage Cost (CP)', type: 'number', defaultValue: 4, min: 0, max: 20 },
      { key: 'stigma', label: 'Social Stigma / Rebate', type: 'select', defaultValue: 'None (0 CP)', options: ['None (0 CP)', 'Minor Xeno (-1 CP)', 'Outsider Caste (-2 CP)', 'Feared / Restricted (-4 CP)'] }
    ],
    concepts: [
      { id: 'ancient_starfarer', label: 'Ancient Starfaring Lineage', badge: 'Humanoid • Awakened', suggestedName: 'Aeld Star-Lineage', prompt: 'Long-lived metaphysical progenitor bloodline branching into specialized core, void, and arcane subspecies castes.', presetParams: { base_chassis: 'Humanoid (0 CP)', cp: 5, stigma: 'None (0 CP)', tl: 4, ml: 2 } },
      { id: 'engineered_clade', label: 'Gene-Forged / Uplifted Clade', badge: 'Bio-Crafted • Caste System', suggestedName: 'Kovian Gene-Clade', prompt: 'Purpose-engineered genetic family divided into labor, military, and navigator subspecies variants.', presetParams: { base_chassis: 'Humanoid (0 CP)', cp: 4, stigma: 'Minor Xeno (-1 CP)', tl: 4, ml: 0 } },
      { id: 'synthetic_series', label: 'Synthetic / Machine Foundry Series', badge: 'Synthetic • Modular Line', suggestedName: 'Mekan Foundry Series', prompt: 'Foundational cybernetic or android chassis lineage supporting scout, industrial, and tactical frame variants.', presetParams: { base_chassis: 'Synthetic (10 CP)', cp: 10, stigma: 'Outsider Caste (-2 CP)', tl: 4, ml: 0 } },
      { id: 'xeno_predator_clade', label: 'Xeno-Predator Taxonomic Family', badge: 'Xeno • Evolutionary', suggestedName: 'Saurian Apex Clade', prompt: 'Fierce evolutionary family of scaled or chitinous xeno-lifeforms adapted across multiple planetary biomes.', presetParams: { base_chassis: 'Beast (2 CP)', cp: 6, stigma: 'Minor Xeno (-1 CP)', tl: 3, ml: 0 } }
    ],
    directivesLabel: '3. Inherent Heritage Traits, Subspecies & Taxonomic Lore (Optional)',
    directivesPlaceholder: 'E.g., List shared base heritage traits, 3-5 canonical subspecies branches, evolutionary origin, and cultural standing...',
    quickDirectives: ['Shared Heritage Traits', '3-5 Subspecies Branches', 'Evolutionary History', 'Social Stigma Rules']
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 23. COMPANIONS & FAMILIARS MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  companions: {
    id: 'companions',
    synthesizerSubtitle: 'Synthesize companion Form & Function packages',
    conceptSectionLabel: '1. Companion Chassis, Bond & Tactical Role',
    nameField: {
      label: 'Companion / Familiar Designation',
      placeholder: 'E.g., K-9 Cyber-Hound Mk IV, Aether-Wisp Familiar, Razorwing...'
    },
    parametersSectionLabel: '2. Companion Type, Form Package, Scale & CP',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      { key: 'companion_type', label: 'Companion Classification', type: 'select', defaultValue: 'Biological Beast', options: ['Biological Beast', 'Synthetic Drone / Automaton', 'Metaphysical Familiar / Spirit', 'Symbiont', 'Mount / Steed'] },
      { key: 'form_package', label: 'Form Package', type: 'select', defaultValue: 'Quadruped / Predator', options: ['Quadruped / Predator', 'Avian / Flyer', 'Serpentine / Coiler', 'Insectoid / Arachnid', 'Aquatic / Amphibian', 'Hover Drone / Sphere', 'Bipedal Construct', 'Amorphous / Spectral'] },
      { key: 'size', label: 'Size Category', type: 'select', defaultValue: 'Small', options: ['Tiny', 'Small', 'Medium', 'Large', 'Huge'] },
      { key: 'cp', label: 'Character Points (CP)', type: 'number', defaultValue: 3, min: 1, max: 30 }
    ],
    concepts: [
      { id: 'tactical_cyber_hound', label: 'Tactical Cyber-Hound / Tracker', badge: 'Synthetic/Bio • Guardian', suggestedName: 'Vanguard K-9 Cyber-Hound', prompt: 'Loyal armored quadruped equipped with thermal scent-trackers, encrypted handler link, and takedown jaws.', presetParams: { companion_type: 'Synthetic Drone / Automaton', form_package: 'Quadruped / Predator', size: 'Medium', cp: 4, tl: 3, ml: 0 } },
      { id: 'recon_hover_orb', label: 'Stealth Recon Hover-Drone', badge: 'Drone • Recon/EW', suggestedName: 'Argus Whisper-Sphere', prompt: 'Whisper-quiet gravimetric sensor drone providing 360-degree holo-mapping, slicing relays, and target lock.', presetParams: { companion_type: 'Synthetic Drone / Automaton', form_package: 'Hover Drone / Sphere', size: 'Tiny', cp: 3, tl: 4, ml: 0 } },
      { id: 'metaphysical_familiar', label: 'Awakened Aether Familiar', badge: 'Familiar • Focus Conduit', suggestedName: 'Luminous Void-Lynx', prompt: 'Semi-corporeal metaphysical entity bonded to an awakened operator, storing Focus and sensing anomalies.', presetParams: { companion_type: 'Metaphysical Familiar / Spirit', form_package: 'Amorphous / Spectral', size: 'Tiny', cp: 4, tl: 0, ml: 3 } },
      { id: 'frontier_war_mount', label: 'Armored Frontier War-Mount', badge: 'Mount • High Mobility', suggestedName: 'Draconis Ridge-Stalker', prompt: 'Powerful domesticated xeno-steed capable of carrying an armored rider across jagged badlands and combat zones.', presetParams: { companion_type: 'Mount / Steed', form_package: 'Quadruped / Predator', size: 'Large', cp: 5, tl: 2, ml: 0 } },
      { id: 'bio_symbiont', label: 'Living Bio-Symbiont', badge: 'Symbiont • Metabolic', suggestedName: 'Vesperian Neural Symbiont', prompt: 'Bio-integrated organism sharing its host nervous system to filter toxins, stabilize wounds, and sharpen reflexes.', presetParams: { companion_type: 'Symbiont', form_package: 'Serpentine / Coiler', size: 'Tiny', cp: 3, tl: 3, ml: 1 } }
    ],
    directivesLabel: '3. Function Packages, Handler Commands & Scaling Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify Function Packages (Recon, Guardian, Striker, Support, Mount), action economy with handler, and Owner Tier scaling...',
    quickDirectives: ['15 CP Form / 25 CP Function Math', 'Handler Command Economy', 'Owner Tier Scaling', 'Sensor & Attack Profile']
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 24. DISCIPLINES MATRIX (PSIONIC PATHS & TRADITIONS)
  // ─────────────────────────────────────────────────────────────────────────────
  disciplines: {
    id: 'disciplines',
    synthesizerSubtitle: 'Synthesize psionic discipline tradition & tier ladder',
    conceptSectionLabel: '1. Metaphysical Tradition & Discipline Domain',
    nameField: {
      label: 'Discipline / Path Name',
      placeholder: 'E.g., Psychokinesis, Dimensional Weaving, Biokinesis...'
    },
    parametersSectionLabel: '2. Governing Attribute, Canonical Sphere & Base CP',
    showTechLevel: false,
    showMetaLevel: true,
    defaultTl: 0,
    defaultMl: 2,
    parameters: [
      { key: 'governing_attribute', label: 'Governing Attribute', type: 'select', defaultValue: 'Wisdom', options: ['Wisdom', 'Intellect', 'Charisma', 'Stamina'] },
      { key: 'canonical_sphere', label: 'Canonical Sphere', type: 'select', defaultValue: 'Energy', options: ['Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'] },
      { key: 'cp', label: 'Unlock Cost (CP)', type: 'number', defaultValue: 10, min: 5, max: 25 }
    ],
    concepts: [
      { id: 'energy_kinesis_path', label: 'Energy & Kinetic Mastery', badge: 'Energy • Kinesis/Thermal', suggestedName: 'Order of Vector Kinesis', prompt: 'Commands kinetic force vectors, electromagnetic discharges, and plasma excitation across 5 mastery tiers.', presetParams: { governing_attribute: 'Wisdom', canonical_sphere: 'Energy', cp: 10, ml: 2 } },
      { id: 'dimensional_folding_path', label: 'Dimensional & Spatial Folding', badge: 'Dimension • Apportation', suggestedName: 'Void-Fold Spatial Tradition', prompt: 'Manipulates spacetime geometry, blink teleportation, gravity wells, and pocket-plane apertures.', presetParams: { governing_attribute: 'Intellect', canonical_sphere: 'Dimension', cp: 10, ml: 3 } },
      { id: 'mental_telepathy_path', label: 'Mental & Telepathic Cognition', badge: 'Mental • Telepathy', suggestedName: 'Synaptic Sovereign Path', prompt: 'Governs mind-links, psychic shielding, precognitive combat reads, and neural domination.', presetParams: { governing_attribute: 'Charisma', canonical_sphere: 'Mental', cp: 10, ml: 2 } },
      { id: 'matter_biokinesis_path', label: 'Matter & Cellular Biokinesis', badge: 'Matter • Biokinesis', suggestedName: 'Somatic Crucible Path', prompt: 'Reshapes molecular bonds, accelerates cellular regeneration, and transmutes physical materials.', presetParams: { governing_attribute: 'Stamina', canonical_sphere: 'Matter', cp: 10, ml: 2 } }
    ],
    directivesLabel: '3. Strain Mechanics, Foci & Tier I-V Progression Directives (Optional)',
    directivesPlaceholder: 'E.g., Define Tier 1-5 progression milestones, passive bonuses, Focus/Strain backlash rules, and unlocked invocations...',
    quickDirectives: ['Tier I-V Progression', 'Focus & Strain Backlash', 'Associated Foci', 'Passive Attunement Perks']
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 25. SPECIAL ABILITIES MATRIX (STANDALONE 5 CP ABILITIES)
  // ─────────────────────────────────────────────────────────────────────────────
  special_abilities: {
    id: 'special_abilities',
    synthesizerSubtitle: 'Synthesize standalone 5 CP Special Ability & Essence CR',
    conceptSectionLabel: '1. Standalone Special Ability Archetype',
    nameField: {
      label: 'Special Ability Name',
      placeholder: 'E.g., Aetheric Resonance Pulse, Phase-Step Blink, Chrono-Snap...'
    },
    parametersSectionLabel: '2. Attribute Foundation, Canonical Discipline & CR',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 0,
    defaultMl: 2,
    parameters: [
      { key: 'foundationAttribute', label: 'Foundational Attribute', type: 'select', defaultValue: 'attr-wisdom', options: ['attr-intellect', 'attr-wisdom', 'attr-charisma', 'attr-agility', 'attr-strength', 'attr-stamina'] },
      { key: 'discipline', label: 'Canonical Discipline (6)', type: 'select', defaultValue: 'Energy', options: ['Dimension', 'Energy', 'Entropy', 'Illusion', 'Matter', 'Mental'] },
      { key: 'manifestation_dc', label: 'Manifestation CR', type: 'number', defaultValue: 15, min: 10, max: 60 },
      { key: 'cp', label: 'Base CP Cost', type: 'number', defaultValue: 5, min: 1, max: 15 }
    ],
    concepts: [
      { id: 'phase_blink_ability', label: 'Innate Phase-Step / Blink', badge: 'Dimension • 5 CP', suggestedName: 'Quantum Phase-Step', prompt: 'Standalone spatial ability allowing instant short-range teleportation without full Awakened Discipline training.', presetParams: { foundationAttribute: 'attr-agility', discipline: 'Dimension', manifestation_dc: 15, cp: 5, tl: 0, ml: 2 } },
      { id: 'aether_pulse_ability', label: 'Harmonic Force / Energy Blast', badge: 'Energy • 5 CP', suggestedName: 'Aetheric Resonance Pulse', prompt: 'Focused kinetic or thermal discharge scaling off Attribute + Ability Rank with Essence = ceil(CR / 5).', presetParams: { foundationAttribute: 'attr-wisdom', discipline: 'Energy', manifestation_dc: 15, cp: 5, tl: 0, ml: 2 } },
      { id: 'bio_mending_ability', label: 'Somatic Self-Mending Surge', badge: 'Matter • 5 CP', suggestedName: 'Cellular Knit Surge', prompt: 'Metabolic biokinetic surge that knits trauma and purges toxins as a tactical action.', presetParams: { foundationAttribute: 'attr-stamina', discipline: 'Matter', manifestation_dc: 15, cp: 5, tl: 0, ml: 1 } },
      { id: 'mind_veil_ability', label: 'Cognitive Veil / Glamour', badge: 'Illusion • 5 CP', suggestedName: 'Sensory Blindspot Veil', prompt: 'Subtle psychic distortion that erases the user from immediate visual and optical notice.', presetParams: { foundationAttribute: 'attr-charisma', discipline: 'Illusion', manifestation_dc: 15, cp: 5, tl: 0, ml: 2 } }
    ],
    directivesLabel: '3. 5-Step Parameter Math, Essence Cost & Save Directives (Optional)',
    directivesPlaceholder: 'E.g., Calibrate Base Difficulty + Range + Area + Duration modifiers, Essence = ceil(CR / 5), and 2d10 Attribute + Rank check...',
    quickDirectives: ['5 CP Standalone Rules', 'Essence = ceil(CR / 5)', '5-Step Parameter Breakdown', 'Opposed Save Mechanics']
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 26. WORLD, UNIVERSE, SETTING, PHILOSOPHY, SCENE & SOCIETIES MATRICES
  // ─────────────────────────────────────────────────────────────────────────────
  world: {
    id: 'world',
    synthesizerSubtitle: 'Synthesize UWP world profile, biosphere & planetary culture',
    conceptSectionLabel: '1. Planetary World Concept & Classification',
    nameField: { label: 'World Name', placeholder: 'E.g., Auriga Prime, Copia, Vesperia IV...' },
    parametersSectionLabel: '2. Starport Class, Atmosphere & Population Telemetry',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      { key: 'starport', label: 'Starport Class', type: 'select', defaultValue: 'B', options: ['A', 'B', 'C', 'D', 'E', 'X'] },
      { key: 'atmosphere', label: 'Atmosphere Code (0-15)', type: 'number', defaultValue: 6, min: 0, max: 15 },
      { key: 'population', label: 'Population Code (0-15)', type: 'number', defaultValue: 7, min: 0, max: 15 }
    ],
    concepts: [
      { id: 'core_trade_world', label: 'Core Trade Hub World', badge: 'Starport A • High Pop', suggestedName: 'Auriga Prime', prompt: 'Major interstellar crossroads with orbital shipyards, cosmopolitan spire-cities, and dense trade lanes.', presetParams: { starport: 'A', atmosphere: 6, population: 9, tl: 4, ml: 1 } },
      { id: 'twilight_frontier_world', label: 'Tidally Locked Frontier World', badge: 'Starport C • Terminator Belt', suggestedName: 'Meridian Dusk', prompt: 'Habitable twilight ribbon wedged between scorched dayside deserts and frozen nightside glaciers.', presetParams: { starport: 'C', atmosphere: 5, population: 6, tl: 3, ml: 1 } },
      { id: 'anomalous_relic_world', label: 'Quarantined Precursor World', badge: 'Starport E • High ML', suggestedName: 'Onyx Monolith', prompt: 'Restricted frontier planet dotted with non-Euclidean progenitor ruins and leyline storms.', presetParams: { starport: 'E', atmosphere: 4, population: 3, tl: 3, ml: 4 } }
    ],
    directivesLabel: '3. UWP Code, Geography, Cultures & Planetary Hooks (Optional)',
    directivesPlaceholder: 'E.g., Generate canonical UWP string, continental geography, dominant polities, and adventure hooks...',
    quickDirectives: ['Valid UWP String', 'Geography & Biosphere', 'Dominant Cultures', 'Planetary Conflict Hooks']
  },

  universe: {
    id: 'universe',
    synthesizerSubtitle: 'Synthesize cosmology, physical laws & genre pillars',
    conceptSectionLabel: '1. Cosmological Scale & Continuum Concept',
    nameField: { label: 'Universe / Continuum Name', placeholder: 'E.g., Tangent Space Continuum, The Shimmering Reach...' },
    parametersSectionLabel: '2. Cosmic Scale & Metaphysical Saturation',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 4,
    defaultMl: 2,
    parameters: [
      { key: 'scale', label: 'Cosmic Scale', type: 'select', defaultValue: 'Galaxy', options: ['Multiverse', 'Galaxy', 'Solar System', 'Single Planet', 'Microcosm'] }
    ],
    concepts: [
      { id: 'science_fantasy_sector', label: 'Science-Fantasy Galactic Continuum', badge: 'Galaxy • Tech + Aether', suggestedName: 'The Tangent Continuum', prompt: 'Hard-edged interstellar civilization where relativistic engineering coexists with awakened psionics and ancient dimensional rifts.', presetParams: { scale: 'Galaxy', tl: 4, ml: 2 } },
      { id: 'pocket_cluster', label: 'Isolated Rift Cluster', badge: 'Cluster • Cut-Off', suggestedName: 'The Severed Veil Cluster', prompt: 'Pocket star cluster cut off from core jump-lanes by a violent dimensional storm wall.', presetParams: { scale: 'Solar System', tl: 3, ml: 3 } },
      { id: 'multiversal_nexus', label: 'Planar / Multiversal Convergence', badge: 'Multiverse • High Meta', suggestedName: 'Lattice of Convergent Spheres', prompt: 'Layered reality where parallel timelines and dimensional planes bleed across threshold gates.', presetParams: { scale: 'Multiverse', tl: 4, ml: 4 } }
    ],
    directivesLabel: '3. Laws of Physics, FTL Travel & Thematic Tone Directives (Optional)',
    directivesPlaceholder: 'E.g., Define FTL travel constraints, metaphysical resonance rules, and core thematic pillars...',
    quickDirectives: ['FTL & Comm Laws', 'Metaphysical Ruleset', 'Thematic Genre Pillars', 'Historical Epochs']
  },

  setting: {
    id: 'setting',
    synthesizerSubtitle: 'Synthesize location landmarks, vibe & local hazards',
    conceptSectionLabel: '1. Location & District Archetype',
    nameField: { label: 'Setting / Location Name', placeholder: 'E.g., Port Meridian Free-Station, Undercity Sector 9...' },
    parametersSectionLabel: '2. Ambient Tech & Security Context',
    showTechLevel: true,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [],
    concepts: [
      { id: 'freeport_station', label: 'Lawless Orbital Freeport', badge: 'Orbital • Smuggler Hub', suggestedName: 'Spindle-7 Free-Port', prompt: 'Rotating neutral trade station packed with black-box brokers, drydock rigs, and neon cantinas.', presetParams: { tl: 3, ml: 1 } },
      { id: 'arcology_undercity', label: 'Arcology Sub-Level Sprawl', badge: 'Urban • Cyberpunk', suggestedName: 'Sump-Tier Neon Market', prompt: 'Rain-slicked lower arcology district beneath massive atmospheric scrubbers and syndicate surveillance.', presetParams: { tl: 4, ml: 0 } },
      { id: 'precursor_dig_site', label: 'Excavated Precursor Vault', badge: 'Ruins • Hazardous', suggestedName: 'Vault Zero Dig-Site', prompt: 'Flooded subterranean monolith chamber surrounded by corporate security cordons and gravity anomalies.', presetParams: { tl: 4, ml: 3 } }
    ],
    directivesLabel: '3. Points of Interest, Sensory Atmosphere & Local Rules (Optional)',
    directivesPlaceholder: 'E.g., Include 3-5 Points of Interest, local law enforcement rules, environmental hazards, and NPC hooks...',
    quickDirectives: ['3-5 Points of Interest', 'Local Security & Law Rules', 'Environmental Hazards', 'Sensory Read-Aloud Vibe']
  },

  philosophy: {
    id: 'philosophy',
    synthesizerSubtitle: 'Synthesize creed dogma, tenets & ritual practices',
    conceptSectionLabel: '1. Philosophical Creed & Religious Tradition',
    nameField: { label: 'Philosophy / Religion Name', placeholder: 'E.g., Creed of the Sol Invictus, Machine-Logic Accord...' },
    parametersSectionLabel: '2. Cultural Tech & Metaphysical Context',
    showTechLevel: false,
    showMetaLevel: true,
    defaultTl: 3,
    defaultMl: 2,
    parameters: [],
    concepts: [
      { id: 'solar_theocracy_creed', label: 'Luminous Civic Theocracy', badge: 'Creed • Order & Light', suggestedName: 'Path of the Unbroken Corona', prompt: 'Structured stellar religion venerating cosmic order, truth-oaths, and the purification of void entropy.', presetParams: { ml: 2 } },
      { id: 'cybernetic_logic_creed', label: 'Transhuman / Machine Logic Philosophy', badge: 'Philosophy • Rationalist', suggestedName: 'The Prime Axiom', prompt: 'Philosophical movement pursuing cognitive clarity, cybernetic synthesis, and freedom from biological impulse.', presetParams: { ml: 0 } },
      { id: 'void_mystic_order', label: 'Esoteric Void Mysticism', badge: 'Mystic • Awakened', suggestedName: 'Whisperers of the Horizon', prompt: 'Contemplative monastic tradition studying dimensional currents, ego-dissolution, and precognitive harmony.', presetParams: { ml: 3 } }
    ],
    directivesLabel: '3. Core Dogma, Tenets, Taboos & Ritual Directives (Optional)',
    directivesPlaceholder: 'E.g., Detail founding origin, 3-5 core tenets, sacred rites/practices, and schisms...',
    quickDirectives: ['Core Dogma & Tenets', 'Sacred Rites & Practices', 'Taboos & Schisms', 'Faction & Species Ties']
  },

  scene: {
    id: 'scene',
    synthesizerSubtitle: 'Synthesize AIME scene beats, dramatic hook & CR checks',
    conceptSectionLabel: '1. Dramatic Scene Structure (AIME)',
    nameField: { label: 'Scene Title', placeholder: 'E.g., Decompression at Dock 7, Midnight Syndicate Exchange...' },
    parametersSectionLabel: '2. Scene Classification & Escalation Context',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 1,
    parameters: [
      { key: 'scene_type', label: 'Scene Type', type: 'select', defaultValue: 'Action / Combat', options: ['Action / Combat', 'Investigation / Clue', 'Social / Intrigue', 'Exploration / Survival', 'Downtime / Recovery', 'Cinematic Revelation'] }
    ],
    concepts: [
      { id: 'tactical_setpiece', label: 'Dynamic Combat Set-Piece', badge: 'Action • Environmental', suggestedName: 'Airlock Breach at Spindle 7', prompt: 'High-stakes firefight complicated by shifting gravity, failing bulkheads, or a ticking countdown.', presetParams: { scene_type: 'Action / Combat' } },
      { id: 'noir_investigation', label: 'Forensic / Cyber Investigation', badge: 'Investigation • Clues', suggestedName: 'Ghost in the Black-Box', prompt: 'Multi-layered crime scene requiring forensic slicing, witness interrogation, and physical recon.', presetParams: { scene_type: 'Investigation / Clue' } },
      { id: 'diplomatic_standoff', label: 'High-Tension Social Intrigue', badge: 'Social • Negotiation', suggestedName: 'Summit of the Three Houses', prompt: 'Tense diplomatic parley where concealed agendas, etiquette traps, and leverage decide the outcome.', presetParams: { scene_type: 'Social / Intrigue' } },
      { id: 'hazard_traversal', label: 'Hostile Survival Traversal', badge: 'Exploration • Hazard CR', suggestedName: 'Crossing the Glass Storm', prompt: 'Perilous expedition across lethal terrain testing endurance, navigation, and equipment integrity.', presetParams: { scene_type: 'Exploration / Survival' } }
    ],
    directivesLabel: '3. Read-Aloud Hook, 3-Act Beats & 2d10 CR Checks (Optional)',
    directivesPlaceholder: 'E.g., Include sensory read-aloud opening, 3 escalating scene beats, 2d10 skill CR benchmarks, and Architect secrets...',
    quickDirectives: ['Sensory Read-Aloud Box', '3 Escalating Beats', '2d10 Skill CR Benchmarks', 'Architect Twist / Secret']
  },

  societies: {
    id: 'societies',
    synthesizerSubtitle: 'Synthesize civilization sphere stage, rights & enforcement',
    conceptSectionLabel: '1. Civilization Sphere & Governance Tier',
    nameField: { label: 'Society / Governance Designation', placeholder: 'E.g., Cyberocratic Mesh Consensus, Frontier Charter...' },
    parametersSectionLabel: '2. Development Stage & UWP Code',
    showTechLevel: true,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      { key: 'stage', label: 'Development Stage (0-5)', type: 'number', defaultValue: 3, min: 0, max: 5 }
    ],
    concepts: [
      { id: 'frontier_charter_soc', label: 'Frontier Colonial Charter', badge: 'Stage 2 • Decentralized', suggestedName: 'Autonomous Rim Charter', prompt: 'Pragmatic self-governing frontier framework prioritizing resource output, mutual defense, and local marshals.', presetParams: { stage: 2, tl: 3 } },
      { id: 'high_core_consensus', label: 'Networked Core Technocracy', badge: 'Stage 4 • Algorithmic', suggestedName: 'Mesh-Verified Civic Order', prompt: 'High-infrastructure planetary governance managed through transparent telemetry, guild charters, and drones.', presetParams: { stage: 4, tl: 4 } },
      { id: 'martial_directorate_soc', label: 'Fortress Martial Directorate', badge: 'Stage 3 • Regimented', suggestedName: 'Citadel Defense Mandate', prompt: 'Militarized civic structure where rights, rationing, and status derive from defense service.', presetParams: { stage: 3, tl: 3 } }
    ],
    directivesLabel: '3. Citizen Rights, Enforcement & Social Friction Directives (Optional)',
    directivesPlaceholder: 'E.g., Detail citizen rights, law enforcement mechanisms, trade restrictions, and 2d10 social check modifiers...',
    quickDirectives: ['Citizen Rights & Duties', 'Law Enforcement Model', '2d10 Social Check Mods', 'Internal Friction Hooks']
  },

  economatrix: {
    id: 'economatrix',
    synthesizerSubtitle: 'Synthesize TSC valuation profile & trade parameters',
    conceptSectionLabel: '1. Economic Market & Trade Archetype',
    nameField: { label: 'Economic Profile Name', placeholder: 'E.g., Core Sector Trade Index, Blockade Surge Tariff...' },
    parametersSectionLabel: '2. Standard Curve CR & Market Calibration',
    showTechLevel: true,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      { key: 'craft_dc', label: 'Standard Curve CR (0-80)', type: 'number', defaultValue: 20, min: 0, max: 80 }
    ],
    concepts: [
      { id: 'core_free_market', label: 'Core Free-Port Market', badge: 'CR 20 • High Liquidity', suggestedName: 'Core Exchange Standard', prompt: 'High-liquidity interstellar market hub adhering strictly to the Tangent Standard Curve (TSC).', presetParams: { craft_dc: 20, tl: 4 } },
      { id: 'frontier_scarcity_market', label: 'Frontier Scarcity / Embargo Index', badge: 'CR 25 • Scarcity Markup', suggestedName: 'Outer Rim Embargo Tariff', prompt: 'Supply-constrained border economy with steep markups on refined fuel, medical tech, and ordnance.', presetParams: { craft_dc: 25, tl: 2 } }
    ],
    directivesLabel: '3. Liquidity, Wealth Score & Tariff Directives (Optional)',
    directivesPlaceholder: 'E.g., Specify Wealth Score (WS) thresholds, black-market surcharges, and crafting time modifiers...',
    quickDirectives: ['TSC Valuation Formula', 'Wealth Score Thresholds', 'Supply & Scarcity Modifiers']
  },

  technology: {
    id: 'technology',
    synthesizerSubtitle: 'Synthesize Tech Level era capabilities & material specs',
    conceptSectionLabel: '1. Technological Paradigm & Era',
    nameField: { label: 'Technology Profile Designation', placeholder: 'E.g., TL 4 Gravimetric & Nanocarbon Matrix...' },
    parametersSectionLabel: '2. Tech Level Calibration',
    showTechLevel: true,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [],
    concepts: [
      { id: 'tl3_fusion_industrial', label: 'TL 3 Interstellar Fusion Standard', badge: 'TL 3 • Galactic Baseline', suggestedName: 'TL 3 Fusion & Plasteel Standard', prompt: 'Reliable fusion reactors, cybernetic prosthetics, ballistic/plasma hybrids, and jump-lane starflight.', presetParams: { tl: 3 } },
      { id: 'tl4_gravimetric_high', label: 'TL 4 Gravimetric & Nanotech Era', badge: 'TL 4 • Core Apex', suggestedName: 'TL 4 Gravimetric & Bioware Paradigm', prompt: 'Compact anti-gravity, smart nanocarbon composites, cultured bioware, and quantum mesh computing.', presetParams: { tl: 4 } },
      { id: 'tl5_singularity_relic', label: 'TL 5 Singularity / Precursor Tech', badge: 'TL 5 • Post-Scarcity', suggestedName: 'TL 5 Quantum-Metric Fabrication', prompt: 'Matter-energy conversion, metric engineering, and near-indestructible progenitor metamaterials.', presetParams: { tl: 5 } }
    ],
    directivesLabel: '3. Domain Capabilities, Power Sources & Operator Penalty Directives (Optional)',
    directivesPlaceholder: 'E.g., Detail energy generation, materials, computing, medical capabilities, and low-TL operator penalties...',
    quickDirectives: ['Energy & Materials Specs', 'Medical & Cyber Capabilities', 'Operator TL Discrepancy Rules']
  },

  scaling: {
    id: 'scaling',
    synthesizerSubtitle: 'Synthesize 14-tier scale profile & combat matchup math',
    conceptSectionLabel: '1. Scale Tier & Volumetric Profile',
    nameField: { label: 'Scaling Reference Designation', placeholder: 'E.g., Heavy Walker Colossal Matchup Profile...' },
    parametersSectionLabel: '2. Size Tier Calibration',
    showTechLevel: false,
    showMetaLevel: false,
    defaultTl: 3,
    defaultMl: 0,
    parameters: [
      { key: 'size', label: 'Size Category', type: 'select', defaultValue: 'Large', options: ['Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'Super Gargantuan', 'Mega Colossal'] }
    ],
    concepts: [
      { id: 'personal_vs_vehicular', label: 'Infantry vs. Heavy Walker Scale', badge: 'Medium vs Huge', suggestedName: 'Anti-Armor Scale Benchmark', prompt: 'Reference profile calibrating attack modifiers, reach, and structural damage scaling between infantry and heavy frames.', presetParams: { size: 'Huge' } },
      { id: 'capital_structural_scale', label: 'Colossal Structural / Starship Scale', badge: 'Colossal • Capital Tier', suggestedName: 'Capital Hull Scaling Profile', prompt: 'Volumetric mass, structure point multipliers, and weapon die steps for colossal installations and vessels.', presetParams: { size: 'Colossal' } }
    ],
    directivesLabel: '3. Fluid Combat Matchup & Structure Multiplier Directives (Optional)',
    directivesPlaceholder: 'E.g., Include STR/Defense/Stealth modifiers, reach, and opposed size matchup deltas...',
    quickDirectives: ['14-Tier Canonical Math', 'Fluid Matchup Modifiers', 'Structure & Mass Multipliers']
  }
};

// Map aliases so any Omnicortex key or Codex matrix ID resolves cleanly
CODEX_SYNTHESIZER_PROFILES.armoring = CODEX_SYNTHESIZER_PROFILES.armor;
CODEX_SYNTHESIZER_PROFILES.gear = CODEX_SYNTHESIZER_PROFILES.equipment;
CODEX_SYNTHESIZER_PROFILES.personal_property = CODEX_SYNTHESIZER_PROFILES.other;
CODEX_SYNTHESIZER_PROFILES.invocations = CODEX_SYNTHESIZER_PROFILES.invocation;
CODEX_SYNTHESIZER_PROFILES.modular_characters = CODEX_SYNTHESIZER_PROFILES['modular-characters'];
CODEX_SYNTHESIZER_PROFILES.planetary_design = CODEX_SYNTHESIZER_PROFILES['planetary-design'];
CODEX_SYNTHESIZER_PROFILES.world_design = CODEX_SYNTHESIZER_PROFILES.world;
CODEX_SYNTHESIZER_PROFILES.planets = CODEX_SYNTHESIZER_PROFILES['planetary-design'];

/**
 * Resolves the subject-relative synthesizer profile for any matrix or dataset key.
 * If a specialized matrix doesn't have an explicit profile, dynamically builds one
 * from the matrix's own fields, archetypes, and category metadata.
 */
export const getSynthesizerProfile = (matrix, datasetKey = '') => {
  const matrixObj = typeof matrix === 'object' && matrix !== null ? matrix : null;
  const candidates = [
    typeof matrix === 'string' ? matrix : matrixObj?.id,
    datasetKey,
    matrixObj?.targetCollection,
    matrixObj?.ingestionKey
  ]
    .filter(Boolean)
    .map(k => String(k).toLowerCase().trim());

  for (const key of candidates) {
    if (CODEX_SYNTHESIZER_PROFILES[key]) {
      return CODEX_SYNTHESIZER_PROFILES[key];
    }
    if (key.startsWith('society_')) {
      const sphereName = key
        .replace(/^society_/i, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const baseSoc = CODEX_SYNTHESIZER_PROFILES.societies;
      return {
        ...baseSoc,
        id: key,
        synthesizerSubtitle: `Synthesize ${sphereName} sphere stage, rights & mechanics`,
        conceptSectionLabel: `1. ${sphereName} Sphere Archetypes`,
        nameField: {
          label: `${sphereName} Profile Designation`,
          placeholder: `E.g., Stage 3 ${sphereName} Standard...`
        }
      };
    }
  }

  // Dynamic fallback built strictly from the matrix definition itself (NEVER leak equipment/species!)
  const matrixTitle = matrix?.label || matrix?.name || 'Codex Asset';
  const matrixShortName = matrix?.name || 'ASSET';
  const primaryField = matrix?.fields?.[0] || { label: `${matrixShortName} Designation`, placeholder: `E.g., Canonical ${matrixTitle}...` };
  const fieldNames = new Set((matrix?.fields || []).map((f) => f.name));
  const hasTlField = fieldNames.has('tl') || fieldNames.has('tech_level') || fieldNames.has('techLevel') || Boolean(matrix?.isProperty);
  const hasMlField = fieldNames.has('ml') || fieldNames.has('meta_level') || fieldNames.has('metaLevel');

  const dynamicParams = (matrix?.fields || [])
    .filter(f => f.name !== 'name' && (f.type === 'select' || f.type === 'number') && !['tl', 'tech_level', 'ml', 'meta_level'].includes(f.name))
    .slice(0, 3)
    .map(f => ({
      key: f.name,
      label: f.label,
      type: f.type,
      defaultValue: matrix?.defaultValues?.[f.name] ?? (f.options ? f.options[0] : 15),
      options: f.options || [],
      min: f.min ?? 0,
      max: f.max ?? 80
    }));

  const dynamicConcepts = Array.isArray(matrix?.archetypes) && matrix.archetypes.length > 0
    ? matrix.archetypes.map((arch, idx) => ({
        id: `arch_${idx}`,
        label: arch.name,
        badge: matrix?.badge || matrix?.category || 'Archetype',
        suggestedName: arch.name,
        prompt: arch.prompt,
        presetParams: arch.preset || {}
      }))
    : [
        {
          id: `${matrix?.id || 'asset'}_baseline`,
          label: `Baseline ${matrixTitle}`,
          badge: `${matrix?.badge || matrixShortName} • Standard`,
          suggestedName: `Standard ${matrixTitle}`,
          prompt: `Canonical baseline ${matrixTitle.toLowerCase()} calibrated to core Tangent SFF RP 2d10 rules and lore.`,
          presetParams: {}
        },
        {
          id: `${matrix?.id || 'asset'}_specialized`,
          label: `Specialized ${matrixTitle}`,
          badge: `${matrix?.badge || matrixShortName} • Tactical`,
          suggestedName: `Specialized ${matrixTitle}`,
          prompt: `High-impact situational or tactical ${matrixTitle.toLowerCase()} with clear triggers, modifiers, and counterplay.`,
          presetParams: {}
        },
        {
          id: `${matrix?.id || 'asset'}_advanced`,
          label: `Advanced / Variant ${matrixTitle}`,
          badge: `${matrix?.badge || matrixShortName} • Tiered`,
          suggestedName: `Advanced ${matrixTitle}`,
          prompt: `Upper-tier or edge-case ${matrixTitle.toLowerCase()} incorporating advanced scaling or campaign-level hooks.`,
          presetParams: {}
        }
      ];

  return {
    id: matrix?.id || 'custom',
    synthesizerSubtitle: `Synthesize ${matrixTitle} with BASTION AI`,
    conceptSectionLabel: `1. ${matrixShortName} Concept Archetypes`,
    nameField: {
      label: primaryField.label || `${matrixShortName} Designation`,
      placeholder: primaryField.placeholder || `E.g., Custom ${matrixTitle}...`
    },
    parametersSectionLabel: `2. ${matrixShortName} Parameters & Calibration`,
    showTechLevel: hasTlField,
    showMetaLevel: hasMlField,
    defaultTl: matrix?.defaultValues?.tl ?? matrix?.defaultValues?.tech_level ?? 3,
    defaultMl: matrix?.defaultValues?.ml ?? matrix?.defaultValues?.meta_level ?? 0,
    parameters: dynamicParams,
    concepts: dynamicConcepts,
    directivesLabel: `3. ${matrixShortName} Directives & Mechanical Focus (Optional)`,
    directivesPlaceholder: `Specify mechanical focus, lore hooks, and canonical Tangent SFF RP parameters for this ${matrixTitle}...`,
    quickDirectives: [
      'Canonical Rules Math',
      'Detailed Lore & Overview',
      '2d10 Resolution Mechanics',
      'Architect Plot Hooks'
    ]
  };
};
