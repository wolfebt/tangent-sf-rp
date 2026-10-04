import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  serializeAimeAsset,
  parseAimeAssetFile,
  batchIngestAimeFiles,
  AIME_SCHEMA_URL,
  AIME_VERSION,
  EXTENSION_TO_TYPE_MAP
} from '../../src/services/aimeAssetFileService.js';
import { getElementFileExtension } from '../../src/pages/Foundry/ElementForge/elementSchemas.js';

describe('AIME Portable Asset File Service (The Art of AI Crafting Parity)', () => {

  const samplePersona = {
    id: 'persona_eva_rostova_01',
    title: 'Captain Eva Rostova',
    name: 'Captain Eva Rostova',
    type: 'Persona',
    guidance: {
      genre: 'Sci-Fi',
      tone: 'Cynical',
      pacing: 'Urgent',
      pov: 'First Person',
      literaryDevices: ['Metaphor', 'Symbolism'],
      structure: 'In Medias Res'
    },
    fields: {
      name: 'Captain Eva Rostova',
      archetype: 'The Disillusioned Veteran',
      oneLinePitch: 'A battle-scarred starship commander haunted by the civilian convoy she was ordered to sacrifice.',
      physicalDescription: 'Tall, wiry frame clad in a weathered naval duster. Cybernetic optic in right eye.',
      personalityMannerisms: 'Terse, dry gallows humor. Constantly rotates a spent kinetic slug between her knuckles.',
      backgroundHistory: 'Served twenty cycles in the Coalition Void Fleet before defecting following the Siege of Theron-9.',
      goalsMotivations: 'External: Keep her renegade crew paid. Internal: Atone for the 4,000 lives lost on Theron-9.',
      strengthsFlaws: 'Strengths: Unshakable tactical calm under fire. Flaws: Crippling insomnia, deep distrust of institutional authority.',
      roleInStory: 'Protagonist and captain of the Venture.',
      relationships: 'Tense partnership with Fixer Thorne; protective mentor to novice engineer Jax.'
    },
    assetHub: [
      {
        assetId: 'setting_venture_bridge',
        assetType: 'Setting',
        assetTitle: 'Starship Venture - Bridge',
        importance: 'high',
        annotation: 'Primary operating domain; claustrophobic and red-alert bathed.'
      },
      {
        assetId: 'tech_chimera_drive',
        assetType: 'Technology',
        assetTitle: 'Project Chimera FTL Drive',
        importance: 'high',
        annotation: 'The experimental drive installed in her ship hold that everyone is hunting.'
      },
      {
        assetId: 'philosophy_void_creed',
        assetType: 'Philosophy',
        assetTitle: 'The Voidfarer Creed',
        importance: 'low',
        annotation: 'Subtle religious superstition recited before sub-light burns.'
      }
    ],
    rpgExtensions: {
      mcmTier: 4,
      tacticalRole: 'Guardian / Commander',
      dbmRef: 'dbm_arch_veteran'
    },
    tags: ['Veteran', 'Commander', 'Renegade']
  };

  test('serializes Persona into canonical AIME portable asset format (.persona)', () => {
    const portableAsset = serializeAimeAsset(samplePersona);

    assert.equal(portableAsset.$schema, AIME_SCHEMA_URL);
    assert.equal(portableAsset.aimeVersion, AIME_VERSION);
    assert.equal(portableAsset.assetType, 'Persona');
    assert.equal(portableAsset.fileExtension, '.persona');
    assert.equal(portableAsset.title, 'Captain Eva Rostova');

    // Layer 1: Guidance verification
    assert.equal(portableAsset.guidance.tone, 'Cynical');
    assert.equal(portableAsset.guidance.pov, 'First Person');
    assert.deepEqual(portableAsset.guidance.literaryDevices, ['Metaphor', 'Symbolism']);

    // Layer 2: Traits verification
    assert.equal(portableAsset.traits.name, 'Captain Eva Rostova');
    assert.equal(portableAsset.traits.archetype, 'The Disillusioned Veteran');

    // Layer 3: Asset Hub verification (importance tiers + directorial annotations)
    assert.equal(portableAsset.assetHub.length, 3);
    assert.equal(portableAsset.assetHub[0].importance, 'high');
    assert.equal(portableAsset.assetHub[0].annotation, 'Primary operating domain; claustrophobic and red-alert bathed.');
    assert.equal(portableAsset.assetHub[2].importance, 'low');

    // RPG Extensions Tray verification
    assert.equal(portableAsset.rpgExtensions.mcmTier, 4);
    assert.equal(portableAsset.rpgExtensions.tacticalRole, 'Guardian / Commander');
  });

  test('round-trips AIME portable asset through JSON serialization and parsing without data loss', () => {
    const serialized = serializeAimeAsset(samplePersona);
    const jsonStr = JSON.stringify(serialized, null, 2);

    const parsed = parseAimeAssetFile(jsonStr, 'captain_eva_rostova.persona');

    assert.equal(parsed.title, 'Captain Eva Rostova');
    assert.equal(parsed.type, 'Persona');
    assert.equal(parsed.guidance.tone, 'Cynical');
    assert.equal(parsed.guidance.pacing, 'Urgent');
    assert.equal(parsed.fields.archetype, 'The Disillusioned Veteran');
    assert.equal(parsed.assetHub.length, 3);
    assert.equal(parsed.assetHub[0].importance, 'high');
    assert.equal(parsed.assetHub[0].annotation, 'Primary operating domain; claustrophobic and red-alert bathed.');
    assert.equal(parsed.rpgExtensions.mcmTier, 4);
  });

  test('correctly maps file extensions for all 7 Core Element Modules', () => {
    assert.equal(getElementFileExtension('World'), '.world');
    assert.equal(getElementFileExtension('Persona'), '.persona');
    assert.equal(getElementFileExtension('Setting'), '.setting');
    assert.equal(getElementFileExtension('Species'), '.species');
    assert.equal(getElementFileExtension('Technology'), '.tech');
    assert.equal(getElementFileExtension('Philosophy'), '.philosophy');
    assert.equal(getElementFileExtension('Scene'), '.scene');

    // Also check extension to type map
    assert.equal(EXTENSION_TO_TYPE_MAP['.world'], 'World');
    assert.equal(EXTENSION_TO_TYPE_MAP['.persona'], 'Persona');
    assert.equal(EXTENSION_TO_TYPE_MAP['.setting'], 'Setting');
    assert.equal(EXTENSION_TO_TYPE_MAP['.species'], 'Species');
    assert.equal(EXTENSION_TO_TYPE_MAP['.tech'], 'Technology');
    assert.equal(EXTENSION_TO_TYPE_MAP['.philosophy'], 'Philosophy');
    assert.equal(EXTENSION_TO_TYPE_MAP['.scene'], 'Scene');
  });

  test('serializes and parses other core element modules (.world, .tech, .scene)', () => {
    const sampleWorld = {
      id: 'world_theron_9',
      title: 'Theron-9',
      type: 'World',
      fields: {
        worldName: 'Theron-9',
        highConcept: 'A tidally locked mining world split between permanent freezing night and scorching daylight.',
        factions: 'Coalition Mining Syndicate, Ash-Walker Nomad Clans',
        timeline: 'Cycle 300: First Strike, Cycle 400: Great Flare',
        physics: 'Extreme planetary magnetic field causes intermittent EMP lightning storms.'
      }
    };

    const worldAsset = serializeAimeAsset(sampleWorld);
    assert.equal(worldAsset.fileExtension, '.world');
    assert.equal(worldAsset.traits.worldName, 'Theron-9');

    const parsedWorld = parseAimeAssetFile(JSON.stringify(worldAsset), 'theron_9.world');
    assert.equal(parsedWorld.title, 'Theron-9');
    assert.equal(parsedWorld.type, 'World');
    assert.equal(parsedWorld.fields.worldName, 'Theron-9');

    const sampleTech = {
      id: 'tech_grav_anchor',
      title: 'Phase-Resonant Grav Anchor',
      type: 'Technology',
      fields: {
        technologyName: 'Phase-Resonant Grav Anchor',
        techLevel: 'Precursor Tier 5',
        functionPurpose: 'Nullifies local gravitational gradients to stabilize sub-orbital docking.'
      }
    };

    const techAsset = serializeAimeAsset(sampleTech);
    assert.equal(techAsset.fileExtension, '.tech');

    const parsedTech = parseAimeAssetFile(JSON.stringify(techAsset), 'grav_anchor.tech');
    assert.equal(parsedTech.type, 'Technology');
    assert.equal(parsedTech.fields.technologyName, 'Phase-Resonant Grav Anchor');
  });

  test('batch ingests multiple simulated files including AIME bundle, portable asset, and markdown', async () => {
    const file1 = {
      name: 'eva.persona',
      text: async () => JSON.stringify(serializeAimeAsset(samplePersona))
    };

    const file2 = {
      name: 'lore_bundle.aime',
      text: async () => JSON.stringify({
        $schema: 'https://tangent-rpg.com/schemas/aime-bundle-v1.json',
        aimeVersion: '1.0',
        bundleType: 'AimeAssetBundle',
        bundleTitle: 'Sample Campaign Lore',
        assets: [
          serializeAimeAsset({ id: 'set_1', title: 'Docking Bay 4', type: 'Setting', fields: { settingName: 'Docking Bay 4' } }),
          serializeAimeAsset({ id: 'spec_1', title: 'Kovian Silicates', type: 'Species', fields: { speciesName: 'Kovian Silicates' } })
        ]
      })
    };

    const file3 = {
      name: 'precursor-relic.md',
      text: async () => `
# **Technology Development Fields**

## Precursor Relic

* **Technology Name:** Precursor Resonator
* **Core Function & Readiness:** Emits high-frequency tachyons
`
    };

    const results = await batchIngestAimeFiles([file1, file2, file3]);

    assert.equal(results.length, 4); // 1 from file1, 2 from file2 bundle, 1 from file3 markdown
    assert.ok(results.every(r => r.success));
    assert.equal(results[0].element.title, 'Captain Eva Rostova');
    assert.equal(results[0].element.type, 'Persona');
    assert.equal(results[1].element.title, 'Docking Bay 4');
    assert.equal(results[1].element.type, 'Setting');
    assert.equal(results[2].element.title, 'Kovian Silicates');
    assert.equal(results[2].element.type, 'Species');
    assert.equal(results[3].element.title, 'Precursor Resonator');
    assert.equal(results[3].element.type, 'Technology');
  });

  test('parses legacy Tangent story element JSON formats backwards compatibly', () => {
    const legacyExport = {
      type: "TangentStoryElement",
      version: "2.0",
      element: {
        id: "scenario_legacy_01",
        title: "Act I: Infiltration",
        type: "Scenario",
        content: "<p>The operative silently drops from the duct...</p>",
        fields: {
          mcmTier: 3
        }
      }
    };

    const parsed = parseAimeAssetFile(JSON.stringify(legacyExport), 'act_1.json');
    assert.equal(parsed.title, 'Act I: Infiltration');
    assert.equal(parsed.type, 'Scenario');
    assert.equal(parsed.fields.mcmTier, 3);
  });
});
