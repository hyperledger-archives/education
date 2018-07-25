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

    // Make sure the tuna status is CAUGHT and not PURCHASED
    if (tx.tuna.status !== 'CAUGHT') {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is not in CAUGHT status`);
    }

    // Get participant registry for Individuals
    const restaurantOwnerRegistry = await getParticipantRegistry(NS + '.RestaurantOwner');

    // Get newOwner
    const newOwnerID = tx.newOwner.getIdentifier();
    const oldOwnerID = tx.tuna.owner.getIdentifier();

    // Make sure that new owner exists
    const newOwner = await restaurantOwnerRegistry.get(newOwnerID);

    // Check that newOwner is not same as current owner
    if (newOwnerID === oldOwnerID) {
        throw new Error(`Tuna with id ${tx.tuna.getIdentifier()} is already owned by ${oldOwnerID}`);
    }

    // Update tuna with new owner
    tx.tuna.owner = tx.newOwner;
    tx.tuna.status = 'PURCHASED';

    // Update the asset in the asset registry.
    await tunaRegistry.update(tx.tuna);
}
