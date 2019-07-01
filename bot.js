"use strict";

const azureStorage = require('azure-storage');
const commando = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const express = require('express');

const port = process.env.PORT || 3000;

const Secrets = require('./config/Secrets');
const Authenticator = require('./network/Authenticator');
const PingHandler = require('./network/PingHandler');
const TableStorageProvider = require('./providers/TableStorageProvider');

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
    .registerCommands([
        require('./commands/config/Auth'),
        require('./commands/calendar/CreateEvent'),
        require('./commands/calendar/Out'),
    ]);

/**
 * @returns {Promise<commando.SettingProvider>}
 */
async function selectProvider() {
    let tableServiceConnectionString = await Secrets.tableServiceConnectionString();

    if (tableServiceConnectionString) {
        return new TableStorageProvider(azureStorage.createTableService(tableServiceConnectionString));
    } else {
        let db = await sqlite.open(path.join(__dirname, 'settings.sqlite3'));
        return new commando.SQLiteProvider(db);
    }
}

client.setProvider(selectProvider()).catch(console.error);

Secrets.discordToken().then((token) => client.login(token));

let app = express();
Authenticator.outlook.setupCallbackHandler(app, client);
PingHandler(app);

app.listen(port);
console.log('Server running at http://localhost:%d', port);
