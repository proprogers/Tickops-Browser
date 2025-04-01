const { BrowserWindow } = require('electron');
const url = require('url');

class WindowLoader {
  constructor({ pathname, additional = {}, webPreferences = {} }) {
    if (!pathname) throw new Error(`'pathname' is required`);
    let window = new BrowserWindow({
      ...additional,
      frame: false,
      movable: true,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        ...webPreferences,
        webviewTag: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nodeIntegrationInSubFrames: true,
        contextIsolation: false,
        plugins: true,
        backgroundThrottling: false,
        nativeWindowOpen : true
      }
    });

    const indexPath = url.format({
      protocol: 'file:',
      pathname,
      slashes: true
    });

    window.loadURL(indexPath);
    
    window.once('closed', () => window = null);

    return window;
  }
}

module.exports = WindowLoader;
