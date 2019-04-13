"use strict";

const simpleoauth = require('simple-oauth2');

module.exports = class OAuthProvider {
    /**
     * @param {string} name
     * @param {simpleoauth.OAuthClient} oauth
     * @param {string} redirectUrl
     * @param {string} scopes
     */
    constructor(name, oauth, redirectUrl, scopes) {
        this.name = name;
        this.oauth = oauth;
        this.redirectUrl = redirectUrl;
        this.scopes = scopes;
    }

    /**
     * @param {any} state
     * @returns {string} Authorization URL
     */
    authorizationUrl(state) {   
        return this.oauth.authorizationCode.authorizeURL({
            redirect_uri: this.redirectUrl,
            scope: this.scopes,
            state: JSON.stringify(state)
        });
    }

    /**
     * @param {simpleoauth.Token} rawToken Raw OAuth token
     * @returns {simpleoauth.AccessToken} Access token
     */
    accessToken(rawToken) {
        return this.oauth.accessToken.create(rawToken);
    }

    /**
     * @param {string} code Authorization code
     * @returns {Promise<simpleoauth.AccessToken>} OAuth token
     */
    async getToken(code) {
        let tokenConfig = {
            code: code,
            redirect_uri: this.redirectUrl
        }

        let rawToken = await this.oauth.authorizationCode.getToken(tokenConfig);

        return this.accessToken(rawToken);
    }
};
