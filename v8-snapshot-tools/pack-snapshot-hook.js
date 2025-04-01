exports.default = () => {
  const path = require('path');
  const { copyFileSync, existsSync } = require('fs');

  const isMacOS = process.platform === 'darwin';

  const pathToElectron = path.resolve(
    '.',
    'node_modules',
    'electron',
    'dist',
    isMacOS
      ? 'Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources'
      : ''
  );
  const snapshotName = 'v8_context_snapshot.arm64.bin';
  const pathToBin = path.join('.', snapshotName);

  copyFileSync(
    existsSync(pathToBin) ? pathToBin : path.join(pathToElectron, snapshotName),
    isMacOS
      ? path.join('.', 'dist', 'mac', 'TickOps Beta Browser.app', '/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources', snapshotName)
      : path.join('.', 'dist', 'win-unpacked', snapshotName)
  );
}
