const { isDev, sentry: { dsn } } = require('@/../config');
const { PRELOAD_PATH } = require('../common/consts');

function captureErrorStatusCode({ error, url, statusCode, partition, identity }) {
  const formatFormats = (array) => array.map(item => `${item.format}-${item.value}`).join(',').replace(/\s/g, '');
  const sessionInfo = {
    partition,
    ...identity,
    languages: identity.languages.join(),
    timezone: identity.timezone && `${identity.timezone.name}-${identity.timezone.value}`,
    audioFormats: formatFormats(identity.audioFormats),
    videoFormats: formatFormats(identity.videoFormats),
  };
  const exceptionDetails = { statusCode, sessionInfo, error };

  if (isDev) {
    console.error(exceptionDetails);
    return;
  }

  const Sentry = require('@sentry/electron/esm/renderer');
  Sentry.captureException(exceptionDetails, (scope) => {
    scope.setTag('url', url);
    return scope;
  });
}

function initSentry(user) {
  if (isDev || !process.isMainFrame) return;
  const Sentry = require('@sentry/electron/esm/renderer');
  Sentry.init({
    dsn,
    beforeSend(event) {
      const stacktrace = event.exception.values[0].stacktrace;
      const filename = stacktrace && stacktrace.frames[0].filename;
      const isPreloadError =
        !filename
        || filename.endsWith(PRELOAD_PATH)
        || PRELOAD_PATH && filename.endsWith(PRELOAD_PATH.replace(/\//g, '\\'));
      return isPreloadError ? event : null;
    }
  });

  Sentry.setUser(user);
}

module.exports = { initSentry, captureErrorStatusCode };
