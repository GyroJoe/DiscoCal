"use strict";

const chrono = require('chrono-node');
const moment = require('moment');

function TodayPastNotFutureRefiner(parsers) {
    chrono.Refiner.apply(this, arguments);

    /**
     * @param {string} text
     * @param {[chrono.ParsedResult]} results
     */
    this.refine = function(text, results, opt) {
        results.forEach(result => {
            if (result.start.isCertain('year') || result.start.isCertain('hour') || result.start.isCertain('minute') || result.end != null) {
                return;
            }

            let ref = moment(result.ref);
            let start = result.start.moment();
            if (ref.date() == start.date() && ref.month() == start.month()) {
                result.start.imply('year', ref.year());
            }
        });

        return results;
    }
}

module.exports = TodayPastNotFutureRefiner;
