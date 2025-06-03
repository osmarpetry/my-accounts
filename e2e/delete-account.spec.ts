import { test, expect } from '@playwright/test';

test.describe('Delete Account Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load and accounts to be available
    await page.waitForSelector('[data-testid="delete-account-button"]', { timeout: 10000 });
  });

  test('should open delete confirmation dialog', async ({ page }) => {
    // Click the delete button on the first account
    await page.click('[data-testid="delete-account-button"]', { force: true });
    
    // Verify delete confirmation dialog opens
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
    
    // Verify dialog elements are present
    await expect(page.locator('[data-testid="delete-confirmation-dialog-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation-dialog-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation-dialog-cancel"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation-dialog-confirm"]')).toBeVisible();
    
    // Verify dialog content
    await expect(page.locator('[data-testid="delete-confirmation-dialog-title"]')).toContainText('Delete Account');
    await expect(page.locator('[data-testid="delete-confirmation-dialog-description"]')).toContainText('Are you sure you want to delete');
    await expect(page.locator('[data-testid="delete-confirmation-dialog-confirm"]')).toContainText('Delete');
    await expect(page.locator('[data-testid="delete-confirmation-dialog-cancel"]')).toContainText('Cancel');
  });

  test('should close confirmation dialog with cancel', async ({ page }) => {
    // Open delete confirmation dialog
    await page.click('[data-testid="delete-account-button"]', { force: true });
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
    
    // Click cancel button
    await page.click('[data-testid="delete-confirmation-dialog-cancel"]', { force: true });
    
    // Verify dialog is closed
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).not.toBeVisible();
  });

  test('should show warning for account with balance', async ({ page }) => {
    // Find account with positive balance
    const accountCards = page.locator('[data-testid="delete-account-button"]');
    const count = await accountCards.count();
    
    for (let i = 0; i < count; i++) {
      const accountCard = accountCards.nth(i).locator('..').locator('..');
      const balanceText = await accountCard.textContent();
      
      if (balanceText && !balanceText.includes('0.00')) {
        await accountCards.nth(i).click({ force: true });
        await expect(page.locator('[data-testid="delete-warning-modal"]')).toBeVisible();
        return;
      }
    }
  });

  test('should delete zero balance account', async ({ page }) => {
    // Find account with zero balance
    const accountCards = page.locator('[data-testid="delete-account-button"]');
    const count = await accountCards.count();
    
    for (let i = 0; i < count; i++) {
      const accountCard = accountCards.nth(i).locator('..').locator('..');
      const balanceText = await accountCard.textContent();
      
      if (balanceText && balanceText.includes('0.00')) {
        await accountCards.nth(i).click({ force: true });
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
        await page.click('[data-testid="delete-confirmation-dialog-confirm"]', { force: true });
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).not.toBeVisible({ timeout: 10000 });
        return;
      }
    }
  });
}); 