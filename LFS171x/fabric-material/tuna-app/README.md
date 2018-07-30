## Hyperledger Fabric Sample Application (Tuna App)

    This application demonstrates the creation and transfer of tuna fish shipments between actors leveraging Hyperledger Fabric in the supply chain. In this exercise we will set up the minimum number of nodes required to develop chaincode. It has a single peer and a single organization.

## Installation

1. Start the Fabric network ``./startFabric.sh``

2. Install the npm packages ``npm install``

3. Register the Admin ``node registerAdmin.js``

4. Register the User ``node registerUser.js``

5. Run the server ``node server.js``

6. View at browser ``localhost:8000``

if getting error about running ./startFabric.sh permission 

``chmod a+x startFabric.sh``

This code is based on code written by the Hyperledger Fabric community. Source code can be found here: (https://github.com/hyperledger/fabric-samples). 
