// SPDX-License-Identifier: Apache-2.0

'use strict';
/**
 * Defining the namespace for the business network
 */
const NS = 'org.tuna';

/**
 * Transfer tuna from one owner to another
 * @param {org.tuna.SellTuna} tx - The transferTuna transaction
 * @transaction
 */
async function sellTuna(tx) {

    // Get asset registry for Tuna
    const tunaRegistry = await getAssetRegistry(NS + '.Tuna');

    // Get participant registry for Individuals
    const restaurantOwnerRegistry = await getParticipantRegistry(NS + '.RestaurantOwner');

    const tuna = await tunaRegistry.get(tx.tuna.getIdentifier());
    // Make sure that Tuna exists
    if (!tuna) {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} does not exist`);
    }

    // Make sure the tuna status is CAUGHT and not PURCHASED
    if (tuna.status !== 'CAUGHT') {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is not in CAUGHT status`);
    }

    // Get restaurantOwner ID
    const restaurantOwnerId = tx.restaurantOwner.getIdentifier();

    // Make sure that restaurantOwner exists
    const restaurantOwner = await restaurantOwnerRegistry.get(restaurantOwnerId);
    if (!restaurantOwner) {
        throw new Error(`RestaurantOwner with id ${restaurantOwnerId} does not exist`);
    }

    // Update tuna with new owner
    tx.tuna.owner = tx.restaurantOwner;
    tx.tuna.status = 'PURCHASED';

    // Update the asset in the asset registry.
    await tunaRegistry.update(tx.tuna);

    // Create a Tuna Sale Event
    let tunaSaleEvent = getFactory().newEvent(NS, 'TunaSale');
    tunaSaleEvent.tunaId = tx.tuna.tunaId;
    tunaSaleEvent.restaurantName = tx.restaurantOwner.restaurantName;

    // Emit the Event
    emit(tunaSaleEvent);
}
