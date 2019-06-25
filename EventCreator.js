const calendarInterface = require('./OutlookInterface')
const moment = require('moment');

class EventCreator
{
	constructor(calendarInterface)
	{
		this.calendarInterface = calendarInterface
	}

	async CreateEvent(message, description)
	{
		let promises = []

		description.dates.forEach(element => {
			let end = element.end || element.start;
			let adjustedEnd = moment(end).add(1, 'days').toDate();
			
			promises.push(this.calendarInterface.CreateEvent(message.author.username, description.title, element.start, adjustedEnd, element.isAllDay, "Pacific Standard Time", message));
		});
		
		return Promise.all(promises)
	}
}

module.exports = EventCreator


