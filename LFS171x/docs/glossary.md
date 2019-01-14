# Glossary

On this page, we will have a list of the key concepts that are used in this course, and their definitions, that will help you when going through the course content. These definitions will be quickly accessible from anywhere within the course, just click on the **Glossary** tab.

**Block** - A set of transactions that are bundled together and added to the chain at the same time.

**Byzantine Fault Tolerance Algorithm** - A consensus algorithm designed to defend against failures in the system caused by forged or malicious messages. In order to be fault tolerant of a Byzantine fault, the number of nodes that must reach consensus is ***2f+1*** in a system containing ***3f+1***, where ***f*** is the number of faults in the system. 

**Chaincode** - Smart contracts in Hyperledger Fabric. They encapsulate both the asset definitions and the business logic (or transactions) for modifying those assets.

**Consensus Algorithm** - Refers to a system of ensuring that parties agree to a certain state of the system as the true state.

**Cryptocurrency** - is a digital asset that is used as a medium of exchange. A cryptocurrency is exchanged by using digital signatures to transfer ownership from one cryptographic key pair to another key pair. Since this digital asset has characteristics of money (like store of value and medium of exchange), it is generally referred to as currency. Note: It should not be confused with digital currency or virtual currency.

**Cryptoeconomics** - A field of study that explores the intersection of cryptography and economic incentives. While cryptography is used for ensuring network security at various levels and functions, the built-in economic incentives provided to the participating nodes in the network ensure that, at any given point, the majority of players in the network operate in a desirable way. 

**Cryptography** - The study of the techniques used to allow secure communication between different parties, and to ensure the authenticity and immutability of the data being communicated.

**Distributed Ledger** - A type of data structure which resides across multiple computer devices, generally spread across locations and regions.

**Hash Function** - It is used to map data of any size to a fixed length. The output of a hash function is referred to as a hash, hash value, or digest. One important characteristic of a hash function is that, when given a specific input, the hash function will always produce the exact same output.

**Key/Value Pair** - It consists of two parts, one designated as a 'key', and another as a 'value'. The 'key' is an identifier that allows you to look up the 'value'. The 'value' is the data that is stored for a given 'key'.

**Mining** - The process of solving computational challenging puzzles in order to create new blocks in the Bitcoin blockchain.

**Node** - Computer device attached to a blockchain network. Types of nodes include: mining nodes, validator nodes, committer nodes, and endorser nodes. Nodes are sometimes also called 'peers' because they make up the devices within a peer-to-peer network.

**Peer-to-Peer Network** - A network which consists of computer systems directly connected to each other via the Internet without a central server.

**Private/Public Keys** - Private keys are used to derive a public key. While private keys remain confidential, public keys are available to everyone in the network (similar to an email address). Anything encrypted with a public key can only be decrypted using its corresponding private key, and vice versa. 

**Proof of Elapsed Time (PoET)** - Consensus algorithm used by Hyperledger Sawtooth that utilizes a lottery function in which the node with the shortest wait time creates the next block. 

**Proof of Stake (PoS)** - Consensus algorithm where nodes are randomly selected to validate blocks, and the probability of this random selection depends on the amount of stake held.

**Proof of Work (PoW)** - Consensus algorithm first utilized by Bitcoin that involves solving a computational challenging puzzle in order to create a new block.

**Smart Contract** - Computer program that executes predefined actions when certain conditions within the system are met. Smart contracts were first proposed by Nick Szabo in 1996 (http://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart_contracts_2.html).

**State** - Contains up-to-date data that represents the latest values for all keys included in the network's ledger. The state of a network encompasses all past transactions in the network, from the genesis block to the present time.

**Transaction** - A record of an event, cryptographically secured with a digital signature, that is verified, ordered, and bundled with other such records into blocks. 

**Transaction Families** - Smart contracts in Hyperledger Sawtooth. They define the operations that can be applied to transactions. Transaction families consist of both transaction processors (the server-side logic) and clients (for use from web or mobile applications).

**Turing-Complete** - Named after Alan Turing, an English mathematician and computer scientist, it refers to a computer that can solve any problem that a Turing Machine can. A Turing Machine is a machine that can simulate any computer algorithm, no matter how complicated. Bitcoin scripting language is not Turing-Complete, as there are no looping and branching types of computing sequences. Ethereum's Solidity language is considered Turing-Complete, as it does have looping and branching.  
