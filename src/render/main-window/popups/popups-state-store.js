/* global window */
import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getPagesStoreState } from '../pages-store';
import { messages } from '@/common/consts';

const { getWebView } = getPagesStoreState();


function changePopupListeners(v) {
  const methodName = `${v ? 'add' : 'remove'}EventListener`;
  const type = 'mousedown';
  if(v){
    
    if(window.document.getElementById('titlebar')){
      window.document.getElementById('titlebar')[methodName](type, currentStoreState.closeAutoFillPaymentPopup);
    } else {
      window.document.getElementById('titlebar_left')[methodName](type, currentStoreState.closeAutoFillPaymentPopup);
    }
    
    window.document.getElementById('navbar')[methodName](type, currentStoreState.closeAutoFillPaymentPopup);
  }
}

const store = create((set,get) => ({
  isAutoFillPopupOpened: false,
  isAutoFillClose: false,
  setIsAutoFillPopupOpened: (v, param=false) => {
    changePopupListeners(v);
    
    if(!get().isAutoFillClose){
      // console.log(param);
     
      get().setIsAutoFillClose(param);
      set(() => ({ isAutoFillPopupOpened: v }));
    }
  },
  setIsAutoFillClose: (v) => {
    set(() => ({ isAutoFillClose: v }));
  },

  autoFillPopupParams: {
    x: 0,
    y: 0,
    width: '300px',
    height: '0',
    paymentDataId: null,
    pageId: null,
    frameId: null,
    type: 'auto-fill-payment',
    hostname: '',
    partition: null,
    dataName: null
  },
  setAutoFillPopupParams: (v) => set(() => ({ autoFillPopupParams: v })),

  
  closeAutoFillPaymentPopup: () => {
    // console.log("close")
    currentStoreState.setIsAutoFillPopupOpened(false);
  },
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();


export { useStore, getState, setState, subscribe, destroy };
