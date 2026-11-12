/**
 * @file codexMatrixAlignment.test.jsx
 * @description Verifies strict asset-type alignment across Codex Matrix modals,
 * synthesizer profiles, ingestion datasets, BASTION synthesis, and computed telemetry.
 */

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CODEX_MATRICES, getMatrixById } from '../codexConfig.js';
import { categoryConfig } from '../../../components/DBM/categoryConfig.js';
import { adaptItemToCodexFormData } from '../codexAssetBridge.js';
import { getSynthesizerProfile } from '../codexSynthesizerConfig.js';
import { getDatasetByKey } from '../codexPromptRegistry.js';
import { CodexAiSynthesizerModal } from '../CodexAiSynthesizerModal.jsx';
import { ComputedOutputPanel } from '../components/ComputedOutputPanel.jsx';
import { OriginConfigurator } from '../components/OriginConfigurator.jsx';
import { OccupationConfigurator } from '../components/OccupationConfigurator.jsx';
import { FactionConfigurator } from '../components/FactionConfigurator.jsx';
import { TraitChoiceModal } from '../../../components/Codex/TraitChoiceModal.jsx';
import { UnifiedRelationalSelectorModal } from '../../../components/DBM/UnifiedRelationalSelectorModal.jsx';
import { synthesizeMatrixWithBastion } from '../../../services/bastionService.js';
import { buildNormalizedSkillsCatalog } from '../../../data/skillsData.js';

const mockDbState = vi.hoisted(() => ({
  dbData: {}
}));

vi.mock('../../../context/DBMContext', () => ({
  useDBM: () => ({ dbData: mockDbState.dbData })
}));

vi.mock('../../../services/audioService', () => ({
  default: {
    playTerminalBeep: vi.fn(),
    playErrorSound: vi.fn()
  },
  AudioService: {
    playTerminalBeep: vi.fn(),
    playErrorSound: vi.fn()
  }
}));

afterEach(() => {
  mockDbState.dbData = {};
  vi.unstubAllEnvs();
});

