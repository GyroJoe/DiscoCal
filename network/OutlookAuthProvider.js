"use strict";

const simpleoauth = require('simple-oauth2');
const auth = require('../auth.json');

const OAuthProvider = require('./OAuthProvider');

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

module.exports = new OAuthProvider('outlook', oauth, redirectUrl, scopes);
