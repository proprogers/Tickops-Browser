/* global window, document, location, __non_webpack_require__, localStorage, sessionStorage */
const { messages, NEW_TAB, INTEGRATIONS_KEY, RECAPCHA_KEY, PREFERENCES_KEY } = require('../common/consts');
if (location.href === NEW_TAB) {
  window.require = __non_webpack_require__;
  require('../common/v8-snapshots-util');
}
const { ipcRenderer, ipcMain, webFrame } = require('electron');
// require('../common/settings');
const Settings = require('../common/settings');
const { PORTAL_DATA_KEY } = require('../common/consts');

///2captcha
// const { Solver } = require('@2captcha/captcha-solver');


const API = require('../API');
// const FingerprintSetter = require('./spoofing/fingerprint-setter');
const { initSentry, captureErrorStatusCode } = require('./sentry');
const { injectChromeWebstoreInstallButton } = require('../common/components/chrome-store');
const { setAutoFillerSms } = require('./autofill/auto-fill-sms');

require('./events-tab-timer');
const SessionManager = require('../common/session-manager/render');

var scriptsToRun = [];
import {useState, getState as getPagesStoreState } from '../render/main-window/pages-store';
const preferences = await Settings.get(PREFERENCES_KEY);
console.log("preferences")
console.log(preferences)
// var recap = preferences.indexOf('recap') !== -1;
var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};


function getWebPreferencesInfo(type) {
  
  const string = process.argv
    .find(x => x.startsWith(type))
    .replace(type, '');
  return JSON.parse(decodeURIComponent(string));
}

const { identity, partition, paymentDataId, credentials, pageId, hash_id } = getWebPreferencesInfo('SESSION_DATA=');



async function getSession(partition, mac, refresh=false){
  return await SessionManager.get({ partition: partition }).then(async (session)=>{
    if(refresh){
      
      // alert(JSON.stringify(session));
      // await ipcRenderer.invoke(messages.TOGGLE_PROXY_LOCATION, {session:result});
      await ipcRenderer.invoke(messages.REFRESH_IP, session);
      window.location.href = window.location.href;
    } else {
     // if(window.location.host.indexOf('axs.com') !== -1){
     //  var timezone = false;
     // } else {
     // 
     // }
     // var timezone = session.timezone;
     //
     // console.log(timezone);
     //
     //  FingerprintSetter.set({ ...identity, partition, timezone:timezone, paymentDataId }, mac);
      return session;
    }
   
  });
}

if (window.location.host.indexOf('ticketmaster.') !== -1 
|| window.location.host.indexOf('livenation.') !== -1 
|| window.location.host.indexOf('evenue.') !== -1) {
  
  window.localStorage.setItem("reload", false); 

  setInterval(async()=>{

    window.localStorage.removeItem("PXGx12h0V0_px-ff");
    window.localStorage.removeItem("PXGx12h0V0_px_fp");
    window.localStorage.removeItem("PXGx12h0V0_px_hvd");

    window.localStorage.removeItem("PXTHwUJgWK_px_hvd");
    window.localStorage.removeItem("PXTHwUJgWK_px_fp");
    window.localStorage.removeItem("PXTHwUJgWK_px-ff");
    await ipcRenderer.invoke(messages.CLEAR_COOKIES_EVENUE, {partition, host:window.location.host});

    if(document.documentElement.innerHTML.indexOf("Let's Get Your Identity Verified")!==-1 || document.documentElement.innerHTML.indexOf("Complete the CAPTCHA below to get back on track and continue using our site.")!==-1 || document.documentElement.innerHTML.indexOf("Please make sure that Javascript and cookies are enabled on your browser and that you are not blocking them from loading.") !== -1){
      await ipcRenderer.invoke(messages.CLEAR_COOKIES_EVENUE, {partition, host:window.location.host});
      //
      var reload = window.localStorage.getItem("reload");
      if(reload == 'false'){
        getSession(partition, false,true);
        window.location.href = window.location.href;
        window.localStorage.setItem("reload", true);
      }
    }

    window.client_ip = 'TICKOPS TENSOR';
    window.ip = 'TICKOPS TENSOR';
    // document.getElementsByClassName("fIbCCK")[0].style.display='none';
  },3000);
}
if (window.location.host.indexOf('axs.com') !== -1) {

    document.addEventListener("click", function (e) {

    if (e.target.id == "sign_in_btn" && window.localStorage.getItem("againSign") != 1) {
      window.localStorage.setItem("againSign", 1);
      setInterval(()=>{

        if(document.getElementById("sign_in_btn") !== null && document.getElementsByClassName("show-spinner")){
          document.getElementById("sign_in_btn").click();
        }
      },2000)
    }

    if (e.target.id == "send-otp-btn" && window.localStorage.getItem("againMessage") != 1) {
      window.localStorage.setItem("againMessage", 1);
      setInterval(()=>{

        if(document.getElementById("send-otp-btn") !== null && document.getElementsByClassName("show-spinner")){
          document.getElementById("send-otp-btn").click();
        }
      },2000)
    }

    
  });

  window.localStorage.setItem("reload", false);

}


if(window.location.href == "https://tickops.com/?browser=true"){

    var data = await Settings.get(PORTAL_DATA_KEY);
    if(data!==null){
      await ipcRenderer.invoke(messages.SET_COOKIES, { partition: partition, host:".tickops.com", cookies: [{name:"auth._token.laravelJWT" ,value:"Bearer "+data.access_token, url:"https://tickops.com" },
      {name:"auth._refresh_token.laravelJWT" ,value:"true", url:"https://tickops.com" },
      {name:"auth._token_expiration.laravelJWT" ,value:"17103548982222", url:"https://tickops.com" },
      {name:"auth._refresh_token_expiration.laravelJWT" ,value:"17103548982222", url:"https://tickops.com" },
      {name:"auth.strategy" ,value:"laravelJWT", url:"https://tickops.com" }]});
      window.location.href = "https://tickops.com/proxies";
    }
   
 }


getSession(partition, false);

// require('./recaptcha');
require('./autofill/auto-fill-payment');
require('./autofill/auto-fill-passwords');
window.showNotification = (data) => ipcRenderer.sendToHost(messages.SHOW_NOTIFICATION, data);

if (location.href === NEW_TAB) {
  window.getUsage = API.getTrafficLimits;
  window.loadSession = (partition) => {
    ipcRenderer.sendToHost(messages.LOAD_SESSION, partition)
  };
  window.openLinkOpeningDialog = (data = {}) => ipcRenderer.sendToHost(messages.OPEN_LINK_OPENING_DIALOG, data);
  window.openEditSessionDialog = (session) => ipcRenderer.sendToHost(messages.OPEN_EDIT_SESSIONS_DIALOG, session);
  window.openAddSessionDialog = () => ipcRenderer.sendToHost(messages.OPEN_ADD_SESSIONS_DIALOG);
  window.showNotification = (data) => ipcRenderer.sendToHost(messages.SHOW_NOTIFICATION, data);
  window.openConfirmDeleteSessionsDialog = ({ session, checkedSessionsMap }) => {
    ipcRenderer.sendToHost(messages.OPEN_DELETE_SESSIONS_DIALOG, { session, checkedSessionsMap });
  }
} else if (credentials) {
  setAutoFillerSms(credentials);
}
