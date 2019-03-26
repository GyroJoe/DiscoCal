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

            args: [
                {
                    key: 'eventDescription',
                    label: "event description",
                    prompt: 'Describe your event',
                    type: 'textdatestring'
                }
            ]
        });
    }

    run(msg, { eventDescription }) {
        return msg.reply(`Hello Commando! "${eventDescription.title}", ${eventDescription.dates.map(v => v.start)}`);
    }
};
