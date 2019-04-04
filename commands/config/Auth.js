"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const simpleoauth = require('simple-oauth2');

const oauthOptions = {
    client: {
        id: 'a61596a3-bd2a-40ff-9973-70c3691e3cc2',
        secret: ''
    },
    auth: {
        tokenHost: 'https://login.microsoftonline.com',
        tokenPath: '/common/oauth2/v2.0/token',
        authorizePath: '/common/oauth2/v2.0/authorize'
    },
};

const oauthOutlook = simpleoauth.create(oauthOptions);

module.exports = class AuthCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'auth',
            group: 'config',
            memberName: 'auth',
            description: 'Authenticate with a service.',
            userPermissions: ['ADMINISTRATOR'],

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
                let authorizationUrl = oauthOutlook.authorizationCode.authorizeURL({
                    redirect_uri: 'http://localhost:3000/callback/oauth/outlook',
                    scope: 'https://outlook.office.com/calendars.readwrite offline_access'
                });

                await msg.reply('Sending you a DM with more details.')

                let embed = new discordjs.RichEmbed()
                    .setTitle('Authorize DiscoCal')
                    .setDescription('Authorize DiscoCal to use your account.')
                    .setURL(authorizationUrl);

                return msg.direct('', { embed: embed });
                break;
        
            default:
                return msg.reply(`Unknown service: ${service}`);
                break;
        }
    }
};
