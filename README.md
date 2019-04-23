# myservices-visual-regression-tester
A NPM package that exports functions to create visual regression tests

__It's highly recommended to execute the visual regression tester within a Docker container to get reliable tests results across any operating system and machine.__

## Installation
* Be sure that your project is configured to be able to install npm packages from Porsche UI Artifactory instance
* run `npm install --save-dev @porscheui/visual-regression-tester` or `yarn add --dev @porscheui/visual-regression-tester`

## How to start

Check out the [Basic integration example](https://github.com/porscheui/porsche-visual-regression-tester/tree/master/examples/basic-integration) for an example how to get the visual regression tester up and running.

## API

### VisualRegressionTester
#### Constructor
The constructor expects 2 parameters:
* `browser: Browser`
* `options: VisualRegressionTestOptions` (_optional_)

Browser should be a [Puppeteer Browser instance](https://github.com/GoogleChrome/puppeteer/blob/v1.9.0/docs/api.md#class-browser). Check the basic integration example for [how to create a Puppeteer browser](https://github.com/porscheui/porsche-visual-regression-tester/blob/master/examples/basic-integration/vrt/example-test.spec.ts#L19).

#### test() Method
In the actual visual regression test you have to call the `test(snapshotId: string, scenario: Function, maskSelectors: string[] = [])`-method in your expect block, 
taken an unique name of the reference shot as **first parameter** (`snapshotId: string`). 
  
As **second parameter** (`scenario: Function`) within the scenario callback function you call the `goTo()` method with the extended URL (will be concatinated with the `baseURL`), as well as `click()`, `hover()`, `focus()` and `type()` if necessary and prepare the state to compare.  
`goTo()`, `click()`, `hover()`, `focus()` and `type()` method accept following optional parameters `networkIdleTimeout: number` and `maxInflightRequests: number` which means, — consider loading has finished when there are no more than `maxInflightRequests` network connections for at least `networkIdleTimeout` ms.

As a **third and optional parameter** (`maskSelectors: string[] = []`) you can pass a string array which includes css selectors for the elements that should be ignored in your visual regression test.

To make use of Puppeteers Page instance within the `scenario: Function` you call the `getPage()` method and apply any supported Puppeteer method like `click()`, `hover()` or `type()`.

### VisualRegressionTestOptions

   * `viewports` selects the viewports of your browser  
   * `fixturesDir` directory where the reference-shots will be saved  
   * `resultsDir` directory where the diffing- and the regression-shots will be saved  
   * `tolerance` gives the tolerance range for your visual regression diffs  
   * `baseUrl` the base URL of the page you would like to test  
   * `timeout` impacts the timeout limit of page load  
             
*Note*: All the VisualRegressionTestOptions are optional, those are the default options:
   ```
   viewports: [320, 480, 760, 1000, 1300, 1760]
   fixturesDir: 'vrt/fixtures'
   resultsDir: 'vrt/results'
   tolerance: 0
   baseUrl: 'http://localhost'
   timeout: 30000
   ```

## Notes:

* It might be necessary to increase the Jasmine timeout in order to get reliable test results.

* Add your `resultsDir` folder to `.gitignore` in order to not spam git history.

## What to do when tests are failing
* Switch to your `resultsDir` directory. Here you can find the belonging `diff` and `regression` images.
* Check if you would like to accept the changes
  * **If yes**: Replace the reference shot in the `fixturesDir` folder with the belonging one in the `resultsDir` folder and delete the images in the `resultsDir` directory afterwards manually.
  * **If no**: Recheck your code and run the tests again, when you think you fixed it.
  
## For developers
### Running tests
* run `npm run start-test-server` and keep it running
* in another terminal run `npm test`
