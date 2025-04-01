import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPagesStoreState } from './pages-store';
import { getState as getAddressBarStoreState } from './addressbar-store';
import { getState as getUserStoreState } from '@/common/components/user-store';
import { getState as getDialogsStateStoreState } from './dialogs/dialogs-state-store';
import { getState as getPopupsStateStoreState } from './popups/popups-state-store';
import { getState as getPaymentDataStoreState } from './dialogs/payment-data-store';
import { getState as getPasswordsStoreState } from './dialogs/passwords-store';
import { getState as getCartingStoreState } from './carting-store';
import { getState as getIntegrationsStoreState } from './integrations-store';
import { ipcRenderer, clipboard } from 'electron';
import SessionManager from '@/common/session-manager/render';
import Settings from '@/common/settings';
import { SESSIONS_KEY, messages, PAYMENT_DATA_KEY, INTEGRATIONS_KEY, SITES_CREDENTIALS_KEY } from '@/common/consts';
import API from '@/API';

// const unsub4 = subscribeRenderStore((curr, prev) => console.log(paw, previousPaw), state => state.paw)

const {
  getWebView,
  reloadIframe,
  createTab,
  openNewTab,
  openOtherTab,
  setActivePageId,
  openNewWindow,
  nextTab,
  previousTab,
  getPageObject,
  closePages,
  editPages,
  autoFillSms,
  handleCookiesChange,
} = getPagesStoreState();
const { closeAutoFillPaymentPopup } = getPopupsStateStoreState();
const { setSessions, setUser, setTraffic} = getUserStoreState();
const { setPaymentDataArray } = getPaymentDataStoreState();
const { setSitesCredentials } = getPasswordsStoreState();
const { setIsOpenLinkDialogOpened, setOpeningLinkUrl } = getDialogsStateStoreState();
const { setCartingVisibility } = getCartingStoreState();
const { setIntegrations } = getIntegrationsStoreState();

