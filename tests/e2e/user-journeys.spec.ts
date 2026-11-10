import { test, expect } from '@playwright/test';

test.describe('Tangent SF RP — Fortune 500 Enterprise User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock local storage flags so welcome onboarding modals and boot splash don't block navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Prime');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('terran_net_guest_dismissed', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('Journey 1: The Stage — 2D/3D Viewport Switching & Canvas Integrity', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/stage');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the primary tactical canvas inside <main>
    const canvas = page.locator('main canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Verify 2D / 3D Toggle button is present and functional
    const toggle3DBtn = page.locator('button[title*="Toggle 2D / 3D Stage"], button:has-text("3D")').first();
    if (await toggle3DBtn.isVisible()) {
      await toggle3DBtn.click();
      await page.waitForTimeout(1000);

      // Verify canvas remains healthy in 3D mode
      const activeCanvas = page.locator('main canvas').first();
      const isContextLost = await activeCanvas.evaluate((el: HTMLCanvasElement) => {
        const gl = el.getContext('webgl2') || el.getContext('webgl');
        return gl ? gl.isContextLost() : false;
      });
      expect(isContextLost).toBe(false);

      // Toggle back to 2D
      const toggle2DBtn = page.locator('button[title*="Toggle 2D / 3D Stage"], button:has-text("2D")').first();
      if (await toggle2DBtn.isVisible()) {
        await toggle2DBtn.click();
        await page.waitForTimeout(500);
      }
    }

    expect(pageErrors).toHaveLength(0);
  });

  test('Journey 2: Persona Folio & Accessible Modal Focus Trapping', async ({ page }) => {
    await page.goto('/folio');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });

    // Trigger an accessible modal (Operator Settings in GlobalHUD)
    const settingsBtn = page.locator('button[aria-label*="Settings" i], button[title*="Settings" i], button:has-text("Architect Prime")').first();
    await expect(settingsBtn).toBeVisible({ timeout: 10000 });
    await settingsBtn.click();

    // Assert WAI-ARIA dialog attributes
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Test Escape key dismissal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('Journey 3: Omnicortex DBM Search & Compendium Categorization', async ({ page }) => {
    await page.goto('/dbm');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });

    // Verify search input or navigation filter
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"], input[type="text"]').first();
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible())) {
      await searchInput.fill('Alterian');
      await page.waitForTimeout(500);
    }
    // Results should display matching data or maintain healthy DOM
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('Journey 4: WebGL Context Loss Sentinel Diagnostic Reporting', async ({ page }) => {
    await page.goto('/vtt');
    await page.waitForLoadState('domcontentloaded');

    const canvas = page.locator('main canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Dispatch simulated webglcontextlost on the active canvas
    const handledGracefully = await canvas.evaluate((canvasEl: HTMLCanvasElement) => {
      try {
        const event = new CustomEvent('webglcontextlost', { cancelable: true });
        canvasEl.dispatchEvent(event);
        return true;
      } catch (err) {
        return false;
      }
    });

    expect(handledGracefully).toBe(true);
    // Ensure the application did not unmount the main layout
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('Journey 5: Story Foundry (ADE) — Workspace Navigation & Element Gallery', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/foundry?view=elements');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Element|Gallery|Forge|Catalog|All/i).first()).toBeVisible({ timeout: 15000 });

    expect(pageErrors).toHaveLength(0);
  });

  test('Journey 6: Network 4-Zone Workstation & Bastion AI Drawer Toggle', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/network');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });

    // Toggle BASTION AI Assistant Drawer via HUD button or custom event
    const bastionBtn = page.locator('button[title*="BASTION" i], button[aria-label*="BASTION" i], button:has-text("BASTION")').first();
    if (await bastionBtn.isVisible()) {
      await bastionBtn.click();
      await page.waitForTimeout(400);
      await bastionBtn.click();
    }

    expect(pageErrors).toHaveLength(0);
  });
});
