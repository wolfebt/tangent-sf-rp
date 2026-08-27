import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  stripBracketedConversion,
  extractBaseMeasurement,
  parseHeight,
  formatHeightWithConversion,
  getHeightConversion,
  parseWeight,
  formatWeightWithConversion,
  getWeightConversion
} from '../tangentMeasurementEngine.js';

describe('Tangent Measurement Engine — Imperial / Metric Conversion', () => {

  describe('Height Conversion: Imperial to Metric', () => {
    it('converts 5\'11" to meters with bracketed format', () => {
      const formatted = formatHeightWithConversion('5\'11"');
      assert.strictEqual(formatted, '5\'11" [1.80 m]');
      assert.strictEqual(getHeightConversion('5\'11"'), '1.80 m');
    });

    it('converts 5 ft 11 in to meters with bracketed format', () => {
      const formatted = formatHeightWithConversion('5 ft 11 in');
      assert.strictEqual(formatted, '5 ft 11 in [1.80 m]');
    });

    it('converts 6\' (feet only) to meters', () => {
      const formatted = formatHeightWithConversion('6\'');
      assert.strictEqual(formatted, '6\' [1.83 m]');
    });

    it('converts 6 ft to meters', () => {
      const formatted = formatHeightWithConversion('6 ft');
      assert.strictEqual(formatted, '6 ft [1.83 m]');
    });

    it('converts 72 in (inches only) to meters', () => {
      const formatted = formatHeightWithConversion('72 in');
      assert.strictEqual(formatted, '72 in [1.83 m]');
    });

    it('handles shorthand 5\'11 without trailing quote', () => {
      const formatted = formatHeightWithConversion('5\'11');
      assert.strictEqual(formatted, '5\'11 [1.80 m]');
    });

    it('handles tall characters like 6\'6"', () => {
      const formatted = formatHeightWithConversion('6\'6"');
      assert.strictEqual(formatted, '6\'6" [1.98 m]');
    });
  });

  describe('Height Conversion: Metric to Imperial', () => {
    it('converts 1.85m to feet and inches with bracketed format', () => {
      const formatted = formatHeightWithConversion('1.85m');
      assert.strictEqual(formatted, '1.85m [6\'1"]');
      assert.strictEqual(getHeightConversion('1.85m'), '6\'1"');
    });

    it('converts 1.80 m to feet and inches', () => {
      const formatted = formatHeightWithConversion('1.80 m');
      assert.strictEqual(formatted, '1.80 m [5\'11"]');
    });

    it('converts 185 cm to feet and inches', () => {
      const formatted = formatHeightWithConversion('185 cm');
      assert.strictEqual(formatted, '185 cm [6\'1"]');
    });

    it('converts 2.00 m to feet and inches', () => {
      const formatted = formatHeightWithConversion('2.00 m');
      assert.strictEqual(formatted, '2.00 m [6\'7"]');
    });

    it('converts 175 cm to feet and inches', () => {
      const formatted = formatHeightWithConversion('175 cm');
      assert.strictEqual(formatted, '175 cm [5\'9"]');
    });
  });

  describe('Height Conversion: Idempotency & Edits', () => {
    it('is idempotent when re-formatting an already converted string', () => {
      const initial = formatHeightWithConversion('5\'11"');
      assert.strictEqual(initial, '5\'11" [1.80 m]');
      const reformat = formatHeightWithConversion(initial);
      assert.strictEqual(reformat, '5\'11" [1.80 m]');
    });

    it('updates correctly when user modifies the base value in an existing bracketed string', () => {
      // User changes 5'11" to 6'2" inside "5'11" [1.80 m]"
      const modified = '6\'2" [1.80 m]';
      const updated = formatHeightWithConversion(modified);
      assert.strictEqual(updated, '6\'2" [1.88 m]');
    });

    it('handles when user only leaves the bracketed part', () => {
      const bracketOnly = '[1.85 m]';
      const updated = formatHeightWithConversion(bracketOnly);
      assert.strictEqual(updated, '1.85 m [6\'1"]');
    });
  });

  describe('Weight Conversion: Imperial (Pounds) to Metric (kg)', () => {
    it('converts 180 lbs to kilograms with bracketed format', () => {
      const formatted = formatWeightWithConversion('180 lbs');
      assert.strictEqual(formatted, '180 lbs [81.6 kg]');
      assert.strictEqual(getWeightConversion('180 lbs'), '81.6 kg');
    });

    it('converts 180 lb (singular) to kilograms', () => {
      const formatted = formatWeightWithConversion('180 lb');
      assert.strictEqual(formatted, '180 lb [81.6 kg]');
    });

    it('converts 180# to kilograms', () => {
      const formatted = formatWeightWithConversion('180#');
      assert.strictEqual(formatted, '180# [81.6 kg]');
    });

    it('converts 200 pounds to kilograms', () => {
      const formatted = formatWeightWithConversion('200 pounds');
      assert.strictEqual(formatted, '200 pounds [90.7 kg]');
    });

    it('converts plain numeric weight input (e.g. 180) to lbs with kg in brackets', () => {
      const formatted = formatWeightWithConversion('180');
      assert.strictEqual(formatted, '180 lbs [81.6 kg]');
    });
  });

  describe('Weight Conversion: Metric (kg) to Imperial (Pounds)', () => {
    it('converts 82 kg to pounds with bracketed format', () => {
      const formatted = formatWeightWithConversion('82 kg');
      assert.strictEqual(formatted, '82 kg [180.8 lbs]');
      assert.strictEqual(getWeightConversion('82 kg'), '180.8 lbs');
    });

    it('converts 82kg without space to pounds', () => {
      const formatted = formatWeightWithConversion('82kg');
      assert.strictEqual(formatted, '82kg [180.8 lbs]');
    });

    it('converts 75 kilograms to pounds', () => {
      const formatted = formatWeightWithConversion('75 kilograms');
      assert.strictEqual(formatted, '75 kilograms [165.3 lbs]');
    });

    it('converts 100 kg to pounds', () => {
      const formatted = formatWeightWithConversion('100 kg');
      assert.strictEqual(formatted, '100 kg [220.5 lbs]');
    });
  });

  describe('Weight Conversion: Idempotency & Edits', () => {
    it('is idempotent when re-formatting an already converted weight string', () => {
      const initial = formatWeightWithConversion('180 lbs');
      assert.strictEqual(initial, '180 lbs [81.6 kg]');
      const reformat = formatWeightWithConversion(initial);
      assert.strictEqual(reformat, '180 lbs [81.6 kg]');
    });

    it('updates correctly when user modifies the base weight in an existing bracketed string', () => {
      // User changes 180 lbs to 190 lbs inside "180 lbs [81.6 kg]"
      const modified = '190 lbs [81.6 kg]';
      const updated = formatWeightWithConversion(modified);
      assert.strictEqual(updated, '190 lbs [86.2 kg]');
    });

    it('handles when user changes metric kg inside existing bracketed string', () => {
      const modified = '90 kg [180.8 lbs]';
      const updated = formatWeightWithConversion(modified);
      assert.strictEqual(updated, '90 kg [198.4 lbs]');
    });
  });

});
