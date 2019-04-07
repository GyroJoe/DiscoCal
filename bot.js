"use strict";

const commando = require('discord.js-commando');
const auth = require('./auth.json');
const path = require('path');
const sqlite = require('sqlite');
const express = require('express');

const OutlookAuth = require('./network/OutlookAuth');

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
app.get('/callback/oauth/outlook', async (req, res) => {
    let state = JSON.parse(req.query.state);

    let guild = /** @type commando.GuildExtension */ (client.guilds.get(state.guild));

    let code = req.query.code;
    
    let result = await OutlookAuth.getToken(code);

    guild.settings.set('token-outlook', result.token);

    res.send('Success');
});

app.listen(3000);
