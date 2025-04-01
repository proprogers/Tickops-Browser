const settings = require('electron-settings');

class Settings {
  constructor() {
    this._cache = null;
  }

  async init() {
    settings.init();
    this._cache = await settings.get();
  }

  async get(key) {
    return this._cache[key];
  }

  async set(key, value) {
    await settings.set(key, value);
    this._cache[key] = value;
  }

  async delete(key) {
    await settings.delete(key);
  }
  async clear() {
    await settings.unset()
  }
}

module.exports = Settings;
