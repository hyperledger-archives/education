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

    // Make sure the tuna status is CAUGHT and not PURCHASED
    if (tx.tuna.status !== 'CAUGHT') {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is not in CAUGHT status`);
    }

    // Get newOwner ID
    const newOwnerID = tx.newOwner.getIdentifier();

    // Get current Owner ID
    const oldOwnerID = tx.tuna.owner.getIdentifier();

    // Check that newOwner is not same as current owner
    if (newOwnerID === oldOwnerID) {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is already owned by ${oldOwnerID}`);
    }

    // Make sure that new owner exists
    const newOwner = await restaurantOwnerRegistry.get(newOwnerID);
    if (!newOwner) {
        throw new Error(`RestaurantOwner with id ${newOwnerID} does not exist`);
    }

    // Update tuna with new owner
    tx.tuna.owner = tx.newOwner;
    tx.tuna.status = 'PURCHASED';

    // Update the asset in the asset registry.
    await tunaRegistry.update(tx.tuna);
}
