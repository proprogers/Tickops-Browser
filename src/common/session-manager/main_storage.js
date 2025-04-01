const path = require('path');
const { resolve, parse, extname } = require('path');
const { app, ipcMain,dialog, session: { fromPartition }, session } = require('electron');
const Sentry = require('@sentry/electron');
const { isDev, server } = require('@/../config');
const Settings = require('../settings');
const API = require('../../API');
const moment = require('moment-timezone');
const { spawn } = require('child_process');
const fs = require('fs');
const util = require('util');
const { parseCrx } = require('../utils/crx');
const { extractZip } = require('../utils/zip');
const { makeId } = require('../utils/string');
const crypto = require('crypto');
const statess = require('../us-states.json');

const readdir = util.promisify(fs.readdir);
const statesNameToIsoMap = new Map(statess.map(([names, {timezone, mysterium }]) => [mysterium, timezone,]));

////Macintosh; Intel Mac OS X 10_15_7
////Windows NT 10.0; Win64; x64

const {
  messages,
  CUSTOM_PROTOCOL,
  ERROR_STATUS_CODES_SET,
  IGNORE_ERRORS_URLS,
  TOKEN_KEY,
  SESSIONS_KEY,
  IMPORTANT_URLS,
  BLOCK_RESOURCE_URLS,
  IMPLIMENT_URLS,
  PROXY_PORTAL_DATA_KEY,
  PREFERENCES_KEY
} = require('../consts');
const partitionSessionDataMap = new Map();
const partitionSessionObjectMap = new Map();


class SessionManager {
  static isProxyOnGlobally = true;
  static webContents = null;

