"use strict";

const discordjs = require('discord.js');
const simpleoauth = require('simple-oauth2');
const auth = require('../auth.json');

const options = {
    client: {
        id: 'a61596a3-bd2a-40ff-9973-70c3691e3cc2',
        secret: auth.outlookSecret
    },
    auth: {
        tokenHost: 'https://login.microsoftonline.com',
        tokenPath: '/common/oauth2/v2.0/token',
        authorizePath: '/common/oauth2/v2.0/authorize'
    },
    options: {
        authorizationMethod: /** @type {'body'}*/('body')
    }
};
const oauth = simpleoauth.create(options);

const scopes = 'https://outlook.office.com/calendars.readwrite offline_access';
const redirectUrl = 'http://localhost:3000/callback/oauth/outlook';

let OutlookAuth = {}

/**
 * @param {any} state
 * @returns {string} Authorization URL
 */
OutlookAuth.authorizationUrl = function authorizationUrl(state) {   
    return oauth.authorizationCode.authorizeURL({
        redirect_uri: redirectUrl,
        scope: scopes,
        state: JSON.stringify(state)
    });
}

/**
 * @param {simpleoauth.Token} rawToken Raw OAuth token
 * @returns {simpleoauth.AccessToken} Access token
 */
OutlookAuth.accessToken = function accessToken(rawToken) {
    return oauth.accessToken.create(rawToken);
}

/**
 * @param {string} code Authorization code
 * @returns {Promise<simpleoauth.AccessToken>} OAuth token
 */
OutlookAuth.getToken = async function getToken(code) {
    let tokenConfig = {
        code: code,
        redirect_uri: redirectUrl
    }

    let rawToken = await oauth.authorizationCode.getToken(tokenConfig);

    return OutlookAuth.accessToken(rawToken);
}

module.exports = OutlookAuth;
