# Scenario

## Introduction to the Tuna fish example using Hyperledger Composer

### Participants [VIDEO]

Hyperledger Composer provides a level of abstraction to build technical blockchain solutions over real use cases.

To best show what we can do with Hyperledger Composer, we will guide through the steps to build a real case scenario. 
It will be based on the Tuna-fish tracking system shown in the previous chapters.

In this scenario, we have three main participants: Alice is the fisher who catches the tuna and creates its record into the system.
Then we have Bob, the restaurant owner who buys the tuna from Alice.
Finally, we have Carla, who is part of the regulator authority and monitors that tuna has been legally and sustainably caught and resold.

We may have then add more participants such as the Final Customer who can verify the history of the tuna, the Vector in charge to transport the tuna, and so on. To keep things simple to understand we will build the network using only these three participants.

### Assets and Actions [VIDEO]

Once defined the participants, we can identify what we want to track on the network.

In this scenario we will track the tuna fishes. In Hyperledger Composer this means we have to define an **asset Tuna** that will be traded into the network. For now let’s remember this. Later on the course we will see how to actually implement them.

Then we have the **transactions**, which define how this Assets are traded into the network. In our example the transaction `SellTuna` that is used by **Alice** to sell the tuna to **Bob**. 

Finally, access control is important part of the scenario, as **Carla** should have **read-only** access to the Tuna.

## Key benefits of building it using Hyperledger Composer

#### Focus on the problem

Develop blockchain application starting from the actual business requirements.

#### Prototyping

Hyperledger Composer facilitates to make changes on model and logic, avoiding wasting time in writing complex chaincode or deploying expensive smart contracts.

#### Analytics and Privacy

Rich queries on the data can be easily set up and performed. Access Control Rules help to preserve a layer of confidentiality for the business operations.

#### Integration to existing systems

A REST server allows you to expose your Blockchain to a Web or Mobile Application making it easily integrable with existing systems.

#### Communication

Finally, Hyperledger Composer can be used to enhance the communication between business and technical teams during prototyping and development of the blockchain application.

## Summary of the Tuna Scenario (Diagram & Text)

The participants will be:

**Alice** is a fisher who catches tuna.

**Bob** is a restaurant owner who buys tuna from Alice.

**Carla** is a regulator monitoring that tuna has been legally and sustainably caught and resold.

Alice, the fisher, can *create* tuna fish assets and transfer them to restaurant owners.

Bob, the restaurant owner, can *read* all the fishes he owns and all tuna fishes that Alice owns.

Carla, the regulator can *read* all tuna fish and monitoring fishes transactions but cannot *create* or *update* anything.
