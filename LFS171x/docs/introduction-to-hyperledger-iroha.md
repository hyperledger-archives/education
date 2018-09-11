# Introduction and Learning Objectives
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Introduction and Learning Objectives](#introduction-and-learning-objectives)
	- [Video: Introduction to Hyperledger Iroha (Alexandra & Arianna Groetsema)](#video-introduction-to-hyperledger-iroha-alexandra-arianna-groetsema)
	- [Learning Objectives](#learning-objectives)
- [Key Components](#key-components)
	- [Hyperledger Iroha](#hyperledger-iroha)
	- [Video: Hyperledger Iroha Key Components (Alexandra & Arianna Groetsema)](#video-hyperledger-iroha-key-components-alexandra-arianna-groetsema)
	- [Architecture Overview](#architecture-overview)
	- [Participants within the Network](#participants-within-the-network)
	- [Transaction Flow Basics (Part I)](#transaction-flow-basics-part-i)
	- [Transaction Flow Basics (Part II)](#transaction-flow-basics-part-ii)
	- [YAC (Yet Another Consensus) - Consensus Functions](#yac-yet-another-consensus-consensus-functions)
	- [YAC - Steps to Successful Consensus](#yac-steps-to-successful-consensus)
	- [YAC - Failure to Reach Consensus](#yac-failure-to-reach-consensus)
	- [Mobile Libraries](#mobile-libraries)
	- [Relationship to Hyperledger Fabric and Hyperledger Sawtooth](#relationship-to-hyperledger-fabric-and-hyperledger-sawtooth)
	- [Video: Discussing Hyperledger Iroha with Makoto Takemiya](#video-discussing-hyperledger-iroha-with-makoto-takemiya)
- [Joining the Hyperledger Iroha Community](#joining-the-hyperledger-iroha-community)
	- [Joining the Hyperledger Iroha Community on GitHub](#joining-the-hyperledger-iroha-community-on-github)
	- [Joining the Hyperledger Iroha Community via Rocket.Chat and Mailing Lists](#joining-the-hyperledger-iroha-community-via-rocketchat-and-mailing-lists)
- [Knowledge Check](#knowledge-check)
	- [Knowledge Check 5.1](#knowledge-check-51)
	- [Knowledge Check 5.2](#knowledge-check-52)
	- [Knowledge Check 5.3](#knowledge-check-53)
	- [Knowledge Check 5.4](#knowledge-check-54)
	- [Knowledge Check 5.5](#knowledge-check-55)
	- [Knowledge Check 5.6](#knowledge-check-56)
	- [Knowledge Check 5.7](#knowledge-check-57)
	- [Knowledge Check 5.8](#knowledge-check-58)
	- [Knowledge Check 5.9](#knowledge-check-59)
	- [Knowledge Check 5.10](#knowledge-check-510)
- [Conclusions & Learning Objectives (Review)](#conclusions-learning-objectives-review)
	- [Learning Objectives (Review)](#learning-objectives-review)
	- [Iroha API Documentation](#iroha-api-documentation)
	- [Video: Conclusions (Alexandra Groetsema)](#video-conclusions-alexandra-groetsema)

<!-- /TOC -->

## Video: Introduction to Hyperledger Iroha (Alexandra & Arianna Groetsema)

[![Introduction to Hyperledger Iroha (Alexandra & Arianna Groetsema)](../images/video-image.png)](https://youtu.be/rJUqTkExuCo)

## Learning Objectives

By the end of this chapter you should be able to:

* Understand the basics of Hyperledger Iroha v0.95.
* Discuss crucial components of the Hyperledger Iroha architecture, including the consensus algorithm YAC (Yet Another Consensus), peers, clients and the ledger block storage *Ametsuchi*.
* Join the Hyperledger Iroha framework discussion and development.

# Key Components

## Hyperledger Iroha

Hyperledger Iroha is a blockchain framework, and one of the Hyperledger projects hosted by The Linux Foundation. Hyperledger Iroha was initially contributed by Soramitsu, Hitachi, NTT Data, and Colu. Hyperledger Iroha is designed to be simple and easy to incorporate into infrastructure projects requiring distributed ledger technology. Hyperledger Iroha features a simple construction, modern, domain-driven C++ design, emphasis on mobile application development, and the YAC consensus algorithm.

![Iroha](../images/introduction-to-hyperledger-iroha/Iroha_3_sm.png)

## Video: Hyperledger Iroha Key Components (Alexandra & Arianna Groetsema)

[![Hyperledger Iroha Key Components (Alexandra & Arianna Groetsema)](../images/video-image.png)](https://youtu.be/yfOFSgRLhz4)

## Architecture Overview

Before diving into the key components of Hyperledger Iroha, it is important to get an overarching look at this framework. The diagram below shows a layered architectural view of the different components that make up Hyperledger Iroha. The four layers are: API, Peer Interaction, Chain Business Logic, and Storage.

|![Iroha Architecture](../images/introduction-to-hyperledger-iroha/Iroha-architecture.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

The components are:

* **Model** classes are system entities.
* **Torii** (gate) provides the input and output interfaces for clients. It is a single [gRPC](https://grpc.io/) server that is used by clients to interact with peers through the network. The client's RPC call is non-blocking, making Torii an asynchronous server. Both commands (transactions) and queries (read access) are performed through this interface.
* **Network** encompasses interaction with the network of peers.
* **Consensus** is in charge of peers agreeing on chain content in the network. The consensus mechanism used by Iroha is YAC (Yet Another Consensus), which is a practical byzantine fault-tolerant algorithm based on voting for block hash.
* **Simulator** generates a temporary snapshot of storage to validate transactions by executing them against this snapshot and forming a verified proposal, which consists only of valid transactions.
* **Validator** classes check business rules and validity (correct format) of transactions or queries. There are two distinct types of validation that occur in Hyperledger Iroha:
  * **Stateless validation** is a quicker form of validation, that performs schema and signature checks of the transaction.
  * **Stateful validation** is a slower form of validation, that checks the permissions and the current world state view, which is the latest and most actual state of the chain, to see if desired business rules and policies are possible. For example, does an account have enough funds to transfer?
* **Synchronizer** helps to synchronize new peers in the system or temporarily disconnected peers.
* **Ametsuchi** is the ledger block storage which consists of a block index (currently Redis), block store (currently flat files), and a world state view component (currently PostgreSQL).

## Participants within the Network

There are three main participants within a Hyperledger Iroha network:

* **Clients** are able to:
  1. Query data that they have access/permission to
  2. Perform a state-changing action, 'transaction', which consists of atomic operations, called 'commands'. For example, in a single transaction, a user can transfer funds to three people (three separate commands). But, if he/she does not have enough funds to cover for all, the whole transaction will be rejected.
* **Peers** maintain the current state and their own copy of the shared ledger. A peer is a single entity in the network, and has an address, identity, and trust. Hyperledger Iroha is designed so that a single peer may be a single computer or scaled for a cluster, meaning different computers are used for ledger storage, indices, validation, and peer-to-peer logic.
* **Ordering service** orders transactions into a known order. There are a few options for the algorithm used by the ordering service. Kafka is considered a good candidate. It is important to mention that if Kafka, or any other distributed solution is used, that it be clustered; otherwise, this will result in a single point of failure.

## Transaction Flow Basics (Part I)

**Step 1:** A client creates and sends a transaction to the **Torii** gate, which routes the transaction to a peer that is responsible for performing stateless validation.

|![Step 1 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_1_of_Iroha_Transaction_Flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

**Step 2:** After the peer performs stateless validation, the transaction is first sent to the ordering gate, which is responsible for choosing the right strategy of connection to the **ordering service.**

|![Step 2 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_2_of_Iroha_Transaction_Flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

**Step 3:** The ordering service puts transactions into order and forwards them to peers in the consensus network in the form of **proposals**. A proposal is an unsigned block shared by the ordering service, that contains a batch of ordered transactions. Proposals are only forwarded when the ordering service has accumulated enough transactions, or a certain amount of time has elapsed since the last proposal. This prevents the ordering service from sending empty proposals.

|![Step 3 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_3_of_Iroha_Transaction_Flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

## Transaction Flow Basics (Part II)

**Step 4:** Each peer verifies the proposal’s contents *(stateful validation)* in the *Simulator* and creates a block which consists only of verified transactions. This block is then sent to the *consensus gate* which performs YAC consensus logic.

|![Step 4 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_4_of_Iroha_transaction_flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

**Step 5:** An ordered list of peers is determined, and a leader is elected based on the YAC consensus logic. Each peer casts a vote by signing and sending their proposed block to the leader.

|![Step 5 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_5_of_Iroha_transaction_flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

**Step 6:** If the leader receives enough signed proposed blocks (i.e. more than two thirds of the peers), then it starts to send a **commit message**, indicating that this block should be applied to the chain of each peer participating in the consensus. Once the commit message has been sent, the proposed block becomes the next block in the chain of every peer via the *synchronizer*.

|![Step 6 of Iroha Transaction Flow](../images/introduction-to-hyperledger-iroha/Step_6_of_Iroha_Transaction_flow.png)|
|:--:|
|*Licensed under [CC By 4.0](https://creativecommons.org/licenses/by/4.0/)*|

## YAC (Yet Another Consensus) - Consensus Functions

Hyperledger Iroha currently implements a consensus algorithm called **YAC** (Yet Another Consensus), which is based on voting for block hash. Consensus involves taking blocks after they have been validated, collaborating with other blocks to decide on commit, and propagating commits between peers. The YAC consensus performs two functions: ordering and consensus.

Ordering is responsible for ordering all transactions, packaging them into proposals, and sending them to peers in the network. The ordering service is an endpoint for setting an order of transactions and their broadcast (in a form of proposal). Ordering is not responsible for performing stateful validation of transactions.

**Note:** Currently, the ordering service is a single point of failure that does the ordering, and, therefore, Hyperledger Iroha is neither crash fault-tolerant, nor byzantine fault-tolerant.

Consensus is responsible for agreement on blocks based on the same proposal.

Validation is an important part of the transaction flow, however it is separate from the consensus process.

## YAC - Steps to Successful Consensus

**Step 1:** The ordering service shares a **proposal** to all peers. A proposal is an unsigned block created and shared to peers in the network by the ordering service. It contains a batch of ordered transactions.

**Step 2:** Peers calculate the hash of a verified proposal and sign it. The resulting **<Hash, Signature>** tuple is called a **vote.**

**Step 3:** Based on the hashes created in the previous step, each peer computes an ordering list or order of peers. To do this, the ordering function will need to have knowledge of all the peers voting in the network, and is based on the hash of the proposed block. The first peer in the list is called the **leader.** The leader is responsible for collecting votes from other peers and sending the commit message.

**Step 4:** Each peer votes. The leader collects all the votes and determines the supermajority of votes for a certain hash. The leader sends a commit message that contains the votes of the committing block. This response is called a **commit.**

**Step 5:** After receiving the commit, the peers verify the commit and apply the block to the ledger. At this point, consensus is complete.

## YAC - Failure to Reach Consensus

We have just covered the steps needed to reach successful consensus, but there are also points in which failure may occur. Next, we will cover a couple of the failure cases: broken leader and bad transactions from the ordering service.

In the case of a broken leader, the leader may act unfairly in the collection of votes, or it takes the leader too long to respond with a commit. In such situations, other peers set a time for receiving a commit message from the leader. If the timer expires, the next peer in the order list becomes the new leader.

In the case of bad transactions from the ordering service, the ordering service may forward transactions that do not pass stateless validation. To rectify this, peers should remove those transactions from the proposal, and further compute the hash from the rest of the transactions in the proposal.

## Mobile Libraries

One of the most defining characteristics of Hyperledger Iroha is its focus on providing mobile libraries.

A major goal with Hyperledger Iroha is creating a distributed ledger system that can be easily utilized by applications. In order to accomplish this, Hyperledger Iroha offers open source software libraries for **iOS, Android,** and **Javascript.** These libraries allow for simple compatibility with not only Hyperledger Iroha, but also, potentially, with other networks through flexible API functions.

If you would like to take a look, these libraries are all open source, and available on Github:

* Android: https://github.com/hyperledger/iroha-android
* iOS: https://github.com/hyperledger/iroha-ios.

## Relationship to Hyperledger Fabric and Hyperledger Sawtooth

One of the main goals at Hyperledger in the future is to have less disjointed projects, and more libraries that can be used together as components. With that vision in mind, Hyperledger Iroha wants to eventually provide the following C++ components that can be used by other Hyperledger projects:

* YAC consensus library
* Ed25519 digital signature library
* SHA-3 hashing library
* Iroha transaction serialization library
* P2P communication library
* iOS library
* Android library
* JavaScript library
* Blockchain explorer/data visualization suite.

## Video: Discussing Hyperledger Iroha with Makoto Takemiya

[![Discussing Hyperledger Iroha with Makoto Takemiya](../images/video-image.png)](https://youtu.be/8kFSadbumXQ)

# Joining the Hyperledger Iroha Community

## Joining the Hyperledger Iroha Community on GitHub

Hyperledger Iroha is an open source project where ideas and code can be publicly discussed, created, and reviewed. There are many ways to join the Hyperledger Iroha community, and we will share with you some of the ways to get involved, either from a technical standpoint, or from an ideas/issues creation perspective.

You can get involved with the Hyperledger Iroha community on GitHub. All code available on GitHub is forkable and viewable:

* https://github.com/hyperledger/iroha
* https://github.com/hyperledger/iroha-ios
* https://github.com/hyperledger/iroha-android
* https://github.com/hyperledger/iroha-javascript
* https://github.com/hyperledger/iroha-python
* https://github.com/hyperledger/iroha-scala
* https://github.com/hyperledger/iroha-dotnet
* https://github.com/hyperledger/iroha-api.

![GitHub Logo](../images/GitHub.png)

## Joining the Hyperledger Iroha Community via Rocket.Chat and Mailing Lists

You can join the live conversations on Rocket.Chat (which is an alternative to Slack), using your Linux Foundation ID:

* https://chat.hyperledger.org/channel/iroha
* https://chat.hyperledger.org/channel/iroha-smartcontracts.

Another option is to join the mailing list(s) for technical discussions and announcements: https://lists.hyperledger.org/mailman/listinfo/hyperledger-iroha.

<img src="../images/RocketChat_Logo.png" alt="RocketChat Logo" width=300>

# Knowledge Check

## Knowledge Check 5.1
<!-- C -->
Which of the following classes of consensus is currently used by Hyperledger Iroha?

<ol type="A">
<li>Proof of Work</li>
<li>Proof of Stake</li>
<li>BFT (YAC)</li>
<li>Proof of Elapsed Time</li>
</ol>

## Knowledge Check 5.2
<!-- D -->
Which of the following features did developers have in mind when they created Hyperledger Iroha?

<ol type="A">
<li>Simple construction</li>
<li>Emphasis on mobile application development</li>
<li>Allow for C++ design and development</li>
<li>All of the above</li>
<li>None of the above</li>
</ol>

## Knowledge Check 5.3
<!-- B,C -->
Which of the following functions are performed by the YAC algorithm in Hyperledger Iroha? Select all answers that apply.

<ol type="A">
<li>Validation</li>
<li>Ordering</li>
<li>Consensus</li>
<li>Voting</li>
</ol>

## Knowledge Check 5.4
<!-- C -->

Which of the following did Makoto Takemiya point out to be the main goal for Hyperledger Iroha in the future?

<ol type="A">
<li>Scalability</li>
<li>Media coverage</li>
<li>Interoperability</li>
</ol>

## Knowledge Check 5.5
<!-- A -->
Which of the following components is NOT part of the peer interaction level?

<ol type="A">
<li>Torii</li>
<li>Network</li>
<li>Consensus</li>
</ol>

## Knowledge Check 5.6
<!-- A -->
It is the responsibility of the leader to collect votes from other peers and forward commit messages to peers. True or False?

<ol type="A">
<li>True</li>
<li>False</li>
</ol>

## Knowledge Check 5.7
<!-- A -->
The main difference between stateless validation and stateful validation is that stateless validation is faster and does not require access to the data on the chain. True or False?

<ol type="A">
<li>True</li>
<li>False</li>
</ol>

## Knowledge Check 5.8
<!-- A -->
What happens in consensus if a leader fails to respond with a commit message in a timely manner?

<ol type="A">
<li>Another peer is appointed to be leader</li>
<li>Consensus fails</li>
<li>Votes are submitted again to the leader</li>
<li>The proposed block is committed by the ordering service</li>
</ol>

## Knowledge Check 5.9
<!-- C -->
Which of the following best describes the role of the ordering service?

<ol type="A">
<li>Performs stateless validation and ordering of transactions</li>
<li>Orders peers into an ordering list to select a leader</li>
<li>Orders transactions into proposals which are sent to peers</li>
<li>Orders votes and determines supermajority</li>
</ol>

## Knowledge Check 5.10
<!-- C -->
What is the a leader's responsibility in Hyperledger Iroha?

<ol type="A">
<li>Determines whether votes are valid</li>
<li>Orders transactions into a proposal block</li>
<li>Collects votes from other peers and forwards commit messages to peers</li>
<li>Collects transactions from the ordering service and creates commit messages</li>
</ol>

# Conclusions & Learning Objectives (Review)

## Learning Objectives (Review)

You should now be able to:

* Understand the basics of Hyperledger Iroha v0.95.
* Discuss crucial components of the Hyperledger Iroha architecture, including the consensus algorithm YAC (Yet Another Consensus), peers, clients and the ledger block storage *Ametsuchi*.
* Join the Hyperledger Iroha framework discussion and development.

## Iroha API Documentation

The Hyperledger Iroha team has been actively working on creating API documents. If you are interested in taking a look and testing for yourself, you can visit https://hyperledger.github.io/iroha-api/#overview.

## Video: Conclusions (Alexandra Groetsema)

[![Conclusions (Alexandra Groetsema)](../images/video-image.png)](https://youtu.be/oG6cwWHC-QA)
