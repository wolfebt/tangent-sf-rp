import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const outDir = path.resolve('inspection-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:5173/compendium...');
  await page.goto('http://localhost:5173/compendium', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If boot screen is shown, click Bypass // Launch
  const bypassBtn = page.locator('button:has-text("BYPASS // LAUNCH")');
  if (await bypassBtn.count() > 0) {
    console.log('Clicking BYPASS // LAUNCH button...');
    await bypassBtn.click();
    await page.waitForTimeout(2000);
  } else {
    await page.waitForTimeout(3000);
  }

  // If gateway modal appears, click Continue as Local Operator
  const localOpBtn = page.locator('button:has-text("CONTINUE AS LOCAL OPERATOR")');
  if (await localOpBtn.count() > 0) {
    console.log('Clicking CONTINUE AS LOCAL OPERATOR button...');
    await localOpBtn.click();
    await page.waitForTimeout(2000);
  }

  // 1. Verify Operator tab initial state
  console.log('--- Checking Operator Tab ---');
  await page.screenshot({ path: path.join(outDir, 'compendium-operator-tab.png') });
  
  const drawerHeader = await page.locator('aside >> text=OPERATOR RULES').count();
  console.log('Drawer header has OPERATOR RULES:', drawerHeader > 0);

  // Check article items in drawer
  const visibleButtons = await page.locator('aside >> button').allInnerTexts();
  const drawerArticleItems = visibleButtons.filter(t => t.includes('1.') || t.includes('2.') || t.includes('3.') || t.includes('4.') || t.includes('99.') || t.includes('02'));
  console.log('Visible Operator articles count:', drawerArticleItems.length);
  console.log('First 3 articles in drawer:', drawerArticleItems.slice(0, 3).map(s => s.replace(/\n/g, ' ')));

  // 2. Test Sort Mode toggle (Canonical -> A-Z)
  console.log('\n--- Toggling Sort to A-Z ---');
  const sortBtn = page.locator('button[title*="Sort:"] >> visible=true').first();
  if (await sortBtn.count() > 0) {
    await sortBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'compendium-operator-az-sort.png') });
    
    const sortedButtons = await page.locator('aside >> button').allInnerTexts();
    const sortedArticles = sortedButtons.filter(t => t.includes('1.') || t.includes('2.') || t.includes('3.') || t.includes('4.') || t.includes('99.') || t.includes('02'));
    console.log('Sorted (A-Z) articles first 3:', sortedArticles.slice(0, 3).map(s => s.replace(/\n/g, ' ')));
    
    // Toggle back to canonical
    await sortBtn.click();
    await page.waitForTimeout(300);
  }

  // 3. Test ARCH tab button click
  console.log('\n--- Switching to Architect Tab ---');
  const archRailBtn = page.locator('button[aria-label="5.00 Architect & Modular Matrices"]');
  await archRailBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'compendium-architect-tab.png') });

  const archDrawerHeader = await page.locator('aside >> text=ARCHITECT MATRICES').count();
  console.log('Drawer header has ARCHITECT MATRICES:', archDrawerHeader > 0);

  const archButtons = await page.locator('aside >> button').allInnerTexts();
  const archArticles = archButtons.filter(t =>
    t.includes('ECONOMY AND WEALTH') ||
    t.includes('MODULAR') ||
    t.includes('TECHNOLOGY') ||
    t.includes('METAPHYSICS')
  );
  console.log('Visible Architect articles count:', archArticles.length);
  console.log('First 3 Architect articles in drawer:', archArticles.slice(0, 3).map(s => s.replace(/\n/g, ' ')));

  // 4. Test Search inside Architect tab
  console.log('\n--- Testing Search in Architect Tab ("Armor") ---');
  const searchInput = page.locator('input[placeholder*="Search"]').first();
  await searchInput.fill('armor');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'compendium-architect-search-armor.png') });

  const searchButtons = await page.locator('aside >> button').allInnerTexts();
  const searchMatchArticles = searchButtons.filter(t => t.toLowerCase().includes('armor'));
  console.log('Matching "armor" in Architect drawer:', searchMatchArticles.map(s => s.replace(/\n/g, ' ')));

  // 5. Test Cross-Tab Match Notice
  console.log('\n--- Testing Cross-Tab Search Notice (Search "Armor" in Operator Tab) ---');
  await searchInput.fill('');
  const operRailBtn = page.locator('button[aria-label="1.00 Operator Core Rules"]');
  await operRailBtn.click();
  await page.waitForTimeout(500);

  await searchInput.fill('armor');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'compendium-operator-search-crosstab.png') });

  const switchNotice = await page.locator('text=Switch to Architect tab').count();
  console.log('Cross-tab switch notice visible when 0 matches in current tab:', switchNotice > 0);

  await browser.close();
  console.log('\nAll browser verification steps completed successfully!');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
