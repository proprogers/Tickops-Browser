const { isDev, sentry: { dsn } } = require('@/../config');
const { PRELOAD_PATH } = require('../common/consts');
const { ipcMain, BrowserWindow, app } = require('electron');

const storage = new Map();
const tabs = new Map();
let tabCounter = 1;
const windows = new Map();
let windowCounter = 1;


function initSDK(data) {
  if (isDev || !process.isMainFrame) {
    return;
  }

  window.sdk_version = '0.4.2';

  window.sdk_send_message = (payload) => ipcRenderer.sendToHost(messages.SDK_MESSAGE_CONTROLLER, payload);
  window.sdk_page_message = (payload) => ipcRenderer.sendToHost(messages.SDK_PAGE_MESSAGE, payload);
  window.sdk_page_requests = (payload) => ipcRenderer.sendToHost(messages.SDK_PAGE_REQUESTS, payload);
  window.sdk_page_frames = (payload) => ipcRenderer.sendToHost(messages.SDK_PAGE_HOSTS, payload);
  window.sdk_temp = (payload) => ipcRenderer.sendToHost(messages.SHOW_TEMP_DATA, payload);
  window.showNotification = (payload) => ipcRenderer.sendToHost(messages.SHOW_NOTIFICATION, payload);

  window.getUsage = API.getUsage;

  window.loadSession = (partition) => {
    ipcRenderer.sendToHost(messages.LOAD_SESSION, partition);
  };

  window.tickops = {
    storage: {
      get: (keys, callback) => ipcRenderer.invoke('tickops-storage-get', keys).then(callback),
      set: (items, callback) => ipcRenderer.invoke('tickops-storage-set', items).then(callback),
      remove: (keys, callback) => ipcRenderer.invoke('tickops-storage-remove', keys).then(callback),
      clear: (callback) => ipcRenderer.invoke('tickops-storage-clear').then(callback),
      has: (key, callback) => ipcRenderer.invoke('tickops-storage-has', key).then(callback),
      getAll: (callback) => ipcRenderer.invoke('tickops-storage-getAll').then(callback),
      size: (callback) => ipcRenderer.invoke('tickops-storage-size').then(callback),
      keys: (callback) => ipcRenderer.invoke('tickops-storage-listkeys').then(callback),
      values: (callback) => ipcRenderer.invoke('tickops-storage-listvalues').then(callback),
      entries: (callback) => ipcRenderer.invoke('tickops-storage-listentries').then(callback),
      renameKey: (oldKey, newKey, callback) => ipcRenderer.invoke('tickops-storage-renameKey', oldKey, newKey).then(callback),
      exportData: (callback) => ipcRenderer.invoke('tickops-storage-export').then(callback),
      importData: (data, callback) => ipcRenderer.invoke('tickops-storage-import', data).then(callback)
    },
    tabs: {
      create: (options, callback) => ipcRenderer.invoke('tickops-tabs-create', options).then(callback),
      query: (queryInfo, callback) => ipcRenderer.invoke('tickops-tabs-query', queryInfo).then(callback),
      update: (tabId, updateProperties, callback) => ipcRenderer.invoke('tickops-tabs-update', tabId, updateProperties).then(callback),
      remove: (tabId, callback) => ipcRenderer.invoke('tickops-tabs-remove', tabId).then(callback),
      reload: (tabId, callback) => ipcRenderer.invoke('tickops-tabs-reload', tabId).then(callback),
      getInfo: (tabId, callback) => ipcRenderer.invoke('tickops-tabs-getInfo', tabId).then(callback),
      duplicate: (tabId, callback) => ipcRenderer.invoke('tickops-tabs-duplicate', tabId).then(callback),
      activate: (tabId, callback) => ipcRenderer.invoke('tickops-tabs-activate', tabId).then(callback),
      sendMessage: (tabId, message, callback) => ipcRenderer.invoke('tickops-tabs-sendMessage', tabId, message).then(callback),
      list: (callback) => ipcRenderer.invoke('tickops-tabs-list').then(callback)
    },
    windows: {
      create: (createData, callback) => ipcRenderer.invoke('tickops-windows-create', createData).then(callback),
      remove: (windowId, callback) => ipcRenderer.invoke('tickops-windows-remove', windowId).then(callback),
      getAll: (callback) => ipcRenderer.invoke('tickops-windows-getAll').then(callback),
      focus: (windowId, callback) => ipcRenderer.invoke('tickops-windows-focus', windowId).then(callback),
      minimize: (windowId, callback) => ipcRenderer.invoke('tickops-windows-minimize', windowId).then(callback),
      maximize: (windowId, callback) => ipcRenderer.invoke('tickops-windows-maximize', windowId).then(callback),
      restore: (windowId, callback) => ipcRenderer.invoke('tickops-windows-restore', windowId).then(callback)
    },
    runtime: {
      sendMessage: (message, callback) => ipcRenderer.invoke('tickops-runtime-sendMessage', message).then(callback),
      getURL: (path) => ipcRenderer.invoke('tickops-runtime-getURL', path),
      onMessageAddListener: (callback) => {
        ipcRenderer.on('tickops-runtime-onMessage', (event, data) => {
          callback(data);
        });
      },
      getAppVersion: (callback) => ipcRenderer.invoke('tickops-runtime-getAppVersion').then(callback),
      getPlatform: (callback) => ipcRenderer.invoke('tickops-runtime-getPlatform').then(callback)
    }
  };
}


