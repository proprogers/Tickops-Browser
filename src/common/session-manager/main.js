const path = require('path');
const {resolve, parse, extname} = require('path');
const {app, ipcMain, dialog, session: {fromPartition}, session} = require('electron');
const Sentry = require('@sentry/electron');
const {isDev, server} = require('@/../config');
const Settings = require('../settings');
const API = require('../../API');
const moment = require('moment-timezone');
const {spawn} = require('child_process');
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const statess = require('../us-states.json');
const logFilePath = path.join(app.getPath('userData'), 'request_logs.txt');

const {
    screenResolutions
} = require('../identities.json');
const readdir = util.promisify(fs.readdir);
const statesNameToIsoMap = new Map(statess.map(([names, {timezone, mysterium}]) => [mysterium, timezone,]));
let requiredClientHints = [];

////Windows NT 10.0; Win64; x64
////Windows NT 10.0; Win64; x64

const {
    messages,
    CUSTOM_PROTOCOL,
    TOKEN_KEY,
    SESSIONS_KEY,
    IMPORTANT_URLS,
    BLOCK_RESOURCE_URLS,
    IMPLIMENT_URLS,
    PROXY_PORTAL_DATA_KEY,
    PREFERENCES_KEY
} = require('../consts');
const consts = require("@/common/consts");
const SessionWebRequestInterceptor = require("@/common/session-manager/SessionWebRequestInterceptor");
const partitionSessionDataMap = new Map();
const partitionSessionObjectMap = new Map();


class SessionManager {
    static isProxyOnGlobally = true;
    static webContents = null;

