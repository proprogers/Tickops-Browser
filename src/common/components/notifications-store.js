import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';

const store = create((set) => ({
  opened: false,
  type: '',
  message: '',
  show: ({ type, message }) => set(() => ({ opened: true, type, message })),
  close: () => set(() => ({ opened: false })),
  
}));


const getState = store.getState;
const setState = store.setState;
const useStore = getUseStore(store);

export { useStore, getState, setState };
