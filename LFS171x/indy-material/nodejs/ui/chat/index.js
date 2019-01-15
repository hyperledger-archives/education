'use strict';
const indy = require('../../indy');
const TWO_WEEKS_MS = 12096e5;

exports.getMessages = async function(theirDid) {
    return await indy.pairwise.getAttr(theirDid, 'chatMessages');
};

exports.storeMessage = async function(theirDid, message) {
    return await indy.pairwise.pushAttribute(theirDid, 'chatMessages', JSON.stringify(message));
};

exports.getRecentMessages = async function(theirDid) {
    let messages = await exports.getMessages(theirDid);
    let twoWeeksAgo = new Date(Date.now() - TWO_WEEKS_MS);
    let result = [];
    for(let message of messages) {
        if(message.timestamp > twoWeeksAgo) {
            result.push(message);
        }
    }
    return result;
};