ipcMain.handle('tickops-storage-get', async (event, keys) => {
  const result = {};
  keys.forEach((key) => {
    result[key] = storage.get(key) || null;
  });
  return result;
});

ipcMain.handle('tickops-storage-set', async (event, items) => {
  for (const [key, value] of Object.entries(items)) {
    storage.set(key, value);
  }
  return true;
});

ipcMain.handle('tickops-storage-remove', async (event, keys) => {
  keys.forEach((key) => {
    storage.delete(key);
  });
  return true;
});

ipcMain.handle('tickops-storage-clear', async (event) => {
  storage.clear();
  return true;
});

ipcMain.handle('tickops-storage-has', async (event, key) => {
  return storage.has(key);
});

ipcMain.handle('tickops-storage-getAll', async (event) => {
  return Object.fromEntries(storage.entries());
});

ipcMain.handle('tickops-storage-size', async (event) => {
  return storage.size;
});

ipcMain.handle('tickops-storage-listkeys', async (event) => {
  return Array.from(storage.keys());
});

ipcMain.handle('tickops-storage-listvalues', async (event) => {
  return Array.from(storage.values());
});

ipcMain.handle('tickops-storage-listentries', async (event) => {
  return Array.from(storage.entries());
});

ipcMain.handle('tickops-storage-renameKey', async (event, oldKey, newKey) => {
  if (storage.has(oldKey)) {
    const value = storage.get(oldKey);
    storage.delete(oldKey);
    storage.set(newKey, value);
    return true;
  }
  return false;
});

ipcMain.handle('tickops-storage-export', async (event) => {
  const obj = Object.fromEntries(storage.entries());
  return JSON.stringify(obj);
});

