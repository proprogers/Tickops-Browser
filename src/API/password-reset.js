const axios = require('axios');
const { server: { routes }, TOKEN_KEY, messages: { SETTINGS_SET } } = require('../common/consts');
const { server: { url } } = require('@/../config');
const Settings = require('../common/settings');
const { app} = require('electron');
const client = axios.create({ baseURL: url });
let token;

class PasswordReset {
    
    static async requestResetCode(email) {
        const response = await client.post('/users/request-reset-code', { email });
        return response.data;
    }

    static async verifyResetCode(email, code) {
        const response = await client.post('/users/verify-reset-code', { email, code });
        return response.data;
    }
    
    static async setNewPasscode(email, passcode) {
        const response = await client.post('/users/save-custom-password', { email, password: passcode });
        return response.data;
    }

    static async generateNewPasscode(email) {
        const response = await client.post('/users/generate-password', { email });
        return response.data;
    }
}

module.exports = PasswordReset;