const axios = require('axios');
const { server: { routes }, TOKEN_KEY, messages: { SETTINGS_SET } } = require('../common/consts');
const { server: { url } } = require('@/../config');
const Settings = require('../common/settings');
const { app} = require('electron');
const client = axios.create({ baseURL: url });
let token;

Settings.on(SETTINGS_SET, (key, value) => {
  if (key === TOKEN_KEY) token = value;
});

async function getConfig() {
  let aToken = token;
  if (!aToken) {
    token = await Settings.get(TOKEN_KEY)
    aToken = token;
  }
  return { headers: { 'Authorization': `Bearer ${aToken}` } };
}

class API {
  static async getUserByToken(token) {
    try {
      return (await client.post(routes.CHECK_TOKEN, { token })).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async login(credentials) {
    try {
      return (await client.post(routes.LOGIN, credentials)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getNewSession({ platform, count }) {
    try {
      const config = await getConfig();
      count = count ? `&count=${count}` : '';
      const url = `${routes.RANDOM_SESSION}?platform=${platform}${count}`;
      return (await client.get(url, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getSavedSessions() {
    try {
      const config = await getConfig();
      return (await client.get(routes.SESSIONS, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async saveSession(data) {
    try {
      const config = await getConfig();
      return (await client.post(routes.SESSIONS, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async editSession(data) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.SESSIONS}/edit/`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async refreshIp({ sessionLogin, partition }) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.SESSIONS}/refresh/`, { sessionLogin, partition }, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async deleteSessions(partitions) {
    try {
      const config = await getConfig();
      const url = `${routes.SESSIONS}${partitions}`;
      return (await client.delete(url, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async saveMasterPassword(hash) {
    try {
      const config = await getConfig();
      return (await client.patch(routes.MASTER_PASSWORD, { hash }, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async saveMPDecode(hash) {
    try {
      const config = await getConfig();
      return (await client.patch(routes.MPDECODE, { mpDecode:hash }, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getUsage() {
    try {
      const config = await getConfig();
      return (await client.get(routes.USAGE, config)).data
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getTrafficLimits() {
    try {
      const config = await getConfig();
      return (await client.get(routes.TRAFFIC_LIMITS, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async sendFingerprint(fingerprint) {
    try {
      const config = await getConfig();
      return (await client.post(routes.FINGERPRINTS, fingerprint, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getIntegrations() {
    try {
      const config = await getConfig();
      return (await client.get(routes.INTEGRATIONS, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }
  
  static async saveIntegrationsData(data) {
    try {
      const config = await getConfig();
      return (await client.post(routes.INTEGRATIONS, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async editIntegrationsData({ id, data }) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.INTEGRATIONS}${id}`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getPaymentData() {
    try {
      const config = await getConfig();
      return (await client.get(routes.PAYMENT, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async savePaymentData(data) {
    try {
      const config = await getConfig();
      return (await client.post(routes.PAYMENT, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async editPaymentData({ id, data }) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.PAYMENT}${id}`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async deletePaymentData(id) {
    try {
      const config = await getConfig();
      return client.delete(`${routes.PAYMENT}${id}`, config);
    } catch (e) {
      throw formatError(e);
    }
  }

  static async saveSiteCredentials(data) {
    try {
      const config = await getConfig();
      return (await client.post(routes.SAVED_CREDENTIALS, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async bulkSaveSiteCredentials(data) {
    try {
      const config = await getConfig();
      return (await client.post(`${routes.SAVED_CREDENTIALS}bulk`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async getSitesCredentials() {
    try {
      const config = await getConfig();
      return (await client.get(routes.SAVED_CREDENTIALS, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async editSiteCredentials({ id, data }) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.SAVED_CREDENTIALS}${id}`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async editSitesCredentialsPartitions(data) {
    try {
      const config = await getConfig();
      return (await client.patch(`${routes.SAVED_CREDENTIALS}`, data, config)).data;
    } catch (e) {
      throw formatError(e);
    }
  }

  static async deleteSiteCredentials(id) {
    try {
      const config = await getConfig();
      return client.delete(`${routes.SAVED_CREDENTIALS}${id}`, config);
    } catch (e) {
      throw formatError(e);
    }
  }

}

function formatError(originalError) {
  if (!originalError.response) return originalError;
  const error = new Error();
  error.message = originalError.response.data.message;
  error.status = originalError.response.status;
  error.statusText = originalError.response.statusText;
  error.stack = originalError.stack;
  // if(error.status == 401){
  //   app.quit();
  // }
  return error;
}

module.exports = API;
