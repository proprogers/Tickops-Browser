import { useState, useEffect, useMemo, useCallback, useRef, memo, React } from 'react';
import { useStore as usePagesStore } from './pages-store';
import pageHandlers from './page-handlers';
import ErrorCard from './error-card.jsx';
import SessionLoadingCard from './session-loading-card.jsx';
import ErrorFixedCard from './error-fixed-card.jsx';
import AutoFillPaymentPopup from './popups/auto-fill-payment-popup.jsx';
import AutoFillLoginPopup from './popups/auto-fill-login-popup.jsx';
import AutoFillSuggestingPasswordsPopup from './popups/auto-fill-suggesting-passwords-popup.jsx';
import { useStore as useNavbarStore } from './navbar-store';
// import {Dashboard} from '../../pages/dashboard';

const webviewEvents = {
  'did-start-loading': 'onDidStartLoading',
  'did-stop-loading': 'onDidStopLoading',
  'did-fail-load': 'onDidFailLoad',
  'page-title-updated': 'onPageTitleUpdated',
  'close': 'onClose',
  'ipc-message': 'onIpcMessage',
  'new-window': 'onNewWindow',
  'context-menu': 'onContextMenu',
  'did-frame-navigate': 'didFrameNavigate',
  'did-start-navigation': 'onDidStartNavigation',
  'will-navigate': 'onWillNavigate',
  'destroyed': 'onDestroyed',
};

export default function MemorPage(props) {
  const [initLocation, setInitLocation] = useState('');
  const [pageStatus, setPageStatus] = useState('');
  const [fixCount, setfixCount] = useState(0);

  const webviewRef = useRef();

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
    refreshIp
  } = useNavbarStore([
    'refreshIp'
  ]);

  const session = props.page.session;

  const isActive = activePageId === props.page.id;

  const webviewHandler = (fnName) => {
    return (e) => {
      if (pageHandlers[fnName]) {
        pageHandlers[fnName](e, props.page, props.page.id);
      }
    }
  }

  const attachEventListeners = (webview) => {
    for (const event in webviewEvents) {
      webview.addEventListener(event, webviewHandler(webviewEvents[event]));
    }

    var date = new Date().getTime();
    // console.log("end init webview "+date)
  };

  const removeEventListeners = (webview) => {
    for (const event in webviewEvents) {
      webview.removeEventListener(event, webviewHandler(webviewEvents[event]));
    }
  };


  const initWebview = async(webview) => {


    if (webview === null) {
      unsubscribeWebviewEvents();
      return;
    }
    if (!props.page.session) return;
    webviewRef.current = webview;
    setPageIdWebviewPair(props.page.id, webview);
    const domReady = 'dom-ready';
   
    const onDomReady = async () => {
      webview.removeEventListener(domReady, onDomReady);
      attachEventListeners(webview);
    };
    webview.addEventListener(domReady, onDomReady);
    webview.addEventListener(domReady, webviewHandler('onDomReady'));

   
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setWebviewRef = useCallback(initWebview, [session && session.partition]);

  const unsubscribeWebviewEvents = () => {
    webviewRef.current.removeEventListener('dom-ready', webviewHandler('onDomReady'));
    removeEventListeners(webviewRef.current);
  };

  useEffect(() => {
    if(props.page.location != '')
      setInitLocation(props.page.location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(props.page.error && (props.page.error.status == -106 && fixCount <= 15 ||
      props.page.error.status == -130 && fixCount <= 15 )){
      var result = refreshIp(props.page.session, false);

      setfixCount(fixCount+1);
      if(result){
        setTimeout(()=>{
          webviewRef.current.loadURL(props.page.location);
        },3000);
      }
    } 
  }, [props.page.error]);



  useEffect(() => {
    if (loadingSessions[props.page.id]) {
      setSessionLoading({ value: false, pageId: props.page.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    setPageStatus(props.page.statusText);
    if (!props.page.statusText && props.page.isLoading) {
      setPageStatus('Loading...');
    }

    // alert("page status");
  }, [props.page.isLoading, props.page.statusText]);

  const pageClasses = 'page'+props.class + ' ' +
    'visible';
  
  if(session){
    var preload = 'file://session/' + encodeURIComponent(JSON.stringify({...session, pageId: props.page.id, hash_id: props.page.hash_id}))
  }
  // alert(props.page.id);
  // alert(props.page.previousTab);
  return (
    <div id={`page-${props.page.id}`} className={pageClasses} style={{
      opacity: isActive ? 1 : 0,
      zIndex: isActive ? 1 : 0,
    }}>
      
  
      {/* <PageSearch stop={() => webviewRef.current.stopFindInPage('clearSelection')}
                  onPageSearch={onPageSearch}
      /> */}
      {/* {console.log('RENDER PAGE '+props.page.id)} */}
      
      {session
        && <webview className={props.page.error ? 'hidden' : 'visible'}
                   ref={setWebviewRef}
                   key={session.partition}
                   partition={session.partition}
                   src={initLocation}
                    // allowpopups="true"
                   nodeintegrationinsubframes="true"
                   webpreferences={"additionalArguments="+preload+",contextIsolation=no,sandbox=false"}
                  //  useragent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) tickops-beta-browser/4.2.85 Chrome/130.0.6723.59 Electron/33.0.2 Safari/537.36'
        />
        }
      {(fixCount < 15 && fixCount > 0) && props.page.error  && <ErrorFixedCard error={props.page.error} page={props.page}/>}
      { props.page.error && <ErrorCard error={props.page.error} page={props.page}/>}
      {loadingSessions[props.page.id] && <SessionLoadingCard sessionName={loadingSessions[props.page.id]}/>}
      {/*{autoCartingLoadingCards[props.page.id] && <AutoCartLoadingCard/>}*/}
      <div id="page-status" className={pageStatus ? 'visible' : 'hidden'}>
        {pageStatus}
      </div>
      <AutoFillPaymentPopup/>
      <AutoFillLoginPopup/>
      <AutoFillSuggestingPasswordsPopup/>
    </div>
  );
}