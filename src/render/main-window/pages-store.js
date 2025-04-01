import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPasswordsStoreState } from './dialogs/passwords-store';
import { getState as getPreferencesStoreState } from './dialogs/preferences-store';
import { ipcRenderer } from 'electron';
import { messages, NEW_TAB, OTHER_TAB, CUSTOM_PROTOCOL } from '@/common/consts';
import SessionManager from '@/common/session-manager/render';
import psl from 'psl';
// import { get } from '../../common/settings/render';

const {
  setSavingCredentials,
  setIsSavingCredentialsDialogOpened
} = getPasswordsStoreState();

const store = create((set, get) => ({
  pageIdCounter: 0,
  increasePageId: () => set(({ pageIdCounter }) => ({ pageIdCounter: pageIdCounter + 1 })),
  activePageId: 0,
  getActivePageId: () => {return get().activePageId},
  setActivePageId: (v) => set(() => ({ activePageId: v })),
  tabs: [],
  pagesMap: new Map(),
  addPage: (page) => set(({ tabs, pagesMap }) => {
    return {
      tabs: [...tabs, page.id],
      pagesMap: new Map([...pagesMap, [page.id, page]]),
    };
  }),
  editPages: (pagesToEdit) => set(({ pagesMap }) => {

    // var date = new Date().getTime();
    // console.log("edit pages start "+date)

    const editedPages = pagesToEdit.map(({ pageId, props }) => {
      const page = pagesMap.get(pageId);
      return [pageId, { ...page, ...props }];
    }, []);

    // var date = new Date().getTime();
    // console.log("edit pages end "+date)

    // console.log(editedPages)

    return { pagesMap: new Map([...pagesMap, ...editedPages]) };
  }),
  pagesToEditBulk: [],
  bulkEditPages: (pages) => {
    if (!get().pagesToEditBulk.length) {
      setTimeout(() => {
        set(({ pagesToEditBulk }) => {
          currentStoreState.editPages(pagesToEditBulk);
          return { pagesToEditBulk: [] };
        });
      }, 1000);
    }
    set(({ pagesToEditBulk }) => ({ pagesToEditBulk: [...pagesToEditBulk, ...pages] }));
  },
  reorderTabs: ({ startIndex, endIndex }) => set(({ tabs }) => {
    const [removed] = tabs.splice(endIndex, 1);
    tabs.splice(startIndex, 0, removed);
    return { tabs: [...tabs] };
  }),
  reorderTabsReverse: ({ startIndex, endIndex }) => set(({ tabs }) => {
   
    // const [removed] = tabs.splice(tabs.length-1-endIndex, 1);
    // console.log(removed);
    // tabs.splice(startIndex, 0, removed);
    tabs.reverse();
    const [removed] = tabs.splice(endIndex, 1);
    tabs.splice(startIndex, 0, removed);
    tabs.reverse();

   
    // console.log(tabs);

    return { tabs: [...tabs]};
    
    
  }),
  // const reorderReversedArray = (arr, fromIndex, toIndex) => {
  //   const element = arr[fromIndex];
  //   arr.splice(arr.length - fromIndex - 1, 1);
  //   arr.splice(arr.length - toIndex - 1, 0, element);
  //   return arr;
  // }

  
  closePages: (pagesToClose) => set(({ tabs, pagesMap, activePageId }) => {
    if (!tabs.length || !pagesToClose.length) return;
    const pagesToCloseIdsSet = new Set(pagesToClose.map((id) => id));
    const tabsToKeepOpened = tabs.filter((id) => {
      const needToClose = pagesToCloseIdsSet.has(id);
      if (needToClose) {
        pagesMap.delete(id);
      }
      if (needToClose && id === activePageId) {
        activePageId = null;
      } else if (activePageId === null) {
        activePageId = id;
      }
      return !needToClose;
    });
    if (!tabsToKeepOpened.length) {
      ipcRenderer.invoke('on-browser-window-close');
      return;
    }
    const newPagesMap = new Map(pagesMap);
    currentStoreState.removePagesFromCache(pagesToClose, [...newPagesMap]);
    return {
      activePageId: activePageId || tabsToKeepOpened[tabsToKeepOpened.length - 1],
      tabs: tabsToKeepOpened,
      pagesMap: newPagesMap
    };
  }),
  removePagesFromCache: (closedPages, pagesLeftOpen) => {
    const tabs = pagesLeftOpen || (() => {
      const closedPagesIdsSet = new Set(closedPages.map((page) => page.id));
      return [...get().pagesMap].filter(([id]) => !closedPagesIdsSet.has(id));
    })();
    const pagesPartitionsSet = new Set(tabs.map(({ session = {} }) => session.partition));
    const pagesToRemoveFromCache = closedPages.reduce((filtered, { session = {} }) => {
      if (!pagesPartitionsSet.has(session.partition)) filtered.push(session.partition);
      return filtered;
    }, []);
    if (pagesToRemoveFromCache.length) {
      ipcRenderer.invoke(messages.REMOVE_PAGES_FROM_CACHE, pagesToRemoveFromCache);
    }
  },

  loadedFramesMap: new Map(),
  addLoadedIframe: ({ frameId, pageId }) => set(({ loadedFramesMap, getWebView }) => {
    const {
      webview = getWebView(pageId),
      framesIds = []
    } = loadedFramesMap.get(pageId) || {};
    return {
      loadedFramesMap: new Map([
        ...loadedFramesMap,
        [pageId, {
          framesIds: [...framesIds, frameId],
          webview
        }]
      ])
    };
  }),
  removePageFromLoadedFramesMap: (pageId) => set(({ loadedFramesMap }) => {
    loadedFramesMap.delete(pageId);
    return {
      loadedFramesMap: new Map([...loadedFramesMap])
    };
  }),
  autoFillPaymentData: ({ pageId, item, needToClear }) => {
    if (pageId === null) return;
    const { framesIds, webview } = get().loadedFramesMap.get(pageId) || {};
    if (!framesIds || !webview) return;
    framesIds.forEach((frameId) => {
      webview.sendToFrame(frameId, messages.FILL_PAYMENT_DATA_IN_IFRAME, item, needToClear);
    });
  },
  autoFillSms: ({ message, number }) => {
    get().loadedFramesMap.forEach(({ webview, framesIds }) => {
      if (!webview) return;
      framesIds.forEach((frameId) => {
        webview.sendToFrame(frameId, messages.ON_SMS, { number, message });
      });
    });
  },
  getPageObject: (id) => {
    const state = get();
    return state.pagesMap.get(typeof id == 'undefined' ? state.activePageId : id);
  },
  createTab: async ({ params = {}, extraPartitionId, cookies, isActive = true }) => {
    const hash_id = makeid(8);
    const state = get();
    const id = state.pageIdCounter;
   
    currentStoreState.increasePageId();
    
    !params.location && (params.location = ``);
    const page = {
      hash_id: hash_id,
      title: false,
      statusText: false,
      previousTab: currentStoreState.getActivePageId(),
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
      canRefresh: false,
      isActiveInBg: true,
      siteCredentialsToSave: null,
      ...params,
      id,
    };


    if (page.session) {
      page.session.isProxyOn = true;
    }

    currentStoreState.addPage(page);
    if (isActive) currentStoreState.setActivePageId(id);
    if (!page.session) {
      await SessionManager.get({ extraPartitionId, cookies})
        .then((session) => {
          
    
          currentStoreState.editPages([{
            pageId: page.id,
            props: { session },
            // isLoading: false
          }]);
        
          
        });
    } 

    return id;
  },
  openNewTab: async (isActive) => currentStoreState.createTab({ params: { location: NEW_TAB }, isActive }),
  openOtherTab: async (isActive) => currentStoreState.createTab({ params: { location: OTHER_TAB }, isActive }),
  openNewWindow: async () => await ipcRenderer.invoke('create-window'),
  reloadIframe: async (frameUrl, x, y) => {
    const scriptsToRun = [];
    scriptsToRun.push("iframe=document.elementFromPoint(" + x + "," + y + ");iframe.src ='" + frameUrl + "'");
    currentStoreState.getPageObject().webview.executeJavaScript(scriptsToRun.join(';'));
  },
  nextTab: (pagesToClose) => set(({ tabs, pagesMap, activePageId }) => {
    const tab = activePageId;
    const nextTabs = pageChecker(tabs, tab, 'next');
    activePageId = tabs[nextTabs];
    const newPagesMap = new Map(pagesMap);
    currentStoreState.removePagesFromCache(pagesToClose, [...newPagesMap]);
    return {
      activePageId: activePageId,
      tabs: tabs,
      pagesMap: newPagesMap
    };
  }),
  previousTab: (pagesToClose) => set(({ tabs, pagesMap, activePageId }) => {
    const tab = activePageId;
    const previousTabs = pageChecker(tabs, tab, 'previous');
    activePageId = tabs[previousTabs];
    const newPagesMap = new Map(pagesMap);
    currentStoreState.removePagesFromCache(pagesToClose, [...newPagesMap]);
    return {
      activePageId: activePageId,
      tabs: tabs,
      pagesMap: newPagesMap
    };
  }),
  webviews: {},
  setPageIdWebviewPair: (pageId, webview) => set(({ webviews }) => {
    webviews[pageId] = webview;
    return { webviews };
  }),
  deletePageIdWebviewPair: (pageId) => set(({ webviews }) => {
    return { webviews: webviews.delete(pageId) };
  }),
  getWebView: (id) => {
    const state = get();
    if (typeof id == 'undefined') {
      id = currentStoreState.getPageObject().id;
    }
    return state.webviews[id];
  },
  loadingSessions: {},
  setSessionLoading: ({ value, pageId, name = '' }) => set(({ loadingSessions }) => {
    if (value) {
      loadingSessions[pageId] = name;
    } else {
      delete loadingSessions[pageId];
    }
    return { loadingSessions };
  }),
  /*autoCartingLoadingCards: {},
  setAutoCartingLoading: ({ value, pageId }) => set(({ autoCartingLoadingCards }) => {
    if (value) {
      autoCartingLoadingCards[pageId] = true;
    } else {
      delete autoCartingLoadingCards[pageId];
    }
    return { autoCartingLoadingCards };
  }),*/

  editPageSiteCredentials: (pageId, data) => {
    const siteCredentialsToSave = data ? currentStoreState.getPageObject(pageId).siteCredentialsToSave || {} : null;
    if (data) {
      if (typeof data.login === 'string') {
        siteCredentialsToSave.login = data.login;
      }
      if (typeof data.password === 'string') {
        siteCredentialsToSave.password = data.password;
      }
    } else {
      setSavingCredentials({
        login: '',
        password: '',
        location: '',
        partition: null,
        alreadySavedItem: null,
        pageId: null
      });
    }
    currentStoreState.editPages([{
      pageId: pageId,
      props: {
        siteCredentialsToSave
      }
    }]);
  },

  suggestToSaveOrUpdateSiteCredentials: (pageId) => {
    const { checkedSet } = getPreferencesStoreState();
    if (!checkedSet.has('suggestToSaveCredentials')) return;
    const { siteCredentialsToSave, location, session } = currentStoreState.getPageObject(pageId);
    if (!siteCredentialsToSave || !siteCredentialsToSave.password) return;
    const { sitesCredentialsArray } = getPasswordsStoreState();
    const currHostname = psl.get(location.split('/')[2]);
    const alreadySavedItem = siteCredentialsToSave.login
      && sitesCredentialsArray.find(({ login, hostname }) => {
        return siteCredentialsToSave.login === login && currHostname === hostname;
      });
    if (alreadySavedItem && alreadySavedItem.password === siteCredentialsToSave.password) return;
    setIsSavingCredentialsDialogOpened(true);
    setSavingCredentials({
      alreadySavedItemId: alreadySavedItem ? alreadySavedItem._id : null,
      login: siteCredentialsToSave.login,
      password: siteCredentialsToSave.password,
      partition: session.credentials ? session.partition : null,
      location,
      pageId
    });
  },

  catchLoadingUrlError: (e) => {
    console.info('Loading Url Error:', e.message);
  },

  webviewMenuParams: {},
  setWebviewMenuParams: (v) => set(() => ({ webviewMenuParams: v })),
  tabMenuParams: {},
  setTabMenuParams: (v) => set(() => ({ tabMenuParams: v })),

  handleCookiesChange: (partition, newValue) => {
    const pagesToEdit = [...get().pagesMap].reduce((filtered, [id, page]) => {
      if (page?.session?.partition === partition) {
        filtered.push({
          pageId: id,
          props: { session: { ...page.session, hasCookies: !!newValue } }
        });
      }
      return filtered;
    }, []);
    pagesToEdit.map(curr => console.log(curr.props.session.hasCookies))
    currentStoreState.editPages(pagesToEdit);
  },
}));

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function pageChecker(tabs, tab, action) {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i] == tab && i == tabs.length - 1 && action == 'next') {
      return 0;
    }
    if (tabs[i] == tab && i == 0 && action == 'previous') {
      return tabs.length - 1;
    }
    if (tabs[i] == tab) {
      if (action == 'next') {
        return i + 1;
      }
      if (action == 'previous') {
        return i - 1;
      }
    }
  }
}

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy };

const currentStoreState = getState();

