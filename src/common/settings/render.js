/* global window */
const { ipcRenderer } = require('electron');
const { messages: { SETTINGS_SET, SETTINGS_GET, SETTINGS_CLEAR } } = require('../consts');
const { EventEmitter } = require('events');
const { findAndUpdateArrayItems } = require('./common');

const SettingsEmitter = new EventEmitter();

SettingsEmitter.get = async (key) => {
  return ipcRenderer.invoke(SETTINGS_GET, key);
};
SettingsEmitter.set = async (key, value) => {
  return ipcRenderer.invoke(SETTINGS_SET, key, value);
};

SettingsEmitter.clear = async () => {
  return await ipcRenderer.invoke(SETTINGS_CLEAR);
};

SettingsEmitter.findAndUpdateArrayItems = async (key, values) => {
  const { updated, array } = findAndUpdateArrayItems({
    values,
    array: await SettingsEmitter.get(key)
  });
  const whole = await ipcRenderer.invoke(SETTINGS_SET, key, array);
  return { updated, whole };
};
SettingsEmitter.addToArray = async (key, value) => {
  const array = await SettingsEmitter.get(key) || [];
  return ipcRenderer.invoke(SETTINGS_SET, key, [...array, value]);
};
SettingsEmitter.bulkAddToArray = async (key, newArray) => {
  const array = await SettingsEmitter.get(key) || [];
  return ipcRenderer.invoke(SETTINGS_SET, key, [...array, ...newArray]);
};
SettingsEmitter.findAndRemoveArrayItems = async (key, values) => {
  const array = await SettingsEmitter.get(key) || [];
  values.forEach((findIndexFunc) => {
    const index = array.findIndex(findIndexFunc);
    if (index === -1) return;
    array.splice(index, 1);
  });
  return ipcRenderer.invoke(SETTINGS_SET, key, array);
};

ipcRenderer.on(`${SETTINGS_SET}-reply`, (event, key, value) => {
  SettingsEmitter.emit(SETTINGS_SET, key, value);
});

if (typeof window !== 'undefined' && !window.Settings) {
  window.Settings = SettingsEmitter;
}

module.exports = SettingsEmitter;

