"use strict";

var program = require('commander');
const TextDateExtractor = require('./calendar/TextDateExtractor');

var dateString

program
    .arguments('<date-string...>')
    .action((dateStrings) => {
        dateString = dateStrings.join(' ')
    });
    
program.parse(process.argv);

let extractor = new TextDateExtractor();

console.log(`Extracting: 'dateString'`);
console.log(extractor.extract(dateString));
