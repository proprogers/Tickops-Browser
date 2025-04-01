/* global FileReader */
import create from 'zustand';
import { getUseStore } from '@/common/store-middleware';
import { getState as getNotificationsStoreState } from '@/common/components/notifications-store';
import { getState as getUserStoreState } from '@/common/components/user-store';
import { SITES_CREDENTIALS_KEY } from '@/common/consts';
import EncryptionManager from '@/common/encryption-manager';
import Settings from '@/common/settings';
import API from '@/API';
import psl from 'psl';

const { show: showNotification } = getNotificationsStoreState();

const encryptPassword = (data) => {
  const { iv, masterPasswordHash } = getUserStoreState();
  return EncryptionManager.encrypt({
    data,
    iv,
    masterPasswordHash
  });
};

const store = create((set) => ({
  fileInputValue: '',
  setFileInputValue: (v) => set(() => ({ fileInputValue: v })),
  isPasswordsManagerDialogOpened: false,
  setIsPasswordsManagerDialogOpened: (v) => set(() => ({ isPasswordsManagerDialogOpened: v })),
  isSavingCredentialsDialogOpened: false,
  setIsSavingCredentialsDialogOpened: (v) => set(() => ({ isSavingCredentialsDialogOpened: v })),
  savingCredentials: {
    login: '',
    password: '',
    location: '',
    partition: null,
    alreadySavedItemId: null,
    pageId: null
  },
  sitesCredentials: {},
  sitesCredentialsArray: [],
  sitesFreeCredentialsArray: [],
  setSitesCredentials: (v) => {
    const { masterPasswordHash, iv } = getUserStoreState();
    if (!masterPasswordHash || !iv) return;
    const decrypt = (data) => EncryptionManager.decrypt({ data, iv, masterPasswordHash });
    const sitesCredentialsArray = v && v
      .map((cred) => ({ ...cred, password: cred.password && decrypt(cred.password) }))
      .sort((a, b) => a.hostname > b.hostname
        ? 1
        : a.hostname < b.hostname
          ? -1
          : b.partition ? 1 : -1
      );
    const sitesCredentials = v ? {} : null;
    if (sitesCredentials) {
      sitesCredentialsArray.forEach((cred) => {
        sitesCredentials[cred.hostname] = sitesCredentials[cred.hostname]
          ? [...sitesCredentials[cred.hostname], cred]
          : [cred]
      });
    }
    const sitesFreeCredentialsArray = sitesCredentialsArray.filter(({ partition }) => !partition)
    set(() => ({ sitesCredentials, sitesCredentialsArray, sitesFreeCredentialsArray }));
  },
  setSavingCredentials: (v) => set(() => ({ savingCredentials: v })),
  checkedPasswordsIdsArray: [],
  setCheckedPasswordsIdsArray: (v) => set(() => ({ checkedPasswordsIdsArray: v })),
  savePassword: async ({ hostname, login, password }) => {
    if (!hostname || !login || !password) {
      showNotification({ message: 'Please, fill all the fields to save a password', type: 'error' });
      return;
    }
    try {
      const newSiteDataItemWithId = await API.saveSiteCredentials({
        login,
        password: encryptPassword(password),
        hostname: psl.get(hostname) || hostname,
        partition: null
      });
      await Settings.addToArray(SITES_CREDENTIALS_KEY, newSiteDataItemWithId);
    } catch (e) {
      const message = 'Error adding new password';
      showNotification({ message, type: 'error' });
      console.error(e);
      throw e;
    }
    showNotification({ message: 'The password was successfully saved', type: 'success' });
  },
  editPassword: async ({ id, hostname, login, password }) => {
    try {
      const editedPasswordDataWithId = await API.editSiteCredentials({
        id,
        data: { hostname, login, password: encryptPassword(password) }
      });
      await Settings.findAndUpdateArrayItems(SITES_CREDENTIALS_KEY, [
        { value: editedPasswordDataWithId, findIndexFunc: ({ _id }) => _id === id },
      ]);
    } catch (e) {
      const message = 'Error editing record';
      showNotification({ message, type: 'error' });
      console.error(e);
      throw e;
    }
    showNotification({ message: 'The record was successfully edited', type: 'success' });
  },
  deletePassword: async (id) => {
    try {
      await API.deleteSiteCredentials(id);
    } catch (e) {
      const message = 'Error deleting password';
      showNotification({ message, type: 'error' });
      console.error(e);
      return;
    }
    await Settings.findAndRemoveArrayItems(SITES_CREDENTIALS_KEY, [({ _id }) => _id === id]);
    showNotification({ message: 'The password was successfully deleted', type: 'success' });
  },
  getParsedCsvCredentialsArray: (content) => {
    const lines = content.split(/\r\n|\n|\r/);
    const keys = lines.shift().split(',');
    const newCredentialsArray = [];
    let count = 0;
    lines.forEach((line, i) => {
      count = 0;
      newCredentialsArray[i] = {};
      line.split(',').forEach((v) => {
        newCredentialsArray[i][keys[count++]] = v;
      });
    });
    let nonSavedCount = 0;
    const array = newCredentialsArray.reduce((filtered, { url, username, password }) => {
      if (url && password) {
        filtered.push({
          login: username,
          password: encryptPassword(password),
          hostname: psl.get(url.split('/')[2]) || url,
          partition: null
        });
      } else {
        nonSavedCount++;
      }
      return filtered;
    }, []);
    return { array, nonSavedCount };
  },
  bulkSaveCredentials: async ({ array, nonSavedCount }) => {
    try {
      if (array.length) {
        const newSiteDataItemsWithIds = await API.bulkSaveSiteCredentials(array);
        await Settings.bulkAddToArray(SITES_CREDENTIALS_KEY, newSiteDataItemsWithIds);
      }
      const message = `${array.length} passwords saved out of ${array.length + nonSavedCount}`;
      showNotification({ message, type: 'success' });
    } catch (e) {
      const message = 'Error bulk adding passwords';
      showNotification({ message, type: 'error' });
      console.error(e);
      throw e;
    }
  },
  handleImport: ({ target: { files } }) => {
    const reader = new FileReader();
    reader.onload = async ({ target: { result } }) => {
      currentStoreState.setFileInputValue('');
      const { array, nonSavedCount } = currentStoreState.getParsedCsvCredentialsArray(result);
      await currentStoreState.bulkSaveCredentials({ array, nonSavedCount });
    }
    reader.readAsText(files[0]);
  }
}));

const useStore = getUseStore(store);
const { getState, setState, subscribe, destroy } = store;

const currentStoreState = getState();

export { useStore, getState, setState, subscribe, destroy };
