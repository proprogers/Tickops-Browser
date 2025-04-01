const { writeFileSync, readFileSync } = require('fs');

const path = 'package.json';
const prodAppName = 'electron-browser';
const prodProductName = 'TickOps Сanary';

set();

function set() {
  const content = readFileSync(path, 'utf-8');
  const newContent = true
    ? getBeta(content)
    : getProd(content);
  writeFileSync(path, newContent);
}

function getBeta(content) {
  return content
    .replace(`"${prodAppName}"`, `"${prodAppName}-beta"`)
    .replace(`"${prodProductName}"`, `"${prodProductName} Beta"`);
}

function getProd(content) {
  return content
    .replace(`"${prodAppName}-beta"`, `"${prodAppName}"`)
    .replace(`"${prodProductName} Beta"`, `"${prodProductName}"`);
}
