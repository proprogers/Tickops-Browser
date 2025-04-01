/* global describe, before, after, it */
const assert = require('assert');
const TimezoneSetter = require('../src/preload/spoofing/timezone-setter.js');

const timestamp = 1620662192155;
const origUtcResults = [
  { method: 'toJSON', value: '2021-05-10T15:56:32.155Z' },
  { method: 'toISOString', value: '2021-05-10T15:56:32.155Z' },
  { method: 'toGMTString', value: 'Mon, 10 May 2021 15:56:32 GMT' },
  { method: 'toUTCString', value: 'Mon, 10 May 2021 15:56:32 GMT' },
  { method: 'getUTCFullYear', value: 2021 },
  { method: 'getUTCMonth', value: 4 },
  { method: 'getUTCDay', value: 1 },
  { method: 'getUTCHours', value: 15 },
  { method: 'getUTCMinutes', value: 56 },
  { method: 'getUTCSeconds', value: 32 },
  { method: 'getUTCMilliseconds', value: 155 }
];
const timezone = { name: 'Europe/London', value: 0 };
// const timezone = { name: 'Europe/Moscow', value: -180 };
// const timezone = { name: 'Asia/Novosibirsk', value: -420 };
// const timezone = { name: 'America/New_York', value: 300 };

describe(`Timezone: ${timezone.name}`, () => {
  before(() => TimezoneSetter.set(timezone));
  after(() => TimezoneSetter.unset());
  origUtcResults.forEach(({ method, value }) => {
    it(`expect new Date.${method}() to be equal '${value}'`, () => {
      assert.strictEqual(new Date(timestamp)[method](), value);
    });
  });
});

describe(`Timezone: Europe/London`, () => {
  before(() => TimezoneSetter.set({ name: 'Europe/London', value: 0 }));
  after(() => TimezoneSetter.unset());
  it(`new Date.toTimeString()`, () => {
    assert.strictEqual(new Date(timestamp).toTimeString(), '15:56:32 GMT+0000 (Europe London Standard Time)');
  });
  it(`new Date.toString()`, () => {
    assert.strictEqual(new Date(timestamp).toString(), 'Mon May 10 2021 15:56:32 GMT+0000 (Europe London Standard Time)');
  });
});
