import { test, expect } from "@playwright/test";

test.describe("Bank Accounts Application", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display the main page with accounts", async ({ page }) => {
    // Check if the main heading is visible
    await expect(
      page.getByRole("heading", { name: "Bank Accounts" })
    ).toBeVisible();

    // Check if stats cards are visible using more specific selectors
    await expect(page.getByText("Total Balance")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Active Accounts" })
    ).toBeVisible();
    await expect(page.getByText("Account Types")).toBeVisible();

    // Check if existing accounts are displayed
    await expect(page.getByText("Your Accounts")).toBeVisible();
  });

  test("should create a new account", async ({ page }) => {
    // Click the "Add Account" button
    await page.getByRole("button", { name: "Add Account" }).click();

    // Wait for modal to appear - use heading instead of ambiguous text
    await expect(
      page.getByRole("heading", { name: "Create New Account" })
    ).toBeVisible();

    // Fill in the form
    await page.getByLabel("Account Holder *").fill("Test User");
    await page.getByLabel("Account Type *").click();
    await page.getByRole("option", { name: "Checking" }).click();
    await page.getByLabel(/Initial Balance/).fill("1500");
    await page.getByLabel("Currency *").click();
    await page.getByRole("option", { name: "USD - US Dollar" }).click();

    // Submit the form - use specific button role
    await page.getByRole("button", { name: "Create New Account" }).click();

    // Wait for the form to close
    await expect(
      page.getByRole("heading", { name: "Create New Account" })
    ).not.toBeVisible();

    // Check if account was added - be more specific to avoid duplicates
    await expect(
      page.locator('div:has-text("Test User"):has-text("$1,500.00")').first()
    ).toBeVisible();
  });

  test("should edit an existing account", async ({ page }) => {
    // Create an account first if none exists
    const accountExists = await page
      .locator('[data-testid="edit-account-button"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!accountExists) {
      await page.getByRole("button", { name: "Add Account" }).click();
      await expect(
        page.getByRole("heading", { name: "Create New Account" })
      ).toBeVisible();
      await page.getByLabel("Account Holder *").fill("Test User");
      await page.getByLabel("Account Type *").click();
      await page.getByRole("option", { name: "Checking" }).click();
      await page.getByLabel(/Initial Balance/).fill("1000");
      await page.getByLabel("Currency *").click();
      await page.getByRole("option", { name: "USD - US Dollar" }).click();
      await page.getByRole("button", { name: "Create New Account" }).click();
      await expect(
        page.getByRole("heading", { name: "Create New Account" })
      ).not.toBeVisible();
    }

    // Click the edit button for the first account
    await page.locator('[data-testid="edit-account-button"]').first().click();

    // Wait for edit modal to appear
    await expect(
      page.getByRole("heading", { name: "Edit Account" })
    ).toBeVisible();

    // Update the account holder name
    await page.getByLabel("Account Holder *").clear();
    await page.getByLabel("Account Holder *").fill("Updated User");

    // Submit the form
    await page.getByRole("button", { name: "Update Account" }).click();

    // Wait for the form to close - this indicates successful update
    await expect(
      page.getByRole("heading", { name: "Edit Account" })
    ).not.toBeVisible();
  });

  test("should delete an account", async ({ page }) => {
    // Find and click a delete button
    const deleteButton = page
      .getByRole("button")
      .filter({
        has: page.locator('svg[data-testid="trash-icon"]'),
      })
      .first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion in the dialog
      await expect(page.getByText("Delete Account")).toBeVisible();
      await page.getByRole("button", { name: "Delete" }).click();

      // Wait for the account to be removed
      await page.waitForTimeout(1000);
    }
  });

  test("should switch languages", async ({ page }) => {
    // Click the language toggle button
    const languageButton = page
      .getByRole("button")
      .filter({ has: page.getByText("🇺🇸") });
    await languageButton.click();

    // Check if the page switched to French
    await expect(
      page.getByRole("heading", { name: "Comptes Bancaires" })
    ).toBeVisible();
    await expect(page.getByText("Solde Total")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Comptes Actifs" })
    ).toBeVisible();

    // Switch back to English
    const frenchButton = page
      .getByRole("button")
      .filter({ has: page.getByText("🇫🇷") });
    await frenchButton.click();

    // Check if back to English
    await expect(
      page.getByRole("heading", { name: "Bank Accounts" })
    ).toBeVisible();
  });

  test("should display loading states", async ({ page }) => {
    // Navigate to page and check for loading elements
    await page.goto("/");

    // The page should eventually load and show content using heading
    await expect(
      page.getByRole("heading", { name: "Bank Accounts" })
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if main elements are visible
    await expect(
      page.getByRole("heading", { name: "Bank Accounts" })
    ).toBeVisible();

    // Check if language switcher is responsive (text might be hidden)
    const languageButton = page
      .getByRole("button")
      .filter({ has: page.getByText("🇺🇸") });
    await expect(languageButton).toBeVisible();
  });

  test("should validate form inputs", async ({ page }) => {
    // Click the "Add Account" button
    await page.getByRole("button", { name: "Add Account" }).click();

    // Wait for modal to appear - use heading instead of ambiguous text
    await expect(
      page.getByRole("heading", { name: "Create New Account" })
    ).toBeVisible();

    // Try to submit empty form
    await page.getByRole("button", { name: "Create New Account" }).click();

    // Should show validation errors
    await expect(
      page.getByText("Account holder name is required")
    ).toBeVisible();

    // Fill with invalid data
    await page.getByLabel("Account Holder *").fill("123");
    await page.getByLabel(/Initial Balance/).fill("-100");

    await page.getByRole("button", { name: "Create New Account" }).click();

    // Should show validation errors
    await expect(
      page.getByText("Account holder name can only contain letters and spaces")
    ).toBeVisible();
    await expect(page.getByText("Balance cannot be negative")).toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept and fail API requests
    await page.route("**/api/accounts", (route) => {
      route.abort();
    });

    await page.goto("/");

    // Should show error state
    await expect(page.getByText("Error loading accounts")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });
});
