"use strict";

const chrono = require('chrono-node');

function OrderFixupRefiner(parsers) {
    chrono.Refiner.apply(this, arguments);

    this.refine = function(text, results, opt) {
        // Resort results to respect the original parser order (i.e. the original order before resorting in Chrono.parse)
        // TODO: Remove this class if the upstream bug is fixed
        let parserIndexes = parsers.reduce((map, parser, i) => {
            map[parser.constructor.name] = i;

            return map;
        });

        results.sort((a, b) => {
            if (a.index == b.index) {
                // For ties, use the relative order of the source parsers
                let aParser = Math.min.apply(Math, Object.keys(a.tags).map((tag) => parserIndexes[tag] || parsers.length));
                let bParser = Math.min.apply(Math, Object.keys(b.tags).map((tag) => parserIndexes[tag] || parsers.length));
                return aParser - bParser;
            }

            return a.index - b.index;
        });

        return results;
    }
}

module.exports = OrderFixupRefiner
