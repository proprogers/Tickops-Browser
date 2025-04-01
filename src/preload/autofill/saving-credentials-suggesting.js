/* global window, document, MutationObserver */
const { ipcRenderer } = require('electron');
const { messages, PREFERENCES_KEY } = require('@/common/consts');
const Settings = require('@/common/settings'); // TODO: remove
const { PASSWORD_FIELD_SELECTORS, LOGIN_FIELD_SELECTORS } = require('./auto-fill-common');

setListenerToSuggestingToSaveCredentials();

async function setListenerToSuggestingToSaveCredentials() {
  const preferences = await Settings.get(PREFERENCES_KEY);
  if (preferences.indexOf('suggestToSaveCredentials') === -1) return;
  document.addEventListener('change', ({ target }) => {
    if (target.matches(PASSWORD_FIELD_SELECTORS) || window.doesInputMatchSignUpPasswordConfirm(target)) {
      sendCredentialsToSave({ password: target.value });
      if (!target.hasAttribute('observed')) {
        target.setAttribute('observed', '');
        setMutationObserverForPasswordField(target);
      }
    } else if (target.matches(LOGIN_FIELD_SELECTORS)) {
      sendCredentialsToSave({ login: target.value });
    } else {
      return;
    }
    const closestForm = target.closest('form');
    closestForm && closestForm.addEventListener('submit', suggestToSaveCredentials);
  }, { capture: true });
}

function sendCredentialsToSave(credentials) {
  ipcRenderer.sendToHost(messages.EDIT_PAGE_SITE_CREDENTIALS, credentials);
}

function suggestToSaveCredentials() {
  ipcRenderer.sendToHost(messages.SUGGEST_TO_SAVE_SITE_CREDENTIALS);
}

function setMutationObserverForPasswordField(target) {
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      mutation.removedNodes.forEach((node) => {
        if (node !== target && !node.contains(target)) return;
        suggestToSaveCredentials();
      });
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}
