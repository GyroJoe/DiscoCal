"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const path = require('path');
const sqlite = require('sqlite');
const express = require('express');

const port = process.env.PORT || 3000;

const Secrets = require('./config/Secrets');
const Authenticator = require('./network/Authenticator');
const PingHandler = require('./network/PingHandler');

const client = new commando.CommandoClient({
    owner: [
        '559861066251894847', '106647509031452672', // joeflint
        '559793784771051531', // daleclai
    ]
});

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({ eval_: false })
    .registerGroup('calendar', 'Calendar')
    .registerGroup('config', 'Configuration')
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);

Secrets.discordToken().then((token) => client.login(token));

let app = express();
Authenticator.outlook.setupCallbackHandler(app, client);
PingHandler(app);

app.listen(port);
console.log('Server running at http://localhost:%d', port);
