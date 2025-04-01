/* global document, window, MutationObserver */
const { ipcRenderer } = require('electron');
const { CUSTOM_PROTOCOL, messages } = require('@/common/consts');
const {
  fillField,
  getAutocompleteValue,
  autocompleteToDataNameMap,
  POPUP_VALID_INPUT_SELECTORS,
  POPUP_INPUT_TYPES,
  ATTRIBUTES_TO_SEARCH_KEYWORDS_IN,
} = require('./auto-fill-common');
const keywordsBlacklist = require('@/preload/autofill/keywords-blacklist.json');

const INPUT_TO_FILL_TYPES = [...POPUP_INPUT_TYPES, 'radio', 'number'];
const COMMON_TO_FILL_SELECTORS = ':not([populated]):not([readonly]):not([disabled]):not([type=hidden])';

/* e.g. input[type=text]:not([populated]) */
const INPUTS_TO_FILL_SELECTORS = INPUT_TO_FILL_TYPES
  .map((type) => `input[type=${type}]${COMMON_TO_FILL_SELECTORS}`)
  .join(', ') + `, input${COMMON_TO_FILL_SELECTORS}`;

/* e.g. input[type=text]:not([id*=signup]), select */
const CHECKING_MUTATION_SELECTORS = INPUT_TO_FILL_TYPES
  .map((type) => `input[type=${type}]`)
  .join(', ') + ', select';

/* e.g. form[name*=signup] */
const BLACKLISTED_FORM_SELECTORS = ATTRIBUTES_TO_SEARCH_KEYWORDS_IN
  .map((att) => {
    return keywordsBlacklist.forms
      .map((keyword) => `form[${att}*=${keyword} i]`)
      .join('')
  })
  .join(', ');

/* e.g. :not([name*=signup]) */
const BLACKLISTED_INPUT_SELECTORS = ATTRIBUTES_TO_SEARCH_KEYWORDS_IN
  .map((att) => {
    return keywordsBlacklist.inputs
      .map((keyword) => `input[${att}*=${keyword} i]`)
      .join(', ');
  })
  .join(', ');

const populatedFieldsMap = new Map();
let currentPaymentDataId, checkingCount = 0, mutatingCount = 0;

const sendLoadedEventToHost = () => {
  ipcRenderer.sendToHost(messages.FRAME_LOADED);
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendLoadedEventToHost);
} else {
  sendLoadedEventToHost();
}

ipcRenderer
  .on(messages.FILL_PAYMENT_DATA_IN_IFRAME, (event, values, needToClear = true) => {
    fillFields(values, needToClear);
  });

if (window.currentSessionData?.paymentDataId) {
  window.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutationList) => {
      let needToFill = false;
      for (const mutation of mutationList) {
        const found = [mutation.target, ...mutation.addedNodes]
          .find((node) => {
            return node.nodeType === 1
              && (node.matches(CHECKING_MUTATION_SELECTORS)
              || node.querySelector(CHECKING_MUTATION_SELECTORS))
          });
        if (found) {
          needToFill = true;
          break;
        }
      }
      if (++mutatingCount > 100 || !needToFill) return;
      ipcRenderer.sendToHost(messages.GET_AND_AUTO_FILL_PAYMENT_DATA, { needToClear: false });
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}

window.doesInputMatchToFillField = (target) => {
  return (
    target.matches(POPUP_VALID_INPUT_SELECTORS)
    && !window.location.href.startsWith(CUSTOM_PROTOCOL)
    && !target.matches(BLACKLISTED_INPUT_SELECTORS)
    && (!target.closest(BLACKLISTED_FORM_SELECTORS)
      || [...target.closest('form').querySelectorAll(POPUP_VALID_INPUT_SELECTORS)]
        .filter((element) => element.getBoundingClientRect().width).length > 1)
  );
};

function setTrustedModifiedOnUsersInput(event) {
  if (!event.isTrusted) return;
  event.target.setAttribute('trusted-modified', 'true');
  event.target.removeEventListener('input', setTrustedModifiedOnUsersInput);
}

function clearFieldsAndService(newPaymentDataId) {
  checkingCount = 0;
  mutatingCount = 0;
  if (newPaymentDataId !== currentPaymentDataId) {
    currentPaymentDataId = newPaymentDataId;
    populatedFieldsMap.clear();
  }
  const populatedFieldsList = getPopulatedFieldsList();
  for (const element of populatedFieldsList) {
    element.removeAttribute('populated');
  }
  const trustedModifiedFieldsList = getTrustedModifiedFieldsList();
  for (const element of trustedModifiedFieldsList) {
    element.removeAttribute('trusted-modified');
  }
}

function fillFields(values, needToClear = false) {
  if (!values) {
    console.error('No values to fill');
    return;
  }
  if (needToClear) clearFieldsAndService(values.id);
  const nonPopulatedFieldsList = getNonPopulatedFieldsList();
  nonPopulatedFieldsList.forEach((element) => {
    if (element.getAttribute('trusted-modified')) return;
    const autocomplete = getAutocompleteValue(element);
    element.setAttribute('populated', autocomplete || '');
    if (!autocomplete) return;
    const dataName = autocompleteToDataNameMap.get(autocomplete);
    if (dataName === 'tel' && values.tel) {
      values.restTel = fillPhoneInput(element, values.restTel || values.tel.slice(1));
      return;
    }
    element.addEventListener('input', setTrustedModifiedOnUsersInput);
    const value = values[dataName];
    if (!value) return;
    const filledValue = populatedFieldsMap.get(autocomplete);
    if (
      filledValue === element.value
      && element.getAttribute('type') !== 'radio'
    ) return;
    const newFieldValue = fillField({ element, value }) || value;
    populatedFieldsMap.set(autocomplete, newFieldValue);
  });

  setTimeout(() => {
    if (++checkingCount > 10) return;
    checkFieldsModifications(populatedFieldsMap);
    if (!getNonPopulatedFieldsList().length) return;
    fillFields(values);
  });
}

function getPopulatedFieldsList() {
  return document.querySelectorAll('input[populated], select[populated]');
}

function getTrustedModifiedFieldsList() {
  return document.querySelectorAll('input[trusted-modified], select[trusted-modified]');
}

function getNonPopulatedFieldsList() {
  return document.querySelectorAll(`${INPUTS_TO_FILL_SELECTORS}, select${COMMON_TO_FILL_SELECTORS}`);
}

function checkFieldsModifications(map) {
  const populatedFieldsList = getPopulatedFieldsList();
  populatedFieldsList.forEach((element) => {
    if (element.getAttribute('trusted-modified')) return;
    const autocomplete = element.getAttribute('populated');
    const value = map.get(autocomplete);
    if (!value || value === element.value) return;
    fillField({ element, value });
  });
}

function fillPhoneInput(element, value) {
  element.setAttribute('trusted-modified', 'true');
  const splitValue = value.split('');
  const maxLength = element.getAttribute('maxlength') || splitValue.length;
  fillField({ element, value: splitValue.splice(0, maxLength).join('') });
  return splitValue.join('');
}
