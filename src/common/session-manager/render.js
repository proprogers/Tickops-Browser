const { ipcRenderer } = require('electron');
const { messages, SESSIONS_KEY, PAYMENT_DATA_KEY, SITES_CREDENTIALS_KEY } = require('../consts');
const Settings = require('@/common/settings');
const API = require('@/API');
const EncryptionManager = require('../encryption-manager');

class SessionManager {
  static async get({ partition, extraPartitionId, cookies, state,state_name }) {
    const result = await ipcRenderer.invoke(messages.SESSION_GET, { partition, extraPartitionId, cookies,state,state_name });
    if (result.error) throw result.error;
    return result;
  }

  static async save({ name, email, password, paymentDataId, tel, checkedPasswordsIdsArray, userProxy }) {
    const { masterPasswordHash, iv } = await ipcRenderer.invoke(messages.GET_USER);

    try {
      const platform = process.platform === 'darwin' ? 'MacIntel' : 'Win32';
      const encPassword = EncryptionManager.encrypt({ data: password, iv, masterPasswordHash });
      const session = await API.saveSession({
        platform,
        credentials: { name, email, tel },
        paymentDataId,
        userProxy
      });
      if (paymentDataId) {
        await this.editPaymentDataItem({ id: paymentDataId, data: { partition: session.partition } });
      }
      const newSiteDataItemWithId = await API.saveSiteCredentials({
        login: email,
        password: encPassword,
        hostname: 'ticketmaster.com',
        partition: session.partition
      });
      await Settings.addToArray(SITES_CREDENTIALS_KEY, newSiteDataItemWithId);
      const passwordsIdsArray = [...checkedPasswordsIdsArray, newSiteDataItemWithId._id];
      await this.editSitesCredentialsPartitions([{ partition: session.partition, ids: passwordsIdsArray }]);

      await Settings.addToArray(SESSIONS_KEY, session);
    } catch (e) {
      throw new Error(e.response ? e.response.data.message : e.message);
    }
  }

  static async edit({ partition, paymentDataId, previousPaymentDataId, savedPasswordsArray, proxy, tel }) {
    try {
      const savedSessions = await Settings.get(SESSIONS_KEY) || [];
      const index = savedSessions.findIndex((curr) => curr.partition === partition);
      await API.editSession({
        partition,
        paymentDataId,
        previousPaymentDataId,
        proxy,
        tel,
        oldTel: savedSessions[index].credentials.tel
      });
      savedSessions[index].credentials.tel = tel;
      if (proxy) {
        savedSessions[index].proxy = { ...savedSessions[index].proxy, ...proxy };
        await ipcRenderer.invoke(messages.EDIT_PROXY, savedSessions[index]); // TODO: ?
      }
      if (previousPaymentDataId !== paymentDataId) {
        savedSessions[index].paymentDataId = paymentDataId;
        await Settings.findAndUpdateArrayItems(PAYMENT_DATA_KEY, [
          { value: { partition }, findIndexFunc: ({ _id }) => _id === paymentDataId },
          { value: { partition: null }, findIndexFunc: ({ _id }) => _id === previousPaymentDataId },
        ]);
      }
      await Settings.set(SESSIONS_KEY, savedSessions);
      await ipcRenderer.invoke(messages.SESSION_EDIT, savedSessions[index]);
      ipcRenderer.sendToHost(messages.SESSION_EDIT, savedSessions[index]);

      await this.editSitesCredentialsPartitions(savedPasswordsArray);
    } catch (e) {
      throw new Error(e.response ? e.response.data.message : e.message);
    }
  }

  static async editPaymentDataItem({ id, data }) {
    await API.editPaymentData({ id, data });
    await Settings.findAndUpdateArrayItems(PAYMENT_DATA_KEY, [
      { value: data, findIndexFunc: ({ _id }) => _id === id },
    ]);
  }

  static async editSitesCredentialsPartitions(array) {
    await API.editSitesCredentialsPartitions(array);
    const toUpdateArray = [];
    array.forEach(({ ids, partition }) => {
      ids.forEach((id) => toUpdateArray.push({
        value: { partition },
        findIndexFunc: ({ _id }) => _id === id
      }));
    });
    await Settings.findAndUpdateArrayItems(SITES_CREDENTIALS_KEY, toUpdateArray);
  }
}

module.exports = SessionManager;
