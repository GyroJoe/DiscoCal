"use strict";

const chrono = require('chrono-node');
const OrdinalDateParser = require('../calendar/OrdinalDateParser');
const RelativeWeekdayRefiner = require('../calendar/RelativeWeekdayRefiner');

class TextDateExtractor {
    constructor() {
        this.chrono = new chrono.Chrono();
        this.chrono.parsers.push(new OrdinalDateParser());
        this.chrono.refiners.push(new RelativeWeekdayRefiner());
    }

    extract(text, referenceDate) {
        let results = this.chrono.parse(text, referenceDate, { forwardDate: true });

        if (results.length == 0) {
            return null;
        }

        let title = text;
        let dates = [];
        results.slice().reverse().forEach(result => {
            title = title.substring(0, result.index) + title.substring(result.index + result.text.length);

            let start = result.start;
            let end = result.end;

            let date = { 
                start: start.date(),
                isAllDay: treatAsAllDay(result, start) || treatAsAllDay(result, end)
            };

            if (end) {
                date.end = end.date();
            }

            dates.push(date)
        });

        dates.reverse();

        return { title: title.trim(), dates: dates };
    }
};

function treatAsAllDay(result, parsedDate) {
    if (!parsedDate) {
        return false;
    }

    if (parsedDate.isCertain('hour')) {
        return false;
    }

    if (parsedDate.get('hour') == 12) {
        return true;
    }

    // Chrono defaults 'tonight' to be 10pm. Treat this as all-day.
    if (result.tags['ENCasualDateParser'] && 
        result.text.toLowerCase().includes('tonight') && parsedDate.get('hour') == 22) {
        return true;
    }

    return false;
}

module.exports = TextDateExtractor;
