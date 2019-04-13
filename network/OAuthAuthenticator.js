"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const express = require('express');
const url = require('url');

const OAuthProvider = require('./OAuthProvider');

module.exports = class OAuthAuthenticator {
    /**
     * @param {OAuthProvider} authProvider 
     */
    constructor(authProvider) {
        this.authProvider = authProvider;
        this.tokenSettingName = `token-${this.authProvider.name}`
    }

    /**
     * @param {commando.CommandMessage} msg 
     */
    async authorize(msg) {
        let botName = msg.client.user.username;
        let dmChannel = await msg.author.createDM();

        let state = {
            guild: msg.guild.id,
            dmChannel: dmChannel.id
        };
        let authorizationUrl = this.authProvider.authorizationUrl(state);

        let embed = new discordjs.RichEmbed()
            .setTitle(`Authorize ${botName}`)
            .setDescription(`Authorize ${botName} to use your account.`)
            .setURL(authorizationUrl);
        await msg.direct('', { embed: embed });

        return msg.reply('Sent you a DM with more details.')
    }

    /**
     * @param {express.Express} app
     * @param {discordjs.Client} client
     */
    setupCallbackHandler(app, client) {
        let route = url.parse(this.authProvider.redirectUrl).path;

        app.get(route, async (req, res, next) => {
            try {
                let state = JSON.parse(req.query.state);
                let dmChannel = /** @type discordjs.DMChannel */ (client.channels.get(state.dmChannel));
                let guild = /** @type commando.GuildExtension */ (client.guilds.get(state.guild));
            
                let code = req.query.code;
                let result = await this.authProvider.getToken(code);
            
                guild.settings.set(this.tokenSettingName, result.token);
            
                dmChannel.send(`Authorization successful for ${guild.name}.`)
            
                res.send('Success');
            } catch (error) {
                next(error)
            }
        });
    }

    /**
     * @param {discordjs.Guild} guild
     * @param {(token: string) => Promise} operation
     */
    async performRequest(guild, operation) {
        let guildExtension = /** @type commando.GuildExtension */ (guild);
        let rawToken = guildExtension.settings.get(this.tokenSettingName);

        let token = this.authProvider.accessToken(rawToken);

        try {
            await operation(token.token.access_token);
        } catch (error) {
            if (error.response && error.response.status == 401) {
                token = await token.refresh();

                await operation(token.token.access_token)
            }
            else {
                throw error;
            }
        }
    }
};
