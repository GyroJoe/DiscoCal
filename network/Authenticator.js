'use strict';

const OAuthAuthenticator = require('./OAuthAuthenticator');
const OutlookAuthProvider = require('./OutlookAuthProvider');

module.exports.outlook = new OAuthAuthenticator(OutlookAuthProvider);
