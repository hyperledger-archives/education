'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const homedir = require('home-dir');
const fs = require('fs');
const store = require('../../indy/src/store');
const PATH = homedir('/.indy_client/store.json');

describe('handler', function() {
    let sandbox;

    beforeEach(function () {
        store.clear();
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });
});