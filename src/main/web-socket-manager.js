const WebSocket = require('ws');
const { messages } = require('../common/consts');
const { intervals: { reconnectWS }, isDev } = require('@/../config');

function setWs(windowWebContents, userId) {
  const socket = new WebSocket(`ws://${isDev ? 'localhost:3000' : 'api.tickops.com:30690'}`);

  socket.on('open', () => {
    socket.send(userId);
  });

  socket.on('message', (data) => {
    if (!data) return;
    const { number, message, link, tabsNumber } = JSON.parse(data);
    if (link) {
      windowWebContents.send('open-link', { location: link, tabsNumber });
      return;
    }
    if (!number || !message) return;
    windowWebContents.send(messages.AUTO_FILL_SMS, { number, message });
  });

  socket.on('close', () => {
    setTimeout(() => setWs(windowWebContents), reconnectWS);
  });

  socket.on('error', (e) => {
    console.log('Error in ws:', e);
  });
}

module.exports = { setWs };
