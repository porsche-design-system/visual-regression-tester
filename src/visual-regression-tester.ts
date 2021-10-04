import * as Jimp from 'jimp/dist';
import * as fs from 'fs';
import { BoundingBox, Browser, ClickOptions, ElementHandle, Page, PuppeteerLifeCycleEvent } from 'puppeteer';

export type VisualRegressionTestOptions = {
  viewports?: number[];
  deviceScaleFactor?: number;
  fixturesDir?: string;
  resultsDir?: string;
  tolerance?: number;
  baseUrl?: string;
  timeout?: number;
  mode?: 'auto' | 'square-auto';
  waitUntilMethod?: PuppeteerLifeCycleEvent;
};

export type TestOptions = {
  elementSelector?: string;
  maskSelectors?: string[];
  regressionSuffix?: string;
};

export class VisualRegressionTester {
  private options: VisualRegressionTestOptions = {
    viewports: [320, 480, 760, 1000, 1300, 1760],
    deviceScaleFactor: 1,
    fixturesDir: 'vrt/fixtures',
    resultsDir: 'vrt/results',
    tolerance: 0,
    baseUrl: 'http://localhost',
    timeout: 30000,
    mode: 'auto',
    waitUntilMethod: 'networkidle0',
  };
  private page: Page;

  constructor(private browser: Browser, options: VisualRegressionTestOptions = {}) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  getPage(): Page {
    return this.page;
  }

  async goTo(url: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.goto(`${this.options.baseUrl}${url}`, { waitUntil: this.options.waitUntilMethod }),
    ]);
  }

  async click(
    selector: string,
    networkIdleTimeout: number = 500,
    maxInflightRequests: number = 0,
    options?: Partial<ClickOptions>
  ): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.click(selector, options),
    ]);
  }

  async focus(selector: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests), this.page.focus(selector)]);
  }

  async type(
    selector: string,
    input: string,
    networkIdleTimeout: number = 500,
    maxInflightRequests: number = 0
  ): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.type(selector, input),
    ]);
  }

  async hover(selector: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests), this.page.hover(selector)]);
  }

  async test(snapshotId: string, scenario: Function, options?: TestOptions): Promise<boolean> {
    const opts: TestOptions = {
      elementSelector: '',
      maskSelectors: [],
      regressionSuffix: '',
      ...options,
    };

    const errors: number[] = [];

    for (const viewport of this.options.viewports) {
      const { regressionSuffix } = opts;
      const { fixturesDir, resultsDir } = this.options;
      const suffix = regressionSuffix ? '.' + regressionSuffix : '';

      const paths = {
        reference: `${fixturesDir}/${snapshotId}.${viewport}.png`,
        regression: `${resultsDir}/${snapshotId}${suffix}.${viewport}.png`,
        diff: `${resultsDir}/${snapshotId}${suffix}.${viewport}.diff.png`,
      };

      this.page = await this.newPage(viewport);

      this.cleanSnapshots([paths.regression, paths.diff]);

      await scenario();

      const height = await this.page.evaluate(() => document.body.clientHeight);
      await this.page.setViewport({
        width: viewport,
        height: height,
        deviceScaleFactor: this.options.deviceScaleFactor,
      });

      if (fs.existsSync(paths.reference)) {
        const reference = await Jimp.read(paths.reference);
        const regression = await this.compareSnapshots(reference, opts.elementSelector, opts.maskSelectors);

        if (regression) {
          errors.push(viewport);
          regression.image.write(paths.regression);
          regression.diff.write(paths.diff);
        }
      } else {
        const reference = await this.createSnapshot(opts.elementSelector, opts.maskSelectors);
        reference.write(paths.reference);
      }

      await this.page.close();
    }

    if (this.options.viewports.length > 1 && errors.length) {
      console.log('Failed viewports:', errors.join(', '));
    }

    return errors.length > 0;
  }

  public waitForNetworkIdle(timeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    const onRequestStarted = () => {
      ++inflight;
      if (inflight > maxInflightRequests) {
        clearTimeout(timeoutId);
      }
    };

    const onRequestFinished = () => {
      if (inflight === 0) {
        return;
      }
      --inflight;
      if (inflight === maxInflightRequests) {
        timeoutId = setTimeout(onTimeoutDone, timeout);
      }
    };

    const onTimeoutDone = () => {
      this.page.off('request', onRequestStarted);
      this.page.off('requestfinished', onRequestFinished);
      this.page.off('requestfailed', onRequestFinished);
      fulfill();
    };

    let inflight = 0;
    let fulfill: (value?: void | PromiseLike<void>) => void;
    let timeoutId = setTimeout(onTimeoutDone, timeout);

    this.page.on('request', onRequestStarted);
    this.page.on('requestfinished', onRequestFinished);
    this.page.on('requestfailed', onRequestFinished);

    return new Promise((x) => (fulfill = x));
  }

  private async newPage(viewport: number): Promise<Page> {
    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(this.options.timeout);
    await page.setViewport({
      width: viewport,
      height: this.options.mode === 'square-auto' ? viewport : 1,
      deviceScaleFactor: this.options.deviceScaleFactor,
    });

    return page;
  }

  private async createSnapshot(elementSelector: string, maskSelectors: string[]): Promise<Jimp> {
    const buffer = await (elementSelector
      ? ((
          await this.page.$(elementSelector)
        ).screenshot({
          captureBeyondViewport: false,
        }) as unknown as Promise<string>)
      : (this.page.screenshot({
          fullPage: true,
          captureBeyondViewport: false,
        }) as unknown as Promise<string>));

    const rawImage = await Jimp.read(buffer);

    return maskSelectors.length ? await this.maskSnapshot(rawImage, elementSelector, maskSelectors) : rawImage;
  }

  private async maskSnapshot(image: Jimp, elementSelector: string, maskSelectors: string[]): Promise<Jimp> {
    for (const maskSelector of maskSelectors) {
      const elements = await this.page.$$(`${elementSelector} ${maskSelector}`);

      for (const element of elements) {
        const boundingBox = await this.getBoundingBox(element);
        if (boundingBox !== null) {
          const { width, height, x, y } = boundingBox;
          const mask = new Jimp(width, height, '#FF00FF');

          image = image.composite(mask, x, y);
        }
      }
    }

    return image;
  }

  private async getBoundingBox(element: ElementHandle, extendOuterBounds: number = 1): Promise<BoundingBox> {
    const boundingBox = await element.boundingBox();

    if (boundingBox !== null) {
      return {
        width: boundingBox.width + extendOuterBounds * 2,
        height: boundingBox.height + extendOuterBounds * 2,
        x: boundingBox.x - extendOuterBounds,
        y: boundingBox.y - extendOuterBounds,
      };
    }

    return null;
  }

  private async compareSnapshots(
    reference: Jimp,
    elementSelector: string,
    maskSelectors: string[]
  ): Promise<{ image: Jimp; diff: Jimp }> {
    const image = await this.createSnapshot(elementSelector, maskSelectors);
    const diff = Jimp.diff(reference, image, this.options.tolerance);

    return diff.percent === 0
      ? null
      : {
          image: image,
          diff: diff.image,
        };
  }

  private cleanSnapshots(paths: string[]): void {
    paths.forEach(fs.unlinkSync);
  }
}
