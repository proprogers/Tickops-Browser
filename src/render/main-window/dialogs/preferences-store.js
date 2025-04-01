import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import Settings from '@/common/settings';
import { PREFERENCES_KEY } from '@/common/consts';

const store = create((set, get) => ({
  isPreferencesDialogOpened: false,
  setIsPreferencesDialogOpened: (v) => set(() => ({ isPreferencesDialogOpened: v })),
  checkedSet: new Set(),
  setLeftBar:  (v) => set(() => ({ leftBar: v })),
  setUserProxy:  (v) => set(() => ({ userProxy: v })),
  leftBar: false,
  userProxy: false,
  handleToggle: (value) => async () => {

    console.log(value);
   
    const checkedSet = get().checkedSet;
    const isPresent = checkedSet.has(value);

    if(value == 'tabRedefine'){
      set(() => ({ leftBar: isPresent }));
    }

    if(value == 'userProxy'){
      set(() => ({ userProxy: isPresent }));
    }

    if(value == 'recap'){
      set(() => ({ recap: isPresent }));
    }
    
    console.log(isPresent);
    const newCheckedSet = new Set([...checkedSet]);
    newCheckedSet[isPresent ? 'delete' : 'add'](value);

    await Settings.set(PREFERENCES_KEY, [...newCheckedSet]);

    set(() => ({ checkedSet: newCheckedSet }));
  },
  initPreferences: async () => {
    const preferencesArray = await Settings.get(PREFERENCES_KEY) || [];
    set(() => ({ checkedSet: new Set(preferencesArray) }));
  },
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy };
