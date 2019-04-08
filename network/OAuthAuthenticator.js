"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');

const OAuthProvider = require('./OAuthProvider');

module.exports = class OAuthAuthenticator {
    /**
     * @param {OAuthProvider} authProvider 
     */
    constructor(authProvider) {
        this.authProvider = authProvider;
    }

    /**
     * @param {commando.CommandMessage} msg 
     */
    async authorize(msg) {
        let dmChannel = await msg.author.createDM();

        let state = {
            guild: msg.guild.id,
            dmChannel: dmChannel.id
        };
        let authorizationUrl = this.authProvider.authorizationUrl(state);

        let embed = new discordjs.RichEmbed()
            .setTitle('Authorize DiscoCal')
            .setDescription('Authorize DiscoCal to use your account.')
            .setURL(authorizationUrl);

        await msg.direct('', { embed: embed });

        return msg.reply('Sent you a DM with more details.')
    }
};
