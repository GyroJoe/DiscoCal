"use strict";

const commando = require('discord.js-commando');
const auth = require('./auth.json');
const path = require('path');

const client = new commando.CommandoClient({
    owner: [
        '559861066251894847', // joeflint
        '559793784771051531', // daleclai
    ]
});

client.registry
    .registerDefaults()
    .registerGroup('calendar', 'Calendar')
    .registerGroup('config', 'Configuration')
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(auth.token);
