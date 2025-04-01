const path = require('path');
const {resolve, parse, extname} = require('path');
const os = require('os');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const {
    app,
    ipcMain,
    net,
    dialog,
    Notification,
    screen,
    globalShortcut,
    session,
    webContents,
    nativeTheme
} = require('electron');
const WindowLoader = require('./window-loader');
const SessionManager = require('@/common/session-manager/main');
const Menu = require('./menu');
const consts = require('../common/consts');
const {isDev, sentry: {dsn}, remoteDebuggingPort, intervals} = require('@/../config');
const Settings = require('../common/settings');
const API = require('../API');
const TICKOPS = require('../API/tickops');
const {autoUpdater} = require('electron-updater');
const Sentry = require('@sentry/electron');
const {getHash, getDoubleHash} = require('@/common/encryption-manager');
const {setWs} = require('./web-socket-manager');

let tabs = 1;
let urls = '';
let email = '';
let state = '';
let mainWindow;
let start = 1;
let log = [];
let _contents;


Sentry.init({ dsn });


// for puppeteer
app.commandLine.appendSwitch('remote-debugging-port', remoteDebuggingPort);
app.commandLine.appendSwitch('--force_high_performance_gpu');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-popup-blocking');

app.setAsDefaultProtocolClient('tickops');

app.disableHardwareAcceleration();

if (isDev) process.traceProcessWarnings = true;

app.on('ready', onReady);
app.on('window-all-closed', onWindowAllClosed);


app.whenReady().then(async () => {


    globalShortcut.register('CommandOrControl+1', () => {
        console.log('Electron loves global shortcuts!')
    })

    const argv = process.argv

    if (argv[argv.length - 1].indexOf("url") !== -1) {

        var url = argv[argv.length-1];

        const data = getDeepLink(url)
        urls = data.url;
        tabs = data.tabs;
        email = data.email;
        state = data.state;
        // openDeepLink(webcontents[i]);
    }

});

app.on('web-contents-created', async (event, wc) => {


    wc.setWindowOpenHandler((handler) => {


        if (handler.disposition === 'background-tab') {
            // await dialog.showMessageBox({
            //   type: 'question',
            //   buttons: ['Continue', 'Quit'],
            //   title: 'TickOps Browser',
            //   cancelId: 1,
            //   message: JSON.stringify(handler.url)
            // });

            // wc.send('open-link', { session:null, location: handler.url, tabsNumber:1 });
            // this._contents.send('open-link', { session:null, location: handler.url, tabsNumber:1 });
            mainWindow.webContents.send('open-link', {session: null, location: handler.url, tabsNumber: 1});
            return {action: "deny"};
            // return {action : "deny"};
        } else {
            return {action: "allow"};
        }
    });
});


const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock) {
    app.on('second-instance', async (e, argv) => {

        if (process.platform == 'win32') {

            var url = argv[argv.length-1];

            var webcontents = webContents.getAllWebContents();
            for(var i = 0; i < webcontents.length; i++){

                const data = getDeepLink(url)
                urls = data.url;
                tabs = data.tabs;
                email = data.email;
                state = data.state;
                openDeepLink(webcontents[i]);
            }


        } else {

            app.on('open-url',  async (event, url) => {
                event.preventDefault();

                const data = getDeepLink(url);

                urls = data.url;
                tabs = data.tabs;
                email = data.email;
                state = data.state;
            })

        }
    })
} else {
    app.quit()
}
app.on('open-url', async (event, url) => {
    event.preventDefault()

    if (start) {
        const data = getDeepLink(url)
        urls = data.url;
        tabs = data.tabs;
        email = data.email;
        state = data.state;
    } else {

        var webcontents = webContents.getAllWebContents();
        for(var i = 0; i < webcontents.length; i++){

            const data = getDeepLink(url)
            urls = data.url;
            tabs = data.tabs;
            email = data.email;
            state = data.state;

            openDeepLink(webcontents[i]);
        }
        // tabs = 1;
        // urls = '';
        // email = '';
        // state = '';
        // start = 0;
    }
})

