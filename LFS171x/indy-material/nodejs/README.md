# Hyperledger Indy Agent Demonstration

This folder contains a demonstration of basic Hyperledger Indy Agents. The agents provide a web browser interface to show establishing relationships between agents, issuing Verifiable Credentials, and proving claims from Verifiable Credentials.

> **This demonstration is based on some early Indy Agent code that should *NOT* be used as the basis of new implementations or as a reference for implementing an agent. Since  this demonstration was developed the Indy (and Aries) community has evolved the notion of Agents significantly and this code base has been abandoned. It is still a good demo for understanding how agents work on a superficial level -- the concepts of agents connecting and exchanging credentials. However, if you are interested in building on the latest Indy/Aries code, you should look at the [Aries project](https://github.com/hyperledger/aries), the [Aries Cloud Agent - Python](https://github.com/hyperledger/aries-cloudagent-python) and other interoperable components. If you are a developer (or wannabe), check out this [Becoming an Indy/Aries Developer](https://github.com/hyperledger/aries-cloudagent-python/tree/master/docs/GettingStartedAriesDev) guide.**

To learn more about Hyperledger Indy, see the project wiki - https://wiki.hyperledger.org/display/indy.

This demo is used as an exercise for those taking the Hyperledger Project's EdX  [Blockchain for Business](https://www.edx.org/course/blockchain-business-introduction-linuxfoundationx-lfs171x-0) course.

Once you have the demo started, this **[Agent Demo Script](AgentDemoScript.md)** guides you through the scenario of Alice using Hyperledger Indy to get her transcripts from Faber College and then using them to apply for a job with Acme Corp.

[Click here](https://youtu.be/9WZxlrGMA3s) to view a short screencast of the demo.

## Credits

The code for this demonstration was initially written by Spencer Holman and Matthew Hailstone of Brigham Young University. Carol Howard created the documentation for the demonstration.

## Running in your Browser or on Local Machine

This demo can be run in a terminal using just a browser , or if you are more technically inclined, you can run it on your local machine. In the following sections, there is a sub-section for `In Browser` and `Local Machine`, depending on how you want to run the demo.

## Prerequisites

### In Browser

The only prequisite (other than a browser) is an account with [Docker Hub](https://hub.docker.com). Docker Hub is the "Play Store" for the [Docker](https://docker.com) ecosystem.

### Local Machine

To run this Indy Agent demonstration on your local machine, you must have the following installed:

* Docker, including Docker Compose - Community Edition is fine.
  * If you do not already have Docker installed, open [this link](https://docs.docker.com/install/#supported-platforms) and then click the link for the installation instructions for your platform.
  * Instructions for installing docker-compose for a variety of platforms can be found [here](https://docs.docker.com/compose/install/).
* git
  * [This link](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/) provides installation instructions for Mac, Linux (including if you are running Linux using VirtualBox) and native Windows (without VirtualBox).

## Installing the Demonstration

### In Browser

Go to the [Play with Docker](https://labs.play-with-docker.com/) and (if necessary) login. This site is operated by Docker to support developers learning about Docker.

> If you want to learn more about the `Play with Docker` environment, look at the [About](https://training.play-with-docker.com/about/) and the Docker related tutorials at the Docker Labs [Training Site](https://training.play-with-docker.com).

Click the "Start" button to start a Docker sandbox you can use to run the demo, and then click the `+Add an Instance` link to start a terminal in your browser. Within the browser, run the following command:

- `git clone https://github.com/hyperledger/education`

> **Tip**: To paste text in the terminal window, right-click on the window and choose `paste`

- Navigate to the location of the code by running the command:
  - `cd education/LFS171x/indy-material/nodejs`

### Local Machine

To install the demonstration on your local machine you need to clone the git repository for the EdX Blockchain for Business course. To do that:

* Install the prerequisites listed above and make sure they are functioning on your system. To verify, open a terminal window and:
    * Run `git --version`, which should return something like: `git version 2.17.1`
    * Run `docker --version`, which should return something like: `Docker version 18.06.1-ce, build e68fc7a`
    * Run `docker-compose --version`, which should return something like: `docker-compose version 1.22.0, build f46880fe`
    * Your version numbers should be the same or higher.
* Open a terminal session and navigate to where you want to install the source code.
* Run the command: `git clone https://github.com/hyperledger/education/`
  * That will download the repository containing the source code onto your system.
* Navigate to the location of the code by running the command:
  * `cd education/LFS171x/indy-material/nodejs`

## Starting the Demonstration

The steps for runnning the demonstration are similar for the `In Browser` and `Local Machine` scenarios:

- Run the command `./manage build` to build the components of the software
- Run the command `./manage up` to run the components

It takes a while for the demo to start - lots of things are happening. The logs for all of the containers will display in the terminal window. Logs show the output of both the Blockchain Ledger nodes communicating, and the Indy Agents starting up and communicating with the Ledger.

Things to watch for as the demo starts up:

* You should periodically see things like "Listening on port 3001", which indicates an Agent is up and running.
* You should **not** see a stack trace error in the code - that would indicate a problem.
* You should **not** see any "Container exiting" messages, indicating containers not starting up properly.
* There should be 10 docker containers running. You can hit `ctrl-c` to exit the log viewer and run the command `docker ps` to see all of the containers running. Run `./manage logs` if you want to see the logs again.
* Once the output slows significantly and you only see messages from the nodes (the containers running the ledger), everything should be working.

### Access the ledger and agents in a web browser:

### In Browser

As the demo starts up, a series of 4 digit numbers will appear above the terminal. Those are the exposed ports of the running containers and the numbers are links to start a Browser tab accessing that port.

To go through the demonstration, click the following numbers from the list:

* **3000** for Alice
* **3002** for Faber College
* **3003** for Acme Corporation

If you click the links before the Agent is active, you might get a `Connection reset by peer` error messages. Monitor the logs and wait longer and then try again.

The instructions for walking through the demonstration script are here: **[Agent Demo Script](AgentDemoScript.md)**

You can also open in a browser a Blockchain Ledger Explorer:
* **9000**

Although we don't talk about them in the demo overview, there are two additional Agents running that you can access:
* **3001** for Bob
* **3004** for Thrift Bank

> The remainder of the numbers (ports - 9701-9708) are the ports to the Blockchain Ledger nodes - two per node.

## Local Machine

To go through the demonstration, open the following links in new browser tabs:
* [http://localhost:3000](http://localhost:3000) for Alice
* [http://localhost:3002](http://localhost:3002) for Faber College
* [http://localhost:3003](http://localhost:3003) for Acme Corporation

If you click the links before the Agent is active, you might get a `Connection reset by peer` error messages. Monitor the logs and wait longer and then try again.

The instructions for walking through the demonstration script are here: **[Agent Demo Script](AgentDemoScript.md)**

You can also open in a browser a Ledger Explorer:
* [http://localhost:9000](http://localhost:9000)

Although we don't talk about them in the demo overview, there are two additional Agents running that you can access:
* [http://localhost:3001](http://localhost:3001) for Bob
* [http://localhost:3004](http://localhost:3004) for Thrift Bank

## Stopping the Demo

### In Browser

To stop the demo, go to the browser tab where you ran `docker-compose up` and close the browser tab. Note that if you don't close the tab, the terminal session will expire 4 hours after you started it.

### Local Machine

To stop the demo, go to the terminal window where you ran `docker-compose up`. If the logs are scrolling and/or you are not at the command prompt, hit `Ctrl-C`. Run the command `./manage down`.  You should see a `Done` message as each of the 10 containers stops.  Run the command `docker ps` to see that the containers have stopped.

# Trouble Shooting

> As issues are discovered by users of this demo, we'll add more troubleshooting instructions here.

* The "validate" of the Government ID Credential for each of the Identities is often failing - displaying a large red "X". We're still investigating why that is happening in some cases but not others.