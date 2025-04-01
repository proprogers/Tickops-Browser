const { spawn, execFile } = require('child_process');

const startTime = Date.now();

const proc = execFile('dist\\win-unpacked\\TickOps Browser.exe');
// const proc = spawn('npm.cmd', ['run', 'start']);

/**
 * @example
 * ipcMain.on('startup', (event, till, timestamp) => console.log('timestamp', till, timestamp));
 */

proc.stdout.on('data', (data) => {
  const string = data.toString();
  if (string.startsWith('timestamp')) {
    const till = string.split(' ')[1];
    const timestamp = string.split(' ')[2];
    console.log(`${timestamp - startTime} ms : Start - ${till}`);
    console.log('---------------------');
  } else if (string.startsWith('mode')) {
    console.log(`Mode: ${string.split(' ')[1]}`);
  }
  // else console.log(string);
});
