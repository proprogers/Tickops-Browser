/* global document */
import { useEffect, useState, memo } from 'react';
import { render } from 'react-dom';
import { useStore as usePagesStore, getState as getPagesStoreState } from './pages-store';
import { useStore as useMainWindowStore, getState as getMainWindowStoreState } from './main-window-store';
import { useStore as useUserStore } from '@/common/components/user-store';
import { getState as getPaymentDataStoreState } from './dialogs/payment-data-store';
import { getState as getPasswordsStoreState } from './dialogs/passwords-store';
import { getState as getIntegrationsStoreState } from './integrations-store';
import TitleBar from './titlebar.jsx';
import LeftTabs from './left-tabs.jsx';
import NavBar from './navbar.jsx';
import Page from './page.jsx';
import Tabs from './tabs.jsx';
import Notification from '@/common/components/notification.jsx';
import BookmarksPopup from './popups/bookmarks-popup.jsx';
import Dialogs from './dialogs/dialogs.jsx';
import { messages, PORTAL_DATA_KEY, PROXY_PORTAL_DATA_KEY, PAYMENT_DATA_KEY, SESSIONS_KEY, SITES_CREDENTIALS_KEY, PREFERENCES_KEY,INTEGRATIONS_KEY} from '@/common/consts';
import API from '@/API';
import fingerprinter from 'fingerprintjs2';
import { sentry, isDev } from '@/../config';
import Settings from '@/common/settings';
import * as Sentry from '@sentry/electron';
import Backdrop from '@mui/material/Backdrop';
import {useStore as usePreferencesStore, getState as getPreferencesStoreState } from './dialogs/preferences-store';
import { shell } from 'electron';
import ReportButton from "../component/button/ReportButton.jsx";

const { setPaymentDataArray } = getPaymentDataStoreState();
const { setSitesCredentials } = getPasswordsStoreState();
const { setIntegrations } = getIntegrationsStoreState();

if (!isDev) {
  Sentry.init({ dsn: sentry.dsn, appName: `electron-browser${process.env.IS_BETA ? '-beta' : ''}` });
}

const { checkedSet } = getPreferencesStoreState();

function MainWindow() {
  
  const [leftBars, setLeftBars] = useState(false);

  const {
    activePageId,
    setPageIdWebviewPair,
    setSessionLoading,
    loadingSessions,
  } = usePagesStore([
    'activePageId',
    'setPageIdWebviewPair',
    'setSessionLoading',
    'loadingSessions',
  ]);

  const {
    traffic,
    setSessions,
    setSessionsPortal,
    setSessionsPortalData,
    masterPasswordHash
  } = useUserStore([
    'traffic',
    'setSessions',
    'setSessionsPortal',
    'setSessionsPortalData',
    'masterPasswordHash'
  ]);

  const {
    leftBar,
    setLeftBar,
    setUserProxy
  } = usePreferencesStore([
    'leftBar',
    'setUserProxy',
    'setLeftBar'
  ]);

  useEffect(async () => {

    getPagesStoreState().openNewTab();
    await getMainWindowStoreState().initListeners();

    Settings.on(messages.SETTINGS_SET, (key, value) => {
      switch (key) {
        case PAYMENT_DATA_KEY:
          setPaymentDataArray(value || []);
          break;
        case SITES_CREDENTIALS_KEY:
          setSitesCredentials(value);
          break;
       
        case SESSIONS_KEY:
          setSessions(value);
          break;
        case INTEGRATIONS_KEY:
          setIntegrations(value);
          break;
      }
    });
    await Settings.get(SESSIONS_KEY).then(setSessions);
  
   
    const preferences = await Settings.get(PREFERENCES_KEY);
    if(preferences){
      if (preferences.indexOf('tabRedefine') === -1){
        setLeftBar(true);
      }
      if (preferences.indexOf('userProxy') === -1){
        setUserProxy(true);
      }
    }
    

  }, []);

  useEffect(() => {
    Settings.on(messages.SETTINGS_SET, (key, value) => {
      switch (key) {
        case PAYMENT_DATA_KEY:
          setPaymentDataArray(value || []);
          break;
        case SITES_CREDENTIALS_KEY:
          setSitesCredentials(value);
          break;
      
        case SESSIONS_KEY:
          setSessions(value);
          break;
        case INTEGRATIONS_KEY:
          setIntegrations(value);
          break;
      }
    });
    Settings.get(SESSIONS_KEY).then(setSessions);
 
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traffic, activePageId]);


  // console.log(leftBar);
  useEffect(() => {
    setLeftBars(leftBar);
    // if (masterPasswordHash) setIsBackdropShown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftBar]);

  const handleContactUsClick = () => {
    shell.openExternal('https://docs.google.com/forms/d/e/1FAIpQLSfu8DHYhVhzDhj9dxaYCx8VU6-awgwvZCoI9YvKpUxMygFv8Q/viewform?usp=sharing');
  };

  return (
    <div>
    { !(leftBars) &&
      <div class='left-sidebar'>
        <LeftTabs/>
      </div>
    }
    {/* ////style={{width:'85%',float: 'right'}} */}
    <div class={leftBars ? 'general-window' : 'general-window-left'}>

    { leftBars && 
    
      <TitleBar/>
    }
      
      <NavBar leftBar={leftBars}/>
    
    { !leftBars &&
      <Tabs class="-left"/>
    }

    { leftBars &&
      <Tabs class=""/>
    }

      <Notification/>
      <Dialogs/>
      <BookmarksPopup/>
      <ReportButton onClick={handleContactUsClick}/>
    </div>
    </div>
  );
}

const ChildComponent = () => {
  // console.log("Child re-rendered");
  return <MainWindow/>;
};

const MemoizedChild = memo(ChildComponent);


const root = document.createElement('div');
root.id = 'app';
document.body.appendChild(root);

render(
  <MemoizedChild/>,
  document.getElementById('app')
);
