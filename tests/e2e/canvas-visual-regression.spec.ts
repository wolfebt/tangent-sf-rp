import { test, expect } from '@playwright/test';

test.describe('Tangent SF RP — Canvas & WebGL Visual Regression Suite (toHaveScreenshot)', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-webgl',
      'Visual regression baseline snapshots are pinned to desktop chromium-webgl (1600x960)'
    );

    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Prime');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('1. Tactical Stage 2D & 3D WebGL Canvas Visual Baseline Snapshots', async ({ page }) => {
    await page.goto('/stage');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // 2D Tactical Stage Canvas Baseline
    await expect(canvas).toHaveScreenshot('stage-2d-viewport.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
      timeout: 15000
    });

    // Toggle 3D mode if 3D toggle button is present
    const toggle3DBtn = page.locator('button:has-text("3D"), button[title*="3D"]').first();
    if ((await toggle3DBtn.count()) > 0 && (await toggle3DBtn.isVisible())) {
      await toggle3DBtn.click();
    }

    const activeCanvas = page.locator('canvas').first();
    await expect(activeCanvas).toBeVisible({ timeout: 10000 });
    await expect(activeCanvas).toHaveScreenshot('stage-3d-viewport.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
      timeout: 15000
    });
  });

  test('2. MapMaker Konva Cartography Canvas & Story Weaver Graph Visual Baselines', async ({ page }) => {
    await page.goto('/story-foundry?tab=maps');
    const mapCanvas = page.locator('canvas').first();
    await expect(mapCanvas).toBeVisible({ timeout: 15000 });

    await expect(mapCanvas).toHaveScreenshot('mapmaker-canvas.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
      timeout: 15000
    });

    // Navigate to Story Weaver / Scenarios view
    await page.goto('/story-foundry?tab=scenarios');
    const mainRegion = page.locator('main').first();
    await expect(mainRegion).toBeVisible({ timeout: 15000 });

    await expect(mainRegion).toHaveScreenshot('story-weaver-graph.png', {
      maxDiffPixelRatio: 0.08,
      animations: 'disabled',
      timeout: 15000
    });
  });
});
