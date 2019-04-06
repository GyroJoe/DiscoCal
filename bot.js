"use strict";

const commando = require('discord.js-commando');
const auth = require('./auth.json');
const path = require('path');
const express = require('express');
const simpleoauth = require('simple-oauth2');

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

const oauthOptions = {
    client: {
        id: 'a61596a3-bd2a-40ff-9973-70c3691e3cc2',
        secret: ';eM18N&+i3U2Qm>o=QesEeQ#q@RJU22q|H]ydS*'
    },
    auth: {
        tokenHost: 'https://login.microsoftonline.com',
        tokenPath: '/common/oauth2/v2.0/token',
        authorizePath: '/common/oauth2/v2.0/authorize'
    },
    options: {
        authorizationMethod: /** @type {'body'}*/('body')
    }
};

const oauthOutlook = simpleoauth.create(oauthOptions);

let app = express();
app.get('/callback/oauth/outlook', async (req, res) => {
    let code = req.query.code;
    
    let tokenConfig = {
        code: code,
        redirect_uri: 'http://localhost:3000/callback/oauth/outlook'
    }
    let result = await oauthOutlook.authorizationCode.getToken(tokenConfig);

    res.send(result);
});

app.listen(3000);
