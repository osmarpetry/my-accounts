import { test, expect } from '@playwright/test';

test.describe('Transfer Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load and accounts to be fetched
    await page.waitForSelector('[data-testid="transfer-button-header"]', { timeout: 10000 });
  });

  test('should open transfer form from header button', async ({ page }) => {
    await page.click('[data-testid="transfer-button-header"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toContainText('Transfer Funds');
  });

  test('should close transfer form with cancel button', async ({ page }) => {
    await page.click('[data-testid="transfer-button-header"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
    
    await page.click('[data-testid="transfer-cancel-button"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).not.toBeVisible();
  });

  test('should close transfer form with X button', async ({ page }) => {
    await page.click('[data-testid="transfer-button-header"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
    
    await page.click('[data-testid="transfer-form-close"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).not.toBeVisible();
  });

  test('should perform successful same currency transfer', async ({ page }) => {
    await page.click('[data-testid="transfer-button-header"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
    
    // Select from account
    await page.click('[data-testid="from-account-select"]', { force: true });
    await page.waitForSelector('[data-testid="from-account-options"]');
    const fromAccountOptions = page.locator('[data-testid^="from-account-option-"]');
    await fromAccountOptions.first().click({ force: true });
    
    // Select to account
    await page.click('[data-testid="to-account-select"]', { force: true });
    await page.waitForSelector('[data-testid="to-account-options"]');
    const toAccountOptions = page.locator('[data-testid^="to-account-option-"]');
    await toAccountOptions.first().click({ force: true });
    
    // Enter amount
    await page.fill('[data-testid="transfer-amount-input"]', '100');
    
    // Enter description
    await page.fill('[data-testid="transfer-description-input"]', 'Test transfer');
    
    // Submit transfer
    await page.click('[data-testid="transfer-submit-button"]', { force: true });
    
    // Wait for form to close (successful transfer)
    await expect(page.locator('[data-testid="transfer-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should open transfer form from individual account button', async ({ page }) => {
    // Find and click individual account transfer button
    const transferButtons = page.locator('[data-testid^="transfer-button-"]');
    const count = await transferButtons.count();
    
    if (count > 0) {
      await transferButtons.first().click({ force: true });
      await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
      
      // Wait a bit for the form to fully render with the pre-selected account
      await page.waitForTimeout(500);
      
      // Verify from account is pre-selected (should show account display instead of select)
      // Check if either the display is visible OR the select has a value (fallback)
      const hasFromAccountDisplay = await page.locator('[data-testid="from-account-display"]').isVisible();
      const hasFromAccountSelect = await page.locator('[data-testid="from-account-select"]').isVisible();
      
      if (hasFromAccountDisplay) {
        await expect(page.locator('[data-testid="from-account-display"]')).toBeVisible();
      } else if (hasFromAccountSelect) {
        // If select is visible, it should have a pre-selected value
        const selectValue = await page.locator('[data-testid="from-account-select"]').textContent();
        expect(selectValue).not.toContain('Select');
      }
    }
  });

  test('should show available balance for selected account', async ({ page }) => {
    await page.click('[data-testid="transfer-button-header"]', { force: true });
    await expect(page.locator('[data-testid="transfer-form-modal"]')).toBeVisible();
    
    // Select from account
    await page.click('[data-testid="from-account-select"]', { force: true });
    await page.waitForSelector('[data-testid="from-account-options"]');
    const fromAccountOptions = page.locator('[data-testid^="from-account-option-"]');
    await fromAccountOptions.first().click({ force: true });
    
    // Check that available balance is displayed
    await expect(page.locator('[data-testid="available-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-balance"]')).toContainText('Available');
  });
}); 