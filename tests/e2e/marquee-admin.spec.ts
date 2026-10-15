import { test, expect } from '@playwright/test';

test.describe('Admin Marquee Controls Suite', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });
    page.on('pageerror', (err) => {
      console.error(`[BROWSER PAGEERROR]:`, err);
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('userHandle', 'Architect Prime');
      window.localStorage.setItem('hasDismissedWelcome', 'true');
      window.localStorage.setItem('audioMuted', 'true');
      window.localStorage.setItem('omnicortex_admin_override', 'true');
    });
  });

  test('1. Verify Admin Marquee Tab and Controls in UserSettingsModal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click settings button in GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();

    // Verify dialog opened
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Look for Admin Marquee tab
    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await expect(marqueeTab).toBeVisible({ timeout: 5000 });
    await marqueeTab.click();

    // Verify Tactical Broadcast Marquee panel
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Change Line 1
    const line1Input = page.locator('input[placeholder*="WELCOME TO TANGENT"]').first();
    await expect(line1Input).toBeVisible();
    await line1Input.fill('TEST AUTOMATED ALERT TRANSMISSION // SECTOR 9 NOMINAL');

    // Change to scrolling mode
    const scrollingModeBtn = page.locator('button:has-text("Scrolling")').first();
    await expect(scrollingModeBtn).toBeVisible();
    await scrollingModeBtn.scrollIntoViewIfNeeded();
    await scrollingModeBtn.click({ force: true });

    // Change color to ruby
    const rubyBtn = page.locator('button:has-text("Ruby")').first();
    if (await rubyBtn.isVisible()) {
      await rubyBtn.scrollIntoViewIfNeeded();
      await rubyBtn.click({ force: true });
    }

    // Verify redundant Apply & Publish button is removed from marquee panel
    await expect(page.locator('button:has-text("APPLY & PUBLISH MARQUEE")')).toHaveCount(0);

    // Save changes via modal footer Save Changes button
    const saveBtn = page.getByTestId('save-user-settings-btn');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Verify Home banner has updated text
    await expect(page.getByText('TEST AUTOMATED ALERT TRANSMISSION // SECTOR 9 NOMINAL').first()).toBeVisible({ timeout: 10000 });

    // Verify STRICT RULE: Never show buttons or controls in the marquee banner
    const marqueeButtons = page.locator('button[title*="Configure Broadcast Marquee"], button:has-text("CONFIGURE MARQUEE")');
    await expect(marqueeButtons).toHaveCount(0);
  });

  test('2. Verify Quick Presets Are Removed and Multi-Line Transmission Persists Without In-Marquee Controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await expect(settingsButton).toBeVisible({ timeout: 10000 });
    await settingsButton.click();

    // Verify settings opened and switch to Admin Marquee tab
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Verify Quick Presets / Templates are completely removed
    await expect(page.getByText('Quick Presets / Templates')).toHaveCount(0);
    await expect(page.locator('button:has-text("Standard Welcome")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Code Red Incursion")')).toHaveCount(0);

    // Enter custom multi-line transmission
    const line1Input = page.locator('input[placeholder*="WELCOME TO TANGENT"]').first();
    await expect(line1Input).toBeVisible();
    await line1Input.fill('INCURSION DETECTED IN SECTOR 7 // LOCKDOWN ACTIVE');

    const line2Input = page.locator('input[placeholder*="BASTION RULES ENGINE"]').first();
    if (await line2Input.isVisible()) {
      await line2Input.fill('COMBAT AIR PATROL DISPATCHED // READY LOADOUTS');
    }

    // Verify redundant Apply & Publish button is removed from marquee panel
    await expect(page.locator('button:has-text("APPLY & PUBLISH MARQUEE")')).toHaveCount(0);

    // Save changes via modal footer Save Changes button
    const saveBtn = page.getByTestId('save-user-settings-btn');
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Verify Home banner shows updated text
    await expect(page.getByText(/INCURSION DETECTED IN SECTOR 7/i).first()).toBeVisible({ timeout: 12000 });

    // Verify marquee has NO buttons or controls
    await expect(page.locator('button[title*="Configure Broadcast Marquee"]')).toHaveCount(0);

    // Reload page and ensure published marquee persists
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/INCURSION DETECTED IN SECTOR 7/i).first()).toBeVisible({ timeout: 12000 });
    await expect(page.locator('button[title*="Configure Broadcast Marquee"]')).toHaveCount(0);
  });

  test('3. Verify Disabling Banner Hides it Completely (No Fallback Buttons or Pills)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Switch to Admin Marquee
    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();

    // Toggle Banner Visibility to Disabled (Offline)
    const toggleBtn = page.locator('button:has-text("ACTIVE & VISIBLE")').first();
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.scrollIntoViewIfNeeded();
    await toggleBtn.click({ force: true });
    await expect(page.locator('button:has-text("DISABLED (OFFLINE)")').first()).toBeVisible();

    // Verify redundant Apply & Publish button is removed from marquee panel
    await expect(page.locator('button:has-text("APPLY & PUBLISH MARQUEE")')).toHaveCount(0);

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify that when disabled, banner is completely hidden with ZERO fallback buttons or pills
    await expect(page.locator('button:has-text("BROADCAST OFFLINE")')).toHaveCount(0);
    await expect(page.locator('button:has-text("CONFIGURE MARQUEE")')).toHaveCount(0);
    await expect(page.locator('button[title*="Configure Home Broadcast Banner"]')).toHaveCount(0);

    // Re-open settings to restore visibility
    await settingsButton.click();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await marqueeTab.click();

    // Re-enable visibility
    const reEnableBtn = page.locator('button:has-text("DISABLED (OFFLINE)")').first();
    await expect(reEnableBtn).toBeVisible();
    await reEnableBtn.scrollIntoViewIfNeeded();
    await reEnableBtn.click({ force: true });
    await expect(page.locator('button:has-text("ACTIVE & VISIBLE")').first()).toBeVisible();

    // Save changes via modal footer Save Changes button
    const saveBtn2 = page.getByTestId('save-user-settings-btn');
    await saveBtn2.click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify banner is active again with ZERO buttons or controls
    await expect(page.getByText(/WELCOME TO TANGENT|TACTICAL BROADCAST/i).first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button[title*="Configure Broadcast Marquee"]')).toHaveCount(0);
  });

  test('4. Verify Ticker Justification (Left vs Right) and Static Dynamics (Fade & Glow)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // 1. Ticker Mode: Select Ticker and verify Left/Right Justification controls
    const tickerModeBtn = page.locator('button:has-text("Ticker")').first();
    await tickerModeBtn.click({ force: true });

    await expect(page.getByText('Ticker Text Justification')).toBeVisible();
    const rightJustifyBtn = page.locator('button:has-text("Right Justified")').first();
    await expect(rightJustifyBtn).toBeVisible();
    await rightJustifyBtn.click({ force: true });

    // Verify redundant Apply & Publish button is removed from marquee panel
    await expect(page.locator('button:has-text("APPLY & PUBLISH MARQUEE")')).toHaveCount(0);

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify right-justified class on Home banner display
    const rightAlignedBanner = page.locator('.items-end.text-right').first();
    await expect(rightAlignedBanner).toBeVisible({ timeout: 8000 });

    // 2. Static Mode: Switch to Static mode and verify Fade & Glow options
    await settingsButton.click();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await marqueeTab.click();

    const staticModeBtn = page.locator('button:has-text("Static")').first();
    await staticModeBtn.click({ force: true });

    await expect(page.getByText(/Static Display Dynamics/i)).toBeVisible();
    await expect(page.getByText(/Fade Effect|Fade Dynamics/i)).toBeVisible();
    await expect(page.getByText(/Glow Radiance/i)).toBeVisible();

    // Select Breathing Pulse
    const pulseFadeBtn = page.locator('button:has-text("Pulse"), button:has-text("Breathing")').first();
    await pulseFadeBtn.click({ force: true });

    // Select Intense Bloom
    const bloomGlowBtn = page.locator('button:has-text("Bloom"), button:has-text("Intense")').first();
    await bloomGlowBtn.click({ force: true });

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify Static Fade & Glow classes on Home banner
    const pulsedBanner = page.locator('.animate-static-fade-pulse').first();
    await expect(pulsedBanner).toBeVisible({ timeout: 8000 });

    const bloomedText = page.locator('.static-glow-bloom').first();
    await expect(bloomedText).toBeVisible({ timeout: 8000 });

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.animate-static-fade-pulse').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.static-glow-bloom').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Verify Option of No Category Icon (None / No Icon)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Click "None (No Icon)" button
    const noIconBtn = page.locator('button[title="None (No Icon)"]').first();
    await expect(noIconBtn).toBeVisible();
    await noIconBtn.click({ force: true });

    // Verify indicator text displays "NO ICON"
    await expect(page.getByText('No Icon')).toBeVisible();

    // Verify redundant Apply & Publish button is removed from marquee panel
    await expect(page.locator('button:has-text("APPLY & PUBLISH MARQUEE")')).toHaveCount(0);

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify Home banner badge has no icon (zero SVGs inside the badge element)
    const badgeContainer = page.locator('.whitespace-nowrap').locator('xpath=ancestor::*[contains(@class, "tracking-wider")][1]');
    if (await badgeContainer.count() > 0) {
      await expect(badgeContainer.first().locator('svg')).toHaveCount(0);
    }

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    if (await badgeContainer.count() > 0) {
      await expect(badgeContainer.first().locator('svg')).toHaveCount(0);
    }
  });

  test('6. Verify Silver Color Theme With Black Shadow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Select Silver color theme
    const silverBtn = page.locator('button:has-text("Silver")').first();
    await expect(silverBtn).toBeVisible();
    await silverBtn.scrollIntoViewIfNeeded();
    await silverBtn.click({ force: true });

    // Verify color label updates to Silver with Black Shadow
    await expect(page.getByText(/Silver \(Quicksilver \/ Black Shadow\)/i)).toBeVisible();

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify Home banner renders with silver text and black shadow styling
    const silverBannerText = page.locator('.silver-black-text-shadow').first();
    await expect(silverBannerText).toBeVisible({ timeout: 8000 });

    const silverBannerBox = page.locator('.silver-black-box-shadow').first();
    await expect(silverBannerBox).toBeVisible({ timeout: 8000 });

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.silver-black-text-shadow').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.silver-black-box-shadow').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. Verify Option of Background (Current) or Clean Text Only (No Frame, Pulsing Dots, or Gel Background)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Click "Clean Text Only" option
    const cleanTextBtn = page.locator('button:has-text("Clean Text Only")').first();
    await expect(cleanTextBtn).toBeVisible();
    await cleanTextBtn.scrollIntoViewIfNeeded();
    await cleanTextBtn.click({ force: true });

    // Verify indicator text displays TEXT-ONLY
    await expect(page.getByText(/TEXT-ONLY/i).first()).toBeVisible();

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify Home banner has no pulsing beacon dots
    const bannerContainer = page.locator('.max-w-6xl, .max-w-7xl').first();
    await expect(bannerContainer).toBeVisible({ timeout: 8000 });
    await expect(bannerContainer.locator('.animate-ping')).toHaveCount(0);

    // Verify Home banner has transparent background without cyber-gel frame classes
    await expect(bannerContainer).toHaveClass(/bg-transparent/);

    // Verify colored text remains clearly visible
    await expect(page.getByText(/WELCOME TO TANGENT|INCURSION|TEST AUTOMATED/i).first()).toBeVisible();

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const persistedBanner = page.locator('.max-w-6xl, .max-w-7xl').first();
    await expect(persistedBanner.locator('.animate-ping')).toHaveCount(0);
    await expect(persistedBanner).toHaveClass(/bg-transparent/);

    // Switch back to Cyber-Gel Frame
    await settingsButton.click();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await marqueeTab.click();

    const gelFrameBtn = page.locator('button:has-text("Cyber-Gel Frame")').first();
    await expect(gelFrameBtn).toBeVisible();
    await gelFrameBtn.scrollIntoViewIfNeeded();
    await gelFrameBtn.click({ force: true });

    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify beacon dots and cyber-gel background are restored
    const restoredBanner = page.locator('.max-w-6xl, .max-w-7xl').first();
    await expect(restoredBanner.locator('.animate-ping').first()).toBeVisible({ timeout: 8000 });
  });

  test('8. Verify Independent Top and Bottom Marquees with Modal Sub-Tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open settings via GlobalHUD
    const settingsButton = page.locator('button[title*="Settings"], button:has-text("OPERATOR"), button:has-text("Architect")').first();
    await settingsButton.click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const marqueeTab = page.locator('button:has-text("Admin Marquee")').first();
    await marqueeTab.click();
    await expect(page.getByText('Tactical Broadcast Marquee')).toBeVisible({ timeout: 5000 });

    // Verify presence of Top Marquee and Bottom Marquee sub-tabs
    const topSubTab = page.locator('button:has-text("Top Marquee")').first();
    const bottomSubTab = page.locator('button:has-text("Bottom Marquee")').first();
    await expect(topSubTab).toBeVisible();
    await expect(bottomSubTab).toBeVisible();

    // 1. Configure Top Marquee: Amethyst color, specific text
    await topSubTab.click({ force: true });
    await expect(page.getByText(/LIVE PREVIEW \(TOP MARQUEE\)/i)).toBeVisible();

    const line1Input = page.locator('input[placeholder*="WELCOME TO TANGENT"]').first();
    await expect(line1Input).toBeVisible();
    await line1Input.fill('TOP BROADCAST // ORBITAL STATION ALPHA ACTIVE');

    const amethystBtn = page.locator('button:has-text("Amethyst")').first();
    if (await amethystBtn.isVisible()) {
      await amethystBtn.scrollIntoViewIfNeeded();
      await amethystBtn.click({ force: true });
    }

    // 2. Configure Bottom Marquee: Silver color with black shadow, Clean text only, specific text
    await bottomSubTab.click({ force: true });
    await expect(page.getByText(/LIVE PREVIEW \(BOTTOM MARQUEE\)/i)).toBeVisible();

    const bottomLine1Input = page.locator('input[placeholder*="SECURE COMM LINK"]').first();
    await expect(bottomLine1Input).toBeVisible();
    await bottomLine1Input.fill('BOTTOM TELEMETRY // SUB-SURFACE CONDUIT MATRIX');

    // Select Silver color
    const silverBtn = page.locator('button:has-text("Silver")').first();
    await silverBtn.scrollIntoViewIfNeeded();
    await silverBtn.click({ force: true });

    // Select Clean Text Only
    const cleanTextBtn = page.locator('button:has-text("Clean Text Only")').first();
    await cleanTextBtn.scrollIntoViewIfNeeded();
    await cleanTextBtn.click({ force: true });

    // Save changes via modal footer Save Changes button
    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // 3. Verify BOTH Top and Bottom Marquees are rendered on Home screen
    const topMarquee = page.locator('[data-marquee-position="top"]');
    const bottomMarquee = page.locator('[data-marquee-position="bottom"]');

    await expect(topMarquee).toBeVisible({ timeout: 8000 });
    await expect(bottomMarquee).toBeVisible({ timeout: 8000 });

    // Check Top Marquee content & style
    await expect(topMarquee.getByText(/TOP BROADCAST \/\/ ORBITAL STATION ALPHA ACTIVE/i)).toBeVisible();
    // Top marquee has Cyber-Gel Frame with beacon dots
    await expect(topMarquee.locator('.animate-ping').first()).toBeVisible();

    // Check Bottom Marquee content & style
    await expect(bottomMarquee.getByText(/BOTTOM TELEMETRY \/\/ SUB-SURFACE CONDUIT MATRIX/i)).toBeVisible();
    // Bottom marquee has silver black shadow
    await expect(bottomMarquee.locator('.silver-black-text-shadow').first()).toBeVisible();
    // Bottom marquee has Clean Text Only (0 beacon dots and bg-transparent)
    await expect(bottomMarquee.locator('.animate-ping')).toHaveCount(0);
    await expect(bottomMarquee.locator('.max-w-6xl, .max-w-7xl').first()).toHaveClass(/bg-transparent/);

    // 4. Reload page to verify independent persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(topMarquee.getByText(/TOP BROADCAST \/\/ ORBITAL STATION ALPHA ACTIVE/i)).toBeVisible({ timeout: 10000 });
    await expect(bottomMarquee.getByText(/BOTTOM TELEMETRY \/\/ SUB-SURFACE CONDUIT MATRIX/i)).toBeVisible({ timeout: 10000 });
    await expect(topMarquee.locator('.animate-ping').first()).toBeVisible();
    await expect(bottomMarquee.locator('.animate-ping')).toHaveCount(0);

    // 5. Open settings, toggle Bottom Marquee offline, verify Top Marquee stays online
    await settingsButton.click();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await marqueeTab.click();
    await bottomSubTab.click({ force: true });

    const toggleBtn = page.locator('button:has-text("ACTIVE & VISIBLE")').first();
    await toggleBtn.scrollIntoViewIfNeeded();
    await toggleBtn.click({ force: true });
    await expect(page.locator('button:has-text("DISABLED (OFFLINE)")').first()).toBeVisible();

    await page.getByTestId('save-user-settings-btn').click();
    await expect(dialog).not.toBeVisible({ timeout: 8000 });

    // Verify Top Marquee is still visible while Bottom Marquee is hidden
    await expect(topMarquee.getByText(/TOP BROADCAST \/\/ ORBITAL STATION ALPHA ACTIVE/i)).toBeVisible();
    await expect(bottomMarquee).toHaveCount(0);
  });
});

