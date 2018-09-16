'use strict';
const indy = require('../../../indy');
const sdk = require('indy-sdk');

exports.request = async function(message) {
    let enhancedMessage = await indy.proofs.prepareRequest(message);
    indy.store.messages.write(message.origin, enhancedMessage);
};

exports.proof = async function(message) {
    await indy.proofs.validateAndStoreProof(message);
};