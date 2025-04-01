import { ipcRenderer } from 'electron';
import { messages, NEW_TAB, SESSIONS_KEY } from '@/common/consts';
import SessionManager from '@/common/session-manager/render';
import { getState as getPagesStoreState } from './pages-store';
import { getState as getPopupsStateStoreState } from './popups/popups-state-store';
import { getState as getUserStoreState } from '@/common/components/user-store';
import { getState as getDialogsStateStoreState } from './dialogs/dialogs-state-store';
import { getState as getPasswordsStoreState } from './dialogs/passwords-store';
import { getState as getPaymentDataStoreState } from './dialogs/payment-data-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import Settings from '@/common/settings';
import { OTHER_TAB } from '../../common/consts';

const {
  setWebviewMenuParams,
  editPages,
  bulkEditPages,
  getWebView,
  createTab,
  removePagesFromCache,
  addLoadedIframe,
  removePageFromLoadedFramesMap,
  autoFillPaymentData,
  suggestToSaveOrUpdateSiteCredentials,
  editPageSiteCredentials,
  setSessionLoading,
  catchLoadingUrlError,
} = getPagesStoreState();
const {
  setAutoFillPopupParams,
  setIsAutoFillPopupOpened,
  setIsAutoFillClose,
} = getPopupsStateStoreState();
const {
  setSavingCredentials,
} = getPasswordsStoreState();
const {
  setIsOpenLinkDialogOpened,
  setIsConfirmDeleteSessionsDialogOpened,
  setCheckedSessionsMap,
  setSessionToEditOrDelete,
  setIsEditSessionDialogOpened,
  setIsAddSessionDialogOpened,
  setOpeningLinkUrl,
} = getDialogsStateStoreState();
const { setSessions, traffic } = getUserStoreState();
const { show: showNotification } = getNotificationsStoreState();

