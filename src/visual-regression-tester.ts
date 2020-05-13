import * as Jimp from 'jimp/dist';
import * as del from 'del';
import * as fs from 'fs';
import { BoundingBox, Browser, ClickOptions, ElementHandle, LoadEvent, Page } from 'puppeteer';

export interface VisualRegressionTestOptions {
  viewports?: number[];
  deviceScaleFactor?: number;
  fixturesDir?: string;
  resultsDir?: string;
  tolerance?: number;
  baseUrl?: string;
  timeout?: number;
  mode?: "auto" | "square-auto";
  waitUntilMethod?: LoadEvent;
}

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
    waitUntilMethod: 'networkidle0'
  };
  private page: Page;

  constructor(private browser: Browser, options: VisualRegressionTestOptions = {}) {
    this.options = {
      ...this.options,
      ...options
    };
  }

  getPage(): Page {
    return this.page;
  }

  async goTo(url: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.goto(`${this.options.baseUrl}${url}`, {waitUntil: this.options.waitUntilMethod})
    ]);
  }

  async click(selector: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0, options?: Partial<ClickOptions>): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.click(selector, options)
    ]);
  }

  async focus(selector: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.focus(selector)
    ]);
  }

  async type(selector: string, input: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.type(selector, input)
    ]);
  }

  async hover(selector: string, networkIdleTimeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    await Promise.all([
      this.waitForNetworkIdle(networkIdleTimeout, maxInflightRequests),
      this.page.hover(selector)
    ]);
  }

  async test(snapshotId: string, scenario: Function, elementSelector: string = '', maskSelectors: string[] = []): Promise<boolean> {
    let error = false;

    for (const viewport of this.options.viewports) {
      const paths = {
        reference: `${this.options.fixturesDir}/${snapshotId}.${viewport}.png`,
        regression: `${this.options.resultsDir}/${snapshotId}.${viewport}.png`,
        diff: `${this.options.resultsDir}/${snapshotId}.${viewport}.diff.png`
      };

      this.page = await this.newPage(viewport);

      await this.cleanSnapshots([paths.regression, paths.diff]);

      await scenario();

      const height = await this.page.evaluate(() => document.body.clientHeight);
      await this.page.setViewport({width: viewport, height: height, deviceScaleFactor: this.options.deviceScaleFactor });

      if (fs.existsSync(paths.reference)) {
        const reference = await Jimp.read(paths.reference);
        const regression = await this.compareSnapshots(reference, elementSelector, maskSelectors);

        if (regression) {
          error = true;
          await regression.image.write(paths.regression);
          await regression.diff.write(paths.diff);
        }
      } else {
        const reference = await this.createSnapshot(elementSelector, maskSelectors);
        await reference.write(paths.reference);
      }

      await this.page.close();
    }

    return error;
  }

  public waitForNetworkIdle(timeout: number = 500, maxInflightRequests: number = 0): Promise<void> {
    const onRequestStarted = () => {
      ++inflight;
      if (inflight > maxInflightRequests) clearTimeout(timeoutId);
    };

    const onRequestFinished = () => {
      if (inflight === 0) return;
      --inflight;
      if (inflight === maxInflightRequests) timeoutId = setTimeout(onTimeoutDone, timeout);
    };

    const onTimeoutDone = () => {
      this.page.removeListener('request', onRequestStarted);
      this.page.removeListener('requestfinished', onRequestFinished);
      this.page.removeListener('requestfailed', onRequestFinished);
      fulfill();
    };

    let inflight = 0;
    let fulfill;
    let timeoutId = setTimeout(onTimeoutDone, timeout);

    this.page.on('request', onRequestStarted);
    this.page.on('requestfinished', onRequestFinished);
    this.page.on('requestfailed', onRequestFinished);

    return new Promise(x => fulfill = x);
  }

  private async newPage(viewport: number): Promise<Page> {
    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(this.options.timeout);
    await page.setViewport({width: viewport, height: this.options.mode === 'square-auto' ? viewport : 1});

    return page;
  }

  private async createSnapshot(elementSelector: string, maskSelectors: string[]): Promise<Jimp> {
    let buffer, image;

    if (elementSelector) {
      buffer = await (await this.page.$(elementSelector)).screenshot();
    } else {
      buffer = await this.page.screenshot({fullPage: true});
    }

    image = await Jimp.read(buffer);
    image = await this.maskSnapshot(image, elementSelector, maskSelectors);

    return image;
  }

  private async maskSnapshot(image: Jimp, elementSelector: string, maskSelectors: string[]): Promise<Jimp> {
    for (const maskSelector of maskSelectors) {
      const elements = await this.page.$$(`${elementSelector} ${maskSelector}`);

      for (const element of elements) {
        const boundingBox = await this.getBoundingBox(element);
        if (boundingBox !== null) {
          const {width, height, x, y} = boundingBox;
          const mask = await new Jimp(width, height, '#FF00FF');

          image = await image.composite(mask, x, y);
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
        y: boundingBox.y - extendOuterBounds
      };
    }

    return null;
  }

  private async compareSnapshots(reference: Jimp, elementSelector: string, maskSelectors: string[]): Promise<{ image: Jimp, diff: Jimp }> {
    const image = await this.createSnapshot(elementSelector, maskSelectors);
    const diff = await Jimp.diff(reference, image, this.options.tolerance);

    if (diff.percent === 0) {
      return null;
    }

    return {
      image: image,
      diff: diff.image
    };
  }

  private async cleanSnapshots(paths: string[]): Promise<void> {
    await del(paths);
  }
}
