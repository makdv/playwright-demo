import { test as base } from '@playwright/test';
import { fonts, mockFont } from './mock-font';

type ExtenedTest = {
  metricLog: unknown[][];
};
const BLOCKED_HOSTS = [];

export const test = base.extend<ExtenedTest>({
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
