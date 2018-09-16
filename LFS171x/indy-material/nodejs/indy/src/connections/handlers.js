'use strict';
const indy = require('../../index.js');

exports.response = function (message) {
    return indy.connections.acceptResponse(message.aud, message.message);
};

exports.acknowledge = function (message) {
    return indy.connections.acceptAcknowledgement(message.origin, message.message);
};

exports.request = function(message) {
    return indy.connections.acceptRequest(message.message.endpointDid, message.message.did, message.message.nonce);
};