const store = create((set) => ({
  appVersion: '0.0.0',
  setAppVersion: (v) => set(() => ({ appVersion: v })),

  isBackdropShown: true,
  setIsBackdropShown: (v) => set(() => ({ isBackdropShown: v })),

  openLink: async ({ data, extraFunction }) => {
    console.log(data)
    const executeExtraFunction = (pageId) => {
      const webview = getWebView(pageId);

      function onDidFinishLoad() {
        extraFunction({ ...data, pageId });
        webview.removeEventListener('did-finish-load', onDidFinishLoad);
      }

      if (extraFunction) {
        webview.addEventListener('did-finish-load', onDidFinishLoad);
      }
    };

    const location = data.eventLocation ? null : data.location;

    if (data.sessions) {
      for (const [partition, count] of data.sessions) {
        const session = await SessionManager.get({ partition });
        for (let c = 0; count > c; c++) {
          const pageId = await createTab({
            params: { session, location },
            isActive: true
          });
          executeExtraFunction(pageId);
        }
      }
    }

    if (data.locationSessionsCount) {
      for (let c = 0; data.locationSessionsCount > c; c++) {

        var state = data.proxyLocation.value;
        var state_name = data.proxyLocation.label;
        var session = await SessionManager.get({state:state, state_name:state_name});
        
        const pageId = await createTab({
          params: { session,location },
          isActive: true
        });
        executeExtraFunction(pageId);
      }
    }
    
    if (data.randomSessionsCount) {
      for (let c = 0; data.randomSessionsCount > c; c++) {
        const pageId = await createTab({
          params: { location },
          cookies: data.cookies && data.cookies[c],
          extraPartitionId: c,
          isActive: true
        });
        executeExtraFunction(pageId);
      }
    }
   
  },

  deleteSessions: async (partitions) => {
    const credentialsIds = await API.deleteSessions(partitions);
    const credentialsIdsSet = new Set(credentialsIds);
    const sitesCredentialsDiskArray = await Settings.get(SITES_CREDENTIALS_KEY);
    const sitesCredentialsDiskArrayEdited = sitesCredentialsDiskArray
      .map((curr) => {
        if (credentialsIdsSet.has(curr._id)) {
          curr.partition = null;
        }
        return curr;
      });
    await Settings.set(SITES_CREDENTIALS_KEY, sitesCredentialsDiskArrayEdited);

    const { pagesMap } = getPagesStoreState();
    const { sessions } = getUserStoreState();
    const sessionMap = new Map(sessions.map((curr) => [curr.partition, curr]));
    const pages = [...pagesMap];
    let pagesToClose = [];
    for (const partition of partitions) {
      pagesToClose = [
        ...pagesToClose,
        ...pages.reduce((filtered, [, page]) => {
          if (page.session && page.session.partition === partition) {
            filtered.push(page.id);
          }
          return filtered;
        }, [])
      ];
      const session = sessionMap.get(partition);
      if (session.paymentDataId) {
        await SessionManager.editPaymentDataItem({ id: session.paymentDataId, data: { partition: null } });
      }
    }
    if (pagesToClose.length === pages.length) {
      await openNewTab();
    }
    await closePages(pagesToClose);
  },

  initListeners: () => {
    ipcRenderer
      .on('set-is-backdrop-shown', (e, v) => currentStoreState.setIsBackdropShown(v))
      .on('set-user', async (e, user) => {
        setUser(user);
        setCartingVisibility(user.isCartingVisible || user.isAdmin);
        const paymentData = await Settings.get(PAYMENT_DATA_KEY);
        setPaymentDataArray(paymentData || []);
        const sitesCredentials = await Settings.get(SITES_CREDENTIALS_KEY);
        setSitesCredentials(sitesCredentials || null);
        const integrations = await Settings.get(INTEGRATIONS_KEY);
        setIntegrations(integrations || null);
      })
      .on('set-traffic', async (e, traffic) => {
        setTraffic(traffic);
        await Settings.set("TRAFFIC", traffic);
      })
      .on('reload-page', (e, needToKeepCache = true) => {
        const webview = getWebView()
        needToKeepCache ? webview.reload() : webview.reloadIgnoringCache()
      })
      .on('go-back', () => getWebView().goBack())
      .on('go-forward', () => getWebView().goForward())
      .on('inspect-element', () => {
        const webview = getWebView();
        if (!webview) return;
        webview.openDevTools();
      })
       .on('open-link', async (e, { session, location, tabsNumber = 1, isActive = true }) => {
        if(session){
          var param = {session,location };
        } else {
          var param = {location};
        }
        
        for (let count = 0; count < tabsNumber; count++) {
          await createTab({ params: param, isActive:true });
        }
      })
      .on('switch-tab', (e, direction) => {
        console.log("switch-tab")
        closeAutoFillPaymentPopup();
        const { tabs, activePageId } = getPagesStoreState();
        const currActivePageIndex = tabs.findIndex((id) => id === activePageId);
        switch (direction) {
          case 'forward': {
            const newActivePageIndex = currActivePageIndex + 1;
            const newActivePageId = tabs[newActivePageIndex < tabs.length ? newActivePageIndex : 0]
            setActivePageId(newActivePageId);
            break;
          }
          case 'backward': {
            const newActivePageIndex = currActivePageIndex - 1;
            const newActivePageId = tabs[newActivePageIndex < 0 ? tabs.length - 1 : newActivePageIndex]
            setActivePageId(newActivePageId);
            break;
          }
        }
      })
      /*.on('auto-carting-finish', (e, { result, message, pageId }) => {
        const { activePageId } = getPagesStoreState();
        currentStoreState.setAutoCartingLoading({ value: false, pageId });
        if (result === 'error') {
          result = 'err'; // idk why but don't change it
          // showNotification({ message, type: 'error', pageId });
        }
        if (pageId === activePageId) return;
        editPages([{
          pageId,
          props: { color: result }
        }]);
      })*/
      .on(messages.HAS_COOKIES_CHANGED, (e, partition, newValue) => {
        const page = getPageObject();
        if (!partition || page?.session?.partition !== partition) return;
        handleCookiesChange(partition, newValue);
      })
      .on(messages.AUTO_FILL_SMS, (e, { message, number }) => {
        autoFillSms({ message, number });
      })
      .on(messages.TAB_CONTEXT_MENU, async (e, type) => {
        console.log("TAB_CONTEXT_MENU", type);
        const { tabs, tabMenuParams, activePageId } = getPagesStoreState();
        switch (type) {
          case 'clear-cache':
            try {
              await Settings.clear();
            } catch (error) {
              console.error('Error clearing settings:', error);
            }
            break;
          case 'create':
            openOtherTab();
            break;
          case 'create-window':
            openNewWindow();
            break;
          case 'reload':
            getWebView(activePageId).reload();
            break;
          case 'select-next-tab':
            // closeAutoFillPaymentPopup();
            nextTab(tabs.filter((id) => id !== tabMenuParams.id));
            break;
          case 'select-previous-tab':
            // closeAutoFillPaymentPopup();
            previousTab(tabs.filter((id) => id !== tabMenuParams.id));
            break;
          case 'duplicate':
            createTab({ params: tabMenuParams });
            break;
          case 'close':
            closePages([activePageId]);
            break;
          case 'close-other':
            closePages(tabs.filter((id) => id !== tabMenuParams.id));
            break;
        }
      })
      .on(messages.ADDRESS_BAR_CONTEXT_MENU, (e, type) => {
        const { menuTarget: target } = getAddressBarStoreState();
        switch (type) {
          case 'copy':
            clipboard.writeText(target.value.slice(target.selectionStart, target.selectionEnd));
            break;
          case 'cut':
            clipboard.writeText(target.value.slice(target.selectionStart, target.selectionEnd));
            editPages([{
              pageId: getPageObject().id,
              props: {
                location: target.value.slice(0, target.selectionStart) + target.value.slice(target.selectionEnd)
              }
            }]);
            break;
          case 'paste':
            editPages([{
              pageId: getPageObject().id,
              props: {
                location: target.value.slice(0, target.selectionStart) + clipboard.readText() + target.value.slice(target.selectionEnd)
              }
            }]);
            break;
        }
      })
      .on('extensions', (e, type) => {
        switch (type.type) {
          case 'create':
            createTab({ params: { location: type.location, session: type.session } });
            break;
          case 'removed':
            closePages([type.tab]);
            break;

        }
      })
      .on(messages.WEBVIEW_CONTEXT_MENU, async (e, type) => {
        const { webviewMenuParams } = getPagesStoreState();
        switch (type) {
          case 'inspect':
            getWebView().inspectElement(webviewMenuParams.x, webviewMenuParams.y);
            break;
          case 'open-link-new-tab':
            createTab({
              params: {
                ...webviewMenuParams.page,
                location: webviewMenuParams.href
              }
            });
            break;
          case 'sessions': {
            setOpeningLinkUrl(webviewMenuParams.href);
            setIsOpenLinkDialogOpened(true);
            const sessions = await Settings.get(SESSIONS_KEY);
            setSessions(sessions);
            break;
          }
          case 'copy-link':
            clipboard.writeText(webviewMenuParams.href);
            break;
          case 'copy-image-url':
            clipboard.writeText(webviewMenuParams.img);
            break;
          case 'open-image':
            createTab({ params: { location: webviewMenuParams.img } });
            break;
          case 'reload-iframe':
            reloadIframe(webviewMenuParams.iframe, webviewMenuParams.x, webviewMenuParams.y);
            break;
          case 'copy':
            getWebView().copy();
            break;
        }
      });
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
