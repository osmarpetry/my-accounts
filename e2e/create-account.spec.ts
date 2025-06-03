import { test, expect } from '@playwright/test';

test.describe('Create Account Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="create-account-button"]', { timeout: 10000 });
  });

  test('should open create account form from header button', async ({ page }) => {
    // Click the create account button in header with force to avoid overlapping elements
    await page.click('[data-testid="create-account-button"]', { force: true });
    
    // Verify account form modal opens
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Verify form elements are present for new account
    await expect(page.locator('[data-testid="owner-id-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-owner-id-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-holder-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-type-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="balance-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="currency-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-submit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-cancel-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-submit-button"]')).toContainText('Create Account');
  });

  test('should close create form with cancel button', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Click cancel button
    await page.click('[data-testid="account-cancel-button"]');
    
    // Verify form is closed
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible();
  });

  test('should close create form with X button', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Click close button
    await page.click('[data-testid="account-form-close"]', { force: true });
    
    // Verify form is closed
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible();
  });

  test('should generate owner ID when button is clicked', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Get initial owner ID value
    const initialOwnerId = await page.locator('[data-testid="owner-id-input"]').inputValue();
    
    // Click generate button
    await page.click('[data-testid="generate-owner-id-button"]');
    
    // Verify owner ID has changed
    const newOwnerId = await page.locator('[data-testid="owner-id-input"]').inputValue();
    expect(newOwnerId).not.toBe(initialOwnerId);
    expect(newOwnerId).toMatch(/^\d{6}$/); // Should be 6 digits
  });

  test('should show character count for account holder name', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Type in account holder name and check character count
    await page.fill('[data-testid="account-holder-input"]', 'John Doe');
    await expect(page.locator('[data-testid="account-holder-character-count"]')).toContainText('8/100 characters');
  });

  test('should create account successfully with valid data', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Generate owner ID
    await page.click('[data-testid="generate-owner-id-button"]', { force: true });
    
    // Fill account holder name
    await page.fill('[data-testid="account-holder-input"]', 'Test Account Holder');
    
    // Select account type
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.click('[data-testid="account-type-option-checking"]', { force: true });
    
    // Fill balance
    await page.fill('[data-testid="balance-input"]', '1000');
    
    // Select currency
    await page.click('[data-testid="currency-select"]', { force: true });
    await page.click('[data-testid="currency-option-USD"]', { force: true });
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful creation)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should create different account types', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Generate owner ID
    await page.click('[data-testid="generate-owner-id-button"]', { force: true });
    
    // Fill account holder name
    await page.fill('[data-testid="account-holder-input"]', 'Savings Account Test');
    
    // Select savings account type
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.click('[data-testid="account-type-option-savings"]', { force: true });
    
    // Fill balance
    await page.fill('[data-testid="balance-input"]', '5000');
    
    // Submit the form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close (successful creation)
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle decimal balance input', async ({ page }) => {
    // Open account form
    await page.click('[data-testid="create-account-button"]', { force: true });
    await expect(page.locator('[data-testid="account-form-modal"]')).toBeVisible();
    
    // Generate owner ID
    await page.click('[data-testid="generate-owner-id-button"]', { force: true });
    
    // Fill account holder name
    await page.fill('[data-testid="account-holder-input"]', 'Decimal Test');
    
    // Select account type
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.click('[data-testid="account-type-option-checking"]', { force: true });
    
    // Fill decimal balance
    await page.fill('[data-testid="balance-input"]', '1234.56');
    
    // Verify the value is accepted
    const balanceValue = await page.locator('[data-testid="balance-input"]').inputValue();
    expect(balanceValue).toBe('1234.56');
    
    // Submit form
    await page.click('[data-testid="account-submit-button"]', { force: true });
    
    // Wait for form to close
    await expect(page.locator('[data-testid="account-form-modal"]')).not.toBeVisible({ timeout: 10000 });
  });
}); 