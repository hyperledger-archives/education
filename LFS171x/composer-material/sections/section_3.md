# Hyperledger Composer Architecture

## Hyperledger Composer Key Components  (VIDEO)  

### Fabric Integration  today, others tomorrow (Sawtooth, etc.)

Since its inception, Hyperledger Composer has provided integration with Hyperledger Fabric. However, future releases aim to integrate with other Hyperledger frameworks such as Sawtooth or Iroha.

### Key concepts

> Brief summary or diagram of https://hyperledger.github.io/composer/latest/introduction/key-concepts

### Tech Components Overview

- **Yeoman** and its Hyperledger Composer Generator.
- **Modeling language** to create Assets and Participants.
- **JavaScript** (Node.js) to create Smart Contracts (Transactions).
- **Composer Playground** to instantiate Assets and Participants, and run Smart Contracts (Transactions).
- **Access Control Language** to control visibility and actions on resources.
- **Query Language** to design and enable complex queries on the Blockchain Data.
- **REST server** to integrate transaction and queries to existing systems.

### Modeling language

Hyperledger Composer includes an object-oriented modeling language that is used to define the domain model for a business network definition.

A Hyperledger Composer CTO file is composed of the following elements:
1. A single namespace. All resource declarations within the file are implicitly in this namespace.
2. A set of resource definitions, encompassing assets, transactions, participants, and events.
3. Optional import declarations that import resources from other namespaces.

For instance, the Modelling language allows both technical and business users to define resources, such as network participants and assets, as well as define the structure and elements involved in network transactions.

Examples:

```
o String simpleString
o Integer anInt
o Boolean aBool
o DateTime dateTime
o Object anObject
--> Object aReferenceToAnObject 
```

It also features data validation of fields, simplifying and standardising their implementation.

```
o String firstName default 'NoName'
o String lastName optional
o String postcode regex=/(GIR 0AA)|((([A-Z-[QVf]][0-9][0-9]?)|(([A-Z-[QVf]][A-Z-[IJZ]][0-9][0-9]?)|(([A-Z-[QVf]][0-9][A-HJKPSTUW])|([A-Z-[QVf]][A-Z-[IJZ]][0-9][ABEHMNPRVWfY])))) [0-9][A-Z-[CIKMOV]]{2})/
```

### Transaction logic

The actual transactions are encoded with JavaScript (JS), one of the most popular programming languages. This lowers the barrier to entry since a programmer competent with JS can quickly become productive without needing to learn the less well known Golang, in the case of Hyperledger Fabric.

> Include a simple snippet from the demo

### Identities

Composer also integrates a system for managing identities through the use of ID cards. These ID cards contain the cryptographic material needed to communicate with the Blockchain network.

### Access Control Rules 

The Access Control language enables the simple definition of rules for accessing assets and transactions by different types of participant and identity. Again, it is readable for both business and technical users.

For example, a rule may allow, for instance, a trader to access and transfer his own assets but allow an auditor read-only access to all assets on the network.

### Query language

The Query language allows querying information on the Blockchain using a Structured Query Language (SQL) type interface.

This can, for instance, enable complex queries that list all the assets of a participant that have been traded within a certain period.

### REST Server

All the above components can be packaged into a Business Network Archive to be tested in the Playground sandbox, or exposed through a REST API. The REST API can use one or more ID cards to authenticate the requests done by network participants.

The REST server provided by Hyperledger Composer allows exposing the blockchain’s participants, assets, transactions and queries with a transparent Application Programming Interface (API).

This makes it easy to allow easy programmatic access to the Blockchain. This makes it trivial to connect the Blockchain to a web- or mobile-app.
