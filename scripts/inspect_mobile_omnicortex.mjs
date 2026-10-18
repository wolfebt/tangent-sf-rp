import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/dbm...');
  await page.goto('http://localhost:5173/dbm', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If boot splash exists, click bypass
  const bypassBtn = page.locator('button:has-text("BYPASS")');
  if (await bypassBtn.count() > 0) {
    console.log('Clicking BYPASS button...');
    await bypassBtn.click();
    await page.waitForTimeout(1500);
  }

  // If auth modal exists, click continue as local operator
  const offlineBtn = page.locator('button:has-text("CONTINUE AS LOCAL OPERATOR")');
  if (await offlineBtn.count() > 0) {
    console.log('Clicking CONTINUE AS LOCAL OPERATOR...');
    await offlineBtn.click();
    await page.waitForTimeout(1500);
  }

  // Check state when sidebar is closed (default after navigating to a catalog)
  // Let's navigate to FACTIONS catalog first
  const factionsRailBtn = page.locator('button:has-text("FACTIONS")').first();
  if (await factionsRailBtn.count() > 0 && await factionsRailBtn.isVisible()) {
    console.log('Navigating to FACTIONS...');
    await factionsRailBtn.click();
    await page.waitForTimeout(1500);
  }

  // Verify the 3-bar toggle button on mobile
  const mobileMenuToggle = page.locator('button[title="Toggle Omnicortex Navigation Rail"]');
  console.log('Toggle button count:', await mobileMenuToggle.count());
  const box = await mobileMenuToggle.boundingBox();
  console.log(`Mobile 3bar menu button position: x=${box?.x} y=${box?.y} w=${box?.width} h=${box?.height}`);

  await page.screenshot({ path: 'inspection-screenshots/mobile_omnicortex_catalog_closed.png', fullPage: false });

  // Now click the 3-bar button to open drawer
  console.log('Clicking 3bar toggle to open rail...');
  await mobileMenuToggle.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'inspection-screenshots/mobile_omnicortex_catalog_open.png', fullPage: false });

  // Now click the backdrop or toggle again to close
  console.log('Clicking 3bar toggle to close rail...');
  await mobileMenuToggle.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'inspection-screenshots/mobile_omnicortex_catalog_reclosed.png', fullPage: false });

  console.log('Done!');
  await browser.close();
}

run().catch(console.error);
