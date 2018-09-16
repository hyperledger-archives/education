'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');
const request = require('request-promise');

// FIXME: Assumption: Their endpoint did has an endpoint attribute
exports.sendMessage = function (endpoint, message) {
    let requestOptions = {
        uri: `http://${endpoint}/indy`,
        method: 'POST',
        body: {
            message: message
        },
        json: true
    };
    return request(requestOptions);
};