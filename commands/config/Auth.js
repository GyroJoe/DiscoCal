"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');

const OAuthAuthenticator = require('../../network/OAuthAuthenticator');
const OutlookAuthProvider = require('../../network/OutlookAuthProvider');

module.exports = class AuthCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'auth',
            group: 'config',
            memberName: 'auth',
            description: 'Authenticate with a service.',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,

            args: [
                {
                    key: 'service',
                    prompt: 'What service do you want to authenticate? (Outlook)',
                    type: 'string',
                    // @ts-ignore
                    oneOf: ['outlook'],
                    default: 'outlook'
                }
            ]
        });
    }

    /**
     * @param {commando.CommandMessage} msg
     * @param {{service: string}} args
     */
    async run(msg, { service }) {
        switch (service.toLowerCase()) {
            case 'outlook':
                let authenticator = new OAuthAuthenticator(OutlookAuthProvider);
                authenticator.authorize(msg);
                break;
        
            default:
                return msg.reply(`Unknown service: ${service}`);
                break;
        }
    }
};
