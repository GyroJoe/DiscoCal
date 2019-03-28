"use strict";

const chrono = require('chrono-node');
const OrdinalDateParser = require('../calendar/OrdinalDateParser');
const RelativeWeekdayRefiner = require('../calendar/RelativeWeekdayRefiner');

class TextDateExtractor {
    constructor() {
        this.chrono = new chrono.Chrono();
        this.chrono.parsers.push(new OrdinalDateParser());
        this.chrono.refiners.push(new RelativeWeekdayRefiner());

        this.chrono.parsers = this.chrono.parsers.filter(parser => {
            // Remove 'ago' and 'later' parsers as they tend to think strings like "30 mins" are dates.
            if (parser instanceof chrono.parser.ENTimeAgoFormatParser ||
                parser instanceof chrono.parser.ENTimeLaterFormatParser) {
                return false;
            }

            return true;
        });
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

            if (dates.findIndex(otherDate => compareDates(date, otherDate)) == -1) {
                dates.push(date);
            }
        });

        dates.reverse();

        return { title: title.trim(), dates: dates };
    }
};

function compareDates(date, otherDate) {
    if (date.start.getTime() != otherDate.start.getTime()) {
        return false;
    }

    if ((date.end === undefined) != (otherDate.end === undefined)) {
        return false;
    }

    if (date.end && otherDate.end &&
        date.end.getTime() != otherDate.end.getTime()) {
        return false;
    }

    if (date.isAllDay != otherDate.isAllDay) {
        return false;
    }

    return true;
}

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