const pageHandlers = {
  onDidStartLoading: (e, page) => {
    
    editPages([{
      pageId: page.id,
      props: {
        isLoading: true,
        title: false,
        error: false
      }
    }]);
  },
  onDomReady: (e, page) => {
    const webview = getWebView(page.id);
    editPages([{
      pageId: page.id,
      props: {
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward(),
        webview,
        canRefresh: true,
        siteCredentialsToSave: null
      }
    }]);
    setSavingCredentials({
      login: '',
      password: '',
      location: '',
      partition: null,
      alreadySavedItem: null,
      pageId: null
    });
  },
  onDidStopLoading: (e, page, additional = {}) => {
    const webview = getWebView(page.id);
    editPages([{
      pageId: page.id,
      props: {
        statusText: false,
        isLoading: false,
        location: webview.getURL(),
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward(),
        webview,
        title: page.title ? page.title : webview.getTitle() || page.location,
        ...additional
      }
    }]);
    setSessionLoading({ value: false, pageId: page.id });
  },
  onDidFailLoad: (e, page) => {
    if (!e.isMainFrame) return;
    let status = e.errorCode;
    let statusText = e.errorDescription;
    let message;
    switch (e.errorCode) {
      case -111:
        status = null;
        message = `Error connecting proxy server. Please check your internet connection and make sure you haven’t exceeded browser traffic limit`
        break;
      case -3:
        console.log('ERR_ABORTED');
        return;
    }
    pageHandlers.onDidStopLoading(e, page, { error: { status, statusText, message } });
  },
  didFrameNavigate: (e, page) => {
    if (!page.error) return;
    editPages([{
      pageId: page.id,
      props: {
        error: null
      }
    }]);
  },
  onWillNavigate: (e, page) => {
    suggestToSaveOrUpdateSiteCredentials(page.id);
  },
  onDidStartNavigation: (e, page) => {
    if (!e.isMainFrame) return;
    editPages([{ // mb 'did-navigate' is better
      pageId: page.id,
      props: {
        timer: null
      }
    }]);
    setIsAutoFillPopupOpened(false);
    setIsAutoFillClose(false);
  },
  onPageTitleUpdated: (e, page) => {
    const webview = getWebView(page.id);
    editPages([{
      pageId: page.id,
      props: {
        title: e.title,
        location: webview.getURL()
      }
    }]);
  },
  onContextMenu: (e, page) => {
    const params = {
      page,
      x: e.params.x,
      y: e.params.y,
      href: e.params.linkURL,
      img: e.params.hasImageContents && e.params.srcURL,
      iframe: e.params.frameURL,
    };
    setWebviewMenuParams(params);
    ipcRenderer.invoke('open-webview-context-menu', {
      href: !!params.href,
      img: !!params.img,
      iframe: !!params.iframe,
      hasSelection: !!e.params.selectionText
    });
  },
  updateTargetUrl: (e, page) => {
    editPages([{
      pageId: page.id,
      props: {
        statusText: e.url
      }
    }]);
  },
  onDestroyed: (e, page) => {
    removePageFromLoadedFramesMap(page.id);
  },
  onNewWindow: async (e, page) => {
    if (e.url.startsWith('about:blank')){
      console.log("TARGET");
      createTab({ params: { ...page, location: e.url } });
      console.log(e);
    }
    if (e.frameName === '_self') {
      const webview = getWebView(page.id);
      try {
        await webview.loadURL(e.url);
      } catch (e) {
        catchLoadingUrlError(e);
      }
    } else {
      createTab({ params: { ...page, location: e.url } });
    }
  },
  onIpcMessage: async (e, page) => {
    const data = e.args[0];
    switch (e.channel) {
      case messages.LOAD_SESSION: {
        const session = await SessionManager.get({ partition: data });
        setSessionLoading({
          value: true,
          pageId: page.id,
          name: `${session.credentials.name} ${session.credentials.email}`
        });
        editPages([{
          pageId: page.id,
          props: { session }
        }]);
        removePagesFromCache([page]);
        break;
      }
      case messages.OPEN_LINK_OPENING_DIALOG: {
        setOpeningLinkUrl(data.url || OTHER_TAB);
        const sessions = await Settings.get(SESSIONS_KEY);
        setSessions(sessions);
        setCheckedSessionsMap(data.checkedSessionsMap || new Map());
        setIsOpenLinkDialogOpened(true);
        break;
      }
      case messages.OPEN_DELETE_SESSIONS_DIALOG: {
        if (data.checkedSessionsMap) {
          setCheckedSessionsMap(data.checkedSessionsMap);
        } else {
          setSessionToEditOrDelete(data.session);
        }
        setIsConfirmDeleteSessionsDialogOpened(true);
        break;
      }
      case messages.OPEN_ADD_SESSIONS_DIALOG: {
        setIsAddSessionDialogOpened(true);
        break;
      }
      case messages.OPEN_EDIT_SESSIONS_DIALOG: {
        setSessionToEditOrDelete(data);
        setIsEditSessionDialogOpened(true);
        break;
      }
      case messages.SET_AUTO_FILL_POPUP: {
        const popupsStateStoreState = getPopupsStateStoreState();
        if (!data
          && !popupsStateStoreState.isAutoFillPopupOpened
          && !popupsStateStoreState.autoFillPopupParams.pageId) return;
        setAutoFillPopupParams(
          data
            ? {
              ...data,
              paymentDataId: page.session.paymentDataId,
              pageId: page.id,
              frameId: e.frameId,
              partition: page.session.credentials ? page.session.partition : null,
            }
            : {
              x: 0,
              y: 0,
              width: '300px',
              height: '0',
              paymentDataId: null,
              partition: null,
              pageId: null,
              frameId: null,
              dataName: null,
              type: '',
              hostname: ''
            }
        );
        setIsAutoFillPopupOpened(!!data);
        break;
      }
      case messages.GET_AND_AUTO_FILL_PAYMENT_DATA: {
        const item = getPaymentDataStoreState().boundPaymentDataArray.find(({ id }) => page.session.paymentDataId === id);
        autoFillPaymentData({ pageId: page.id, item, needToClear: data.needToClear });
        break;
      }
      case messages.FRAME_LOADED: {
        addLoadedIframe({ frameId: e.frameId, pageId: page.id });
        if (!page.session.paymentDataId) break;
        const webview = getWebView(page.id);
        const array = getPaymentDataStoreState().boundPaymentDataArray;
        const item = array.find(({ id }) => page.session.paymentDataId === id);
        if (!item) {
          console.error('No paymentId item');
          return;
        }
        webview.send(messages.FILL_PAYMENT_DATA_IN_IFRAME, item);
        webview.sendToFrame(e.frameId, messages.FILL_PAYMENT_DATA_IN_IFRAME, item);
        break;
      }
      case messages.EDIT_PAGE_SITE_CREDENTIALS: {
        editPageSiteCredentials(page.id, data);
        break;
      }
      case messages.SUGGEST_TO_SAVE_SITE_CREDENTIALS: {
        suggestToSaveOrUpdateSiteCredentials(page.id);
        if (!getPasswordsStoreState().isSavingCredentialsDialogOpened) {
          editPageSiteCredentials(page.id);
        }
        break;
      }
      case messages.SESSION_EDIT: {
        const { pagesMap } = getPagesStoreState();
        const pagesToEdit = [...pagesMap].reduce((filtered, [id, page]) => {
          if (page.session && page.session.partition === data.partition) {
            page.session.credentials.password = data.credentials.password;
            filtered.push({
              pageId: id,
              props: { session: page.session }
            });
          }
          return filtered;
        }, []);
        editPages(pagesToEdit);
        break;
      }
      case messages.SET_TAB_TIMER: {
        bulkEditPages([{
          pageId: page.id,
          props: { timer: data }
        }]);
        break;
      }
      case messages.SHOW_NOTIFICATION:
        showNotification({ message: data.message || '', type: data.type || 'info' });
        break;
    }
  },
};

export default pageHandlers;
