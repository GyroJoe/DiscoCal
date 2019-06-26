"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const moment = require('moment');

const Authenticator = require('../../network/Authenticator');
const EventCreator = require('../../EventCreator');
const CalendarInterface = require('../../OutlookInterface');

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

    /**
     * @param {commando.CommandMessage} msg
     * @param {{ eventDescription: { title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] } }} args
     */
    async run(msg, { eventDescription }) {
        let eventStrings = eventDescription.dates.map(v => moment(v.start).format('l')).join(', ');

        let reply = /** @type discordjs.Message */ (await msg.reply(`Creating your events...`));

        await Authenticator.outlook.performRequest(msg.guild, async (token) => {
            let calendarInterface = new CalendarInterface(token)
            let eventCreator = new EventCreator(calendarInterface);
            let createdEvents = await eventCreator.CreateEvent(msg, eventDescription);
            console.log(createdEvents);
        });

        let createdMessage = reply.content.replace('Creating your events...', `Events created: ${eventStrings}`)
        return await reply.edit(createdMessage);
    }
};