ipcMain.handle('tickops-storage-import', async (event, data) => {
  try {
    const parsed = JSON.parse(data);
    for (const [key, value] of Object.entries(parsed)) {
      storage.set(key, value);
    }
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle('tickops-tabs-create', async (event, options) => {
  const tabId = tabCounter++;
  tabs.set(tabId, {
    ...options,
    id: tabId
  });
  return { id: tabId, ...options };
});

ipcMain.handle('tickops-tabs-query', async (event, queryInfo) => {
  const results = [];
  for (const [id, tabObj] of tabs.entries()) {
    let matches = true;
    for (const [k, v] of Object.entries(queryInfo)) {
      if (tabObj[k] !== v) {
        matches = false;
        break;
      }
    }
    if (matches) {
      results.push(tabObj);
    }
  }
  return results;
});

ipcMain.handle('tickops-tabs-update', async (event, tabId, updateProperties) => {
  if (tabs.has(tabId)) {
    const current = tabs.get(tabId);
    const updated = {
      ...current,
      ...updateProperties
    };
    tabs.set(tabId, updated);
    return updated;
  }
  return null;
});

ipcMain.handle('tickops-tabs-remove', async (event, tabId) => {
  if (tabs.has(tabId)) {
    tabs.delete(tabId);
    return true;
  }
  return false;
});

ipcMain.handle('tickops-tabs-reload', async (event, tabId) => {
  if (tabs.has(tabId)) {
    return { id: tabId, reloaded: true };
  }
  return null;
});

ipcMain.handle('tickops-tabs-getInfo', async (event, tabId) => {
  if (tabs.has(tabId)) {
    return tabs.get(tabId);
  }
  return null;
});

ipcMain.handle('tickops-tabs-duplicate', async (event, tabId) => {
  if (tabs.has(tabId)) {
    const original = tabs.get(tabId);
    const newTabId = tabCounter++;
    const copy = {
      ...original,
      id: newTabId
    };
    tabs.set(newTabId, copy);
    return copy;
  }
  return null;
});

ipcMain.handle('tickops-tabs-activate', async (event, tabId) => {
  if (tabs.has(tabId)) {
    const current = tabs.get(tabId);
    const updated = {
      ...current,
      active: true
    };
    tabs.set(tabId, updated);
    return updated;
  }
  return null;
});

ipcMain.handle('tickops-tabs-sendMessage', async (event, tabId, message) => {
  if (tabs.has(tabId)) {
    return { success: true };
  }
  return { success: false, error: 'Tab not found' };
});

ipcMain.handle('tickops-tabs-list', async (event) => {
  return Array.from(tabs.values());
});


ipcMain.handle('tickops-windows-create', async (event, createData) => {
  const windowId = windowCounter++;
  const newWindow = new BrowserWindow(createData);
  windows.set(windowId, newWindow);
  return { id: windowId, ...createData };
});

ipcMain.handle('tickops-windows-remove', async (event, windowId) => {
  if (windows.has(windowId)) {
    const win = windows.get(windowId);
    win.close();
    windows.delete(windowId);
    return true;
  }
  return false;
});

ipcMain.handle('tickops-windows-getAll', async (event) => {
  const result = [];
  for (const [id, win] of windows.entries()) {
    result.push({
      id,
      title: win.getTitle(),
      isMinimized: win.isMinimized(),
      isMaximized: win.isMaximized()
    });
  }
  return result;
});

ipcMain.handle('tickops-windows-focus', async (event, windowId) => {
  if (windows.has(windowId)) {
    windows.get(windowId).focus();
    return true;
  }
  return false;
});

ipcMain.handle('tickops-windows-minimize', async (event, windowId) => {
  if (windows.has(windowId)) {
    windows.get(windowId).minimize();
    return true;
  }
  return false;
});

ipcMain.handle('tickops-windows-maximize', async (event, windowId) => {
  if (windows.has(windowId)) {
    windows.get(windowId).maximize();
    return true;
  }
  return false;
});

ipcMain.handle('tickops-windows-restore', async (event, windowId) => {
  if (windows.has(windowId)) {
    windows.get(windowId).restore();
    return true;
  }
  return false;
});

ipcMain.handle('tickops-runtime-sendMessage', async (event, message) => {
  return { success: true };
});

ipcMain.handle('tickops-runtime-getURL', async (event, path) => {
  return `file://${PRELOAD_PATH}/${path}`;
});

ipcMain.handle('tickops-runtime-getAppVersion', async (event) => {
  return app.getVersion();
});

ipcMain.handle('tickops-runtime-getPlatform', async (event) => {
  return process.platform;
});


module.exports = { initSDK };
