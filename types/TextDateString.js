"use strict";

const commando = require('discord.js-commando');
const moment = require('moment');
const momentTimezone = require('moment-timezone');

const TextDateExtractor = require('../calendar/TextDateExtractor');

class TextDateString extends commando.ArgumentType {
    constructor(client) {
        super(client, 'textdatestring')

        this.extractor = new TextDateExtractor()
    }

    validate(val, msg, arg) {
        let createdAt = moment(msg.createdAt).tz('America/Los_Angeles');
        let result = this.extractor.extract(val, createdAt);
        if (result == null) {
            return "Unable to determine date information from input, please try again.";
        }

        return true;
    }
    
    parse(val, msg) {
        let createdAt = moment(msg.createdAt).tz('America/Los_Angeles');
        let result = this.extractor.extract(val, createdAt);
        return result;
    }
};

module.exports = TextDateString;