  static async get({ partition, extraPartitionId, cookies, state, state_name }) {

    const preferences = await Settings.get(PREFERENCES_KEY);
    if (preferences && preferences.indexOf('userProxy') !== -1){
      var userProxy = true;
    } else var userProxy = false;

    // partition = 'persist:s_856699957844';
    let sessionData;
    const id = process.env.userId;
    var password = getHashForProxyPassword(id)
    if (typeof partition !== 'undefined') {
      // take existing session
      sessionData = partitionSessionDataMap.get(partition);

      if (sessionData) {
        sessionData.isProxyOn = sessionData.isProxyOn ?? this.isProxyOnGlobally;
         const token = await Settings.get(TOKEN_KEY);
        if(sessionData.proxy.login.indexOf("luminati") !== -1){
          
        var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
        var state = stateIso.mysterium.replace("_", "+");
    
          sessionData.proxy.login = "type-admin-token-"+token+"-session-"+partition+"-country-us-state-"+state+"-provider-soax-israndom-false";
          sessionData.proxy.password = password; 
        } 


        if(state){
          
          sessionData.proxy.login = "type-admin-token-"+token+"-session-"+partition+"-country-us-state-"+state+"-provider-soax-israndom-false";
        
        }
        return sessionData;
      }
      // open saved one
      const savedSessions = await Settings.get(SESSIONS_KEY);
     
      const foundSession = savedSessions.find(ses => ses.partition === partition);
      sessionData = JSON.parse(JSON.stringify(foundSession));
     
       const token = await Settings.get(TOKEN_KEY);
      if(sessionData.proxy.login.indexOf("luminati") !== -1){
        
        var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
        var state = stateIso.mysterium.replace("_", "+");

        // const states = ["delaware","massachusetts","west+virginia","california","kentucky","arkansas","north+carolina","nevada", "washington","georgia","pennsylvania","rhode+island","new mexico","maine","vermont","alaska","colorado","district+of+columbia","north+dakota","minnesota","oregon","virginia","ohio","illinois","wyoming","new+york","louisiana","kansas","montana","new+hampshire","idaho","missouri","hawaii","arizona","connecticut","alabama","iowa","indiana","oklahoma","florida","south+carolina","nebraska","tennessee","maryland","mississippi","south+dakota","utah","new+jersey","michigan","wisconsin"];
        // var state = states[Math.floor(Math.random() * states.length)];
  
        sessionData.proxy.login = "type-admin-token-"+token+"-session-"+partition+"-country-us-state-"+state+"-provider-soax-israndom-false";
        sessionData.proxy.password = password;
      } 

      if(state){
        
        sessionData.proxy.login = "type-admin-token-"+token+"-session-"+partition+"-country-us-state-"+state+"-provider-soax-israndom-false";
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
      var canvasSeed =  String.fromCharCode(...arrayBuffer);

      var result = await Settings.get(PROXY_PORTAL_DATA_KEY) || [];

      if(userProxy && !result.message){

        var state = 'User Proxy';
       
        var isCustom = true;
        var array = [];
        for (var profile in result.sort()) {
                for(var i = 0; i < result[profile].proxies.length; i++){
                  array.push(result[profile].proxies[i]);
                }
        }

        const random = Math.floor(Math.random() * array.length);
        var proxy = array[random];
        var proxy =  array[random].split(":");
            if(proxy.length == 2){
              var host = proxy[0]+":"+proxy[1];
            } 
            
            if(proxy.length == 4){
              var host = proxy[2]+":"+proxy[3];
              var login = proxy[0];
              var password = proxy[1];
            };

        var timezone = null;
      } else {

        var isCustom = false;

        if(state_name){
          var timezone = statesNameToIsoMap.get(state_name);
          var state = state.replace("_", "+");
          
        } else if (state){
          var state = state;
          state = state.replace("_", "+");
          var timezone = statesNameToIsoMap.get(state);
        } else { 
          var stateIso = statess[Math.floor(Math.random() * statess.length)][1];
          var state = stateIso.mysterium.replace("_", "+");
          var timezone = stateIso.timezone;
        }

       

        var host = "proxy.tickops.com:30333";
        var login = "type-admin-token-"+token+"-session-"+persist+"-country-us-state-"+state+"-provider-soax-israndom-true";
        var password = password;
        var state = state+", US";
      }
        
        
       

        sessionData = {
          "partition": "persist:s_"+persist,
          "persist": persist,
          "proxy": {
              "isCustom": isCustom,
              "info": state,
              "address": host,
              "login": login,
              "password": password,
              "proxy_server":host,
              "customer_server": login,
              "password_server": password
          },
          "timezone": timezone,
          "identity": {
              "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              "version": "122",
              "uaFullVersion": "122.0.0.0",
              "architecture": "x86",
              "bitness": "64",
              "platformName": "MacIntel",
              "vendor": "Google Inc.",
              "languages": [
                  "en-US",
                  "en"
              ],
              "canvasSeed": canvasSeed,
              "screenResolutions": [
                  {
                      "width": 834,
                      "height": 1112
                  },
                  {
                      "width": 1024,
                      "height": 1366
                  },
                  {
                      "width": 810,
                      "height": 1080
                  },
                  {
                      "width": 1600,
                      "height": 900
                  },
                  {
                      "width": 1280,
                      "height": 1024
                  },
                  {
                      "width": 1024,
                      "height": 768
                  },
                  {
                      "width": 768,
                      "height": 1024
                  },
                  {
                      "width": 1680,
                      "height": 1050
                  },
                  {
                      "width": 1360,
                      "height": 768
                  },
                  {
                      "width": 800,
                      "height": 600
                  },
                  {
                      "width": 360,
                      "height": 640
                  },
                  {
                      "width": 2048,
                      "height": 1152
                  },
                  {
                      "width": 1366,
                      "height": 768
                  },
                  {
                      "width": 1920,
                      "height": 1080
                  },
                  {
                      "width": 1536,
                      "height": 864
                  },
                  {
                      "width": 1440,
                      "height": 900
                  },
                  {
                      "width": 1280,
                      "height": 720
                  },
                  {
                      "width": 1280,
                      "height": 800
                  },
                  {
                      "width": 1920,
                      "height": 1200
                  },
                  {
                      "width": 2560,
                      "height": 1440
                  }
              ],
              "screen": {
                  "width": 1024,
                  "height": 768
              }
          }
      };

        
        //  sessionData = await API.getNewSession({ platform, count: extraPartitionId });
        if (sessionData.proxy && sessionData.timezone) {
          sessionData.timezone = getTimezoneObject(sessionData.timezone);
        }
      } catch (e) {
        const status = e && e.status;
        switch (status) {
          case 403:
          case 503:
            sessionData = { partition: '', isProxyOn: false };
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
      }
    }
    if (!sessionData || sessionData && typeof sessionData.isProxyOn === 'undefined') {
      sessionData.isProxyOn = this.isProxyOnGlobally;
    }
    
    console.log(sessionData);
   
    await setSession({ ...sessionData, cookies, hasCookies: !!cookies });
    return sessionData;
  }

  static edit(session) {
    const openedSession = partitionSessionDataMap.get(session.partition);
    if (!openedSession) return;
    const editedSession = { ...openedSession, ...session };
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
      const spawnOptions = { detached: true, shell: false, windowsHide: true, stdio: 'ignore' };
      const cmd = spawn('wscript.exe', spawnArgs, spawnOptions);
      cmd.unref();
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
  return getHash({ string: userId, salt: "sugar" });
}

function getHash({ string, salt }) {
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

function setProtocol(session) {
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
    callback({ path: filePath });
  });
}

async function onLogin(event, webContents, authenticationResponseDetails, authInfo, callback) {
  event.preventDefault();
  const pathArray = webContents.session.getStoragePath().split(path.sep);
  const partition = `persist:${pathArray[pathArray.length - 1]}`;
  const session = await SessionManager.get({ partition });
  const { customer_server, password_server, login, password } = session.proxy || {};
  callback(encodeURIComponent(login), password);
}

async function setSession(data) {
  const { partition, identity, proxy, isProxyOn, cookies } = data;
  partitionSessionDataMap.set(partition, data);
  const session = fromPartition(partition);

  partitionSessionObjectMap.set(partition, session);
  await clearCookies(partition);
  session.cookies.on('changed', () => handleCookiesChange({ partition, session }));
  setProtocol(session);
  if (!proxy) return;

  if (cookies) {
    setCookies({ session, cookies });
  }

  if (proxy.address && isProxyOn) {
     session.setProxy({
      proxyRules: proxy.proxy_server || proxy.address,
      proxyBypassRules: server.url + IMPLIMENT_URLS
    });
  }
  // await session.clearCache();
  // await session.clearAuthCache();

  const onBeforeRequestFilter = { urls: [...BLOCK_RESOURCE_URLS.patterns] };
  session.webRequest.onBeforeRequest(onBeforeRequestFilter, ({ url }, callback) => {
    const supposeToCancelRequest = BLOCK_RESOURCE_URLS.regexps.some(curr => curr.test(url));
    if (!supposeToCancelRequest) return;
    callback({ cancel: true });
  });

  session.webRequest.onBeforeSendHeaders((details, callback) => {
   
    if(details.url.indexOf('evenue.net') !== -1  
      || details.url.indexOf('px-cloud.net') !== -1 
      || details.url.indexOf('px-cdn.net') !== -1 
      || details.url.indexOf('perimeterx.net') !== -1 
      || details.url.indexOf('pxchk.net') !== -1  
      || details.url.indexOf('px-client.net') !== -1 
      || details.url.indexOf('pxi.pub') !== -1 
      || details.url.indexOf('eps.ticketmaster.com') !== -1 ){
      details.requestHeaders['user-agent'] =  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) tickops-browser/4.1.26 Chrome/122.0.6261.70 Electron/29.1.0 Safari/537.36';
    
    }
    if(details.url.indexOf('unified') !== -1){
      details.requestHeaders['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4';
    }
    // else if(details.url.indexOf('unified') == -1) {
    //   details.requestHeaders['DNT'] = '1';
    //   details.requestHeaders['sec-ch-ua'] = ` "Chromium";v="${identity.version}", "Not)A;Brand";v="99", "Google Chrome";v="${identity.version}"`;
    //   details.requestHeaders['sec-ch-ua-mobile'] = '?0';
    //   details.requestHeaders['Sec-Ch-Ua-Platform'] = '"MacIntel"';
    //   details.requestHeaders['Cache-Control'] = 'no-cache';
     
    // }
    callback({ requestHeaders: details.requestHeaders });
  });


  session.on('will-download', async (event, item, webContents) => {
    // if (process.platform !== 'darwin') return;

    const fileName = item.getFilename();
    const { name, ext } = parse(fileName);
    let savePath = resolve(app.getPath('home') + '/extensions/', fileName);

    item.setSavePath(savePath)

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })

    item.once('done', async (event, state) => {
      if (state === 'completed') {
        if (extname(fileName) === '.crx') {
          const crxBuf = await fs.promises.readFile(item.savePath);
          const crxInfo = parseCrx(crxBuf);

          if (!crxInfo.id) {
            crxInfo.id = makeId(32);
          }

          const extensionsPath = app.getPath('home') + '/extensions/';
          const path = resolve(extensionsPath, crxInfo.id);
          const manifestPath = resolve(path, 'manifest.json');
          const res = await extractZip(crxInfo.zip, path);

          if (crxInfo.publicKey) {
            const manifest = JSON.parse(
              await fs.promises.readFile(manifestPath, 'utf8'),
            );
            manifest.key = crxInfo.publicKey.toString('base64');
            await fs.promises.writeFile(
              manifestPath,
              JSON.stringify(manifest, null, 2),
            );

          }
          await fs.unlinkSync(savePath);

          // await dialog.showMessageBox({
          //   type: 'question',
          //   buttons: ['Continue', 'Quit'],
          //   title: 'TickOps Browser',
          //   cancelId: 1,
          //   message: JSON.stringify(path)
          // });

          await session.loadExtension(path);
          await session.defaultSession.loadExtension(path);
          // loadExtensions();
        }
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })

  // await dialog.showMessageBox({
  //   type: 'question',
  //   buttons: ['Continue', 'Quit'],
  //   title: 'TickOps Browser',
  //   cancelId: 1,
  //   message: JSON.stringify(session)
  // });

  // loadExtensions(partition);
  
   
  
}

async function handleCookiesChange({ partition, session }) {
  const info = partitionSessionDataMap.get(partition);
  const cookies = await session.cookies.get({});
  if (cookies.length && info.hasCookies || !cookies.length && !info.hasCookies) return;
  partitionSessionDataMap.set(partition, { ...info, hasCookies: !!cookies.length });
  SessionManager.webContents?.send(messages.HAS_COOKIES_CHANGED, partition, !!cookies.length);
}



async function loadExtensions(partition) {
  // if (process.platform !== 'darwin') return;

  const context = fromPartition(partition);


  const extensionsPath = app.getPath('home') + '/extensions/';
  const dirs = await fs.promises.readdir(extensionsPath);

  for (var dir of dirs) {
    try {
      var path = resolve(extensionsPath, dir);
      var extension = await context.loadExtension(path);
    } catch (e) {
      console.error(e);
    }
  }
}

async function editProxy({ proxy, partition }) {
  const { updated: [session] } = await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
    value: { proxy },
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

async function refreshIp({ proxy, partition }) {
  const session = partitionSessionDataMap.get(partition);
  const newLogin = await API.refreshIp({ sessionLogin: proxy.login, partition });
  console.log("NewLogin: " + newLogin.toString());
  session.proxy.login = newLogin;
  partitionSessionDataMap.set(partition, session);
  await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
    value: { proxy: { ...proxy, login: newLogin } },
    findIndexFunc: (curr) => curr.partition === partition
  }]);
  const ses = partitionSessionObjectMap.get(partition);
  await ses.clearAuthCache();
  await ses.clearCache();
  return newLogin;
}

