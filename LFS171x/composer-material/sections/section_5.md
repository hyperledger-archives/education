# Writing and Deploying a Business Network

<!-- TAB 1 -->
## Overview of the Tuna Business Network
As shown previously, we will implement a simple network to track the movement of Tuna fish.

The network we will build maintains a single system where fishers, restaurant owners and regulators interact.

![Participants](resources/img_02-01.png)

Each participant is able to access and work upon information about Tuna fish.

Importantly, the blockchain enables this to happen in a way that is immutable and distributed, while enabling a degree of transparency and oversight not easily implementable in a centralised database.

<!-- TAB 2 -->
### Steps

In order to create and use the `tuna-network` business network, we will cover the following steps:

1) Creating an empty network
2) Defining Participants
3) Defining Assets and Transactions
4) Developing Transaction Logic
5) Developing Queries
6) Defining Access Control Rules
7) Building and starting the Business Network
8) Deploying onto Hyperledger Fabric
9) Testing on the Composer Playground
10) Running the Composer REST Server

> The `tuna-network` Business Network can be downloaded at this repository: https://github.com/hyperledger/education/composer-material

<!-- TAB 3 -->
## 1) Creating an empty network

We can use [Yeoman](http://yeoman.io/) to create an empty network, by running:

```
yo hyperledger-composer:businessnetwork
```

And then answering the questions that are posed.

```
? Business network name: tuna-network
? Description: Hyperledger Composer network for Tuna tracking
? Author name:  Alejandro (Sasha) Vicente Grabovetsky & Nicola Paoli
? Author email: sasha@aid.technology, nicola@aid.technology
? License: Apache-2.0
? Namespace: org.tuna
? Do you want to generate an empty template network? Yes: generate an empty template network
```

<!-- TAB 4 -->
## 2) Defining Participants

Participants are defined under the `models/org.tuna.cto` file.

We start by defining a `namespace`.
```
namespace org.tuna
```

Then we create an abstract `Participant` for an `Individual`.
All participants will inherit the properties from it.
```
abstract participant Individual identified by id {
    o String id
    o String name
    o Address address
}
```

To fill the property `Address` of the individual, we can create a `Concept`.<br>
Note that `postCode` should have a specific format that can be validated using a regular expression.
```
concept Address {
    o String addressLine
    o String locality
    o String postCode regex=/\d{4}[ ]?[A-Z]{2}/
}
```

Finally, we define the `Fisher` and `RestaurantOwner`, which extend the Individual, and the `Regulator`:

```
participant Fisher extends Individual {
    o String licenseNumber
}

participant RestaurantOwner extends Individual {
    o String restaurantName
}

participant Regulator identified by id {
    o String id
    o String name
}
```

<!-- TAB 5 -->
## 3) Defining Assets and Transactions
Assets and Transactions are also defined under the `models/org.tuna.cto` file.
In `tuna-network` the asset is represented by the `Tuna`, which is defined as follow:

```
asset Tuna identified by tunaId {
    o String tunaId
    o Integer weight range=[500, 1000000]
    o FishStatus status default="CAUGHT"
    o DateTime catchTime
    --> Individual owner
}
```

The `Tuna` asset is uniquely identified by an id.
It also has a weight, which is limited between 500 grams and 1 million grams (a tonne).
The largest tuna rarely exceed 800 kg.

To specify the `Status` of the Tuna, that can be either `CAUGHT` or `PURCHASED`, we can define an enumerated type `Enum`, which specifies a type that can assume a limited number of values.

```
enum FishStatus {
    o CAUGHT
    o PURCHASED
}
```

Then, we define the `Transaction`, to change the ownership of the Tuna from a `Fisher` to a `RestaurantOwner`.
```
transaction SellTuna {
    --> Tuna tuna
    --> RestaurantOwner restaurantOwner
}
```

Finally, we define the `Event` to generate after the SellTuna transaction is executed:
```
event TunaSale {
    o String tunaId
    o String restaurantName
}
```

<!-- TAB 6 -->
## 4) Developing Transaction Logic
The transaction logic is specified in the file `lib/logic.js`.

We start by defining the same namespace specified in the modeling language file.

```
'use strict';
/**
 * Defining the namespace for the business network
 */
const NS = 'org.tuna';
```

The transaction logic is defined in a function that accepts the Transaction `SellTuna` as input parameter.
```
/**
* Transfer tuna from one owner to another
* @param {org.tuna.SellTuna} tx - The transferTuna transaction
* @transaction
*/
async function sellTuna(tx) {
```

Next, the registries related to the Asset `Tuna` and the Participant `Restaurant Owner` are instantiated:
```
    // Get asset registry for Tuna
    const tunaRegistry = await getAssetRegistry(NS + '.Tuna');

    // Get participant registry for Individuals
    const restaurantOwnerRegistry = await getParticipantRegistry(NS + '.RestaurantOwner');
```

Next, we have to verify that the `status` of the Tuna is `CAUGHT`.
This is to make sure that a `Tuna` already sold cannot be sold again.
```
    // Make sure the tuna status is CAUGHT and not PURCHASED
    if (tx.tuna.status !== 'CAUGHT') {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is not in CAUGHT status`);
    }
