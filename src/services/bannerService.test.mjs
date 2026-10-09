import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  BANNER_COLOR_THEMES, 
  AVAILABLE_BANNER_COLORS, 
  BANNER_SPEEDS, 
  TICKER_SPEEDS, 
  BANNER_MODES, 
  normalizeBannerLines,
  DEFAULT_BANNER_CONFIG
} from './bannerService.js';

describe('Admin Marquee & Banner Service', () => {
  it('includes all 12 requested colors', () => {
    const requiredColors = [
      'amber',
      'amethyst',
      'cyan',
      'emerald',
      'indigo',
      'jade',
      'rose',
      'ruby',
      'saphire',
      'teal',
      'topaz',
      'violet'
    ];

    for (const color of requiredColors) {
      assert.ok(BANNER_COLOR_THEMES[color], `Missing color theme: ${color}`);
      assert.equal(BANNER_COLOR_THEMES[color].id, color);
      assert.ok(BANNER_COLOR_THEMES[color].hex, `Missing hex for ${color}`);
      assert.ok(BANNER_COLOR_THEMES[color].text, `Missing text class for ${color}`);
      assert.ok(BANNER_COLOR_THEMES[color].border, `Missing border class for ${color}`);
      assert.ok(AVAILABLE_BANNER_COLORS.includes(color), `Color ${color} not in AVAILABLE_BANNER_COLORS`);
    }
  });

  it('supports alias lookups for sapphire, crimson, and gold', () => {
    assert.equal(BANNER_COLOR_THEMES.sapphire.id, 'saphire');
    assert.equal(BANNER_COLOR_THEMES.crimson.id, 'ruby');
    assert.equal(BANNER_COLOR_THEMES.gold.id, 'topaz');
  });

  it('provides ticker, scrolling, and static banner modes', () => {
    assert.ok(BANNER_MODES.ticker);
    assert.ok(BANNER_MODES.scrolling);
    assert.ok(BANNER_MODES.static);
  });

  it('provides ticker speeds with character intervals', () => {
    assert.ok(TICKER_SPEEDS.slow.interval >= 40);
    assert.ok(TICKER_SPEEDS.normal.interval > 0);
    assert.ok(TICKER_SPEEDS.fast.interval < TICKER_SPEEDS.normal.interval);
    assert.ok(TICKER_SPEEDS.turbo.interval < TICKER_SPEEDS.fast.interval);
  });

  it('normalizes banner lines cleanly from array, individual lines, or legacy message', () => {
    // 1. From explicit array
    const fromArray = normalizeBannerLines({
      lines: ['Line 1', 'Line 2', 'Line 3', 'Line 4 extra']
    });
    assert.deepEqual(fromArray, ['Line 1', 'Line 2', 'Line 3']);

    // 2. From line1, line2, line3 properties
    const fromKeys = normalizeBannerLines({
      line1: 'Header Alpha',
      line2: 'Sub Beta',
      line3: ''
    });
    assert.deepEqual(fromKeys, ['Header Alpha', 'Sub Beta', '']);

    // 3. From newline-delimited message
    const fromNewlines = normalizeBannerLines({
      message: 'Alpha\nBeta\nGamma'
    });
    assert.deepEqual(fromNewlines, ['Alpha', 'Beta', 'Gamma']);

    // 4. From // delimited legacy message
    const fromDelimited = normalizeBannerLines({
      message: 'Alpha // Beta // Gamma'
    });
    assert.deepEqual(fromDelimited, ['Alpha', 'Beta', 'Gamma']);

    // 5. Fallback
    const fallback = normalizeBannerLines({});
    assert.ok(fallback.length >= 1);
  });

  it('default configuration has 3 lines and ticker mode', () => {
    assert.equal(DEFAULT_BANNER_CONFIG.mode, 'ticker');
    assert.ok(Array.isArray(DEFAULT_BANNER_CONFIG.lines));
    assert.equal(DEFAULT_BANNER_CONFIG.lines.length, 3);
  });
});
