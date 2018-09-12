# Introduction and Learning Objectives

## Video: Introduction to Hyperledger Fabric (Alexandra & Arianna Groetsema)

[![Introduction to Hyperledger Fabric (Alexandra & Arianna Groetsema)](../images/video-image.png)](https://youtu.be/0B2VYDZn9dA)

## Learning Objectives

By the end of this chapter you should be able to:

- Understand the basics of Hyperledger Fabric v1.0.
- Walk through and analyze a demonstrated scenario on Hyperledger Fabric.
- Discuss crucial components of the Hyperledger Fabric architecture, including clients, peers, ordering service and membership service provider.
- Set up a sample network and simple application with a Javascript SDK.
- Discuss Chaincode (Hyperledger Fabric smart contract) and review an example.
- Get involved in the framework discussion and development.

## Video: About the Demonstrated Scenario

According to the [World Economic Forum,](https://www.weforum.org/agenda/2017/05/can-technology-help-tackle-illegal-fishing/)

"Illegal, unreported, and unregulated (IUU) fishing represents a theft of around 26 million tonnes, or close to $24 billion value of seafood a year."

[![Introduction to Hyperledger Fabric (Alexandra & Arianna Groetsema)](../images/video-image.png)](https://youtu.be/nwKgqJBWtac)

## Defining Our Actors

**Sarah** is the fisherman who sustainably and legally catches tuna.

**Regulators** verify that the tuna has been legally and sustainably caught.

**Miriam** is a restaurant owner who will serve as the end user, in this situation.

**Carl** is another restaurant owner fisherman Sarah can sell tuna to.

[Fabric demonstrated scenario actors: Sarah, regulator, Carl, Miriam](..images/Fabric_demonstrated_scenario_actors.png)

Using Hyperledger Fabric, we will be demonstrating how tuna fishing can be improved starting from the source, fisherman Sarah, and the process by which she sells her tuna to Miriam's restaurant.

## Featured Hyperledger Fabric Elements

**Channels** are data partitioning mechanisms that allow transaction visibility for stakeholders only. Each channel is an independent chain of transaction blocks containing only transactions for that particular channel.

The **chaincode** (Smart Contracts) encapsulates both the asset definitions and the business logic (or transactions) for modifying those assets. Transaction invocations result in changes to the ledger.

The **ledger** contains the current world state of the network and a chain of transaction invocations. A shared, permissioned ledger is an append-only system of records and serves as a single source of truth.

The **network** is the collection of data processing peers that form a blockchain network. The network is responsible for maintaining a consistently replicated ledger.

The **ordering service** is a collection of nodes that orders transactions into a block.

The **world state** reflects the current data about all the assets in the network. This data is stored in a database for efficient access. Current supported databases are LevelDB and CouchDB.

The **membership service provider** (MSP) manages identity and permissioned access for clients and peers.

## The Catch

We will start with Sarah, our licensed tuna fisher, who makes a living selling her tuna to multiple restaurants. Sarah operates as a private business, in which her company frequently makes international deals. Through a client application, Sarah is able to gain entry to a Hyperledger Fabric blockchain network comprised of other fishermen, as well as regulators and restaurant owners. Sarah has the ability to add to and update information in the blockchain network's  ledger as tuna pass through the supply chain, while regulators and restaurants have read access to the ledger.

After each catch, Sarah records information about each individual tuna, including: a unique ID number, the location and time of the catch, its weight, the vessel type, and who caught the fish. For the sake of simplicity, we will stick with these six data attributes. However, in an actual application, many more details would be recorded, from toxicology, to other physical characteristics.

These details are saved in the world state as a key/value pair based on the specifications of a chaincode contract, allowing Sarah’s application to effectively create a transaction on the ledger. You can see the example below:

`$ var tuna = { id: ‘0001’, holder: ‘Sarah’, location: { latitude: '41.40238', longitude: '2.170328'}, when: '20170630123546', weight: ‘58lbs’, vessel : ‘9548E’ }`

## The Incentives

Miriam is a restaurant owner looking to source low cost, yet high quality tuna that have been responsibly caught. Whenever Miriam buys tuna, she is always uncertain whether she can trust that the tuna she is purchasing is legally and sustainably caught, given the prominence of illegal and unreported tuna fishing.

At the same time, as a legitimate and experienced fisherman, Sarah strives to make a living selling her tuna at a reasonable price. She would also like autonomy over who she sells to and at what price.

Luckily for both Sarah and Miriam, Hyperledger Fabric can help!

## The Sale

Normally, Sarah sells her tuna to restaurateurs, such as Carl, for $80 per pound. However, Sarah agrees to give Miriam a special price of $50 per pound of tuna, rather than her usual rate. In a traditional public blockchain, once Sarah and Miriam have completed their transaction, the entire network is able to view the details of this agreement, especially the fact that Sarah gave Miriam a special price. As you can imagine, having other restaurateurs, such as Carl, aware of this deal is not economically advantageous for Sarah.

[Fabric tuna sale scenario](..images/fabric_sale_scenario.png)

To remedy this, Sarah wants the specifics of her deal to not be available to everyone on the network, but still have every actor in the network be able to view the details of the fish she is selling. Using Hyperledger Fabric's feature of **channels,** Sarah can privately agree on the terms with Miriam, such that only the two of them can see them, without anyone else knowing the specifics.

Additionally, other fishermen, who are not part of Sarah and Miriam’s transaction, will not see this transaction on their ledger. This ensures that another fisherman cannot undercut the bid by having information about the prices that Sarah is charging different restaurateurs.

## The Regulators

Regulators will also gain entry to this Hyperledger Fabric blockchain network to confirm, verify, and view details from the ledger. Their application will allow these actors to query the ledger and see the details of each of Sarah’s catches to confirm that she is legally catching her fish. Regulators only need to have query access, and do not need to add entries to the ledger. With that being said, they may be able to adjust who can gain entry to the network and/or be able to remove fishermen from the network, if found to be partaking in illegal activities.

## Gaining Network Membership

Hyperledger Fabric is a permissioned network, meaning that only participants who have been approved can gain entry to the network. To handle network membership and identity, **membership service providers** (MSP) manage user IDs, and authenticate all the participants in the network. A Hyperledger Fabric blockchain network can be governed by one or more MSPs. This provides modularity of membership operations, and interoperability across different membership standards and architectures.

In our scenario, the regulator, the approved fishermen, and the approved restaurateurs should be the only ones allowed to join the network. To achieve this, a membership service provider (MSP) is defined to accommodate membership for all members of this supply chain. In configuring this MSP, certificates and membership identities are created. Policies are then defined to dictate the read/write policies of a channel, or the endorsement policies of a chaincode.

Our scenario has two separate chaincodes, which are run on three separate channels. The two chaincodes are: one for the price agreement between the fisherman and the restaurateur, and one for the transfer of tuna. The three channels are: one for the price agreement between Sarah and Miriam; one for the price agreement between Sarah and Carl; and one for the transfer of tuna. Each member of this network knows about each other and their identity. The channels provide privacy and confidentiality of transactions.

In Hyperledger Fabric, MSPs also allow for dynamic membership to add or remove members to maintain integrity and operation of the supply chain. For example, if Sarah was found to be catching her fish illegally, she can have her membership revoked, without compromising the rest of the network. This feature is critical, especially for enterprise applications, where business relationships change over time.

## Summary of Demonstrated Scenario

Below is a summary of the tuna catch scenario presented in this section:

1. Sarah catches a tuna and uses the supply chain application’s user interface to record all the details about the catch to the ledger. Before it reaches the ledger, the transaction is passed to the endorsing peers on the network, where it is then endorsed. The endorsed transaction is sent to the ordering service, to be ordered into a block. This block is then sent to the committing peers in the network, where it is committed after being validated.

2. As the tuna is passed along the supply chain, regulators may use their own application to query the ledger for details about specific catches (excluding price, since they do not have access to the price-related chaincode).

3. Sarah may enter into an agreement with a restaurateur Carl, and agree on a price of $80 per pound. They use the blue channel for the chaincode contract stipulating $80/lb. The blue channel's ledger is updated with a block containing this transaction.

4. In a separate business agreement, Sarah and Miriam agree on a special price of $50 per pound. They use the red channel's chaincode contract stipulating $50/lb. The red channel's ledger is updated with a block containing this transaction.

[Demonstrated scenario](..images/Demonstrated_Tuna_Fishing_Scenario.png)

## Video: Introduction to Hyperledger Fabric Architecture (Arianna Groetsema)

[![Introduction to Hyperledger Fabric Architecture (Arianna Groetsema)](../images/video-image.png)](https://youtu.be/nyNUvtsmZNE)

## Roles within a Hyperledger Fabric Network

There are three different types of roles within a Hyperledger Fabric network:

**Clients** are data partitioning mechanisms that allow transaction visibility for stakeholders only. Each channel is an independent chain of transaction blocks containing only transactions for that particular channel.

**Peers** (Smart Contracts) encapsulates both the asset definitions and the business logic (or transactions) for modifying those assets. Transaction invocations result in changes to the ledger.

**Ordering Service** contains the current world state of the network and a chain of transaction invocations. A shared, permissioned ledger is an append-only system of records and serves as a single source of truth.

## How to Reach Consensus

In a distributed ledger system, **consensus** is the process of reaching agreement on the next set of transactions to be added to the ledger. In Hyperledger Fabric, consensus is made up of three distinct steps:

- Transaction endorsement
- Ordering
- Validation and commitment.

These three steps ensure the policies of a network are upheld. We will explore how these steps are implemented by exploring the transaction flow.

## Transaction Flow (Step 1)

Within a Hyperledger Fabric network, transactions start out with client applications sending transaction proposals, or, in other words, proposing a transaction to endorsing peers.

[This is the first step of the transaction flow, the transaction proposal](..images/Key_Components_-_Transaction_Proposal.png)

**Client applications** are commonly referred to as **applications** or **clients**, and allow people to communicate with the blockchain network. Application developers can leverage the Hyperledger Fabric network through the application SDK.

## Transaction Flow (Step 2)

Each endorsing peer simulates the proposed transaction, without updating the ledger. The endorsing peers will capture the set of **R**ead and **W**ritten data, called **RW Sets**. These RW sets capture what was read from the current world state while simulating the transaction, as well as what would have been written to the world state had the transaction been executed. These RW sets are then signed by the endorsing peer, and returned to the client application to be used in future steps of the transaction flow.

[This is the second step of the transaction flow, when endorsers simulate transactions, generate RW sets, and return the signed RW sets back to the client application](..images/Transaction_flow_step_2.png)

Endorsing peers must hold smart contracts in order to simulate the transaction proposals.

## Transaction Endorsement

A transaction endorsement is a signed response to the results of the simulated transaction. The method of transaction endorsements depends on the endorsement policy which is specified when the chaincode is deployed. An example of an endorsement policy would be "the majority of the endorsing peers must endorse the transaction". Since an endorsement policy is specified for a specific chaincode, different channels can have different endorsement policies.

## Transaction Flow (Step 3)

The application then submits the endorsed transaction and the RW sets to the ordering service. Ordering happens across the network, in parallel with endorsed transactions and RW sets submitted by other applications.

[This is the third step in the transaction flow, the the client application submits to the ordering service](..images/Transaction_flow_step_3.png)

## Transaction Flow (Step 4)

The **ordering service** takes the endorsed transactions and RW sets, orders this information into a block, and delivers the block to all committing peers.

[This is step 4 of the transaction flow, where the orderer sends ordered transactions in a block to all committing peers](..images/Transaction_Flow_Step_4.png)

## Video: Ordering Service (Chris Ferris)

[![Ordering Service (Chris Ferris)](../images/video-image.png)](https://youtu.be/mwIMxMRZFL4)

## Ordering (Part I)

*Transactions within a timeframe are sorted into a block and are committed in sequential order.*

In a blockchain network, transactions have to be written to the shared ledger in a consistent order. The order of transactions has to be established to ensure that the updates to the world state are valid when they are committed to the network. Unlike the Bitcoin blockchain, where ordering occurs through the solving of a cryptographic puzzle, or *mining*, Hyperledger Fabric allows the organizations running the network to choose the ordering mechanism that best suits that network. This modularity and flexibility makes Hyperledger Fabric incredibly advantageous for enterprise applications.

