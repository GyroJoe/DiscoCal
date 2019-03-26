"use strict";

const Commando = require('discord.js-commando');
const auth = require('./auth.json');
const path = require('path');

const client = new Commando.Client({
    owner: [
        '559861066251894847', // joeflint
        '559793784771051531', // daleclai
    ]
});

client.registry
    .registerDefaults()
    .registerGroup('calendar', 'Calendar')
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(auth.token);
