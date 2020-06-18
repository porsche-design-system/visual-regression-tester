import 'jasmine';
import {VisualRegressionTester} from '../../src/visual-regression-tester';
import {getVisualRegressionTester, getVisualRegressionRetinaTester} from '../helpers/setup';

describe('Visual-Regression-Test Tester', () => {
  let visualRegressionTester: VisualRegressionTester;

  beforeAll(async () => {
    visualRegressionTester = await getVisualRegressionTester();
  });

  it('should have no visual regression for test page', async () => {
    expect(await visualRegressionTester.test('test-page-unmasked-original', async () => {
      await visualRegressionTester.goTo('/test-page-original.html');
    })).toBeFalsy();
  });

  it('should have visual regression when compared with edited test page', async () => {
    expect(await visualRegressionTester.test('test-page-unmasked-edited', async () => {
      await visualRegressionTester.goTo('/test-page-edited.html');
    })).toBeTruthy();
  });

  it('should have no visual regression when compared with masked test page', async () => {

    expect(await visualRegressionTester.test('test-page-masked-original', async () => {
      await visualRegressionTester.goTo('/test-page-original.html');
    }, {maskSelectors: ['.title']})).toBeFalsy();

    expect(await visualRegressionTester.test('test-page-masked-edited', async () => {
      await visualRegressionTester.goTo('/test-page-edited.html');
    }, {maskSelectors: ['.title']})).toBeFalsy();
  });

  it('should have no visual regression for content within scrollable area and mask deeper nested elements', async () => {
    expect(await visualRegressionTester.test('test-page-with-scroll-area', async () => {
      await visualRegressionTester.goTo('/test-page-with-scroll-area.html');
    }, {elementSelector: '.scrollable > .content', maskSelectors: ['.mask']})).toBeFalsy();
  });

  it('should mask elements with an extended mask to solve issues with sub pixel rendering', async () => {
    expect(await visualRegressionTester.test('test-page-extend-mask-bounding', async () => {
      await visualRegressionTester.goTo('/test-page-extend-mask-bounding.html');
    }, {elementSelector: '', maskSelectors: ['.mask']})).toBeFalsy();
  });

  it('should ignore mask selectors that are invisible without size definition', async () => {
    expect(await visualRegressionTester.test('test-page-ignores-invisible-mask-selectors', async () => {
      await visualRegressionTester.goTo('/test-page-ignores-invisible-mask-selectors.html');
    }, {elementSelector: '', maskSelectors: ['.mask']})).toBeFalsy();
  });

  it('should properly overlays with fixed position', async () => {
    expect(await visualRegressionTester.test('test-page-with-fixed-positioning', async () => {
      await visualRegressionTester.goTo('/test-page-with-fixed-positioning.html');
    }, {elementSelector: '', maskSelectors: ['.modal']})).toBeFalsy();
  });

  describe('interaction', () => {

    it('should wait for page interaction "click" before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-click', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction.html');
        await visualRegressionTester.click('button');
      })).toBeFalsy();
    });

    it('should wait for page interaction "hover" before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-hover', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction.html');
        await visualRegressionTester.hover('button');
      })).toBeFalsy();
    });

    it('should wait for page interaction "focus" before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-focus', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction.html');
        await visualRegressionTester.focus('button');
      })).toBeFalsy();
    });

    it('should wait for page interaction "type" before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-type', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction.html');
        await visualRegressionTester.type('input', 'car');
      })).toBeFalsy();
    });
  });

  describe('network idle', () => {

    it('should wait for no more than 0 network connections for at least 3 seconds', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-zero-network-connections', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-zero-network-connections.html', 3000);
      })).toBeFalsy();
    });

    it('should wait for no more than 0 network connections for at least 0.5 seconds and ignore possibly delayed network connections (e.g. polling every 2 seconds)', async () => {
      expect(await visualRegressionTester.test('/test-page-waits-for-zero-network-connections-and-ignores-delayed-ones', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-zero-network-connections.html', 500);
      })).toBeFalsy();
    });

    it('should wait for page interaction "click" and network requests (polling) before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-and-network-requests-click', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction-and-network-requests.html');
        await visualRegressionTester.click('button', 2000);
      })).toBeFalsy();
    });

    it('should wait for page interaction "hover" and network requests (polling) before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-and-network-requests-hover', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction-and-network-requests.html');
        await visualRegressionTester.hover('button', 2000);
        await visualRegressionTester.getPage().waitFor(100);
      })).toBeFalsy();
    });

    it('should wait for page interaction "focus" and network requests (polling) before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-and-network-requests-focus', async () => {
        await visualRegressionTester.goTo('/test-page-waits-for-user-interaction-and-network-requests.html');
        await visualRegressionTester.focus('button', 2000);
      })).toBeFalsy();
    });

    it('should wait for page interaction "type" and network requests (polling) before comparing snapshots', async () => {
      expect(await visualRegressionTester.test('test-page-waits-for-user-interaction-and-network-requests-type',
        async () => {
          await visualRegressionTester.goTo('/test-page-waits-for-user-interaction-and-network-requests.html');
          await visualRegressionTester.type('input', 'c', 2000);
        })).toBeFalsy();
    });
  });
});


describe('Visual-Regression-Test Retina Tester', () => {
  let vrt: VisualRegressionTester;

  beforeAll(async () => {
    vrt = await getVisualRegressionRetinaTester();
  });

  it('should have no visual regression for test page', async () => {
    expect(await vrt.test('test-page-unmasked-original-retina', async () => {
      await vrt.goTo('/test-page-original.html');
    })).toBeFalsy();
  });
});
