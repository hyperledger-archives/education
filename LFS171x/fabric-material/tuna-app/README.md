## Hyperledger Fabric Sample Application

This application demonstrates the creation and transfer of tuna fish shipments between actors leveraging Hyperledger Fabric in the supply chain. In this exercise we will set up the minimum number of nodes required to develop chaincode. It has a single peer and a single organization.

## Installation

Start the Fabric network ``./startFabric.sh``

Install the npm packages ``npm install``

Register the Admin ``node registerAdmin.js``

Register the User ``node registerUser.js``

Run the server ``node server.js``


if getting error about running ./startFabric.sh permission 

chmod a+x startFabric.sh

This code is based on code written by the Hyperledger Fabric community. Source code can be found here: (https://github.com/hyperledger/fabric-samples). 
