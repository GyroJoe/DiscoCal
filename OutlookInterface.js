"use strict";

const axios = require('axios');
const dateFormat = require('dateFormat')

class OutlookCalendarInterface {
	constructor(bearer) {
		this.axios = axios.default.create({
			baseURL: 'https://outlook.office.com/api/v2.0/',
			headers: { 'Authorization': `Bearer ${bearer}` }
		});
	}

	async CreateEvent(userName, description, startDate, endDate, isAllDay, timeZone, originalMsg)
	{
		let dateFormatString = "yyyy-mm-dd'T'HH:MM:ss"

		// If is all day meeting, remove the time info
		if (isAllDay) {
			var startDateText = dateFormat(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0), dateFormatString)
			var endDateText = dateFormat(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 0, 0, 0, 0), dateFormatString)
		}
		else {
			// Format time string from date
			var startDateText = dateFormat(startDate, dateFormatString)
			var endDateText = dateFormat(endDate, dateFormatString)
		}

		let event = {
			Subject: userName + " " + description,
	  	Start: {
	      		"DateTime": startDateText,
	      		"TimeZone": timeZone
	  	},
	  	End: {
	      		"DateTime": endDateText,
	      		"TimeZone": timeZone
	  	},
			IsAllDay: isAllDay,
			Body: {
				ContentType: "Text",
				Content: originalMsg.content
			}
		};

		return this.axios.post('me/events', event);
	}
}

module.exports = OutlookCalendarInterface