import { test, expect } from '@playwright/test';
import { seedDev, acceptEssentialConsent, gotoWithRetry } from './utils';

test('Accessibility: Explore page has proper ARIA labels', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Check tab navigation has proper roles
  const tabList = page.getByRole('tablist');
  await expect(tabList).toBeVisible();

  const tabs = page.getByRole('tab');
  const tabCount = await tabs.count();
  expect(tabCount).toBeGreaterThan(0);

  // Check that each tab has aria-selected
  for (let i = 0; i < tabCount; i++) {
    const tab = tabs.nth(i);
    await expect(tab).toHaveAttribute('aria-selected');
  }

  // Check sort button has proper label
  const sortButton = page.getByRole('button', { name: /sort/i });
  if (await sortButton.isVisible()) {
    await expect(sortButton).toHaveAttribute('aria-label');
  }
});

test('Accessibility: Keyboard navigation works', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/');
  await acceptEssentialConsent(page);

  // Tab navigation with keyboard
  await page.keyboard.press('Tab');
  
  // Should be able to navigate between tabs with arrow keys
  const firstTab = page.getByRole('tab').first();
  await firstTab.focus();
  
  await page.keyboard.press('ArrowRight');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toHaveAttribute('role', 'tab');
});

test('Accessibility: Forms have proper labels', async ({ page }) => {
  await seedDev(page);
  await gotoWithRetry(page, '/profile/demo_user');
  await acceptEssentialConsent(page);

  // Check AI Explorer tab if available
  const aiTab = page.getByRole('tab', { name: /AI Explorer|AI/i });
  
  if (await aiTab.isVisible()) {
    await aiTab.click();
    
    // Check form elements have labels
    const textArea = page.getByRole('textbox', { name: /prompt|vision/i });
    if (await textArea.isVisible()) {
      await expect(textArea).toBeVisible();
    }
    
    const selects = page.getByRole('button', { name: /provider|style/i });
    const selectCount = await selects.count();
    
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      if (await select.isVisible()) {
        await expect(select).toHaveAttribute('aria-label');
      }
    }
  }
});