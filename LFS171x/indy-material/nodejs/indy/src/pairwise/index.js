'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');

exports.get = async function(theirDid) {
    return await sdk.getPairwise(await indy.wallet.get(), theirDid);
};

exports.getAll = async function () {
    let relationships = await sdk.listPairwise(await indy.wallet.get());
    for (let relationship of relationships) {
        relationship.metadata = JSON.parse(relationship.metadata);
        if(!relationship.metadata.name) {
            relationship.metadata.name = `Endpoint DID: ${relationship.metadata.theirEndpointDid}`;
        }
    }
    return relationships;
};

exports.getMyDid = async function(theirDid) {
    let pairwise = await sdk.getPairwise(await indy.wallet.get(), theirDid);
    return pairwise.my_did;
};

exports.getAttr = async function(theirDid, attr) {
    let pairwise = await sdk.getPairwise(await indy.wallet.get(), theirDid);
    return JSON.parse(pairwise.metadata)[attr];
};

exports.addProof = async function(theirDid, proof, proofRequest) {
    let pairwise = await exports.get(theirDid);
    let metadata = JSON.parse(pairwise.metadata);
    if(!metadata.proofs) {
        metadata.proofs = [];
    }
    proof.request = proofRequest;
    metadata.proofs.push(proof);

    metadata = setAttr('name', metadata, proof, proofRequest);

    await sdk.setPairwiseMetadata(await indy.wallet.get(), theirDid, JSON.stringify(metadata));
};

exports.pushAttribute = async function(theirDid, attribute, value) {
    let pairwise = await exports.get(theirDid);
    let metadata = JSON.parse(pairwise.metadata);
    if(!metadata[attribute]) {
        metadata[attribute] = [];
    }
    metadata[attribute].push(value);
    await sdk.setPairwiseMetadata(await indy.wallet.get(), theirDid, JSON.stringify(metadata));
};

// This will overwrite the old attribute if one exists.
function setAttr(attr, metadata, proof, proofRequest) {
    for(let key of Object.keys(proofRequest.requested_attributes)) {
        if(proofRequest.requested_attributes[key].name === attr) {
            metadata[attr] = proof['requested_proof']['revealed_attrs'][key]['raw'];
        }
    }
    return metadata;
}