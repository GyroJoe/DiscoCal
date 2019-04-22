"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const auth = require('./auth.json');
const path = require('path');
const sqlite = require('sqlite');
const express = require('express');

const Authenticator = require('./network/Authenticator');

const client = new commando.CommandoClient({
    owner: [
        '559861066251894847', '106647509031452672', // joeflint
        '559793784771051531', // daleclai
    ]
});

client.registry
    .registerDefaults()
    .registerGroup('calendar', 'Calendar')
    .registerGroup('config', 'Configuration')
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

client.login(auth.token);

let app = express();
Authenticator.outlook.setupCallbackHandler(app, client);

app.listen(3000);
