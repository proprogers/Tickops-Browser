import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';

const store = create((set, get) => ({
  isCartingVisible: false,
  setCartingVisibility: (v) => set(() => ({ isCartingVisible: v })),

  cartingMenuAnchorEl: null,
  setCartingMenuAnchorEl: (v) => set(() => ({ cartingMenuAnchorEl: v })),

  isEtixCartingDialogOpened: false,
  setIsEtixCartingDialogOpened: (v) => set(() => ({ isEtixCartingDialogOpened: v })),
  jsessionToken: '',
  setJsessionToken: (v) => set(() => ({ jsessionToken: v })),
  bigserverToken: '',
  setBigserverToken: (v) => set(() => ({ bigserverToken: v })),
  etixCartUrl: 'https://www.etix.com/ticket/online/performanceSale.do?method=viewShoppingCart',

  isTicketwebCartingDialogOpened: false,
  setIsTicketwebCartingDialogOpened: (v) => set(() => ({ isTicketwebCartingDialogOpened: v })),
  ecmToken: '',
  login: 1,
  setEcmToken: (v) => set(() => ({ ecmToken: v})),
  setTicketwebToken: (v) => set(() => ({login: v})),
  ticketwebCartUrl: 'https://www.ticketweb.com/twlogin',

  isFrontgateTicketsCartingDialogOpened: false,
  setIsFrontgateTicketsCartingDialogOpened: (v) => set(() => ({ isFrontgateTicketsCartingDialogOpened: v })),
  fgSessid: '',
  setFgSessid: (v) => set(() => ({ fgSessid: v })),
  fgCartUrl: '',
  setFgCartUrl: (v) => set(() => ({ fgCartUrl: v })),

  isSeeticketsCartingDialogOpened: false,
  setIsSeeticketsCartingDialogOpened: (v) => set(() => ({ isSeeticketsCartingDialogOpened: v })),
  wafSessionIdToken: '',
  setWafSessionIdToken: (v) => set(() => ({ wafSessionIdToken: v })),
  seeticketsCartUrl: '',
  setSeeticketsCartUrl: (v) => set(() => ({ seeticketsCartUrl: v })),
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy };
