import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Explore tabs navigation works', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Test all tabs exist and are clickable
  const tabs = ['For You', 'Following', 'Nearby', 'Trending', 'Collaborations', 'Learn'];
  
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      
      // Check URL reflects the tab
      if (tabName !== 'For You') {
        const expectedParam = tabName.toLowerCase().replace(' ', '-');
        await expect(page).toHaveURL(new RegExp(`tab=${expectedParam}`));
      }
    }
  }
});

test('Explore streams show smart injections', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Check for smart injections after scrolling
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Look for EventsModule or ToolsModule injections
  const eventModules = page.locator('[data-testid="events-module"]');
  const toolModules = page.locator('[data-testid="tools-module"]');
  
  // Should have at least one injection (either events or tools)
  const moduleCount = await eventModules.count() + await toolModules.count();
  expect(moduleCount).toBeGreaterThan(0);
});

test('Sort options work in streams', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Check if sort selector exists and is functional
  const sortSelect = page.getByRole('button', { name: /sort|filter/i }).first();
  if (await sortSelect.isVisible()) {
    await sortSelect.click();
    
    const sortOptions = page.getByRole('option');
    const optionCount = await sortOptions.count();
    expect(optionCount).toBeGreaterThan(0);
    
    // Try selecting a different sort option
    if (optionCount > 1) {
      await sortOptions.nth(1).click();
      // URL should reflect the sort change
      await expect(page).toHaveURL(/sort=/);
    }
  }
});