async function openDeepLink(contents){
    if(urls){
        if(email){
            const savedSessions = await Settings.get(consts.SESSIONS_KEY);
            const foundSession = savedSessions.find(ses => ses.credentials.email === email);

            var sessionData = JSON.parse(JSON.stringify(foundSession)) || null;
            if(state){
                var session = await SessionManager.get({partition:sessionData.partition, state:state});
            } else {
                var session = await SessionManager.get({partition:sessionData.partition});
            }


        } else {
            var session = null;
        }

        if(state && !email){
            var session = await SessionManager.get({state:state});
        }

        if(tabs > 10){
            tabs = 10;
        }

        if(!tabs){
            tabs = 1;
        }

        contents.send('open-link', { session:session, location: urls, tabsNumber:tabs });

    }
}

function getDeepLink(urls){
    var list = urls.split("tickops://");
    var parameters = list[1].split('&&');
    var url,state,email = '';
    var tabs = 1;
    for(var i = 0; i < parameters.length; i++){

        var parameter = parameters[i].split("=");
        if(parameter[0].indexOf("url") !== -1){

            url = '';
            if(parameter[1].indexOf("=") !== -1){
                for(var j = 1; j < parameter.length; j++){
                    if(j!=1){
                        url+='=';
                    }
                    url+=parameter[j];
                }
            } else {
                url = parameter[1];
            }

            if(url.indexOf("https//") !==-1){
                url = url.replace("https//", "https://");
            }

        }

        if(parameter[0].indexOf("tabs") !== -1){
            tabs = parameter[1];
        }

        if(parameter[0].indexOf("email") !== -1){
            email = parameter[1];
        }

        if(parameter[0].indexOf("state") !== -1){
            state = parameter[1];
        }
    }
    return {url:url, tabs:tabs, email:email, state:state};
}

async function onReady() {
    // await loadReactDevtools();
    await Settings.init();

    // require('../scenarios/auto-cart.js');

    const token = await Settings.get(consts.TOKEN_KEY);

    if (token) {
        var user = await Settings.get(consts.USER_KEY);

        if(!user){
            var user = await getUserByToken(token);
            await Settings.set(consts.USER_KEY, user);
        }

        if (user) {
            await setUser(user);
            await setApp();
            return;
        }
    }
    setAuthWindow();
}

function setAuthWindow() {
    const authWindow = openAuthWindow();

    authWindow.once('close', async (event) => {
        event.preventDefault();
        authWindow.close();
    });

    ipcMain.handle(consts.messages.AUTH_SUCCESS, async (event, data) => {
        await onSuccessAuth({ ...data, authWindow });
        ipcMain.removeHandler(consts.messages.AUTH_SUCCESS);
    });

}

async function loadReactDevtools() {
    const extDirPath =
        path.join(
            app.getPath('home'), 'Library', 'bkbbffmpnfinfgmemhpeeaidgcicbian'
        );

    const [extDirName] = await readdir(extDirPath);
    await session.defaultSession.loadExtension(path.join(extDirPath, extDirName), { allowFileAccess: true });
}

async function getUserByToken(token) {
    try {
        return await API.getUserByToken(token);
    } catch (e) {
        if (e.errno === -3008 || e.errno === -4078) {
            console.error(e.message);
            app.quit();
        } else {
            throw e;
        }
    }
}

let trafficNotification = null;

async function getTraffic() {
    try {
        const userTrafficLimits = await API.getTrafficLimits();

        if (userTrafficLimits.limitBytes === 0) {
            if (!trafficNotification) {
                trafficNotification = new Notification({
                    title: 'TickOps Browser',
                    body: 'The proxy limit has been reached. Top up your limit or contact the administrator 🙌'
                });

                trafficNotification.show();

                trafficNotification.on('close', () => {
                    trafficNotification = null;
                });
            }
        } else  {
            if (trafficNotification) {
                trafficNotification.close();
                trafficNotification = null;
            }
        }

        return userTrafficLimits;

    } catch (e) {
        if (e.errno === -3008 || e.errno === -4078) {
            console.error(e.message);
            // app.quit();
        } else {
            throw e;
        }
    }
}

