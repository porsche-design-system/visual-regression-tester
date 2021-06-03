import { Browser, launch } from 'puppeteer';
import { VisualRegressionTester, VisualRegressionTestOptions } from '../../src/visual-regression-tester';
import { SpecReporter } from 'jasmine-spec-reporter';

let browser: Browser;
let visualRegressionTester: VisualRegressionTester;
let visualRegressionRetinaTester: VisualRegressionTester;

const testOptions: VisualRegressionTestOptions = {
  viewports: [320, 760],
  fixturesDir: 'tests/fixtures',
  resultsDir: 'tests/results',
  tolerance: 0,
  baseUrl: 'http://localhost:61423',
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter() as jasmine.CustomReporter);

beforeAll(async () => {
  browser = await launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process',
      '--disable-web-security',
    ],
  });
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

export const getVisualRegressionTester = async (): Promise<VisualRegressionTester> => {
  if (!visualRegressionTester) {
    visualRegressionTester = new VisualRegressionTester(browser, testOptions);
  }

  return visualRegressionTester;
};

export const getVisualRegressionRetinaTester = async (): Promise<VisualRegressionTester> => {
  if (!visualRegressionRetinaTester) {
    visualRegressionRetinaTester = new VisualRegressionTester(browser, {
      ...testOptions,
      viewports: [320, 350],
      deviceScaleFactor: 2,
    });
  }

  return visualRegressionRetinaTester;
};
