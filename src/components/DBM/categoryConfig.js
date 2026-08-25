export const categoryConfig = {
    compendium: {
        label: 'COMPENDIUM',
        viewType: 'wiki',
        fields: {
            name: { type: 'text', required: true },
            entry_type: { 
                type: 'select', 
                label: 'Entry Type', 
                options: ['General Lore', 'Core Rule', 'Game Mechanic', 'System Guide', 'Worldbuilding'], 
                default: 'General Lore' 
            },
            description: { type: 'textarea', aiEnabled: true, label: 'Description / Overview' },
            mechanic: { type: 'textarea', label: 'Mechanics (BASTION Rules)' },
            guide: { type: 'textarea', label: 'Gameplay Instructions' },
            note: { type: 'textarea', label: 'Designer / Architect Notes' },
            parent: { type: 'select', source: 'compendium', label: 'Parent Article', manageable: false },
            order: { type: 'number', label: 'Display Order', default: 0 },
        }
    },
    species: {
        label: 'SPECIES',
        viewType: 'table',
        directory_columns: ['name', 'parent_species', 'type', 'inherent_attribute_modifiers', 'stigma', 'homeworld', 'cp', 'description'],
        fields: {
            name: { type: 'text', required: true },
            title: { type: 'text', label: 'Formal Title / Subspecies' },
            parent_species: { 
                type: 'select', 
                label: 'Parent Lineage / Taxon', 
                options: [
                    'Aeld',
                    'Asi (Fey Lineages)',
                    'Aulurans',
                    'Humans (Core & Variants)',
                    'Engineered Humans (Gen-E)',
                    'Kitin',
                    'Synthetics',
                    "Sha'nor & Void Lineages",
                    'Progenitors',
                    'Independent Xenotypes',
                    'Independent'
                ] 
            },
            description: { type: 'textarea', aiEnabled: true, label: 'Summary Description' },
            stigma: { type: 'text', label: 'Social Stigma & Reaction Penalty' },
            homeworld: { type: 'text', label: 'Homeworld / Origin Planet' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            type: { type: 'multiselect', source: 'species_type', manageable: true },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            movement: { type: 'multiselect', source: 'species_movement', manageable: true },
            trait: { type: 'multiselect', source: 'trait', label: 'Traits', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers & Bonuses' },
            costs: { type: 'costs_map', label: 'Build Costs (BP)' },
            body: { type: 'textarea', label: 'Full Lore, Sociological Profile & Visual Semiotics (Markdown)', aiEnabled: true },
            note: { type: 'textarea', label: 'Architect / Design Notes' }
        }
    },
    factions: {
        label: 'FACTIONS',
        viewType: 'table',
        directory_columns: ['name', 'tech_level', 'meta_level', 'description', 'society'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true },
            society: { type: 'select', source: 'societies', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers & Bonuses' },
            attitude: { type: 'textarea' },
            goals: { type: 'textarea' },
            social_strengths: { type: 'textarea' },
            social_weaknesses: { type: 'textarea' },
            archetype: { type: 'select', options: ['Militaristic', 'Corporate / Mercantile', 'Religious / Cult', 'Technological', 'Criminal / Syndicate', 'Exploration / Academic', 'Agrarian / Colony', 'Isolationist / Alien'] },
            tech_level: { type: 'number', label: 'Tech Level (TL 0-5)', default: 3 },
            meta_level: { type: 'number', label: 'Meta Level (ML 0-5)', default: 0 },
            colloquialisms: { type: 'text', label: 'Colloquialisms' },
            symbol_sigil: { type: 'text', label: 'Symbol / Sigil' },
            driving_mandate: { type: 'textarea', label: 'Driving Mandate' },
            motto: { type: 'text', label: 'Motto' },
            core_beliefs: { type: 'textarea', label: 'Core Beliefs' },
            social_structure: { type: 'textarea', label: 'Social Structure' },
            outsider_view: { type: 'textarea', label: 'View on Outsiders' },
            law_order: { type: 'textarea', label: 'Law & Order' },
            government_type: { type: 'text', label: 'Government Type' },
            leadership: { type: 'text', label: 'Leadership' },
            succession: { type: 'text', label: 'Succession' },
            primary_exports: { type: 'text', label: 'Primary Exports' },
            economic_model: { type: 'text', label: 'Economic Model' },
            military_doctrine: { type: 'textarea', label: 'Military Doctrine' },
            key_units: { type: 'textarea', label: 'Key Units' },
            naval_assets: { type: 'textarea', label: 'Naval Assets' },
            design_language: { type: 'textarea', label: 'Design Language' },
            architecture: { type: 'textarea', label: 'Architecture' },
            gear_aesthetic: { type: 'textarea', label: 'Gear Aesthetic' },
            lighting_mood: { type: 'textarea', label: 'Lighting / Mood' },
            image_prompt: { type: 'textarea', label: 'Image Prompt' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    origins: {
        label: 'ORIGINS',
        viewType: 'table',
        directory_columns: ['name', 'description'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            trait: { type: 'multiselect', source: 'trait', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers & Bonuses' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    occupations: {
        label: 'OCCUPATIONS',
        viewType: 'table',
        directory_columns: ['name', 'description'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            trait: { type: 'multiselect', source: 'trait', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers & Bonuses' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            note: { type: 'textarea' }
        }
    },
    archetypes: {
        label: 'ARCHETYPES',
        viewType: 'table',
        directory_columns: ['name', 'sphere', 'core_concept', 'tactical_role', 'primary_attribute', 'secondary_attribute'],
        fields: {
            name: { type: 'text', required: true },
            sphere: { 
                type: 'select', 
                label: 'Sphere / Focus', 
                options: [
                    'Sentinels (The Stabilizers)',
                    'Operatives (The Artisans)',
                    'Visionaries (The Idealists)',
                    'Savants (The Rationals)'
                ],
                required: true 
            },
            core_concept: { type: 'text', label: 'Core Concept' },
            summary: { type: 'textarea', label: 'Summary' },
            quote: { type: 'text', label: 'Mantra / Quote' },
            description: { type: 'textarea', aiEnabled: true, label: 'Full Description & Flavor' },
            tactical_role: { type: 'textarea', label: 'Tactical Role' },
            primary_attribute: { type: 'text', label: 'Primary Attribute (+3 / 15 BP)' },
            secondary_attribute: { type: 'text', label: 'Secondary Attribute (+2 / 10 BP)' },
            key_attributes: { type: 'text', label: 'Key Attributes Formula' },
            essential_skills: { type: 'multiselect', source: 'skills', label: 'Essential Skills', manageable: true },
            signature_features: { type: 'multiselect', source: 'features', label: 'Signature Features', manageable: true },
            recommended_occupations: { type: 'multiselect', source: 'occupations', label: 'Recommended Occupations', manageable: true },
            recommended_origins: { type: 'multiselect', source: 'origins', label: 'Recommended Origins', manageable: true },
            recommended_factions: { type: 'multiselect', source: 'factions', label: 'Recommended Factions', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Archetype Modifiers' },
            costs: { type: 'costs_map', label: 'Chassis BP Costs' },
            mechanic: { type: 'textarea', label: 'Mechanics / Scaling Rules' },
            note: { type: 'textarea', label: 'Architect Notes' }
        }
    },
    skills: {
        label: 'SKILLS',
        viewType: 'table',
        directory_columns: ['name', 'type', 'subtype', 'description'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', options: ['mental', 'physical', 'social', 'combat', 'meta'], required: true },
            subtype: { type: 'select', options: ['knowledge', 'vocation', 'manipulation', 'expression', 'archaic', 'modern', 'advanced'] },
            is_specialization: { type: 'boolean', label: 'SPECIALIZATION' },
            base_skill: { type: 'select', source: 'skills', label: 'BASE SKILL' },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    features: {
        label: 'FEATURES',
        viewType: 'table',
        directory_columns: ['name', 'type', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', options: ['ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic', 'Special Ability'] },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true},
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            costs: { type: 'costs_map', label: 'CP & Resource Costs' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            multi: { type: 'boolean', label: 'Multi' },
            staged: { type: 'boolean', label: 'Staged' }
        }
    },
    species_type: {
        label: 'TYPES',
        hideFromMenu: true,
        directory_columns: ['name', 'description', 'modifier'],
        fields: {
            name: { type:'text', required: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            cp: { type: 'readonlytext', label: 'TOTAL CP'}
        }
    },
    species_size: {
        label: 'SIZES',
        hideFromMenu: true,
        directory_columns: ['name', 'scaling', 'height_length_range', 'weight_range', 'modifier'],
        fields: {
            name: { type:'text', required: true},
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            scaling: { type: 'number', label: 'Scaling' },
            height_length_range: { type: 'text', label: 'Height/Length Range' },
            weight_range: { type: 'text', label: 'Weight Range' },
            reach: { type: 'text', label: 'Reach' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            dc: { type: 'number', label: 'DC' },
            cp: { type: 'readonlytext', label: 'TOTAL CP'}
        }
    },
    species_movement: {
        label: 'MOVEMENTS',
        hideFromMenu: true,
        directory_columns: ['name', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            cp: { type: 'readonlytext', label: 'TOTAL CP' }
        }
    },
    trait: {
        label: 'TRAITS',
        hideFromMenu: true,
        directory_columns: ['name', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            cp: { type: 'readonlytext', label: 'TOTAL CP' }
        }
    },
    augmentation_type: {
        label: 'AUGMENTATION TYPES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    body_location: {
        label: 'BODY LOCATIONS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    disciplines: {
        label: 'DISCIPLINES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            discipline_skills: { type: 'multiselect', source: 'skills', label: 'Discipline Skills', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    disadvantages: {
        label: 'DISADVANTAGES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'cp'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            cp: { type: 'number'},
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    modular_characters: {
        label: 'MODULAR CHARACTERS',
        viewType: 'table',
        directory_columns: ['name', 'threatTier', 'competencyRole', 'designation', 'bossType'],
        fields: {
            name: { type: 'text', required: true, label: 'Operative / Archetype Name' },
            threatTier: { type: 'number', label: 'Threat Tier (0-20)' },
            competencyRole: { 
                type: 'select', 
                label: 'Competency Role',
                options: ['Tank', 'Bruiser', 'Striker', 'Assassin', 'Sniper', 'Gunslinger', 'Blaster', 'Controller', 'Buffer', 'Healer', 'Commander', 'Summoner'] 
            },
            designation: { type: 'select', label: 'Designation', options: ['Adversary', 'Ally', 'Companion', 'Neutral'] },
            bossType: { type: 'select', label: 'Chassis Type', options: ['Minion', 'Standard', 'Boss', 'Mastermind'] },
            sizeCategory: { type: 'select', label: 'Size Category', options: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'] },
            isSynthetic: { type: 'checkbox', label: 'Is Synthetic?' },
            tacticalBehaviors: { type: 'multiselect', source: 'traits', manageable: true, label: 'Tactical Behaviors' },
            tech_level: { type: 'number', label: 'Tech Level (TL 0-5)' },
            meta_level: { type: 'number', label: 'Meta Level (ML 0-5)' },
            craft_dc: { type: 'number', label: 'Encounter / Threat DC' },
            description: { type: 'textarea', aiEnabled: true, label: 'Appearance, Behavioral AI & Motives' },
            mechanic: { type: 'textarea', label: 'Combat Behaviors, Special Traits & Loot' },
            note: { type: 'textarea', label: 'Architect Notes' }
        }
    },
    planetary_design: {
        label: 'PLANETARY DESIGN',
        viewType: 'table',
        directory_columns: ['name', 'starClass', 'orbitalZone', 'size', 'atmosphere', 'tech_level', 'meta_level', 'population'],
        fields: {
            name: { type: 'text', required: true, label: 'Planet / System Name' },
            starClass: { type: 'select', label: 'Star Class', options: ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'D', 'Black Hole', 'Neutron', 'Nebula'] },
            orbitalZone: { type: 'select', label: 'Orbital Zone', options: ['Inner (Hot)', 'BioZone (Habitable)', 'Outer (Cold)', 'Halo (Deep Space)'] },
            size: { type: 'number', label: 'Size / Gravity Tier (1-10)' },
            atmosphere: { type: 'number', label: 'Atmosphere Code (0-12)' },
            hydrography: { type: 'number', label: 'Hydrography (0-100%)' },
            biosphere: { type: 'select', label: 'Biosphere / Life', options: ['None', 'Microbial', 'Vegetative', 'Arthropoid', 'Reptilian', 'Avian/Mammal', 'Sophont'] },
            population: { type: 'number', label: 'Population Code (0-15)' },
            tech_level: { type: 'number', label: 'Tech Level (TL 0-5)' },
            meta_level: { type: 'number', label: 'Metafocus Level (ML 0-6)' },
            government: { type: 'number', label: 'Government Code (0-15)' },
            lawLevel: { type: 'number', label: 'Law Level Code (0-15)' },
            starport: { type: 'select', label: 'Starport Class', options: ['A', 'B', 'C', 'D', 'E', 'X'] },
            tradeCodes: { type: 'multiselect', source: 'traits', manageable: true, label: 'Trade Classifications' },
            factionArchetype: { type: 'text', label: 'Faction / Cultural Aesthetic' },
            wealthModifier: { type: 'number', label: 'Wealth Modifier' },
            description: { type: 'textarea', aiEnabled: true, label: 'Overview / History' },
            quirks: { type: 'textarea', label: 'Planetary Quirks / Hazards' },
            adventureHooks: { type: 'textarea', label: 'Adventure Hooks' },
            note: { type: 'textarea', label: 'GM Notes' }
        }
    },
    technology: {
        label: 'TECHNOLOGY',
        viewType: 'table',
        directory_columns: ['name', 'tech_level', 'meta_level', 'craft_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Technology Profile Designation' },
            tech_level: { type: 'number', label: 'Tech Level (TL 0-5)', default: 3 },
            meta_level: { type: 'number', label: 'Meta Level (ML 0-5)', default: 0 },
            craft_dc: { type: 'number', label: 'Technological Complexity DC' },
            description: { type: 'textarea', aiEnabled: true, label: 'Technical Specifications & Domain Capabilities' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    economatrix: {
        label: 'ECONOMATRIX',
        viewType: 'table',
        directory_columns: ['name', 'economic_type', 'base_cost'],
        fields: {
            name: { type: 'text', required: true, label: 'Asset / Entity Name' },
            economic_type: { 
                type: 'select', 
                label: 'Economic Type',
                options: ['Commodity', 'Trade Route', 'Lifestyle', 'Resource Unit', 'Financial Status', 'Other'] 
            },
            base_cost: { type: 'number', label: 'Base Cost / Wealth Score' },
            trade_code_modifiers: { type: 'textarea', label: 'Trade Code Modifiers' },
            description: { type: 'textarea', aiEnabled: true },
            mechanic: { type: 'textarea', label: 'Economic Mechanics' },
            note: { type: 'textarea' }
        }
    },
    invocations: {
        label: 'INVOCATIONS',
        viewType: 'table',
        directory_columns: ['name', 'description', 'discipline', 'meta_skill', 'design_dc'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            discipline: { type: 'select', source: 'disciplines', manageable: true },
            meta_skill: { type: 'select', source: 'skills', label: 'Meta Skill' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            critical_details: { type: 'critical_details', label: 'Critical Details' },
            costs: { type: 'costs_map', label: 'Resource Expenditures & AP' },
            sockets: { type: 'sockets_group', label: 'Sockets & UDU Tier' },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            cast_time: { type: 'text', label: 'Cast Time' },
            duration: { type: 'text', label: 'Duration' },
            note: { type: 'textarea' }
        }
    },
    special_abilities: {
        label: 'SPECIAL ABILITIES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'discipline', 'meta_skill', 'design_dc'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            discipline: { type: 'select', source: 'disciplines', manageable: true },
            meta_skill: { type: 'select', source: 'skills', label: 'Meta Skill' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            critical_details: { type: 'critical_details', label: 'Critical Details' },
            costs: { type: 'costs_map', label: 'Resource Expenditures & AP' },
            sockets: { type: 'sockets_group', label: 'Sockets & UDU Tier' },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            note: { type: 'textarea' }
        }
    },
    augmentations: {
        label: 'AUGMENTATIONS',
        viewType: 'table',
        directory_columns: ['name', 'type', 'tech_level', 'sp', 'dr', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Augmentation Name' },
            type: { type: 'select', source: 'augmentation_type', manageable: true, label: 'Category' },
            location: { type: 'multiselect', source: 'body_location', manageable: true },
            description: { type: 'textarea' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            costs: { type: 'costs_map', label: 'Costs, Strain & BP' },
            sockets: { type: 'sockets_group', label: 'Sockets & Allocation' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            critical_details: { type: 'critical_details', label: 'Critical Details' },
            sp: { type: 'number', label: 'Structure Points (SP)' },
            dr: { type: 'number', label: 'Damage Resist (DR)' },
            stigma: { type: 'select', options: ['None', 'Minor', 'Moderate', 'Severe'], label: 'Stigma Threshold' },
            design_dc: { type: 'number', label: 'Crafting DC / Wealth Score' },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            component: { type: 'multiselect', source: 'component', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    personal_property: {
        label: 'PROPERTY',
        isParent: true,
        viewType: 'landing',
        subItems: ['gear', 'weaponry', 'armoring', 'mecha', 'architecture', 'other'],
    },
    gear: {
        label: 'Gear',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'category', 'size', 'tech_level', 'meta_level', 'craft_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Item Name' },
            category: { type: 'select', source: 'gear_category', manageable: true, label: 'Gear Category' },
            size: { type: 'select', options: ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Mecha', 'Structure'], label: 'Size Category' },
            faction_skin: { type: 'select', source: 'factions', manageable: true, label: 'Manufacturer (Cultural Skin)' },
            base_dc: { type: 'number', label: 'Base DC' },
            craft_dc: { type: 'number', label: 'Crafting DC / Wealth Score' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            costs: { type: 'costs_map', label: 'Costs & Economy' },
            sockets: { type: 'sockets_group', label: 'Sockets Allocation' },
            modifications: { type: 'modifications_list', label: 'Modifications & Enhancements' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            weight: { type: 'number', label: 'Weight (kg)' },
            sp: { type: 'number', label: 'Structure Points (SP)' },
            dr: { type: 'number', label: 'Damage Resist (DR)' },
            workspace_scale: { type: 'select', options: ['Belt', 'Bench', 'Bay', 'Facility'], label: 'Workspace Scale' },
            computer_pr: { type: 'number', label: 'Processor Rating (PR)' },
            software_level: { type: 'number', label: 'Software Level' },
            epr_rating: { type: 'number', label: 'EPR Rating' },
            supply_die: { type: 'select', options: ['None', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20'], label: 'Supply Die' },
            enhancement_type: { type: 'select', options: ['Passive', 'Active', 'Symbiotic'], label: 'Meta-Tech Type' },
            invocation_rank: { type: 'number', label: 'Invocation Rank' },
            scale_tier: { type: 'select', options: ['Personal', 'Vehicle', 'Strategic'], label: 'Scale Tier' },
            daily_charges: { type: 'number', label: 'Daily Charges' },
            description: { type: 'textarea' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            gear_category: { label: 'CATEGORIES', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            availability: { label: 'AVAILABILITY', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
        }
    },
    weaponry: {
        label: 'Weaponry',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'tech_level', 'meta_level', 'damage', 'classification', 'effect', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Weapon Name' },
            description: { type: 'textarea' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            costs: { type: 'costs_map', label: 'Weapon Costs & Economy' },
            sockets: { type: 'sockets_group', label: 'Sockets & Allocation' },
            modifications: { type: 'modifications_list', label: 'Modifications & Attachments' },
            critical_details: { type: 'critical_details', label: 'Critical Details' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            special: { type: 'multiselect', source: 'special', manageable: true, label: 'Special' },
            area: { type: 'multiselect', source: 'area', manageable: true },
            effect: { type: 'multiselect', source: 'effect', manageable: true },
            range: { type: 'text', label: 'Range' },
            target: { type: 'multiselect', source: 'target', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            classification: { type: 'select', options: ['Melee (Slashing)', 'Melee (Blunt)', 'Melee (Piercing)', 'Ranged (Ballistic)', 'Heavy (Ballistic)', 'Ranged (Energy)', 'Heavy (Energy)'] },
            damage: { type: 'text', label: 'Damage (DMG)' },
            damage_type: { type: 'select', options: ['Kinetic', 'Force', 'Thermal (Pyro/Cryo)', 'Voltic (Electrical)', 'Sonic', 'Corrosive (Acid)', 'Psychic/Metaphysical'] },
            ap: { type: 'number', label: 'Penetration (AP)' },
            ammunition: { type: 'text', label: 'Ammunition / Capacity' },
            power_source: { type: 'text', label: 'Power Source' },
            faction_skin: { type: 'select', source: 'factions', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            accuracy: { type: 'number' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            attack_rate: { type: 'text', label: 'Rate of Fire' },
            wielding: { type: 'select', options: ['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted'] },
            component: { type: 'multiselect', source: 'component', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            availability: { label: 'AVAILABILITY', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            special: { label: 'SPECIAL', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            mode: { label: 'MODES', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            critical_effect: { label: 'CRITICAL EFFECTS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            creator: { label: 'CREATORS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
        }
    },
    armoring: {
        label: 'Armoring',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'tech_level', 'meta_level', 'category', 'resistance', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Armor Name' },
            description: { type: 'textarea' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            costs: { type: 'costs_map', label: 'Armor Costs & Economy' },
            sockets: { type: 'sockets_group', label: 'Sockets & Allocation' },
            modifications: { type: 'modifications_list', label: 'Modifications & Attachments' },
            critical_details: { type: 'critical_details', label: 'Critical Details' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            material: { type: 'multiselect', source: 'material', manageable: true },
            body_locations: { type: 'multiselect', source: 'body_location', manageable: true },
            coverage: { type: 'select', options: ['Partial', 'Standard', 'Sealed', 'Reinforced', 'Bulwark'] },
            max_dex: { type: 'number', label: 'Max Dexterity Bonus' },
            mobility_penalty: { type: 'number', label: 'Mobility Penalty' },
            faction_skin: { type: 'select', source: 'factions', manageable: true },
            carried_shield: { type: 'text' },
            category: { type: 'select', options: ['Jewelry', 'Device', 'Lightweight', 'Mediumweight', 'Heavyweight', 'Mecha', 'Structure'] },
            resistance: { type: 'multiselect', source: 'resistance', manageable: true },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            availability: { label: 'AVAILABILITY', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            material: { label: 'MATERIALS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            resistance: { label: 'RESISTANCES', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            creator: { label: 'CREATORS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            design: { label: 'DESIGNS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
            classification: { label: 'CLASSIFICATIONS', directory_columns: ['name', 'description'], fields: { name: { type: 'text', required: true }, description: { type: 'textarea' } } },
        }
    },
    mecha: {
        label: 'Mecha',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'size', 'frame', 'tech_level', 'meta_level', 'craft_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Mecha Name' },
            domain: { type: 'text', label: 'Operational Domain' },
            size: { type: 'select', options: ['Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'Super Gargantuan', 'Mega Colossal'], label: 'Size Category' },
            frame: { type: 'select', options: ['Creature', 'Humanoid', 'Industrial', 'Personal', 'Platform', 'Racing', 'Walker', 'Winged'], label: 'Body Type (Frame)' },
            faction_skin: { type: 'select', source: 'factions', manageable: true, label: 'Manufacturer (Cultural Skin)' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)', default: 0 },
            costs: { type: 'costs_map', label: 'Mecha Costs & Economy' },
            sockets: { type: 'sockets_group', label: 'Mounts & Hardpoints' },
            modifications: { type: 'modifications_list', label: 'Installed Modules & Weapons' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            craft_dc: { type: 'number', label: 'Crafting DC / Wealth Score' },
            sp: { type: 'number', label: 'Structure Points (SP)' },
            dr: { type: 'number', label: 'Damage Resist (DR)' },
            propulsion: { type: 'text', label: 'Primary Propulsion' },
            armor_plating: { type: 'multiselect', source: 'component', manageable: true, label: 'Armor Plating' },
            vft_mode: { type: 'text', label: 'Variable Form Technology (VFT)' },
            pilot_agility: { type: 'number', label: 'Pilot Agility Mod' },
            handling: { type: 'number', label: 'Handling Modifier' },
            description: { type: 'textarea' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    architecture: {
        label: 'Architecture',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'style', 'footprint', 'tech_level', 'meta_level', 'sp', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Structure / Blueprint Name' },
            style: { type: 'select', source: 'factions', label: 'Architectural Style (Skin)', manageable: true },
            footprint: { 
                type: 'select', 
                label: 'Footprint (Size)', 
                options: ['Miniscule', 'Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal', 'Enormous', 'Titanic', 'Super Gargantuan', 'Mega Colossal'] 
            },
            height_class: { 
                type: 'select', 
                label: 'Height Class', 
                options: ['Single', 'Duplex', 'Multi-Story', 'Mid-Rise', 'High-Rise', 'Skyscraper'] 
            },
            stories: { type: 'number', label: 'Stories' },
            frame: { 
                type: 'select', 
                label: 'Frame Configuration', 
                options: ['Industrial', 'Standard', 'Elevated', 'Tower', 'Subterranean', 'Biomimetic', 'Dynamic', 'Palatial'] 
            },
            environment: { 
                type: 'select', 
                label: 'Environment Modifiers', 
                options: ['Standard', 'Low Gravity', 'High Gravity', 'Vacuum / Toxic / Corrosive', 'Liquid (Aquatic)'] 
            },
            propulsion: { 
                type: 'select', 
                label: 'Mobility / Propulsion', 
                options: ['None (Static)', 'Ground Crawler', 'Independent Suspension', 'Aquatic Flotilla', 'Supercavitation', 'Heavy Hover', 'Orbital Station-Keeping', 'Heavy VTOL System', 'Arcane Levitation', 'Aerial Grav-Spire'] 
            },
            tech_level: { type: 'number', label: 'Tech Level (TL)', default: 3 },
            meta_level: { type: 'number', label: 'Meta Level (ML)', default: 0 },
            costs: { type: 'costs_map', label: 'Construction Costs & Budget' },
            sockets: { type: 'sockets_group', label: 'Module Capacity & Mounts' },
            modifications: { type: 'modifications_list', label: 'Facilities & Hardpoints' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            sp: { type: 'number', label: 'Structure Points (SP)' },
            dr: { type: 'number', label: 'Damage Resist (DR)' },
            design_dc: { type: 'number', label: 'Crafting DC / Wealth Score' },
            security_level: { type: 'select', label: 'Security Level', options: ['Open', 'Restricted', 'High Security', 'Black-Site', 'Quarantine'] },
            primary_purpose: { type: 'text', label: 'Primary Purpose / Function' },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    other: {
        label: 'Other',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'description', 'weight'],
        fields: {
            name: { type: 'text', required: true, label: 'Item Name' },
            description: { type: 'textarea' },
            costs: { type: 'costs_map', label: 'Costs & Economy' },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            weight: { type: 'number' },
            tech_level: { type: 'number', label: 'Tech Level (TL)' },
            meta_level: { type: 'number', label: 'Meta Level (ML)' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    user_guide: {
        label: 'USER GUIDE',
        viewType: 'guide',
        hideFromMenu: true,
        hideFromDevMenu: true
    },
    societies: {
        label: 'SOCIETIES',
        hideFromMenu: true,
        viewType: 'table',
        directory_columns: ['name', 'description', 'tech_level', 'meta_level'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' },
            agriculture: { type: 'select', source: 'society_agriculture', label: 'Agriculture', manageable: true },
            architecture: { type: 'select', source: 'society_architecture', label: 'Architecture', manageable: true },
            biotechnology: { type: 'select', source: 'society_biotechnology', label: 'Biotechnology', manageable: true },
            commerce: { type: 'select', source: 'society_commerce', label: 'Commerce', manageable: true },
            communication: { type: 'select', source: 'society_communication', label: 'Communication', manageable: true },
            devices: { type: 'select', source: 'society_devices', label: 'Devices', manageable: true },
            education: { type: 'select', source: 'society_education', label: 'Education', manageable: true },
            energy: { type: 'select', source: 'society_energy', label: 'Energy', manageable: true },
            manufacturing: { type: 'select', source: 'society_manufacturing', label: 'Manufacturing', manageable: true },
            materials: { type: 'select', source: 'society_materials', label: 'Materials', manageable: true },
            medicine: { type: 'select', source: 'society_medicine', label: 'Medicine', manageable: true },
            synthetics: { type: 'select', source: 'society_synthetics', label: 'Synthetics', manageable: true },
            weaponry: { type: 'select', source: 'society_weaponry', label: 'Weaponry', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
        subcategories: {
            society_agriculture: { label: 'AGRICULTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_architecture: { label: 'ARCHITECTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_biotechnology: { label: 'BIOTECHNOLOGY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_commerce: { label: 'COMMERCE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_communication: { label: 'COMMUNICATION', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_devices: { label: 'DEVICES', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_education: { label: 'EDUCATION', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_energy: { label: 'ENERGY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_manufacturing: { label: 'MANUFACTURING', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_materials: { label: 'MATERIALS', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_medicine: { label: 'MEDICINE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_society: { label: 'SOCIETY STRUCTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_synthetics: { label: 'SYNTHETICS', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_weaponry: { label: 'SOCIETY WEAPONRY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifiers: { type: 'modifiers_list', label: 'Universal Modifiers' }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } }
        }
    },
    prerequisite: {
        label: 'PREREQUISITES',
        hideFromMenu: true,
        directory_columns: ['name', 'aspect', 'aspect_subtype', 'value', 'dc'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' },
            aspect: { type: 'select', options: ['attribute', 'skill', 'combat', 'meta', 'other'] },
            aspect_subtype: { type: 'select' },
            value: { type: 'number' },
            dc: { type: 'number', label: 'DC' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            cp: { type: 'number', label: 'CP' }
        }
    },
    modifier: {
        label: 'MODIFIERS',
        hideFromMenu: true,
        directory_columns: ['name', 'aspect', 'aspect_subtype', 'value', 'note', 'cp'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            aspect: { type: 'select', options: ['attribute', 'skill', 'combat', 'other', 'feature'] },
            aspect_subtype: { type: 'select' },
            bonus_scope: { type: 'radio', label: 'Bonus Scope', options: ['any', 'specific'], default: 'any' },
            bonus_feature_categories: { type: 'multiselect', label: 'Bonus Feature Categories', options: ['any', 'ability', 'combat', 'meta', 'general', 'karma', 'skill', 'exotic'] },
            bonus_skill_categories: { type: 'multiselect', label: 'Bonus Skill Categories', options: ['any', 'mental', 'physical', 'social', 'combat', 'meta'] },
            bonus_attribute_options: { type: 'multiselect', label: 'Bonus Attribute Options', options: ['Any Attribute', 'Any Primary Attribute', 'Any Sub-Attribute', 'Strength', 'Might', 'Agility', 'Reflex', 'Stamina', 'Fortitude', 'Constitution', 'Intellect', 'Logic', 'Wisdom', 'Will', 'Charisma', 'Etiquette'] },
            skill_bonus_type: { type: 'radio', label: 'Skill Bonus Type', options: ['adjust', 'grant'], default: 'adjust' },
            granted_skill_id: { type: 'select', source: 'skills', label: 'Granted Skill' },
            value: { type: 'number' },
            modifier_type: { type: 'radio', label: 'Modifier Type', options: ['constant', 'situational', 'optional', 'temporary'] },
            dc: { type: 'number', label: 'DC' },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' },
            cp: { type: 'number' }
        }
    },
    area: {
        label: 'AREA PATTERNS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    effect: {
        label: 'EFFECT TYPES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    range: {
        label: 'RANGES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    target: {
        label: 'TARGET SPECIFICATIONS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    critical_success_effect: {
        label: 'CRITICAL SUCCESS EFFECTS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    critical_failure_effect: {
        label: 'CRITICAL FAILURE EFFECTS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    creator: {
        label: 'CREATORS & MANUFACTURERS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    design: {
        label: 'DESIGNS & SCHEMATICS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    component: {
        label: 'COMPONENTS & MODULES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    classification: {
        label: 'CLASSIFICATIONS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    // --- AIME Narrative Categories ---
    universe: {
        label: 'UNIVERSES',
        viewType: 'table',
        directory_columns: ['name', 'description', 'scale'],
        fields: {
            name: { type: 'text', required: true, label: 'Universe Name' },
            description: { type: 'textarea', aiEnabled: true, label: 'Cosmology & Origins' },
            scale: { type: 'select', options: ['Multiverse', 'Galaxy', 'Solar System', 'Single Planet', 'Microcosm'] },
            laws_of_physics: { type: 'textarea', label: 'Physical Laws & Magic Systems' },
            history: { type: 'textarea', label: 'Cosmic History' },
            note: { type: 'textarea' }
        }
    },
    world: {
        label: 'WORLDS',
        viewType: 'table',
        directory_columns: ['name', 'universe', 'description'],
        fields: {
            name: { type: 'text', required: true, label: 'World Name' },
            universe: { type: 'select', source: 'universe', manageable: true },
            description: { type: 'textarea', aiEnabled: true },
            geography: { type: 'textarea', label: 'Geography & Climate' },
            biosphere: { type: 'textarea', label: 'Flora & Fauna' },
            culture: { type: 'textarea', label: 'Dominant Cultures' },
            note: { type: 'textarea' }
        }
    },
    setting: {
        label: 'SETTINGS',
        viewType: 'table',
        directory_columns: ['name', 'world', 'description'],
        fields: {
            name: { type: 'text', required: true, label: 'Setting/Location Name' },
            world: { type: 'select', source: 'world', manageable: true },
            description: { type: 'textarea', aiEnabled: true, label: 'Atmosphere & Vibe' },
            points_of_interest: { type: 'textarea', label: 'Points of Interest' },
            inhabitants: { type: 'textarea', label: 'Notable Inhabitants' },
            note: { type: 'textarea' }
        }
    },
    philosophy: {
        label: 'PHILOSOPHIES',
        viewType: 'table',
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true, label: 'Belief/Philosophy Name' },
            description: { type: 'textarea', aiEnabled: true, label: 'Core Tenets' },
            origin: { type: 'textarea', label: 'Origin & Founders' },
            practices: { type: 'textarea', label: 'Practices & Rituals' },
            note: { type: 'textarea' }
        }
    },
    // --- Auxiliary & Subcategory Reference Collections (Top-Level Mapped) ---
    gear_category: {
        label: 'GEAR CATEGORIES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    availability: {
        label: 'AVAILABILITY RATINGS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    special: {
        label: 'WEAPON SPECIALS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    mode: {
        label: 'WEAPON & ARMOR MODES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    critical_effect: {
        label: 'CRITICAL EFFECTS',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    material: {
        label: 'MATERIALS & COMPOSITES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    resistance: {
        label: 'RESISTANCES & DEFENSES',
        hideFromMenu: true,
        directory_columns: ['name', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea' }
        }
    },
    society_agriculture: {
        label: 'SOCIETY: AGRICULTURE',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_architecture: {
        label: 'SOCIETY: ARCHITECTURE',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_biotechnology: {
        label: 'SOCIETY: BIOTECHNOLOGY',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_commerce: {
        label: 'SOCIETY: COMMERCE',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_communication: {
        label: 'SOCIETY: COMMUNICATION',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_devices: {
        label: 'SOCIETY: DEVICES',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_education: {
        label: 'SOCIETY: EDUCATION',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_energy: {
        label: 'SOCIETY: ENERGY',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_manufacturing: {
        label: 'SOCIETY: MANUFACTURING',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_materials: {
        label: 'SOCIETY: MATERIALS',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_medicine: {
        label: 'SOCIETY: MEDICINE',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_society: {
        label: 'SOCIETY: STRUCTURE',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_synthetics: {
        label: 'SOCIETY: SYNTHETICS',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    society_weaponry: {
        label: 'SOCIETY: WEAPONRY',
        hideFromMenu: true,
        directory_columns: ['name', 'level', 'description'],
        fields: {
            name: { type: 'text', required: true },
            level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] },
            description: { type: 'textarea' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    }
};

export const DEVELOPMENT_FIELDS_GROUPS = [
  {
    id: 'system',
    label: 'System & Core Rules',
    icon: '⚙️',
    description: 'Foundational prerequisites, math formulas, and modifier logic applied system-wide.'
  },
  {
    id: 'species_anatomy',
    label: 'Species, Anatomy & Traits',
    icon: '🧬',
    description: 'Biological taxonomy, movement profiles, scaling factors, traits, and cybernetic locations.'
  },
  {
    id: 'metaphysics_combat',
    label: 'Metaphysics & Combat Rules',
    icon: '🔮',
    description: 'Spell/discipline patterns, area shapes, ranges, targets, and critical outcome triggers.'
  },
  {
    id: 'equipment_crafting',
    label: 'Equipment, Crafting & Manufacturing',
    icon: '🛠️',
    description: 'Item classifications, manufacturing schematics, components, material resistances, and weapon modes.'
  },
  {
    id: 'societies_spheres',
    label: 'Societies & Spheres of Development',
    icon: '🏛️',
    description: 'Civilization structures and the 14 technological/cultural spheres of societal progression.'
  }
];

export const DEVELOPMENT_FIELDS_REGISTRY = [
  // System & Core Rules
  { key: 'prerequisite', group: 'system', label: 'Prerequisites', icon: '📋', desc: 'Prerequisite condition gates (attributes, skills, DC thresholds) required for features and items.' },
  { key: 'modifier', group: 'system', label: 'Modifiers', icon: '⚙️', desc: 'Constant, situational, and bonus modifiers altering character statistics and capabilities.' },

  // Species, Anatomy & Traits
  { key: 'species_type', group: 'species_anatomy', label: 'Species Types', icon: '🧬', desc: 'Biological and synthetic classifications (Humanoid, Cybernetic, Xenobiological, etc.).' },
  { key: 'species_size', group: 'species_anatomy', label: 'Species Sizes & Scaling', icon: '📐', desc: 'Size categories, scaling multipliers, height/weight boundaries, and reach modifiers.' },
  { key: 'species_movement', group: 'species_anatomy', label: 'Species Movements', icon: '🏃', desc: 'Locomotion methods (Bipedal, Flight, Burrowing, Aquatic, Zero-G, etc.).' },
  { key: 'trait', group: 'species_anatomy', label: 'Traits', icon: '✨', desc: 'Inherent species, origin, and occupational characteristics and biological traits.' },
  { key: 'augmentation_type', group: 'species_anatomy', label: 'Augmentation Types', icon: '🦾', desc: 'Cybernetic, bioware, nanotech, and esoteric augmentation classifications.' },
  { key: 'body_location', group: 'species_anatomy', label: 'Body Locations', icon: '🫀', desc: 'Anatomical installation slots for cybernetics, armor plates, and modules.' },

  // Metaphysics & Combat Rules
  { key: 'disciplines', group: 'metaphysics_combat', label: 'Disciplines', icon: '🔮', desc: 'Metaphysical schools and magical/psionic traditions and skill associations.' },
  { key: 'area', group: 'metaphysics_combat', label: 'Area Patterns', icon: '🌐', desc: 'Area of effect geometry (Radius, Cone, Line, Wall, Cube, Aura, Chain).' },
  { key: 'effect', group: 'metaphysics_combat', label: 'Effect Types', icon: '⚡', desc: 'Energy and metaphysical damage profiles (Thermal, Kinetic, Cryo, Psionic, EMP).' },
  { key: 'range', group: 'metaphysics_combat', label: 'Ranges', icon: '🎯', desc: 'Standard tactical ranges (Touch, Close, Medium, Long, Extreme, Planetary).' },
  { key: 'target', group: 'metaphysics_combat', label: 'Target Specifications', icon: '🎯', desc: 'Targeting rules and restrictions (Self, Single Creature, Point in Space, Object).' },
  { key: 'critical_effect', group: 'metaphysics_combat', label: 'Critical Effects', icon: '💥', desc: 'Weapon critical strike outcome tables and lingering conditions.' },
  { key: 'critical_success_effect', group: 'metaphysics_combat', label: 'Critical Success Effects', icon: '🌟', desc: 'Bonus outcomes on natural/critical successes in spells and weapons.' },
  { key: 'critical_failure_effect', group: 'metaphysics_combat', label: 'Critical Failure Effects', icon: '⚠️', desc: 'Mishap, backlash, and fumble outcome tables on critical failures.' },

  // Equipment, Crafting & Manufacturing
  { key: 'gear_category', group: 'equipment_crafting', label: 'Gear Categories', icon: '🎒', desc: 'Categorical grouping for general adventuring supplies, tools, and electronics.' },
  { key: 'availability', group: 'equipment_crafting', label: 'Availability Ratings', icon: '🏷️', desc: 'Market rarity, legality, and black-market procurement difficulty ratings.' },
  { key: 'creator', group: 'equipment_crafting', label: 'Creators & Manufacturers', icon: '🏭', desc: 'Corporate megacorps, artisan guilds, alien foundries, and weapon forges.' },
  { key: 'design', group: 'equipment_crafting', label: 'Designs & Schematics', icon: '📜', desc: 'Chassis archetypes, architectural frameworks, and styling blueprints.' },
  { key: 'component', group: 'equipment_crafting', label: 'Components & Modules', icon: '🧩', desc: 'Internal hardware parts, modular attachments, sub-assemblies, and mods.' },
  { key: 'classification', group: 'equipment_crafting', label: 'Classifications', icon: '🗂️', desc: 'Functional role classifications across weapons, armors, and vehicles.' },
  { key: 'material', group: 'equipment_crafting', label: 'Materials & Composites', icon: '🧱', desc: 'Metals, polymers, carbon weaves, crystal matrices, and alloy compositions.' },
  { key: 'resistance', group: 'equipment_crafting', label: 'Resistances & Defenses', icon: '🛡️', desc: 'Armor defensive types, kinetic shielding, energy deflection, and immunity ratings.' },
  { key: 'mode', group: 'equipment_crafting', label: 'Weapon & Armor Modes', icon: '🔄', desc: 'Operational firing modes (Single, Burst, Full-Auto, Charge, Defensive Brace).' },
  { key: 'special', group: 'equipment_crafting', label: 'Weapon Specials', icon: '⭐', desc: 'Unique weapon mechanics, specialized properties, and handling quirks.' },

  // Societies & Spheres of Development
  { key: 'societies', group: 'societies_spheres', label: 'Societies Master', icon: '🏛️', desc: 'Complete societal profiles defining culture, tech/meta milestones, and spheres.' },
  { key: 'society_agriculture', group: 'societies_spheres', label: 'Society: Agriculture', icon: '🌾', desc: 'Food production, farming technologies, hydroponics, and ecosystem synthesis.' },
  { key: 'society_architecture', group: 'societies_spheres', label: 'Society: Architecture', icon: '🏙️', desc: 'Urban engineering, habitat construction, dome architecture, and megastructures.' },
  { key: 'society_biotechnology', group: 'societies_spheres', label: 'Society: Biotechnology', icon: '🧬', desc: 'Genetics, cloning, bio-engineering, neural crafting, and organism design.' },
  { key: 'society_commerce', group: 'societies_spheres', label: 'Society: Commerce', icon: '💰', desc: 'Economic models, banking networks, trade routes, currency, and resource exchange.' },
  { key: 'society_communication', group: 'societies_spheres', label: 'Society: Communication', icon: '📡', desc: 'Sub-space relays, ansible networks, holonet infrastructure, and telemetry.' },
  { key: 'society_devices', group: 'societies_spheres', label: 'Society: Devices', icon: '📱', desc: 'Consumer electronics, personal computing, sensors, tools, and apparatus.' },
  { key: 'society_education', group: 'societies_spheres', label: 'Society: Education', icon: '🎓', desc: 'Knowledge institutions, neural archives, apprenticeships, and academies.' },
  { key: 'society_energy', group: 'societies_spheres', label: 'Society: Energy', icon: '⚡', desc: 'Power generation, fusion reactors, antimatter taps, and solar arrays.' },
  { key: 'society_manufacturing', group: 'societies_spheres', label: 'Society: Manufacturing', icon: '🏗️', desc: 'Industrial automated fabrication, nano-forges, mass production, and orbital yards.' },
  { key: 'society_materials', group: 'societies_spheres', label: 'Society: Materials', icon: '🔬', desc: 'Material science, meta-materials, molecular metallurgy, and high-density plating.' },
  { key: 'society_medicine', group: 'societies_spheres', label: 'Society: Medicine', icon: '💉', desc: 'Healthcare infrastructure, cellular regeneration, trauma care, and panaceas.' },
  { key: 'society_society', group: 'societies_spheres', label: 'Society: Structure', icon: '⚖️', desc: 'Government models, legal systems, social stratification, and caste frameworks.' },
  { key: 'society_synthetics', group: 'societies_spheres', label: 'Society: Synthetics', icon: '🤖', desc: 'Artificial intelligence, android rights, synthetic biology, and cybernetics.' },
  { key: 'society_weaponry', group: 'societies_spheres', label: 'Society: Weaponry', icon: '⚔️', desc: 'Military doctrines, planetary defense grids, ordinance, and arms advancement.' }
];

/**
 * Master 7-Tier Universal Field Order Weights
 * Tier 1 (0-99): Core Identity & Classification
 * Tier 2 (100-199): Capabilities & Prerequisites
 * Tier 3 (200-299): Technological & Metaphysical Milestones
 * Tier 4 (300-399): Economy & Universal Sub-Widgets
 * Tier 5 (400-499): Domain-Specific Mechanics & Statistics
 * Tier 6 (500-599): Societal, Tactical & Operational Attributes
 * Tier 7 (600-699): Lore, Rules, AI Generation & Design Notes
 */
export const FIELD_ORDER_WEIGHTS = {
  // Tier 1: Core Identity & Classification
  name: 10,
  title: 15,
  parent_species: 20,
  lineage: 22,
  homeworld: 25,
  stigma: 28,
  entry_type: 30,
  category: 35,
  economic_type: 37,
  type: 40,
  subtype: 42,
  size: 45,
  sizeCategory: 45,
  movement: 50,
  frame: 52,
  footprint: 54,
  height_class: 56,
  stories: 58,
  domain: 60,
  is_specialization: 65,
  base_skill: 68,
  faction_skin: 70,
  style: 72,
  availability: 75,
  rarity: 78,
  starClass: 80,
  orbitalZone: 82,
  threatTier: 85,
  competencyRole: 87,
  designation: 88,
  bossType: 89,
  isSynthetic: 90,

  // Tier 2: Prerequisites & Core Conditions
  prerequisite: 100,
  trait: 110,
  discipline: 120,
  disciplines: 122,
  meta_skill: 125,
  location: 130,
  body_locations: 132,
  skill: 135,
  essential_skills: 138,
  signature_features: 140,
  recommended_occupations: 142,
  recommended_origins: 144,
  recommended_factions: 146,
  level: 150,

  // Tier 3: Technological & Metaphysical Milestones
  tech_level: 200,
  tl: 200,
  techLevel: 200,
  meta_level: 210,
  ml: 210,
  metaLevel: 210,

  // Tier 4: Economy & Universal Sub-Widgets
  costs: 300,
  base_cost: 305,
  trade_code_modifiers: 308,
  modifiers: 310,
  modifications: 320,
  sockets: 330,
  critical_details: 340,
  base_dc: 350,
  craft_dc: 360,
  design_dc: 370,
  wealthModifier: 380,

  // Tier 5: Domain-Specific Mechanics & Statistics
  classification: 400,
  quality: 402,
  durability: 404,
  weight: 406,
  sp: 410,
  dr: 412,
  damage: 415,
  damage_type: 417,
  ap: 420,
  accuracy: 422,
  attack_rate: 424,
  range: 426,
  area: 428,
  effect: 430,
  target: 432,
  cast_time: 434,
  duration: 436,
  wielding: 438,
  modes: 440,
  special: 442,
  ammunition: 444,
  power_source: 446,
  material: 448,
  resistance: 450,
  coverage: 452,
  max_dex: 454,
  mobility_penalty: 456,
  carried_shield: 458,
  propulsion: 460,
  armor_plating: 462,
  vft_mode: 464,
  pilot_agility: 466,
  handling: 468,
  security_level: 470,
  primary_purpose: 472,
  workspace_scale: 474,
  computer_pr: 476,
  software_level: 478,
  epr_rating: 480,
  supply_die: 482,
  enhancement_type: 484,
  invocation_rank: 486,
  scale_tier: 488,
  daily_charges: 490,
  environment: 492,
  origin: 494,
  creator: 496,
  design: 498,
  component: 499,

  // Tier 6: Societal, Planetary & Tactical Attributes
  society: 500,
  archetype: 505,
  sphere: 508,
  core_concept: 510,
  summary: 512,
  quote: 514,
  tactical_role: 516,
  primary_attribute: 518,
  secondary_attribute: 520,
  key_attributes: 522,
  atmosphere: 525,
  hydrography: 528,
  biosphere: 530,
  population: 532,
  government: 535,
  government_type: 536,
  lawLevel: 538,
  law_order: 539,
  starport: 540,
  tradeCodes: 542,
  factionArchetype: 545,
  attitude: 548,
  goals: 550,
  social_strengths: 552,
  social_weaknesses: 554,
  driving_mandate: 556,
  motto: 558,
  core_beliefs: 560,
  social_structure: 562,
  outsider_view: 564,
  leadership: 566,
  succession: 568,
  primary_exports: 570,
  economic_model: 572,
  military_doctrine: 574,
  key_units: 576,
  naval_assets: 578,
  design_language: 580,
  gear_aesthetic: 582,
  lighting_mood: 584,
  colloquialisms: 586,
  symbol_sigil: 588,
  tacticalBehaviors: 590,
  quirks: 592,
  adventureHooks: 594,

  // Tier 7: Lore, Rules, AI Generation & Designer Notes
  description: 600,
  body: 610,
  image_prompt: 620,
  mechanic: 630,
  guide: 640,
  laws_of_physics: 650,
  history: 652,
  geography: 654,
  culture: 656,
  points_of_interest: 658,
  inhabitants: 660,
  practices: 662,
  note: 690,
  parent: 695,
  order: 698
};

/**
 * Returns sorted field keys according to the 7-Tier Universal Master Order.
 *
 * @param {object} fieldsObj - Category field definitions map
 * @returns {string[]} Array of sorted field keys
 */
export function getSortedCategoryFieldKeys(fieldsObj) {
  if (!fieldsObj || typeof fieldsObj !== 'object') return [];
  return Object.keys(fieldsObj).sort((a, b) => {
    const weightA = FIELD_ORDER_WEIGHTS[a] ?? 450;
    const weightB = FIELD_ORDER_WEIGHTS[b] ?? 450;
    if (weightA !== weightB) return weightA - weightB;
    return a.localeCompare(b);
  });
}

