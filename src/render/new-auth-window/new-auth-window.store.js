import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { ipcRenderer } from 'electron';
import os from 'os';
import { machineIdSync } from 'node-machine-id';
import { messages } from '@/common/consts';
import API from '@/API';

const { show: showNotification } = getNotificationsStoreState();

const initialState = {
  email: '',
  password: '',
  loading: false,
  isError: false,
  errorMessage: ''
};

const actions = {
  setEmail: (email) => ({ email }),
  setPassword: (password) => ({ password }),
  setLoading: (loading) => ({ loading }),
  setIsError: (isError) => ({ isError }),
  setErrorMessage: (message) => ({ errorMessage: message }),
  resetForm: () => initialState,

  showErrorNotification: (message) => {
    showNotification({ type: 'error', message });
  }
};

const store = create((set, get) => ({
  ...initialState,
  ...Object.keys(actions).reduce((acc, actionName) => {
    acc[actionName] = (...args) => set(actions[actionName](...args));
    return acc;
  }, {}),

  handleSubmit: async () => {
    const { 
      email, 
      password, 
      setLoading, 
      setIsError, 
      setErrorMessage
    } = get();

    setLoading(true);

    const credentials = {
      email,
      password,
      device: {
        id: machineIdSync(true),
        name: os.hostname()
      }
    };

    try {
      const token = await API.login({ credentials });
      await ipcRenderer.invoke(messages.AUTH_SUCCESS, { token });
      return true;
    } catch (e) {
      setIsError(true);

      if (e.status === 409) { // different device
        try {
          await ipcRenderer.invoke(messages.AUTH_SUCCESS, { 
            credentials, 
            deviceName: e.message 
          });
          return true;
        } catch (innerError) {
          setErrorMessage(innerError.message);
        }
      } else if (e.status === 401) {
        setErrorMessage("Your email or password is incorrect. Please try again");
      } else {
        setErrorMessage(e.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }

    return false;
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

export { useStore, getState, setState, subscribe, destroy }; 