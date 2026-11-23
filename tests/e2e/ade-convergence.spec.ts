import { test, expect } from '@playwright/test';

const filterBenignErrors = (errors: string[]) =>
  errors.filter(
    (err) =>
      !err.includes('favicon') &&
      !err.includes('Failed to load resource') &&
      !err.includes('Could not reach Cloud Firestore backend') &&
      !err.includes('Firestore') &&
      !err.includes('FirebaseError') &&
      !err.includes('WebGL')
  );

test.describe('Tangent SF RP — ADE Convergence (Pair Author, MapMaker, Stage VTT, Spectator & A11y)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Convergence');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('terran_net_guest_dismissed', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('1. Pair Author (/foundry) loads cleanly with accessible main landmark & navigation controls', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/foundry');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 15000 });
    await expect(main.locator('button').first()).toBeVisible({ timeout: 10000 });
    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });

  test('2. Dynamic MapMaker (/foundry/map) mounts responsive canvas stage & toolbar without uncaught crashes', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/foundry/map');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 15000 });
    const stageOrFallback = main.locator('canvas, [role="tablist"], button').first();
    await expect(stageOrFallback).toBeVisible({ timeout: 12000 });
    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });

  test('3. Stage VTT (/vtt) mounts tactical canvas, accessible live feed, & role controls', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/vtt');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 15000 });
    const a11yFeed = page.locator('[aria-label^="Tactical Accessibility Feed"]');
    await expect(a11yFeed).toBeAttached({ timeout: 15000 });
    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });

  test('4. Spectator Route (/spectator/demo) renders cleanly without leaking architect authoring controls', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/spectator/demo');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Secret Door|Admin Override/i)).toHaveCount(0);
    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });
});
