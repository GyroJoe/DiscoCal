"use strict";

const axios = require('axios');
const moment = require('moment');

const dateFormat = 'YYYY-MM-DDTHH:mm:ss';

class OutlookCalendarInterface {
	/**
	 * @param {string} token 
	 */
	constructor(token) {
		this.axios = axios.default.create({
			baseURL: 'https://outlook.office.com/api/v2.0/',
			headers: { 'Authorization': `Bearer ${token}` }
		});
	}

	/**
	 * @param {string} subject 
	 * @param {Date} startDate 
	 * @param {Date} endDate 
	 * @param {boolean} isAllDay 
	 * @param {string} timeZone 
	 * @param {string} body 
	 */
	async CreateEvent(subject, startDate, endDate, isAllDay, timeZone, body) {
		let event = {
			Subject: subject,
			Start: {
				"DateTime": moment(startDate).format(dateFormat),
				"TimeZone": timeZone
			},
			End: {
				"DateTime": moment(endDate).format(dateFormat),
				"TimeZone": timeZone
			},
			IsAllDay: isAllDay,
			IsReminderOn: false,
			Body: {
				ContentType: "Text",
				Content: body
			}
		};

		return this.axios.post('me/events', event);
	}
}

module.exports = OutlookCalendarInterface