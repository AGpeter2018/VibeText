import { ErrorDecoder } from 'ethers-decode-error';
import { VIBETEXT_ABI } from '../Abi.js';

// Create a reusable decoder instance bound to the contract ABI
export const errorDecoder = ErrorDecoder.create([VIBETEXT_ABI]);

/**
 * Decodes an ethers.js contract error and returns a human-readable string.
 * Pass this the raw error caught in a try/catch block.
 */
export const decodeContractError = async (err) => {
    try {
        const decoded = await errorDecoder.decode(err);
        switch (decoded.name) {
            case 'AddressZero': return 'Address cannot be zero.';
            case 'AlreadyProcessed': return 'This reward has already been processed.';
            case 'InvalidAmount': return 'Invalid reward amount (must be > 0).';
            case 'NotAdmin': return 'Caller is not a whitelisted admin.';
            case 'NotOwner': return 'Caller is not the contract owner.';
            case 'NotPendingOwner': return 'Caller is not the pending owner.';
            case 'ReentrantCall': return 'Reentrant call detected.';
            case 'TransferFailed': return 'Native token transfer failed.';
            case 'TreasuryDepleted': return 'Treasury has insufficient balance.';
            default: return decoded.reason || decoded.name || 'Unknown contract error.';
        }
    } catch {
        // If decoding fails, fall back to the raw ethers message
        return err.reason || err.shortMessage || err.message || 'Unknown error.';
    }
};