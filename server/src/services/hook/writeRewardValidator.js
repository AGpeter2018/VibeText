import { ethers } from 'ethers';
import { getContract } from '../blockchain.js';
import { DEFAULT_REWARD_WEI } from '../Constant/Reward.js';
import { decodeContractError } from '../helper/errorHandler.js';

export async function rewardValidator(walletAddress, verificationId, rewardWei = DEFAULT_REWARD_WEI) {
    const contract = getContract();
    if (!contract) return null;

    if (!walletAddress || walletAddress === ethers.ZeroAddress) {
        console.warn('[Blockchain] Skipping reward — user has no linked wallet.');
        return null;
    }

    try {
        console.log(`[Blockchain] 🚀 Sending reward to ${walletAddress} | ID: ${verificationId}`);
        const tx = await contract.rewardValidator(walletAddress, rewardWei, verificationId);
        const receipt = await tx.wait();
        console.log(`[Blockchain] ✅ Reward confirmed! TxHash: ${receipt.hash}`);
        return receipt.hash;
    } catch (err) {
        const message = await decodeContractError(err);
        console.error(`[Blockchain] ❌ Failed to reward validator: ${message}`);
        return null;
    }
}
