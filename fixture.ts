import { test as base } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { fonts, mockFont } from './mock-font';
import { addCoverage } from './coverage';
import { CustomOptions } from './types';

type ExtenedTest = {
  metricLog: unknown[][];
  sharedMetricLog: unknown[][];
} & CustomOptions;
const BLOCKED_HOSTS = [];
export let sharedMetricLog = [];

export const setupEnhancedContext = async (
  context: BrowserContext,
  coverageOptions: CustomOptions['coverageOptions'],
  use: (r: BrowserContext) => Promise<void>,
) => {
  if (coverageOptions.useIstanbulCoverage) {
    await addCoverage(context, use);
  } else {
    await use(context);
  }
};

export const setupEnhancedPage = async (page: Page, metricLog: unknown[][]) => {
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
  console.log('use page');
  return page;
};

export const test = base.extend<ExtenedTest>({
  coverageOptions: [{}, { option: true }],
  context: async ({ context, coverageOptions }, use) => {
    await setupEnhancedContext(context, coverageOptions, use);
  },
  metricLog: async ({}, use: (r: ExtenedTest['metricLog']) => Promise<void>) =>
    use([]),
  sharedMetricLog: async (
    {},
    use: (r: ExtenedTest['sharedMetricLog']) => Promise<void>,
  ) => use(sharedMetricLog),
  page: async ({ page, metricLog }, use) => {
    const enhancedPage = await setupEnhancedPage(page, metricLog);
    await use(enhancedPage);
  },
});

export const setupTestSerial = () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser, coverageOptions, sharedMetricLog }) => {
    const baseContext = await browser.newContext();
    await setupEnhancedContext(
      baseContext,
      coverageOptions,
      async (enhancedContext) => {
        context = enhancedContext;
        page = await context.newPage();
        page = await setupEnhancedPage(page, sharedMetricLog);
      },
    );
    await page.goto('/');
  });

  test.afterAll(async () => {
    sharedMetricLog = [];
    await page.close();
    await context.close();
  });

  return { getPage: () => page, getContext: () => context };
};
