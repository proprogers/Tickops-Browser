const path = require('path');
const { execFileSync } = require('child_process');
const { runInNewContext } = require('vm');
const { writeFileSync, copyFileSync, unlinkSync } = require('fs');
const electronLink = require('electron-link');
const modules = require('./modules-to-snapshot.json');

const baseDirPath = path.resolve(__dirname, '..');
const fileToSnapshotPath = path.join(baseDirPath, 'toSnapshot.js');
const cachePath = path.join(baseDirPath, 'cache');
const snapshotScriptPath = path.join(cachePath, 'linked.js');
const targetOs = process.argv[2] || process.platform;

let processedFiles = 0;

run().catch(e => console.error(e));

async function run() {
  createFileToSnapshot();

  const modulesPaths = [];

  console.log('Creating a linked script..');
  const { snapshotScript } = await electronLink({
    baseDirPath,
    mainPath: fileToSnapshotPath,
    cachePath,
    shouldExcludeModule: ({ requiredModulePath, requiringModulePath }) => {
      if (processedFiles > 0) process.stdout.write('\r');
      process.stdout.write(`Generating snapshot script at "${snapshotScriptPath}" (${++processedFiles})`);

      if (requiringModulePath === fileToSnapshotPath) {
        const pathParts = requiredModulePath.split('node_modules');
        pathParts.splice(0, 1);
        const relativePath = pathParts.join('node_modules');
        const relativePathParts = relativePath.split(path.sep);
        const moduleName = relativePathParts[1];
        modulesPaths.push([moduleName, './node_modules' + relativePathParts.join('/')]);
      }
      return requiredModulePath.endsWith(path.join('node_modules', 'follow-redirects', 'index.js'))
    }
  });

  writeFileSync(snapshotScriptPath, snapshotScript);
  if (modulesPaths.length) {
    createJsonFileOfModulesPaths(modulesPaths);
  }

  // Verify if we will be able to use this in `mksnapshot`
  runInNewContext(snapshotScript, undefined, { filename: snapshotScriptPath, displayErrors: true });

  const outputBlobPath = baseDirPath;
  console.log(`\nGenerating startup blob in "${outputBlobPath}"`);
  execFileSync(
    path.resolve(
      baseDirPath,
      'node_modules',
      '.bin',
      'mksnapshot' + (process.platform === 'win32' ? '.cmd' : '')
    ),
    [snapshotScriptPath, '--output_dir', outputBlobPath],
    { stdio: 'inherit' }
  );

  copySnapshotBinToElectron(outputBlobPath);
}

function createFileToSnapshot() {
  const str = modules.reduce((acc, curr) => acc + `require('${curr}');\n`, '');
  writeFileSync(fileToSnapshotPath, str);
}

function createJsonFileOfModulesPaths(modulesPathsObject) {
  const str = JSON.stringify(modulesPathsObject, null, 2);
  writeFileSync(path.join(__dirname, 'snapshotted-modules-paths.json'), str);
}

function copySnapshotBinToElectron(outputBlobPath) {
  const pathToElectron = path.resolve(
    baseDirPath,
    'node_modules',
    'electron',
    'dist',
    targetOs === 'darwin'
      ? 'Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources'
      : ''
  );

  const snapshotName = 'v8_context_snapshot.arm64.bin';
  const snapshotPath = path.join(outputBlobPath, snapshotName);
  const snapshotBlobPath = path.join(outputBlobPath, 'snapshot_blob.bin');

  copyFileSync(
    snapshotPath,
    path.join(pathToElectron, snapshotName)
  );

  unlinkSync(snapshotPath);
  unlinkSync(snapshotBlobPath);
  unlinkSync(fileToSnapshotPath);
}
