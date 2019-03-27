"use strict";

const chrono = require('chrono-node');

function RelativeWeekdayRefiner() {
    chrono.Refiner.apply(this, arguments);

    this.refine = function(text, results, opt) {
        if (results.length < 2) {
            return results;
        }

        var lastRelativeResult;

        results.forEach(result => {
            if (result.tags['ENWeekdayParser'] && result.start.isCertain('day')) {
                lastRelativeResult = result;
                return;
            }

            if (lastRelativeResult && result.tags['ENWeekdayParser'] && !result.start.isCertain('day')) {
                let startMoment = lastRelativeResult.start.moment();
                startMoment.day(result.start.get('weekday'));

                result.start.imply('day', startMoment.date());
                result.start.imply('month', startMoment.month() + 1);
                result.start.imply('year', startMoment.year());
            }
        });

        return results;
    }
}

module.exports = RelativeWeekdayRefiner;