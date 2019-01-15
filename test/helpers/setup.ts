import 'jasmine';
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { VisualRegressionTester, VisualRegressionTestOptions } from '../../src/visual-regression-tester';

let browser: Browser;
let visualRegressionTester: VisualRegressionTester;

const testOptions: VisualRegressionTestOptions = {
  viewports: [320, 480, 760, 1000, 1300, 1760],
  fixturesDir: 'test/fixtures',
  resultsDir: 'test/results',
  tolerance: 0,
  baseUrl: 'http://localhost:61423'
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

export async function getVisualRegressionTester(): Promise<VisualRegressionTester> {
  if (!visualRegressionTester) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    visualRegressionTester = new VisualRegressionTester(browser, testOptions);
  }

  return visualRegressionTester;
}
