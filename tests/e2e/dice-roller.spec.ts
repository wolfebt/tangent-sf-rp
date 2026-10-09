import { test, expect } from '@playwright/test';

test.describe('Dice Roller Dock E2E Verification', () => {
  test('Opens DiceRollerDock, clicks CHECK, and verifies generated numbers and telemetry', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Commander Test');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
      window.localStorage.removeItem('tangent_dice_roller_history');
      window.localStorage.removeItem('tangent_dice_roller_latest');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Trigger toggle-dice-dock via custom event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('toggle-dice-dock'));
    });

    const checkBtn = page.getByRole('button', { name: 'CHECK', exact: true });
    await expect(checkBtn).toBeVisible({ timeout: 5000 });

    // 1. Click CHECK button
    await checkBtn.click();
    await page.waitForTimeout(300);

    // Verify roll output is present and no longer STANDBY
    await expect(page.locator('text=STANDBY')).not.toBeVisible();
    await expect(page.locator('text=Natural:')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=All Rolls (1)')).toBeVisible({ timeout: 5000 });

    // 2. Click Reroll Check
    const rerollBtn = page.getByRole('button', { name: 'Reroll Check' });
    await expect(rerollBtn).toBeVisible();
    await rerollBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=All Rolls (2)')).toBeVisible({ timeout: 5000 });

    // 3. Apply Advantage (+1) and Target DC (15) and click CHECK
    const advBtn = page.getByRole('button', { name: 'ADVANTAGE', exact: true });
    await advBtn.click();
    const dc15Btn = page.getByRole('button', { name: 'Hard (15)' });
    await dc15Btn.click();
    await checkBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=All Rolls (3)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=vs DC 15').first()).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });
});
