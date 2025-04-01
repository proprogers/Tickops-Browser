import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { ipcRenderer } from 'electron';
import { messages } from '@/common/consts';
import { getDoubleHash } from '@/common/encryption-manager';
import API from '@/API';

const { show: showNotification } = getNotificationsStoreState();

const store = create((set, get) => ({
  password: '',
  setPassword: (v) => set(() => ({ password: v })),
  confirmedPassword: '',
  setConfirmedPassword: (v) => set(() => ({ confirmedPassword: v })),
  passwordHash: null,
  setPasswordHash: (v) => set(() => ({ passwordHash: v })),
  passwordSalt: null,
  setPasswordSalt: (v) => set(() => ({ passwordSalt: v })),

  isError: false,
  setIsError: (v) => set(() => ({ isError: v })),
  isSubmittedOnce: false,
  setIsSubmittedOnce: (v) => set(() => ({ isSubmittedOnce: v })),
  isPasswordShown: false,
  setIsPasswordShown: (v) => set(() => ({ isPasswordShown: v })),

  onSave: async (event) => {
    event.preventDefault();
    const { password, confirmedPassword } = get();
    if (!password || password !== confirmedPassword) {
      currentStoreState.setIsSubmittedOnce(true);
      currentStoreState.setIsError(true);
      return;
    }
    const { masterPasswordSalt } = await ipcRenderer.invoke(messages.GET_USER);
    const hash = getDoubleHash({ data: password, salt: masterPasswordSalt });
    try {
      await API.saveMasterPassword(hash);
      await ipcRenderer.invoke(messages.SET_MASTER_PASSWORD, password);
    } catch (e) {
      console.error(e);
      showNotification({ message: e.message, type: 'error' });
    }
  },
  onCheck: async (event) => {
    event.preventDefault();
    const { password, passwordHash, passwordSalt } = get();
    try {
      await ipcRenderer.invoke(messages.SET_MASTER_PASSWORD, password);
      if (passwordHash !== getDoubleHash({ data: password, salt: passwordSalt })) throw new Error('Invalid password');
    } catch (e) {
      currentStoreState.setIsError(true);
      console.error(e);
    }
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
