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

    // Verify Global Ctrl+K Command Palette shortcut opens & Escape dismisses cleanly
    await page.keyboard.press('Control+k');
    const paletteInput = page.locator('input[placeholder*="Jump to Scenario"], [aria-label="ADE Command Palette"]').first();
    await expect(paletteInput).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('[aria-label="ADE Command Palette"]')).toHaveCount(0);

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

  test('3. Stage Architect (/stage) mounts tactical canvas, accessible live feed, & Architect role controls', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/stage');
    await page.waitForLoadState('domcontentloaded');

    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 15000 });
    const a11yFeed = page.locator('[aria-label^="Tactical Accessibility Feed"]');
    await expect(a11yFeed).toBeAttached({ timeout: 15000 });

    // Verify extracted Pro Stage Tactical Toolbar renders Sensor Vision, AoE, Fog, and Audio controls
    await expect(page.getByLabel('Sensor Vision Mode')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^AoE$/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /^Fog$/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /^Audio$/i })).toBeVisible({ timeout: 5000 });

    // Wave 1: Turn Order drawer (Architect GM controls)
    await page.getByRole('button', { name: 'Toggle Turn Tracker' }).click();
    await expect(page.getByRole('dialog', { name: 'Stage Turn Tracker' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Roll Init/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Next Turn/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Close Turn Tracker' }).click();

    // Wave 1: Persistent Roll Feed & plain-text narration across close/reopen
    await page.getByRole('button', { name: 'Toggle Roll Feed' }).click();
    await expect(page.getByRole('dialog', { name: 'Stage Roll Feed' })).toBeVisible({ timeout: 5000 });
    const feedInput = page.getByPlaceholder(/2d10 \+ 4, 1d6\+2, or chat message/i);
    await feedInput.fill('Squad sector secured');
    await page.getByRole('dialog', { name: 'Stage Roll Feed' }).getByRole('button', { name: /^Send$/i }).click();
    await expect(page.getByText('Squad sector secured')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Close Roll Feed' }).click();
    await page.getByRole('button', { name: 'Toggle Roll Feed' }).click();
    await expect(page.getByText('Squad sector secured')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Close Roll Feed' }).click();

    // Wave 1: Consolidated Stage Settings modal reachable from top bar
    await page.getByRole('button', { name: 'Stage Settings' }).click();
    await expect(page.getByText(/VTT Stage Settings & Operations/i)).toBeVisible({ timeout: 5000 });
    await page.getByTitle('Close Settings (Esc)').click();

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

  test('5. Stage VTT Operative Lock (/vtt & /vtt?role=operative) enforces operative controls without GM tools', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    for (const url of ['/vtt', '/vtt?role=operative']) {
      await page.goto(url);
      await page.waitForLoadState('domcontentloaded');

      const main = page.locator('main').first();
      await expect(main).toBeVisible({ timeout: 15000 });
      const a11yFeed = page.locator('[aria-label^="Tactical Accessibility Feed"]');
      await expect(a11yFeed).toBeAttached({ timeout: 15000 });

      await expect(page.getByLabel('Sensor Vision Mode')).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /^AoE$/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^Fog$/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^Audio$/i })).toHaveCount(0);

      // Wave 1: Operative isolation on breadcrumb & left rail controls
      await expect(page.getByRole('button', { name: /^FILE$/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^\+\s*New$/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Stage Settings' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /^SCENARIO$/i })).toHaveCount(0);

      // Wave 1: Player-usable Roll Feed & Turn Tracker remain accessible without GM buttons
      await page.getByRole('button', { name: 'Toggle Turn Tracker' }).click();
      await expect(page.getByRole('dialog', { name: 'Stage Turn Tracker' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Roll Init/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /Next Turn/i })).toHaveCount(0);
      await page.getByRole('button', { name: 'Close Turn Tracker' }).click();

      await page.getByRole('button', { name: 'Toggle Roll Feed' }).click();
      await expect(page.getByRole('dialog', { name: 'Stage Roll Feed' })).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: 'Close Roll Feed' }).click();
    }

    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });

  test('6. MapMaker PixiJS v8 (/foundry/map) renders unified tactical canvas, cartography toggles & Universal VTT Export', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/foundry/map');
    await page.waitForLoadState('domcontentloaded');

    const canvas = page.locator('canvas[aria-label="MapMaker Tactical Cartography Canvas"]');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await expect(canvas).toHaveAttribute('data-renderer', /^(pixijs-v8|canvas2d-fallback)$/);

    await page.getByRole('button', { name: 'Shadows' }).click();
    await page.getByRole('button', { name: 'Soft Brush' }).click();
    await page.getByRole('button', { name: 'Roof' }).click();

    await page.getByRole('button', { name: /Universal VTT Export/i }).click();
    await expect(page.getByRole('button', { name: /Download \.dd2vtt File/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Export Foundry VTT JSON/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /4K PNG Snapshot \(Worker\)/i })).toBeVisible({ timeout: 10000 });

    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });

  test('7. Multi-tab Stage Architect (/stage) + Operative (/vtt) BroadcastChannel sync & role lock', async ({ browser }) => {
    const context = await browser.newContext();
    try {
      await context.addInitScript(() => {
        window.localStorage.setItem('userHandle', 'Architect Convergence');
        window.localStorage.setItem('hasDismissedWelcome', 'true');
        window.localStorage.setItem('terran_net_guest_dismissed', 'true');
        window.localStorage.setItem('audioMuted', 'true');

        const OrigBC = window.BroadcastChannel;
        if (typeof OrigBC === 'function') {
          class TrackedBroadcastChannel extends OrigBC {
            constructor(name: string) {
              super(name);
              if (name === 'tangent_vtt_stage_sync') {
                (window as any).__tangentVttChannelOpened = true;
                this.addEventListener('message', (ev: MessageEvent) => {
                  const seen = ((window as any).__tangentBroadcastSeen =
                    (window as any).__tangentBroadcastSeen || []);
                  seen.push((ev.data && (ev.data as any).type) || 'binary');
                });
              }
            }
          }
          (window as any).BroadcastChannel = TrackedBroadcastChannel;
        }
      });

      const archErrors: string[] = [];
      const opErrors: string[] = [];

      const architectPage = await context.newPage();
      architectPage.on('pageerror', (err) => archErrors.push(err.message));
      await architectPage.goto('/stage');
      await architectPage.waitForLoadState('domcontentloaded');
      await expect(architectPage.locator('[aria-label^="Tactical Accessibility Feed"]')).toBeAttached({ timeout: 15000 });
      await expect(architectPage.getByRole('button', { name: /^AoE$/i })).toBeVisible({ timeout: 10000 });
      await expect.poll(() => architectPage.evaluate(() => Boolean((window as any).__tangentVttChannelOpened)), { timeout: 10000 }).toBe(true);

      const operativePage = await context.newPage();
      operativePage.on('pageerror', (err) => opErrors.push(err.message));
      await operativePage.goto('/vtt');
      await operativePage.waitForLoadState('domcontentloaded');
      await expect(operativePage.locator('[aria-label^="Tactical Accessibility Feed"]')).toBeAttached({ timeout: 15000 });
      await expect(operativePage.getByRole('button', { name: /^AoE$/i })).toHaveCount(0);
      await expect(operativePage.getByRole('button', { name: /^Fog$/i })).toHaveCount(0);
      await expect(operativePage.getByRole('button', { name: /^Audio$/i })).toHaveCount(0);

      await expect
        .poll(() => architectPage.evaluate(() => ((window as any).__tangentBroadcastSeen || []).length), { timeout: 10000 })
        .toBeGreaterThan(0);

      expect(filterBenignErrors(archErrors)).toHaveLength(0);
      expect(filterBenignErrors(opErrors)).toHaveLength(0);
    } finally {
      await context.close();
    }
  });

  test('8. Perspective Toggle (/foundry Mission Control) switches Architect <-> Operator cleanly across desktop & tablet', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/foundry');
    await page.waitForLoadState('domcontentloaded');

    const stageToolsBtn = page.getByRole('button', { name: /STAGE & TOOLS/i });
    await expect(stageToolsBtn).toBeVisible({ timeout: 15000 });
    await expect(stageToolsBtn).toContainText('ARCHITECT');

    const togglePerspectiveFromMenu = async () => {
      const perspectiveMenuItem = page.getByRole('button', { name: /Perspective Mode/i });
      if (!(await perspectiveMenuItem.isVisible())) {
        await stageToolsBtn.click();
      }
      await expect(perspectiveMenuItem).toBeVisible({ timeout: 5000 });
      await perspectiveMenuItem.click();
    };

    await togglePerspectiveFromMenu();
    await expect(stageToolsBtn).toContainText('OPERATOR', { timeout: 5000 });

    await togglePerspectiveFromMenu();
    await expect(stageToolsBtn).toContainText('ARCHITECT', { timeout: 5000 });

    expect(filterBenignErrors(pageErrors)).toHaveLength(0);
  });
});
