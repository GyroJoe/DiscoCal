"use strict";

const Chrono = require('chrono-node');

class TextDateExtractor {
    extract(text, referenceDate) {
        var results = Chrono.parse(text, referenceDate);

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

        return { title: title.trim(), dates: dates };
    }
};

module.exports = TextDateExtractor;
