import { test, expect } from '@playwright/test';

test.describe('Edit Account Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load and accounts to be available
    await page.waitForSelector('[data-testid="edit-account-button"]', { timeout: 10000 });
  });

  test('should open edit account form from account card', async ({ page }) => {
    // Click the edit button on the first account
    await page.click('[data-testid="edit-account-button"]', { force: true });
    
    // Verify edit account form modal opens
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Verify current account info is displayed (only shown in edit mode)
    await expect(page.locator('[data-testid="current-account-info"]')).toBeVisible();
    
    // Verify form elements are present for editing (no owner ID or account type)
    await expect(page.locator('[data-testid="owner-id-input"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="account-type-select"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="account-holder-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="balance-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="currency-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-status-switch"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-submit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-cancel-button"]')).toBeVisible();
    
    // Verify submit button shows "Update Account" text
    await expect(page.locator('[data-testid="account-submit-button"]')).toContainText('Update');
  });

  test('should close edit form with cancel button', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Click cancel button
    await page.click('[data-testid="account-cancel-button"]', { force: true });
    
    // Verify form is closed
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible();
  });

  test('should close edit form with X button', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Click X button
    await page.click('[data-testid="account-form-close"]', { force: true });
    
    // Verify form is closed
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible();
  });

  test('should display current account information in edit mode', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Verify current account info section is visible
    const currentAccountInfo = page.locator('[data-testid="current-account-info"]');
    await expect(currentAccountInfo).toBeVisible();
    
    // Verify it contains account details (account number, holder name, balance, type, status)
    await expect(currentAccountInfo).toContainText('#'); // Account number
    // Check for currency symbol or code
    const accountText = await currentAccountInfo.textContent();
    const hasCurrencySymbol = accountText && (/[$€£¥₹₽¢]/.test(accountText) || /USD|EUR|GBP|CHF|CNY|SEK/.test(accountText));
    expect(hasCurrencySymbol).toBeTruthy();
  });

  test('should pre-populate form fields with current account data', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Verify form fields are pre-populated
    const accountHolderInput = page.locator('[data-testid="account-holder-input"]');
    const balanceInput = page.locator('[data-testid="balance-input"]');
    
    // Check that fields have values (not empty)
    const holderValue = await accountHolderInput.inputValue();
    const balanceValue = await balanceInput.inputValue();
    
    expect(holderValue).not.toBe('');
    expect(balanceValue).not.toBe('');
    expect(parseFloat(balanceValue)).toBeGreaterThanOrEqual(0);
  });

  test('should update account holder name successfully', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Update account holder name
    await page.fill('[data-testid="account-holder-input"]', 'Updated Account Holder');
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful update)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should update account balance successfully', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Update balance
    await page.fill('[data-testid="balance-input"]', '2500.75');
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful update)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should update account currency successfully', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Change currency
    await page.click('[data-testid="currency-select"]', { force: true });
    await page.waitForSelector('[data-testid="currency-options"]');
    await page.click('[data-testid="currency-option-EUR"]', { force: true });
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful update)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should update multiple fields simultaneously', async ({ page }) => {
    // Open edit form
    await page.click('[data-testid="edit-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Update multiple fields
    await page.fill('[data-testid="account-holder-input"]', 'Multi Update Test');
    await page.fill('[data-testid="balance-input"]', '3333.33');
    
    // Change currency
    await page.click('[data-testid="currency-select"]', { force: true });
    await page.waitForSelector('[data-testid="currency-options"]');
    await page.click('[data-testid="currency-option-GBP"]', { force: true });
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful update)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });
}); 