describe('Codex Matrix & Modal Asset-Type Context Alignment', () => {
  it('resolves explicit ingestion datasets and synthesizer profiles for every asset Codex matrix without cross-domain leaks', () => {
    for (const matrix of CODEX_MATRICES) {
      if (matrix.id === 'ingestion-engine') continue;
      const datasetKey = matrix.ingestionKey || matrix.targetCollection || matrix.id;
      const dataset = getDatasetByKey(datasetKey);
      const profile = getSynthesizerProfile(matrix, datasetKey);

      expect(dataset).toBeTruthy();
      expect(profile).toBeTruthy();

      if (!matrix.id.startsWith('species')) {
        expect(dataset.key).not.toBe('species');
        expect(profile.id).not.toBe('species');
      }
    }
  });

  it('renders Factions Matrix synthesizer modal with explicit Faction Traits UI and zero Species leaks', () => {
    const factionsMatrix = getMatrixById('factions');
    render(
      <CodexAiSynthesizerModal
        isOpen={true}
        onClose={() => {}}
        matrix={factionsMatrix}
        initialDatasetKey="factions"
      />
    );

    // Explicit Faction UI present
    expect(screen.getByText(/Selectable Faction Traits & Polity Perks/i)).toBeTruthy();
    expect(screen.getAllByText(/Canonical Faction Traits Catalog/i).length).toBeGreaterThan(0);

    // Zero Species Package Builder UI or (0 CP) button leak
    expect(screen.queryByText(/Select Cortex Species Traits via pulldown/i)).toBeNull();
    expect(screen.queryByText(/Species Trait \/ Source Pulldown/i)).toBeNull();
    expect(screen.queryByText(/Add Species Trait & Modifier Row/i)).toBeNull();
    expect(screen.queryByText(/Add Attribute Mod/i)).toBeNull();
    expect(screen.queryByText(/Sensory & Psi/i)).toBeNull();
    expect(screen.queryByText(/Mobility & Form/i)).toBeNull();
    expect(screen.queryByText(/PRE-FILL FACTIONS \(0 CP\)/i)).toBeNull();
  });

  it('renders Species Matrix synthesizer modal with the full 20-CP Species Package Builder', () => {
    const speciesMatrix = getMatrixById('species');
    render(
      <CodexAiSynthesizerModal
        isOpen={true}
        onClose={() => {}}
        matrix={speciesMatrix}
        initialDatasetKey="species"
      />
    );

    expect(screen.getByText(/Species Trait & Modifier Adjustments \+ Live 20-CP Cost Tracker/i)).toBeTruthy();
    expect(screen.getByText(/Sensory & Psi/i)).toBeTruthy();
    expect(screen.getByText(/Mobility & Form/i)).toBeTruthy();
  });

  it('omits multi-trait package builders on hardware and single-trait matrices', () => {
    const weaponryMatrix = getMatrixById('weaponry');
    render(
      <CodexAiSynthesizerModal
        isOpen={true}
        onClose={() => {}}
        matrix={weaponryMatrix}
        initialDatasetKey="weaponry"
      />
    );

    expect(screen.queryByText(/Species Trait & Modifier Adjustments/i)).toBeNull();
    expect(screen.queryByText(/Quick-Browser/i)).toBeNull();
    expect(screen.getAllByText(/CR 20 • TL 3/i).length).toBeGreaterThan(0);
  });

  it('restricts physical creature STR Mod / Reach profile in ComputedOutputPanel to embodied scale matrices', () => {
    const factionsMatrix = getMatrixById('factions');
    const speciesMatrix = getMatrixById('species');

    const { unmount } = render(
      <ComputedOutputPanel
        matrix={factionsMatrix}
        formData={{ name: 'Solaris Syndicate', skill_package: 'Diplomacy, Streetwise' }}
        computedValues={{}}
      />
    );
    expect(screen.queryByText(/Physical Scale Profile/i)).toBeNull();
    expect(screen.queryByText(/Reach/i)).toBeNull();
    unmount();

    render(
      <ComputedOutputPanel
        matrix={speciesMatrix}
        formData={{ name: 'Kovian', size: 'Medium' }}
        computedValues={{}}
      />
    );
    expect(screen.getByText(/SPECIES Physical Scale Profile/i)).toBeTruthy();
    expect(screen.getByText(/Reach/i)).toBeTruthy();
  });

  it('parameterizes TraitChoiceModal dynamically using trait.trait_type instead of hardcoded Species copy', () => {
    render(
      <TraitChoiceModal
        isOpen={true}
        trait={{
          id: 'trait-faction-authority',
          name: 'Jurisdictional Mandate',
          trait_type: 'Faction Trait',
          cp: 1,
          description: 'Grants sector jurisdiction.'
        }}
        config={{
          title: 'Configure Jurisdictional Mandate',
          prompt: 'Select sector domain:',
          choiceType: 'skill',
          maxSelections: 1
        }}
      />
    );

    expect(screen.getByText('BASTION Faction Trait Parameterization')).toBeTruthy();
    expect(screen.queryByText('BASTION Species Trait Parameterization')).toBeNull();
  });

  it('synthesizes Factions locally with full faction schema fields and selected Faction Traits without biological leaks', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    window.localStorage.removeItem('tangent_gemini_api_key');

    const factionsMatrix = getMatrixById('factions');
    const profile = getSynthesizerProfile(factionsMatrix, 'factions');

    const result = await synthesizeMatrixWithBastion({
      matrix: factionsMatrix,
      datasetKey: 'factions',
      profile,
      selectedCortexTraits: [
        { id: 'trait-federal-authority', name: 'Federal Authority', cp: 1, trait_type: 'Faction Trait', mechanic: 'Supreme frontier jurisdiction.' }
      ],
      customAdjustmentsPayload: {
        traits: [
          { id: 'trait-federal-authority', name: 'Federal Authority', cp: 1, trait_type: 'Faction Trait' }
        ],
        promptSummary: 'Selected Faction Traits: Federal Authority.'
      },
      categoryParams: {
        faction_type: 'Major Polity',
        government_type: 'Federal Republic'
      },
      targetName: 'Aegis Directorate',
      targetTechLevel: 4,
      targetMetaLevel: 1
    });

    expect(result.name).toBe('Aegis Directorate');
    expect(result.faction_type).toBe('Major Polity');
    expect(result.government_type).toBe('Federal Republic');
    expect(result.skill_package).toBeTruthy();
    expect(Array.isArray(result.traits)).toBe(true);
    expect(result.traits.length).toBe(1);
    expect(result.inherent_attribute_modifiers).toBeUndefined();
    expect(result.movement_modes).toBeUndefined();
    expect(result.cp).toBeUndefined();
    expect(result.skill_points).toBe(20);
  });
});

