import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Explore homepage: tabs work and modules inject', async ({ page }) => {
  await seedDev(page);
  await acceptEssentialConsent(page);

  await gotoWithRetry(page, '/');
  
  // Verify For You tab is active by default
  await expect(page.getByRole('tab', { name: 'For You' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'For You' })).toHaveAttribute('aria-selected', 'true');

  // Switch to Following tab
  await page.getByRole('tab', { name: 'Following' }).click();
  await expect(page.getByRole('tab', { name: 'Following' })).toHaveAttribute('aria-selected', 'true');

  // Switch to Trending tab
  await page.getByRole('tab', { name: 'Trending' }).click();
  await expect(page.getByRole('tab', { name: 'Trending' })).toHaveAttribute('aria-selected', 'true');

  // Verify sort button works
  const sortButton = page.getByRole('button', { name: /rank|latest/i });
  await expect(sortButton).toBeVisible();
  await sortButton.click();

  // Check Collaborations tab
  await page.getByRole('tab', { name: 'Collaborations' }).click();
  await expect(page.getByRole('tab', { name: 'Collaborations' })).toHaveAttribute('aria-selected', 'true');

  // Check Learn tab
  await page.getByRole('tab', { name: 'Learn' }).click();
  await expect(page.getByRole('tab', { name: 'Learn' })).toHaveAttribute('aria-selected', 'true');
});

test('Global composer is accessible', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Check for composer presence (either floating button or hero composer)
  const composer = page.locator('[data-testid="global-composer"], [data-testid="composer-button"]').first();
  await expect(composer).toBeVisible();
});

test('Tab state persists in URL', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Switch to trending tab
  await page.getByRole('tab', { name: 'Trending' }).click();
  
  // URL should reflect the tab change
  await expect(page).toHaveURL(/tab=trending/);

  // Refresh and verify tab is still active
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Trending' })).toHaveAttribute('aria-selected', 'true');
});