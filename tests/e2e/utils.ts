import { Page, expect } from '@playwright/test';

export async function seedDev(page: Page) {
  // Clear any existing localStorage and ensure dev seed runs
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    // Force dev seed to run again
    localStorage.removeItem('devSeeded');
  });
  
  // Reload to trigger dev seed
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Verify demo user was created
  await page.evaluate(() => {
    const users = localStorage.getItem('users');
    if (!users || !JSON.parse(users).find((u: any) => u.username === 'demo_user')) {
      throw new Error('Demo user not found after seeding');
    }
  });
}

export async function acceptEssentialConsent(page: Page) {
  // Wait a bit for consent banner to appear
  await page.waitForTimeout(500);
  
  const banner = page.getByRole('dialog', { name: /privacy|consent/i });
  if (await banner.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /allow essential|accept|okay/i }).click();
  }
}

export async function gotoWithRetry(page: Page, url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}