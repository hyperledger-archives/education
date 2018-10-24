'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const uuid = require('uuid');

exports.createMasterSecret = async function () {
    let masterSecretId = await indy.did.getEndpointDidAttribute('master_secret_id');
    if(!masterSecretId) {
        masterSecretId = uuid();
        await sdk.proverCreateMasterSecret(await indy.wallet.get(), masterSecretId);
        await indy.did.setEndpointDidAttribute('master_secret_id', masterSecretId);
    }
};

exports.publicKeyAnonDecrypt = async function (message) {
    return await exports.anonDecrypt(await indy.did.getEndpointDid(), message);
};

exports.anonCrypt = async function (did, message) {
    let verkey = await sdk.keyForDid(await indy.pool.get(), await indy.wallet.get(), did);
    let buffer = await sdk.cryptoAnonCrypt(verkey, Buffer.from(message, 'utf8'));
    return Buffer.from(buffer).toString('base64')
};

exports.anonDecrypt = async function (did, message) {
    let verKey = await sdk.keyForLocalDid(await indy.wallet.get(), did);
    let decryptedMessageBuffer = await sdk.cryptoAnonDecrypt(await indy.wallet.get(), verKey, message);
    let buffer = Buffer.from(decryptedMessageBuffer).toString('utf8');
    return JSON.parse(buffer);
};

exports.sendAnonCryptedMessage = async function (did, message) {
    message = JSON.stringify(message);
    let endpoint = await indy.pool.getEndpointForDid(did);
    let encryptedMessage = await exports.anonCrypt(did, message);
    return indy.messages.sendMessage(endpoint, encryptedMessage);
};

exports.authCrypt = async function (myDid, theirDid, message) {
    let myVerkey = await sdk.keyForLocalDid(await indy.wallet.get(), myDid);
    let theirVerkey = await sdk.keyForLocalDid(await indy.wallet.get(), theirDid);
    let buffer = await sdk.cryptoAuthCrypt(await indy.wallet.get(), myVerkey, theirVerkey, Buffer.from(message, 'utf8'));
    return Buffer.from(buffer).toString('base64')
};

exports.authDecrypt = async function (myDid, message) {
    let myVerkey = await sdk.keyForLocalDid(await indy.wallet.get(), myDid);
    let [, decryptedMessageBuffer] = await sdk.cryptoAuthDecrypt(await indy.wallet.get(), myVerkey, Buffer.from(message, 'base64'));
    let buffer = Buffer.from(decryptedMessageBuffer).toString('utf8');
    return JSON.parse(buffer);
};

exports.buildAuthcryptedMessage = async function (myDid, theirDid, messageType, message) {
    return {
        origin: myDid,
        type: messageType,
        message: await exports.authCrypt(myDid, theirDid, JSON.stringify(message))
    }
};

exports.getMasterSecretId = async function() {
    return await indy.did.getEndpointDidAttribute('master_secret_id');
}