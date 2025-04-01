import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPagesStoreState } from './pages-store';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { ipcRenderer } from 'electron';
import { messages } from '@/common/consts';

const { editPages } = getPagesStoreState();
const { show: showNotification } = getNotificationsStoreState();

const store = create((set) => ({
  isProxyOnGlobally: true,
  setIsProxyOnGlobally: (v) => set(() => ({ isProxyOnGlobally: v })),

  onToggleProxyGlobally: async () => {
    const { pagesMap } = getPagesStoreState();
    try {
      const newValue = await ipcRenderer.invoke(messages.TOGGLE_PROXY_GLOBALLY);
      currentStoreState.setIsProxyOnGlobally(newValue);
      const pagesToEdit = [...pagesMap].map(([id, page]) => {
        if (page.session) {
          page.session.isProxyOn = newValue;
        }
        return {
          pageId: id,
          props: { session: page.session }
        }
      });
      editPages(pagesToEdit);
      // showNotification({ type: 'info', message: `Proxy ${newValue ? 'en' : 'dis'}abled globally` });
    } catch (e) {
      showNotification({ type: 'error', message: 'Error toggling proxy globally' });
      console.error(e);
    }
  },
  onToggleProxyInSession: async ({ partition, value }) => {
    const { pagesMap } = getPagesStoreState();
    try {
      await ipcRenderer.invoke(messages.TOGGLE_PROXY_IN_SESSION, partition);
      const pagesToEdit = [...pagesMap].reduce((filtered, [id, page]) => {
        if (page.session && page.session.partition === partition) {
          page.session.isProxyOn = !value;
          filtered.push({
            pageId: id,
            props: { session: page.session }
          });
        }
        return filtered;
      }, []);
      editPages(pagesToEdit);
      // showNotification({ type: 'info', message: `Proxy of the current session ${value ? 'dis' : 'en'}abled` });
    } catch (e) {
      showNotification({ type: 'error', message: `Error ${value ? 'dis' : 'en'}abling proxy` });
      console.error(e);
    }
  },
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
