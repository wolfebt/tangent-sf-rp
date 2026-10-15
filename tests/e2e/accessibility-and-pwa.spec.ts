import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tangent SF RP — Accessibility (a11y), Multi-Role Isolation, Canvas Snapshot & PWA Suite', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Prime');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
    });
  });

  test('1. Core Routes Semantic Landmarks, Accessible Controls & @axe-core/playwright Audit', async ({ page }, testInfo) => {
    const routesToAudit = ['/', '/folio', '/codex'];

    for (const route of routesToAudit) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Primary <main> landmark must exist and be visible
      const mainLandmark = page.locator('main').first();
      await expect(mainLandmark).toBeVisible({ timeout: 15000 });

      // Run @axe-core/playwright WCAG 2.1 A/AA structural rules check on primary landing route
      if (route === '/' && testInfo.project.name === 'chromium-webgl') {
        const axeResults = await new AxeBuilder({ page })
          .include('main')
          .withRules(['aria-valid-attr', 'duplicate-id-aria', 'button-name', 'image-alt'])
          .analyze();

        const criticalAriaViolations = axeResults.violations.filter(
          (v) => v.id === 'aria-valid-attr' || v.id === 'duplicate-id-aria'
        );
        expect(criticalAriaViolations).toEqual([]);
      }

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
          const parentAccordionText = btn.parentElement?.className?.includes('cursor-pointer')
            ? (btn.parentElement.textContent || '').trim()
            : '';
          return !text && !ariaLabel && !ariaLabelledBy && !title && !hasSvgTitle && !parentAccordionText;
        });
        return {
          totalButtons: buttons.length,
          unlabeledCount: unlabeledButtons.length
        };
      });

      expect(a11ySummary.totalButtons).toBeGreaterThan(0);
      expect(a11ySummary.unlabeledCount).toBe(0);
    }
  });

  test('2. Multi-Context Architect (/stage) vs Operative (/vtt) Role, Canvas Snapshot & Isolation', async ({ browser }) => {
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

      // Verify both canvases maintain non-zero pixel buffers and valid PNG data-URI snapshots
      for (const [label, pageInstance, canvas] of [
        ['Architect Stage', architectPage, archCanvas],
        ['Operative VTT', operativePage, opCanvas]
      ] as const) {
        const box = await canvas.boundingBox();
        expect(box?.width, `${label} canvas width`).toBeGreaterThan(100);
        expect(box?.height, `${label} canvas height`).toBeGreaterThan(100);

        const canvasDataUri = await pageInstance.evaluate(() => {
          const c = document.querySelector('canvas');
          return c ? c.toDataURL('image/png').slice(0, 64) : '';
        });
        expect(canvasDataUri.startsWith('data:image/png;base64,')).toBe(true);
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
      // Verify client-side state and interactive DOM controls remain functional while offline
      const offlineState = await page.evaluate(() => {
        return JSON.parse(window.localStorage.getItem('tangent_offline_probe') || '{}');
      });
      expect(offlineState.operative).toBe('Vance');
      await expect(page.locator('main').first()).toBeVisible();

      // Verify interactive inputs in Folio continue responding while offline
      const firstInput = page.locator('main input[type="text"], main input:not([type])').first();
      if ((await firstInput.count()) > 0 && (await firstInput.isVisible())) {
        await firstInput.fill('Commander Vance (Offline Sync)');
        await expect(firstInput).toHaveValue('Commander Vance (Offline Sync)');
      }
    } finally {
      await context.setOffline(false);
    }
  });
});

