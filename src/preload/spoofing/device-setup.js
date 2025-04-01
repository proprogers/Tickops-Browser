const deviceMap = {
    windows: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/130.0.6723.152 Safari/537.36',
        platform: 'Win32',
        vendor: 'Google Inc.',
        userAgentDataPlatform: 'Windows'
    },
    macos: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/130.0.6723.152 Safari/537.36',
        platform: 'MacIntel',
        vendor: 'Apple Computer, Inc.',
        userAgentDataPlatform: 'macOS'
    },
    linux: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        platform: 'Linux x86_64',
        vendor: 'Google Inc.',
        userAgentDataPlatform: 'Linux'
    },
    ios: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/130.0.6723.152 Safari/537.36',
        platform: 'MacIntel',
        vendor: 'Apple Computer, Inc.',
        userAgentDataPlatform: 'macOS'
    },
    android: {
        userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/93.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv81',
        vendor: 'Google Inc.',
        userAgentDataPlatform: 'Android'
    }
}

module.exports = deviceMap;