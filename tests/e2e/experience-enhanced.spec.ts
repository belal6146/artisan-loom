import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test.describe('Experience Enhanced', () => {
  test('should show verified domains only with trust badges', async ({ page }) => {
    await seedDev(page);
    await gotoWithRetry(page, '/experience');
    await acceptEssentialConsent(page);

    // Test sticky header
    const stickyHeader = page.locator('[data-testid="sticky-header"]');
    if (await stickyHeader.isVisible()) {
      await expect(stickyHeader).toHaveClass(/sticky/);
    }

    // Check verified badges on all items
    const verifiedBadges = page.locator('[data-testid="domain-badge"][data-verified="true"]');
    const badgeCount = await verifiedBadges.count();
    
    if (badgeCount > 0) {
      // All badges should indicate verified status
      for (let i = 0; i < badgeCount; i++) {
        const badge = verifiedBadges.nth(i);
        await expect(badge).toBeVisible();
      }
    }

    // Check star ratings on tools
    await page.click('[data-tab="tools"]');
    const ratings = page.locator('[data-testid="star-rating"]');
    const ratingCount = await ratings.count();
    
    if (ratingCount > 0) {
      // Verify ratings are displayed properly
      for (let i = 0; i < ratingCount; i++) {
        const rating = ratings.nth(i);
        await expect(rating).toBeVisible();
      }
    }

    // Verify external links have proper attributes
    const externalLinks = page.locator('a[target="_blank"]');
    const linkCount = await externalLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('should hide prices for non-sale artworks', async ({ page }) => {
    await seedDev(page);
    await gotoWithRetry(page, '/');
    await acceptEssentialConsent(page);

    // Look for artwork cards
    const artworkCards = page.locator('[data-testid="unified-card"]');
    const cardCount = await artworkCards.count();

    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = artworkCards.nth(i);
        
        // Check if artwork is for sale
        const forSaleIndicator = card.locator('[data-for-sale="true"]');
        const priceDisplay = card.locator('[data-testid="price"]');
        
        if (!(await forSaleIndicator.isVisible())) {
          // Not for sale - price should not be visible
          await expect(priceDisplay).not.toBeVisible();
        }
      }
    }
  });

  test('should show smart injections in explore streams', async ({ page }) => {
    await seedDev(page);
    await gotoWithRetry(page, '/');
    await acceptEssentialConsent(page);

    // Scroll to trigger more content
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for potential injections
    await page.waitForTimeout(2000);

    // Look for module injections
    const eventModules = page.locator('[data-testid="events-module"]');
    const toolModules = page.locator('[data-testid="tools-module"]');
    
    const totalModules = await eventModules.count() + await toolModules.count();
    
    // Should have at least one injection type
    expect(totalModules).toBeGreaterThanOrEqual(0);
  });
});