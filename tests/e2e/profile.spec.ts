import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Profile: Demo user loads successfully', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Should not show 404 page
  await expect(page.getByText('404')).not.toBeVisible();
  await expect(page.getByText('User not found')).not.toBeVisible();

  // Should show profile header
  await expect(page.getByText('Demo Artist')).toBeVisible();
  await expect(page.getByText('@demo_user')).toBeVisible();
});

test('Profile: Tabs navigation works', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Default tab should be Overview
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');

  // Test other tabs
  const tabs = ['Artwork', 'Feed', 'Collaborations', 'Connections'];
  
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
  }
});

test('Profile: AI Explorer tab for owner', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Check if AI Explorer tab is visible (should be for profile owner)
  const aiTab = page.getByRole('tab', { name: /AI Explorer|AI/i });
  
  if (await aiTab.isVisible()) {
    await aiTab.click();
    await expect(aiTab).toHaveAttribute('aria-selected', 'true');

    // Check that style selector exists and works
    const styleSelect = page.getByRole('button', { name: /select style|style/i });
    if (await styleSelect.isVisible()) {
      await styleSelect.click();
      
      // Verify style options are available and non-empty
      const styleOptions = page.getByRole('option');
      const optionCount = await styleOptions.count();
      expect(optionCount).toBeGreaterThan(0);
      
      // Select a style
      await page.getByRole('option', { name: 'Impressionism' }).click();
      
      // Check that prompt field exists
      await expect(page.getByLabel(/describe|vision|prompt/i)).toBeVisible();
    }
  }
});

test('Profile: 404 handling for non-existent user', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/nonexistent_user');
  await acceptEssentialConsent(page);

  // Should show 404 page
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText('User not found')).toBeVisible();
  
  // Should have go back button
  await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
});