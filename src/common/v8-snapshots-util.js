/* global snapshotResult, window, document */
const modulePaths = require('../../v8-snapshot-tools/snapshotted-modules-paths.json');
const modulesPathsMap = new Map(modulePaths);

run();

function run() {
  if (typeof snapshotResult === 'undefined') return;
  console.log('Snapshot is available!');

  const path = require('path');
  const Module = require('module');
  const { isRenderer } = require('./utils');

  const entryPointDirPath = path.resolve('.');

  Module.prototype.require = function (module) {
    let relativeFilePath = modulesPathsMap.get(module);
    if (!relativeFilePath) {
      const absoluteFilePath = Module._resolveFilename(module, this, false);
      relativeFilePath = path.relative(entryPointDirPath, absoluteFilePath);
      if (!relativeFilePath.startsWith('./')) relativeFilePath = `./${relativeFilePath}`;
      if (process.platform === 'win32') relativeFilePath = relativeFilePath.replace(/\\/g, '/');
      relativeFilePath = relativeFilePath.replace('/resources/app.asar/', '/');
      modulesPathsMap.set(module, relativeFilePath);
    }
    let cachedModule = snapshotResult.customRequire.cache[relativeFilePath];

    if (!cachedModule) {
      cachedModule = { exports: Module._load(module, this, false) };
      snapshotResult.customRequire.cache[relativeFilePath] = cachedModule;
    // } else {
      // console.log(module, relativeFilePath);
    }
    return cachedModule.exports;
  };

  const isRen = isRenderer();
  snapshotResult.setGlobals(
    global,
    process,
    isRen ? window : global,
    isRen ? document : {},
    console,
    global.require
  );
}
