import { useStore as useNavbarStore } from './navbar-store';
import { useStore as usePagesStore } from './pages-store';
import IconButton from '@mui/material/IconButton';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Refresh from '@mui/icons-material/Refresh';
import Autorenew from '@mui/icons-material/Autorenew';
import Delete from '@mui/icons-material/Delete';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Close from '@mui/icons-material/Close';
import AddressBar from './addressbar.jsx';
import NavbarMenu from './navbar-menu.jsx';
import ToggleProxyMenu from './toggle-proxy-menu.jsx';
import { NEW_TAB } from '@/common/consts';
import { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { WindowsControls } from 'react-windows-controls';
import { getState as getPreferencesStoreState } from './dialogs/preferences-store';

const isMac = process.platform === 'darwin';

export default function NavBar(props) {
  

  const {
    refreshIp,
    handleClearCookies,
    toggleActiveInBg,
    toggleProxyLocation
  } = useNavbarStore([
    'refreshIp',
    'handleClearCookies',
    'toggleActiveInBg',
    'toggleProxyLocation'
  ]);

  const {
    activePageId, /* do not remove */
    pagesMap,
    getPageObject,
    catchLoadingUrlError,
  } = usePagesStore([
    'activePageId',
    'pagesMap',
    'getPageObject',
    'catchLoadingUrlError',
  ]);

  // const { userProxy } = getPreferencesStoreState();

  const page = getPageObject();
  const isActiveInBg = page && page.isActiveInBg;
  const webview = page && page.webview;
  const session = page && page.session;
  const partition = session && session.partition;

  // const session = page.session || {};
  //   const sessionInfo = session.proxy
  //     ? session.credentials
  //       ? `${session.credentials.name} ${session.credentials.email}`
  //       : session.proxy.info
  //     : '';
  

  const onClickHome = async () => {
    webview.stop();
    try {
      await webview.loadURL(NEW_TAB);
    } catch (e) {
      catchLoadingUrlError(e);
    }
  };

  if(page && session){

    // console.log(page);

    // console.log(session);
    
  }
  
  // console.log("RELOAD");
  // console.log(page);

  useEffect(() => {
  //  console.log(getPageObject());
    // alert("page status");
  }, [pagesMap]);


  return (
    <div id="navbar">
      <IconButton onClick={() => webview.goBack()}
                  disabled={!page || !page.canGoBack}
      >
        <ArrowBack/>
      </IconButton>
      <IconButton onClick={() => webview.goForward()}
                  disabled={!page || !page.canGoForward}
      >
        <ArrowForward/>
      </IconButton>
      <IconButton disabled={!page || !page.canRefresh}
                  onClick={() => {
                    page && page.isLoading
                      ? webview.stop()
                      : webview.reload()
                  }}
      >
        {page && page.isLoading
          ? <Close/> : <Refresh/>}
      </IconButton>
      <IconButton onClick={onClickHome}
                  disabled={!webview}
      >
        <HomeOutlined/>
      </IconButton>
      <AddressBar page={page}/>

      {/* <browser-action-list></browser-action-list> */}
      <browser-action-list partition={partition}></browser-action-list>
     
      <ToggleProxyMenu session={session} partition={partition}/>
      <IconButton onClick={() => refreshIp(session)}
                  disabled={!partition || !session.proxy || session.proxy.isCustom }
                  title="Refresh session IP"
      >
        <Autorenew/>
      </IconButton>
      <IconButton onClick={() => handleClearCookies(session.partition)}
                  disabled={!partition || !session?.hasCookies}
                  title={session?.hasCookies ? 'Clear session cookies' : 'No cookies'}
      >
        {session?.hasCookies ? <Delete/> : <DeleteOutline/>}
      </IconButton>
      <IconButton selected={isActiveInBg}
                  onClick={() => toggleActiveInBg({ pageId: page.id, prev: isActiveInBg })}
                  title={`Keep tab ${isActiveInBg ? 'inactive' : 'active'} in the background`}
      >
        {isActiveInBg === false ? <VisibilityOff/> : <Visibility/>}
      </IconButton>
      <NavbarMenu page={page}/>
      {!props.leftBar && !isMac &&
      <WindowsControls onClose={() => ipcRenderer.invoke('on-browser-window-close')}
                         onMinimize={() => ipcRenderer.invoke('on-browser-window-minimize')}
                         onMaximize={() => ipcRenderer.invoke('on-browser-window-maximize')}
                         style={{
                           flexGrow: 0,
                           flexShrink: 0,
                           height: 34,
                           right: 0,
                           float: 'right',
                           WebkitAppRegion: 'no-drag',
                         }}
        />
      }
    </div>
  );
}
