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
        var results = this.chrono.parse(text, referenceDate, { forwardDate: true });

        console.log(results);

        if (results.length == 0) {
            return null;
        }

        var title = text;
        var dates = [];
        results.slice().reverse().forEach(result => {
            title = title.substring(0, result.index) + title.substring(result.index + result.text.length);

            var start = result.start;
            var end = result.end;

            var date = { 
                start: start.date(),
                isAllDay: (!start.isCertain('hour') && start.get('hour') == 12) ||
                          (end && !end.isCertain('hour') && end.get('hour') == 12)
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

module.exports = TextDateExtractor;
