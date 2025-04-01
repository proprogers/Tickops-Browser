import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';

const store = create((set) => ({
  goBack: null,
  setGoBack: (v) => set(() => ({ goBack: v })),

  isOpenLinkDialogOpened: false,
  setIsOpenLinkDialogOpened: (v) => set(() => ({ isOpenLinkDialogOpened: v })),
  openingLinkUrl: '',
  setOpeningLinkUrl: (v) => set(() => ({ openingLinkUrl: v })),

  // isEventbriteAutoCartingDialogOpened: false,
  // setIsEventbriteAutoCartingDialogOpened: (v) => set(() => ({ isEventbriteAutoCartingDialogOpened: v })),

  isAboutDialogOpened: false,
  setIsAboutDialogOpened: (v) => set(() => ({ isAboutDialogOpened: v })),

  isAddSessionDialogOpened: false,
  setIsAddSessionDialogOpened: (v) => set(() => ({ isAddSessionDialogOpened: v })),
  isEditSessionDialogOpened: false,
  setIsEditSessionDialogOpened: (v) => set(() => ({ isEditSessionDialogOpened: v })),
  sessionToEditOrDelete: null,
  setSessionToEditOrDelete: (v) => set(() => ({ sessionToEditOrDelete: v })),
  checkedSessionsMap: new Map(),
  setCheckedSessionsMap: (v) => set(() => ({ checkedSessionsMap: v })),

  isConfirmDeleteSessionsDialogOpened: false,
  setIsConfirmDeleteSessionsDialogOpened: (v) => set(() => ({ isConfirmDeleteSessionsDialogOpened: v })),
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy };
