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

            let includesThis = result.text.toLowerCase().includes('this');
            if (lastRelativeResult && result.tags['ENWeekdayParser']) {
                if (!result.start.isCertain('day') && !includesThis) {
                    let startMoment = lastRelativeResult.start.moment();
                    startMoment.day(result.start.get('weekday'));

                    result.start.imply('day', startMoment.date());
                    result.start.imply('month', startMoment.month() + 1);
                    result.start.imply('year', startMoment.year());
                }

                if (includesThis) {
                    lastRelativeResult = undefined;
                }
            }
        });

        return results;
    }
}

module.exports = RelativeWeekdayRefiner;