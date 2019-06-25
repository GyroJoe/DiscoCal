"use strict";

const simpleoauth = require('simple-oauth2');

const protocol = process.env.WEBSITE_HOSTNAME ? 'https' : 'http';
const hostname = process.env.WEBSITE_HOSTNAME || 'localhost:3000';
const baseUrl = `${protocol}://${hostname}`;

module.exports = class OAuthProvider {
    /**
     * @param {string} name
     * @param {Promise<simpleoauth.OAuthClient>} oauthFactory
     * @param {string} redirectUrlPath
     * @param {string} scopes
     */
    constructor(name, oauthFactory, redirectUrlPath, scopes) {
        this.name = name;
        this.oauth = oauthFactory;
        this.redirectUrl = baseUrl + redirectUrlPath;
        this.scopes = scopes;

        this.oauthClient = null;
    }

    /**
     * @param {any} state
     * @returns {Promise<string>} Authorization URL
     */
    async authorizationUrl(state) {
        let oauth = await this.oauth;

        return oauth.authorizationCode.authorizeURL({
            redirect_uri: this.redirectUrl,
            scope: this.scopes,
            state: JSON.stringify(state)
        });
    }

    /**
     * @param {simpleoauth.Token} rawToken Raw OAuth token
     * @returns {Promise<simpleoauth.AccessToken>} Access token
     */
    async accessToken(rawToken) {
        let oauth = await this.oauth;
        return oauth.accessToken.create(rawToken);
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

        let oauth = await this.oauth;

        let rawToken = await oauth.authorizationCode.getToken(tokenConfig);

        return this.accessToken(rawToken);
    }
};
