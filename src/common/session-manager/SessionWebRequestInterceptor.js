const {BLOCK_RESOURCE_URLS,} = require('../consts');

class SessionWebRequestInterceptor {
    /**
     * @param {Electron.Session} session - The Electron session on which to set interceptors
     */
    constructor(session) {
        this.session = session;
        this.blockResourceUrls = BLOCK_RESOURCE_URLS;
        this.requiredClientHints = [];
    }

    configure() {
        this.setupOnBeforeRequest();
        this.setupOnHeadersReceived();
        this.setupOnBeforeSendHeadersPrimary();
    }

    setupOnBeforeRequest() {
        const onBeforeRequestFilter = {urls: [...this.blockResourceUrls.patterns]};
        this.session.webRequest.onBeforeRequest(onBeforeRequestFilter, ({url}, callback) => {
            const supposeToCancelRequest = this.blockResourceUrls.regexps.some(curr => curr.test(url));
            if (!supposeToCancelRequest) return;
            callback({cancel: true});
        });
    }

    setupOnHeadersReceived() {
        this.session.webRequest.onHeadersReceived((details, callback) => {
            const headers = details.responseHeaders;
            const acceptChHeader = headers['accept-ch'] || headers['Accept-CH'];
            if (acceptChHeader) {
                this.requiredClientHints.length = 0;
                const splitted = acceptChHeader[0].split(',').map((h) => h.trim());
                this.requiredClientHints.push(...splitted);
            }
            callback({responseHeaders: headers});
        });
    }

    setupOnBeforeSendHeadersPrimary() {
        this.session.webRequest.onBeforeSendHeaders((details, callback) => {
            if (details.webContents) {
                const agent = `${details.webContents.getUserAgent().split(' ').map((x) => {
                    if (x.toLowerCase().startsWith('electron')) {
                        return null;
                    }

                    if (x.toLowerCase().startsWith('tickops')) {
                        return null;
                    }

                    return x;
                }).filter((x) => x).join(' ')}`;

                details.requestHeaders['user-agent'] = agent;
            }

            callback({cancel: false, requestHeaders: details.requestHeaders});
        });
    }
}

module.exports = SessionWebRequestInterceptor;