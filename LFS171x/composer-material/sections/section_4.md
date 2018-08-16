# Installing Hyperledger Composer

<!-- TAB 1 -->
## Technical Prerequisites - Ubuntu (Linux Virtual Machine)

To install Hyperledger Composer, you will need a UNIX based operating system, for instance, Linux or Mac OS X.
    
> We recommend using Ubuntu Linux 16.04 on a Virtual Machine (VM), even if you have a UNIX OS locally, as this gives you a clean environment that avoids errors and where you can experiment.

Ubuntu can be easily installed on either:
your local computer (e.g. using [VirtualBox](https://www.virtualbox.org/wiki/Downloads)), or
the cloud (e.g. through providers such as AWS, Azure, GCP, Digital Ocean or BlueMix).

Cloud providers often provide free credits or have plans enabling free usage of small VMs

### Text editor
On your local machine, we recommend you have an editor featuring a plugin for Hyperledger Composer.

Two such editors exist today:

- [Atom](https://atom.io/)
- [VS Code](https://code.visualstudio.com)

These will enable you to more easily work using the Hyperledger Composer Extension.


### Installing prerequisites

Connect to the command line of your virtual machine (e.g. by using SSH).

Download and install the prerequisites:

```bash
curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh
chmod u+x prereqs-ubuntu.sh
./prereqs-ubuntu.sh
```

<!-- TAB 2 -->
## Technical Prerequisites - Mac OS

To install Hyperledger Composer in your Mac you can either follow this video or the guided the procedure in the official [Hyperledger Composer Documentation](https://hyperledger.github.io/composer/latest/installing/installing-prereqs.html#macos).

> **VIDEO [EdX_1_prerequisites.mp4]**
> Transcript:

> In this video we will install the pre-requisites on a Mac.
>
> Let us open up a Terminal window. We first check if XCode is installed, which in our case it is. If it is not installed on your computer, you will be prompted to install it in the next step.
>
> Now we install the Node Version Manager or nvm. You may need to reload your bash shell configuration file. Now we can install the LTS version of node.js and activate it.
>
> We now download and install the Docker Community Edition. You may need to make an account. We drag Docker into our Applications folder. Now open it and login with your account. Check that it works by running the hello-world image.
>
> We now download the VSCode editor. We drag it to our Applications Folder and open it. We go to the Extension section, and search for Hyperledger. We then install the Hyperledger Composer extension.
>
> Let us switch back to the terminal. In our bash configuration file we tell NVM to use the LTS version of Node. And we can now use the Node Package Manager to install the Hyperledger Composer tools.
>
> After this we download the Hyperledger Fabric development server scripts. We extract the files and we run downloadFabric.sh to fetch the Docker images.
>
> We can then start the Hyperledger Fabric development server and create a peerAdmin identity card.
>
> Finally, we start the Hyperledger Composer playground, which we will use in a subsequent video.

<!-- TAB 3 -->
## Text editor
On your local machine, we recommend you have an editor featuring a plugin for Hyperledger Composer.

Two such editors exist today:

- [Atom](https://atom.io/)
- [VS Code](https://code.visualstudio.com)

These will enable you to more easily work using the Hyperledger Composer Extension.



<!-- TAB 4 -->
## Installing Hyperledger Composer components

You will now need to install the Hyperledger Composer components:

This installs the Composer Command Line Interface (CLI)

```
npm install -g composer-cli
```

Then install the Composer REST Server

```
npm install -g composer-rest-server
```

Install Composer Playground
```
npm install -g  composer-playground
```

Install Yeoman, enabling us to create empty or populated sample blockchain networks and web applications.
```
npm install -g yo
```

Install the Hyperledger Composer generator for Yeoman
```
npm install -g generator-hyperledger-composer
```

<!-- TAB 5 -->
## Install Hyperledger Fabric development server
We can now install the Hyperledger Fabric development server, which will act as the backend for our Hyperledger Composer work.

```
mkdir ~/fabric-tools && cd ~/fabric-tools

curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip
unzip fabric-dev-servers.zip
```

We can now download the Docker images for the Hyperledger Fabric components:

```
./downloadFabric.sh
```

<!-- TAB 6 -->
### Starting Hyperledger Fabric and Composer Playground
Inside the `fabric-tools` folder, we can now start the Docker images that comprise the Hyperledger Fabric network

```
./startFabric.sh
```

Then we can create an Hyperledger Fabric peer administrator identity for our networks:
```
./createPeerAdminCard.sh
```
You can then start the Composer Playground, which will run on port 8080 of the VM:


Finally, start Composer Playground

```
composer-playground
```

