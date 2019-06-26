"use strict";

const commando = require('discord.js-commando');

const EventCommand = require('./EventCommand');
const EventCreator = require('../../EventCreator');


module.exports = class CreateEventCommand extends EventCommand {
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

    /**
     * @param {commando.CommandMessage} msg
     * @param {{ eventDescription: { title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] } }} args
     */
    async run(msg, { eventDescription }) {
        return await this.createEvent(msg, eventDescription, EventCreator.Style.FULL);
    }
};
