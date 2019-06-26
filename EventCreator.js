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
	 * @param {commando.CommandMessage} msg 
	 * @param {{ title: String, dates: [{ start: Date, end: Date?, isAllDay: Boolean, }] }} eventDescription 
	 * @param {EventCreator.Style} style
	 */
	async create(msg, eventDescription, style) {
		let promises = []

		let subject;
		switch(style) {
			case EventCreator.Style.FULL:
				subject = eventDescription.title;
				break;

			case EventCreator.Style.OUT:
				subject = `${msg.author.username} out`;
				break;
		}

		eventDescription.dates.forEach(element => {
			let end = element.end || element.start;
			let adjustedEnd = moment(end).add(1, 'days').toDate();

			promises.push(this.calendarInterface.CreateEvent(subject, element.start, adjustedEnd, element.isAllDay, "Pacific Standard Time", msg.content));
		});
		
		return Promise.all(promises)
	}
}

/** @enum {Symbol} */
EventCreator.Style = Object.freeze({
	FULL: 	Symbol('full'),
	OUT:	Symbol('out'),
});

module.exports = EventCreator
