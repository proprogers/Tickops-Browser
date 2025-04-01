/* global window */
const { ipcRenderer } = require('electron');
const passwordsKeywords = require('./passwords-keywords.json');
const { messages } = require('@/common/consts');
const {
  fillField,
  getSelectorsByAttributesAndKeywords,
  ATTRIBUTES_TO_SEARCH_KEYWORDS_IN,
  PASSWORD_FIELD_SELECTORS,
  LOGIN_FIELD_SELECTORS
} = require('./auto-fill-common');

const SIGNIN_SUBMIT_BUTTON_SELECTORS = getSubmitButtonSelectors(passwordsKeywords.signIn.common);
const SIGNUP_SUBMIT_BUTTON_SELECTORS = getSubmitButtonSelectors(passwordsKeywords.signUp.submit);

const CONFIRM_PASSWORD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.signUp.confirmPassword.keywords,
  }) + ', ' + getSelectorsByAttributesAndKeywords({
    tagNames: ['label'],
    attrs: ['for'],
    keywords: passwordsKeywords.signUp.confirmPassword.text
  }) + ', ' + getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    attrs: ['placeholder'],
    keywords: passwordsKeywords.signUp.confirmPassword.text
  });

const NEW_PASSWORD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    attrs: [...ATTRIBUTES_TO_SEARCH_KEYWORDS_IN, 'placeholder'],
    keywords: passwordsKeywords.signUp.newPassword,
  });

const OLD_PASSWORD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    attrs: [...ATTRIBUTES_TO_SEARCH_KEYWORDS_IN, 'placeholder'],
    keywords: passwordsKeywords.signUp.oldPassword,
  }) + ', ' + getSelectorsByAttributesAndKeywords({
    tagNames: ['label'],
    attrs: ['for'],
    keywords: passwordsKeywords.signUp.oldPassword
  });

const CONFIRM_EMAIL_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.signUp.confirmEmail,
  });

const NAME_FIELDS_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.signUp.name
  });

const SIGN_IN_FIELD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['input'],
    keywords: passwordsKeywords.signIn.common
  });

const FORGOT_PASSWORD_SELECTORS =
  getSelectorsByAttributesAndKeywords({
    tagNames: ['button', 'a'],
    types: [null],
    keywords: passwordsKeywords.signIn.forgotPassword
  });

let signUpTargetForm = null;
let signInTargetForm = null;

function getSubmitButtonSelectors(keywords) {
  return keywords
    .map((keyword) => {
      return [...ATTRIBUTES_TO_SEARCH_KEYWORDS_IN, 'value']
        .map((att) => `[${att}*="${keyword}" i]`)
        .join(', ')
    })
    .join(', ');
}

function findElementInArrayBySelectorsAndText({ elementsArray, keywordsArray, selectors }) {
  const element = elementsArray && elementsArray.find((element) => {
    return element.matches(selectors)
      || keywordsArray.find((keyword) => {
        return new RegExp(keyword).test(element.textContent.toLowerCase());
      });
  });
  return element && !!element.getBoundingClientRect().width;
}

function doesFormMatchSignUp(form) {
  const element = form.querySelector(
    CONFIRM_PASSWORD_SELECTORS + ', '
    + CONFIRM_EMAIL_SELECTORS + ', '
    + NAME_FIELDS_SELECTORS
  );
  return element && !!element.getBoundingClientRect().width;
}

ipcRenderer
  .on(messages.FILL_SUGGESTED_PASSWORD, (event, value) => {
    fillPasswordsFields(value);
  })
  .on(messages.FILL_LOGIN, (event, values) => {
    fillSignIn(values);
  });

window.doesInputMatchSignUpPasswordConfirm = (target) => {
  const matches = target.matches(CONFIRM_PASSWORD_SELECTORS);
  return matches && !!target.getBoundingClientRect().width;
};

window.doesInputMatchOldPassword = (target) => {
  const matches = target.matches(OLD_PASSWORD_SELECTORS);
  return matches && !!target.getBoundingClientRect().width;
};

window.doesInputMatchNewPassword = (target) => {
  const matches = target.matches(NEW_PASSWORD_SELECTORS);
  return matches && !!target.getBoundingClientRect().width;
};

window.doesInputMatchSignUpPassword = (target) => {
  signUpTargetForm = target.closest('form') || null;
  return (
    signUpTargetForm
    && !window.doesInputMatchSignUpPasswordConfirm(target)
    && target.matches(PASSWORD_FIELD_SELECTORS)
    && (
      doesFormMatchSignUp(signUpTargetForm)
      || findElementInArrayBySelectorsAndText({
        buttonsArray: [...signUpTargetForm.getElementsByTagName('button')],
        keywordsArray: passwordsKeywords.signUp.submit,
        selectors: SIGNUP_SUBMIT_BUTTON_SELECTORS
      })
    )
  );
};

window.doesInputMatchSignInField = (target) => {
  signInTargetForm = target.closest('form') || null;
  return (
    signInTargetForm
    && target.matches(SIGN_IN_FIELD_SELECTORS)
    && !doesFormMatchSignUp(signInTargetForm)
    && (
      findElementInArrayBySelectorsAndText({
        elementsArray: [...signInTargetForm.getElementsByTagName('button')],
        keywordsArray: passwordsKeywords.signIn.common,
        selectors: SIGNIN_SUBMIT_BUTTON_SELECTORS
      })
      || findElementInArrayBySelectorsAndText({
        elementsArray: [...signInTargetForm.querySelectorAll('button, a')],
        keywordsArray: passwordsKeywords.signIn.forgotPassword,
        selectors: FORGOT_PASSWORD_SELECTORS
      })
      || [...signInTargetForm.querySelectorAll(SIGN_IN_FIELD_SELECTORS)]
        .filter((element) => element.getBoundingClientRect().width && element.matches('input:not([id*=verify])'))
        .length === 2
    )
  );
};

function fillPasswordsFields(value) {
  const passwordsFieldsList = signUpTargetForm && signUpTargetForm.querySelectorAll(PASSWORD_FIELD_SELECTORS);
  if (!passwordsFieldsList.length) return;
  passwordsFieldsList.forEach((element) => {
    fillField({ element, value });
  });
}

function fillSignIn(values) {
  if (!signInTargetForm) return;
  if (values.password) {
    const passwordField = signInTargetForm.querySelector(PASSWORD_FIELD_SELECTORS);
    if (passwordField) {
      fillField({ element: passwordField, value: values.password });
    }
  }
  if (values.login) {
    const loginField = signInTargetForm.querySelector(LOGIN_FIELD_SELECTORS);
    if (loginField) {
      fillField({ element: loginField, value: values.login });
    }
  }
}
