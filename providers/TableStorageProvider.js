"use strict";

const azureStorage = require('azure-storage');
const commando = require('discord.js-commando');
const discordjs = require('discord.js');

const AsyncTableService = require('../network/AsyncTableService');

const table = 'settings';

/**
 * Uses Azure Table Storage to store settings for guilds
 * Based on commando.SQLiteProvider
 * @extends {commando.SettingProvider}
 */
class TableStorageProvider extends commando.SettingProvider {
	/**
     * @param {azureStorage.services.table.TableService} tableService
	 */
	constructor(tableService) {
		super();

		/**
		 * Table service that will be used for storing/retrieving settings
		 * @type {AsyncTableService}
		 */
		this.tableService = new AsyncTableService(tableService);

		/**
		 * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
		 * @name TableStorageProvider#client
		 * @type {commando.CommandoClient}
		 * @readonly
		 */
        Object.defineProperty(this, 'client', { value: null, writable: true });

		/**
		 * Settings cached in memory, mapped by guild ID (or 'global')
		 * @type {Map}
		 * @private
		 */
		this.settings = new Map();

		/**
		 * Listeners on the Client, mapped by the event name
		 * @type {Map}
		 * @private
		 */
		this.listeners = new Map();
	}

    /**
     * @param {commando.CommandoClient} client 
     */
	async init(client) {
        this.client = client;

        await this.tableService.createTableIfNotExists(table);

        // Load all settings
        let query = new azureStorage.TableQuery().where('PartitionKey eq ?', this.client.user.id);
        const rows = await this.tableService.queryAllEntities(table, query);
		for(const row of rows) {
            const guild = row.RowKey._
            
			let settings;
			try {
				settings = JSON.parse(row.settings._);
			} catch(err) {
				client.emit('warn', `TableStorageProvider couldn't parse the settings stored for guild ${guild}.`);
				continue;
			}
			this.settings.set(guild, settings);
			if(guild !== 'global' && !client.guilds.has(guild)) continue;
			this.setupGuild(guild, settings);
		}

		// Listen for changes
		this.listeners
			.set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.id}`, enabled))
			.set('guildCreate', guild => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', command => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.has(guild)) continue;
					this.setupGuildCommand(client.guilds.get(guild), command, settings);
				}
			})
			.set('groupRegister', group => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.has(guild)) continue;
					this.setupGuildGroup(client.guilds.get(guild), group, settings);
				}
			});
		for(const [event, listener] of this.listeners) client.on(event, listener);
	}

	async destroy() {
		// Remove all listeners from the client
		for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
		this.listeners.clear();
	}

	get(guild, key, defVal) {
		const settings = this.settings.get(commando.SettingProvider.getGuildID(guild));
		return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
	}

	async set(guild, key, val) {
		guild = commando.SettingProvider.getGuildID(guild);
		let settings = this.settings.get(guild);
		if(!settings) {
			settings = {};
			this.settings.set(guild, settings);
		}

        settings[key] = val;
        
        let entGen = azureStorage.TableUtilities.entityGenerator;
        let entity = {
            PartitionKey: entGen.String(this.client.user.id),
            RowKey: entGen.String(guild),
            settings: entGen.String(JSON.stringify(settings)),
        };
        await this.tableService.insertOrReplaceEntity(table, entity);
		if(guild === 'global') this.updateOtherShards(key, val);
		return val;
	}

	async remove(guild, key) {
		guild = commando.SettingProvider.getGuildID(guild);
		const settings = this.settings.get(guild);
		if(!settings || typeof settings[key] === 'undefined') return undefined;

		const val = settings[key];
        settings[key] = undefined;
        
        let entGen = azureStorage.TableUtilities.entityGenerator;
        let entity = {
            PartitionKey: entGen.String(this.client.user.id),
            RowKey: entGen.String(guild),
            settings: entGen.String(JSON.stringify(settings)),
        };
		await this.tableService.insertOrReplaceEntity(table, entity);
		if(guild === 'global') this.updateOtherShards(key, undefined);
		return val;
	}

	async clear(guild) {
		guild = commando.SettingProvider.getGuildID(guild);
		if(!this.settings.has(guild)) return;
        this.settings.delete(guild);

        let entGen = azureStorage.TableUtilities.entityGenerator;
        let entity = {
            PartitionKey: entGen.String(this.client.user.id),
            RowKey: entGen.String(guild),
        };
        await this.tableService.deleteEntity(table, entity);
	}

	/**
	 * Loads all settings for a guild
	 * @param {string} guildId - Guild ID to load the settings of (or 'global')
	 * @param {Object} settings - Settings to load
	 * @private
	 */
	setupGuild(guildId, settings) {
		if(typeof guildId !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		let guild = this.client.guilds.get(guildId) || null;

		// Load the command prefix
		if(typeof settings.prefix !== 'undefined') {
			// @ts-ignore
			if(guild) guild._commandPrefix = settings.prefix;
			// @ts-ignore
			else this.client._commandPrefix = settings.prefix;
		}

		// Load all command/group statuses
		for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?discordjs.Guild} guild - Guild to set the status in
	 * @param {commando.Command} command - Command to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
	setupGuildCommand(guild, command, settings) {
		if(typeof settings[`cmd-${command.name}`] === 'undefined') return;
		if(guild) {
			// @ts-ignore
            if(!guild._commandsEnabled) guild._commandsEnabled = {};
            // @ts-ignore
			guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
		} else {
			// @ts-ignore
			command._globalEnabled = settings[`cmd-${command.name}`];
		}
	}

	/**
	 * Sets up a group's status in a guild from the guild's settings
	 * @param {?discordjs.Guild} guild - Guild to set the status in
	 * @param {commando.CommandGroup} group - Group to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
	setupGuildGroup(guild, group, settings) {
		if(typeof settings[`grp-${group.id}`] === 'undefined') return;
		if(guild) {
			// @ts-ignore
			if(!guild._groupsEnabled) guild._groupsEnabled = {};
			// @ts-ignore
			guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
		} else {
			// @ts-ignore
			group._globalEnabled = settings[`grp-${group.id}`];
		}
	}

	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param {string} key - Key of the setting to update
	 * @param {*} val - Value of the setting
	 * @private
	 */
	updateOtherShards(key, val) {
		if(!this.client.shard) return;
		key = JSON.stringify(key);
		val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
		this.client.shard.broadcastEval(`
			if(this.shard.id !== ${this.client.shard.id} && this.provider && this.provider.settings) {
				let global = this.provider.settings.get('global');
				if(!global) {
					global = {};
					this.provider.settings.set('global', global);
				}
				global[${key}] = ${val};
			}
		`);
	}
}

module.exports = TableStorageProvider;
