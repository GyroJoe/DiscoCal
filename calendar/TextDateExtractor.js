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

            var date = { start: result.start.date() };
            if (result.end) {
                date.end = result.end.date();
            }

            dates.push(date)
        });

        return { title: title, dates: dates };
    }
};

module.exports = TextDateExtractor;