    static async get({partition, extraPartitionId, cookies, state, state_name}) {
        let sessionData;
        let sessionProxy;
        let customSessionProxy;
        let isCustom = false;
        let password = getHashForProxyPassword(process.env.userId);
        const preferences = await Settings.get(PREFERENCES_KEY);
        const userProxy = preferences && preferences.indexOf('userProxy') !== -1;

        const userTrafficLimits = await API.getTrafficLimits();
        const isPartition = typeof partition !== 'undefined'
        const isTraffic = userTrafficLimits.limitBytes > 0

        if (isPartition && isTraffic) {
            // take existing session
            sessionData = partitionSessionDataMap.get(partition);
            if (sessionData) {
                sessionData.isProxyOn = sessionData.isProxyOn ?? SessionManager.isProxyOnGlobally;
                const token = await Settings.get(TOKEN_KEY);

                if (sessionData.proxy.login.indexOf("luminati") !== -1) {
                    var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
                    var state = stateIso.mysterium.replace("_", "+");
                    sessionData.proxy.login = "type-admin-token-" + token + "-session-" + partition + "-country-us-state-" + state;
                    sessionData.proxy.password = password;
                }
                if (state) {
                    sessionData.proxy.login = "type-admin-token-" + token + "-session-" + partition + "-country-us-state-" + state;
                }
                return sessionData;
            }
            // open saved one
            const savedSessions = await Settings.get(SESSIONS_KEY);
            const foundSession = savedSessions.find(ses => ses.partition === partition);
            sessionData = JSON.parse(JSON.stringify(foundSession));

            const token = await Settings.get(TOKEN_KEY);
            if (sessionData.proxy.login.indexOf("luminati") !== -1) {
                var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
                var state = stateIso.mysterium.replace("_", "+");
                sessionData.proxy.login = "type-admin-token-" + token + "-session-" + partition + "-country-us-state-" + state;
                sessionData.proxy.password = password;
            }
            if (state) {
                sessionData.proxy.login = "type-admin-token-" + token + "-session-" + partition + "-country-us-state-" + state;
                sessionData.proxy.password = password;
            }
            if (sessionData.timezone) {
                sessionData.timezone = getTimezoneObject(sessionData.timezone);
            }
        } else {
            // or make a new one
            const platform = process.platform === 'darwin' ? 'MacIntel' : 'Win32';
            const token = await Settings.get(TOKEN_KEY);
            try {
                var persist = Math.floor(Math.random() * 9999999999999);

                const arrayBuffer = crypto.randomBytes(128);
                var canvasSeed = String.fromCharCode(...arrayBuffer);

                var result = await Settings.get(PROXY_PORTAL_DATA_KEY) || [];


                if (userProxy && !result.message) {
                    var state = 'User Proxy';

                    isCustom = true;
                    const array = [];
                    for (let profile in result.sort()) {
                        for (let i = 0; i < result[profile].proxies.length; i++) {
                            array.push(result[profile].proxies[i]);
                        }
                    }

                    const random = Math.floor(Math.random() * array.length);
                    const customProxy = array[random].split(":");
                    if (customProxy.length === 2) {
                        var host = customProxy[0] + ":" + customProxy[1];
                    }

                    if (customProxy.length === 4) {
                        var host = customProxy[0] + ":" + customProxy[1];
                        var login = customProxy[2];
                        password = customProxy[3];
                    }

                    var timezone = null;

                    customSessionProxy = {
                        "isCustom": isCustom,
                        "info": state,
                        "address": host,
                        "login": login,
                        "password": password,
                        "proxy_server": host,
                        "customer_server": login,
                        "password_server": password
                    };
                } else {
                    isCustom = false;

                    if (state_name) {
                        var timezone = statesNameToIsoMap.get(state_name);
                        var state = state.replace("_", "+");

                    } else if (state) {
                        var state = state;
                        state = state.replace("_", "+");
                        var timezone = statesNameToIsoMap.get(state);
                    } else {
                        var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
                        var state = stateIso.mysterium.replace("_", "+");
                        var timezone = stateIso.timezone;
                    }

                    // var host = "35.239.151.26:30710";
                    var host = "stage.proxy.browser.tickops.com:30710";
                    // var host = "proxy.tickops.com:30333";
                    // var host = "192.168.100.53:8000"; //for test local windows
                    // var host = "localhost:8000";

                    var login = "type-admin-token-" + token + "-session-" + persist + "-country-us-state-" + state;
                    password = password;
                    var state = state + ", US";

                    SessionManager.isProxyOnGlobally = true;
                    sessionProxy = {
                        "isCustom": isCustom,
                        "info": state,
                        "address": host,
                        "login": login,
                        "password": password,
                        "proxy_server": host,
                        "customer_server": login,
                        "password_server": password,
                        "proxy_device": ""
                    };
                }
                const screenResolutionsFiltered = SessionManager.filterDatasetByAttrs(screenResolutions, {os: "mac"});

                sessionData = {
                    "partition": "persist:s_" + persist,
                    "persist": persist,
                    "proxy": sessionProxy,
                    "timezone": timezone,
                    "identity": {
                        "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.152 Safari/537.36",
                        "version": "130",
                        "uaFullVersion": "130.0.0.0",
                        "architecture": "x86",
                        "bitness": "64",
                        "platformName": "Windows",
                        "vendor": "Google Inc.",
                        "languages": [
                            "en-US",
                            "en"
                        ],
                        "browser": "chrome",
                        "devices": [
                            {
                                "deviceId": "",
                                "groupId": "",
                                "kind": "audioinput",
                                "label": ""
                            },
                            {
                                "deviceId": "",
                                "groupId": "",
                                "kind": "videoinput",
                                "label": ""
                            },
                            {
                                "deviceId": "",
                                "groupId": "",
                                "kind": "audiooutput",
                                "label": ""
                            }
                        ],
                        "canvasSeed": canvasSeed,
                        "screenResolutions": screenResolutionsFiltered,
                        "screen": SessionManager.getRandomValue(screenResolutionsFiltered)
                    }
                };
                if (sessionData.proxy && sessionData.timezone) {
                    sessionData.timezone = getTimezoneObject(sessionData.timezone);
                }

            } catch (e) {
                const status = e && e.status;
                switch (status) {
                    case 403:
                    case 503:
                        sessionData = {partition: '', isProxyOn: false};
                        break;
                    default:
                        return {
                            error: {
                                message: e.message,
                                status: e.status,
                                statusText: e.statusText
                            }
                        };
                }
                console.log(`Error: ${e.message}`);
            }
        }
        if (!sessionData || sessionData && typeof sessionData.isProxyOn === 'undefined') {
            sessionData.isProxyOn = SessionManager.isProxyOnGlobally;
        }

        if (customSessionProxy) {
            sessionData.proxy = customSessionProxy
        } else if (!isTraffic) {
            await disableProxyInSession(partition)
        }

        console.log(`sessionData.proxy: ${JSON.stringify(sessionData.proxy)}`);
        await setSession({...sessionData, cookies, hasCookies: !!cookies});
        return sessionData;
    }