async function onSuccessAuth({ token, credentials, deviceName, authWindow }) {
    if (!token) {
        const needChange = await needToChangeDevice(deviceName);
        if (!needChange) return app.quit();
        credentials.device.name = os.hostname();
        token = await API.login({ credentials, isChangeDevice: true });
    }

    await Settings.set(consts.TOKEN_KEY, token);

    const user = await API.getUserByToken(token);
    const needToSetApp = !this._user;
    await Settings.set(consts.USER_KEY, user);
    await setUser(user);

    if (needToSetApp) {
        await setApp();
    } else {
        setWs(this._contents, this._user.id);
        this._contents.once('did-attach-webview', () => this._mainWindow.show());
    }
    authWindow.close();
}

async function needToChangeDevice(deviceName) {
    const { response } = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Continue', 'Quit'],
        title: 'TickOps Browser',
        cancelId: 1,
        message: `Your account is already associated with another device (${deviceName}).\n` +
            `Clicking "Continue" will associate your account with this device and log you out on (${deviceName})`
    });

    return !response;
}

function openAuthWindow() {
    const authWindow = new WindowLoader({
        pathname: path.join(__dirname, '../build', 'new-auth-window.html'),
        additional: {
            height: 500,
            width: 640,
            minHeight: 500,
            maxHeight: 500,
            minWidth: 640,
            maxWidth: 640,
        }
    });

    ipcMain.handle('auth:navigate', async (event, rout) => {
        await authWindow.loadFile(path.join(__dirname, '../build', rout));
        return true;
    });

    return authWindow;
}

function openMainWindow(params = {}) {
    const mainWindow = new WindowLoader({
        pathname: path.join(__dirname, '../build', 'main-window.html'),
        additional: {
            minHeight: 400,
            minWidth: 600,
            show: false,
            ...params
        }
    });
    return mainWindow
}

function openMasterPasswordWindow({ parent, needToWelcome = false, mainWindowState = {} }) {
    const additional = {
        height: needToWelcome ? 360 : 170,
        width: 400,
        show: false,
        modal: true,
        parent,
    }
    if (mainWindowState.x !== undefined) {
        additional.x = Math.round(mainWindowState.x + (mainWindowState.width / 2 - additional.width / 2));
        additional.y = Math.round(mainWindowState.y + (mainWindowState.height / 2 - additional.height / 2));
    }
    return new WindowLoader({
        pathname: path.join(__dirname, '../build', `${needToWelcome ? 'create' : 'check'}-master-password-window.html`),
        additional
    });
}

async function updateSavedSessions() {
    const remoteSessions = await API.getSavedSessions();
    await Settings.set(consts.SESSIONS_KEY, remoteSessions);
}

async function getLoginPortalData(id) {
    const data = await TICKOPS.auth({id: id});
    await Settings.delete(consts.PORTAL_DATA_KEY);
    await Settings.set(consts.PORTAL_DATA_KEY, data);
}

async function getProxyPortalData(id) {
    const data =  TICKOPS.getSavedProxies({id:id});
    await Settings.set(consts.PROXY_PORTAL_DATA_KEY, data);
}


async function pullPaymentData() {
    const data = await API.getPaymentData();
    await Settings.set(consts.PAYMENT_DATA_KEY, data);
}

async function pullSitesCredentials() {
    const data = await API.getSitesCredentials();
    await Settings.set(consts.SITES_CREDENTIALS_KEY, data);
}

async function pullIntegrations() {
    const data = await API.getIntegrations();
    await Settings.set(consts.INTEGRATIONS_KEY, data);
}

function checkTimeToUpdateSaveSessions(lastTime) {
    const now = Date.now();
    if (now - lastTime >= intervals.updateSavedSessions) {
        updateSavedSessions();
        lastTime = now;
    }
    return lastTime;
}


async function setNetworkStatus(contents) {

    await updateSavedSessions();
    await pullPaymentData();
    await pullSitesCredentials();
    await pullIntegrations();
    await getProxyPortalData(this._user.id);
    await getLoginPortalData(this._user.id);

}


