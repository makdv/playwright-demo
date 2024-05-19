import { test as base } from '@playwright/test';
import { fonts, mockFont } from './mock-font';
import { addCoverage } from './coverage';
import { CustomOptions } from './types';

type ExtenedTest = {
  metricLog: unknown[][];
} & CustomOptions;
const BLOCKED_HOSTS = [];

export const test = base.extend<ExtenedTest>({
  coverageOptions: [{}, { option: true }],
  context: async ({ context, coverageOptions }, use) => {
    if (coverageOptions.useIstanbulCoverage) {
      await addCoverage(context, use);
    } else {
      await use(context);
    }
  },
  metricLog: async ({}, use: (r: ExtenedTest['metricLog']) => Promise<void>) =>
    use([]),
  page: async ({ page, metricLog }, use) => {
    await page.exposeFunction('metric', (...args: unknown[]) => {
      metricLog.push(args);
    });
    await page.route('**', (route, request) => {
      const url = request.url();
      const fontData = fonts.find((font) => url.includes(font.url));

      if (fontData) {
        return mockFont(route, {
          buffer: fontData.buffer,
          contentType: fontData.contentType,
        });
      }
      if (BLOCKED_HOSTS.some((domain) => url.includes(domain))) {
        return route.abort();
      }

      return route.continue();
    });
    await use(page);
  },
});
