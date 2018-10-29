/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const expect = require('chai').expect;

const namespace = 'org.tuna';

describe('Sell Tuna', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore({type: 'composer-wallet-inmemory'});
    let adminConnection;
    let businessNetworkConnection;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({commonName: 'admin'});

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: ['PeerAdmin', 'ChannelAdmin']
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({cardStore: cardStore});

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({cardStore: cardStore});

        const adminUserName = 'admin';
        let adminCardName;
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition);

        // Start the business network and configure an network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;
        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);
    });

    describe('#sellTuna', () => {

        it('should be able to sell the tuna', async () => {

            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the fisher
            const fisher = factory.newResource(namespace, 'Fisher', 'fisher01');
            fisher.name = 'Fisher 01';
            fisher.licenseNumber = '0000001';
            fisher.address = factory.newConcept(namespace, 'Address');
            fisher.address.addressLine = 'Amsterdam Port';
            fisher.address.locality = 'Amsterdam';
            fisher.address.postCode = '1000 GK';

            // create the restaurant owner
            const restaurantOwner = factory.newResource(namespace, 'RestaurantOwner', 'restaurantOwner01');
            restaurantOwner.name = 'Restaurant Owner 01';
            restaurantOwner.restaurantName = 'The Fresh Tuna';
            restaurantOwner.address = factory.newConcept(namespace, 'Address');
            restaurantOwner.address.addressLine = 'Amsterdam City Centre';
            restaurantOwner.address.locality = 'Amsterdam';
            restaurantOwner.address.postCode = '1000 GK';

            // create the Tuna owned by the Fisher
            const tuna = factory.newResource(namespace, 'Tuna', 'tuna001');
            tuna.weight = 2000;
            tuna.status = 'CAUGHT';
            tuna.catchTime = new Date('2018-08-15T11:03:52+00:00');
            tuna.owner = factory.newRelationship(namespace, 'Fisher', fisher.getIdentifier());

            // sell tuna
            const sellTuna = factory.newTransaction(namespace, 'SellTuna');
            sellTuna.tuna = factory.newRelationship(namespace, 'Tuna', tuna.getIdentifier());
            sellTuna.restaurantOwner = factory.newRelationship(namespace, 'RestaurantOwner', restaurantOwner.getIdentifier());



            // Add the fisher
            const fisherRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Fisher');
            await fisherRegistry.add(fisher);

            // Add the restaurant Owner
            const restaurantOwnerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.RestaurantOwner');
            await restaurantOwnerRegistry.add(restaurantOwner);

            // Add the tuna
            const tunaRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Tuna');
            await tunaRegistry.add(tuna);

            // submit the sellTuna transaction
            await businessNetworkConnection.submitTransaction(sellTuna);

            // get the tuna and check its status and owner
            const newTuna = await tunaRegistry.get(tuna.getIdentifier());
            expect(newTuna.status).to.be.equal('PURCHASED');
            expect(newTuna.owner.getIdentifier()).to.be.equal(restaurantOwner.getIdentifier());
        });
    });
});