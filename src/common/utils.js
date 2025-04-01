const { CUSTOM_PROTOCOL, NEW_TAB, SEARCH_ENGINE } = require('./consts');

const OriginalEvent = Event;

function normalizeUrl(text) {
  if (!text) return NEW_TAB;
  let url = text.trim();
  if (!url.startsWith(CUSTOM_PROTOCOL + ':') && (url.indexOf('.') === -1 || url.indexOf(' ') !== -1)) {
    // it's probably a search term
    url = SEARCH_ENGINE + encodeURIComponent(url);
  }
  const prefix = 'https://';
  if (!doesUrlHaveScheme(url) && !prefix.includes(url)) {
    url = prefix + url;
  }
  return url;
}

function doesUrlHaveScheme(url) {
  return /^([^:/]+)(:\/\/)/g.test(url);
}

function isRenderer() {
  // running in a web browser
  if (typeof process === 'undefined') return true;
  // node-integration is disabled
  if (!process) return true;
  // We're in node.js somehow
  if (!process.type) return false;
  return process.type === 'renderer';
}

function dispatchFieldValueChanging(element) {
  [ 'keydown', 'input', 'keyup', 'change', 'blur'].forEach((name) => {
    element.dispatchEvent(new OriginalEvent(name, { bubbles: true }));
  });
}

module.exports = { normalizeUrl, isRenderer, dispatchFieldValueChanging, doesUrlHaveScheme };
