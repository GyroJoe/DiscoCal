'use strict';

const express = require('express');

/**
 * @param {express.Express} app
 */
module.exports = function setupPingHandler(app) {
    app.get('/ping', (req, res, next) => {
        res.send('Pong');
    });
}
