const {net} = require('electron');

class SessionProxyDeviceChecker {
    /**
     * @param {Electron.Session} session - The Electron session on which to set interceptors
     * @param {{login: string, password: string}} proxy - Proxy credentials.
     */
    constructor(session, proxy) {
        this.session = session;
        this.proxy = proxy;
    }

    /**
     * Sends an HTTP request using the specified Electron session and returns the response body.
     * @returns {Promise<string>} Resolves with the response body as a string.
     */
    async checkProxyDevice() {
        return new Promise((resolve, reject) => {
            const request = net.request({
                url: "https://tfp.squidyproxy.com/classify?detail=1",
                session: this.session
            });

            request.on('login', (authInfo, callback) => {
                console.log(`authInfo: ${JSON.stringify(authInfo)}`);
                if (authInfo.isProxy) {
                    console.log(`this.proxy: ${JSON.stringify(this.proxy)}`);
                    callback(this.proxy?.login, this.proxy?.password);
                }
            });

            let responseBody = '';
            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    responseBody += chunk.toString();
                });
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        try {
                            const parsedResponse = JSON.parse(responseBody);
                            const osHighestClass = parsedResponse.details?.os_highest_class;
                            resolve(osHighestClass);
                        } catch (error) {
                            reject(new Error(`Failed to parse response JSON: ${error.message}`));
                        }
                    } else {
                        reject(
                            new Error(`HTTP Error: ${response.statusCode}, Body: ${responseBody}`)
                        );
                    }
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.end();
        });
    }
}

module.exports = SessionProxyDeviceChecker;