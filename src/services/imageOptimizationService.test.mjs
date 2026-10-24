import assert from 'node:assert';
import {
  FOLIO_IMAGE_SLOTS,
  MAX_SAFE_IMAGE_BYTES,
  calculateFitDimensions,
  isWebPSupported
} from './imageOptimizationService.js';

console.log('Testing imageOptimizationService...');

// Test 1: Verify slot configuration specifications
assert.ok(FOLIO_IMAGE_SLOTS.portrait, 'Portrait slot must exist');
assert.strictEqual(FOLIO_IMAGE_SLOTS.portrait.maxWidth, 768);
assert.strictEqual(FOLIO_IMAGE_SLOTS.portrait.maxHeight, 1024);
assert.strictEqual(FOLIO_IMAGE_SLOTS.portrait.mimeType, 'image/webp');
assert.strictEqual(FOLIO_IMAGE_SLOTS.portrait.hasAlpha, false);

assert.ok(FOLIO_IMAGE_SLOTS.token, 'Token slot must exist');
assert.strictEqual(FOLIO_IMAGE_SLOTS.token.maxWidth, 512);
assert.strictEqual(FOLIO_IMAGE_SLOTS.token.maxHeight, 512);
assert.strictEqual(FOLIO_IMAGE_SLOTS.token.hasAlpha, true, 'Token must support alpha transparency');

assert.ok(FOLIO_IMAGE_SLOTS.standee, 'Standee slot must exist');
assert.strictEqual(FOLIO_IMAGE_SLOTS.standee.maxWidth, 600);
assert.strictEqual(FOLIO_IMAGE_SLOTS.standee.maxHeight, 1200);

assert.ok(FOLIO_IMAGE_SLOTS.gallery, 'Gallery slot must exist');
assert.strictEqual(FOLIO_IMAGE_SLOTS.gallery.maxWidth, 1280);
assert.strictEqual(FOLIO_IMAGE_SLOTS.gallery.maxHeight, 720);

assert.strictEqual(MAX_SAFE_IMAGE_BYTES, 350 * 1024, 'Max safe image bytes should be 350 KB');
console.log('✔ Test 1 passed: Slot definitions and byte limits confirmed');

// Test 2: Calculate fit dimensions
// Case A: Landscape image larger than max bounds
const fitLandscape = calculateFitDimensions(2000, 1000, 1000, 1000);
assert.strictEqual(fitLandscape.width, 1000);
assert.strictEqual(fitLandscape.height, 500);

// Case B: Portrait image larger than max bounds
const fitPortrait = calculateFitDimensions(1500, 3000, 768, 1024);
assert.strictEqual(fitPortrait.height, 1024);
assert.strictEqual(fitPortrait.width, 512);

// Case C: 4K Raw Image scaling down to portrait bounds
const raw4K = calculateFitDimensions(3840, 2160, 768, 1024);
assert.ok(raw4K.width <= 768);
assert.ok(raw4K.height <= 1024);
assert.strictEqual(raw4K.width, 768);
assert.strictEqual(raw4K.height, 432);

// Case D: Small image already smaller than max bounds (should not upscale)
const smallImage = calculateFitDimensions(300, 400, 768, 1024);
assert.strictEqual(smallImage.width, 300);
assert.strictEqual(smallImage.height, 400);

console.log('✔ Test 2 passed: Dimension fitting algorithms preserve aspect ratio without upscaling');

// Test 3: Fallback behavior in non-browser environment
assert.strictEqual(isWebPSupported(), false, 'Node environment should gracefully return false for WebP support');
console.log('✔ Test 3 passed: Safe Node environment fallback');

console.log('All imageOptimizationService unit tests passed successfully!');
