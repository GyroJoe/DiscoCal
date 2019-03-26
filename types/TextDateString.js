"use strict";

const Commando = require('discord.js-commando');
const TextDateExtractor = require('../calendar/TextDateExtractor');

class TextDateString extends Commando.ArgumentType {
    constructor(client) {
        super(client, 'textdatestring')

        this.extractor = new TextDateExtractor()
    }

    validate(val, msg, arg) {
        if (!this.extractor.extract(val)) {
            return "Unable to determine date information from input, please try again.";
        }

        return true;
    }
    
    parse(val) {
        return val;
    }
};

module.exports = TextDateString;