const axios = require('axios');
const { server: { routes }, TOKEN_KEY, messages: { SETTINGS_SET } } = require('../common/consts');
const { server: { tickops_url, tickops_token } } = require('@/../config');
const Settings = require('../common/settings');
const { app} = require('electron');
const client = axios.create({ baseURL: tickops_url });
let token = tickops_token;


async function getConfig() {
  let aToken = token;
  return { headers: { 'Authorization': `Bearer ${aToken}`, 'Accept':'application/json', 'Content-Type':'application/json' } };
}

class TICKOPS {

  static async auth({id}) {
    try {
        const config = await getConfig();
        const url = `${routes.API_PROXIES}${id}/auth`;
        const result = await client.get(url, config);
        return  result.data;
      } catch (e) {
        return e;
        throw formatError(e);
      }
  }

  static async getSavedProxies({id}) {
    try {
        const config = await getConfig();
        const url = `${routes.API_PROXIES}${id}/buyer-profiles`;
        const result = await client.get(url, config)
        return result.data;
      } catch (e) {
        return e;
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
  if(error.status == 401){
    app.quit();
  }
  return error;
}

module.exports = TICKOPS;
