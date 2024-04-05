import { defineConfig, devices } from '@playwright/test';

const mobileSpecs = /.*mobile.spec.ts$/;

const projectMobile = {
  testMatch: mobileSpecs,
  use: {
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
  },
};
const projectDesktop = {
  testIgnore: mobileSpecs,
  use: { ...devices['Desktop Chrome'], channel: 'chrome' },
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-id',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      // Все тесты под мобилку; проект должен запускаться на CI
      name: 'mobile:ci',
      ...projectMobile,
    },
    {
      // Все тесты под десктоп; проект должен запускаться на CI
      name: 'desktop:ci',
      ...projectDesktop,
    },
    {
      // Все тесты под десктоп, у которых в названии тэг @snapshot;
      // проект должен запускаться локально
      name: 'desktop:snapshots',
      testIgnore: /.*mobile.spec.ts/,
      grep: /@snapshot/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Все тесты под мобилку, у которых в названии тэг @snapshot;
      // проект должен запускаться локально
      name: 'mobile:snapshots',
      testMatch: projectMobile.testMatch,
      grep: /@snapshot/,
      use: {
        viewport: projectMobile.use.viewport,
        userAgent: projectMobile.use.userAgent,
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
