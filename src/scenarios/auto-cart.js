/* global document, Event, fieldsCache */
const { ipcMain } = require('electron');
const Sentry = require('@sentry/electron');
const puppeteer = require('puppeteer-core');
const { remoteDebuggingPort } = require('@/../config');
const { messages: { AUTO_CART }, CUSTOM_PROTOCOL, AUTO_CARTING_MODAL_URL } = require('../common/consts');

const defaultTimeout = 60000;
let browser;
/* for checkout */
// let fieldsCache;

puppeteer.connect({
  browserURL: `http://localhost:${remoteDebuggingPort}`,
  defaultViewport: null
}).then(value => browser = value);

ipcMain.on(AUTO_CART, async (event, { tickets, pageId, eventLocation }) => {
  try {
    await autoCart({ tickets, pageId, eventLocation });
    event.sender.send('auto-carting-finish', { result: 'success', pageId });
  } catch (e) {
    captureAutoCartingError({ tickets, error: e, url: eventLocation, pageId });
    const message = `Script failed. May be caused by incorrectly entered tickets type or unsupported event type`;
    event.sender.send('auto-carting-finish', { result: 'error', message, pageId });
  }
});

function captureAutoCartingError(exc) {
  Sentry.captureException(exc, (scope) => {
    scope.setTag('url', exc.url);
    return scope;
  });
}