async function toggleProxyLocation({ session, state }) {
  const token = await Settings.get(TOKEN_KEY);
  const partition = session.partition;
  const proxy = session.proxy;
  var session = partitionSessionDataMap.get(partition);
  var persist =  partition.replace("persist:", "");
  const newLogin = "type-admin-token-"+token+"-session-"+persist+"-country-us-state-"+state+"-provider-soax-israndom-true";
  session.proxy.login = newLogin;
  session.proxy.timezone = getTimezoneObject(timezone);
  var timezone = statesNameToIsoMap.get(state);
  session.timezone = getTimezoneObject(timezone);

  //  await dialog.showMessageBox({
  //           type: 'question',
  //           buttons: ['Continue', 'Quit'],
  //           title: 'TickOps Browser',
  //           cancelId: 1,
  //           message: JSON.stringify(session.timezone)
  //         });

  partitionSessionDataMap.set(partition, session);
  await Settings.findAndUpdateArrayItems(SESSIONS_KEY, [{
    value: { proxy: { ...proxy, login: newLogin }, timezone:session.timezone },
    findIndexFunc: (curr) => curr.partition === partition
  }]);
  console.log(session);
  const ses = partitionSessionObjectMap.get(partition);
  // await ses.clearAuthCache();
  // await ses.clearCache();
  return {login:newLogin, timezone:session.timezone};
}

