import { test, expect } from '@playwright/test';

test.describe('Tangent SF RP — Enterprise Smoke & Health Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock local storage flags so welcome onboarding modals don't block navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Commander Test');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('1. Core Application Boot & Route Integrity', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Assert document title or main container exists
    await expect(page.locator('main')).toBeVisible();

    // Verify no unhandled script errors crashed the app
    const fatalErrors = consoleErrors.filter(
      (err) => 
        !err.includes('favicon') && 
        !err.includes('Failed to load resource') &&
        !err.includes('Could not reach Cloud Firestore backend') &&
        !err.includes('Firestore')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('2. Tactical Stage (VTT) & WebGL Canvas Mount Lifecycle', async ({ page }) => {
    const uncaughtErrors: string[] = [];
    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    await page.goto('/vtt');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the Stage canvas to mount
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Assert canvas has physical layout dimensions
    await expect(async () => {
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(100);
    }).toPass({ timeout: 10000 });

    // Verify Screen Reader Accessibility Companion Feed is rendered in the DOM
    const a11yFeed = page.locator('[aria-label^="Tactical Accessibility Feed"]');
    await expect(a11yFeed).toBeAttached();

    // Assert zero unhandled page crashes during canvas startup
    expect(uncaughtErrors).toHaveLength(0);
  });

  test('3. Persona Folio Roster & Sheet Navigation', async ({ page }) => {
    await page.goto('/folio');
    await page.waitForLoadState('domcontentloaded');

    // Verify main Folio container is mounted
    await expect(page.locator('main')).toBeVisible();
    
    // Look for Folio navigation tabs or headers
    const folioHeading = page.getByText(/Folio|Persona|Roster|Vitals/i).first();
    await expect(folioHeading).toBeVisible({ timeout: 10000 });
  });

  test('4. Omnicortex DBM Compendium Browsing', async ({ page }) => {
    await page.goto('/dbm');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main').first()).toBeVisible();
    // Verify DBM or compendium elements render
    const dbmText = page.getByText(/Omnicortex|Compendium|Database|Species|Armory/i).first();
    await expect(dbmText).toBeVisible({ timeout: 10000 });
  });
});