```

Retrieve the id of the `RestaurantOwner` from the Transaction.
```
    // Get restaurantOwner ID
    const restaurantOwnerId = tx.restaurantOwner.getIdentifier();
```

Next, we verify that the `RestaurantOwner` exists
```
    // Make sure that restaurantOwner exists
    const restaurantOwner = await restaurantOwnerRegistry.get(restaurantOwnerId);
    if (!restaurantOwner) {
        throw new Error(`RestaurantOwner with id ${restaurantOwnerId} does not exist`);
    }
```

Now we can update the `owner` of the Tuna:
```
    // Update tuna with new owner
    tx.tuna.owner = tx.restaurantOwner;
```

Update the `status` of the Tuna:
```
    tx.tuna.status = 'PURCHASED';
```

Update the record of the Tuna in the asset registry:
```
    // Update the asset in the asset registry.
    await tunaRegistry.update(tx.tuna);
}
```

Create the Event `TunaSale`:
```
    // Create a Tuna Sale Event
    let tunaSaleEvent = getFactory().newEvent(NS, 'TunaSale');
    tunaSaleEvent.tunaId = tx.tuna.tunaId;
    tunaSaleEvent.restaurantName = tx.restaurantOwner.restaurantName;
```

Finally, emit the event created.
```
    // Emit the Event
    emit(tunaSaleEvent);