async function setUserData(contents) {

    const userTrafficLimits = await getTraffic();
    console.log(userTrafficLimits);
    contents.send('set-traffic', userTrafficLimits);

    setInterval(async () => {
        const userTrafficLimits = await getTraffic();
        contents.send('set-traffic', userTrafficLimits);
    }, 5000)

    if (net.isOnline()) {

        await updateSavedSessions();
        await pullPaymentData();
        await pullSitesCredentials();
        await pullIntegrations();
        await getProxyPortalData(this._user.id);
        await getLoginPortalData(this._user.id);
    } else {
        setInterval(() => {
            setNetworkStatus(contents)
        }, 5000);
    }

    contents && contents.send('set-user', {
        masterPasswordHash: this._user.masterPasswordHash,
        masterPasswordSalt: this._user.masterPasswordSalt,
        iv: this._user.iv,
        isCartingVisible: this._user.isCartingVisible,
        isAdmin: this._user.isAdmin,
    });

}

async function setUser({ isAdmin, _id, email, masterPasswordSalt, iv, masterPasswordDoubleHash, isCartingVisible }) {
    await getProxyPortalData(_id);
    await getLoginPortalData(_id);

    const needToShowMasterPasswordWindow = !!this._user;
    process.env.userId = _id;
    this._user = { id: _id, email, masterPasswordSalt, iv, masterPasswordDoubleHash, isAdmin, isCartingVisible };

    if (!needToShowMasterPasswordWindow) return;
    await setMasterPassword();
}

async function setMasterPassword() {
    this._user.masterPasswordHash = await getMasterPasswordFromLocalStorage() || await getMasterPasswordFromUserInput();
    await setUserData(this._contents);
}

async function getMasterPasswordFromLocalStorage() {

    const savedPassword = await Settings.get(consts.MASTER_PASSWORD_KEY);
    const mpDecode = this._user.mpDecode;
    if (!savedPassword && !mpDecode) return;
    const salt = this._user.masterPasswordSalt;
    if (this._user.masterPasswordDoubleHash !== getDoubleHash({data: savedPassword, salt}) &&
        this._user.masterPasswordDoubleHash !== getDoubleHash({data: mpDecode, salt})) {
        await Settings.set(consts.MASTER_PASSWORD_KEY, '');
        return;
    }
    return getHash({data: savedPassword, salt});
}

async function getMasterPasswordFromUserInput() {
    return new Promise(async (resolve, reject) => {
        const onDidAttachWebview = () => {
            masterPasswordWindow.show();
            masterPasswordWindow.focus();
        };
        this._contents.once('did-attach-webview', onDidAttachWebview);

        ipcMain.handleOnce(consts.messages.SET_MASTER_PASSWORD, async (event, password) => {
            await API.saveMPDecode(password);
            const passwordHash = getHash({ data: password, salt: this._user.masterPasswordSalt });
            await Settings.set(consts.MASTER_PASSWORD_KEY, password);
            setTimeout(() => {
                masterPasswordWindow.close();
                ipcMain.removeHandler('close-master-password-window');
            });
            resolve(passwordHash);
        });

        const masterPasswordWindow = openMasterPasswordWindow({
            parent: this._mainWindow,
            needToWelcome: !this._user.masterPasswordDoubleHash,
            mainWindowState: await Settings.get(consts.WINDOW_STATE_KEY)
        });

        const onMasterPasswordWindowClose = () => {
            this._mainWindow.focus();
            if (!this._user.masterPasswordHash) {
                this._mainWindow.close();
            }
        };
        masterPasswordWindow.once('close', onMasterPasswordWindowClose);

        ipcMain.handleOnce('close-master-password-window', () => {
            masterPasswordWindow.removeListener('close', onMasterPasswordWindowClose);
            this._contents.removeListener('did-attach-webview', onDidAttachWebview);
            masterPasswordWindow.close();
            ipcMain.removeHandler(consts.messages.SET_MASTER_PASSWORD);
        });
    });
}

