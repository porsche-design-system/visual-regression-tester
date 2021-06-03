import { Browser, launch } from 'puppeteer';
import { VisualRegressionTester, VisualRegressionTestOptions } from '@porsche-design-system/visual-regression-tester';

describe('Example integration of visual regression tester', () => {
  let browser: Browser, visualRegressionTester: VisualRegressionTester;

  const testOptions: VisualRegressionTestOptions = {
    viewports: [320, 480, 760, 1000, 1300, 1760],
    fixturesDir: 'vrt/fixtures',
    resultsDir: 'vrt/results',
    tolerance: 0,
    baseUrl: 'http://localhost:61422',
  };

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    browser = await launch();
    visualRegressionTester = new VisualRegressionTester(browser, testOptions);
  });

  it('should show hello world without regression', async () => {
    expect(
      await visualRegressionTester.test('hello-world', async () => {
        await visualRegressionTester.goTo('/');
      })
    ).toBeFalsy();
  });

  afterAll(async () => {
    await browser.close();
  });
});
