"use strict";

var program = require('commander');
const TextDateExtractor = require('./calendar/TextDateExtractor');

var dateString

program
    .option('-d --reference-date <date>', 'Reference date to use for extraction', val => new Date(val), Date())
    .parse(process.argv);

let extractor = new TextDateExtractor();

var dateString = program.args.join(' ');
console.log(`Extracting: '${dateString.toString()}'`);
console.log(`Reference: ${program.referenceDate}`);
console.log(extractor.extract(dateString, program.referenceDate));
