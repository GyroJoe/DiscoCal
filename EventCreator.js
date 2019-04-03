const calendarInterface = require('./OutlookInterface')

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
			promises.push(this.calendarInterface.CreateEvent(message.author.username, description.title, element.start, element.end, element.isAllDay, "Pacific Standard Time", message))
		});
		
		return Promise.all(promises)
	}
}

module.exports = EventCreator


