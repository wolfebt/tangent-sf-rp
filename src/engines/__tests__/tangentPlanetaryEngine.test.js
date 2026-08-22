import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseUWP,
  formatUWP,
  getGravityDetails,
  getAtmosphereDetails,
  deriveTradeCodes,
  calculateCommodityModifiers,
  getMarketAvailabilityCap,
  calculateHazardDC,
  generateProceduralPlanet,
  evaluateCivilizationArchetype,
  computePlanetaryStats
} from '../tangentPlanetaryEngine.js';

describe('Tangent SF RP — Phase 5 Planetary Design Calculation Engine (Plan 28)', () => {
  it('parses and formats Universal World Profile (UWP/TWP) strings accurately', () => {
    const raw = 'A:8:6:7:10:4:5:4:3';
    const parsed = parseUWP(raw);

    assert.equal(parsed.starport, 'A');
    assert.equal(parsed.size, 8);
    assert.equal(parsed.atmosphere, 6);
    assert.equal(parsed.hydrography, 7);
    assert.equal(parsed.population, 10);
    assert.equal(parsed.government, 4);
    assert.equal(parsed.lawLevel, 5);
    assert.equal(parsed.techLevel, 4);
    assert.equal(parsed.metaLevel, 3);

    const formatted = formatUWP(parsed);
    assert.equal(formatted, 'A:8:6:7:10:4:5:4:3');
  });

  it('correctly derives gravity profiles and atmospheric conditions', () => {
    const earthGrav = getGravityDetails(6);
    assert.equal(earthGrav.gravityTier, 'Standard');
    assert.equal(earthGrav.gVal, '1.0G');
    assert.equal(earthGrav.carryMult, 1);

    const superEarthGrav = getGravityDetails(8);
    assert.equal(superEarthGrav.gravityTier, 'High');
    assert.equal(superEarthGrav.carryMult, 0.5);

    const zeroAtmos = getAtmosphereDetails(0);
    assert.equal(zeroAtmos.name, 'Vacuum');
    assert.equal(zeroAtmos.gear, 'Vacc Suit');

    const acidAtmos = getAtmosphereDetails(7);
    assert.equal(acidAtmos.name, 'Corrosive');
    assert.equal(acidAtmos.gear, 'Hazmat Suit');
  });

  it('accurately derives all canonical Trade Codes from planetary parameters', () => {
    // 1. Agricultural (Ag): Atmos 4-9, Hydro 4-8, Pop 5-7
    const agriPlanet = { size: 6, atmosphere: 6, hydrography: 6, population: 6, government: 4, lawLevel: 4, techLevel: 3 };
    const agriCodes = deriveTradeCodes(agriPlanet);
    assert.ok(agriCodes.includes('Ag'), 'Should have Ag code');
    assert.ok(agriCodes.includes('Ga'), 'Should have Ga code');
    assert.ok(agriCodes.includes('Ri'), 'Should have Ri code');

    // 2. Asteroid (As) & Vacuum (Va): Size 0, Atmos 0, Hydro 0
    const asteroid = { size: 0, atmosphere: 0, hydrography: 0, population: 2, government: 0, lawLevel: 0, techLevel: 3 };
    const astCodes = deriveTradeCodes(asteroid);
    assert.ok(astCodes.includes('As'), 'Should have As code');
    assert.ok(astCodes.includes('Va'), 'Should have Va code');
    assert.ok(astCodes.includes('Lo'), 'Should have Lo code');

    // 3. Water World (Wa): Hydro 10+
    const oceanWorld = { size: 7, atmosphere: 5, hydrography: 10, population: 5, government: 4, lawLevel: 4, techLevel: 3 };
    const oceanCodes = deriveTradeCodes(oceanWorld);
    assert.ok(oceanCodes.includes('Wa'), 'Should have Wa code');

    // 4. Industrial (In) & High Tech (Ht): Pop 9+, TL 4+
    const industrialCapital = { size: 8, atmosphere: 4, hydrography: 5, population: 10, government: 1, lawLevel: 6, techLevel: 4 };
    const indCodes = deriveTradeCodes(industrialCapital);
    assert.ok(indCodes.includes('In'), 'Should have In code');
    assert.ok(indCodes.includes('Hi'), 'Should have Hi code');
    assert.ok(indCodes.includes('Ht'), 'Should have Ht code');

    // 5. Desert (De) & Non-Ag (Na): Hydro 0, Atmos 2, Pop 7
    const desertWorld = { size: 5, atmosphere: 2, hydrography: 0, population: 7, government: 4, lawLevel: 4, techLevel: 2 };
    const desertCodes = deriveTradeCodes(desertWorld);
    assert.ok(desertCodes.includes('De'), 'Should have De code');
    assert.ok(desertCodes.includes('Na'), 'Should have Na code');
  });

  it('calculates commodity supply and demand market price shifts', () => {
    // Agri world exporting Foodstuffs (surplus discount) and demanding Machinery
    const tradeCodes = ['Ag', 'Ga'];
    const modifiers = calculateCommodityModifiers(tradeCodes);

    const food = modifiers.find(m => m.id === 'foodstuffs');
    assert.ok(food.isSource, 'Food should be source');
    assert.ok(food.localCost < food.baseCost, 'Source food should have export discount');

    const machinery = modifiers.find(m => m.id === 'machinery');
    assert.ok(!machinery.isSource);
  });

  it('calculates market availability cap correctly: (TL * 5) + 10', () => {
    assert.equal(getMarketAvailabilityCap(0), 10);
    assert.equal(getMarketAvailabilityCap(1), 15);
    assert.equal(getMarketAvailabilityCap(2), 20);
    assert.equal(getMarketAvailabilityCap(3), 25);
    assert.equal(getMarketAvailabilityCap(4), 30);
    assert.equal(getMarketAvailabilityCap(5), 35);
  });

  it('procedurally generates worlds with strict Faction Hard Overrides', () => {
    // Syndicate Override: Pop >= 8, Law >= 5, TL 4, Class A Starport
    const syndicateWorld = generateProceduralPlanet({ faction: 'The Syndicate' });
    assert.ok(syndicateWorld.uwpData.population >= 8);
    assert.ok(syndicateWorld.uwpData.lawLevel >= 5);
    assert.equal(syndicateWorld.uwpData.techLevel, 4);
    assert.equal(syndicateWorld.uwpData.starport, 'A');

    // Dracon Dynasty Override: Gov 5
    const draconWorld = generateProceduralPlanet({ faction: 'Dracon Dynasty' });
    assert.equal(draconWorld.uwpData.government, 5);

    // Outworlds Override: TL <= 2, Law <= 3
    const outworld = generateProceduralPlanet({ faction: 'The Outworlds' });
    assert.ok(outworld.uwpData.techLevel <= 2);
    assert.ok(outworld.uwpData.lawLevel <= 3);
  });

  it('evaluates civilization archetypes from 16-domain ratings', () => {
    const utopiaDomains = { energy: 5, society: 5, manufacturing: 5, science: 5 };
    const utopiaArch = evaluateCivilizationArchetype(utopiaDomains);
    assert.equal(utopiaArch.name, 'Post-Scarcity Utopia');

    const bioDomains = { biotechnology: 4, medicine: 4, agriculture: 4 };
    const bioArch = evaluateCivilizationArchetype(bioDomains);
    assert.equal(bioArch.name, 'Bio-Synthesist Collective');
  });

  it('generates complete persistent computed metadata in computePlanetaryStats', () => {
    const formData = {
      name: 'Karkinos Prime',
      size: 6,
      atmosphere: 6,
      hydrography: 6,
      population: 6,
      government: 4,
      lawLevel: 4,
      techLevel: 3,
      metaLevel: 1,
      craft_dc: 20,
      dominant_faction: 'Colonial Trade Union'
    };

    const computed = computePlanetaryStats(formData);

    assert.ok(computed.uwp.includes('6:6:6:6:4:4:3:1'));
    assert.ok(computed.trade_codes.includes('Ag'));
    assert.equal(computed.market_availability_cap, 25);
    assert.equal(computed.survey_credit_value, 2560);
    assert.ok(computed.commodity_exchange.length === 10);
    assert.ok(computed.gravity_profile.tier === 'Standard');
  });
});
