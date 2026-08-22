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
        directory_columns: ['name', 'type', 'trait', 'description'],
        fields: {
            name: { type: 'text', required: true },
            description: { type: 'textarea', aiEnabled: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            type: { type: 'multiselect', source: 'species_type', manageable: true },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            movement: { type: 'multiselect', source: 'species_movement', manageable: true },
            trait: { type: 'multiselect', source: 'trait', label: 'Traits', manageable: true },
            inherent_attribute_modifiers: { type: 'attribute_bonus_list', label: 'Inherent Attribute Modifiers (Set Values)' },
            bonus_attribute_points: { type: 'number', label: 'Bonus ANY Attribute Points' },
            specific_skill_bonuses: { type: 'skill_bonus_list', source: 'skills', label: 'Specific Skill Bonuses (Set Values)' },
            bonus_skills: { type: 'number', label: 'Bonus Skills (Allotted Points)' },
            bonus_skill_choices: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Choices Pool', manageable: true },
            inherent_features: { type: 'multiselect', source: 'features', label: 'Inherent Features (Pre-Selected)', manageable: true },
            bonus_features: { type: 'number', label: 'Bonus Features (Allotted Points)' },
            bonus_feature_choices: { type: 'multiselect', source: 'features', label: 'Bonus Feature Choices Pool', manageable: true },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            bonus_disciplines: { type: 'number', label: 'Bonus Disciplines' },
            bonus_special_abilities: { type: 'number', label: 'Bonus Special Abilities' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            note: { type: 'textarea' },
            cp: { type: 'readonlytext', label: 'CP' }
        }
    },
    factions: {
        label: 'FACTIONS',
        viewType: 'table',
        directory_columns: ['name', 'description', 'society'],
        fields: {
            name: { type:'text', required: true},
            description: { type:'textarea', aiEnabled: true },
            society: { type: 'select', source: 'societies', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            inherent_attribute_modifiers: { type: 'attribute_bonus_list', label: 'Inherent Attribute Modifiers (Set Values)' },
            bonus_attribute_points: { type: 'number', label: 'Bonus ANY Attribute Points' },
            specific_skill_bonuses: { type: 'skill_bonus_list', source: 'skills', label: 'Specific Skill Bonuses (Set Values)' },
            bonus_skills: { type: 'number', label: 'Bonus Skills (Allotted Points)' },
            bonus_skill_choices: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Choices Pool', manageable: true },
            inherent_features: { type: 'multiselect', source: 'features', label: 'Inherent Features (Pre-Selected)', manageable: true },
            bonus_features: { type: 'number', label: 'Bonus Features (Allotted Points)' },
            bonus_feature_choices: { type: 'multiselect', source: 'features', label: 'Bonus Feature Choices Pool', manageable: true },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            bonus_disciplines: { type: 'number', label: 'Bonus Disciplines' },
            bonus_special_abilities: { type: 'number', label: 'Bonus Special Abilities' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            attitude: { type: 'textarea' },
            goals: { type: 'textarea' },
            social_strengths: { type: 'textarea' },
            social_weaknesses: { type: 'textarea' },
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
            inherent_attribute_modifiers: { type: 'attribute_bonus_list', label: 'Inherent Attribute Modifiers (Set Values)' },
            bonus_attribute_points: { type: 'number', label: 'Bonus ANY Attribute Points' },
            specific_skill_bonuses: { type: 'skill_bonus_list', source: 'skills', label: 'Specific Skill Bonuses (Set Values)' },
            bonus_skills: { type: 'number', label: 'Bonus Skills (Allotted Points)' },
            bonus_skill_choices: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Choices Pool', manageable: true },
            inherent_features: { type: 'multiselect', source: 'features', label: 'Inherent Features (Pre-Selected)', manageable: true },
            bonus_features: { type: 'number', label: 'Bonus Features (Allotted Points)' },
            bonus_feature_choices: { type: 'multiselect', source: 'features', label: 'Bonus Feature Choices Pool', manageable: true },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            bonus_disciplines: { type: 'number', label: 'Bonus Disciplines' },
            bonus_special_abilities: { type: 'number', label: 'Bonus Special Abilities' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
            inherent_attribute_modifiers: { type: 'attribute_bonus_list', label: 'Inherent Attribute Modifiers (Set Values)' },
            bonus_attribute_points: { type: 'number', label: 'Bonus ANY Attribute Points' },
            specific_skill_bonuses: { type: 'skill_bonus_list', source: 'skills', label: 'Specific Skill Bonuses (Set Values)' },
            bonus_skills: { type: 'number', label: 'Bonus Skills (Allotted Points)' },
            bonus_skill_choices: { type: 'multiselect', source: 'skills', label: 'Bonus Skill Choices Pool', manageable: true },
            inherent_features: { type: 'multiselect', source: 'features', label: 'Inherent Features (Pre-Selected)', manageable: true },
            bonus_features: { type: 'number', label: 'Bonus Features (Allotted Points)' },
            bonus_feature_choices: { type: 'multiselect', source: 'features', label: 'Bonus Feature Choices Pool', manageable: true },
            recommended_features: { type: 'multiselect', source: 'features', label: 'Recommended Features', manageable: true },
            bonus_disciplines: { type: 'number', label: 'Bonus Disciplines' },
            bonus_special_abilities: { type: 'number', label: 'Bonus Special Abilities' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
            bp_chassis: { type: 'number', label: 'Chassis BP Allocation', default: 80 },
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
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            cp: { type: 'number', label: 'CP Cost' },
            costManuallyAdjusted: { type: 'boolean', label: 'Cost Manually Adjusted' },
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
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            mechanic: { type: 'textarea' },
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
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
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
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
        directory_columns: ['name', 'type', 'description', 'design_dc'],
        fields: {
            name: { type:'text', required: true},
            type: { type: 'select', source: 'augmentation_type', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            location: { type: 'multiselect', source: 'body_location', manageable: true },
            description: { type:'textarea', aiEnabled: true},
            tech_level: { type: 'select', label: 'Tech Level', options: [0, 1, 2, 3, 4, 5] },
            meta_level: { type: 'select', label: 'Meta Level', options: [0, 1, 2, 3, 4, 5] },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            component: { type: 'multiselect', source: 'component', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true},
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            cost: { type: 'number', label: 'Cost' },
            availability: { type: 'select', source: 'availability', manageable: true },
            cr: { type: 'number', label: 'CR' },
            restricted: { type: 'boolean', label: 'Restricted' },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            cp: { type: 'number' },
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
        directory_columns: ['name', 'category', 'description', 'cost', 'weight'],
        fields: {
            name: { type: 'text', required: true, label: 'Item Name' },
            description: { type: 'textarea' },
            category: { type: 'select', source: 'gear_category', manageable: true },
            cost: { type: 'number' },
            weight: { type: 'number' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'effect', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Weapon Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
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
            range: { type: 'multiselect', source: 'range', manageable: true },
            target: { type: 'multiselect', source: 'target', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            accuracy: { type: 'number' },
            ap: { type: 'number', label: 'AP' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            attack_rate: { type: 'text', label: 'Rate of Fire' },
            critical_score: { type: 'text', label: 'Critical Score' },
            critical_effect: { type: 'multiselect', source: 'critical_effect', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            wielding: { type: 'select', options: ['One-Handed', 'Two-Handed', 'Versatile', 'Independent', 'Mounted'] },
            component: { type: 'multiselect', source: 'component', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'resistance', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Armor Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
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
            location: { type: 'multiselect', source: 'body_location', manageable: true },
            component: { type: 'multiselect', source: 'component', manageable: true },
            resistance: { type: 'multiselect', source: 'resistance', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
        directory_columns: ['name', 'tl', 'ml', 'description', 'cost', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Mecha Name' },
            description: { type: 'textarea' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            cost: { type: 'number' },
            availability: { type: 'select', source: 'availability', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            size: { type: 'multiselect', source: 'species_size', manageable: true },
            height: { type: 'number' },
            weight: { type: 'number' },
            quality: { type: 'select', options: ['Bad', 'Poor', 'Standard', 'Good', 'Exceptional', 'Mastercrafted'] },
            durability: { type: 'number' },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            skill: { type: 'select', source: 'skills', manageable: true },
            origin: { type: 'multiselect', source: 'origins', manageable: true },
            creator: { type: 'multiselect', source: 'creator', manageable: true },
            design: { type: 'multiselect', source: 'design', manageable: true },
            classification: { type: 'multiselect', source: 'classification', manageable: true, label: 'Classification' },
            personnel: { type: 'text' },
            cargo: { type: 'text' },
            speed: { type: 'text' },
            maneuverability: { type: 'text' },
            control: { type: 'select', options: ['Auto', 'Remote', 'Pilot', 'Crew'] },
            component: { type: 'multiselect', source: 'component', manageable: true },
            critical_success_effect: { type: 'multiselect', source: 'critical_success_effect', manageable: true },
            critical_failure_effect: { type: 'multiselect', source: 'critical_failure_effect', manageable: true },
            component_slots: { type: 'number', label: 'Component Slots' },
            modes: { type: 'multiselect', source: 'mode', manageable: true, label: 'Modes' },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        }
    },
    architecture: {
        label: 'Architecture',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'style', 'scale', 'tl', 'ml', 'cost', 'durability', 'security_level', 'design_dc'],
        fields: {
            name: { type: 'text', required: true, label: 'Structure / Blueprint Name' },
            style: { 
                type: 'select', 
                label: 'Architectural Style', 
                options: ['Cyber-Industrial', 'Brutalist Voidcraft', 'Neo-Gothic High Arcology', 'Bio-Organic Crystalline', 'Nomadic Prefab Modular', 'Ancient Hyper-Structure', 'Subterranean Bunker Complex'] 
            },
            scale: { 
                type: 'select', 
                label: 'Scale & Footprint', 
                options: ['Tactical Room / Bunker', 'Single Installation / Facility', 'Multi-Block Complex', 'Orbital Citadel / Starport', 'Planetary Arcology', 'System Megastructure'] 
            },
            tl: { type: 'number', label: 'TL', default: 3 },
            ml: { type: 'number', label: 'ML', default: 0 },
            cost: { type: 'number', label: 'Credit Cost' },
            durability: { type: 'number', label: 'Structural Durability / HP' },
            power_grid: { type: 'text', label: 'Power & Life Support' },
            security_level: { 
                type: 'select', 
                label: 'Security Level', 
                options: ['Open / Civilian Access', 'Restricted Standard', 'High Security (Tier 3)', 'Black-Site Military Matrix', 'Quantum Encrypted Quarantine'] 
            },
            primary_purpose: { type: 'text', label: 'Primary Purpose / Function' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            design_dc: { type: 'readonlytext', label: 'DESIGN DC' },
            description: { type: 'textarea', aiEnabled: true, label: 'Description / Overview' },
            mechanic: { type: 'textarea', label: 'Tactical Mechanics & Rules' },
            note: { type: 'textarea', label: 'Architect Notes' }
        }
    },
    other: {
        label: 'Other',
        viewType: 'table',
        parent: 'personal_property',
        directory_columns: ['name', 'description', 'cost', 'weight'],
        fields: {
            name: { type: 'text', required: true, label: 'Item Name' },
            description: { type: 'textarea' },
            cost: { type: 'number' },
            weight: { type: 'number' },
            tl: { type: 'number', label: 'TL' },
            ml: { type: 'number', label: 'ML' },
            availability: { type: 'select', source: 'availability', manageable: true },
            prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true },
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
            mechanic: { type: 'textarea' },
            note: { type: 'textarea' }
        },
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
            modifier: { type: 'multiselect', source: 'modifier', manageable: true },
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
            society_agriculture: { label: 'AGRICULTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_architecture: { label: 'ARCHITECTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_biotechnology: { label: 'BIOTECHNOLOGY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_commerce: { label: 'COMMERCE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_communication: { label: 'COMMUNICATION', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_devices: { label: 'DEVICES', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_education: { label: 'EDUCATION', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_energy: { label: 'ENERGY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_manufacturing: { label: 'MANUFACTURING', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_materials: { label: 'MATERIALS', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_medicine: { label: 'MEDICINE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_society: { label: 'SOCIETY STRUCTURE', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_synthetics: { label: 'SYNTHETICS', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } },
            society_weaponry: { label: 'SOCIETY WEAPONRY', directory_columns: ['name', 'level', 'description'], fields: { name: { type: 'text', required: true }, level: { type: 'select', label: 'Level', options: [0, 1, 2, 3, 4, 5] }, description: { type: 'textarea' }, prerequisite: { type: 'multiselect', source: 'prerequisite', manageable: true }, modifier: { type: 'multiselect', source: 'modifier', manageable: true }, mechanic: { type: 'textarea' }, note: { type: 'textarea' } } }
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

