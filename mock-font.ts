import { readFileSync } from 'fs';
import path from 'path';

import type { Route } from '@playwright/test';

type MockFont = {
  url: string;
  buffer: Buffer;
  contentType: string;
};

export const fonts: MockFont[] = [
  {
    url: `https://cdn.ru/media/fonts/inter/cyrillic.woff2`,
    buffer: readFileSync(
      path.resolve(__dirname, './page/assets/inter-font/cyrillic.woff2'),
    ),
    contentType: 'font/woff2',
  },
  {
    url: `https://cdn.ru/media/fonts/inter/latin.woff2`,
    buffer: readFileSync(
      path.resolve(__dirname, './page/assets/inter-font/latin.woff2'),
    ),
    contentType: 'font/woff2',
  },
];

export const mockFont = async (
  route: Route,
  { buffer, contentType }: Omit<MockFont, 'url'>,
) => {
  route.fulfill({
    status: 200,
    contentType,
    body: buffer,
  });
};
