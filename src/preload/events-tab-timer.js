/* global window, document, location */
const { ipcRenderer } = require('electron');
const { messages } = require('../common/consts');
const { CHECKOUT_TIMER_HOSTNAMES } = require('@/common/consts');

const SELECTORS = '[data-tid="timer"] > span, #timer-indicator, .page-timer, .sc-owyayy-1 .bfpvHY, .sc-pTUKB .dNBfFK';

function setTabTimer() {
  const timer = document.querySelector(SELECTORS);
  if (!timer) return;
  ipcRenderer.sendToHost(messages.SET_TAB_TIMER, timer.textContent.replace(/[A-Za-z\s]/g, ''));
}

const timerHostnamesSet = new Set(CHECKOUT_TIMER_HOSTNAMES);

if (process.isMainFrame && timerHostnamesSet.has(location.hostname)) {
  // window.addEventListener('DOMContentLoaded', () => {
  //   setTabTimer();
  //   setInterval(() => setTabTimer(), 1000);
  // });
}

