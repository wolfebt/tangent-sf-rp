import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateEquipmentDC,
  calculateEquipmentSockets,
  computeEquipmentStats,
  calculateWeaponDC,
  calculateWeaponSockets,
  computeWeaponStats,
  calculateArmorSP,
  calculateArmorDR,
  calculateArmorDC,
  calculateArmorMobility,
  calculateArmorSockets,
  computeArmorStats
} from '../tangentItemEngines.js';

import { calculateCreditValue } from '../tangentEconEngine.js';

test('Plan 17: Equipment Matrix Engine - DC and Value Calculations', () => {
  // Base DC 15 check -> 640 Credits
  const baseDC15 = calculateEquipmentDC({ baseDC: 15, size: 'Small' });
  assert.equal(baseDC15, 15);
  assert.equal(calculateCreditValue(baseDC15), 640);

  // Tools + Campus scale (+8 DC) -> DC 23
  const campusToolDC = calculateEquipmentDC({ baseDC: 15, size: 'Small', workspaceScale: 'Campus' });
  assert.equal(campusToolDC, 23);

  // Computer PR 3 (+15 DC) + Software Level 2 (+10 DC) on Diminutive (default DC 5) -> DC 30 (40,960 Cr)
  const quantumCyberDeckDC = calculateEquipmentDC({ size: 'Diminutive', computerPR: 3, softwareLevel: 2 });
  assert.equal(quantumCyberDeckDC, 30);
  assert.equal(calculateCreditValue(quantumCyberDeckDC), 40960);

  // Environmental Protection Rating 3 (+10 DC) on Survival Gear (Base 10) + Coalition skin (-5 DC) -> DC 15
  const survivalSuitDC = calculateEquipmentDC({ baseDC: 10, eprRating: 3, skin: 'Coalition' });
  assert.equal(survivalSuitDC, 15);
});

test('Plan 17: Equipment Matrix Engine - Sockets and Full Stats', () => {
  const socketStats = calculateEquipmentSockets('Medium');
  assert.equal(socketStats.baseSockets, 8);
  assert.equal(socketStats.mass, '<25 kg');

  const computed = computeEquipmentStats({
    name: 'Omni-Scanner Pro',
    size: 'Small',
    base_dc: 15,
    computer_pr: 2, // +10 DC -> 25 DC
    software_level: 1 // +5 DC -> 30 DC
  });

  assert.equal(computed.final_dc, 30);
  assert.equal(computed.credit_value, 40960);
  assert.equal(computed.material_cost, 20480);
  assert.equal(computed.ws_threshold, 30);
  assert.equal(computed.complexity_tier, 'Grandmaster');
});

test('Plan 18: Weaponry Matrix Engine - Mod Stacking & Downgrades', () => {
  // Canonical Example: Base Kinetic Pistol (DC 15) + "Accurate +1" (DC 10) + "Disposable" (DC -5) -> Final DC 20 (2,560 Credits)
  const pistolDC = calculateWeaponDC({
    baseDC: 15,
    modifications: ['accurate_1'], // +10 DC
    downgrades: ['disposable'] // -5 DC
  });
  assert.equal(pistolDC, 20);
  assert.equal(calculateCreditValue(pistolDC), 2560);

  // Smart-link (0 sockets, +20 DC), Silencer (1 socket, +15 DC), Extended Mag (1 socket, +15 DC) -> +50 DC on base 20 = 70 DC
  const assaultRifleDC = calculateWeaponDC({
    baseDC: 20,
    modifications: ['smart_link', 'silencer', 'extended_mag']
  });
  assert.equal(assaultRifleDC, 70);

  // Capacity Upgrade (Pack Drum +20 DC) + Coalition skin (-5 DC) on Base 15 -> DC 30
  const heavyGunDC = calculateWeaponDC({
    baseDC: 15,
    capacityUpgrade: 'pack',
    skin: 'Coalition'
  });
  assert.equal(heavyGunDC, 30);
});