describe('Fixed 20-SP Skill Pool & Interactive Skill/Feature Catalogs (Origins, Occupations, Factions)', () => {
  it('enforces a non-adjustable fixed 20-point skill pool across Origins, Occupations, and Factions configs and bridges', () => {
    for (const pillarId of ['origins', 'occupations', 'factions']) {
      const matrix = getMatrixById(pillarId);
      expect(matrix).toBeTruthy();

      // No editable skill_points field in Codex Matrix config
      const editableSkillPointsField = (matrix.fields || []).find((f) => f.name === 'skill_points');
      expect(editableSkillPointsField).toBeUndefined();

      // Default values and computeOnSave strictly enforce 20 SP
      expect(matrix.defaultValues?.skill_points).toBe(20);
      const computed = matrix.computeOnSave({ name: 'Test Pillar', skill_points: 35 });
      expect(computed.skill_points).toBe(20);

      // No editable skill_points field in Omnicortex DBM categoryConfig
      expect(categoryConfig[pillarId]?.fields?.skill_points).toBeUndefined();

      // No editable skill_points parameter in Synthesizer Profile
      const synthProfile = getSynthesizerProfile(matrix, pillarId);
      const editableParam = (synthProfile.parameters || []).find((p) => p.key === 'skill_points');
      expect(editableParam).toBeUndefined();

      // Asset bridge overrides incoming arbitrary skill_points back to 20
      const adapted = adaptItemToCodexFormData({ id: `test_${pillarId}`, name: 'Test', skill_points: 12 }, matrix);
      expect(adapted.skill_points).toBe(20);
    }
  });

  it('provides interactive Skill Catalog and Recommended Features (-1 CP) Catalog in OriginConfigurator, OccupationConfigurator, and FactionConfigurator', () => {
    const pillarCases = [
      {
        id: 'origins',
        Component: OriginConfigurator,
        skillTarget: 'society_skills',
        formData: { name: 'Orbital Hab', society_skills: [], recommended_features: [] }
      },
      {
        id: 'occupations',
        Component: OccupationConfigurator,
        skillTarget: 'professional_skills',
        formData: { name: 'Void Engineer', professional_skills: [], recommended_features: [] }
      },
      {
        id: 'factions',
        Component: FactionConfigurator,
        skillTarget: 'skill_package',
        formData: { name: 'Helios Guild', skill_package: '', recommended_features: [] }
      }
    ];

    for (const { Component, skillTarget, formData } of pillarCases) {
      const handleChange = vi.fn();
      const handleOpenPicker = vi.fn();

      const { unmount } = render(
        <Component
          formData={formData}
          onChange={handleChange}
          isEditMode={true}
          onOpenPicker={handleOpenPicker}
          dbData={{}}
        />
      );

      // Fixed 20 SP badge is shown; no adjustable skill points input exists
      expect(screen.getAllByText(/Fixed 20 SP Pool/i).length).toBeGreaterThan(0);
      expect(screen.queryByLabelText(/Skill Points Pool/i)).toBeNull();

      // Inline Skill Catalog & Feature Catalog expanders render populated counts
      const browseSkillBtn = screen.getByRole('button', { name: /Browse Skill Catalog \(\d+\)/i });
      const browseFeatureBtn = screen.getByRole('button', { name: /Browse Feature Catalog \(\d+\)/i });
      expect(browseSkillBtn).toBeTruthy();
      expect(browseFeatureBtn).toBeTruthy();

      // Expand inline Skill Catalog and toggle a canonical skill
      fireEvent.click(browseSkillBtn);
      const acrobaticsBtn = screen.getByRole('button', { name: /Acrobatics/i });
      fireEvent.click(acrobaticsBtn);
      expect(handleChange).toHaveBeenCalled();

      // Expand inline Feature Catalog and verify canonical features render with -1 CP discount
      fireEvent.click(browseFeatureBtn);
      expect(screen.getAllByText(/All Features/i).length).toBeGreaterThan(0);

      // Full Omnicortex Modal buttons pass exact target fields for skills and recommended_features
      const fullSkillBtn = screen.getByRole('button', { name: /Full Skill Catalog/i });
      fireEvent.click(fullSkillBtn);
      expect(handleOpenPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'skills',
          target: skillTarget
        })
      );

      const fullFeatureBtn = screen.getByRole('button', { name: /Full Feature Catalog/i });
      fireEvent.click(fullFeatureBtn);
      expect(handleOpenPicker).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'features',
          target: 'recommended_features'
        })
      );

      unmount();
    }
  });

  it('exposes fixed 20-SP Skill Catalog and Feature Catalog (-1 CP) inside CodexAiSynthesizerModal and BASTION synthesis for Origins, Occupations, and Factions', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    window.localStorage.removeItem('tangent_gemini_api_key');

    for (const pillarId of ['origins', 'occupations', 'factions']) {
      const matrix = getMatrixById(pillarId);
      const { unmount } = render(
        <CodexAiSynthesizerModal
          isOpen={true}
          onClose={() => {}}
          matrix={matrix}
          initialDatasetKey={pillarId}
        />
      );

      expect(screen.getAllByText(/Fixed 20 SP Pool \(Non-Adjustable\)/i).length).toBeGreaterThan(0);
      const skillTab = screen.getByRole('button', { name: /Skill Catalog \(\d+\)/i });
      const featureTab = screen.getByRole('button', { name: /Feature Catalog \(\d+\)/i });
      expect(skillTab).toBeTruthy();
      expect(featureTab).toBeTruthy();

      // Switch to Feature Catalog tab and verify feature category filters appear
      fireEvent.click(featureTab);
      expect(screen.getByRole('button', { name: /\+ Load Concept Features/i })).toBeTruthy();

      unmount();

      // Verify BASTION synthesis merges pinned skills & recommended features and locks skill_points = 20
      const profile = getSynthesizerProfile(matrix, pillarId);
      const synthResult = await synthesizeMatrixWithBastion({
        matrix,
        datasetKey: pillarId,
        profile,
        selectedPillarSkills: ['Athletics', 'Perception'],
        selectedRecommendedFeatures: ['Alertness'],
        categoryParams: { skill_points: 99 },
        targetName: `Test ${pillarId}`
      });

      expect(synthResult.skill_points).toBe(20);
      expect(synthResult.recommended_features).toContain('Alertness');
      if (pillarId === 'origins') {
        expect(synthResult.society_skills).toEqual(expect.arrayContaining(['Athletics', 'Perception']));
      } else if (pillarId === 'occupations') {
        expect(synthResult.professional_skills).toEqual(expect.arrayContaining(['Athletics', 'Perception']));
      } else if (pillarId === 'factions') {
        expect(String(synthResult.skill_package)).toContain('Athletics');
      }
    }
  }, 15000);
});

