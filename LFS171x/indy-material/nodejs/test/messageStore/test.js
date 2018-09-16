'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const homedir = require('home-dir');
const fs = require('fs');
const store = require('../../indy/src/store');
const PATH = homedir('/.indy_client/store.json');

describe('store', function() {
    let sandbox;

    beforeEach(function () {
        store.clear();
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        store.clear();
        sandbox.restore();
    });

    it('getMessages() should create file and return empty array, be persistent', function() {
        expect(store.getMessages() === []);
        store.writeMessage({some: "message"});
        store.writeMessage({another: "message"});
        let expected = [{some: "message"}, {another: "message"}];
        expect(store.getMessages() === expected);
        expect(JSON.parse(fs.readFileSync(PATH)) === expected);
        store.clear();
        expect(store.getMessages() === []);
    });

    it('getOldestMessage() should get the oldest message', function() {
        let oldestMessage = {
            id: '1',
            received_timestamp: new Date(),
            message: "some message"
        };
        store.writeMessage(oldestMessage);
        store.writeMessage({
            id: '2',
            timestamp: new Date(),
            message: "some message"
        });
        store.writeMessage({
            id: '3',
            timestamp: new Date(),
            message: "some message"
        });
        expect(store.getOldestMessage() === oldestMessage);
    })

    it('getMessageById() should get the right message', function() {
        let rightMessage = {
            id: '1',
            timestamp: new Date(),
            message: "some message"
        };
        store.writeMessage(rightMessage);
        store.writeMessage({
            id: '2',
            timestamp: new Date(),
            message: "some message"
        });
        store.writeMessage({
            id: '3',
            timestamp: new Date(),
            message: "some message"
        });
        expect(store.messages.getMessage('1') === rightMessage);
    })

    it('deleteMessage() should delete the right message', function() {
        let rightMessages = [
            {
                id: '1',
                timestamp: new Date(),
                message: "some message"
            },
            {
                id: '2',
                timestamp: new Date(),
                message: "some message"
            }
        ];
        store.writeMessage(rightMessages[0]);
        store.writeMessage(rightMessages[1]);
        store.writeMessage({
            id: '3',
            timestamp: new Date(),
            message: "some message"
        });
        store.messages.deleteMessage('3');
        expect(store.getMessages === rightMessages);
    })
});