async function setApp() {
    let lastTimeSavedSessionsUpdated = Date.now();
    setInterval(() => {
        lastTimeSavedSessionsUpdated = checkTimeToUpdateSaveSessions(lastTimeSavedSessionsUpdated);
    }, intervals.checkTimeToUpdateSaveSessions);

    const mainWindowState = await Settings.get(consts.WINDOW_STATE_KEY);
    const params = mainWindowState && {
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height
    };
    mainWindow = openMainWindow(params);
    this._mainWindow = mainWindow;
    nativeTheme.themeSource = 'dark';
    mainWindow.show();
    mainWindow.once('close', async (event) => {
        event.preventDefault();
        mainWindow.hide();
        const { width = 800, height = 600, x = 0, y = 0 } = mainWindow.getBounds();
        const windowState = {
            x,
            y,
            width,
            height,
            isMaximized: mainWindow.isMaximized(),
            displayBounds: screen.getPrimaryDisplay().bounds,
        };
        await Settings.set(consts.WINDOW_STATE_KEY, windowState);
        mainWindow.close();
    });

    mainWindow.once('ready-to-show', () => {
        if (process.platform === 'darwin' || mainWindowState) {
            mainWindow.show();
        }
        if (!mainWindowState || mainWindowState.isMaximized) {
            mainWindow.maximize();
        }
    });

    const contents = mainWindow.webContents;
    this._contents = contents;
    var _contents = contents;

    SessionManager.setRenderWebContents(contents);

    setWs(contents, this._user.id);

    mainWindow.on('focus', async () => {

        if(urls && start){
            if(email){
                const savedSessions = await Settings.get(consts.SESSIONS_KEY);
                const foundSession = savedSessions.find(ses => ses.credentials.email === email);

                var sessionData = JSON.parse(JSON.stringify(foundSession)) || null;
                if(state){
                    var session = await SessionManager.get({partition:sessionData.partition, state:state});
                } else {
                    var session = await SessionManager.get({partition:sessionData.partition});
                }


            } else {
                var session = null;
            }

            if (state && !email) {
                var session = await SessionManager.get({state: state});
            }
            ;

            if (tabs > 10) {
                tabs = 10;
            }

            if (!tabs) {
                tabs = 1;
            }

            contents.send('open-link', {session: session, location: urls, tabsNumber: tabs});

            tabs = 1;
            urls = '';
            email = '';
            state = '';

        }
        start = 0;
        new Menu(contents, this._user.isAdmin);
    });

    // extensions core

    setAutoUpdater();
    contents.on('will-attach-webview', (event, webPreferences) => {
        onWillAttachWebview(webPreferences);
    });

    contents.on("will-navigate", function(e, reqUrl) {
        console.log(e);
        console.log(`Popup is navigating to: ${reqUrl}`);
    });

    contents.on('did-attach-webview', SessionManager.onDidAttachWebview);
    contents.on('did-finish-load', () => setUserData(contents));
    contents.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');

    ipcMain.handle('on-browser-window-maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.handle(consts.messages.GET_USER, () => this._user);
    ipcMain.handle('on-browser-window-minimize', () => mainWindow.minimize());
    ipcMain.handle('on-browser-window-close', async () => {

        mainWindow.close();

    });

    ipcMain.handle('tickops-storage-get', async (event, keys) => {
        return keys.reduce((acc, key) => {
            acc[key] = storage.get(key) || null;
            return acc;
        }, {});
    });

    ipcMain.handle('tickops-storage-set', async (event, items) => {
        Object.entries(items).forEach(([key, value]) => storage.set(key, value));
        return true;
    });

    ipcMain.handle('tickops-storage-remove', async (event, keys) => {
        keys.forEach((key) => storage.delete(key));
        return true;
    });

    ipcMain.handle('tickops-tabs-create', async (event, options) => {
        const tabId = tabCounter++;
        tabs.set(tabId, options);
        return { id: tabId, ...options };
    });

    ipcMain.handle('tickops-tabs-query', async (event, queryInfo) => {
        return Array.from(tabs.values()).filter(tab =>
            Object.keys(queryInfo).every(key => tab[key] === queryInfo[key])
        );
    });

    ipcMain.handle('tickops-tabs-update', async (event, tabId, updateProperties) => {
        if (tabs.has(tabId)) {
            const updatedTab = { ...tabs.get(tabId), ...updateProperties };
            tabs.set(tabId, updatedTab);
            return updatedTab;
        }
        return null;
    });

    ipcMain.handle('tickops-tabs-remove', async (event, tabId) => {
        return tabs.delete(tabId);
    });

    ipcMain.handle('tickops-windows-create', async (event, createData) => {
        const windowId = windowCounter++;
        const newWindow = new BrowserWindow(createData);
        windows.set(windowId, newWindow);
        return { id: windowId, ...createData };
    });

    ipcMain.handle('tickops-windows-remove', async (event, windowId) => {
        if (windows.has(windowId)) {
            windows.get(windowId).close();
            windows.delete(windowId);
            return true;
        }
        return false;
    });

    ipcMain.handle('on-logout', async () => {

        await Settings.delete(consts.TOKEN_KEY);
        await Settings.delete(consts.USER_KEY);
        this._user = null;

        mainWindow.close();
        app.relaunch();
    });

    ipcMain.handle('create-tab', async (e, data) => {
        var session = await SessionManager.get({partition:data.partition})
        this._contents.send('open-link', { session:session, location: data.src, tabsNumber:1 });
    });

    ipcMain.handle('get-app-version', () => app.getVersion());
    ipcMain.handle('extension-register', async (e, partition) => {

        // const session = await SessionManager.get(partition);
        // extensionsRegister(session.partition);

    });

    await setMasterPassword();


    ipcMain.handle('create-window', async () => {

        ipcMain.removeHandler('on-browser-window-minimize');
        ipcMain.removeHandler('on-browser-window-close');
        ipcMain.removeHandler('get-app-version');
        ipcMain.removeHandler('on-browser-window-maximize');
        ipcMain.removeHandler('extension-register');
        ipcMain.removeHandler('on-logout');
        ipcMain.removeHandler('does-need-to-update-browser');
        ipcMain.removeHandler('on-update-browser');
        ipcMain.removeHandler('get-user');
        ipcMain.removeHandler('create-tab');
        ipcMain.removeHandler('create-window');

        await setUser(this._user);
        await setApp();
    });

}

function setAutoUpdater() {
    let needToUpdate = false;
    ipcMain.handle('does-need-to-update-browser', () => needToUpdate);
    ipcMain.handle('on-update-browser', () => autoUpdater.quitAndInstall());
    if (isDev) return;
    autoUpdater
        .on('update-downloaded', (event, releaseNotes, releaseName) => {
            showAutoUpdaterMessageBox({ releaseNotes, releaseName });
            needToUpdate = true;
            this._contents.send('need-to-update-browser');
        })
        .checkForUpdates();
}

async function showAutoUpdaterMessageBox({ releaseNotes, releaseName }) {
    this._contents.send('set-is-backdrop-shown', true);
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart now', 'Remind me in 1 hour'],
        title: 'Application Update',
        cancelId: 1,
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    const { response } = await dialog.showMessageBox(dialogOpts);
    if (response === 0) {
        autoUpdater.quitAndInstall();
    } else {
        this._contents.send('set-is-backdrop-shown', false);
        setTimeout(() => {
            showAutoUpdaterMessageBox({ releaseNotes, releaseName });
        }, 1000 * 60 * 60);
    }
}

async function onWindowAllClosed() {
    await SessionManager.removeUnsavedSessions();
    app.quit();
}

async function onWillAttachWebview(webPreferences) {
    if (!webPreferences.additionalArguments) return;
    // Extracting session from fake preload
    const session = path.basename(webPreferences.additionalArguments);
    webPreferences.preload = path.join(__dirname,"..", consts.PRELOAD_PATH);
    webPreferences.additionalArguments = ['SESSION_DATA=' + session, 'USER_DATA=' + encodeURIComponent(JSON.stringify(this._user))];
}