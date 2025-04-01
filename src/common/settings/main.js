const { webContents, ipcMain } = require('electron');
const { messages: { SETTINGS_SET, SETTINGS_GET, SETTINGS_DELETE, SETTINGS_CLEAR } } = require('../consts');
const { EventEmitter } = require('events');
const Settings = require('./Settings');
const { app } = require('electron');
const { findAndUpdateArrayItems } = require('./common');

const settings = new Settings();
const SettingsEmitter = new EventEmitter();

SettingsEmitter.init = settings.init.bind(settings);
SettingsEmitter.get = settings.get.bind(settings);
SettingsEmitter.set = async function (key, value) {
  await settings.set.call(settings, key, value);
  SettingsEmitter.emit(SETTINGS_SET, key, value);
  broadcastToRender(key, value);
};
SettingsEmitter.delete = async function (key) {
  await settings.set.call(settings, key);
  SettingsEmitter.emit(SETTINGS_DELETE, key);
  broadcastToRender(key, '');
};
SettingsEmitter.findAndUpdateArrayItems = async (key, values) => {
  const { updated, array } = findAndUpdateArrayItems({
    values,
    array: await SettingsEmitter.get(key)
  });
  const whole = await SettingsEmitter.set(key, array);
  return { updated, whole };
};

ipcMain.handle(SETTINGS_SET, (event, key, value) => {
  return SettingsEmitter.set(key, value);
});
ipcMain.handle(SETTINGS_DELETE, (event, key, value) => {
  return SettingsEmitter.set(key, value);
});
ipcMain.handle(SETTINGS_GET, (event, key) => {
  return SettingsEmitter.get(key);
});

ipcMain.handle(SETTINGS_CLEAR, async () => {
  await settings.clear()
  app.relaunch();
  app.quit();
  ipcMain.removeHandler(SETTINGS_CLEAR);
})

function broadcastToRender(key, value) {
  webContents.getAllWebContents().forEach((webContent) => {
    webContent.send(`${SETTINGS_SET}-reply`, key, value);
  });
}

module.exports = SettingsEmitter;
