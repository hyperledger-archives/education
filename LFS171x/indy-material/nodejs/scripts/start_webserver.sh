#!/bin/bash

set -e

if [ ! -d "/home/indy/.indy-cli/networks/sandbox" ]; then
    echo "Ledger does not exist - Creating..."
	if [ ! -z "$IPS" ]; then
		echo von_generate_transactions -s "$IPS"
		von_generate_transactions -s "$IPS"
	elif [ ! -z "$IP" ]; then
		echo von_generate_transactions -i "$IP"
		von_generate_transactions -i "$IP"
	else
		echo von_generate_transactions
		von_generate_transactions
	fi
fi

# link node ledgers where webserver can find them
for node in 1 2 3 4; do
    ln -sfn /home/indy/.mnt/node${node}/sandbox/data/Node${node} \
            /home/indy/ledger/sandbox/data/node${node}
done

python -m server.server
