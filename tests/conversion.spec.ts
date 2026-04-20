import { test, expect } from '@playwright/test';

/**
 * E2E test for the core currency conversion flow
 */
test.describe('Currency Conversion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the local dev server
    await page.goto('http://localhost:3000');
  });

  test('should convert 100 USD to EUR correctly', async ({ page }) => {
    // 1. Locate and fill the amount input
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('100');

    // 2. Select EUR as destination (using the visible name 'Euro')
    const selects = page.locator('select');
    await selects.nth(1).selectOption({ label: 'Euro' });

    // 3. Verify the result exists and contains expected value
    const resultHeading = page.locator('h2').last();
    
    // UI renders "X.XXXX Euro" - We wait for the value to be greater than 0
    await expect(async () => {
      const text = await resultHeading.innerText();
      const value = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
      expect(value).toBeGreaterThan(0);
      expect(text).toContain('Euro');
    }).toPass({ timeout: 15000 });
  });

  test('should swap currencies', async ({ page }) => {
    const fromSelect = page.locator('select').first();
    const toSelect = page.locator('select').nth(1);
    
    // Wait for the currency list to be loaded into the selects
    await expect(fromSelect.locator('option')).not.toHaveCount(0, { timeout: 10000 });
    
    const initialFromValue = await fromSelect.inputValue();
    const initialToValue = await toSelect.inputValue();
    
    const swapButton = page.locator('button[aria-label="Swap currencies"]');
    await swapButton.click();
    
    // Use Playwright's auto-retrying assertions to wait for state synchronization
    await expect(fromSelect).toHaveValue(initialToValue, { timeout: 5000 });
    await expect(toSelect).toHaveValue(initialFromValue, { timeout: 5000 });
    
    const newFromValue = await fromSelect.inputValue();
    expect(newFromValue).toBe(initialToValue);
    expect(newFromValue).not.toBe('');
  });
});