test('Plan 18: Weaponry Matrix Engine - Sockets and Full Stats', () => {
  // Medium weapon has 4 sockets
  const socketsWithin = calculateWeaponSockets('Medium', ['silencer', 'reflex_sight', 'laser_sight']); // 1 + 1 + 0 = 2 sockets used
  assert.equal(socketsWithin.baseSockets, 4);
  assert.equal(socketsWithin.usedSockets, 2);
  assert.equal(socketsWithin.remainingSockets, 2);
  assert.equal(socketsWithin.isOverBudget, false);

  // Over budget test
  const socketsOver = calculateWeaponSockets('Tiny', ['underbarrel_launcher']); // Tiny has 2 sockets, launcher is 2 -> at budget; add silencer -> 3 -> over budget
  const socketsOver2 = calculateWeaponSockets(2, ['underbarrel_launcher', 'silencer']);
  assert.equal(socketsOver2.isOverBudget, true);
  assert.equal(socketsOver2.remainingSockets, -1);

  const weaponStats = computeWeaponStats({
    name: 'ARC-9 Plasma Carbine',
    base_dc: 20,
    tl: 3,
    size: 'Medium',
    modifications: ['smart_link', 'extended_mag'], // +20 + 15 = +35 DC -> 55 DC
    capacity_upgrade: 'double', // +10 DC -> 65 DC
    faction_skin: 'Syndicate'
  });

  assert.equal(weaponStats.final_dc, 65);
  assert.equal(weaponStats.socket_budget.usedSockets, 1); // smart_link is 0, extended_mag is 1
  assert.equal(weaponStats.socket_budget.isOverBudget, false);
});

test('Plan 19: Armor Matrix Engine - Coverage, Materials, and SP Scaling', () => {
  // Mediumweight (Base 20 SP) with Bulwark (x2.0 SP) at TL 4 Nanocarbon (x2.0 SP) -> 20 * 2 * 2 = 80 SP
  const bulwarkSP = calculateArmorSP({
    baseSP: 20,
    size: 'Mediumweight',
    coverage: 'Bulwark',
    tl: 4
  });
  assert.equal(bulwarkSP, 80);

  // Partial coverage (x0.5 SP) at TL 1 Metal (x0.5 SP) on Base 20 -> 20 * 0.5 * 0.5 = 5 SP
  const partialSP = calculateArmorSP({
    baseSP: 20,
    size: 'Mediumweight',
    coverage: 'Partial',
    tl: 1
  });
  assert.equal(partialSP, 5);

  // Dracon Dynasty bonus (+20% SP) on 80 SP -> 96 SP
  const draconSP = calculateArmorSP({
    baseSP: 20,
    size: 'Mediumweight',
    coverage: 'Bulwark',
    tl: 4,
    skin: 'Dracon'
  });
  assert.equal(draconSP, 96);
});

test('Plan 19: Armor Matrix Engine - DR and Mobility Penalties', () => {
  // TL 4 Nanocarbon DR percent = 125%
  const drTL4 = calculateArmorDR({ baseDR: 15, tl: 4, skin: 'Impyrium' });
  assert.equal(drTL4.drPercent, 125);
  assert.equal(drTL4.totalDR, 17); // 15 + 2 Archeotech = 17

  // Bulwark mobility penalty (-2 Max Dex, -10 Move) on Mediumweight (base Max Dex 4) -> Max Dex 2, -10 Move
  const bulwarkMob = calculateArmorMobility({ size: 'Mediumweight', coverage: 'Bulwark' });
  assert.equal(bulwarkMob.maxDex, 2);
  assert.equal(bulwarkMob.movePenalty, -10);

  // Kitin skin (+1 Max Dex, +5 Move mitigation)
  const kitinMob = calculateArmorMobility({ size: 'Mediumweight', coverage: 'Bulwark', skin: 'Kitin' });
  assert.equal(kitinMob.maxDex, 3);
  assert.equal(kitinMob.movePenalty, -5);
});

test('Plan 19: Armor Matrix Engine - DC and Complete Stats', () => {
  // Base 15 + Sealed (+4 DC) + Shield Generator (+10 DC) + Cloaking (+10 DC) = DC 39 (409,600 Cr)
  const sealedDC = calculateArmorDC({
    baseDC: 15,
    coverage: 'Sealed',
    modules: ['shield_generator', 'cloaking']
  });
  assert.equal(sealedDC, 39);

  const armorStats = computeArmorStats({
    name: 'Aegis Null-Carapace',
    base_dc: 20,
    size: 'Heavyweight', // base SP 40, base DC 20
    coverage: 'Reinforced', // x1.5 SP, +6 DC
    tl: 4, // x2.0 SP, 125% DR
    modules: ['shield_generator', 'auto_injector'], // +10 + 5 = +15 DC
    faction_skin: 'Dracon' // +20% SP, +1 DR
  });

  // Base SP 40 * 1.5 * 2.0 = 120 * 1.2 (Dracon) = 144 SP
  assert.equal(armorStats.final_sp, 144);
  // Base DC 20 + 6 (Reinforced) + 15 (Modules) = 41 DC
  assert.equal(armorStats.final_dc, 41);
  assert.equal(armorStats.max_dex, 1); // Heavyweight (2) + Reinforced (-1) = 1
  assert.equal(armorStats.move_penalty, -5);
});
