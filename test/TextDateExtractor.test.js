"use strict";

const TextDateExtractor = require('../calendar/TextDateExtractor')

var extractor = new TextDateExtractor(); 

test('simple date', () => {
    var message = { Date: "06-Sep-18", Content: "Out 9/11" };
    validateMessage(message, "Out", [{ isAllDay: true, start: { m: 9, d: 11, y: 2018 } }]);
});

test('simple ordinal date', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out on the 1st" };
    validateMessage(message, "I'm out on the", [{ isAllDay: true, start: { m: 4, d: 1, y: 2019 } }]);
});

test('tonight', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out Tonight" };
    validateMessage(message, "I'm out", [{ isAllDay: true, start: { m: 3, d: 26, y: 2019 } }]);
});

test('two dates', () => {
    var message = { Date: "10-Jul-17", Content: "going to be out 7/11 and 7/13 traveling"};
    validateMessage(message, "going to be out and traveling", [
        { isAllDay: true, start: { m: 7, d: 11, y: 2017 } },
        { isAllDay: true, start: { m: 7, d: 13 } },
    ]);
});

test('two dates with commas', () => {
    var message = { Date: "16-Dec-16", Content: "I'm out 12/20, 12/22" };
    validateMessage(message, "I'm out", [
        { isAllDay: true, start: { m: 12, d: 20, y: 2016 } },
        { isAllDay: true, start: { m: 12, d: 22 } },
    ]);
});

test('duplicate dates', () => {
    var message = { Date: "16-Dec-16", Content: "I'm out 12/20, 12/20" };
    validateMessage(message, "I'm out", [
        { isAllDay: true, start: { m: 12, d: 20, y: 2016 } },
    ]);
})

test('relative date', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out this tuesday" };
    validateMessage(message, "I'm out", [{ isAllDay: true, start: { m: 3, d: 26, y: 2019 } }]);
});

test('relative week', () => {
    var message = { Date: "09-May-17", Content: "I'm out this week" };
    validateMessage(message, "I'm out", [{ isAllDay: true, start: { m: 5, d: 7, y: 2017 } }]);
});

test('relative future week', () => {
    var message = { Date: "27-Mar-19", Content: "I'm out next week" };
    validateMessage(message, "I'm out", [{ isAllDay: true, start: { m: 4, d: 3, y: 2019 } }]);
});

test('simple relative week day chaining', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out next tuesday and thursday" };
    validateMessage(message, "I'm out  and", [
        { isAllDay: true, start: { m: 4, d: 2, y: 2019 } },
        { isAllDay: true, start: { m: 4, d: 4 } },
    ]);
});

test('relative week day chaining this resets', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out thursday, next friday, THIS friday, saturday" };
    validateMessage(message, "I'm out", [
        { isAllDay: true, start: { m: 3, d: 28, y: 2019 } },
        { isAllDay: true, start: { m: 4, d: 5 } },
        { isAllDay: true, start: { m: 3, d: 29 } },
        { isAllDay: true, start: { m: 3, d: 30 } },
    ]);
});

test('complex relative week day chaining', () => {
    var message = { Date: "26-Mar-19", Content: "I'm out thursday and also next tuesday and thursday" };
    validateMessage(message, "I'm out  and also  and", [
        { isAllDay: true, start: { m: 3, d: 28, y: 2019 } },
        { isAllDay: true, start: { m: 4, d: 2 } },
        { isAllDay: true, start: { m: 4, d: 4 } },
    ]);
});

test('multiple ordinal dates', () => {
    var message = { Date: "14-Dec-16", Content: "I'm out 20th, 22nd, 27th and the 29th" };
    validateMessage(message, "I'm out and the", [
        { isAllDay: true, start: { m: 12, d: 20, y: 2016 } },
        { isAllDay: true, start: { m: 12, d: 22 } },
        { isAllDay: true, start: { m: 12, d: 27 } },
        { isAllDay: true, start: { m: 12, d: 29 } },
    ]);
});

test('duration reference', () => {
    var message = { Date: "14-Dec-16", Content: "Present delivery 10 mins late on 12/25" };
    validateMessage(message, "Present delivery 10 mins late on", [
        { isAllDay: true, start: { m: 12, d: 25, y: 2016 } },
    ]);
});

test('tonight all day', () => {
    var message = { Date: "14-Dec-16", Content: "Out tonight (Dec 14)" };
    validateMessage(message, "Out  ()", [
        { isAllDay: true, start: { m: 12, d: 14, y: 2016 } },
    ]);
});

test('multi-parser match date ambiguity', () => {
    var message = { Date: "01-Jan-19", Content: "Out the week of 4/2, back on Saturday 4/7" };
    validateMessage(message, "Out the week of  back", [
        { isAllDay: true, start: { m: 4, d: 2, y: 2019 } },
        { isAllDay: true, start: { m: 4, d: 7 } },
    ]);
});

test('today current not future', () => {
    var message = { Date: "30-Jul-19 8:00 PM", Content: "7/30 Iffy tonight" };
    validateMessage(message, "Iffy", [
        { isAllDay: true, start: { m: 7, d: 30, y: 2019 } },
    ]);
});

function validateMessage(message, title, expectedDates) {
    var results = extractor.extract(message.Content, Date.parse(message.Date));

    expect(results.title).toBe(title);
    expect(results.dates.length).toBe(expectedDates.length);

    results.dates.forEach((date, i) => {
        var expectedDate = expectedDates[i];

        if (expectedDate.hasOwnProperty('isAllDay')) {
            expect(date.isAllDay).toBe(expectedDate.isAllDay);
        }

        if (expectedDate.hasOwnProperty('start')) {
            validateDate(date.start, expectedDate.start);
        }

        if (expectedDate.hasOwnProperty('end')) {
            validateDate(date.end, expectedDate.end);
        }
    });
}

function validateDate(date, expectedDate) {
    if (expectedDate.m) {
        expect(date.getMonth()).toBe(expectedDate.m - 1);
    }

    if (expectedDate.d) {
        expect(date.getDate()).toBe(expectedDate.d);
    }

    if (expectedDate.y) {
        expect(date.getFullYear()).toBe(expectedDate.y);
    }
};
