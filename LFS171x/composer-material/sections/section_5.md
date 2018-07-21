# Writing a Business Network

## Overview of network Requirements (from Tuna Scenario)

As we discussed in the Hyperledger Fabric and Sawtooth chapters, we can implement a simple network to track the movement of Tuna fish.

The network we will build maintains a single system where fishers, restaurant owners and regulators interact. Each participant is able to access and work upon in a permissioned manner differential information about Tuna fish. Importantly, the blockchain enables this to happen in a way that is immutable and distributed, while enabling a degree of transparency and oversight not easily implementable in a centralised database.

## Creating an empty network

We can use Yeoman to create an empty network, by running:

```bash
yo hyperledger-composer:businessnetwork
```

And then answering the questions that are posed.

```bash
? Business network name: tuna-network
? Description: Hyperledger Composer network for Tuna tracking
? Author name:  Alejandro (Sasha) Vicente Grabovetsky & Nicola Paoli
? Author email: sasha@aid.technology, nicola@aid.technology
? License: Apache-2.0
? Namespace: org.tuna
? Do you want to generate an empty template network? Yes: generate an empty template network
```

## Developing Participants

We start by defining a namespace and a concept we can reuse.

These can be defined under the `models/org.tuna.cto` file.

For the address, we demonstrate how the input of a field (in this case the postal code) can be validated through a regular expression:

```
namespace org.tuna

concept Address {
  o String addressLine
  o String locality
  o String postCode regex=/\d{4}[ ]?[A-Z]{2}/
}
```

Then we create an abstract concept for an Individual, which we cannot instantiate, but which will avoid code duplication, as we derive other concrete participants from it.

```
abstract participant Individual identified by id {
  o String id
  o String name
  o Address address
}
```

Finally, we define the Fisher, RestaurantOwner, Regulator:

```
participant Fisher extends Individual {}
participant RestaurantOwner extends Individual {}
participant Regulator identified by id {
  o String id
  o String name
}
```

## Developing Assets

We can define an enumerated type (enum), which specifies a type that can assume a limited number of values.

```
enum FishStatus {
  o CAUGHT
  o PURCHASED
}
```

The Tuna asset is also uniquely identified by an id. It also has a weight, which is limited between 500 grams and 1 million grams (a tonne). The largest tuna rarely exceed 800 kg.

```
asset Tuna identified by tunaId {
  o String tunaId
  o Integer weight range=[500, 1000000]
  o FishStatus status default=CAUGHT
  o DateTime catchTime
  --> Individual owner
}
```

Finally, we specify a transaction (smart contract) definition, specifying that a Tuna can change ownership.

```
transaction SellTuna {
  --> Tuna tuna
  --> RestaurantOwner newOwner
}
```

Developing Transaction (Smart Contract) Logic
The transaction logic is specified in the `lib/logic.js`:

```ecmascript 6
'use strict';
/**
 * Defining the namespace for the business network
 */
const NS = 'org.tuna';

/**
 * Transfer tuna from one owner to another
 * @param {org.tuna.SellTuna} tx - The transferTuna transaction
 * @transaction
 */
async function sellTuna(tx) {
    // Get asset registry for Tuna
    const tunaRegistry = await getAssetRegistry(NS + '.Tuna');

    // Make sure the tuna status is CAUGHT and not PURCHASED
    if (tx.tuna.status !== 'CAUGHT') {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is not in CAUGHT status`);
    }

    // Get participant registry for Individuals
    const restaurantOwnerRegistry = await getParticipantRegistry(NS + '.RestaurantOwner');

    // Get newOwner
    const newOwnerID = tx.newOwner.getIdentifier();
    const oldOwnerID = tx.tuna.owner.getIdentifier();

    // Make sure that new owner exists
    const newOwner = await restaurantOwnerRegistry.get(newOwnerID);

    // Check that newOwner is not same as current owner
    if (newOwnerID === oldOwnerID) {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is already owned by ${oldOwnerID}`);
    }

    // Update tuna with new owner
    tx.tuna.owner = tx.newOwner;
    tx.tuna.status = "PURCHASED";

    // Update the asset in the asset registry.
    await tunaRegistry.update(tx.tuna);
}
```

## Developing Queries

The queries can be specified under the `queries.qry` file.

```
query getTunaByParticipant {
    description: "List tuna owned by specific 'owner'"
    statement:
        SELECT org.tuna.Tuna
            WHERE (owner == _$owner)
                ORDER BY [catchTime ASC]
}
```

## Building and starting the Business Network Archive

Once we have created the network, we can run:

```bash
composer archive create -t dir -n .
```

To create a Business Network Archive (BNA) called `tuna@0.0.1.bna`

## Playing on the Composer Playground

Once we have the BNA, we access the composer playground we started in the previous section by accessing port 8080 of the VM through a web browser.

We can import our business network into the web browser, or we can install it onto an underlying Hyperledger Fabric blockchain network.

## Deploying onto Hyperledger Fabric

We start by installing the network onto the Hyperledger Fabric peers:

```bash
composer network install --card PeerAdmin@hlfv1 --archiveFile tuna-network@0.0.1.bna
```

Then we initialise the chaincode on the Hyperledger Fabric peers:

```bash
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --networkName tuna-network --networkVersion 0.0.1
```

This creates a card that we can import:

```bash
composer card import --file admin@tuna-network.card
```

And use to access the business network:

```bash
composer network ping --card admin@tuna-network
```

This should show that we can connect to the network.

## Running REST Server

We can also run the REST server to connect to our business network and expose its functionality and smart contracts.

composer-rest-server -c admin@tuna-network -n never -w true

We can now access our VM’s port 3000 to access the REST server.

> Screenshot to show how to use queries on the REST Server

## Summary of Business Network (VIDEO)  

### Brief overview of the steps in this Demonstration

1. Generating an empty network using Yeoman and the Hyperledger Composer Generator
2. Create resources and actors in the network, namely:
  - Participants: Fisher, Restaurant Owner, Regulator
  - Assets: Tuna fish
3. Create smart contracts where:
  - `/transferTuna` A tuna is transferred to a Restaurant Owner 
4. Demonstrate how participants, assets and transactions can be instantiated.
5. Limit the visibility for the different participants in the network of:
  - Transaction /transferTuna can be used only by the Fisher
  - Query /getTunahByParticipant:  (participants except regulator can only see their own fishes)
  - Query /monitorTunaTransactions can be used only by the regulator 
Query  the blockchain to:
  - /getTunaByParticipant List tuna fishes that belong to a particular participant.
  - /monitorTunaTransactions 