    static getRandomValue(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static filterDatasetByAttrs(dataset, filters) {
        return dataset.filter(item => {
            const {attrs} = item;
            return Object.keys(filters).every(filterKey => {
                const attrValue = attrs[filterKey];
                const filterValue = filters[filterKey];

                if (Array.isArray(attrValue)) {
                    return attrValue.indexOf(filterValue) !== -1;
                }

                return attrValue === filterValue;
            });
        }).map(item => item.value);
    }

    static edit(session) {
        const openedSession = partitionSessionDataMap.get(session.partition);
        if (!openedSession) return;
        const editedSession = {...openedSession, ...session};
        partitionSessionDataMap.set(session.partition, editedSession);
    }

    static async removeUnsavedSessions() {
        const partitionsPath = path.join(app.getPath('userData'), 'Partitions\\');
        const savedSessions = await Settings.get(SESSIONS_KEY) || [];

        try {
            const partitionDirNames = await readdir(partitionsPath);
            let dirsToDelete = [];
            partitionDirNames.forEach((dirName) => {
                const isSaved = savedSessions.find((ses) => {
                    return !ses || ses.partition === 'persist:' + dirName;
                });
                if (!isSaved) dirsToDelete.push(dirName);
            });
            if (!dirsToDelete.length) return;
            const spawnArgs = ['rmDirs.vbs', 'rmDirs.bat', process.pid, partitionsPath, ...dirsToDelete];
            const spawnOptions = {detached: true, shell: false, windowsHide: true, stdio: 'ignore'};
            //   const cmd = spawn('wscript.exe', spawnArgs, spawnOptions);
            //   cmd.unref();
        } catch (e) {
            console.error(e);
        }
    }

    static onDidAttachWebview(event, webContents) {
        webContents.on('will-prevent-unload', async (event) => {
            event.preventDefault();
        });
    }

    static setRenderWebContents(wc) {
        this.webContents = wc;
    }
}

ipcMain.handle(messages.SESSION_GET, (e, data) => SessionManager.get(data));
ipcMain.handle(messages.SESSION_EDIT, (e, session) => SessionManager.edit(session));
ipcMain.handle(messages.REMOVE_PAGES_FROM_CACHE, onRemovePagesFromCache);
ipcMain.handle(messages.REFRESH_IP, async (e, session) => refreshIp(session));
ipcMain.handle(messages.EDIT_PROXY, async (e, session) => editProxy(session));
ipcMain.handle(messages.CLEAR_COOKIES, async (e, partition) => clearCookies(partition));
ipcMain.handle(messages.TOGGLE_PROXY_LOCATION, async (e, data) => toggleProxyLocation(data));
ipcMain.handle(messages.CLEAR_COOKIES_EVENUE, async (e, data) => clearCookiesEvenue(data));
ipcMain.handle(messages.TOGGLE_PROXY_IN_SESSION, async (e, partition) => toggleProxyInSession(partition));
ipcMain.handle(messages.TOGGLE_PROXY_GLOBALLY, toggleProxyGlobally);
ipcMain.handle(messages.SET_COOKIES, (e, data) => getSessionAndSetCookies(data));

app.on('login', onLogin);

function getHashForProxyPassword(userId) {
    return getHash({string: userId, salt: "sugar"});
}

function getHash({string, salt}) {
    return crypto.createHash('sha256')
        .update(string + salt)
        .digest('hex');
}

function onRemovePagesFromCache(event, tabs = []) {
    tabs.forEach(async (partition) => {
        await clearCookies(partition);
        partitionSessionDataMap.delete(partition);
        partitionSessionObjectMap.delete(partition);
    });
}

async function setProtocol(session) {
    return session.protocol.registerFileProtocol(CUSTOM_PROTOCOL, (request, callback) => {
        let url = request.url.substring(CUSTOM_PROTOCOL.length + 3);
        url = url.includes('.')
            ? url
            : (url.includes('#') ? url.split('#')[0] : url) + '.html';
        if (url.endsWith('.map')) {
            const urlParts = url.split('/');
            urlParts.splice(-2, 1);
            url = urlParts.join('/');
        }
        const filePath = path.normalize(`${__dirname}/${url}`);
        callback({path: filePath});
    });
}

async function onLogin(event, webContents, authenticationResponseDetails, authInfo, callback) {
    event.preventDefault();
    const pathArray = webContents.session.getStoragePath().split(path.sep);
    const partition = `persist:${pathArray[pathArray.length - 1]}`;
    const session = await SessionManager.get({partition});
    const {customer_server, password_server, login, password} = session.proxy || {};
    callback(encodeURIComponent(login), password);
}

async function setSession(data) {
    const {partition, identity, proxy, isProxyOn, cookies} = data;
    partitionSessionDataMap.set(partition, data);
    const session = fromPartition(partition);
    partitionSessionObjectMap.set(partition, session);
    await clearCookies(partition);
    session.cookies.on('changed', () => handleCookiesChange({partition, session}));
    await setProtocol(session);
    if (!proxy) return;

    if (cookies) {
        await setCookies({session, cookies});
    }

    if (proxy.address && isProxyOn) {
        await session.setProxy({
            proxyRules: proxy.proxy_server || proxy.address,
            proxyBypassRules: server.url + IMPLIMENT_URLS
        })
    } else {
        await session.closeAllConnections()
        await session.setProxy({proxyRules: null});
    }

    await session.clearCache();
    await session.clearAuthCache();


    const sessionWebRequestInterceptor = new SessionWebRequestInterceptor(session);
    sessionWebRequestInterceptor.configure()
}

async function loadExtensions(session) {
    const context = session;
    const extensionsPath = path.join(process.resourcesPath, 'extensions');
    const dirs = await fs.promises.readdir(extensionsPath);

    for (const dir of dirs) {
        try {
            const path = resolve(extensionsPath, dir);
            const extension = await context.loadExtension(path, {allowFileAccess: true});
        } catch (e) {
            console.error(e);
        }
    }
}

async function handleCookiesChange({partition, session}) {
    const info = partitionSessionDataMap.get(partition);
    const cookies = await session.cookies.get({});
    if (cookies.length && info.hasCookies || !cookies.length && !info.hasCookies) return;
    partitionSessionDataMap.set(partition, {...info, hasCookies: !!cookies.length});
    SessionManager.webContents?.send(messages.HAS_COOKIES_CHANGED, partition, !!cookies.length);
}

async function editProxy({proxy, partition}) {
    const {updated: [session]} = await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
        value: {proxy},
        findIndexFunc: (curr) => curr.partition === partition
    }]);
    const sessionData = partitionSessionDataMap.get(partition);
    if (!sessionData) return;
    partitionSessionDataMap.set(partition, session);
    const ses = partitionSessionObjectMap.get(partition);
    await ses.setProxy({
        proxyRules: proxy.proxy_server || proxy.address,
        proxyBypassRules: server.url + IMPLIMENT_URLS
    });
    await ses.clearAuthCache();
    await ses.clearCache();
}

