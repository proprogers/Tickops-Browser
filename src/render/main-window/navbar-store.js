import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPagesStoreState } from './pages-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { ipcRenderer, dialog } from 'electron';
import { messages, NEW_TAB } from '@/common/consts';

const { editPages, getWebView } = getPagesStoreState();
const { show: showNotification } = getNotificationsStoreState();

const store = create((set) => ({
  isConfirmDeleteCookiesDialogOpened: false,
  setIsConfirmDeleteCookiesDialogOpened: (v) => set(() => ({ isConfirmDeleteCookiesDialogOpened: v })),

  clearingCookiesInfo: {
    openedTabsCount: 1,
    partition: ''
  },
  setClearingCookiesInfo: (v) => set(() => ({ clearingCookiesInfo: v })),
  clearCookies: async (partition) => {
    try {
      await ipcRenderer.invoke(messages.CLEAR_COOKIES, partition);
      currentStoreState.reloadSessions(partition);
      const message = 'The cookies of the current session were successfully deleted';
      showNotification({ message, type: 'success' });
    } catch (e) {
      const message = 'Error deleting cookies :(';
      showNotification({ message, type: 'error' });
    }
  },
  handleClearCookies: (partition) => {
    let openedTabsCount = 0;
    const { pagesMap } = getPagesStoreState();
    [...pagesMap].forEach(([, { session }]) => {
      if (session && session.partition === partition) {
        openedTabsCount++;
      }
    });
    if (openedTabsCount <= 1) {
      currentStoreState.clearCookies(partition);
      return;
    }
    currentStoreState.setClearingCookiesInfo({ openedTabsCount: openedTabsCount - 1, partition });
    currentStoreState.setIsConfirmDeleteCookiesDialogOpened(true);
  },
  toggleProxyLocation: async (session, state, notification = true) => {
    let newProxyLogin;
    try {
      state = state.value.replace("_", "+");
      newProxyLogin = await ipcRenderer.invoke(messages.TOGGLE_PROXY_LOCATION, {session:session, state:state});
     
    } catch (e) {
      if(notification)
        showNotification({ type: 'error', message: 'Error location' });
        console.error(e);
      return false;
    }
    const { pagesMap } = getPagesStoreState();
    const pagesToEdit = [...pagesMap].reduce((filtered, [id, page]) => {
      if (page.session && page.session.partition === session.partition) {
        page.session.proxy.login = newProxyLogin.login;
        page.session.proxy.password = newProxyLogin.password;
        page.session.proxy.info = state+",US";
        if(newProxyLogin.timezone)
          page.session.timezone = newProxyLogin.timezone;
        
        filtered.push({
          pageId: id,
          props: { session: page.session }
        });
      }
      return filtered;
    }, []);
    editPages(pagesToEdit);
    console.log(pagesToEdit);
    if(notification)
      showNotification({ type: 'success', message: 'Location has been updated' });
  },
  refreshIp: async (session, notification = true) => {
    let newProxyLogin;
    try {
      newProxyLogin = await ipcRenderer.invoke(messages.REFRESH_IP, session);
      
    } catch (e) {

      if(notification)
        showNotification({ type: 'error', message: 'Error refreshing IP' });
        console.error(e);
      return false;
    }
    const { pagesMap } = getPagesStoreState();
    const pagesToEdit = [...pagesMap].reduce((filtered, [id, page]) => {
      if (page.session && page.session.partition === session.partition) {
        page.session.proxy.login = newProxyLogin.login;
        page.session.proxy.password = newProxyLogin.password;
        if(newProxyLogin.timezone)
          page.session.timezone = newProxyLogin.timezone;
        filtered.push({
          pageId: id,
          props: { session: page.session }
        });
      }
      return filtered;
    }, []);
    editPages(pagesToEdit);
    if(notification)
      showNotification({ type: 'success', message: 'IP has been refreshed' });
  },
  toggleActiveInBg: ({ pageId, prev }) => {
    editPages([{
      pageId,
      props: { isActiveInBg: !prev }
    }]);
  },
  reloadSessions: (partition) => {
    const { pagesMap } = getPagesStoreState();
    const pagesToReload = [];
    [...pagesMap].forEach(([, page]) => {
      if (page.session && page.session.partition === partition && page.location !== NEW_TAB) {
        pagesToReload.push(page);
      }
    });
    pagesToReload.forEach(({ id }) => {
      getWebView(id).reload();
    });
  },
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