describe('Skill & Feature Catalog Filter Completeness (Firestore Compound Types & Legacy Deduplication)', () => {
  const pollutedFirestoreSkills = [
    // Compound Firestore `type` records with missing `.group`
    { id: 'combat-ballistic', name: 'Ballistic', type: 'Combat · Modern', governing_attribute: 'Agility' },
    { id: 'social-diplomacy', name: 'Diplomacy', type: 'Social · Manipulation', governing_attribute: 'Charisma' },
    { id: 'mental-know-metaphysics', name: 'Metaphysics', type: 'Mental · Knowledges', governing_attribute: 'Intellect' },
    { id: 'physical-acrobatics', name: 'Acrobatics', type: 'Physical', governing_attribute: 'Agility' },
    // Deprecated legacy records that previously leaked into Mental/Physical
    { id: 'legacy-arcane', name: 'Arcane', type: 'Mental', baseAttr: 'attr-intellect' },
    { id: 'legacy-endurance', name: 'Endurance', type: 'Physical', baseAttr: 'attr-stamina' },
    // Non-skill discipline container stubs that previously polluted Metafocus and overwrote Combat Energy
    { id: 'meta_dimension', name: 'Dimension', type: 'Meta' },
    { id: 'meta_entropy', name: 'Entropy', type: 'Meta' },
    { id: 'meta_illusion', name: 'Illusion', type: 'Meta' },
    { id: 'meta_matter', name: 'Matter', type: 'Meta' },
    { id: 'meta_energy', name: 'Energy', type: 'Meta' },
    // Custom user-authored skill with compound `type` and no `.group`
    { id: 'custom-voidcraft', name: 'Voidcraft Astrogation', type: 'Mental · Vocations', governing_attribute: 'Intellect' }
  ];

  it('normalizes compound Firestore types, strips legacy aliases & discipline stubs, and preserves exact 1.07 counts', () => {
    const normalized = buildNormalizedSkillsCatalog(pollutedFirestoreSkills, { includeSkillGroups: true });

    const groups = normalized.filter((s) => s.group === 'groups');
    const physical = normalized.filter((s) => s.group === 'physical');
    const mental = normalized.filter((s) => s.group === 'mental');
    const social = normalized.filter((s) => s.group === 'social');
    const combat = normalized.filter((s) => s.group === 'combat');
    const meta = normalized.filter((s) => s.group === 'meta');

    expect(groups.length).toBe(11);
    expect(physical.length).toBe(4);
    expect(mental.length).toBe(50); // 49 canonical + 1 custom Voidcraft Astrogation
    expect(social.length).toBe(19);
    expect(combat.length).toBe(8);
    expect(meta.length).toBe(13);

    // Zero deprecated legacy skills or discipline container stubs
    expect(normalized.find((s) => s.name === 'Arcane')).toBeUndefined();
    expect(normalized.find((s) => s.name === 'Endurance')).toBeUndefined();
    expect(normalized.find((s) => s.name === 'Dimension')).toBeUndefined();
    expect(normalized.find((s) => s.name === 'Entropy')).toBeUndefined();
    expect(normalized.find((s) => s.name === 'Illusion')).toBeUndefined();
    expect(normalized.find((s) => s.name === 'Matter')).toBeUndefined();

    // Canonical Combat Energy is preserved under Combat · Advanced (not overwritten by Meta Energy stub)
    const combatEnergy = normalized.find((s) => s.name === 'Energy');
    expect(combatEnergy?.group).toBe('combat');
    expect(combatEnergy?.subcategory).toBe('Advanced');

    // Governing attribute extraction respects 1.07 governing_attribute over stale baseAttr
    const wind = normalized.find((s) => s.name === 'Wind');
    expect(wind?.attrCodes).toEqual(['CHA']);
    expect(wind?.primaryAttrBadge).toBe('CHA');

    const heavyWeapons = normalized.find((s) => s.name === 'Heavy Weapons');
    expect(heavyWeapons?.attrCodes).toEqual(['AGI', 'INT']);
    expect(heavyWeapons?.primaryAttrBadge).toBe('AGI/INT');
  });

  it('populates Combat, Social, Mental, Physical, Metafocus, Skill Groups, Subcategory, and Ability filters in CodexAiSynthesizerModal & Configurators even with Firestore compound types', () => {
    mockDbState.dbData = { skills: pollutedFirestoreSkills };
    const originsMatrix = getMatrixById('origins');

    const { unmount } = render(
      <CodexAiSynthesizerModal
        isOpen={true}
        onClose={() => {}}
        matrix={originsMatrix}
        initialDatasetKey="origins"
      />
    );

    // Primary category pills display exact live counts
    const combatTab = screen.getByRole('button', { name: /^Combat \(8\)$/i });
    const socialTab = screen.getByRole('button', { name: /^Social \(19\)$/i });
    const mentalTab = screen.getByRole('button', { name: /^Mental \(50\)$/i });
    const physicalTab = screen.getByRole('button', { name: /^Physical \(4\)$/i });
    const metaTab = screen.getByRole('button', { name: /^Metafocus \(13\)$/i });
    const skillGroupsTab = screen.getByRole('button', { name: /^Skill Groups \(11\)$/i });

    // Combat filter shows all 8 Combat skills and supports Subcategory drill-down (Modern -> Ballistic & Heavy Weapons)
    fireEvent.click(combatTab);
    expect(screen.getByText(/\+ Ballistic/i)).toBeTruthy();
    expect(screen.getByText(/\+ Ranged/i)).toBeTruthy();
    expect(screen.getByText(/\+ Energy/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Modern \(2\)$/i }));
    expect(screen.getByText(/\+ Ballistic/i)).toBeTruthy();
    expect(screen.getByText(/\+ Heavy Weapons/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Ranged/i)).toBeNull();

    // Social filter shows all 19 Social skills and supports Expression / Manipulation drill-down
    fireEvent.click(socialTab);
    expect(screen.getByText(/\+ Diplomacy/i)).toBeTruthy();
    expect(screen.getByText(/\+ Oratory/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Expression \(12\)$/i }));
    expect(screen.getByText(/\+ Oratory/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Diplomacy/i)).toBeNull();

    // Mental filter shows canonical Mental skills + custom skill, excludes legacy Arcane, and drills into Knowledges
    fireEvent.click(mentalTab);
    expect(screen.queryByText(/\+ Arcane/i)).toBeNull();
    expect(screen.getByText(/\+ Alertness/i)).toBeTruthy();
    expect(screen.getByText(/\+ Voidcraft Astrogation/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Knowledges \(20\)$/i }));
    expect(screen.getByText(/\+ Metaphysics/i)).toBeTruthy();

    // Physical filter shows exact 4 canonical skills without legacy Endurance, and filters by Ability (STR -> Athletics)
    fireEvent.click(physicalTab);
    expect(screen.getByText(/\+ Acrobatics/i)).toBeTruthy();
    expect(screen.getByText(/\+ Stealth/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Endurance/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^STR \(\d+\)$/i }));
    expect(screen.getByText(/\+ Athletics/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Acrobatics/i)).toBeNull();
    // Reset Ability filter back to All
    fireEvent.click(screen.getByRole('button', { name: /^STR \(\d+\)$/i }));

    // Metafocus filter shows exact 13 skills without discipline stubs and drills into Dimension (2)
    fireEvent.click(metaTab);
    expect(screen.getByText(/\+ Attune/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Dimension/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Dimension \(2\)$/i }));
    expect(screen.getByText(/\+ Summoning/i)).toBeTruthy();
    expect(screen.getByText(/\+ Teleport/i)).toBeTruthy();
    expect(screen.queryByText(/\+ Attune/i)).toBeNull();

    // Reset Ability filter to All and verify Skill Groups (11)
    fireEvent.click(skillGroupsTab);
    expect(screen.getByText(/\+ Any Knowledge Skills/i)).toBeTruthy();
    expect(screen.getByText(/\+ Any Non-Combat Skills/i)).toBeTruthy();

    unmount();

    // Verify OriginConfigurator's inline CortexSmartPicker renders complete category, subcategory & ability filters
    const { unmount: unmountOrigin } = render(
      <OriginConfigurator
        formData={{ name: 'Frontier Colony', society_skills: [], recommended_features: [] }}
        onChange={vi.fn()}
        isEditMode={true}
        onOpenPicker={vi.fn()}
        dbData={{ skills: pollutedFirestoreSkills }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Browse Skill Catalog \(\d+\)/i }));
    const smartCombatBtn = screen.getByRole('button', { name: /Combat \(8\)/i });
    fireEvent.click(smartCombatBtn);
    expect(screen.getByRole('button', { name: /^Modern \(2\)$/i })).toBeTruthy();
    expect(screen.getByText('Ballistic')).toBeTruthy();
    unmountOrigin();

    // Verify UnifiedRelationalSelectorModal (Omnicortex Full Skill Catalog modal) renders dynamic counts, Subcategory & Ability filters
    window.localStorage.setItem('tangent_catalog_view_mode', 'table');
    render(
      <UnifiedRelationalSelectorModal
        isOpen={true}
        onClose={() => {}}
        sourceCollection="skills"
        selectedValues={[]}
        onSelect={vi.fn()}
        dbData={{ skills: pollutedFirestoreSkills }}
      />
    );

    expect(screen.getByRole('button', { name: /Skill Groups \(11\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Physical \(4\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Mental \(50\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Social \(19\)/i })).toBeTruthy();
    const fullModalCombatBtn = screen.getByRole('button', { name: /Combat \(8\)/i });
    expect(screen.getByRole('button', { name: /Metafocus \(13\)/i })).toBeTruthy();

    fireEvent.click(fullModalCombatBtn);
    fireEvent.click(screen.getByRole('button', { name: /^Modern \(2\)$/i }));
    expect(screen.getByText('Ballistic')).toBeTruthy();
    expect(screen.getByText('Heavy Weapons')).toBeTruthy();
    expect(screen.queryByText('Ranged')).toBeNull();
    window.localStorage.removeItem('tangent_catalog_view_mode');
  }, 15000);
});
