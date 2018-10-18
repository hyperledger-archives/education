'use strict';
const config = require('../config');

exports.wallet = require('./src/wallet');
exports.connections = require('./src/connections');
exports.credentials = require('./src/credentials');
exports.crypto = require('./src/crypto');
exports.did = require('./src/did');
exports.handler = require('./src/handler');
exports.issuer = require('./src/issuer');
exports.messages = require('./src/messages');
exports.pairwise = require('./src/pairwise');
exports.pool = require('./src/pool');
exports.proofs = require('./src/proofs');
exports.store = require('./src/store');
exports.utils = require('./src/utils');

exports.setupAgent = async function () {
    await exports.pool.setup();
    await exports.wallet.setup();
    let endpointDid = await exports.did.getEndpointDid(); // Creates it if it doesn't exist
    await exports.pool.setEndpointForDid(endpointDid, config.endpointDidEndpoint);
    return Promise.resolve();
};















