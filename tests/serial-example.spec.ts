import { expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { setupTestSerial, test } from '../fixture';

test.describe.configure({ mode: 'serial' });
test.describe('Test serial', () => {
  let page: Page;
  const { getPage } = setupTestSerial();

  test('runs first', async () => {
    page = page || getPage();
    await expect(page.getByTestId('title')).toHaveText(
      'Добро пожаловать в мир Playwright!',
    );
  });

  test('runs second', async ({ sharedMetricLog }) => {
    await page.getByTestId('enter').click();
    await expect(sharedMetricLog).toEqual([['hello']]);
  });
});
