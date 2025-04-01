import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';

const store = create((set) => ({
  masterPasswordSalt: null,
  iv: null,
  masterPasswordHash: null,
  setUser: (v) => set(() => v),
  setUserProxy: (v) => set(() => v),
  userProxy: false,
  sessions: [],
  sessionsPortal: [],
  setSessions: (v = []) => set(() => ({ sessions: v.sort((one, two) => two.timestamp - one.timestamp) })),
  setSessionsPortal: (v = []) => set(() => ({ sessionsPortal: v.sort((one, two) => two.timestamp - one.timestamp) })),
  setSessionsPortalData:  (v) => set(() => v),
  traffic: {},
  setTraffic: (v) => set(() => ({ traffic: v })),
  savedSessionsLimit: 0,
  setSavedSessionsLimit: (v) => set(() => ({ savedSessionsLimit: v })),
}));

const useStore = getUseStore(store);
const getState = store.getState;
const setState = store.setState;

export { useStore, getState, setState };
