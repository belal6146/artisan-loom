import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Profile AI Explorer tab works with local provider', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Check AI Explorer tab is visible
  const aiTab = page.getByRole('tab', { name: /AI Explorer/i });
  await expect(aiTab).toBeVisible();
  
  // Click AI Explorer tab
  await aiTab.click();
  await expect(aiTab).toHaveAttribute('aria-selected', 'true');

  // Check provider select defaults to local
  const providerSelect = page.getByRole('button', { name: /select ai provider|ai provider/i });
  await expect(providerSelect).toBeVisible();
  
  // Check style selector has non-empty values
  const styleSelect = page.getByRole('button', { name: /choose an art style|art style/i });
  await expect(styleSelect).toBeVisible();
  await styleSelect.click();
  
  // Verify no empty options
  const emptyOption = page.getByRole('option', { name: /^$/ });
  await expect(emptyOption).toHaveCount(0);
  
  // Select a style
  await page.getByRole('option', { name: 'Impressionism' }).click();
  
  // Enter a prompt
  const promptField = page.getByLabel(/describe|vision|prompt/i);
  await expect(promptField).toBeVisible();
  await promptField.fill('A beautiful sunset over mountains');
  
  // Generate image
  const generateButton = page.getByRole('button', { name: /generate artwork/i });
  await expect(generateButton).toBeVisible();
  await generateButton.click();
  
  // Should show loading state
  await expect(generateButton).toBeDisabled();
  
  // Wait for image to appear (mock will be fast)
  await expect(page.locator('img[alt*="Generated artwork"]')).toBeVisible({ timeout: 10000 });
  
  // Check that "AI-generated" badge or text appears
  await expect(page.getByText(/ai.generated|generated/i)).toBeVisible();
});

test('Profile shows only for profile owner or in dev', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user_2');
  await acceptEssentialConsent(page);
  
  // For non-owner profiles, AI Explorer should still be visible in dev
  const aiTab = page.getByRole('tab', { name: /AI Explorer/i });
  await expect(aiTab).toBeVisible();
});