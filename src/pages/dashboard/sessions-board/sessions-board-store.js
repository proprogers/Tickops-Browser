import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';

const store = create((set) => ({
  isFilterOpened: false,
  setIsFilterOpened: (v) => set(() => ({ isFilterOpened: v })),
  filterValue: '',
  setFilterValue: (v) => set(() => ({ filterValue: v })),
  handleFilterButtonClick: () => set(({ isFilterOpened }) => {
    if (isFilterOpened) {
      currentStoreState.setFilterValue('');
    }
    return { isFilterOpened: !isFilterOpened };
  }),
  checkedSessions: [],
  setCheckedSessions: (v) => set(() => ({ checkedSessions: v })),
  page: 0,
  setPage: (v) => set(() => ({ page: v })),
  rowsPerPage: 10,
  setRowsPerPage: (v) => set(() => ({ rowsPerPage: v })),
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
