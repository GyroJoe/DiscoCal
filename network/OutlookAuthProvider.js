"use strict";

const simpleoauth = require('simple-oauth2');

const Secrets = require('../config/Secrets');
const OAuthProvider = require('./OAuthProvider');

async function oauthFactory() {
    let secret = await Secrets.outlookSecret();

    const options = {
        client: {
            id: 'a61596a3-bd2a-40ff-9973-70c3691e3cc2',
            secret: secret
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
    
    return simpleoauth.create(options);
}

const scopes = 'https://outlook.office.com/calendars.readwrite offline_access';
const redirectUrlPath = '/callback/oauth/outlook';

module.exports = new OAuthProvider('outlook', oauthFactory(), redirectUrlPath, scopes);
