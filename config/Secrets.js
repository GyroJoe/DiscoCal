'use strict';

const secrets = async function loadSecrets() {
    if (process.env.MSI_SECRET) {
        const azure = require('ms-rest-azure');
        const keyvault = require('azure-keyvault');

        // let credentials = await azure.interactiveLogin();
        let credentials = await azure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'});
    
        let keyVaultClient = new keyvault.KeyVaultClient(credentials);
    
        let discordTokenBundle = await keyVaultClient.getSecret('https://discocal-dev-kv.vault.azure.net/', 'discord-token', '');
        let outlookSecretBundle = await keyVaultClient.getSecret('https://discocal-dev-kv.vault.azure.net/', 'outlook-secret', '');
        let tableServiceConnectionStringBundle = await keyVaultClient.getSecret('https://discocal-dev-kv.vault.azure.net/', 'tableServiceConnectionString', '');

        return {
            discordToken: discordTokenBundle.value,
            outlookSecret: outlookSecretBundle.value,
            tableServiceConnectionString: tableServiceConnectionStringBundle.value,
        };
    }
    else
    {
        return require('../secrets.json');
    }    
}();

/**
 * @returns {Promise<string>}
 */
module.exports.discordToken = async function discordToken() {
    return (await secrets).discordToken;
}

/**
 * @returns {Promise<string>}
 */
module.exports.outlookSecret = async function outlookSecret() {
    return (await secrets).outlookSecret;
}

/**
 * @returns {Promise<string>}
 */
module.exports.tableServiceConnectionString = async function tableServiceConnectionString() {
    return (await secrets).tableServiceConnectionString;
}
