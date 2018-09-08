'use strict';
const indy = require('../../indy');
const uiMessageHandlers = require('../uiMessageHandlers');
const io = require('socket.io')();
let socket;

exports.handler = async function(s) {
    socket = s;
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        console.log('Got a chat message: ', msg);
    });
    socket.on('sovrin message', async function(msg){
        console.log('Got a sovrin message: ', msg);
        msg = JSON.parse(msg);

        if(uiMessageHandlers[msg.type]) {
            await uiMessageHandlers[msg.type](msg.elements);
        }
    });
};

exports.emit = async function(msg) {
    socket.emit(msg);
};