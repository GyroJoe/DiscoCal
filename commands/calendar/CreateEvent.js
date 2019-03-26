"use strict";

const Commando = require('discord.js-commando');

module.exports = class CreateEventCommand extends Commando.Command {
    constructor(client) {
		super(client, {
            name: 'create-event',
            aliases: ['event'],
			group: 'calendar',
			memberName: 'create-event',
			description: 'Creates an event.',
		});
	}

	run(msg) {
        return msg.reply('Hello Commando!');
	}
};
