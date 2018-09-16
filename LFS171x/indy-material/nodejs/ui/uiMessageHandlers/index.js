'use strict';
const indy = require('../../indy');
const sockets = require('../sockets');

const MESSAGE_TYPES = {
    SEND_MESSAGE: "urn:sovrin:agent:message_type:sovrin.org/ui/send_message",
    SEND_CONNECTION_REQUEST: "urn:sovrin:agent:message_type:sovrin.org/ui/send_connection_request",
    ISSUER_CREATE_SCHEMA: "urn:sovrin:agent:message_type:sovrin.org/ui/issuer_create_schema",
    ISSUER_CREATE_CRED_DEF: "urn:sovrin:agent:message_type:sovrin.org/ui/issuer_create_credential_definition",
    ISSUER_SEND_CRED_OFFER: "urn:sovrin:agent:message_type:sovrin.org/ui/issuer_send_credential_offer",
    CREDENTIALS_ACCEPT_OFFER: "urn:sovrin:agent:message_type:sovrin.org/ui/credentials_accept_offer",
    CREDENTIALS_REJECT_OFFER: "urn:sovrin:agent:message_type:sovrin.org/ui/credentials_reject_offer",
    CONNECTIONS_ACCEPT_REQUEST: "urn:sovrin:agent:message_type:sovrin.org/ui/connections_accept_request",
    CONNECTIONS_REJECT_REQUEST: "urn:sovrin:agent:message_type:sovrin.org/ui/connections_reject_request"
};

exports.MESSAGE_TYPES = MESSAGE_TYPES;

exports.enableDefaultHandlers = function(indyHandler) {
    // indyHandler.defineHandler(MESSAGE_TYPES.SEND_MESSAGE, exports[MESSAGE_TYPES.SEND_MESSAGE]);
    indyHandler.defineHandler(MESSAGE_TYPES.SEND_CONNECTION_REQUEST, exports[MESSAGE_TYPES.SEND_CONNECTION_REQUEST]);
    indyHandler.defineHandler(MESSAGE_TYPES.ISSUER_CREATE_SCHEMA, exports[MESSAGE_TYPES.ISSUER_CREATE_SCHEMA]);
    indyHandler.defineHandler(MESSAGE_TYPES.ISSUER_CREATE_CRED_DEF, exports[MESSAGE_TYPES.ISSUER_CREATE_CRED_DEF]);
    indyHandler.defineHandler(MESSAGE_TYPES.ISSUER_SEND_CRED_OFFER, exports[MESSAGE_TYPES.ISSUER_SEND_CRED_OFFER]);
    indyHandler.defineHandler(MESSAGE_TYPES.CREDENTIALS_ACCEPT_OFFER, exports[MESSAGE_TYPES.CREDENTIALS_ACCEPT_OFFER]);
    indyHandler.defineHandler(MESSAGE_TYPES.CREDENTIALS_REJECT_OFFER, exports[MESSAGE_TYPES.CREDENTIALS_REJECT_OFFER]);
    indyHandler.defineHandler(MESSAGE_TYPES.CONNECTIONS_ACCEPT_REQUEST, exports[MESSAGE_TYPES.CONNECTIONS_ACCEPT_REQUEST]);
    indyHandler.defineHandler(MESSAGE_TYPES.CONNECTIONS_REJECT_REQUEST, exports[MESSAGE_TYPES.CONNECTIONS_REJECT_REQUEST]);
};

// exports.httpHandler = async function(req, res) {
//     try {
//         let elements = req.body;
//         await
//         res.status(202).send();
//     } catch(e) {
//         res.status(500).send();
//     }
// };

exports[MESSAGE_TYPES.SEND_MESSAGE] = async function(formElements) {
    let message = JSON.parse(formElements.message);
    message.did = formElements.did;
    await indy.crypto.sendAnonCryptedMessage(formElements.did, message);
};

exports[MESSAGE_TYPES.SEND_CONNECTION_REQUEST] = async function(req, res) {
    try {
        let name = req.body.name;
        let theirEndpointDid = req.body.did;
        let connectionRequest = await indy.connections.prepareRequest(name, theirEndpointDid);

        await indy.crypto.sendAnonCryptedMessage(theirEndpointDid, connectionRequest);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.ISSUER_CREATE_SCHEMA] = async function(req, res) {
    try {
        await indy.issuer.createSchema(req.body.name_of_schema, req.body.version, req.body.attributes);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.ISSUER_CREATE_CRED_DEF] = async function(req, res) {
    try {
        await indy.issuer.createCredDef(req.body.schema_id, req.body.tag);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.ISSUER_SEND_CRED_OFFER] = async function(req, res) {
    try {
        await indy.credentials.sendOffer(req.body.their_relationship_did, req.body.cred_def_id);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.CREDENTIALS_ACCEPT_OFFER] = async function(req, res) {
    try {
        let message = indy.store.messages.getMessage(req.body.messageId);
        indy.store.messages.deleteMessage(req.body.messageId);
        await indy.credentials.sendRequest(message.message.origin, message.message.message);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.CREDENTIALS_REJECT_OFFER] = async function(req, res) {
    try {
        indy.store.messages.deleteMessage(req.body.messageId);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.CONNECTIONS_ACCEPT_REQUEST] = async function(req, res) {
    try {
        let name = req.body.name;
        let messageId = req.body.messageId;
        let message = indy.store.messages.getMessage(messageId);
        indy.store.messages.deleteMessage(messageId);
        await indy.connections.acceptRequest(name, message.message.message.endpointDid, message.message.message.did, message.message.message.nonce);
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};

exports[MESSAGE_TYPES.CONNECTIONS_REJECT_REQUEST] = async function(req, res) {
    try {
        // FIXME: Are we actually passing in the messageId?
        if (req.body.messageId) {
            indy.store.messages.deleteMessage(req.body.messageId);
        }
        res.status(202).send();
    } catch(e) {
        res.status(500).send();
    }
};