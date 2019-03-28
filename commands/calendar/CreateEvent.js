"use strict";

const Commando = require('discord.js-commando');

const EventCreator = require('../../eventCreator')
const CalendarInterface = require('../../OutlookInterface')
const Auth = require('../../auth.json')

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
        let calendarInterface = new CalendarInterface(Auth.bearer)
        let eventCreator = new EventCreator(calendarInterface)

        eventCreator.CreateEvent(msg, eventDescription).then((createdEvents) => {
            console.log(createdEvents);
        }).catch(error => {
            console.log(error);
        })

        return msg.reply(`Hello Commando! "${eventDescription.title}", ${eventDescription.dates.map(v => v.start)}`)
    }
};
