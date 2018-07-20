# Installing Hyperledger Composer

## Technical Prerequisites

### Ubuntu Linux Virtual Machine

To install Hyperledger Composer, you will need a UNIX based operating system, for instance, Linux or Mac OS X.

We recommend using Ubuntu Linux 16.04 on a Virtual Machine (VM), even if you have a UNIX OS locally, as this gives you a clean environment that avoids errors and where you can experiment.

Ubuntu can be easily installed on either:

1. your local computer (e.g. using VirtualBox), or
2. the cloud (e.g. through providers such as AWS, Azure, GCP, Digital Ocean or BlueMix)

Cloud providers often provide free credits or have plans enabling free usage of small VMs

Henceforth we will assume you are using an Ubuntu Linux VM.

### A text editor

On your local machine, we recommend you have an editor featuring a plugin for Hyperledger Composer. Two such editors exist today:

* Atom:
  * Website: https://atom.io/
  * Extension: https://github.com/hyperledger/composer-atom-plugin
* VS Code:
  * Website: https://code.visualstudio.com
  * Extension: https://github.com/hyperledger/composer-vscode-plugin

These will enable you to more easily work with Hyperledger Composer.

> 1. How to install VSCode / Atom
> 2. Install Hyperledger Composer extension

## Installing prerequisites

Connect to the command line of your virtual machine (e.g. by using SSH).

Download and install the prerequisites:

### Ubuntu

```bash
curl -O https://hyperledger.github.io/composer/prereqs-ubuntu.sh
chmod u+x prereqs-ubuntu.sh
./prereqs-ubuntu.sh
```

### Mac OS

> https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html#macos

## Installing Hyperledger Composer components

You will now need to install the Hyperledger Composer components by:

```bash
npm install -g composer-cli composer-rest-server composer-playground generator-hyperledger-composer yo 
```

This installs the Composer Command Line Interface (CLI), the REST Server, the Playground and the generator for Yeoman, enabling us to create skeleton blockchain and web applications.

## Hyperledger Fabric development server

We can now install the Hyperledger Fabric development server, which will act as the backend for our Hyperledger Composer work.

```bash
mkdir ~/fabric-tools && cd ~/fabric-tools

curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip

unzip fabric-dev-servers.zip
```

We can now download the Docker images for the Hyperledger Fabric components:

```bash
./downloadFabric.sh
```

## Starting Hyperledger Composer

Inside the `fabric-tools` folder, we can now start the Docker images that comprise the Hyperledger Fabric network

```bash
./startFabric.sh
```

Then we can create an Hyperledger Fabric peer administrator identity for our networks:

```bash
./createPeerAdminCard.sh
```

You can then start the Composer Playground, which will run on port 8080 of the VM:

```bash
composer-playground
```

## Install development environment and start Hyperledger Composer  [VIDEO]
