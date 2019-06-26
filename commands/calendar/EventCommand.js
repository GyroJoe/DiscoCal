"use strict";

const commando = require('discord.js-commando');
const discordjs = require('discord.js');
const moment = require('moment');

const Authenticator = require('../../network/Authenticator');
const CalendarInterface = require('../../OutlookInterface');
const EventCreator = require('../../EventCreator');

module.exports = class EventCommand extends commando.Command {
    /**
     * @param {commando.CommandMessage} msg
     * @param {{ title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] }} eventDescription
     * @param {EventCreator.Style} style
     */
    async createEvent(msg, eventDescription, style) {
        let eventStrings = eventDescription.dates.map(v => moment(v.start).format('l')).join(', ');

        let reply = /** @type discordjs.Message */ (await msg.reply(`Creating your events...`));

        await Authenticator.outlook.performRequest(msg.guild, async (token) => {
            let calendarInterface = new CalendarInterface(token)
            let eventCreator = new EventCreator(calendarInterface);
            let createdEvents = await eventCreator.create(msg, eventDescription, style);
            console.log(createdEvents);
        });

        let createdMessage = reply.content.replace('Creating your events...', `Events created: ${eventStrings}`)
        return await reply.edit(createdMessage);
    }
}