async function refreshIp({proxy, partition}) {
    const session = partitionSessionDataMap.get(partition);
    const refreshIpData = {sessionLogin: session.proxy.login, partition}
    const newLogin = await API.refreshIp(refreshIpData);
    session.proxy.login = newLogin;
    partitionSessionDataMap.set(partition, session);
    await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
        value: {proxy: {...proxy, login: newLogin}},
        findIndexFunc: (curr) => curr.partition === partition
    }]);
    const ses = partitionSessionObjectMap.get(partition);
    await ses.clearAuthCache();
    await ses.clearCache();
    return newLogin;
}

async function toggleProxyLocation({session, state}) {
    const token = await Settings.get(TOKEN_KEY);
    const partition = session.partition;
    const proxy = session.proxy;
    var session = partitionSessionDataMap.get(partition);
    var persist = partition.replace("persist:", "");
    const newLogin = "type-admin-token-" + token + "-session-" + persist + "-country-us-state-" + state;
    session.proxy.login = newLogin;
    session.proxy.timezone = getTimezoneObject(timezone);
    var timezone = statesNameToIsoMap.get(state);
    session.timezone = getTimezoneObject(timezone);
    partitionSessionDataMap.set(partition, session);
    await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
        value: {proxy: {...proxy, login: newLogin}, timezone: session.timezone},
        findIndexFunc: (curr) => curr.partition === partition
    }]);
    console.log(session);
    const ses = partitionSessionObjectMap.get(partition);
    await ses.clearAuthCache();
    await ses.clearCache();
    return {login: newLogin, timezone: session.timezone};
}

