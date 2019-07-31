"use strict";

let program = require('commander');
const TextDateExtractor = require('./calendar/TextDateExtractor');

program
    .option('-d --reference-date <date>', 'Reference date to use for extraction', val => new Date(val), new Date())
    .parse(process.argv);

let extractor = new TextDateExtractor();

let dateString = program.args.join(' ');
console.log(`Extracting: '${dateString.toString()}'`);
console.log(`Reference: ${program.referenceDate}`);
console.log(extractor.extract(dateString, program.referenceDate));
