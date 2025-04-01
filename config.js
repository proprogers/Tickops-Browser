const { app = {} } = require('electron');
const isPackaged = app.isPackaged || __dirname.indexOf('.asar') !== -1;
const isDev = !isPackaged && process.env.NODE_ENV !== 'production';
const isMac=false;

const minute = 1000 * 60;

module.exports = {
  maxErrorResponseCount: 1,
  server: {
    url: isDev ? 'http://localhost:3000' : 'https://stage.api.browser.tickops.com',
    tickops_url: 'https://backend.tickops.com',
    tickops_token: 'b50d9323-fc6a-4dd0-86cf-dfb6e3bac8e9'
  },
  sentry: {
    dsn: 'https://22a24806e3cc4c8c917e86f930d55169@o361133.ingest.sentry.io/3778679',
  },
  remoteDebuggingPort: '37786',
  isDev,
  intervals: {
    updateSavedSessions: minute * 60 * 24,
    checkTimeToUpdateSaveSessions: minute * 10,
    reconnectWS: 15000
  },
};
