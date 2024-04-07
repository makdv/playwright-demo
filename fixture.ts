import type { PlaywrightTestOptions } from '@playwright/test';
import { test as base } from '@playwright/test';

type ExtenedTest = {
  metricLog: unknown[][];
};

export const test = base.extend<ExtenedTest>({
  metricLog: async ({}, use: (r: ExtenedTest['metricLog']) => Promise<void>) =>
    use([]),
  page: async ({ page, metricLog }, use) => {
    await page.exposeFunction('metric', (...args: unknown[]) => {
      metricLog.push(args);
    });
    await use(page);
  },
});
