/* global document, window */
const { ipcRenderer } = require('electron');
const { messages } = require('@/common/consts');
const { dispatchFieldValueChanging } = require('@/common/utils');
const countriesMap = new Map(require('@/common/countries.json').map((country) => [country.iso2, country]));
const paymentFields = require('@/preload/autofill/payment-fields.json');
const passwordsKeywords = require('./passwords-keywords.json');
let event_scroll = {};
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
const OriginalEvent = Event;

const GET_IFRAME_COORDINATES_MESSAGE = 'get-iframe-coordinates';

const POPUP_INPUT_TYPES = ['text', 'tel', 'password', 'email'];

const ATTRIBUTES_TO_SEARCH_KEYWORDS_IN = ['name', 'id'];

const PASSWORD_FIELD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.common.password
  });

const LOGIN_FIELD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.common.login
  });

/* e.g. input[type=text]:not([id*=signup]) */
const POPUP_VALID_INPUT_SELECTORS = POPUP_INPUT_TYPES
  .map((type) => `input[type=${type}]`)
  .join(', ');

const fieldsLabelToAutocompleteMap = new Map(
  paymentFields.reduce((filtered, { autocomplete, labels }) => {
    labels.forEach((label) => {
      autocomplete.forEach((currAutocomplete) => {
        filtered.push([label, currAutocomplete]);
      });
    });
    return filtered;
  }, [])
);

const autocompleteToDataNameMap = new Map(
  paymentFields.reduce((filtered, { name, autocomplete }) => {
    autocomplete.forEach((currAutocomplete) => {
      filtered.push([currAutocomplete, name]);
    });
    return filtered;
  }, [])
);

window.addEventListener('message', async (event) => {
  if (event.data.channel !== GET_IFRAME_COORDINATES_MESSAGE) return;

  const coordinates = window === window.top
    ? { x: 0, y: 0 }
    : await getFrameCoordinates();

  const iframes = document.getElementsByTagName('iframe');
  for (const iframe of iframes) {
    if (iframe.src !== event.data.href && iframe.name !== event.data.name) continue;
    const { x, y } = iframe.getBoundingClientRect();

    event.source.postMessage({
      channel: `${GET_IFRAME_COORDINATES_MESSAGE}-reply`,
      coordinates: {
        x: coordinates.x + x,
        y: coordinates.y + y,
      }
    }, '*');
    break;
  }
});

function getSelectorsByAttributesAndKeywords(
  { tagNames, keywords, attrs = ATTRIBUTES_TO_SEARCH_KEYWORDS_IN, types = POPUP_INPUT_TYPES }
) {
  return attrs
    .map((att) => {
      return keywords
        .map((keyword) => {
          return tagNames
            .map((tagName) => {
              return types
                .map((type) => `${tagName}${type ? '[type=' + type + ']' : ''}[${att}*="${keyword}" i]`)
                .join(', ')
            })
            .join(', ')
        })
        .join(', ')
    })
    .join(', ');
}

async function openPopup(event, type, dataName) {
  const currentFrameCoordinates = window === window.top
    ? { x: 0, y: 0 }
    : await getFrameCoordinates();
  const targetBoundingClientRect = event.target.getBoundingClientRect();
  ipcRenderer.sendToHost(messages.SET_AUTO_FILL_POPUP, {
    y: targetBoundingClientRect.bottom + currentFrameCoordinates.y,
    x: targetBoundingClientRect.x + currentFrameCoordinates.x,
    width: targetBoundingClientRect.width || '300px',
    height: targetBoundingClientRect.height,
    type,
    dataName,
    hostname: window.location.hostname
  });
}

async function getFrameCoordinates() {
  return new Promise((resolve, reject) => {
    const listenForFrameCoordinatesResponse = (event) => {
      if (event.data.channel !== `${GET_IFRAME_COORDINATES_MESSAGE}-reply`) return;
      window.removeEventListener('message', listenForFrameCoordinatesResponse);
      resolve(event.data.coordinates);
    };
    window.addEventListener('message', listenForFrameCoordinatesResponse);
    window.parent.postMessage({
      channel: GET_IFRAME_COORDINATES_MESSAGE,
      href: window.location.href,
      name: window.name
    }, '*');
    setTimeout(() => reject(new Error('Getting frame coordinates timeout')), 2000);
  });
}

