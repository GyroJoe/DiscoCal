"use strict";

const chrono = require('chrono-node');
const moment = require('moment');

const PATTERN = /(\W|^)(\d{1,2})(st|nd|rd|th)\s*\,?(?=\W|$)/i;

function InvalidOrdinalDateRefiner() {
    chrono.Refiner.apply(this, arguments);

    this.refine = function(text, results, opt) {
        return results.filter(result => result.start.knownValues.day <= 31);
    };
}

function OrdinalDateParser() {
    chrono.Parser.apply(this, arguments);

    // Originally based on: https://github.com/wanasit/chrono/issues/233#issuecomment-345490703
    this.pattern = function () { return PATTERN } 
    this.extract = function(text, ref, match, opt) {
        let refMoment = moment(ref);
        let startMoment = refMoment.clone();

        let date = parseInt(match[2]);

        if (date > 31) {
            // Creating a result even though this is an invalid date,
            // Otherwise the parser will just move forward one character - i.e. 44th => 4th.
            // These bogus results will be filtered out by InvalidOrdinalDateRefiner.
            return new chrono.ParsedResult({
                ref: ref,
                text: match[0],
                index: match.index,
                day: date,
            });
        }

        startMoment.date(date);

        if (startMoment < refMoment) {
            startMoment.add(1, 'months');
        }

        return new chrono.ParsedResult({
            ref: ref,
            text: match[0],
            index: match.index,
            start: {
                day: startMoment.date(),
                month: startMoment.month() + 1,
                // Force specifying year to make "today" (i.e. 24th on the 24th) work as expected.
                year: startMoment.year(),
            }
        });
    }

    // TODO: This shouldn't be required, but upstream this.refiners implementation seems broken.
    this.internalExecute = this.execute
    this.execute = function(text, ref, opt) {
        var results = this.internalExecute(text, ref, opt);

        if (this.internalRefiners) {
            this.internalRefiners.forEach(function (refiner) {
                results = refiner.refine(text, results, opt);
            });
        }

        return results;
    }

    this.internalRefiners = [ new InvalidOrdinalDateRefiner() ];
}

module.exports = OrdinalDateParser;