async function toggleProxy({ partition, session, enable }) {
  const sessionData = partitionSessionDataMap.get(partition);
  const config = enable ? {
    proxyRules: sessionData.proxy.proxy_server || sessionData.proxy.address,
    proxyBypassRules: server.url + IMPLIMENT_URLS
  } : { proxyRules: null };

  await session.setProxy(config);
  // await session.clearCache();
  // await session.clearAuthCache();

  partitionSessionDataMap.set(partition, { ...sessionData, isProxyOn: enable });
}

async function toggleProxyInSession(partition) {
  const session = partitionSessionObjectMap.get(partition);
  const isDisabled = (await session.resolveProxy('https://example.com')) === 'DIRECT';
  await toggleProxy({ partition, session, enable: isDisabled });
}

async function toggleProxyGlobally() {
  const newValue = !SessionManager.isProxyOnGlobally;
  SessionManager.isProxyOnGlobally = newValue;
  for (const [partition, session] of [...partitionSessionObjectMap]) {
    await toggleProxy({ partition, session, enable: newValue });
  }
  return newValue;
}

async function clearCookies(partition) {
  await partitionSessionObjectMap.get(partition).clearStorageData({ storages: ['cookies', 'cachestorage', 'localstorage', 'appcache'] });
}

async function setCookies({ session, cookies }) {
  for (const { url, name, value } of cookies) {
    await session.cookies.set({ url, name, value });
  }
}

async function clearCookiesEvenue({partition, host}) {
  // const cookie = { url: 'https://wellsfargocenter.evenue.net', name: 'dummy_name', value: 'dummy' }
  // PXTHwUJgWK_px_fp
  await partitionSessionObjectMap.get(partition).cookies.remove("https://"+host, '_px2');
  await partitionSessionObjectMap.get(partition).cookies.remove("https://"+host, '_pxhd');
  await partitionSessionObjectMap.get(partition).cookies.remove("https://"+host, 'pxcts');
  await partitionSessionObjectMap.get(partition).cookies.remove("https://"+host, '_pxvid');
  await partitionSessionObjectMap.get(partition).cookies.remove("https://"+host, 'BIGipServerpx_client_pool');
  
  // await partitionSessionObjectMap.get(partition).clearStorageData({ storages: ['cookies', 'localstorage'] });
  
}


async function getSessionAndSetCookies({ partition, cookies }) {
  const session = await partitionSessionObjectMap.get(partition);
  await setCookies({ session, cookies });
}

function captureErrorStatusCode({ url, statusCode, partition, identity, timezone, proxy }) {
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
  const exceptionDetails = { statusCode, sessionInfo };
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