async function listenPopupOpen(event) {

  if (event.target.disabled || event.target.hasAttribute('readonly')) return;

  event_scroll = event;
  if (
    window.doesInputMatchSignUpPassword(event.target)
    && !window.doesInputMatchOldPassword(event.target)
  ) {
    if (!event.target.value) {
      await openPopup(event, 'auto-suggest-passwords');
    }
    return;
  }
  if (window.doesInputMatchSignInField(event.target)) {
    await openPopup(event, 'auto-fill-login');
    return;
  }
  if (
    window.doesInputMatchToFillField(event.target)
    && !window.doesInputMatchSignUpPasswordConfirm(event.target)
  ) {
    const autocomplete = getAutocompleteValue(event.target);
    const dataName = autocompleteToDataNameMap.get(autocomplete);
    await openPopup(event, 'auto-fill-payment', dataName);
  }
}

function closePopup() {
  event_scroll = {};
  ipcRenderer.sendToHost(messages.SET_AUTO_FILL_POPUP, false);
}

function listenPopupClose(event) {
  console.log(event);
  const closestForm = event.target.closest('form');
  console.log("event target "+event.target.matches(POPUP_VALID_INPUT_SELECTORS));
  console.log("closestForm target "+closestForm);
  if (
    event.target.matches(POPUP_VALID_INPUT_SELECTORS)
  ) return;
  /* Close popup on "clickaway" from opened one */
  closePopup();
}

// window.addEventListener('mouseup', listenPopupClose);
window.addEventListener('mouseup', listenPopupOpen);
window.addEventListener('keyup', async function(event) {
  if(event.key === 'Tab') {
    listenPopupClose(event);
    await listenPopupOpen(event);
  }
});
window.addEventListener('click', async function(event) {
    listenPopupClose(event);
});
window.addEventListener('scroll', async function(event) {

    await listenPopupOpen(event_scroll);
  
});

function fillField({ element, value }) {
  element.dispatchEvent(new OriginalEvent('focus', { bubbles: true }));
  switch (element.tagName) {
    case 'INPUT': {
      if (element.type === 'radio') {
        fillRadio({ element, value });
      } else {
        nativeInputValueSetter.call(element, value);
        dispatchFieldValueChanging(element);
      }
      break;
    }
    case 'SELECT': {
      dispatchSelect({ element, value });
      value = element.value === value && value
        || selectByLabel({ element, value })
        || tryToSelectCountry({ element, value });
      element.dispatchEvent(new OriginalEvent('blur', { bubbles: true }));
      break;
    }
  }
  return value;
}

function fillRadio({ element, value }) {
  if (element.parentElement.textContent.toLowerCase().trim() !== value.toLowerCase()) return;
  element.click();
}

function dispatchSelect({ element, value }) {
  element.value = value;
  dispatchFieldValueChanging(element);
}

function selectByLabel({ element, value }) {
  for (const curr of element.options) {
    if (curr.label.toLowerCase() === value.toLowerCase()) {
      dispatchSelect({ element, value: curr.value });
      return curr.value;
    }
  }
}

function tryToSelectCountry({ element, value }) {
  const country = countriesMap.get(value);
  if (!country) return;
  dispatchSelect({ element, value: country.iso3 });
  if (element.value !== country.iso3) {
    selectByLabel({ element, value: country.name });
  }
  if ([country.iso3, country.name].includes(element.value)) {
    return element.value;
  }
}

function getLabel(inputElement) {
  const labelElement = inputElement.parentElement.getElementsByTagName('label')[0]
    || inputElement.parentElement.parentElement.getElementsByTagName('label')[0];
  if (!labelElement) return;
  const textElement = labelElement.getElementsByTagName('span')[0] || labelElement;
  return textElement.textContent && textElement.textContent.trim().toLowerCase();
}

function getAutocompleteValue(element) {
  let autocomplete = element.getAttribute('autocomplete');
  if (!autocomplete || ['off', 'on'].includes(autocomplete)) {
    autocomplete = getAutocompleteValueByElementName(element) || null;
    if (!autocomplete) {
      const label = getLabel(element);
      autocomplete = fieldsLabelToAutocompleteMap.get(label);
    }
  }
  return autocomplete;
}

function getAutocompleteValueByElementName(element) {
  const elementName = element.getAttribute('name');
  if (!elementName) return;
  const lowerCasedElementName = elementName.toLowerCase();
  const fieldInfo = paymentFields.find(({ keywords }) => {
    return keywords && keywords.find((keyword) => {
      return new RegExp(keyword).test(lowerCasedElementName)
    });
  });
  return fieldInfo ? fieldInfo.autocomplete[0] : null;
}


module.exports = {
  fillField,
  getAutocompleteValue,
  getSelectorsByAttributesAndKeywords,
  autocompleteToDataNameMap,
  POPUP_VALID_INPUT_SELECTORS,
  POPUP_INPUT_TYPES,
  ATTRIBUTES_TO_SEARCH_KEYWORDS_IN,
  PASSWORD_FIELD_SELECTORS,
  LOGIN_FIELD_SELECTORS,
};
