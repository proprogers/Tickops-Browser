/* global window, document, location */
const { ipcRenderer } = require('electron');
const { messages } = require('@/common/consts');
const { dispatchFieldValueChanging, doesUrlHaveScheme } = require('@/common/utils');

const FILL_IFRAME_MESSAGE = 'fill-payment-data-iframe';

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

function fillInputField({ element, value }) {
  element.focus();
  nativeInputValueSetter.call(element, value);
  dispatchFieldValueChanging(element);
  element.blur();
}

function sendPostMessageToAllIframes(value) {
  const iframesPosted = new Set();
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    if (!iframe.src || !doesUrlHaveScheme(iframe.src) || iframesPosted.has(iframe.src)) return;
    iframesPosted.add(iframe.src);
    iframe.contentWindow.postMessage({ channel: FILL_IFRAME_MESSAGE, value }, iframe.src);
  });
}

function fillField(value) {
  var input = document.querySelector('#mfa-code-input-field, #otp, input[autocomplete="one-time-code"], input[name=otp]');
  if (!input){
    setInterval(()=>{ 
      input = document.querySelector('#mfa-code-input-field, #otp, input[autocomplete="one-time-code"], input[name=otp]')
      if(input) fillInputField({ element: input, value });
  },1000);
  } else{
    fillInputField({ element: input, value });
  }
}

function setAutoFillerSms(credentials) {
  if (process.isMainFrame) {
    if (!location.hostname.includes('ticketmaster')) return;
    ipcRenderer.on(messages.ON_SMS, (event, { number, message }) => {
      if (credentials.tel !== number) return;
      console.log(message); // keep it
      const value = parseInt(message);
      fillField(value);
      sendPostMessageToAllIframes(value);
    });
  } else {
    if (!location.hostname.includes('ticketmaster')) return;
    window.addEventListener('message', (event) => {
      if (event.data.channel !== FILL_IFRAME_MESSAGE) return;
      fillField(event.data.value);
      sendPostMessageToAllIframes(event.data.value);
    });
  }
}

module.exports = { setAutoFillerSms };
