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

  test('Base Score in Dice Roller Dock enforces minimum of 0 and maximum of 50', async ({ page }) => {
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
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-dice-roller'));
    });

    const baseScoreInput = page.locator('input[title="Base Score (0 to 50)"]');
    await expect(baseScoreInput).toBeVisible({ timeout: 5000 });
    await expect(baseScoreInput).toHaveAttribute('min', '0');
    await expect(baseScoreInput).toHaveAttribute('max', '50');

    // At default 0, minus button is disabled
    const minusBtn = page.locator('button[title="Decrease base score (-1, min 0)"]');
    const plusBtn = page.locator('button[title="Increase base score (+1, max 50)"]');
    await expect(minusBtn).toBeDisabled();
    await expect(plusBtn).toBeEnabled();

    // Fill with 50
    await baseScoreInput.fill('50');
    await expect(baseScoreInput).toHaveValue('50');
    await expect(plusBtn).toBeDisabled();
    await expect(minusBtn).toBeEnabled();

    // Fill with value exceeding 50, should be clamped to 50
    await baseScoreInput.fill('99');
    await expect(baseScoreInput).toHaveValue('50');

    // Fill with value below 0, should be clamped to 0
    await baseScoreInput.fill('-10');
    await expect(baseScoreInput).toHaveValue('0');
    await expect(minusBtn).toBeDisabled();

    expect(pageErrors).toHaveLength(0);
  });

  test('Ad-Hoc Modifier in Dice Roller Dock enforces minimum of -20 and maximum of +20', async ({ page }) => {
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
    await page.waitForTimeout(600);

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('open-dice-roller'));
    });

    const adHocInput = page.locator('input[title="Ad-Hoc / Situational Modifier (-20 to +20)"]');
    await expect(adHocInput).toBeVisible({ timeout: 5000 });
    await expect(adHocInput).toHaveAttribute('min', '-20');
    await expect(adHocInput).toHaveAttribute('max', '20');

    const penaltyBtn = page.locator('button[title="Decrease ad-hoc modifier (-1 penalty, min -20)"]');
    const bonusBtn = page.locator('button[title="Increase ad-hoc modifier (+1 bonus, max +20)"]');
    const clearBtn = page.locator('button[title="Clear Ad-Hoc Modifier to 0"]');

    await expect(penaltyBtn).toBeEnabled();
    await expect(bonusBtn).toBeEnabled();

    // Fill with 20 (max bonus)
    await adHocInput.fill('20');
    await expect(adHocInput).toHaveValue('20');
    await expect(bonusBtn).toBeDisabled();
    await expect(penaltyBtn).toBeEnabled();

    // Fill with value exceeding +20, should be clamped to 20
    await adHocInput.fill('35');
    await expect(adHocInput).toHaveValue('20');
    await expect(bonusBtn).toBeDisabled();

    // Click Clear (0)
    await clearBtn.click();
    await expect(adHocInput).toHaveValue('0');
    await expect(bonusBtn).toBeEnabled();
    await expect(penaltyBtn).toBeEnabled();

    // Fill with -20 (max penalty)
    await adHocInput.fill('-20');
    await expect(adHocInput).toHaveValue('-20');
    await expect(penaltyBtn).toBeDisabled();
    await expect(bonusBtn).toBeEnabled();

    // Fill with value below -20, should be clamped to -20
    await adHocInput.fill('-45');
    await expect(adHocInput).toHaveValue('-20');
    await expect(penaltyBtn).toBeDisabled();

    // Reset to 0
    await clearBtn.click();
    await expect(adHocInput).toHaveValue('0');

    expect(pageErrors).toHaveLength(0);
  });
});


