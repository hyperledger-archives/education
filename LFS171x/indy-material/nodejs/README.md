# Hyperledger Indy Agent Demonstration

This folder contains a demonstration of basic Hyperledger Indy Agents. The agents provide a web browser interface to show establishing relationships between agents, issuing Verifiable Credentials, and proving claims from Verifiable Credentials.

To learn more about Hyperledger Indy, see the project wiki - https://wiki.hyperledger.org/projects/indy.

This demo is used as an exercise for those taking the Hyperledger Project's EdX  [Blockchain for Business](https://www.edx.org/course/blockchain-business-introduction-linuxfoundationx-lfs171x-0) course.

Once you have the demo started, this **[Agent Demo Script](AgentDemoScript.md)** guides you through the scenario of Alice using Hyperledger Indy to get her transcripts from Faber College and then using them to apply for a job with Acme Corp.

[Click here](https://youtu.be/9WZxlrGMA3s) to view a short screencast of the demo.

## Credits

The code for this demonstration was initially written by Spencer Holman and Matthew Hailstone of Brigham Young University. Carol Howard created the documentation for the demonstration.

## Prerequisites

To run this Indy Agent demonstration, you must have the following installed:

* Docker, including Docker Compose - Community Edition is fine.
  * If you do not already have Docker installed, open [this link](https://docs.docker.com/install/#supported-platforms) and then click the link for the installation instructions for your platform.
  * Instructions for installing docker-compose for a variety of platforms can be found [here](https://docs.docker.com/compose/install/).
* git
  * [This link](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/) provides installation instructions for Mac, Linux (including if you are running Linux using VirtualBox) and native Windows (without VirtualBox).

## Installing the Demonstration

To install the demonstration, you need to clone the git repository for the EdX Blockchain for Business course. To do that:

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

## Running the Demonstration

To run the demonstration:

* If you just installed the demonstration software, you are where you need to be.
  * If not, open up a terminal window and navigate to the directory you did when Installing the Demonstration section (above).
* To build the software, run the command `docker-compose build`
* Once the build completes, start the demo by running the command `docker-compose up`

It will take awhile for the demo to start - lots of things are happening. The logs for all of the containers will display in the terminal window from which you started the demo.

Things to look for as the demo starts up:

* You should periodically see things like "Listening on port 3001", which indicates an Agent is up and running.
* You should **not** see a stack trace error in the code - that would indicate a problem.
* You should **not** see any "Container exiting" messages, indicating containers not starting up properly.
* There should be 10 docker containers running. In another terminal window, you can run "docker ps" to see if the 10 containers are running. Each will have a naming beginning with `nodejs_`.
* Once the output slows significantly and you only see messages from the nodes (the containers running the ledger), everything should be working.

### Access the ledger and agents in a web browser:

To open an agent instance, in a web browser navigate to. To go through the demonstration, you must open the following links in new tabs:
* [http://localhost:3000](http://localhost:3000) for Alice
* [http://localhost:3002](http://localhost:3002) for Faber College
* [http://localhost:3003](http://localhost:3003) for Acme Corporation

The instructions for walking through the demonstration script are here: **[Agent Demo Script](AgentDemoScript.md)**

You can also open in a browser a Ledger Explorer:
* [http://localhost:9000](http://localhost:9000)

Although we don't talk about them in the demo overview, there are two additional Agents running that you can access:
* [http://localhost:3001](http://localhost:3001) for Bob
* [http://localhost:3004](http://localhost:3004) for Thrift Bank

# Stopping the Demo

To stop the demo, go to the terminal window where you ran `docker-compose up` and hit `Ctrl-C` once.  You should see a `Done` message as each of the 10 containers stops. If you hit `Ctrl-C` twice, you will be immediately returned to the command line prompt, but the containers may still be running.  Run the command `docker ps` to see if the containers are still running.

To clean up the environment to run the demo again, run the command `docker-compose down -v` which will remove the data (ledger, wallets) created in the prior run.

# Trouble Shooting

> As issues are discovered by users of this demo, we'll add more troubleshooting instructions here.

* Sometimes when restarting the demo without resetting the ledger, one or more of the ledger nodes will fail. If that happens:
  * Stop the demo running (instructions above)
  * Run `docker-compose down -v` to delete the volumes
  * Start the demo again by running the `docker-compose up` command
* The "validate" of the Government ID Credential for each of the Identities is failing - displaying a large red "X". We're still investigating why that is happening.