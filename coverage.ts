/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/**
 * This code to support istanbul coverage originally was provided by one of the Playwright developers:
 * https://github.com/mxschmitt/playwright-test-coverage/blob/main/e2e/baseFixtures.ts#L12
 */
import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import type { BrowserContext } from '@playwright/test';

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output');

function generateUUID(): string {
    return crypto.randomBytes(16).toString('hex');
}

export const addCoverage = async (
    context: BrowserContext,
    use: (r: BrowserContext) => Promise<void>,
) => {
    await context.addInitScript(() =>
        window.addEventListener(
            'beforeunload',
            (): Promise<string> =>
                (window as any).collectIstanbulCoverage(
                    // eslint-disable-next-line no-underscore-dangle
                    JSON.stringify((window as any).__coverage__),
                ),
        ),
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction('collectIstanbulCoverage', (coverageJSON: string) => {
        if (coverageJSON)
            fs.writeFileSync(
                path.join(istanbulCLIOutput, `playwright_coverage_${generateUUID()}.json`),
                coverageJSON,
            );
    });
    await use(context);
    for (const page of context.pages()) {
        // eslint-disable-next-line no-await-in-loop
        await page.evaluate(() =>
            // eslint-disable-next-line no-underscore-dangle
            (window as any).collectIstanbulCoverage(JSON.stringify((window as any).__coverage__)),
        );
    }
};
