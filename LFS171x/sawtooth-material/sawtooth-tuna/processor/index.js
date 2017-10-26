// SPDX-License-Identifier: Apache-2.0

/* Contributed by Zac Delventhal @delventhalz 
  Original code can be found here: https://github.com/delventhalz/transfer-chain-js/blob/master/processor/index.js
 */


'use strict'

const { TransactionProcessor } = require('sawtooth-sdk/processor')
const { JSONHandler } = require('./handlers')

const VALIDATOR_URL = 'tcp://localhost:4004'

// Initialize Transaction Processor
const tp = new TransactionProcessor(VALIDATOR_URL)
tp.addHandler(new JSONHandler())
tp.start()
