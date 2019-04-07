"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const moment = require('moment');

const EventCreator = require('../../eventCreator');
const CalendarInterface = require('../../OutlookInterface');
const OutlookAuth = require('../../network/OutlookAuth');

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

        let reply = /** @type discordjs.Message */ (await msg.reply(`Creating your events: ${eventStrings}`));

        let guild = /** @type commando.GuildExtension */ (msg.guild);
        let rawToken = guild.settings.get('token-outlook');

        let token = OutlookAuth.accessToken(rawToken);

        try {
            await createEvents(token, msg, eventDescription);
        } catch (error) {
            if (error.response && error.response.status == 401) {
                token = await token.refresh();

                await createEvents(token, msg, eventDescription);
            }
            else {
                throw error;
            }
        }

        let createdMessage = reply.content.replace('Creating your events:', 'Events created:')
        return await reply.edit(createdMessage);
    }
};

async function createEvents(token, msg, eventDescription) {
    let calendarInterface = new CalendarInterface(token.token.access_token)
    let eventCreator = new EventCreator(calendarInterface);
    let createdEvents = await eventCreator.CreateEvent(msg, eventDescription);
    console.log(createdEvents);
}
