'use strict';
const indy = require('../../index.js');

module.exports = function(config) { //factory function creates object and returns it.
    const factory = {};
    const messageHandlerMap = {};

    if(!config) {
        config = {};
    }

    factory.defineHandler = function(messageType, handler) {
        if(!messageType || typeof messageType !== 'string') {
            throw Error("Invalid message type: messageType must be a non-empty string");
        }
        if(!handler || typeof handler !== 'function') {
            throw Error("Invalid message handler: handler must be a function");
        }
        if(messageHandlerMap.hasOwnProperty(messageType)) {
            throw Error(`Duplicate message handler: handler already exists for message type ${messageType}`);
        }
        messageHandlerMap[messageType] = handler;
    };

    factory.middleware = async function(req, res) {
        try {
            let buffer = Buffer.from(req.body.message, 'base64');
            let decryptedMessage = await indy.crypto.publicKeyAnonDecrypt(buffer);
            if(messageHandlerMap[decryptedMessage.type]) {
                let handler = messageHandlerMap[decryptedMessage.type];
                if(handler.length === 2) { // number of parameters
                    handler(decryptedMessage, function(err) {
                        if(err) {
                            console.error(err.stack);
                            throw err;
                        } else {
                            res.status(202).send("Accepted");
                        }
                    })
                } else {
                    handler(decryptedMessage)
                        .then((data) => {
                            res.status(202).send("Accepted");
                        })
                        .catch((err) => {
                            console.error(err.stack);
                            throw err;
                        })
                }
            } else {
                indy.store.messages.write(null, decryptedMessage);
                res.status(202).send("Accepted");
            }
        } catch(err) {
            console.error(err.stack);
            if(err.message === "Invalid Request") {
                res.status(400).send(err.message);
            } else {
                res.status(500).send("Internal Server Error");
            }
        }
    };

    if(config.defaultHandlers) {
        factory.defineHandler(indy.connections.MESSAGE_TYPES.REQUEST, indy.connections.handlers.request);
        factory.defineHandler(indy.connections.MESSAGE_TYPES.RESPONSE, indy.connections.handlers.response);
        factory.defineHandler(indy.connections.MESSAGE_TYPES.ACKNOWLEDGE, indy.connections.handlers.acknowledge);
        factory.defineHandler(indy.credentials.MESSAGE_TYPES.REQUEST, indy.credentials.handlers.request);
        factory.defineHandler(indy.credentials.MESSAGE_TYPES.CREDENTIAL, indy.credentials.handlers.credential);
        factory.defineHandler(indy.proofs.MESSAGE_TYPES.REQUEST, indy.proofs.handlers.request);
        factory.defineHandler(indy.proofs.MESSAGE_TYPES.PROOF, indy.proofs.handlers.proof);
    }

    return factory;
};