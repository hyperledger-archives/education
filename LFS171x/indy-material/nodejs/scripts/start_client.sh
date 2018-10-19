#!/bin/bash

set -e

# Copy genesis file from the volume mount from one of the nodes
mkdir -p .indy_client/pool/sandbox
cp /home/indy/ledger/sandbox/pool_transactions_genesis .indy_client/pool/sandbox/sandbox.txn


if [ "$MODE" == "bash" ]; then
	/bin/bash
else
	indy-cli
fi