"use strict";

const commando = require('discord.js-commando');
const moment = require('moment');

const EventCreator = require('../../eventCreator');
const CalendarInterface = require('../../OutlookInterface');
const auth = require('../../auth.json');

module.exports = class CreateEventCommand extends commando.Command {
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

    async run(msg, { eventDescription }) {
        let calendarInterface = new CalendarInterface(auth.bearer)
        let eventCreator = new EventCreator(calendarInterface)

        let eventStrings = eventDescription.dates.map(v => moment(v.start).format('l')).join(', ');

        let reply = await msg.reply(`Creating your events: ${eventStrings}`);

        let createdEvents = await eventCreator.CreateEvent(msg, eventDescription);
        console.log(createdEvents);

        let createdMessage = reply.content.replace('Creating your events:', 'Events created:')
        return await reply.edit(createdMessage);
    }
};
