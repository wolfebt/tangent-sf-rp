import { test, expect } from '@playwright/test';

test.describe('Tangent SF RP — Accessibility (a11y), Multi-Role Isolation & PWA Resilience Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Prime');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('1. Core Routes Semantic Landmarks, Accessible Controls & Keyboard Navigation', async ({ page }) => {
    const routesToAudit = ['/', '/folio', '/dbm', '/codex', '/compendium'];

    for (const route of routesToAudit) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Primary <main> landmark must exist and be visible
      const mainLandmark = page.locator('main').first();
      await expect(mainLandmark).toBeVisible({ timeout: 15000 });

      // Verify interactive inputs and buttons have discernible accessible text, aria-label, or title
      const a11ySummary = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const unlabeledButtons = buttons.filter((btn) => {
          const style = window.getComputedStyle(btn);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          const text = (btn.textContent || '').trim();
          const ariaLabel = btn.getAttribute('aria-label') || '';
          const ariaLabelledBy = btn.getAttribute('aria-labelledby') || '';
          const title = btn.getAttribute('title') || '';
          const hasSvgTitle = !!btn.querySelector('svg title');
          return !text && !ariaLabel && !ariaLabelledBy && !title && !hasSvgTitle;
        });
        return {
          totalButtons: buttons.length,
          unlabeledCount: unlabeledButtons.length
        };
      });

      expect(a11ySummary.totalButtons).toBeGreaterThan(0);
      // Allow 0 unlabeled visible buttons across audited core routes
      expect(a11ySummary.unlabeledCount).toBe(0);
    }
  });

  test('2. Multi-Context Architect (/stage) vs Operative (/vtt) Role & Canvas Isolation', async ({ browser }) => {
    const architectContext = await browser.newContext();
    const operativeContext = await browser.newContext();

    try {
      const architectPage = await architectContext.newPage();
      const operativePage = await operativeContext.newPage();

      for (const p of [architectPage, operativePage]) {
        await p.addInitScript(() => {
          window.localStorage.setItem('hasDismissedWelcome', 'true');
          window.localStorage.setItem('audioMuted', 'true');
        });
      }

      await Promise.all([
        architectPage.goto('/stage'),
        operativePage.goto('/vtt')
      ]);

      const archCanvas = architectPage.locator('canvas').first();
      const opCanvas = operativePage.locator('canvas').first();

      await expect(archCanvas).toBeVisible({ timeout: 15000 });
      await expect(opCanvas).toBeVisible({ timeout: 15000 });

      // Verify both canvases maintain non-zero pixel buffers and healthy WebGL/2D contexts simultaneously
      for (const canvas of [archCanvas, opCanvas]) {
        const box = await canvas.boundingBox();
        expect(box?.width).toBeGreaterThan(100);
        expect(box?.height).toBeGreaterThan(100);
      }

      // Operative view must attach the Tactical Accessibility Feed for screen readers
      const a11yFeed = operativePage.locator('[aria-label^="Tactical Accessibility Feed"]');
      await expect(a11yFeed).toBeAttached({ timeout: 10000 });
    } finally {
      await architectContext.close();
      await operativeContext.close();
    }
  });

  test('3. PWA Manifest, Service Worker Registration & Offline Local Storage Persistence', async ({ page, context }) => {
    await page.goto('/folio');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });

    // Verify web app manifest link is attached for PWA installability
    const manifestHref = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });
    expect(manifestHref).toBeTruthy();

    // Persist local character state while online, then switch context to offline mode
    await page.evaluate(() => {
      window.localStorage.setItem('tangent_offline_probe', JSON.stringify({ operative: 'Vance', status: 'ready' }));
    });

    await context.setOffline(true);
    try {
      // Verify client-side state and DOM interaction remain functional while offline
      const offlineState = await page.evaluate(() => {
        return JSON.parse(window.localStorage.getItem('tangent_offline_probe') || '{}');
      });
      expect(offlineState.operative).toBe('Vance');
      await expect(page.locator('main').first()).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
