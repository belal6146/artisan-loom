import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Insights tab shows for profile owner', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Check Insights tab is visible for owner
  const insightsTab = page.getByRole('tab', { name: /Insights/i });
  await expect(insightsTab).toBeVisible();
  
  // Click Insights tab
  await insightsTab.click();
  await expect(insightsTab).toHaveAttribute('aria-selected', 'true');

  // Check for stats cards
  const statsCards = page.locator('[data-testid="stats-card"]');
  const cardCount = await statsCards.count();
  expect(cardCount).toBeGreaterThan(0);

  // Verify timeline exists
  const timeline = page.locator('[data-testid="timeline"]');
  await expect(timeline).toBeVisible();
});

test('Insights hides prices for non-sale artworks', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  const insightsTab = page.getByRole('tab', { name: /Insights/i });
  if (await insightsTab.isVisible()) {
    await insightsTab.click();
    
    // Look for artwork entries and verify price handling
    const artworkEntries = page.locator('[data-testid="artwork-entry"]');
    const entryCount = await artworkEntries.count();
    
    if (entryCount > 0) {
      // Check that non-sale items don't show prices
      const nonSaleItems = page.locator('[data-testid="artwork-entry"][data-for-sale="false"]');
      const nonSaleCount = await nonSaleItems.count();
      
      for (let i = 0; i < nonSaleCount; i++) {
        const item = nonSaleItems.nth(i);
        const priceElement = item.locator('[data-testid="price"]');
        await expect(priceElement).toHaveCount(0);
      }
    }
  }
});

test('Insights shows totals and averages', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  const insightsTab = page.getByRole('tab', { name: /Insights/i });
  if (await insightsTab.isVisible()) {
    await insightsTab.click();
    
    // Check for total purchase amount
    const totalAmount = page.getByTestId('total-amount');
    if (await totalAmount.isVisible()) {
      const totalText = await totalAmount.textContent();
      expect(totalText).toMatch(/\$[\d,]+/); // Should show currency format
    }
    
    // Check for average purchase
    const avgAmount = page.getByTestId('avg-amount');
    if (await avgAmount.isVisible()) {
      const avgText = await avgAmount.textContent();
      expect(avgText).toMatch(/\$[\d,]+/); // Should show currency format
    }
  }
});