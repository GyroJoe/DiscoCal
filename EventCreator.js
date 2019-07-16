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
		let promises = [];

		let name = msg.author.username;
		if (msg.member && msg.member.nickname) {
			name = msg.member.nickname;
		}

		let subject;
		switch (style) {
			case EventCreator.Style.FULL:
				subject = eventDescription.title;
				break;

			case EventCreator.Style.OUT:
				subject = `${name} out`;
				break;
		}

		eventDescription.dates.forEach(date => {
			let end = date.end || date.start;
			let adjustedEnd = date.isAllDay ? moment(end).add(1, 'days').toDate() : end;

			let body = `@${name}: ${msg.content}`;

			promises.push(this.calendarInterface.CreateEvent(subject, date.start, adjustedEnd, date.isAllDay, "Pacific Standard Time", body));
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