async function toggleProxy({partition, session, enable}) {
    const sessionData = partitionSessionDataMap.get(partition);
    const config = enable ? {
        proxyRules: sessionData.proxy.proxy_server || sessionData.proxy.address,
        proxyBypassRules: server.url + IMPLIMENT_URLS
    } : {proxyRules: null};

    await session.setProxy(config);
    // await session.clearCache();
    // await session.clearAuthCache();

    partitionSessionDataMap.set(partition, {...sessionData, isProxyOn: enable});
}

async function toggleProxyInSession(partition) {
    const session = partitionSessionObjectMap.get(partition);
    const isDisabled = (await session.resolveProxy('https://example.com')) === 'DIRECT';
    await toggleProxy({partition, session, enable: isDisabled});
}

async function disableProxyInSession(partition) {
    if (typeof partition === 'undefined') return;
    const session = partitionSessionObjectMap.get(partition);
    await toggleProxy({partition, session, enable: false});
}

async function toggleProxyGlobally() {
    const newValue = !SessionManager.isProxyOnGlobally;
    SessionManager.isProxyOnGlobally = newValue;
    for (const [partition, session] of [...partitionSessionObjectMap]) {
        await toggleProxy({partition, session, enable: newValue});
    }
    return newValue;
}

async function clearCookies(partition) {
    await partitionSessionObjectMap.get(partition).clearStorageData({storages: ['cookies', 'cachestorage', 'localstorage', 'appcache']});
}

async function setCookies({session, cookies}) {
    for (const {url, name, value} of cookies) {
        await session.cookies.set({url, name, value});
    }
}

async function clearCookiesEvenue({partition, host}) {

    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, '_px2');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, 'px2');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, '_pxhd');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, 'pxhd');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, '_pxcts');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, 'pxcts');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, '_pxvid');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, 'pxvid');
    await partitionSessionObjectMap.get(partition).cookies.remove("https://" + host, '__pxvid');

}


async function getSessionAndSetCookies({partition, cookies}) {
    const session = await partitionSessionObjectMap.get(partition);
    await setCookies({session, cookies});
}

function captureErrorStatusCode({url, statusCode, partition, identity, timezone, proxy}) {
    const formatFormats = (array) => array.map(item => `${item.format}-${item.value}`).join(',').replace(/\s/g, '');
    const sessionInfo = {
        partition,
        ...identity,
        languages: identity.languages.join(),
        proxyLogin: proxy.login,
        timezone: timezone && `${timezone.name}-${timezone.value}`,
        plugins: identity.plugins.map(plugin => plugin.name).join(),
        audioFormats: formatFormats(identity.audioFormats),
        videoFormats: formatFormats(identity.videoFormats),
    };
    const exceptionDetails = {statusCode, sessionInfo};
    if (isDev) {
        console.error('exceptionDetails:', exceptionDetails);
        return;
    }
    Sentry.captureException(exceptionDetails, (scope) => {
        scope.setTag('url', url);
        return scope;
    });
}

function getTimezoneObject(timezone) {
    // NOTE: POSIX compatibility requires that the offsets are inverted
    return {
        value: -moment.tz(timezone).utcOffset(),
        name: timezone
    };
}

module.exports = SessionManager;