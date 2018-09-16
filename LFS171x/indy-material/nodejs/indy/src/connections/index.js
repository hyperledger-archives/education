'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const uuid = require('uuid');

/*
urn:jwm:sovrin.org/connections/v1/offer

 */

const MESSAGE_TYPES = {
    OFFER : "urn:sovrin:agent:message_type:sovrin.org/connection_offer",
    REQUEST : "urn:sovrin:agent:message_type:sovrin.org/connection_request",
    RESPONSE : "urn:sovrin:agent:message_type:sovrin.org/connection_response",
    ACKNOWLEDGE : "urn:sovrin:agent:message_type:sovrin.org/connection_acknowledge"
};
exports.MESSAGE_TYPES = MESSAGE_TYPES;

exports.handlers = require('./handlers');

exports.prepareRequest = async function (theirEndpointDid) {
    let [myNewDid, myNewVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});
    await indy.pool.sendNym(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), myNewDid, myNewVerkey);

    let nonce = uuid();
    indy.store.pendingRelationships.write(myNewDid, theirEndpointDid, nonce);

    return {
        type: MESSAGE_TYPES.REQUEST,
        message: {
            did: myNewDid,
            endpointDid: await indy.did.getEndpointDid(),
            nonce: nonce
        }
    }
};

exports.acceptRequest = async function (theirEndpointDid, theirDid, requestNonce) {
    let [myDid, myVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});

    let theirVerkey = await sdk.keyForDid(await indy.pool.get(), await indy.wallet.get(), theirDid);

    // await sdk.storeTheirDid(await indy.wallet.get(), {
    //     did: theirDid,
    //     verkey: theirVerkey
    // });

    let meta = JSON.stringify({
        theirEndpointDid: theirEndpointDid,
        verified: false // Indicates that the owner of the agent has confirmed they want to stay connected with this person.
    });

    //FIXME: Check to see if pairwise exists
    await sdk.createPairwise(await indy.wallet.get(), theirDid, myDid, meta);

    // Send connections response
    let connectionResponse = {
        did: myDid,
        verkey: myVerkey,
        nonce: requestNonce
    };
    let message = {
        aud: theirDid,
        type: MESSAGE_TYPES.RESPONSE,
        message: await indy.crypto.anonCrypt(theirDid, JSON.stringify(connectionResponse))
    };
    return indy.crypto.sendAnonCryptedMessage(theirEndpointDid, message);
};

exports.acceptResponse = async function (myDid, rawMessage) {
    let pendingRelationships = indy.store.pendingRelationships.getAll();
    let relationship;
    for (let entry of pendingRelationships) {
        if (entry.myNewDid === myDid) {
            relationship = entry;
        }
    }
    if (!relationship) {
        throw Error("RelationshipNotFound");
    } else {
        // base64 decode
        let base64DecodedMessage = Buffer.from(rawMessage, 'base64');
        // anon decrypt
        let message = await indy.crypto.anonDecrypt(myDid, base64DecodedMessage);
        // retrieve theirEndpointDid, theirDid, connection_request_nonce
        let theirDid = message.did;
        let theirVerKey = message.verkey;

        if (relationship.nonce !== message.nonce) {
            throw Error("NoncesDontMatch");
        } else {
            await sdk.storeTheirDid(await indy.wallet.get(), {
                did: theirDid,
                verkey: theirVerKey
            });

            let meta = JSON.stringify({
                name: relationship.name,
                theirEndpointDid: relationship.theirEndpointDid
            });
            await sdk.createPairwise(await indy.wallet.get(), theirDid, relationship.myNewDid, meta);

            // send acknowledge
            await exports.sendAcknowledgement(relationship.myNewDid, theirDid, relationship.theirEndpointDid);
            indy.store.pendingRelationships.delete(relationship.id);
        }
    }
};

exports.sendAcknowledgement = async function (myDid, theirDid, theirEndpointDid) {
    await indy.crypto.sendAnonCryptedMessage(theirEndpointDid, await indy.crypto.buildAuthcryptedMessage(myDid, theirDid, MESSAGE_TYPES.ACKNOWLEDGE, "Success"));
    await indy.proofs.sendRequest(myDid, theirDid, 'General-Identity');
};

exports.acceptAcknowledgement = async function (theirDid, encryptedMessage) {
    let myDid = await indy.pairwise.getMyDid(theirDid);

    let message = await indy.crypto.authDecrypt(myDid, encryptedMessage);
    console.log(message);

    await indy.proofs.sendRequest(myDid, theirDid, 'General-Identity');
};

// accept identity proof request, send identity proof and own proof request on identity

// accept identity proof (use same above to respond to identity proof)

// show in UI unverified relationships to be verified by the user.

// Relationship must be verified in order to issue credential to them.
