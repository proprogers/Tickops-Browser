import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPagesStoreState } from './pages-store';
import { ipcRenderer } from 'electron';
import { normalizeUrl } from '@/common/utils';
const { getPageObject,getActivePageId, editPages, getWebView, catchLoadingUrlError } = getPagesStoreState();

// const page = getPageObject();

const store = create((set, get) => ({
  location: '',
  previous:0,
  setLocation: (v) => {
    set(() => ({ location: v }));
  },
  setPrevious: (v) => {
    set(() => ({ previous: v }));
  },
  getLocation: () => {
    return get().location;
  },
  pageId: () => {
   
    return getActivePageId();
  },
  clearLocation: () => {

      editPages([{
        pageId: get().previous,
        props: { location:get().location }
      }]);

  },
  updateLocation: () => {
    const page = getPageObject();
    
    if(page){
  
      if(page.location.indexOf("://newtab") !==-1 || page.location.indexOf("://othertab") !==-1){
        get().setLocation('')
      } else get().setLocation(page.location);
      get().setPrevious(page.id);
    }
  },
  prevLocation: '',
  setPrevLocation: (v) => set(() => ({ prevLocation: v })),
  menuTarget: {},
  setMenuTarget: (v) => set(() => ({ menuTarget: v })),
  onEnterLocation: async (location) => {
    const page = getPageObject();
    editPages([{
      pageId: page.id,
      props: { location }
    }]);
    const webview = getWebView();
   
    console.log(location)
    // await webview.loadURL(location);
    // webview.stop();
    try {
      await webview.loadURL(location);
    } catch (e) {
      catchLoadingUrlError(e);
    }
  },
  onContextMenu: ({ target }) => {
    currentStoreState.setMenuTarget(target);
    ipcRenderer.invoke('open-address-bar-context-menu');
  },
  onMouseUp: ({ target }) => {
    if (target.selectionStart === target.selectionEnd) {
      target.select();
    }
  },
  onKeyDown: ({ keyCode, target: { value } }) => {
    if (keyCode !== 13) return;
    const normalizedUrl = normalizeUrl(value);
    currentStoreState.onEnterLocation(normalizedUrl);
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
