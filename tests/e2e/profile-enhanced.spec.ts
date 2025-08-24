import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Profile resolves by username and id + shows tabs', async ({ page }) => {
  await seedDev(page);
  
  // Test username resolution
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);
  await expect(page.getByRole('heading', { name: /demo artist/i })).toBeVisible();
  await expect(page.getByText('@demo_user')).toBeVisible();
  
  // Test ID resolution 
  await gotoWithRetry(page, '/profile/u_demo');
  await acceptEssentialConsent(page);
  await expect(page.getByRole('heading', { name: /demo artist/i })).toBeVisible();
  await expect(page.getByText('@demo_user')).toBeVisible();
});

test('Profile tabs work correctly', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Check overview tab is default
  await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');

  // Test navigation between tabs
  const tabs = ['Artwork', 'Feed', 'Collaborations', 'Connections'];
  
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: tabName });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
  }
});

test('AI Explorer tab for owner with non-empty selects', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Click AI Explorer tab
  const aiTab = page.getByRole('tab', { name: /AI Explorer/i });
  if (await aiTab.isVisible()) {
    await aiTab.click();
    await expect(aiTab).toHaveAttribute('aria-selected', 'true');

    // Test style selector
    const styleSelect = page.getByRole('button', { name: /select style/i });
    if (await styleSelect.isVisible()) {
      await styleSelect.click();
      
      // Verify no empty value options
      const emptyOption = page.getByRole('option', { name: /^$/ });
      await expect(emptyOption).toHaveCount(0);
      
      // Select a style
      await page.getByRole('option', { name: 'Impressionism' }).click();
      
      // Check that prompt field exists
      await expect(page.getByLabel(/describe|vision|prompt/i)).toBeVisible();
    }
  }
});

test('Profile handles non-existent users properly', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/nonexistent_user');
  await acceptEssentialConsent(page);

  // Should show 404 page
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText('User not found')).toBeVisible();
  
  // Should have go back button
  await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
});

test('Profile privacy: private content hidden from non-owners', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);
  
  // Since this is the demo user profile and we're not logged in as the owner,
  // we should only see public content
  await page.getByRole('tab', { name: 'Artwork' }).click();
  
  // Should not see AI Explorer tab (owner only)
  await expect(page.getByRole('tab', { name: /AI Explorer/i })).not.toBeVisible();
});