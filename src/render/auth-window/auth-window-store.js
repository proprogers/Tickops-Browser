import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { ipcRenderer, dialog } from 'electron';
import os from 'os';
import { machineIdSync } from 'node-machine-id';
import { messages } from '@/common/consts';
import API from '@/API';

const { show: showNotification } = getNotificationsStoreState();

const store = create((set, get) => ({
  showErrorNotification: (message) => showNotification({ type: 'error', message }),
  email: '',
  loading: false,
  setLoading: (v) => set(() => ({ loading: v })),
  setEmail: (v) => set(() => ({ email: v })),
  password: '',
  setPassword: (v) => set(() => ({ password: v })),
  isError: false,
  setIsError: (v) => set(() => ({ isError: v })),
  onSubmit: async (event) => {
    event.preventDefault();
    const { email, password } = get();
    const credentials = {
      email,
      password,
      device: {
        id: machineIdSync(true),
        name: os.hostname()
      }
    };
    let token;
    try {
      token = await API.login({ credentials });
      await ipcRenderer.invoke(messages.AUTH_SUCCESS, { token:token });

    }  catch (e) {
      if (e.status === 409) { // different device
        try {
          await ipcRenderer.invoke(messages.AUTH_SUCCESS, { credentials, deviceName: e.message });
        } catch (e) {
          currentStoreState.setIsError(true);
          currentStoreState.showErrorNotification(e.message);
        }
        return;
      }
      currentStoreState.setIsError(true);
      if (e.status === 401) { // wrong login or password
        currentStoreState.showErrorNotification(e.message);
        return;
      }
      console.error(e);
      currentStoreState.showErrorNotification(e.message);
    }

    if (!token) {
      currentStoreState.setIsError(true);
      return;
    }
   
   
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
