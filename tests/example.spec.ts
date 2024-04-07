import { expect } from '@playwright/test';
import { test } from '../fixture';

test.describe('Test our page', () => {
  test('Shows correct titles', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('title')).toHaveText(
      'Добро пожаловать в мир Playwright!',
    );
    await page.getByTestId('enter').click();
    await expect(page.getByText('Мы вошли!')).toBeVisible();
  });
  test('should read from clipboard', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Копировать').click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );

    expect(clipboardText).toContain('Copied!');
  });
  test('should send metric on click', async ({ page, metricLog }) => {
    await page.goto('/');
    await page.getByTestId('enter').click();

    await expect(metricLog).toEqual([['hello']]);
  });
});
