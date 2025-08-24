import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Experience shows only verified domains', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/experience');
  await acceptEssentialConsent(page);

  // Click Tools tab
  const toolsTab = page.getByRole('tab', { name: /Tools/i });
  if (await toolsTab.isVisible()) {
    await toolsTab.click();
    
    // Check that all links have verified badges
    const toolCards = page.locator('[data-testid="tools-market"] a');
    const cardCount = await toolCards.count();
    
    if (cardCount > 0) {
      for (let i = 0; i < cardCount; i++) {
        const card = toolCards.nth(i);
        const verifiedBadge = card.locator('text=Verified');
        await expect(verifiedBadge).toBeVisible();
        
        // Check external link attributes
        await expect(card).toHaveAttribute('target', '_blank');
        await expect(card).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  // Click Events tab
  const eventsTab = page.getByRole('tab', { name: /Events/i });
  if (await eventsTab.isVisible()) {
    await eventsTab.click();
    
    // Check that all event links are verified
    const eventCards = page.locator('[data-testid="events-list"] a');
    const eventCount = await eventCards.count();
    
    if (eventCount > 0) {
      for (let i = 0; i < eventCount; i++) {
        const card = eventCards.nth(i);
        const verifiedBadge = card.locator('text=Verified');
        await expect(verifiedBadge).toBeVisible();
        
        // Check external link attributes
        await expect(card).toHaveAttribute('target', '_blank');
        await expect(card).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  }
});

test('Experience tabs navigation works', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/experience');
  await acceptEssentialConsent(page);

  // Test tabs exist and are clickable
  const tabs = ['Events', 'Tools'];
  
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
  }
});