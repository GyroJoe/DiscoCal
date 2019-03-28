const auth = require('./auth.json')
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

class TestCases
{
	static RunAllTests()
	{
		TestCases.CreateAllDayEvents()
	}

	static CreateAllDayEvents() 
	{
		let bearer = auth.bearer
		let eventCreator = new EventCreator(new calendarInterface(bearer))

		let thursday = new Date(2019, 2, 28, 0, 0, 0, 0)
		let friday = new Date(2019, 2, 29, 0, 0, 0, 0)
		let saturday = new Date(2019, 2, 30, 0, 0, 0, 0)

		let dates = [thursday, friday, saturday]
		let isAllDayFlags = [true, true, true]

		eventCreator.CreateEvent("DanMan", dates, isAllDayFlags, (success)=> { } )
	}

}

TestCases.RunAllTests()

module.exports = EventCreator


