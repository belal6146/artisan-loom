import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Experience: Events and Tools tabs work', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/experience');
  await acceptEssentialConsent(page);

  // Verify Events tab is visible and active by default
  await expect(page.getByRole('tab', { name: 'Events' })).toBeVisible();
  
  // Check that events list or empty state is shown
  const eventsContent = page.locator('[data-testid="events-list"], .text-muted-foreground');
  await expect(eventsContent.first()).toBeVisible();

  // Switch to Tools tab
  await page.getByRole('tab', { name: /Art Tools|Tools/i }).click();
  await expect(page.getByRole('tab', { name: /Art Tools|Tools/i })).toHaveAttribute('aria-selected', 'true');

  // Check that tools list or empty state is shown
  const toolsContent = page.locator('[data-testid="tools-list"], .text-muted-foreground');
  await expect(toolsContent.first()).toBeVisible();
});

test('Experience: Filter dropdowns use non-empty values', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/experience');
  await acceptEssentialConsent(page);

  // Test Events filters
  const categorySelect = page.getByRole('button', { name: /category/i }).first();
  if (await categorySelect.isVisible()) {
    await categorySelect.click();
    
    // Verify no empty value options exist
    const emptyOption = page.getByRole('option', { name: /^$/ });
    await expect(emptyOption).toHaveCount(0);
    
    // Should have "All" or similar non-empty default
    const allOption = page.getByRole('option', { name: /all|any/i });
    await expect(allOption.first()).toBeVisible();
    
    // Close dropdown
    await page.keyboard.press('Escape');
  }

  // Switch to Tools and test filters
  await page.getByRole('tab', { name: /Art Tools|Tools/i }).click();
  
  const sortSelect = page.getByRole('button', { name: /sort|relevance/i }).first();
  if (await sortSelect.isVisible()) {
    await sortSelect.click();
    
    // Verify no empty value options
    const emptyOption = page.getByRole('option', { name: /^$/ });
    await expect(emptyOption).toHaveCount(0);
    
    await page.keyboard.press('Escape');
  }
});

test('Experience: External links have proper attributes', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/experience');
  await acceptEssentialConsent(page);

  // Check events external links
  const eventLinks = page.getByRole('link', { name: /visit|view/i });
  const eventLinkCount = await eventLinks.count();
  
  if (eventLinkCount > 0) {
    const firstEventLink = eventLinks.first();
    await expect(firstEventLink).toHaveAttribute('target', '_blank');
    await expect(firstEventLink).toHaveAttribute('rel', /noopener/);
  }

  // Switch to tools and check tool links
  await page.getByRole('tab', { name: /Art Tools|Tools/i }).click();
  
  const toolLinks = page.getByRole('link', { name: /shop|visit/i });
  const toolLinkCount = await toolLinks.count();
  
  if (toolLinkCount > 0) {
    const firstToolLink = toolLinks.first();
    await expect(firstToolLink).toHaveAttribute('target', '_blank');
    await expect(firstToolLink).toHaveAttribute('rel', /noopener/);
  }
});