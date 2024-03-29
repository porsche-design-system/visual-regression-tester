# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [Unreleased]

### [4.5.0] - 2023-03-23

#### Removed

- retry one time in case regression occurred

### [4.4.0] - 2023-03-23

#### Added

- retry one time in case regression occurred

#### Changed

- `test()` method will fail in case no fixture exists

### [4.3.2] - 2022-06-20

### [4.3.1] - 2022-06-20

#### Changed

- npm package is prepared for public release on [npmjs.org](https://npmjs.com)

### [4.3.0] - 2021-11-29

#### Added

- Extended `TestOptions` with `initialViewportHeight`

### [4.2.1] - 2021-10-21

#### Fixed

- Exception if result image is smaller than fixture image

### [4.2.0] - 2021-10-06

#### Changed

- Improved performance by switching from Jimp to sharp

### [4.1.0] - 2021-09-16

#### Changed

- Updated npm dependencies
- Output failed viewports
- Export `TestOptions` type

### [4.0.0] - 2021-06-03

#### Changed

- Updated npm dependencies
- Upgraded `puppeteer` to `10.0.0`

### [3.0.0] - 2020-07-09

#### Changed

- Made `puppeteer` a peerDependency

### [2.0.1] - 2020-06-09

#### Changed

- Updated npm dependencies

### [2.0.0] - 2020-06-08

#### Added

- Extended `TestOptions` with `regressionSuffix`

#### Changed

- Replaced `test()` function parameters with `TestOptions` object

### [1.0.1] - 2020-05-14

- Fix support for deviceScaleFactor

### [1.0.0] - 2020-05-14

- Initial release
