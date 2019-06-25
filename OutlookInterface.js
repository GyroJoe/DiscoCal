"use strict";

const axios = require('axios');
const moment = require('moment');

const dateFormat = 'YYYY-MM-DDTHH:mm:ss';

class OutlookCalendarInterface {
	constructor(bearer) {
		this.axios = axios.default.create({
			baseURL: 'https://outlook.office.com/api/v2.0/',
			headers: { 'Authorization': `Bearer ${bearer}` }
		});
	}

	async CreateEvent(userName, description, startDate, endDate, isAllDay, timeZone, originalMsg)
	{
		let event = {
			Subject: userName + " " + description,
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
				Content: originalMsg.content
			}
		};

		return this.axios.post('me/events', event);
	}
}

module.exports = OutlookCalendarInterface