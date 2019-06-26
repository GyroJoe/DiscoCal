"use strict";

const commando = require('discord.js-commando');
const moment = require('moment');

const OutlookInterface = require('./OutlookInterface');

class EventCreator {
	/**
	 * @param {OutlookInterface} calendarInterface 
	 */
	constructor(calendarInterface) {
		this.calendarInterface = calendarInterface
	}

	/**
	 * @param {commando.CommandMessage} message 
	 * @param {{ title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] }} eventDescription 
	 */
	async CreateEvent(message, eventDescription) {
		let promises = []

		let subject = `${message.author.username} ${eventDescription.title}`;

		eventDescription.dates.forEach(element => {
			let end = element.end || element.start;
			let adjustedEnd = moment(end).add(1, 'days').toDate();

			promises.push(this.calendarInterface.CreateEvent(subject, element.start, adjustedEnd, element.isAllDay, "Pacific Standard Time", message.content));
		});
		
		return Promise.all(promises)
	}
}

module.exports = EventCreator
