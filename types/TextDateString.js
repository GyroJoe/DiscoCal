"use strict";

const Commando = require('discord.js-commando');
const TextDateExtractor = require('../calendar/TextDateExtractor');

class TextDateString extends Commando.ArgumentType {
    constructor(client) {
        super(client, 'textdatestring')

        this.extractor = new TextDateExtractor()
    }

    validate(val, msg, arg) {
        var result = this.extractor.extract(val, msg.createdAt);
        if (result == null) {
            return "Unable to determine date information from input, please try again.";
        }

        return true;
    }
    
    parse(val, msg) {
        var result = this.extractor.extract(val, msg.createdAt);
        return result;
    }
};

module.exports = TextDateString;