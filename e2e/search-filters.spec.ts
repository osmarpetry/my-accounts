import { test, expect } from '@playwright/test';

test.describe('Search & Filters Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accounts');
    await page.waitForSelector('[data-testid="search-filters-card"]', { timeout: 10000 });
  });

  test('should perform basic text search', async ({ page }) => {
    // Enter search text
    await page.fill('[data-testid="search-input"]', 'John');
    
    // Verify search is applied
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('John');
    
    // Verify results count updates
    await expect(page.locator('[data-testid="results-count"]')).toBeVisible();
    
    // Verify active filter count shows
    await expect(page.locator('[data-testid="active-filter-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('1');
  });

  test('should clear search with X button', async ({ page }) => {
    // Enter search text
    await page.fill('[data-testid="search-input"]', 'Test');
    await expect(page.locator('[data-testid="clear-search-button"]')).toBeVisible();
    
    // Clear search
    await page.click('[data-testid="clear-search-button"]', { force: true });
    
    // Verify search is cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="clear-search-button"]')).not.toBeVisible();
  });

  test('should filter by account type', async ({ page }) => {
    // Open account type filter
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.waitForSelector('[data-testid="account-type-options"]');
    
    // Select checking account type
    await page.click('[data-testid="account-type-option-checking"]', { force: true });
    
    // Verify filter is applied
    await expect(page.locator('[data-testid="account-type-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-type-badge"]')).toContainText('Type: Checking');
    
    // Verify active filter count
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('1');
  });

  test('should filter by status', async ({ page }) => {
    // Open status filter
    await page.click('[data-testid="status-select"]', { force: true });
    await page.waitForSelector('[data-testid="status-options"]');
    
    // Select active status
    await page.click('[data-testid="status-option-active"]', { force: true });
    
    // Verify filter is applied
    await expect(page.locator('[data-testid="status-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge"]')).toContainText('Status: Active');
    
    // Verify active filter count
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('1');
  });

  test('should clear all filters', async ({ page }) => {
    // Apply multiple filters
    await page.fill('[data-testid="search-input"]', 'Test');
    
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.waitForSelector('[data-testid="account-type-options"]');
    await page.click('[data-testid="account-type-option-savings"]', { force: true });
    
    await page.click('[data-testid="status-select"]', { force: true });
    await page.waitForSelector('[data-testid="status-options"]');
    await page.click('[data-testid="status-option-active"]', { force: true });
    
    // Verify multiple filters are active
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('3');
    await expect(page.locator('[data-testid="active-filters-section"]')).toBeVisible();
    
    // Clear all filters
    await page.click('[data-testid="clear-all-filters-button"]', { force: true });
    
    // Verify all filters are cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="active-filter-count"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="active-filters-section"]')).not.toBeVisible();
  });

  test('should remove individual filter badges', async ({ page }) => {
    // Apply account type filter
    await page.click('[data-testid="account-type-select"]', { force: true });
    await page.waitForSelector('[data-testid="account-type-options"]');
    await page.click('[data-testid="account-type-option-checking"]', { force: true });
    
    // Apply status filter
    await page.click('[data-testid="status-select"]', { force: true });
    await page.waitForSelector('[data-testid="status-options"]');
    await page.click('[data-testid="status-option-active"]', { force: true });
    
    // Verify both filters are active
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('2');
    await expect(page.locator('[data-testid="account-type-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-badge"]')).toBeVisible();
    
    // Remove account type filter
    await page.click('[data-testid="remove-account-type-filter"]', { force: true });
    
    // Verify only status filter remains
    await expect(page.locator('[data-testid="active-filter-count"]')).toContainText('1');
    await expect(page.locator('[data-testid="account-type-badge"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="status-badge"]')).toBeVisible();
  });
}); 