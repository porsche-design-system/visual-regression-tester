# Porsche Design System - Visual Regression Tester

Export functions to create visual regression tests.

## Using the Visual Regression Tester

### Installation

Run the following command using [npm](https://www.npmjs.com):

```bash
npm install @porsche-design-system/visual-regression-tester --save-dev
```

If you prefer [Yarn](https://yarnpkg.com), use the following command instead:

```bash
yarn add @porsche-design-system/visual-regression-tester --dev
```

### Usage

__It's highly recommended executing the visual regression tester within a Docker container to get reliable tests
results across any operating system and machine.__

Check out the [Basic integration example](https://github.com/porsche-design-system/porsche-visual-regression-tester/tree/master/examples/basic-integration) for an example how to get the Visual Regression Tester up and running.

### API

#### Constructor

The constructor expects two parameters:

* `browser: Browser`
* `options: VisualRegressionTestOptions` (_optional_)

Browser should be a [Puppeteer Browser instance](https://github.com/GoogleChrome/puppeteer/blob/v1.9.0/docs/api.md#class-browser).
Check the basic integration example for [how to create a Puppeteer browser](https://github.com/porsche-design-system/porsche-visual-regression-tester/blob/master/examples/basic-integration/vrt/example-test.spec.ts#L19).

#### test() Method

In the actual visual regression test you have to call
the `test(snapshotId: string, scenario: Function, options: TestOptions = {elementSelector: '', maskSelectors: [], regressionSuffix: ''})`
-method in your expect block, taken a unique name of the reference shot as **first parameter** (`snapshotId: string`).

As **second parameter** (`scenario: Function`) within the scenario callback function you call the `goTo()` method with
the extended URL (will be concatinated with the `baseURL`), as well as `click()`, `hover()`, `focus()` and `type()` if
necessary and prepare the state to compare.
`goTo()`, `click()`, `hover()`, `focus()` and `type()` method accept following optional
parameters `networkIdleTimeout: number` and `maxInflightRequests: number` which means, — consider loading has finished
when there are no more than `maxInflightRequests` network connections for at least `networkIdleTimeout` ms.

As a **third and optional parameter** (`options: TestOptions`) you can pass following options:

* `elementSelector: string = ''` - pass a css selector for the element (selector is allowed to match exactly one element
  only) that should be included in your visual regression test.
* `maskSelectors: string[] = []` - pass a string array which includes css selectors for the elements that should be
  ignored in your visual regression test. If `maskSelectors` is used in combination with `elementSelector` then those
  two selectors are concatenated automatically to match elements nested in `elementSelector`.
* `regressionSuffix: string = ''` - pass a string to add a suffix in regression filenames

To make use of Puppeteers Page instance within the `scenario: Function` you call the `getPage()` method and apply any
supported Puppeteer method like `click()`, `hover()` or `type()`.

#### VisualRegressionTestOptions

* `viewports` selects the viewports of your browser
* `deviceScaleFactor` specify device scale factor (can be thought of as dpr)
* `fixturesDir` directory where the reference-shots will be saved
* `resultsDir` directory where the diffing- and the regression-shots will be saved
* `tolerance` gives the tolerance range for your visual regression diffs
* `baseUrl` the base URL of the page you would like to test
* `timeout` impacts the timeout limit of page load
* `mode` defines the method with which the height for snapshot is determined

*Note*: All the VisualRegressionTestOptions are optional, those are the default options:

   ```
   viewports: [320, 480, 760, 1000, 1300, 1760]
   deviceScaleFactor: 1
   fixturesDir: 'vrt/fixtures'
   resultsDir: 'vrt/results'
   tolerance: 0
   baseUrl: 'http://localhost'
   timeout: 30000
   mode: 'auto'
   ```

## Notes:

* Add your `resultsDir` folder to `.gitignore` in order to not spam git history.

## What to do when tests are failing

* Switch to your `resultsDir` directory. Here you can find the belonging `diff` and `regression` images.
* Check if you would like to accept the changes
  * **If yes**: Replace the reference shot in the `fixturesDir` folder with the belonging one in the `resultsDir` folder
    and delete the images in the `resultsDir` directory afterwards manually.
  * **If no**: Recheck your code and run the tests again, when you think you fixed it.

## License

- MIT
