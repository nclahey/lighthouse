/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const browserify = require('browserify');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const bundleOutFile = `${distDir}/firehouse-bundle.js`;
const firehouseFilename = './lighthouse-cli/test/smokehouse/firehouse.js';
const Smokes = require('../lighthouse-cli/test/smokehouse/smoke-test-dfns.js');

let bundle = browserify(firehouseFilename, {standalone: 'Lighthouse.Firehouse'});

/**
 * @param {string} absPath
 */
function relativeToProjectRoot(absPath) {
  return './' + path.relative(path.dirname(__dirname), absPath);
}

/**
 * @param {string} smokeResourcePath
 */
function stubSmokeResource(smokeResourcePath) {
  const modulePath = relativeToProjectRoot(Smokes.resolveLocalOrProjectRoot(smokeResourcePath));
  bundle = bundle.require(modulePath, {expose: './smokehouse/' + smokeResourcePath});
}

for (const smokeTestDfn of Smokes.SMOKE_TEST_DFNS) {
  Smokes.resolveLocalOrProjectRoot(smokeTestDfn.config);
  stubSmokeResource(smokeTestDfn.config);
  stubSmokeResource(smokeTestDfn.expectations);
}

bundle
  .bundle((err, src) => {
    if (err) throw err;
    fs.writeFileSync(bundleOutFile, src.toString());
  });