```

<!-- TAB 7 -->
## 5) Developing Queries
The queries can be specified under the `queries.qry` file.

The query `getTunaByParticipant` will return all the fishes owned by a specific participant in the format of an array of Assets of type `Tuna`.
```
query getTunaByParticipant {
    description: "List tuna owned by specific 'owner'"
    statement:
        SELECT org.tuna.Tuna
            WHERE (owner == _$owner)
                ORDER BY [catchTime ASC]
}
```

<!-- TAB 8 -->
## 6) Defining Access Control Rules

The Access Control Rules are defined in the file `permissions.acl`.

The following rule allows only the owner of the tuna to execute the transaction `SellTuna`:
```
rule OnlyOwnerCanTransferTuna {
    description: "Allow only Tuna owners to transfer the fish"
    participant(p): "org.tuna.*"
    operation: CREATE
    resource(r): "org.tuna.SellTuna"
    condition: (r.tuna.owner.getIdentifier() != p.getIdentifier())
    action: DENY
}
```

<!-- TAB 9 -->
## 7) Building and starting the Business Network
Once we have created the network, we create a `Business Network Archive (BNA)` running the following command from the directory that you ran the Yeoman generator:

```
composer archive create -t dir -n .
```

This creates the file `tuna-network@0.0.1.bna`.

<!-- TAB 10 -->
## 8) Deploying onto Hyperledger Fabric
We start by installing the network onto the Hyperledger Fabric peers:
```
composer network install --card PeerAdmin@hlfv1 --archiveFile tuna-network@0.0.1.bna
```

Then we initialise the chaincode on the Hyperledger Fabric peers:
```
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --networkName tuna-network --networkVersion 0.0.1
```

This creates a card that we can import:
```
composer card import --file admin@tuna-network.card
```

And use to access the business network:
```
composer network ping --card admin@tuna-network
```

This should show that we can connect to the network.

> **VIDEO [EdX_2_network.mp4]**
> Transcript:

> In this video we will set up a basic Hyperledger Composer business network running on Hyperledger Fabric.
>
> We start by creating a business network with Yeoman, and the Hyperledger Composer generator. We fill in the required details, paying special attention to the network Name and Namespace. We also ask to generate an empty network.
>
> You can now create your own network, or fill in the relevant files as shown in the course slides. For simplicity, we will simply download the network from the official Hyperledger education repository.
>
> Let’s look at the files we have there: For instance, the package.json file defines the network name and version. It also specifies the Node.js packages used. The org.tuna.cto file contains the Modeling Language definitions for Assets, Participants and Transactions. And the logic file contains the Transaction logic using Node.js. We also have a test script, where we hold the unit tests we defined for our network.
>
> We can use the composer CLI to create a business network archive, or BNA file. We can then install the Chaincode of the BNA onto the peers. To enable the Chaincode, we use the Start command in the Composer CLI. Then we import the network card, which will enable us to connect to our Business Network. The simplest operation we can do is to ping the network to ensure it is operational.

<!-- TAB 11 -->
## 9) Testing on the Composer Playground
Once we have the network deployed, we can access the `Composer Playground` started in the previous section by accessing `http://localhost:8080` (or the port `:8080` of the Ubuntu Virtual Machine) in a web browser.

We can also import the `.bna` files directly in Composer Playground to test the business network.

> **VIDEO [EdX_3_Playground.mp4]**
> Transcript:

> In this video we will learn about the Hyperledger Composer Playground.
>
> Let’s check out the Playground we started in the pre-requisites video by navigating to localhost:8080 in a web browser. You can connect to the business network we created. Here you can browse the README.md file, model file, logic file, query file and permissions file.
>
> Let’s switch to the test tab to run some transactions.
>
> We start by creating a new Fisher participant, Alice. Notice the field validation working for the postal code.
>
> Now we can create Bob, our Restaurant owner. And Carla, our regulator.
>
> We can also create a Tuna fish asset. Notice the range validator for the tuna weight. Also note that we specify its owner to be Alice, the Fisher.
>
> Having our Participants and Assets, we can run a SellTuna transaction to transfer it to Bob. As you can see, the Tuna now has a new owner.
>
> Finally, we can browse all the transactions we have performed.

<!-- TAB 12 -->
## 10) Running the Composer REST Server
We can also run the REST server to connect to the deployed business network and expose resources and transactions.

```
composer-rest-server -c admin@tuna-network -n never -w true
```

We can now access http://localhost:3000/ to explore the Composer REST API.

> **VIDEO [EdX_4_REST.mp4]**
> Transcript:

> In this video we will learn about the Hyperledger Composer REST server.
>
> Let’s start the composer-rest-server. We specify our Tuna business network card and press enter to select the default options for the remaining arguments.
>
> We navigate to localhost:3000 in a web browser to access the REST server explorer. Here we can view the actions for a Participant, such as a Fisher. These include typical HTTP verbs such as GET, POST, PUT and DELETE.
>
> Let’s retrieve a list of Fisher objects. Naturally, we see Alice, who we created when using the Playground.
>
> We can do the very same thing with our Regulators. And with our Restaurant Owners. And with assets like Tuna.
>
> Importantly, we can also run Queries on the data. For instance, let’s find all the Tuna that is owned by Bob, our RestaurantOwner.
>
> Finally, the System tab contains API paths related to identity, the historian and allows us to ping the network. Let’s try it out.

