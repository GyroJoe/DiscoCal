"use strict";

const commando = require('discord.js-commando');

const EventCommand = require('./EventCommand');
const EventCreator = require('../../EventCreator');

module.exports = class OutCommand extends EventCommand {
    constructor(client) {
        super(client, {
            name: 'create-out-event',
            aliases: ['out'],
            group: 'calendar',
            memberName: 'create-out-event',
            description: 'Creates an out event.',

            args: [
                {
                    key: 'outDatesDescription',
                    label: "out dates description",
                    prompt: 'Describe when you will be out',
                    type: 'textdatestring'
                }
            ]
        });
    }

    /**
     * @param {commando.CommandMessage} msg
     * @param {{ outDatesDescription: { title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] } }} args
     */
    async run(msg, { outDatesDescription }) {
        return await this.createEvent(msg, outDatesDescription, EventCreator.Style.OUT);
    }
};
