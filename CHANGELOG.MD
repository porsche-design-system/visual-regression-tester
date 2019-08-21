# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2019-08-21
- Add element selector to test method which gives the possibility to take and compare a screenshot of a specific element on the page or the whole page.

#### BREAKING CHANGE:
Interface for test() method has changed:  
**old**: `test(snapshotId: string, scenario: Function, maskSelectors?: string[]): Promise<boolean>` 
**new**: `test(snapshotId: string, scenario: Function, elementSelector?: string, maskSelectors?: string[]): Promise<boolean>`

## [1.1.1] - 2019-04-23
- Add timeout parameter to configuration object 

## [1.1.0] - 2019-02-20
- Add type() method 
- Make waitForNetworkIdle() a public method

## [1.0.0] - 2019-01-15
- First stable version of visual-regression-tester