async function autoCart({ tickets: { type, number }, pageId, eventLocation }) {
  const target = await browser.waitForTarget(target => target.url() === `${CUSTOM_PROTOCOL}://empty#${pageId}`);
  const page = await target.page();
  page.setDefaultTimeout(defaultTimeout);
  await page.goto(eventLocation, { waitUntil: 'domcontentloaded' });

  const selectors = {
    iframe: 'iframe[id^=eventbrite-widget-modal]',
    ticketsTitleElement: '.ticket-title',
    checkoutButton: '.eds-btn.eds-btn--button.eds-btn--fill',
    checkoutFlag: '#timerRegion',
    paymentButton: '#CREDIT button',
    checkoutInputLabel: '.eds-label__content'
  };

  let isIframe = false;
  let frameNavigationPromise;
  if (!eventLocation.match(/#tickets$/)) {
    frameNavigationPromise = waitForFrameNavigated(page);
    await customClick(page, '.micro-ticket-box__btn.btn.btn--responsive');
    isIframe = !!await page.$('iframe[id^=eventbrite-widget-modal]');
  }

  let context;

  if (isIframe) {
    context = await frameNavigationPromise;
    try {
      await customWaitForSelector(context, selectors.ticketsTitleElement);
    } catch (e) {
      e.ticketsTitleElementQuery = (await context.$$(selectors.ticketsTitleElement)).length;
      throw e;
    }
  } else {
    context = page;
    selectors.ticketsTitleElement = '.ticket-box__name';
    selectors.checkoutButton = '.js-register-button';
    selectors.checkoutFlag = '#page_registration';
    selectors.checkoutInputLabel = 'input';
  }

  await context.evaluate(pickTickets, selectors.ticketsTitleElement, type.toLowerCase(), number);

  await customClick(context, selectors.checkoutButton);

  /*
  * Checkout stage
  * */

  /*
  await context.waitForSelector(selectors.checkoutFlag);
  if (await context.$(selectors.paymentButton)) {
    await customClick(context, selectors.paymentButton);
  }

  fieldsCache = new Map();
  await fillFields({ context, contactInfo, checkoutInputLabelSelector: selectors.checkoutInputLabel });
*/
}


async function waitForFrameNavigated(page) {
  return new Promise((resolve, reject) => {
    async function onFrameNavigated(frame) {
      if (frame.url().startsWith(AUTO_CARTING_MODAL_URL)) {
        page.off('framenavigated', onFrameNavigated);
        resolve(frame);
      }
    }

    page.on('framenavigated', onFrameNavigated);
    page.once('error', reject);
    setTimeout(() => reject(new Error('Frame navigation timeout')), defaultTimeout);
  });
}

// NOTE: [context].evaluate instead of the [context].click, because of the freezing problem
async function customClick(context, selector) {
  return await context.evaluate((selector) => {
    document.querySelector(selector).click();
  }, selector);
}

// NOTE: setInterval instead of the [context].waitForSelector, because of the timeout problem
async function customWaitForSelector(context, selector) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for selector ${selector}`))
    }, defaultTimeout);
    const intervalId = setInterval(async () => {
      const element = await context.$(selector);
      if (element) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve();
      }
    }, 100);
  });
}

function pickTickets(selector, type, number) {
  const titleElements = [...document.querySelectorAll(selector)]; // TODO: getElementsByName: https://youtu.be/VBfvnKDlZMw?t=646

  const titleElement = titleElements.find(element => element.textContent.toLowerCase() === type)
    || titleElements.find(element => element.textContent.toLowerCase().match(type));

  const selectElement = titleElement.parentElement.parentElement.querySelector('select');
  // here will be an error if type is invalid
  selectElement.value = number; // TODO: Unavailable tickets
  selectElement.dispatchEvent(new Event('change', { 'bubbles': true }));
}

/* for checkout */
function getInputInfo(element, selector) {
  const isSelect = element.tagName.toLowerCase() === 'select';
  const type = isSelect ? 'select' : element.type;
  let parentElement, checkboxValue;
  switch (type) {
    case 'hidden':
      break;
    case 'radio':
      break;
    case 'checkbox': {
      parentElement = element.closest('.eds-g-cell');
      const parentCheckboxElement = element.parentElement.parentElement;
      const checkboxLabelElement = parentCheckboxElement
        && [...parentCheckboxElement.querySelectorAll('label')][1];
      checkboxValue = checkboxLabelElement && checkboxLabelElement.textContent.toLowerCase();
      break;
    }
    default:
      parentElement = element.parentElement.parentElement;
      break;
  }
  const labelElement = parentElement && parentElement.querySelector(selector);
  // const isRequired = labelElement && parentElement.querySelector('.eds-label__required-indicator');
  const label = labelElement && labelElement.textContent.toLowerCase().replace(/\W/g, '');
  element.setAttribute('populated', '');
  return { type, label, checkboxValue, id: element.id };
}

/* for checkout */
async function fillField({ elementHandle, type, inputValue, checkboxValue }) {
  switch (type) {
    case 'select':
      await elementHandle.select(inputValue);
      break;
    case 'checkbox':
      checkboxValue === inputValue && await elementHandle.evaluate((element) => {
        element.parentElement.querySelector('label').click();
      });
      break;
    case 'radio':
      break;
    default:
      await elementHandle.type(inputValue);
      break;
  }
}

/* for the checkout */

// eslint-disable-next-line no-unused-vars
async function fillFields({ context, contactInfo, checkoutInputLabelSelector }) {
  const elementHandle = await context.$('input:not([populated]), select:not([populated])');
  if (!elementHandle) return;

  const populatedFields = await context.$$('input[populated], select[populated]');
  for (const handle of populatedFields) {
    const elementId = await (await handle.getProperty('id')).jsonValue();
    const elementValue = await (await handle.getProperty('value')).jsonValue();
    const { value, type, checkboxValue } = fieldsCache.get(elementId);
    if (value !== elementValue) {
      // console.log(elementId, ':', value, '-', elementValue);
      await fillField({ elementHandle: handle, type, inputValue: value, checkboxValue });
      // TODO: checkboxes
    }
  }

  const { label, type, checkboxValue, id } = await elementHandle.evaluate(getInputInfo, checkoutInputLabelSelector);
  fieldsCache.set(id, { value: '' });
  if (!label) return;

  for (const key in contactInfo) {
    const isLabelMatches = contactInfo[key].label.some(item => item === label);
    if (!isLabelMatches) continue;

    const inputValue = contactInfo[key].value;
    fieldsCache.set(id, { value: inputValue, type, checkboxValue });

    await fillField({ elementHandle, type, inputValue, checkboxValue });
  }

  setTimeout(async () => {
    await fillFields({ context, contactInfo, checkoutInputLabelSelector })
  }, 0);
}
